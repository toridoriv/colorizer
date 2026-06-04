#!/usr/bin/env -S bun
import fs from "node:fs";

import prettier from "prettier";
import ts from "typescript";

import prettierConfig from "../../prettier.config.js";

const entrypoints = ["source/index.ts"];

const output = await Bun.build({
  entrypoints,
  outdir: "dist",
  banner: "// @ts-ignore",
  target: "node",
  format: "esm",
  emitDCEAnnotations: true,
  minify: false,
  env: "disable",
});

if (!output.success) {
  output.logs.forEach((log) => console.info(log));
  process.exit(1);
}

const compilerOptions: ts.CompilerOptions = {
  removeComments: false,
  target: ts.ScriptTarget.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  declaration: true,
  emitDeclarationOnly: true,
  allowImportingTsExtensions: true,
  outFile: "dist/index.d.ts",
  skipLibCheck: true,
  module: ts.ModuleKind.NodeNext,
  noCheck: true,
};
const host = ts.createCompilerHost(compilerOptions);

host.writeFile = async (filename, text) => {
  const { plugins, ...rest } = prettierConfig;
  const contents = text
    .split("declare module")
    .map((section) => section.substring(section.indexOf("{") + 1, section.lastIndexOf("}")))
    .join("")
    .split("\n")
    .filter((line) => !line.includes("import"))
    .filter((line) => !(line.includes("export") && line.includes("from")));

  fs.writeFileSync(filename, await prettier.format(contents.join("\n"), { ...rest, parser: "typescript" }), "utf-8");
};

const program = ts.createProgram(entrypoints, compilerOptions, host);

const emitResult = program.emit();

const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

allDiagnostics.forEach((diagnostic) => {
  if (diagnostic.file) {
    const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  } else {
    console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
  }
});

if (emitResult.emitSkipped) {
  throw new Error("Declaration file generation failed.");
}
