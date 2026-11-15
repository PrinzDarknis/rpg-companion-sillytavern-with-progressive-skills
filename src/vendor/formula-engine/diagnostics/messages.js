const BASE_MESSAGES = Object.freeze({
    UNKNOWN_VARIABLE: 'Unknown variable',
    INVALID_VARIABLE_VALUE: 'Variable value is not a finite number',
    MISSING_OPERAND: 'Missing operand',
    ARGUMENT_COUNT: 'Wrong number of function arguments',
    EMPTY_ARGUMENTS: 'Function needs at least one valid argument',
    UNKNOWN_FUNCTION: 'Unknown function',
    UNKNOWN_OPERATOR: 'Unsupported operator',
    UNEXPECTED_CHARACTER: 'Unexpected character',
    UNEXPECTED_TOKEN: 'Unexpected token',
    UNBALANCED_PARENTHESES: 'Unbalanced parentheses',
    INVALID_NUMBER: 'Invalid number',
    EMPTY_EXPRESSION: 'Empty expression',
    DIVISION_BY_ZERO: 'Division by zero',
    NON_FINITE_RESULT: 'Result is not a finite number',
    LIMIT_EXCEEDED: 'Limit exceeded',
});
/** English default message, e.g. `Unknown variable: "foo"` or `Limit exceeded (maxDepth)`. */
export function defaultMessage(code, token, limit) {
    let message = BASE_MESSAGES[code];
    if (limit !== undefined)
        message += ` (${limit})`;
    if (token !== undefined && token !== '')
        message += `: "${token}"`;
    return message;
}
