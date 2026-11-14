import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

// Match Next's precedence closely enough to catch demo flags before building.
loadEnvFile(".env");
loadEnvFile(".env.local");
loadEnvFile(".env.production");
loadEnvFile(".env.production.local");

const demoVars = [
  ["NEXT_PUBLIC_AUTH_MODE", "demo"],
  ["NEXT_PUBLIC_DATA_MODE", "fixtures"],
  ["NEXT_PUBLIC_BILLING_MODE", "demo"],
];

const enabled = demoVars.filter(([key, value]) => process.env[key] === value);

if (enabled.length > 0) {
  console.error(
    [
      "Refusing to build a production bundle with demo mode enabled:",
      ...enabled.map(([key, value]) => `  - ${key}=${value}`),
      "",
      "Unset those variables (or set real values) before running `npm run build`.",
      "Demo mode exists for `npm run dev` and `npm run dev:demo` only.",
    ].join("\n"),
  );
  process.exit(1);
}
