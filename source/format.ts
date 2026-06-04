import type { Options } from "prettier";

import makeSynchronous from "./make-synchronous.ts";

export type FormatOptions = { [K in keyof Options as K extends "parser" | "plugins" ? never : K]: Options[K] };

export const format = makeSynchronous(formatAsync);

export async function formatAsync(code: string, language: string, options: FormatOptions = {}) {
  const parser = {
    xml: "html",
    html: "html",
    json: "json",
    jsonc: "jsonc",
    json5: "json5",
    markdown: "markdown",
    javascript: "espree",
    typescript: "typescript",
    css: "css",
    scss: "scss",
    less: "less",
    graphql: "graphql",
    mdx: "mdx",
    vue: "vue",
    angular: "angular",
    mjml: "mjml",
    yaml: "yaml",
  }[language];

  const { debuglog } = await import("node:util");
  const log = debuglog("syntax-highlight:format");

  if (!parser) {
    log("⚠️ No parser found for language: %s", language);

    return code;
  }

  log("ℹ️  Formatting code with parser: %s", parser);

  const prettierPluginXML = await import("@prettier/plugin-xml");
  const prettier = await import("prettier");

  const result = await prettier.format(code, {
    parser,
    plugins: [prettierPluginXML.default],
    printWidth: process.stdout.columns || 80,
    singleAttributePerLine: false,
    tabWidth: 2,
    useTabs: false,
    trailingComma: "all",
    bracketSameLine: true,
    bracketSpacing: true,
    objectWrap: "preserve",
    htmlWhitespaceSensitivity: "ignore",
    endOfLine: "lf",
    quoteProps: "consistent",
    xmlSortAttributesByKey: true,
    xmlWhitespaceSensitivity: "ignore",
    ...options,
  });

  return result;
}
