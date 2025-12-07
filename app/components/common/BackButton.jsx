// components/BackButton.jsx
import { Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import Icon from './Icon';

const BackButton = ({ router, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (router) {
      router.back();
    }
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <Icon name="arrowLeft" size={24} color={theme.colors.text} />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    width: hp(5),
    height: hp(5),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});