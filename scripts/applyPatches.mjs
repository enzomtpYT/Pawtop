#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

async function applyArrpcPatch() {
    const filePath = './node_modules/arrpc-bun/src/process/index.ts';

    try {
        let content = await readFile(filePath, 'utf8');

        if (content.includes('// OBS STREAMERMODE patch')) {
            console.log('arrpc patch already applied');
            return;
        }

        content = content.replace(
            'const DetectableDB = JSON.parse(\n\tfs.readFileSync(DETECTABLE_DB_PATH, "utf8"),\n) as DetectableApp[];',
            `const DetectableDB = JSON.parse(
\tfs.readFileSync(DETECTABLE_DB_PATH, "utf8"),
) as DetectableApp[];

// OBS STREAMERMODE patch
DetectableDB.push({
\taliases: ["Obs"],
\texecutables: [
\t\t{ is_launcher: false, name: "obs", os: "linux" },
\t\t{ is_launcher: false, name: "obs.exe", os: "win32" },
\t\t{ is_launcher: false, name: "obs.app", os: "darwin" }
\t],
\thook: true,
\tid: "STREAMERMODE",
\tname: "OBS"
} as DetectableApp);`
        );

        await writeFile(filePath, content);
        console.log('Applied arrpc patch');
    } catch (err) {
        console.warn('Failed to apply arrpc patch:', err.message);
    }
}

await applyArrpcPatch();
