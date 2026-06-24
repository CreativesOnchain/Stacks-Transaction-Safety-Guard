import type { ScanResult } from '../report/report-model.js';

/**
 * Model A exit semantics: any effective-`error` finding fails the run (exit 1),
 * otherwise it succeeds (exit 0). `--strict` has already escalated warnings to
 * errors during severity resolution, so the error count is the only input here.
 */
export function exitCodeFor(result: ScanResult): number {
  return result.summary.errors > 0 ? 1 : 0;
}
