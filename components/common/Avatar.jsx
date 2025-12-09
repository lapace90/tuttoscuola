// components/common/Avatar.jsx
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import React from 'react';
import { theme } from '../../constants/theme';

const Avatar = ({ 
  uri,
  firstName,
  lastName,
  size = 40, 
  style,
  textStyle,
}) => {
  const avatarSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const getInitials = () => {
    const f = firstName?.charAt(0) || '';
    const l = lastName?.charAt(0) || '';
    const initials = (f + l).toUpperCase();
    return initials || '?';
  };

  const fontSize = size * 0.4;

  // Se avatar_url esiste, mostra l'immagine
  if (uri) {
    return (
      <Image 
        source={{ uri }} 
        style={[avatarSize, style]} 
        contentFit="cover"
        transition={200}
      />
    );
  }

  // Altrimenti mostra le iniziali
  return (
    <View style={[styles.placeholder, avatarSize, style]}>
      <Text style={[styles.initials, { fontSize }, textStyle]}>
        {getInitials()}
      </Text>
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: '700',
  },
});