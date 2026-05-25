/**
 * Ardot Design Tokens - Spacing & Layout
 * Source: Ardot Variables "Spacing" variable set + Style Guide
 */

export const Spacing = {
  // From Ardot Variables
  pagePadding: 20,
  cardPadding: 16,
  elementGap: 12,
  sectionGap: 24,

  // Radius
  cardRadius: 20,
  buttonRadius: 28,
  tagRadius: 12,

  // Additional gap scale (from style guide)
  gapXS: 2,
  gapSM: 4,
  gapMD: 8,
  gapLG: 16,
  gapXL: 20,
  gapXXL: 28,
  gapMajor: 32,

  // Padding scale
  paddingXS: 8,
  paddingSM: 12,
  paddingMD: 16,
  paddingLG: 20,
  paddingXL: 24,
  paddingXXL: 28,
} as const;

export const Layout = {
  screenWidth: 390,   // iPhone standard reference
  contentWidth: 390 - Spacing.pagePadding * 2, // 350
} as const;

export const IconSizes = {
  nav: 22,
  header: 20,
  search: 18,
  chevron: 16,
  action: 14,
  statusDot: 8,
} as const;
