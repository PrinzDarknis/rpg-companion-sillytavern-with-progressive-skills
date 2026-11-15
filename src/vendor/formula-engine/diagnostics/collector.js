import { FatalStop } from './fatal-stop.js';
import { defaultMessage } from './messages.js';
import { sortDiagnostics } from './order.js';
/** Collects the diagnostics of one evaluation: any number of recovered ones, at most one fatal. */
export class DiagnosticCollector {
    constructor() {
        this.items = [];
        this.fatal = false;
    }
    /** Records a recoverable problem; evaluation continues with `recovery`. */
    recover(code, recovery, details) {
        this.items.push(createDiagnostic(code, details, recovery));
    }
    /** Records a fatal problem and stops the evaluation (throws `FatalStop`). */
    fail(code, details = {}) {
        this.items.push(createDiagnostic(code, details));
        this.fatal = true;
        throw new FatalStop();
    }
    get hasFatal() {
        return this.fatal;
    }
    /** Collected diagnostics, ordered by position. */
    get diagnostics() {
        return Object.freeze(sortDiagnostics(this.items));
    }
}
function createDiagnostic(code, details, recovery) {
    const diagnostic = {
        code,
        severity: recovery === undefined ? 'fatal' : 'recovered',
        message: defaultMessage(code, details.token, details.limit),
    };
    if (details.token !== undefined)
        diagnostic.token = details.token;
    if (details.start !== undefined)
        diagnostic.start = details.start;
    if (details.end !== undefined)
        diagnostic.end = details.end;
    if (recovery !== undefined)
        diagnostic.recovery = recovery;
    if (details.limit !== undefined)
        diagnostic.limit = details.limit;
    return Object.freeze(diagnostic);
}
