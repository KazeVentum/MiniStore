/**
 * Lina Soft Luxury Design System
 */

export const COLORS = {
    // Backgrounds (Web-inspired Dark)
    background: '#0F111E',        // Deep Space Blue
    surface: '#1A1C2E',           // Card Navy
    surfaceSecondary: '#25283D',  // Light Navy / Search Bg

    // Brand Colors (Vibrant Pink)
    primary: '#FF4081',           // Neon Fuchsia (Web accent)
    primaryDark: '#D81B60',       // Deep Pink
    secondary: '#7C4DFF',         // Electric Purple (Luxury touch)
    accent: '#00E5FF',            // Cyan Glow

    // Status
    success: '#00E676',           // Bright Green
    warning: '#FFEA00',           // Vivid Yellow
    error: '#FF5252',             // Bright Red
    info: '#40C4FF',              // Bright Blue

    // Text (Max Contrast)
    textPrimary: '#FFFFFF',       // Pure White
    textSecondary: '#B0B3C1',     // Soft Silver
    textTertiary: '#6B6F80',      // Muted Steel
    textOnPrimary: '#FFFFFF',

    // Borders & Shadows
    border: '#2A2E44',
    shadow: '#000000',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 999,
};

export const SHADOWS = {
    soft: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    medium: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 5,
    },
    heavy: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    }
};

export const FONT_WEIGHTS = {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    black: '900',
};
