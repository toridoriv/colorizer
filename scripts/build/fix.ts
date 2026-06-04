#!/usr/bin/env -S bun
import fs from "node:fs";

const paths = ["dist/index.d.ts", "dist/index.js"];

paths.forEach(appendNodePrefix);

function appendNodePrefix(path: string) {
  const file = fs.readFileSync(path, "utf-8");
  const nodeModules = Array.from(new Set([...file.matchAll(/from "(.+?)";/g)].map((m) => m[1])));
  let newContent = file;

  for (const nodeModule of nodeModules) {
    if (nodeModule.startsWith("node:")) continue;

    newContent = newContent.replaceAll(`from "${nodeModule}";`, `from "node:${nodeModule}";`);
  }

  fs.writeFileSync(path, newContent, "utf-8");
}
