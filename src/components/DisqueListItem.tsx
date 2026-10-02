import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { couleurs, espacements, ombres, polices, rayons, tailles } from '../theme';
import type { Disque } from '../types';

interface Props {
  disque: Disque;
  /**
   * Fourni uniquement par l'écran Historique (où l'entreprise n'est pas
   * forcément filtrée) : remplace alors marque/capacité comme information
   * principale de la carte, reléguées dans la ligne secondaire avec la date.
   */
  entrepriseNom?: string;
  onEdit: (disque: Disque) => void;
  onDelete: (disque: Disque) => void;
}

export function DisqueListItem({ disque, entrepriseNom, onEdit, onDelete }: Props): React.JSX.Element {
  const dateAffichee = new Date(disque.createdAt).toLocaleString('fr-FR');

  return (
    <View style={styles.container}>
      <View style={styles.ligneHaut}>
        <Text style={styles.ligneImportante} numberOfLines={1}>
          {entrepriseNom ?? `${disque.brand} · ${disque.capacity}`}
        </Text>
        <View style={styles.badgeType}>
          <Text style={styles.badgeTypeTexte}>{disque.type}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.boutonAction} onPress={() => onEdit(disque)} hitSlop={8}>
            <PencilIcon size={16} color={couleurs.textSecondary} />
          </Pressable>
          <Pressable style={styles.boutonAction} onPress={() => onDelete(disque)} hitSlop={8}>
            <TrashIcon size={16} color={couleurs.danger} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.ligneImportante} numberOfLines={1}>
        SN {disque.serialNumber}
      </Text>
      <Text style={styles.secondaire}>
        {entrepriseNom ? `${disque.brand} · ${disque.capacity} · ${dateAffichee}` : dateAffichee}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: couleurs.surface,
    borderWidth: 1,
    borderColor: couleurs.border,
    borderRadius: rayons.md,
    padding: espacements.md,
    ...ombres.sm,
  },
  ligneHaut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacements.sm,
  },
  // Marque, capacité et S/N portent le même poids visuel : ce sont les
  // informations qui identifient réellement le composant.
  ligneImportante: {
    flex: 1,
    fontFamily: polices.bodySemiBold,
    fontSize: tailles.sm + 1,
    color: couleurs.textPrimary,
    marginTop: 2,
  },
  secondaire: {
    fontFamily: polices.bodyRegular,
    fontSize: tailles.xs - 1,
    color: couleurs.textTertiary,
    marginTop: 4,
  },
  badgeType: {
    backgroundColor: couleurs.primaryLight,
    borderRadius: rayons.pill,
    paddingHorizontal: espacements.sm + 2,
    paddingVertical: 3,
  },
  badgeTypeTexte: {
    fontFamily: polices.bodySemiBold,
    fontSize: tailles.xs - 1,
    color: couleurs.primaryDark,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: espacements.xs },
  boutonAction: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
