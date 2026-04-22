/**
 * Extracts human-readable error messages from a failed inkjs Compiler call.
 *
 * inkjs exposes errors via different internal properties depending on version/
 * error type. This function probes the known shapes in priority order and
 * falls back to a generic message when nothing is found.
 *
 * @param compilerObj - The Compiler instance cast to `unknown` (checked before calling)
 * @param compileError - The error thrown by `compiler.Compile()`
 * @returns A non-empty array of error message strings
 */
export function extractCompilerErrors(
  compilerObj: unknown,
  compileError: unknown
): string[] {
  const errorMessages: string[] = [];

  if (compilerObj && typeof compilerObj === 'object' && 'errors' in compilerObj) {
    const errs = (compilerObj as { errors?: unknown[] }).errors;
    if (errs && errs.length > 0) {
      for (const err of errs) {
        if (typeof err === 'string') {
          errorMessages.push(err);
        } else if (err && typeof err === 'object' && 'message' in err) {
          errorMessages.push(String((err as { message: unknown }).message));
        } else if (err && typeof err === 'object' && 'toString' in err) {
          try {
            errorMessages.push((err as { toString(): string }).toString());
          } catch {
            errorMessages.push('Unknown error occurred');
          }
        }
      }
    }
  } else if (compilerObj && typeof compilerObj === 'object' && '_errors' in compilerObj) {
    const errs = (compilerObj as { _errors?: unknown[] })._errors;
    if (errs && errs.length > 0) {
      for (const err of errs) {
        if (typeof err === 'string') {
          errorMessages.push(err);
        } else if (err && typeof err === 'object' && 'message' in err) {
          errorMessages.push(String((err as { message: unknown }).message));
        }
      }
    }
  } else if (compileError instanceof Error) {
    errorMessages.push(compileError.message);
  }

  if (errorMessages.length === 0) {
    errorMessages.push('Compilation failed. Check your Ink syntax.');
  }

  return errorMessages;
}
