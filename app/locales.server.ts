import { readdir } from "fs/promises";
import languages from "cldr-localenames-modern/main/en/languages.json";
import territories from "cldr-localenames-modern/main/en/territories.json";

export async function getLocales() {
  const locales = await await readdir(
    "node_modules/cldr-localenames-modern/main"
  ); // TODO base locales should be in this list with their territory name (en-US instead of en, de-DE instead of de)
  return locales
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
