import { useWindowDimensions } from 'react-native';

/**
 * Custom hook for responsive layout calculations
 */
export const useResponsive = () => {
    const { width, height } = useWindowDimensions();

    const isSmallPhone = width < 360;
    const isPhone = width < 600;
    const isTablet = width >= 600 && width < 900;
    const isLargeDisplay = width >= 900;

    // Grid calculations
    const getGridColumns = (columnsOnPhone = 2, columnsOnTablet = 3, columnsOnLarge = 4) => {
        if (isPhone) return columnsOnPhone;
        if (isTablet) return columnsOnTablet;
        return columnsOnLarge;
    };

    // Responsive font scaling (basic)
    const scaleFont = (size) => {
        const scale = width / 375; // Standard mobile width
        const newSize = size * scale;
        if (isTablet) return size * 1.25;
        if (isLargeDisplay) return size * 1.5;
        return Math.round(newSize);
    };

    return {
        width,
        height,
        isSmallPhone,
        isPhone,
        isTablet,
        isLargeDisplay,
        getGridColumns,
        scaleFont,
        spacing: (val) => val * (isTablet ? 1.5 : 1),
    };
};
