
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      paddingHorizontal: size === 'small' ? 12 : size === 'large' ? 20 : 16,
      paddingVertical: size === 'small' ? 8 : size === 'large' ? 14 : 10,
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: colors.primary };
      case 'secondary':
        return { ...baseStyle, backgroundColor: colors.backgroundAlt, borderWidth: 1, borderColor: colors.primary };
      case 'success':
        return { ...baseStyle, backgroundColor: colors.success };
      case 'warning':
        return { ...baseStyle, backgroundColor: colors.warning };
      case 'error':
        return { ...baseStyle, backgroundColor: colors.error };
      default:
        return { ...baseStyle, backgroundColor: colors.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      marginLeft: icon ? 8 : 0,
    };

    switch (variant) {
      case 'secondary':
        return { ...baseStyle, color: colors.primary };
      default:
        return { ...baseStyle, color: 'white' };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && (
        <Icon
          name={icon}
          size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
          color={variant === 'secondary' ? colors.primary : 'white'}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ActionButton;
