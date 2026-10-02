import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { couleurs, espacements, ombres, polices, rayons, tailles } from '../theme';
import type { Entreprise } from '../types';

interface Props {
  entreprise: Entreprise;
  onPress: (entreprise: Entreprise) => void;
  onEdit: (entreprise: Entreprise) => void;
  onDelete: (entreprise: Entreprise) => void;
}

const TROIS_JOURS_MS = 3 * 24 * 60 * 60 * 1000;

export function EntrepriseListItem({ entreprise, onPress, onEdit, onDelete }: Props): React.JSX.Element {
  const estRecente = Date.now() - new Date(entreprise.createdAt).getTime() <= TROIS_JOURS_MS;

  const badgeOpacite = useSharedValue(0);
  const badgeEchelle = useSharedValue(0.4);
  useEffect(() => {
    if (estRecente) {
      badgeOpacite.value = withDelay(100, withSpring(1));
      badgeEchelle.value = withDelay(100, withSpring(1));
    }
  }, [estRecente, badgeOpacite, badgeEchelle]);
  const badgeStyleAnime = useAnimatedStyle(() => ({
    opacity: badgeOpacite.value,
    transform: [{ scale: badgeEchelle.value }],
  }));

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(entreprise)}>
      <View style={styles.ligneHaut}>
        <Text style={styles.nom} numberOfLines={1}>
          {entreprise.nom}
        </Text>
        {estRecente ? (
          <Animated.View style={[styles.badgeNouveau, badgeStyleAnime]}>
            <Text style={styles.badgeNouveauTexte}>Nouveau</Text>
          </Animated.View>
        ) : null}
        <View style={styles.actions}>
          <Pressable style={styles.boutonAction} onPress={() => onEdit(entreprise)} hitSlop={8}>
            <PencilIcon size={16} color={couleurs.textSecondary} />
          </Pressable>
          <Pressable style={styles.boutonAction} onPress={() => onDelete(entreprise)} hitSlop={8}>
            <TrashIcon size={16} color={couleurs.danger} />
          </Pressable>
          <View style={styles.chevronRond}>
            <Text style={styles.chevron}>›</Text>
          </View>
        </View>
      </View>
      <Text style={styles.date}>
        Créée le {new Date(entreprise.createdAt).toLocaleDateString('fr-FR')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: couleurs.surface,
    borderWidth: 1,
    borderColor: couleurs.border,
    borderRadius: rayons.md,
    padding: espacements.md + 2,
    ...ombres.sm,
  },
  pressed: {
    backgroundColor: couleurs.surfaceMuted,
  },
  ligneHaut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacements.sm,
  },
  badgeNouveau: {
    backgroundColor: couleurs.accentLight,
    borderRadius: rayons.pill,
    paddingHorizontal: espacements.sm,
    paddingVertical: 3,
  },
  badgeNouveauTexte: {
    fontFamily: polices.bodySemiBold,
    fontSize: tailles.xs - 2,
    color: couleurs.accentDark,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: espacements.xs + 2 },
  boutonAction: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nom: {
    flex: 1,
    fontFamily: polices.headingBold,
    fontSize: tailles.base,
    color: couleurs.textPrimary,
  },
  date: {
    fontFamily: polices.bodyRegular,
    fontSize: tailles.xs,
    color: couleurs.textSecondary,
    marginTop: 2,
  },
  chevronRond: {
    width: 24,
    height: 24,
    borderRadius: rayons.pill,
    backgroundColor: couleurs.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 16,
    color: couleurs.primary,
    marginLeft: 2,
  },
});
