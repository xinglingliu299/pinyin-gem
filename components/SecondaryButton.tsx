import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, FontSizes, FontWeights, FontFamily } from '@/constants';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function SecondaryButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderRadius: Spacing.buttonRadius,
    paddingHorizontal: Spacing.paddingXL,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.magicPurple,
  },
  text: {
    fontFamily: FontFamily.primary,
    fontSize: FontSizes.callout,
    fontWeight: FontWeights.medium,
    color: Colors.magicPurple,
    letterSpacing: 0.5,
  },
  disabled: {
    borderColor: Colors.lockGray,
  },
});
