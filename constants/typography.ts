/**
 * Ardot Design Tokens - Typography
 * Source: Ardot Style Guide
 * Font families: Inter (Latin), Noto Sans SC (CJK fallback)
 */

import { Platform } from 'react-native';

const fontFamilyBase = Platform.select({
  ios: 'Inter',
  android: 'Inter',
  default: 'Inter',
});

export const FontFamily = {
  primary: fontFamilyBase,
  chinese: 'Noto Sans SC',
} as const;

export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const FontSizes = {
  largeTitle: 32,
  title1: 28,
  title2: 22,
  title3: 18,
  headline: 15,
  body: 15,
  callout: 14,
  subhead: 13,
  footnote: 12,
  sectionLabel: 11,
  tabLabel: 10,
} as const;

export const LetterSpacing = {
  condensedLg: -2,
  condensed: -1,
  condensedSm: -0.5,
  normal: 0,
  relaxedSm: 0.3,
  wide: 1,
  wider: 2,
} as const;

export const LineHeight = {
  tight: 1.2,
  standard: 1.4,
  auto: 'auto' as unknown as number,
} as const;

// Preset text styles for reuse
export const TextStyles = {
  largeTitle: {
    fontFamily: fontFamilyBase,
    fontSize: FontSizes.largeTitle,
    fontWeight: FontWeights.light,
    letterSpacing: LetterSpacing.condensed,
    color: '#2B2B29',
  },
  title1: {
    fontFamily: fontFamilyBase,
    fontSize: FontSizes.title1,
    fontWeight: FontWeights.light,
    letterSpacing: LetterSpacing.condensedSm,
    color: '#2B2B29',
  },
  title2: {
    fontFamily: fontFamilyBase,
    fontSize: FontSizes.title2,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.relaxedSm,
    color: '#2B2B29',
  },
  title3: {
    fontFamily: fontFamilyBase,
    fontSize: FontSizes.title3,
    fontWeight: FontWeights.medium,
    color: '#2B2B29',
  },
  headline: {
    fontFamily: fontFamilyBase,
    fontSize: FontSizes.headline,
    fontWeight: FontWeights.regular,
    color: '#2B2B29',
  },
  body: {
    fontFamily: fontFamilyBase,
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.body * 1.4,
    color: '#2B2B29',
  },
  callout: {
    fontFamily: fontFamilyBase,
    fontSize: FontSizes.callout,
    fontWeight: FontWeights.regular,
    color: '#2B2B29',
  },
  subhead: {
    fontFamily: fontFamilyBase,
    fontSize: FontSizes.subhead,
    fontWeight: FontWeights.medium,
    color: '#2B2B29',
  },
  caption: {
    fontFamily: fontFamilyBase,
    fontSize: FontSizes.footnote,
    fontWeight: FontWeights.regular,
    color: '#87877F',
  },
  sectionLabel: {
    fontFamily: fontFamilyBase,
    fontSize: FontSizes.sectionLabel,
    fontWeight: FontWeights.medium,
    letterSpacing: LetterSpacing.wider,
    textTransform: 'uppercase' as const,
    color: '#87877F',
  },
} as const;
