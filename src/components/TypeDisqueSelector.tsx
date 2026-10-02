import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { couleurs, espacements, polices, rayons, tailles } from '../theme';
import type { TypeDisque } from '../types';

const TYPES: TypeDisque[] = ['HDD', 'SSD', 'NVMe'];

interface Props {
  valeur: TypeDisque;
  onChange: (type: TypeDisque) => void;
}

interface SegmentProps {
  type: TypeDisque;
  actif: boolean;
  onPress: () => void;
}

function Segment({ type, actif, onPress }: SegmentProps): React.JSX.Element {
  const progression = useSharedValue(actif ? 1 : 0);

  useEffect(() => {
    progression.value = withTiming(actif ? 1 : 0, { duration: 150 });
  }, [actif, progression]);

  const styleAnime = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progression.value, [0, 1], [couleurs.surface, couleurs.primaryLight]),
    borderColor: interpolateColor(progression.value, [0, 1], [couleurs.border, couleurs.primaryDark]),
  }));

  return (
    <Pressable style={styles.segmentZone} onPress={onPress}>
      <Animated.View style={[styles.segment, styleAnime]}>
        <Text style={[styles.segmentTexte, actif && styles.segmentTexteActif]}>{type}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function TypeDisqueSelector({ valeur, onChange }: Props): React.JSX.Element {
  return (
    <View style={styles.segments}>
      {TYPES.map((type) => (
        <Segment key={type} type={type} actif={valeur === type} onPress={() => onChange(type)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  segments: { flexDirection: 'row', gap: espacements.xs + 2 },
  segmentZone: { flex: 1 },
  segment: {
    paddingVertical: espacements.sm + 2,
    paddingHorizontal: espacements.xs,
    borderRadius: rayons.input,
    borderWidth: 1,
    alignItems: 'center',
  },
  segmentTexte: { fontFamily: polices.bodySemiBold, fontSize: tailles.sm, color: couleurs.textSecondary },
  segmentTexteActif: { color: couleurs.primaryDark },
});
