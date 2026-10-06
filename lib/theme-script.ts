/**
 * Theme infrastructure shared between the server layout (which renders the
 * no-flash inline script) and the client ThemeProvider.
 *
 * Note: this replaces `next-themes`, whose provider renders an inline <script>
 * inside a client component — React 19.2 / Next 16 refuse to execute scripts
 * rendered client-side ("Encountered a script tag while rendering React
 * component"). Here the script is rendered once by the server layout instead.
 */

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "handly-theme";

/**
 * Runs before paint: applies the `light`/`dark` class to <html> from
 * localStorage (falling back to the system preference) and sets
 * `color-scheme` so form controls and scrollbars match.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.remove("light","dark");e.classList.add(d?"dark":"light");e.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
