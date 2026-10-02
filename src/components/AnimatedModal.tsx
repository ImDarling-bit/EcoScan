import React, { useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { espacements } from '../theme';

interface Props {
  visible: boolean;
  onRequestClose?: () => void;
  children: React.ReactNode;
}

/** Modale avec une entrée animée (fondu + léger zoom) au lieu du fade plat par défaut. */
export function AnimatedModal({ visible, onRequestClose, children }: Props): React.JSX.Element {
  const progression = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progression.value = 0;
      progression.value = withTiming(1, { duration: 220 });
    }
  }, [visible, progression]);

  const styleAnime = useAnimatedStyle(() => ({
    opacity: progression.value,
    transform: [
      { scale: 0.92 + progression.value * 0.08 },
      { translateY: (1 - progression.value) * 12 },
    ],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.fond}>
        <Animated.View style={[styles.conteneur, styleAnime]}>{children}</Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fond: {
    flex: 1,
    backgroundColor: 'rgba(27, 36, 48, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacements.lg,
  },
  conteneur: { width: '100%' },
});
