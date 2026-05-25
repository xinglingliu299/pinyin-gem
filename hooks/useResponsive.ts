/**
 * 响应式断点 Hook
 *
 * 根据屏幕宽度返回 phone/tablet 布局预设值。
 * 阈值：width >= 768 -> tablet, else -> phone
 */

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'phone' | 'tablet';

export interface ResponsiveValues {
  breakpoint: Breakpoint;
  cardWidth: number;
  contentMaxWidth: number | undefined;
  fontSizeMultiplier: number;
  spacingMultiplier: number;
  gridColumns: number;
}

const TABLET_THRESHOLD = 768;

export function useResponsive(): ResponsiveValues {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= TABLET_THRESHOLD;

  return useMemo<ResponsiveValues>(() => {
    if (isTablet) {
      // 平板：卡片最大 600，支持更宽的内容区域
      const safeCardWidth = Math.min(600, screenWidth - 80);
      return {
        breakpoint: 'tablet',
        cardWidth: safeCardWidth,
        contentMaxWidth: 768,
        fontSizeMultiplier: 1.2,
        spacingMultiplier: 1.4,
        gridColumns: 3,
      };
    }

    // 手机：卡片 335，超小屏兜底
    const safeCardWidth = Math.min(335, screenWidth - 40);
    return {
      breakpoint: 'phone',
      cardWidth: safeCardWidth,
      contentMaxWidth: undefined,
      fontSizeMultiplier: 1.0,
      spacingMultiplier: 1.0,
      gridColumns: 2,
    };
  }, [isTablet, screenWidth]);
}
