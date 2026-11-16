/**
 * Design Tokens - Centralized design system for OjGen-Web
 * Provides consistent colors, spacing, typography, and component tokens
 */

// ============================================================================
// COLOR SYSTEM - Semantic tokens (never use raw hex in components)
// ============================================================================

export const colors = {
  // Primary brand - Single accent color
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main brand
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Neutral grays - UI surfaces and text
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic status colors (reserved for states, never for series identity)
  success: {
    light: '#dcfce7',
    DEFAULT: '#22c55e',
    dark: '#166534',
    on: '#ffffff',
    bg: '#14532d',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#92400e',
    on: '#ffffff',
    bg: '#78350f',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#991b1b',
    on: '#ffffff',
    bg: '#7f1d1d',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1e40af',
    on: '#ffffff',
    bg: '#1e3a8a',
  },

  // Surface tokens - Abstracted for dark/light mode
  surface: {
    // Base surfaces
    base: { light: '#ffffff', dark: '#0f172a' },        // Page background
    raised: { light: '#f8fafc', dark: '#1e293b' },      // Cards, modals
    overlay: { light: '#f1f5f9', dark: '#1e293b' },     // Dropdowns, popovers
    sunken: { light: '#e2e8f0', dark: '#0f172a' },      // Inputs, code blocks

    // Interactive surfaces
    hover: { light: '#f1f5f9', dark: '#334155' },
    active: { light: '#e2e8f0', dark: '#475569' },
    focus: { light: '#dbeafe', dark: '#1e3a8a' },

    // Borders
    border: { light: '#e2e8f0', dark: '#334155' },
    borderStrong: { light: '#cbd5e1', dark: '#475569' },
    borderFocus: { light: '#3b82f6', dark: '#60a5fa' },

    // Text
    textPrimary: { light: '#0f172a', dark: '#f8fafc' },
    textSecondary: { light: '#475569', dark: '#cbd5e1' },
    textMuted: { light: '#94a3b8', dark: '#64748b' },
    textInverse: { light: '#ffffff', dark: '#0f172a' },
    textOnPrimary: { light: '#ffffff', dark: '#ffffff' },
  },

  // Chart/Visualization categorical palette (fixed order, validated)
  categorical: [
    '#3b82f6', // blue
    '#22c55e', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#a855f7', // purple
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#84cc16', // lime
  ],
} as const;

// ============================================================================
// SPACING SYSTEM - 4px base unit
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'JetBrains Mono, "Fira Code", Menlo, Monaco, Consolas, monospace',
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],    // 12px
    sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],   // 14px
    base: ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],           // 16px
    lg: ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],         // 18px
    xl: ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],          // 20px
    '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.025em' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }], // 30px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Semantic text styles (combine size + weight + color)
  styles: {
    heading1: { size: '3xl', weight: 'bold', color: 'textPrimary' },
    heading2: { size: '2xl', weight: 'bold', color: 'textPrimary' },
    heading3: { size: 'xl', weight: 'semibold', color: 'textPrimary' },
    heading4: { size: 'lg', weight: 'semibold', color: 'textPrimary' },
    body: { size: 'base', weight: 'normal', color: 'textPrimary' },
    bodySmall: { size: 'sm', weight: 'normal', color: 'textSecondary' },
    caption: { size: 'xs', weight: 'normal', color: 'textMuted' },
    label: { size: 'xs', weight: 'medium', color: 'textSecondary' },
    code: { size: 'xs', weight: 'normal', color: 'textPrimary', family: 'mono' },
    codeSmall: { size: 'xs', weight: 'normal', color: 'textSecondary', family: 'mono' },
    button: { size: 'sm', weight: 'semibold', color: 'textOnPrimary' },
    buttonSmall: { size: 'xs', weight: 'semibold', color: 'textOnPrimary' },
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const radius = {
  none: '0',
  sm: '0.25rem',    // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  full: '9999px',
} as const;

// ============================================================================
// SHADOWS / ELEVATION
// ============================================================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Focus ring
  focus: '0 0 0 3px rgb(59 130 246 / 0.4)',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  fast: '150ms ease',
  DEFAULT: '200ms ease',
  slow: '300ms ease',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
} as const;

// ============================================================================
// BREAKPOINTS (for reference, Tailwind handles these)
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// COMPONENT TOKENS - Pre-composed tokens for common patterns
// ============================================================================

