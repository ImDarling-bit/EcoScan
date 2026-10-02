import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { couleurs, espacements, ombres, polices, rayons, tailles } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  chargement?: boolean;
  /** 'filled' (dégradé primaire) pour l'action principale, 'outline' pour une action secondaire. */
  variant?: 'filled' | 'outline';
  /** 'compact' pour un bouton en pastille (ex : action de header), 'normal' sinon. */
  taille?: 'normal' | 'compact';
  /** Reçoit la couleur à utiliser (blanc en filled, primaire en outline). */
  icone?: (couleur: string) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bouton d'action réutilisé dans toute l'app (CTA écran, boutons de modale,
 * action de header) : dégradé + léger effet d'appui pour un rendu cohérent,
 * inspiré des micro-interactions vues sur les librairies web (Aceternity,
 * Magic UI...) mais recréé nativement avec react-native-reanimated.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  chargement,
  variant = 'filled',
  taille = 'normal',
  icone,
  style,
}: Props): React.JSX.Element {
  const desactive = !!disabled || !!chargement;
  const couleurContenu = variant === 'filled' ? couleurs.textInverse : couleurs.primary;

  const echelle = useSharedValue(1);
  const opacite = useSharedValue(desactive ? 0.5 : 1);

  useEffect(() => {
    opacite.value = withTiming(desactive ? 0.5 : 1, { duration: 100 });
  }, [desactive, opacite]);

  const styleAnime = useAnimatedStyle(() => ({
    transform: [{ scale: echelle.value }],
    opacity: opacite.value,
  }));

  const contenu = (
    <>
      {chargement ? (
        <ActivityIndicator size="small" color={couleurContenu} />
      ) : (
        <>
          {icone?.(couleurContenu)}
          <Text
            style={[
              styles.texte,
              taille === 'compact' && styles.texteCompact,
              { color: couleurContenu },
            ]}>
            {label}
          </Text>
        </>
      )}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={desactive}
      onPressIn={() => {
        echelle.value = withTiming(0.96, { duration: 100 });
      }}
      onPressOut={() => {
        echelle.value = withTiming(1, { duration: 100 });
      }}
      style={style}>
      <Animated.View style={styleAnime}>
        {variant === 'filled' ? (
          <LinearGradient
            colors={[couleurs.primary, couleurs.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.fond, taille === 'compact' ? styles.fondCompact : styles.fondNormal]}>
            {contenu}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.fond,
              styles.fondOutline,
              taille === 'compact' ? styles.fondCompact : styles.fondNormal,
            ]}>
            {contenu}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fond: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacements.sm - 2,
  },
  fondNormal: {
    paddingVertical: 13,
    borderRadius: rayons.input,
    ...ombres.md,
  },
  fondCompact: {
    paddingHorizontal: espacements.md,
    paddingVertical: espacements.xs + 4,
    borderRadius: rayons.sm,
    minWidth: 92,
  },
  fondOutline: {
    backgroundColor: couleurs.surface,
    borderWidth: 1.5,
    borderColor: couleurs.primary,
  },
  texte: { fontFamily: polices.headingBold, fontSize: tailles.base - 2 },
  texteCompact: { fontSize: tailles.xs + 1 },
});
