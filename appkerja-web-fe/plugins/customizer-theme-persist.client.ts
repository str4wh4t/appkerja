import { watch } from "vue";
import { useCustomizerStore } from "@/stores/customizer";

const STORAGE_KEY = "appkerja:theme";
const THEME_MODE_KEY = "appkerja:themeMode";

export default defineNuxtPlugin(() => {
  const customizer = useCustomizerStore();

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme) {
    customizer.actTheme = savedTheme;
  }

  const savedMode = localStorage.getItem(THEME_MODE_KEY);
  if (savedMode === "light" || savedMode === "dark" || savedMode === "system") {
    customizer.themeMode = savedMode;
  } else {
    customizer.themeMode =
      customizer.actTheme === "DARK_BLUE_THEME" ? "dark" : "light";
  }
  customizer.applyResolvedTheme();

  watch(
    () => customizer.actTheme,
    (theme) => {
      if (theme) {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    },
    { immediate: true },
  );

  watch(
    () => customizer.themeMode,
    (mode) => {
      if (mode) {
        localStorage.setItem(THEME_MODE_KEY, mode);
      }
    },
    { immediate: true },
  );

  let detachMql: (() => void) | null = null;
  watch(
    () => customizer.themeMode,
    (mode) => {
      detachMql?.();
      detachMql = null;
      if (mode !== "system" || typeof window === "undefined") {
        return;
      }
      customizer.applyResolvedTheme();
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        if (customizer.themeMode === "system") {
          customizer.applyResolvedTheme();
        }
      };
      mql.addEventListener("change", onChange);
      detachMql = () => mql.removeEventListener("change", onChange);
    },
    { immediate: true },
  );
});
