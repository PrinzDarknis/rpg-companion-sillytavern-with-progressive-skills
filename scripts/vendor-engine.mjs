#!/usr/bin/env node
/**
 * Copies the built formula engine into the extension (src/vendor/formula-engine/).
 *
 * SillyTavern serves the extension as plain files without a build step, and users install it via git,
 * so the engine is shipped as a committed copy. Run this after changing the engine:
 *
 *     (cd ../formula-engine && npm run build) && npm run vendor:engine
 *
 * Then commit the src/vendor diff. Only the JavaScript files and the license are copied; the type
 * declarations are not needed at runtime. Override the engine location with FORMULA_ENGINE_DIR.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENGINE_DIR = path.resolve(process.env.FORMULA_ENGINE_DIR || path.join(ROOT, '..', 'formula-engine'));
const SOURCE = path.join(ENGINE_DIR, 'dist');
const TARGET = path.join(ROOT, 'src', 'vendor', 'formula-engine');

if (!fs.existsSync(path.join(SOURCE, 'index.js'))) {
    console.error(`Formula engine build not found at ${SOURCE}. Run "npm run build" in ${ENGINE_DIR} first.`);
    process.exit(1);
}

const { version } = JSON.parse(fs.readFileSync(path.join(ENGINE_DIR, 'package.json'), 'utf8'));

function copyJavaScript(from, to) {
    let count = 0;
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
        const source = path.join(from, entry.name);
        const target = path.join(to, entry.name);
        if (entry.isDirectory()) {
            count += copyJavaScript(source, target);
        } else if (entry.name.endsWith('.js')) {
            fs.mkdirSync(to, { recursive: true });
            fs.copyFileSync(source, target);
            count++;
        }
    }
    return count;
}

fs.rmSync(TARGET, { recursive: true, force: true });
const count = copyJavaScript(SOURCE, TARGET);
fs.copyFileSync(path.join(ENGINE_DIR, 'LICENSE'), path.join(TARGET, 'LICENSE'));
fs.writeFileSync(path.join(TARGET, 'VERSION'), `${version}\n`);

console.log(`Vendored formula-engine ${version}: ${count} files → ${path.relative(ROOT, TARGET)}`);
