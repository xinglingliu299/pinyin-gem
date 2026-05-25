/**
 * Ardot Design Tokens - Colors
 * Source: Ardot Variables "Magic Colors" variable set
 * Converted from RGBA (0-1) to hex
 */

export const Colors = {
  // --- Magic Colors (from Ardot variables) ---
  magicPurple: '#8C5CF5',     // r:0.55, g:0.36, b:0.96
  magicGold: '#FCD44D',       // r:0.99, g:0.83, b:0.30
  magicWhite: '#FAF5FF',      // r:0.98, g:0.96, b:1.0
  pureWhite: '#FFFFFF',       // r:1.0, g:1.0, b:1.0

  // --- Text Colors ---
  textPrimary: '#2B2B29',     // r:0.17, g:0.17, b:0.16
  textSecondary: '#87877F',   // r:0.53, g:0.53, b:0.50

  // --- Semantic Colors ---
  successGreen: '#0FBA82',    // r:0.06, g:0.73, b:0.51
  errorRed: '#E34A4A',        // r:0.89, g:0.29, b:0.29

  // --- UI State Colors ---
  lockGray: '#D4D1C7',        // r:0.83, g:0.82, b:0.78
  glowPurple: '#DED6FC',      // r:0.87, g:0.84, b:0.99

  // --- Stage Colors ---
  stageGreen: '#0FBA82',
  stageBlue: '#388ADE',       // r:0.22, g:0.54, b:0.87
  stagePink: '#ED4799',       // r:0.93, g:0.28, b:0.60
  stageGold: '#F59E0A',       // r:0.96, g:0.62, b:0.04

  // --- Extended palette (derived from style guide) ---
  pageBackground: '#FAF5FF',
  cardSurface: '#FFFFFF',
  borderSubtle: '#F0ECF5',
  borderDefault: '#E5E0EB',
} as const;

// Semi-transparent variants
export const ColorsAlpha = {
  magicPurple10: 'rgba(140, 92, 245, 0.1)',
  magicPurple20: 'rgba(140, 92, 245, 0.2)',
  magicPurple50: 'rgba(140, 92, 245, 0.5)',
  magicGold10: 'rgba(252, 212, 77, 0.1)',
  successGreen10: 'rgba(15, 186, 130, 0.1)',
  errorRed10: 'rgba(227, 74, 74, 0.1)',
} as const;
