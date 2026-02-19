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
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Icon from '../../assets/icons/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CROP_SIZE = SCREEN_WIDTH * 0.75;

const ImageCropper = ({
  visible,
  imageUri,
  onCrop,
  onCancel,
  cropShape = 'circle',
}) => {
  const [normalizedUri, setNormalizedUri] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  useEffect(() => {
    if (visible && imageUri) {
      translateX.setValue(0);
      translateY.setValue(0);
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
      prepareImage(imageUri);
    } else {
      setNormalizedUri(null);
    }
  }, [visible, imageUri]);

  const prepareImage = async (uri) => {
    setPreparing(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      const w = result.width;
      const h = result.height;
      setImageSize({ width: w, height: h });
      setNormalizedUri(result.uri);

      const aspect = w / h;
      if (aspect > 1) {
        setDisplaySize({ width: CROP_SIZE * aspect, height: CROP_SIZE });
      } else {
        setDisplaySize({ width: CROP_SIZE, height: CROP_SIZE / aspect });
      }
    } catch (e) {
      setNormalizedUri(uri);
    } finally {
      setPreparing(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
      },

      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 1) {
          translateX.setValue(lastTranslateX.current + gestureState.dx);
          translateY.setValue(lastTranslateY.current + gestureState.dy);
        }
      },

      onPanResponderRelease: () => {
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
        constrainPosition();
      },
    })
  ).current;

  const constrainPosition = () => {
    const maxOffsetX = Math.max(0, (displaySize.width - CROP_SIZE) / 2);
    const maxOffsetY = Math.max(0, (displaySize.height - CROP_SIZE) / 2);

    let newX = Math.min(maxOffsetX, Math.max(-maxOffsetX, translateX._value));
    let newY = Math.min(maxOffsetY, Math.max(-maxOffsetY, translateY._value));

    Animated.parallel([
      Animated.spring(translateX, { toValue: newX, useNativeDriver: true, friction: 8 }),
      Animated.spring(translateY, { toValue: newY, useNativeDriver: true, friction: 8 }),
    ]).start();

    lastTranslateX.current = newX;
    lastTranslateY.current = newY;
  };

  const handleCrop = async () => {
    if (!normalizedUri || !imageSize.width) return;

    setLoading(true);

    try {
      const tx = translateX._value;
      const ty = translateY._value;

      const ratioX = imageSize.width / displaySize.width;
      const ratioY = imageSize.height / displaySize.height;

      const cropOriginX = (displaySize.width - CROP_SIZE) / 2 - tx;
      const cropOriginY = (displaySize.height - CROP_SIZE) / 2 - ty;

      const originX = Math.max(0, Math.round(cropOriginX * ratioX));
      const originY = Math.max(0, Math.round(cropOriginY * ratioY));
      const cropW = Math.min(Math.round(CROP_SIZE * ratioX), imageSize.width - originX);
      const cropH = Math.min(Math.round(CROP_SIZE * ratioY), imageSize.height - originY);

      const result = await ImageManipulator.manipulateAsync(
        normalizedUri,
        [
          { crop: { originX, originY, width: cropW, height: cropH } },
          { resize: { width: 400, height: 400 } },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      onCrop(result.uri);
    } catch (error) {
      console.error('Crop error:', error);
      try {
        const result = await ImageManipulator.manipulateAsync(
          normalizedUri || imageUri,
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

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} style={styles.headerButton}>
            <Icon name="x" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Ritaglia foto</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.cropArea}>
          {preparing ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View style={styles.imageWrapper} {...panResponder.panHandlers}>
              <Animated.View
                style={{
                  width: displaySize.width || CROP_SIZE,
                  height: displaySize.height || CROP_SIZE,
                  transform: [
                    { translateX },
                    { translateY },
                  ],
                }}
              >
                {normalizedUri && (
                  <Image
                    source={{ uri: normalizedUri }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="fill"
                  />
                )}
              </Animated.View>
            </View>
          )}

          {/* Crop mask */}
          <View style={styles.maskOverlay} pointerEvents="none">
            <View style={[
              styles.cropFrame,
              cropShape === 'circle' && styles.cropFrameCircle
            ]} />
          </View>
        </View>

        <Text style={styles.hint}>Trascina per regolare</Text>

        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Annulla</Text>
          </Pressable>
          <Pressable
            style={[styles.confirmBtn, (loading || preparing) && styles.btnDisabled]}
            onPress={handleCrop}
            disabled={loading || preparing}
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
