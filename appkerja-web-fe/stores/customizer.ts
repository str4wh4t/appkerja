import { defineStore } from "pinia";
import config from '@/config'

export type ThemeMode = 'light' | 'dark' | 'system';

export const useCustomizerStore = defineStore('customizer',{
  state: () => ({
    Sidebar_drawer: config.Sidebar_drawer,
    Customizer_drawer: config.Customizer_drawer,
    mini_sidebar: config.mini_sidebar,
    setHorizontalLayout: config.setHorizontalLayout, // Horizontal layout
    setRTLLayout:config.setRTLLayout, // RTL layout
    actTheme: config.actTheme,
    themeMode: 'light' as ThemeMode,
    boxed: config.boxed,
    setBorderCard: config.setBorderCard,
    /** Settings drawer (theme, tenant, build info) — opened from navbar, rendered in layout. */
    appSettingsDrawer: false,
  }),

  getters: {},
  actions: {
    SET_APP_SETTINGS_DRAWER(payload: boolean) {
      this.appSettingsDrawer = payload;
    },
    SET_SIDEBAR_DRAWER() {
      this.Sidebar_drawer = !this.Sidebar_drawer;
    },
    SET_MINI_SIDEBAR(payload: any) {
      this.mini_sidebar = payload;
    },
    SET_CUSTOMIZER_DRAWER(payload: any) {
      this.Customizer_drawer = payload;
    },

    SET_LAYOUT(payload: any) {
      this.setHorizontalLayout = payload;
    },
    SET_THEME(payload: string) {
      this.actTheme = payload;
      this.themeMode = payload === 'DARK_BLUE_THEME' ? 'dark' : 'light';
    },
    SET_THEME_MODE(mode: ThemeMode) {
      this.themeMode = mode;
      this.applyResolvedTheme();
    },
    applyResolvedTheme() {
      if (this.themeMode === 'light') {
        this.actTheme = 'BLUE_THEME';
      } else if (this.themeMode === 'dark') {
        this.actTheme = 'DARK_BLUE_THEME';
      } else if (typeof window !== 'undefined') {
        this.actTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'DARK_BLUE_THEME'
          : 'BLUE_THEME';
      }
    },
    SET_CARD_BORDER(payload: any){
      this.setBorderCard = payload
    }
  },
});
