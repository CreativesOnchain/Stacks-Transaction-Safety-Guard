#!/usr/bin/env node
import { relative } from 'node:path';
import { createProgram } from './parse-args.js';
import { runScan } from './scan-command.js';

createProgram((command) => {
  const outcome = runScan(command);
  for (const notice of outcome.notices) {
    const where = `${relative(process.cwd(), notice.location.file)}:${notice.location.line}`;
    process.stderr.write(`notice: ${where} ${notice.message}\n`);
  }
  process.stdout.write(`${outcome.report}\n`);
  process.exitCode = outcome.exitCode;
})
  .parseAsync(process.argv)
  .catch((error: unknown) => {
    process.exitCode = 1;
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
  });
