'use client';

export interface ThemeSettings {
  theme?: string;              // 'dark' | 'light'
  systemColor?: string;        // 'indigo' | 'emerald' | 'ocean' | 'rose' | 'custom'
  customPrimaryColor?: string; // '#hex'
  systemFont?: string;         // 'prompt' | 'sarabun' | 'kanit' | 'niramit'
  fontSizeScale?: string;      // '85' - '130' (percent)
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
  const activeThemeMode = settings.theme || localStorage.getItem('darkMode') === 'false' ? 'light' : 'dark';
  const isDark = (settings.theme ? settings.theme === 'dark' : (localStorage.getItem('darkMode') !== 'false'));
  if (isDark) {
    root.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  } else {
    root.classList.remove('dark');
    localStorage.setItem('darkMode', 'false');
  }
  localStorage.setItem('theme_mode', isDark ? 'dark' : 'light');

  // 2. Primary Color Theme & Custom Hex Engine
  const activeColor = settings.systemColor || localStorage.getItem('theme') || 'indigo';
  if (activeColor === 'custom' && (settings.customPrimaryColor || localStorage.getItem('customPrimaryColor'))) {
    const customHex = settings.customPrimaryColor || localStorage.getItem('customPrimaryColor') || '#6366f1';
    root.setAttribute('data-theme', 'custom');
    localStorage.setItem('theme', 'custom');
    localStorage.setItem('customPrimaryColor', customHex);

    // Convert Hex to RGB
    let hex = customHex.replace('#', '');
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
    root.setAttribute('data-theme', activeColor);
    localStorage.setItem('theme', activeColor);
  }

  // 3. Typography
  const activeFont = settings.systemFont || localStorage.getItem('systemFont') || 'prompt';
  const fontVarMap: Record<string, string> = {
    prompt: "'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sarabun: "'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    kanit: "'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    niramit: "'Niramit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };
  const fontStack = fontVarMap[activeFont] || fontVarMap.prompt;
  root.setAttribute('data-font', activeFont);
  root.style.setProperty('--font-primary', fontStack);
  if (document.body) {
    document.body.style.fontFamily = fontStack;
  }
  localStorage.setItem('systemFont', activeFont);

  // 4. Font Size Scale (Slider: 85% to 130%)
  const activeSizeScale = settings.fontSizeScale || localStorage.getItem('fontSizeScale') || '100';
  const scaleNum = parseInt(activeSizeScale, 10);
  if (!isNaN(scaleNum) && scaleNum >= 80 && scaleNum <= 140) {
    root.style.fontSize = `${scaleNum}%`;
    localStorage.setItem('fontSizeScale', String(scaleNum));
  } else {
    root.style.fontSize = '100%';
  }

  // 5. Border Radius
  const activeBorder = settings.borderRadius || localStorage.getItem('borderRadius') || 'rounded';
  root.setAttribute('data-border', activeBorder);
  localStorage.setItem('borderRadius', activeBorder);

  // 6. Surface Style
  const activeSurface = settings.surfaceStyle || localStorage.getItem('surfaceStyle') || 'shadow';
  root.setAttribute('data-surface', activeSurface);
  localStorage.setItem('surfaceStyle', activeSurface);
  if (activeSurface === 'flat') {
    root.style.setProperty('--surface-bg', 'rgba(255, 255, 255, 1)');
    root.style.setProperty('--surface-bg-dark', 'var(--bg-dark)');
    root.style.setProperty('--surface-blur', '0px');
    root.style.setProperty('--surface-shadow', 'none');
  } else if (activeSurface === 'shadow') {
    root.style.setProperty('--surface-bg', 'rgba(255, 255, 255, 1)');
    root.style.setProperty('--surface-bg-dark', 'var(--surface-card)');
    root.style.setProperty('--surface-blur', '0px');
    root.style.setProperty('--surface-shadow', '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)');
  } else if (activeSurface === 'glass') {
    root.style.setProperty('--surface-bg', 'rgba(255, 255, 255, 0.8)');
    root.style.setProperty('--surface-bg-dark', 'var(--surface-card)');
    root.style.setProperty('--surface-blur', '16px');
    root.style.setProperty('--surface-shadow', 'none');
  }

  // 7. Layout Density
  if (settings.layoutDensity) {
    root.setAttribute('data-density', settings.layoutDensity);
    localStorage.setItem('layoutDensity', settings.layoutDensity);
  }

  // Broadcast to all listening React components
  window.dispatchEvent(new CustomEvent('eprofile-theme-change', { detail: settings }));
}
