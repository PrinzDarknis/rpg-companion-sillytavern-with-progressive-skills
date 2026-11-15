import { tokenize } from '../syntax/index.js';
import { BUILTIN_FUNCTIONS } from './builtins.js';
/**
 * Tokenizes and evaluates `source` in a single pass (recursive descent that computes while parsing).
 * Recoverable problems are recorded and evaluation continues with the fallback; the first fatal problem
 * throws `FatalStop` via the collector. Recursion depth is bounded by `limits.maxDepth`.
 */
export function evaluateSource(source, variables, limits, diagnostics) {
    if (source.length > limits.maxLength) {
        diagnostics.fail('LIMIT_EXCEEDED', { limit: 'maxLength', start: 0, end: source.length });
    }
    const tokens = tokenize(source, diagnostics);
    if (tokens.length === 1)
        diagnostics.fail('EMPTY_EXPRESSION');
    return new Evaluator(source, tokens, variables, limits, diagnostics).run();
}
class Evaluator {
    constructor(source, tokens, variables, limits, diagnostics) {
        this.source = source;
        this.tokens = tokens;
        this.variables = variables;
        this.limits = limits;
        this.diagnostics = diagnostics;
        this.index = 0;
        this.depth = 0;
    }
    run() {
        const value = this.additive();
        const token = this.peek();
        if (token.kind === 'rightParen')
            this.failAt('UNBALANCED_PARENTHESES', token);
        if (token.kind !== 'end')
            this.failAt('UNEXPECTED_TOKEN', token);
        return value;
    }
    /** additive := multiplicative (('+' | '-') multiplicative)* */
    additive() {
        const start = this.peek().start;
        let value = this.multiplicative();
        for (;;) {
            const token = this.peek();
            if (token.kind !== 'operator' || (token.operator !== '+' && token.operator !== '-'))
                return value;
            this.index++;
            const right = this.multiplicative();
            value = this.finite(token.operator === '+' ? value + right : value - right, start);
        }
    }
    /** multiplicative := unary (('*' | '/' | '%') unary)* */
    multiplicative() {
        const start = this.peek().start;
        let value = this.unary();
        for (;;) {
            const token = this.peek();
            if (token.kind !== 'operator' || token.operator === '+' || token.operator === '-')
                return value;
            this.index++;
            const right = this.unary();
            if (token.operator !== '*' && right === 0)
                this.failAt('DIVISION_BY_ZERO', token);
            const result = token.operator === '*' ? value * right : token.operator === '/' ? value / right : value % right;
            value = this.finite(result, start);
        }
    }
    /** unary := ('+' | '-') unary | primary */
    unary() {
        const token = this.peek();
        if (token.kind !== 'operator' || (token.operator !== '+' && token.operator !== '-'))
            return this.primary();
        this.index++;
        this.enter(token);
        const value = this.unary();
        this.leave();
        return token.operator === '-' ? -value : value;
    }
    /** primary := number | name | name '(' arguments ')' | '(' additive ')' */
    primary() {
        const token = this.peek();
        switch (token.kind) {
            case 'number':
                this.index++;
                return token.value;
            case 'identifier':
                this.index++;
                if (this.peek().kind === 'leftParen')
                    return this.call(token);
                return this.variable(token, 'zero') ?? 0;
            case 'leftParen':
                return this.group(token);
            default:
                this.missing(token, 'zero');
                return 0;
        }
    }
    group(open) {
        this.index++;
        this.enter(open);
        let value = 0;
        const next = this.peek();
        if (next.kind === 'rightParen') {
            this.diagnostics.recover('MISSING_OPERAND', 'zero', { token: '()', start: open.start, end: next.end });
        }
        else {
            value = this.additive();
            this.expectClosing(open);
        }
        this.index++; // ')'
        this.leave();
        return value;
    }
    call(name) {
        const fn = BUILTIN_FUNCTIONS.get(name.text);
        if (fn === undefined)
            this.failAt('UNKNOWN_FUNCTION', name);
        const open = this.peek();
        this.index++;
        this.enter(name);
        const args = [];
        if (this.peek().kind === 'rightParen') {
            this.index++;
        }
        else {
            for (;;) {
                args.push(this.argument(fn));
                if (this.peek().kind !== 'comma')
                    break;
                this.index++;
            }
            this.expectClosing(open);
            this.index++; // ')'
        }
        this.leave();
        return this.finite(this.apply(fn, name, args), name.start);
    }
    argument(fn) {
        const token = this.peek();
        if (token.kind === 'comma' || token.kind === 'rightParen' || token.kind === 'end') {
            this.missing(token, fn.skipsInvalidArguments ? 'skipped' : 'zero');
            return { value: fn.skipsInvalidArguments ? undefined : 0, start: token.start, end: token.start };
        }
        const next = this.tokens[this.index + 1];
        const bareName = token.kind === 'identifier' && (next?.kind === 'comma' || next?.kind === 'rightParen');
        if (fn.skipsInvalidArguments && bareName) {
            this.index++;
            return { value: this.variable(token, 'skipped'), start: token.start, end: token.end };
        }
        const value = this.additive();
        return { value, start: token.start, end: this.previousEnd() };
    }
    apply(fn, name, args) {
        const call = { token: name.text, start: name.start, end: this.previousEnd() };
        const first = args[fn.maxArgs];
        const last = args[args.length - 1];
        if (first !== undefined && last !== undefined) {
            this.diagnostics.recover('ARGUMENT_COUNT', 'ignored', {
                token: this.source.slice(first.start, last.end),
                start: first.start,
                end: last.end,
            });
        }
        const used = args.slice(0, fn.maxArgs);
        if (fn.skipsInvalidArguments) {
            const values = used.map(arg => arg.value).filter((value) => value !== undefined);
            if (values.length > 0)
                return fn.apply(values);
            this.diagnostics.recover('EMPTY_ARGUMENTS', 'zero', call);
            return 0;
        }
        const values = used.map(arg => arg.value ?? 0);
        if (values.length < fn.minArgs) {
            this.diagnostics.recover('ARGUMENT_COUNT', 'zero', call);
            while (values.length < fn.minArgs)
                values.push(0);
        }
        return fn.apply(values);
    }
    /** Value of a variable, or `undefined` (reported) when it is unknown or not a finite number. */
    variable(token, recovery) {
        const name = token.text;
        const value = Object.prototype.hasOwnProperty.call(this.variables, name) ? this.variables[name] : undefined;
        const details = { token: name, start: token.start, end: token.end };
        if (value === undefined) {
            this.diagnostics.recover('UNKNOWN_VARIABLE', recovery, details);
            return undefined;
        }
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            this.diagnostics.recover('INVALID_VARIABLE_VALUE', recovery, details);
            return undefined;
        }
        return value;
    }
    /** Missing operand before `token`; at the end of input it is anchored at the previous token. */
    missing(token, recovery) {
        const anchor = token.kind === 'end' ? (this.tokens[this.index - 1] ?? token) : token;
        this.diagnostics.recover('MISSING_OPERAND', recovery, { token: anchor.text, start: anchor.start, end: anchor.end });
    }
    expectClosing(open) {
        const token = this.peek();
        if (token.kind === 'rightParen')
            return;
        if (token.kind === 'end')
            this.failAt('UNBALANCED_PARENTHESES', open);
        this.failAt('UNEXPECTED_TOKEN', token);
    }
    finite(value, start) {
        if (!Number.isFinite(value))
            this.diagnostics.fail('NON_FINITE_RESULT', { start, end: this.previousEnd() });
        return value;
    }
    enter(token) {
        this.depth++;
        if (this.depth > this.limits.maxDepth) {
            this.diagnostics.fail('LIMIT_EXCEEDED', { limit: 'maxDepth', token: token.text, start: token.start, end: token.end });
        }
    }
    leave() {
        this.depth--;
    }
    failAt(code, token) {
        return this.diagnostics.fail(code, { token: token.text, start: token.start, end: token.end });
    }
    peek() {
        // The token list ends with an `end` token that is never consumed.
        return this.tokens[this.index];
    }
    previousEnd() {
        return this.tokens[this.index - 1]?.end ?? 0;
    }
}
