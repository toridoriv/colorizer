import { codeToANSI } from "./code-to-ansi.ts";
import { type Language } from "./languages.ts";
export { type Language } from "./languages.ts";
import { type Theme } from "./themes.ts";
export { type Theme } from "./themes.ts";
import prettierPluginXML from "@prettier/plugin-xml";
import prettier from "prettier";

const parserByLanguage = {
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
};

type ColorizeFn = (code: string, theme?: Theme) => Promise<string>;

export type Colorize = { [K in Language]: ColorizeFn };

function createCodeColorizer(language: Language) {
  return {
    async [language](code: string, theme: Theme = "dracula") {
      if (language in parserByLanguage) {
        const parser = parserByLanguage[language as keyof typeof parserByLanguage];

        try {
          code = await prettier.format(code, {
            parser,
            plugins: [prettierPluginXML],
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
          });
        } catch {
          console.debug("Prettier failed to format code");
        }
      }

      return codeToANSI(code.trim(), language, theme);
    },
  }[language];
}

export const colorize: Colorize = (() => {
  const colorizer = {} as Colorize;
  const handler: ProxyHandler<Colorize> = {
    get(target, prop, receiver) {
      const language = prop as Language;
      let codeColorizer = target[language];

      if (!codeColorizer) {
        codeColorizer = createCodeColorizer(language);
      }

      if (target !== receiver) {
        target[language] = codeColorizer;
      }

      return codeColorizer;
    },
  };

  return new Proxy(colorizer, handler);
})();

export function isJson(value: string) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export function getLanguage(value: string) {
  const trimmed = value.trim();
  const firstSymbol = trimmed[0];
  const lastSymbol = trimmed[trimmed.length - 1];

  if (isJson(trimmed)) {
    return "json";
  }

  if (trimmed.startsWith("<!DOCTYPE html>")) {
    return "html";
  }

  if (firstSymbol === "<" && lastSymbol === ">") {
    return "xml";
  }

  return "markdown";
}
