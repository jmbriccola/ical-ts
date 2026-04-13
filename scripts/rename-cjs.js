import { readdir, rename, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const cjsDir = 'dist/cjs';

async function renameFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await renameFiles(fullPath);
    } else if (entry.name.endsWith('.js')) {
      await rename(fullPath, fullPath.replace(/\.js$/, '.cjs'));
    } else if (entry.name.endsWith('.d.ts')) {
      await rename(fullPath, fullPath.replace(/\.d\.ts$/, '.d.cts'));
    } else if (entry.name.endsWith('.js.map')) {
      await rename(fullPath, fullPath.replace(/\.js\.map$/, '.cjs.map'));
    } else if (entry.name.endsWith('.d.ts.map')) {
      await rename(fullPath, fullPath.replace(/\.d\.ts\.map$/, '.d.cts.map'));
    }
  }
}

await renameFiles(cjsDir);
