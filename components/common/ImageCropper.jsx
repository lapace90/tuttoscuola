import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Text,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons/Icon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CROP_SIZE = SCREEN_WIDTH * 0.75;

const ImageCropper = ({ 
  visible, 
  imageUri, 
  onCrop, 
  onCancel,
  cropShape = 'circle',
}) => {
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const initialPinchDistance = useRef(0);
  const initialPinchScale = useRef(1);

  useEffect(() => {
    if (visible && imageUri) {
      // Reset on open
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      lastScale.current = 1;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
    }
  }, [visible, imageUri]);

  const getDistance = (touches) => {
    const [t1, t2] = touches;
    return Math.sqrt(
      Math.pow(t2.pageX - t1.pageX, 2) + Math.pow(t2.pageY - t1.pageY, 2)
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
        
        if (evt.nativeEvent.touches.length === 2) {
          initialPinchDistance.current = getDistance(evt.nativeEvent.touches);
          initialPinchScale.current = scale._value;
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          const currentDistance = getDistance(evt.nativeEvent.touches);
          if (initialPinchDistance.current > 0) {
            const newScale = initialPinchScale.current * (currentDistance / initialPinchDistance.current);
            scale.setValue(Math.min(Math.max(newScale, 1), 5));
          }
        } else if (evt.nativeEvent.touches.length === 1) {
          translateX.setValue(lastTranslateX.current + gestureState.dx);
          translateY.setValue(lastTranslateY.current + gestureState.dy);
        }
      },
      
      onPanResponderRelease: () => {
        lastScale.current = scale._value;
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
        
        // Constrain position
        constrainPosition();
      },
    })
  ).current;

  const constrainPosition = () => {
    const currentScale = scale._value;
    const maxOffsetX = Math.max(0, (imageLayout.width * currentScale - CROP_SIZE) / 2);
    const maxOffsetY = Math.max(0, (imageLayout.height * currentScale - CROP_SIZE) / 2);
    
    let newX = translateX._value;
    let newY = translateY._value;
    
    newX = Math.min(maxOffsetX, Math.max(-maxOffsetX, newX));
    newY = Math.min(maxOffsetY, Math.max(-maxOffsetY, newY));
    
    Animated.parallel([
      Animated.spring(translateX, { toValue: newX, useNativeDriver: true, friction: 8 }),
      Animated.spring(translateY, { toValue: newY, useNativeDriver: true, friction: 8 }),
    ]).start();
    
    lastTranslateX.current = newX;
    lastTranslateY.current = newY;
  };

  const handleImageLoad = (event) => {
    const { width, height } = event.source;
    setOriginalSize({ width, height });
    
    // Calculate displayed size (image fills the crop area, covering it)
    const imageAspect = width / height;
    let displayWidth, displayHeight;
    
    if (imageAspect > 1) {
      // Landscape: height fits crop, width overflows
      displayHeight = CROP_SIZE;
      displayWidth = CROP_SIZE * imageAspect;
    } else {
      // Portrait: width fits crop, height overflows
      displayWidth = CROP_SIZE;
      displayHeight = CROP_SIZE / imageAspect;
    }
    
    setImageLayout({ width: displayWidth, height: displayHeight, x: 0, y: 0 });
  };

  const handleCrop = async () => {
    if (!imageUri || !originalSize.width) return;
    
    setLoading(true);
    
    try {
      const currentScale = scale._value;
      const currentTranslateX = translateX._value;
      const currentTranslateY = translateY._value;
      
      // Scale from displayed size to original
      const scaleToOriginal = originalSize.width / imageLayout.width;
      
      // Visible crop area center offset
      const cropCenterX = (imageLayout.width * currentScale) / 2 - currentTranslateX;
      const cropCenterY = (imageLayout.height * currentScale) / 2 - currentTranslateY;
      
      // Crop origin (top-left) in displayed coordinates
      const displayCropSize = CROP_SIZE / currentScale;
      const displayOriginX = (cropCenterX / currentScale) - (displayCropSize / 2);
      const displayOriginY = (cropCenterY / currentScale) - (displayCropSize / 2);
      
      // Convert to original image coordinates
      const originX = Math.max(0, Math.round(displayOriginX * scaleToOriginal));
      const originY = Math.max(0, Math.round(displayOriginY * scaleToOriginal));
      const cropSize = Math.round(displayCropSize * scaleToOriginal);
      
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX,
              originY,
              width: Math.min(cropSize, originalSize.width - originX),
              height: Math.min(cropSize, originalSize.height - originY),
            },
          },
          { resize: { width: 400, height: 400 } },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      onCrop(result.uri);
    } catch (error) {
      console.error('Crop error:', error);
      // Fallback
      try {
        const result = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        onCrop(result.uri);
      } catch (e) {
        onCrop(imageUri);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} style={styles.headerButton}>
            <Icon name="x" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Ritaglia foto</Text>
          <Pressable onPress={resetPosition} style={styles.headerButton}>
            <Icon name="refresh" size={20} color="white" />
          </Pressable>
        </View>

        <View style={styles.cropArea}>
          <View style={styles.imageWrapper} {...panResponder.panHandlers}>
            <Animated.View
              style={{
                width: imageLayout.width || CROP_SIZE,
                height: imageLayout.height || CROP_SIZE,
                transform: [
                  { scale },
                  { translateX },
                  { translateY },
                ],
              }}
            >
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                  onLoad={handleImageLoad}
                />
              )}
            </Animated.View>
          </View>
          
          {/* Crop mask */}
          <View style={styles.maskOverlay} pointerEvents="none">
            <View style={[
              styles.cropFrame,
              cropShape === 'circle' && styles.cropFrameCircle
            ]} />
          </View>
        </View>

        <Text style={styles.hint}>Trascina e pizzica per regolare</Text>

        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Annulla</Text>
          </Pressable>
          <Pressable 
            style={[styles.confirmBtn, loading && styles.btnDisabled]} 
            onPress={handleCrop}
            disabled={loading}
          >
            <Icon name="check" size={20} color="white" />
            <Text style={styles.confirmText}>
              {loading ? 'Attendi...' : 'Conferma'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ImageCropper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingTop: hp(6),
    paddingBottom: hp(2),
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: hp(2),
    fontWeight: '600',
    color: 'white',
  },
  cropArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  maskOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropFrame: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'transparent',
  },
  cropFrameCircle: {
    borderRadius: CROP_SIZE / 2,
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: hp(1.4),
    marginVertical: hp(2),
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingBottom: hp(5),
    gap: wp(3),
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: hp(1.8),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  cancelText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: '500',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: hp(1.8),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
  },
  confirmText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});