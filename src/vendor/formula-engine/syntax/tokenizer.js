const WHITESPACE = new Set([' ', '\t', '\n', '\r']);
const ARITHMETIC = new Set(['+', '-', '*', '/', '%']);
/** Operator characters of other languages; a run of them is reported as one `UNKNOWN_OPERATOR`. */
const UNKNOWN_OPERATOR_CHARS = new Set(['^', '&', '|', '!', '=', '<', '>', '~', '?']);
const VALID_NUMBER = /^(?:\d+(?:\.\d+)?|\.\d+)$/;
const isDigit = (ch) => ch >= '0' && ch <= '9';
const isIdentifierStart = (ch) => (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
const isIdentifierPart = (ch) => isIdentifierStart(ch) || isDigit(ch);
/**
 * Splits the source into tokens (classification character by character; whitespace is optional).
 * The first unsupported character, unknown operator or malformed number is fatal and stops.
 * The result always ends with an `end` token.
 */
export function tokenize(source, diagnostics) {
    const tokens = [];
    let i = 0;
    while (i < source.length) {
        const ch = source.charAt(i);
        if (WHITESPACE.has(ch)) {
            i++;
        }
        else if (isDigit(ch) || ch === '.') {
            let end = i;
            while (end < source.length && (isDigit(source.charAt(end)) || source.charAt(end) === '.'))
                end++;
            const text = source.slice(i, end);
            const value = VALID_NUMBER.test(text) ? Number(text) : NaN;
            if (!Number.isFinite(value))
                diagnostics.fail('INVALID_NUMBER', { token: text, start: i, end });
            tokens.push({ kind: 'number', value, text, start: i, end });
            i = end;
        }
        else if (isIdentifierStart(ch)) {
            let end = i + 1;
            while (end < source.length && isIdentifierPart(source.charAt(end)))
                end++;
            tokens.push({ kind: 'identifier', text: source.slice(i, end), start: i, end });
            i = end;
        }
        else if (ch === '*' && source.charAt(i + 1) === '*') {
            diagnostics.fail('UNKNOWN_OPERATOR', { token: '**', start: i, end: i + 2 });
        }
        else if (ARITHMETIC.has(ch)) {
            tokens.push({ kind: 'operator', operator: ch, text: ch, start: i, end: i + 1 });
            i++;
        }
        else if (ch === '(' || ch === ')' || ch === ',') {
            const kind = ch === '(' ? 'leftParen' : ch === ')' ? 'rightParen' : 'comma';
            tokens.push({ kind, text: ch, start: i, end: i + 1 });
            i++;
        }
        else if (UNKNOWN_OPERATOR_CHARS.has(ch)) {
            let end = i + 1;
            while (end < source.length && UNKNOWN_OPERATOR_CHARS.has(source.charAt(end)))
                end++;
            diagnostics.fail('UNKNOWN_OPERATOR', { token: source.slice(i, end), start: i, end });
        }
        else {
            const length = (source.codePointAt(i) ?? 0) > 0xffff ? 2 : 1;
            diagnostics.fail('UNEXPECTED_CHARACTER', { token: source.slice(i, i + length), start: i, end: i + length });
        }
    }
    tokens.push({ kind: 'end', text: '', start: source.length, end: source.length });
    return tokens;
}
