#!/usr/bin/env -S bun
import fs from "node:fs";

import prettier from "prettier";
import ts from "typescript";

import packageJson from "../../package.json" with { type: "json" };
import prettierConfig from "../../prettier.config.js";

const sharedExternal = Object.keys(packageJson.dependencies);

const entrypoints: BuildOptions[] = [{ entryPoint: "source/make-synchronous.ts", external: [...sharedExternal] }];

entrypoints.push({
  entryPoint: "source/index.ts",
  external: [...sharedExternal, ...entrypoints.map((e) => `./${e.entryPoint}`)],
});

for (const entryPoint of entrypoints) {
  await build(entryPoint);
}

type BuildOptions = { entryPoint: string; external?: string[] };

async function build({ entryPoint, external = [] }: BuildOptions) {
  console.log(`Building ${entryPoint}...`);
  const output = await Bun.build({
    entrypoints: [entryPoint],
    outdir: "dist",
    banner: "// @ts-ignore",
    target: "node",
    format: "esm",
    emitDCEAnnotations: true,
    minify: false,
    env: "disable",
    external,
  });

  if (!output.success) {
    output.logs.forEach((log) => console.info(log));
    process.exit(1);
  }

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
    const { plugins, ...rest } = prettierConfig;
    const contents = text
      .split("declare module")
      .map((section) => section.substring(section.indexOf("{") + 1, section.lastIndexOf("}")))
      .join("")
      .split("\n")
      .filter((line) => !line.includes("import"))
      .filter((line) => !(line.includes("export") && line.includes("from")));

    fs.writeFileSync(outFile, await prettier.format(contents.join("\n"), { ...rest, parser: "typescript" }), "utf-8");
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
