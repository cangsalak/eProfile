'use client';

export interface ThemeSettings {
  theme?: string;              // 'dark' | 'light'
  systemColor?: string;        // 'indigo' | 'emerald' | 'ocean' | 'rose' | 'custom'
  customPrimaryColor?: string; // '#hex'
  systemFont?: string;         // 'prompt' | 'sarabun' | 'kanit' | 'niramit'
  borderRadius?: string;       // 'sharp' | 'rounded' | 'pill'
  surfaceStyle?: string;       // 'flat' | 'shadow' | 'glass'
  layoutDensity?: string;      // 'normal' | 'compact'
  toastPosition?: string;
  toastTheme?: string;
}

/**
 * Real-time Theme Application Function
 * Synchronously modifies DOM attributes, classes, and CSS variables so all theme
 * and visual changes are reflected INSTANTLY on the entire application without reload.
 */
export function applyThemeSettings(settings: Partial<ThemeSettings>) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // 1. Dark / Light Mode
  if (settings.theme) {
    const isDark = settings.theme === 'dark';
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
    localStorage.setItem('theme_mode', settings.theme);
  }

  // 2. Primary Color Theme & Custom Hex Engine
  if (settings.systemColor) {
    if (settings.systemColor === 'custom' && settings.customPrimaryColor) {
      root.setAttribute('data-theme', 'custom');
      localStorage.setItem('theme', 'custom');

      // Convert Hex to RGB
      let hex = settings.customPrimaryColor.replace('#', '');
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        root.style.setProperty('--color-primary-50', `${Math.min(255, r + 180)} ${Math.min(255, g + 180)} ${Math.min(255, b + 180)}`);
        root.style.setProperty('--color-primary-100', `${Math.min(255, r + 150)} ${Math.min(255, g + 150)} ${Math.min(255, b + 150)}`);
        root.style.setProperty('--color-primary-200', `${Math.min(255, r + 100)} ${Math.min(255, g + 100)} ${Math.min(255, b + 100)}`);
        root.style.setProperty('--color-primary-300', `${Math.min(255, r + 60)} ${Math.min(255, g + 60)} ${Math.min(255, b + 60)}`);
        root.style.setProperty('--color-primary-400', `${Math.min(255, r + 30)} ${Math.min(255, g + 30)} ${Math.min(255, b + 30)}`);
        root.style.setProperty('--color-primary-500', `${r} ${g} ${b}`);
        root.style.setProperty('--color-primary-600', `${Math.max(0, r - 25)} ${Math.max(0, g - 25)} ${Math.max(0, b - 25)}`);
        root.style.setProperty('--color-primary-700', `${Math.max(0, r - 50)} ${Math.max(0, g - 50)} ${Math.max(0, b - 50)}`);
        root.style.setProperty('--color-primary-800', `${Math.max(0, r - 80)} ${Math.max(0, g - 80)} ${Math.max(0, b - 80)}`);
        root.style.setProperty('--color-primary-900', `${Math.max(0, r - 110)} ${Math.max(0, g - 110)} ${Math.max(0, b - 110)}`);
        root.style.setProperty('--color-primary-950', `${Math.max(0, r - 140)} ${Math.max(0, g - 140)} ${Math.max(0, b - 140)}`);
      }
    } else {
      root.setAttribute('data-theme', settings.systemColor);
      localStorage.setItem('theme', settings.systemColor);
    }
  }

  // 3. Typography
  if (settings.systemFont) {
    const fontVarMap: Record<string, string> = {
      prompt: "'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      sarabun: "'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      kanit: "'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      niramit: "'Niramit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    };
    const fontStack = fontVarMap[settings.systemFont] || fontVarMap.prompt;
    root.setAttribute('data-font', settings.systemFont);
    root.style.setProperty('--font-primary', fontStack);
    if (document.body) {
      document.body.style.fontFamily = fontStack;
    }
    localStorage.setItem('systemFont', settings.systemFont);
  }

  // 4. Border Radius
  if (settings.borderRadius) {
    root.setAttribute('data-border', settings.borderRadius);
    localStorage.setItem('borderRadius', settings.borderRadius);
  }

  // 5. Surface Style
  if (settings.surfaceStyle) {
    root.setAttribute('data-surface', settings.surfaceStyle);
    localStorage.setItem('surfaceStyle', settings.surfaceStyle);
    if (settings.surfaceStyle === 'flat') {
      root.style.setProperty('--surface-bg', 'rgba(255, 255, 255, 1)');
      root.style.setProperty('--surface-bg-dark', 'var(--bg-dark)');
      root.style.setProperty('--surface-blur', '0px');
      root.style.setProperty('--surface-shadow', 'none');
    } else if (settings.surfaceStyle === 'shadow') {
      root.style.setProperty('--surface-bg', 'rgba(255, 255, 255, 1)');
      root.style.setProperty('--surface-bg-dark', 'var(--surface-card)');
      root.style.setProperty('--surface-blur', '0px');
      root.style.setProperty('--surface-shadow', '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)');
    } else if (settings.surfaceStyle === 'glass') {
      root.style.setProperty('--surface-bg', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--surface-bg-dark', 'var(--surface-card)');
      root.style.setProperty('--surface-blur', '16px');
      root.style.setProperty('--surface-shadow', 'none');
    }
  }

  // 6. Layout Density
  if (settings.layoutDensity) {
    root.setAttribute('data-density', settings.layoutDensity);
    localStorage.setItem('layoutDensity', settings.layoutDensity);
  }

  // Broadcast to all listening React components (e.g. DashboardShell navbar)
  window.dispatchEvent(new CustomEvent('eprofile-theme-change', { detail: settings }));
}
