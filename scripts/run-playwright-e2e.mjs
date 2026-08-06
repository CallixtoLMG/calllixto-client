import { spawn } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env.e2e", override: true, quiet: true });

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

const cleanEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key, value]) => key && !key.startsWith("=") && value !== undefined),
);

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    env: cleanEnv,
    shell: true,
    stdio: "inherit",
  });

  child.on("error", reject);
  child.on("exit", (code, signal) => {
    if (code === 0) {
      resolve();
      return;
    }

    reject(new Error(`${command} ${args.join(" ")} failed with ${signal || `exit code ${code}`}`));
  });
});

await run(npmCommand, ["run", "build:e2e"]);
await run(npxCommand, ["playwright", "test", ...process.argv.slice(2)]);
