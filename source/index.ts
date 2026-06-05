import { debuglog } from "node:util";

import { codeToANSI } from "./code-to-ansi.ts";
import { format } from "./format.ts";
import { type Language } from "./languages.ts";
export { type Language } from "./languages.ts";
import { type Theme } from "./themes.ts";
export { type Theme } from "./themes.ts";

export type ColorizeFn = (code: string, theme?: Theme) => string;

export type Colorize = { [K in Language]: ColorizeFn };

const log = debuglog("syntax-highlight:colorize");

function createCodeColorizer(language: Language) {
  return {
    [language](code: string, theme: Theme = "dracula") {
      try {
        code = format(code, language);
      } catch (error) {
        log("Prettier failed to format code", error);
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
