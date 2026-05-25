import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';

interface MagicCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  color?: string;       // card accent color
}

export default function MagicCard({
  title,
  subtitle,
  children,
  style,
  titleStyle,
  color = Colors.magicPurple,
}: MagicCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.pureWhite,
    borderRadius: Spacing.cardRadius,
    padding: Spacing.cardPadding,
    borderLeftWidth: 4,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: Spacing.elementGap,
  },
  title: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.title3,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    fontWeight: FontWeights.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
