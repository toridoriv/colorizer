#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning
import { writeFileSync } from "node:fs";

import { languageAliasNames, languageNames } from "@shikijs/langs";
import { themeNames } from "@shikijs/themes";
import { format } from "prettier";

import prettierConfig from "../../prettier.config.js";

type Values = Array<string> | ReadonlyArray<string>;

const KEYWORDS = ["for"];

const TypeName = { themes: "Theme", langs: "Language" };

const languagesInfo = await (async () => {
  return {
    content: await getModuleContent("langs", languageNames.concat(languageAliasNames).toSorted(compare)),
    filename: "languages.ts",
  };
})();

const themesInfo = await (async () => {
  return { content: await getModuleContent("themes", themeNames.toSorted(compare)), filename: "themes.ts" };
})();

const dir = "./source";

writeFileSync(`${dir}/${languagesInfo.filename}`, languagesInfo.content, "utf-8");
writeFileSync(`${dir}/${themesInfo.filename}`, themesInfo.content, "utf-8");

// #region Helpers
function getModuleContent(kind: "themes" | "langs", values: Values) {
  const type = getType(TypeName[kind], values);
  const importsAndNames = values.map(createImportFactory(`@shikijs/${kind}`));
  const imports = importsAndNames.map(pick("importLine")).join("\n") + "\n";
  const exports = `export const ${TypeName[kind].toLowerCase()}s = [${importsAndNames.map(pick("name")).join(", ")}];\n`;

  return format([imports, type, exports].join("\n"), prettierConfig);
}

function getType(name: string, themes: string[] | readonly string[]) {
  return `export type ${name} = ${themes.map(doubleQuotes).join(" | ")}`;
}

function pick<T, K extends keyof T>(key: K) {
  return function getPicked(obj: T) {
    return obj[key];
  };
}

function createImportFactory(base: string) {
  return function getImport(theme: string) {
    const name = paramCaseToCamelCase(theme);
    const path = `${base}/${theme}`;

    return { importLine: `import ${name} from "${path}";`, name };
  };
}

function paramCaseToCamelCase(str: string) {
  let result = str
    .replace(/-([a-z])/g, (match, letter) => {
      return letter.toUpperCase();
    })
    .replace("-", "")
    .replace(/^[0-9]/g, (match) => `_${match}`);

  if (KEYWORDS.includes(result)) {
    result = `_${result}`;
  }

  return result;
}

function doubleQuotes(str: string) {
  return `"${str}"`;
}

function compare(a: string, b: string) {
  return a.localeCompare(b);
}
// #endregion Helpers
