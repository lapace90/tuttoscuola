// components/common/BackButton.jsx
import { StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { theme } from '../../constants/theme';
import Icon from '../../assets/icons/Icon';

const BackButton = ({ size = 26, router, to }) => {
  return (
    <Pressable 
      onPress={() => to ? router.push(to) : router.back()} 
      style={[styles.button, { borderRadius: theme.radius.sm }]}
    >
      <Icon name="arrowLeft" size={size} color={theme.colors.text} />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
});