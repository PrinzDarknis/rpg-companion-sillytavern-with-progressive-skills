/** Stable sort by `start`; diagnostics without position go last; ties keep discovery order. */
export function sortDiagnostics(diagnostics) {
    return [...diagnostics].sort((a, b) => position(a) - position(b));
}
function position(diagnostic) {
    return diagnostic.start ?? Number.MAX_SAFE_INTEGER;
}
