#!/usr/bin/env -S node
import { readdir, type TextFile } from "@toridoriv/fs-plus";

import packageJson from "../../package.json" with { type: "json" };

const files = readdir("./dist", { depth: 1 });

// NOTE: Add future fixes here.
files.map(appendNodePrefix);

function appendNodePrefix(file: TextFile) {
  const content = file.content;
  const externalDependencies = Object.keys(packageJson.dependencies);
  const nodeModules = Array.from(new Set([...content.matchAll(/from "(.+?)";/g)].map((m) => m[1]))).filter(
    (m) => !externalDependencies.includes(m) && !m.startsWith("node:"),
  );
  let newContent = content;

  for (const nodeModule of nodeModules) {
    if (nodeModule.endsWith(".ts") || nodeModule.endsWith(".mts")) {
      newContent = newContent.replaceAll(nodeModule, nodeModule.replace(/\.ts$/, ".js").replace(/\.mts$/, ".mjs"));
      continue;
    }

    newContent = newContent.replaceAll(`from "${nodeModule}";`, `from "node:${nodeModule}";`);
  }

  file.content = newContent;

  file.write();

  return file;
}
