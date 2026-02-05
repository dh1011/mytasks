// Theme matching mobile dark theme
export const theme = {
    colors: {
        // Dark theme - Utility-First Minimalism
        primary: '#FFFFFF',
        primaryLight: '#E5E5EA',
        background: '#0A0A0A',
        backgroundAlt: '#111111',
        surface: '#1C1C1E',
        surfaceElevated: '#2C2C2E',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        textMuted: '#636366',
        border: '#38383A',
        borderLight: '#2C2C2E',
        success: '#30D158',
        danger: '#FF453A',
        shadow: 'rgba(0, 0, 0, 0.4)',
        grid: 'rgba(255, 255, 255, 0.03)',
        gridLine: 'rgba(255, 255, 255, 0.06)',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        full: 9999,
    },
    fontSize: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 20,
        xxl: 28,
        xxxl: 36,
    },
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 1,
        wider: 2,
        widest: 4,
    },
};

export type Theme = typeof theme;
