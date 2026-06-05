#!/usr/bin/env -S node
import fs from "node:fs";

import prettier from "prettier";
import * as tsup from "tsup";
import ts from "typescript";

import packageJson from "../../package.json" with { type: "json" };

const sharedExternal = Object.keys(packageJson.dependencies);

const entrypoints: BuildOptions[] = [{ entryPoint: "source/make-synchronous.ts", external: [...sharedExternal] }];

entrypoints.push({
  entryPoint: "source/index.ts",
  external: [...sharedExternal, ...entrypoints.map((e) => e.entryPoint.replace("source/", "./"))],
});

for (const entryPoint of entrypoints) {
  await build(entryPoint);
}

type BuildOptions = { entryPoint: string; external?: string[] };

async function build({ entryPoint, external = [] }: BuildOptions) {
  console.log(`Building ${entryPoint}...`);
  await tsup.build({
    entry: [entryPoint],
    outDir: "dist",
    banner: { js: "// @ts-nocheck" },
    target: "node24",
    format: "esm",
    minify: false,
    external,
    bundle: true,
    platform: "node",
    removeNodeProtocol: false,
    sourcemap: false,
  });

  const outFile = `dist/${entryPoint
    .replace("source/", "")
    .replace(/\.ts$/, ".d.ts")
    .replace(/\.mts$/, ".d.mts")}`;

  const compilerOptions: ts.CompilerOptions = {
    removeComments: false,
    target: ts.ScriptTarget.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    declaration: true,
    emitDeclarationOnly: true,
    allowImportingTsExtensions: true,
    outFile,
    skipLibCheck: true,
    module: ts.ModuleKind.NodeNext,
    noCheck: true,
  };
  const host = ts.createCompilerHost(compilerOptions);

  host.writeFile = async (filename, text) => {
    const prettierConfig = await prettier.resolveConfig(outFile, { useCache: true, editorconfig: true });
    const contents = text
      .split("declare module")
      .map((section) => section.substring(section.indexOf("{") + 1, section.lastIndexOf("}")))
      .join("")
      .split("\n")
      .filter((line) => !line.includes("import"))
      .filter((line) => !(line.includes("export") && line.includes("from")));

    contents.unshift("// @ts-nocheck");
    fs.writeFileSync(outFile, await prettier.format(contents.join("\n"), prettierConfig!), "utf-8");
  };

  const program = ts.createProgram([entryPoint], compilerOptions, host);

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
}
