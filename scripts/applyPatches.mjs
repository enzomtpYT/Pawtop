#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

async function applyArrpcPatch() {
    const filePath = './node_modules/arrpc/src/process/index.js';

    try {
        let content = await readFile(filePath, 'utf8');

        if (content.includes('import DetectableDB from')) {
            console.log('arrpc patch already applied');
            return;
        }

        content = content.replace(
            /import fs from 'node:fs';\nimport { dirname, join } from 'path';\nimport { fileURLToPath } from 'url';\n\nconst __dirname = dirname\(fileURLToPath\(import\.meta\.url\)\);\nconst DetectableDB = JSON\.parse\(fs\.readFileSync\(join\(__dirname, 'detectable\.json'\), 'utf8'\)\);/,
            `import DetectableDB from './detectable.json' with { type: 'json' };
DetectableDB.push({
  aliases: ["Obs"],
  executables: [
    { is_launcher: false, name: "obs", os: "linux" },
    { is_launcher: false, name: "obs.exe", os: "win32" },
    { is_launcher: false, name: "obs.app", os: "darwin" }
  ],
  hook: true,
  id: "STREAMERMODE",
  name: "OBS"
});`
        );

        await writeFile(filePath, content);
        console.log('Applied arrpc patch');
    } catch (err) {
        console.warn('Failed to apply arrpc patch:', err.message);
    }
}

await applyArrpcPatch();
