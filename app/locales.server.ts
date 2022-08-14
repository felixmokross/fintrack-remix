import { availableLocales } from "cldr-core/availableLocales.json";
import { defaultContent } from "cldr-core/defaultContent.json";
import languages from "cldr-localenames-modern/main/en/languages.json";
import territories from "cldr-localenames-modern/main/en/territories.json";
import { difference } from "./utils.server";

export function getLocales() {
  const baseLocales = defaultContent.map((l) =>
    l.split("-").slice(0, -1).join("-")
  );
  return difference(availableLocales.modern, baseLocales)
    .concat(defaultContent)
    .map((locale) => {
      const [language, territory] = locale.split("-");
      const languageName =
        languages.main.en.localeDisplayNames.languages[
          language as keyof typeof languages.main.en.localeDisplayNames.languages
        ];

      const territoryName = territory
        ? territories.main.en.localeDisplayNames.territories[
            territory as keyof typeof territories.main.en.localeDisplayNames.territories
          ]
        : undefined;
      return [
        locale,
        `${languageName}${territoryName ? ` (${territoryName})` : ""}`,
      ] as [string, string];
    })
    .sort((a, b) => a[0].localeCompare(b[0]))
    .sort((a, b) => a[1].localeCompare(b[1]));
}