export const componentTokens = {
  // Card
  card: {
    background: 'surface.raised',
    border: 'surface.border',
    borderWidth: '1px',
    borderRadius: 'radius.lg',
    padding: 'spacing.4',
    shadow: 'shadows.sm',
  },

  // Card interactive (hoverable)
  cardInteractive: {
    background: 'surface.raised',
    border: 'surface.border',
    borderWidth: '1px',
    borderRadius: 'radius.lg',
    padding: 'spacing.4',
    shadow: 'shadows.sm',
    transition: 'transitions.DEFAULT',
    hoverShadow: 'shadows.DEFAULT',
    hoverBorder: 'surface.borderStrong',
  },

  // Input
  input: {
    background: 'surface.sunken',
    border: 'surface.border',
    borderWidth: '1px',
    borderRadius: 'radius.DEFAULT',
    paddingX: 'spacing.3',
    paddingY: 'spacing.2',
    fontSize: 'typography.fontSize.sm',
    fontFamily: 'typography.fontFamily.mono',
    color: 'surface.textPrimary',
    placeholderColor: 'surface.textMuted',
    focusBorder: 'surface.borderFocus',
    focusRing: 'shadows.focus',
    disabledBackground: 'surface.border',
    disabledColor: 'surface.textMuted',
    transition: 'transitions.fast',
  },

  // Button base
  button: {
    borderRadius: 'radius.DEFAULT',
    paddingX: 'spacing.3',
    paddingY: 'spacing.2',
    fontSize: 'typography.fontSize.sm',
    fontWeight: 'typography.fontWeight.semibold',
    transition: 'transitions.fast',
    focusRing: 'shadows.focus',
    disabledOpacity: '0.5',
    disabledCursor: 'not-allowed',
  },

  // Button variants
  buttonPrimary: {
    background: 'primary.600',
    color: 'surface.textOnPrimary',
    hoverBackground: 'primary.700',
    activeBackground: 'primary.800',
    border: 'none',
  },
  buttonSecondary: {
    background: 'surface.overlay',
    color: 'surface.textPrimary',
    border: 'surface.border',
    borderWidth: '1px',
    hoverBackground: 'surface.hover',
    hoverBorder: 'surface.borderStrong',
    activeBackground: 'surface.active',
  },
  buttonGhost: {
    background: 'transparent',
    color: 'surface.textSecondary',
    hoverBackground: 'surface.hover',
    hoverColor: 'surface.textPrimary',
    activeBackground: 'surface.active',
    border: 'none',
  },
  buttonDanger: {
    background: 'error.DEFAULT',
    color: 'error.on',
    hoverBackground: 'error.dark',
    activeBackground: 'error.dark',
    border: 'none',
  },
  buttonOutline: {
    background: 'transparent',
    color: 'primary.600',
    border: 'primary.600',
    borderWidth: '1px',
    hoverBackground: 'primary.50',
    hoverColor: 'primary.700',
    activeBackground: 'primary.100',
  },

  // Badge
  badge: {
    borderRadius: 'radius.full',
    paddingX: 'spacing.2',
    paddingY: 'spacing.0.5',
    fontSize: 'typography.fontSize.xs',
    fontWeight: 'typography.fontWeight.semibold',
  },

  // Modal
  modal: {
    backdropBackground: 'rgb(2 6 23 / 0.8)',  // neutral.950 / 80%
    background: 'surface.raised',
    border: 'surface.border',
    borderWidth: '1px',
    borderRadius: 'radius.xl',
    padding: 'spacing.6',
    shadow: 'shadows.xl',
    maxWidth: '48rem', // 768px
    maxHeight: '90vh',
  },

  // Table
  table: {
    headerBackground: 'surface.overlay',
    headerColor: 'surface.textSecondary',
    rowHoverBackground: 'surface.hover',
    borderColor: 'surface.border',
    cellPaddingX: 'spacing.3',
    cellPaddingY: 'spacing.2',
    fontSize: 'typography.fontSize.sm',
  },

  // Tooltip
  tooltip: {
    background: 'neutral.900',
    color: 'neutral.50',
    borderRadius: 'radius.sm',
    paddingX: 'spacing.2',
    paddingY: 'spacing.1',
    fontSize: 'typography.fontSize.xs',
    shadow: 'shadows.lg',
    arrowSize: '0.375rem',
  },

  // Divider
  divider: {
    color: 'surface.border',
    width: '1px',
  },
} as const;

// ============================================================================
// CSS VARIABLE GENERATOR (for runtime theming)
// ============================================================================

export function generateCSSVariables(mode: 'light' | 'dark' = 'dark'): Record<string, string> {
  const vars: Record<string, string> = {};

  // Colors
  Object.entries(colors.primary).forEach(([key, value]) => {
    vars[`--color-primary-${key}`] = value;
  });
  Object.entries(colors.neutral).forEach(([key, value]) => {
    vars[`--color-neutral-${key}`] = value;
  });

  // Semantic colors
  ['success', 'warning', 'error', 'info'].forEach((name) => {
    const color = colors[name as keyof typeof colors];
    if (typeof color === 'object' && 'DEFAULT' in color) {
      Object.entries(color).forEach(([key, value]) => {
        vars[`--color-${name}-${key}`] = value;
      });
    }
  });

  // Surface tokens (resolve for mode)
  Object.entries(colors.surface).forEach(([key, value]) => {
    if (typeof value === 'object' && 'light' in value && 'dark' in value) {
      vars[`--surface-${key}`] = value[mode];
    }
  });

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value;
  });

  // Radius
  Object.entries(radius).forEach(([key, value]) => {
    vars[`--radius-${key}`] = value;
  });

  // Shadows
  Object.entries(shadows).forEach(([key, value]) => {
    vars[`--shadow-${key}`] = value;
  });

  // Transitions
  Object.entries(transitions).forEach(([key, value]) => {
    vars[`--transition-${key}`] = value;
  });

  // Z-index
  Object.entries(zIndex).forEach(([key, value]) => {
    vars[`--z-${key}`] = String(value);
  });

  return vars;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ColorScale = typeof colors.primary;
export type SpacingScale = typeof spacing;
export type RadiusScale = typeof radius;
export type ShadowScale = typeof shadows;
export type ZIndexScale = typeof zIndex;