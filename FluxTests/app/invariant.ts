module FluxTests {
    export function invariant(condition: boolean, format: string, a?: any, b?: any, c?: any, d?: any, e?: any, f?: any): void {
        if (!condition) {
            var error: Error;
            if (format === undefined) {
                error = new Error(
                    'Minified exception occurred; use the non-minified dev environment ' +
                    'for the full error message and additional helpful warnings.'
                    );
            } else {
                var args = [a, b, c, d, e, f];
                var argIndex = 0;
                error = new Error(
                    'Invariant Violation: ' +
                    format.replace(/%s/g, () => args[argIndex++])
                    );
            }

            (<any>error).framesToPop = 1; // we don't care about invariant's own frame
            throw error;
        }
    }
}