import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const PrimaryButton = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}) => {
  const bgColor = variant === 'primary' ? '#030e8b' :
    variant === 'danger' ? '#FF3B30' : 'transparent';
  const borderColor = variant === 'outline' ? '#030e8b' : bgColor;
  const textColor = variant === 'outline' ? '#4d4e4e' : '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default PrimaryButton;