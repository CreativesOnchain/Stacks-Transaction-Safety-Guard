#!/usr/bin/env node
import { createProgram } from './program.js';

createProgram()
  .parseAsync(process.argv)
  .catch((error: unknown) => {
    process.exitCode = 1;
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
  });
