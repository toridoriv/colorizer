#!/usr/bin/env -S bun
import fs from "node:fs";

import packageJson from "../../package.json" with { type: "json" };

const paths = fs.globSync("./dist/*");

paths.forEach(appendNodePrefix);

function appendNodePrefix(path: string) {
  const file = fs.readFileSync(path, "utf-8");
  const externalDependencies = Object.keys(packageJson.dependencies);
  const nodeModules = Array.from(new Set([...file.matchAll(/from "(.+?)";/g)].map((m) => m[1]))).filter(
    (m) => !externalDependencies.includes(m) && !m.startsWith("node:"),
  );
  let newContent = file;

  for (const nodeModule of nodeModules) {
    if (nodeModule.endsWith(".ts") || nodeModule.endsWith(".mts")) {
      newContent = newContent.replaceAll(nodeModule, nodeModule.replace(/\.ts$/, ".js").replace(/\.mts$/, ".mjs"));
      continue;
    }

    newContent = newContent.replaceAll(`from "${nodeModule}";`, `from "node:${nodeModule}";`);
  }

  fs.writeFileSync(path, newContent, "utf-8");
}
