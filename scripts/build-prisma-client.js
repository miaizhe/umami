import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

esbuild
  .build({
    entryPoints: [path.resolve(root, 'src/generated/prisma/index.js')], // Use the generated index.js
    bundle: true, // Bundle all files into one (optional)
    outfile: path.resolve(root, 'generated/prisma/client.js'), // Output file
    platform: 'node', // For Node.js compatibility
    target: 'es2020', // Target version of Node.js
    format: 'esm', // Use ESM format
    sourcemap: true, // Optional: generates source maps for debugging
    external: ['@prisma/client', '.prisma/client'], // Optional: Exclude external dependencies from bundling
  })
  .catch(() => process.exit(1));
