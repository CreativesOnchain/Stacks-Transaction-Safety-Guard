import fg from 'fast-glob';

export interface DiscoverFilesOptions {
  /** Directory the include/exclude globs are evaluated against. */
  root: string;
  include: string[];
  exclude: string[];
}

/**
 * Resolves the set of files to scan by applying the include globs within
 * `root` and removing anything matched by the exclude globs. Returns absolute
 * paths, de-duplicated and sorted for deterministic ordering.
 */
export function discoverFiles(options: DiscoverFilesOptions): string[] {
  const matches = fg.sync(options.include, {
    cwd: options.root,
    ignore: options.exclude,
    absolute: true,
    onlyFiles: true,
    dot: false,
    unique: true,
    followSymbolicLinks: false,
  });
  return matches.sort();
}
