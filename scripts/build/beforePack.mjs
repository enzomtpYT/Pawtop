import { spawn } from "child_process";
import { promisify } from "util";

import { applyAppImageSandboxFix } from "./sandboxFix.mjs";

const exec = promisify(spawn);

async function downloadBun() {
    console.log("Downloading Bun binaries...");
    const proc = spawn("bun", ["run", "scripts/build/downloadBun.mts"], {
        stdio: "inherit"
    });
    return new Promise((resolve, reject) => {
        proc.on("exit", code => (code === 0 ? resolve() : reject(new Error(`downloadBun exited with code ${code}`))));
        proc.on("error", reject);
    });
}

export default async function beforePack() {
    await downloadBun();
    await applyAppImageSandboxFix();
}
