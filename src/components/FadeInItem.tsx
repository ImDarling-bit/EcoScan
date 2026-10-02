import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  /** Index dans la liste : décale légèrement l'entrée de chaque carte (effet de cascade). */
  index?: number;
}

const DELAI_PAR_ITEM_MS = 35;
const DELAI_MAX_MS = 280;

/** Petite animation d'entrée (fondu + léger glissement) pour les cartes de liste. */
export function FadeInItem({ children, index = 0 }: Props): React.JSX.Element {
  const progression = useSharedValue(0);

  useEffect(() => {
    const delai = Math.min(index * DELAI_PAR_ITEM_MS, DELAI_MAX_MS);
    progression.value = withDelay(delai, withTiming(1, { duration: 220 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const styleAnime = useAnimatedStyle(() => ({
    opacity: progression.value,
    transform: [{ translateY: (1 - progression.value) * 10 }],
  }));

  return <Animated.View style={styleAnime}>{children}</Animated.View>;
}
