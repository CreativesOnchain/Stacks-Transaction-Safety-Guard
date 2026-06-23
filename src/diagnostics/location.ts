/**
 * A resolved position in a scanned source file. Line and column are 1-based so
 * they match what editors and terminals display.
 */
export interface Location {
  /** Absolute path of the file the position refers to. */
  file: string;
  line: number;
  column: number;
}
