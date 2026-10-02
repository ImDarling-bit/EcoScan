import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedModal } from './AnimatedModal';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CheckIcon } from './icons/CheckIcon';
import { couleurs, espacements, polices, rayons, tailles } from '../theme';

interface Props<T> {
  /** Libellé du filtre (ex : "Entreprise") — affiché sur la ligne et en titre du volet. */
  label: string;
  options: readonly T[];
  valeur: T | undefined;
  onChange: (valeur: T | undefined) => void;
  /** Identifiant unique de l'option — indispensable si `getLabel` peut renvoyer
   * le même libellé pour deux options différentes (ex : deux entreprises
   * portant le même nom). Par défaut, utilise le libellé lui-même. */
  getKey?: (item: T) => string;
  /** Libellé affiché pour une option. Par défaut, l'option elle-même (cas des
   * options `string`, ex : les types de disque). */
  getLabel?: (item: T) => string;
  /** Texte affiché quand aucune valeur n'est sélectionnée (ex : "Toutes"). */
  libellePlaceholder?: string;
}

/**
 * Filtre présenté comme un volet déroulant (ligne compacte + panneau de
 * sélection) plutôt qu'une rangée de chips toujours visible : moins de bruit
 * visuel quand plusieurs filtres sont affichés ensemble (voir HistoryScreen).
 */
export function FilterDropdown<T>({
  label,
  options,
  valeur,
  onChange,
  getKey,
  getLabel,
  libellePlaceholder = 'Toutes',
}: Props<T>): React.JSX.Element {
  const [ouvert, setOuvert] = useState(false);
  const cleDe = getKey ?? ((item: T) => String(item));
  const libelleDe = getLabel ?? ((item: T) => String(item));
  const cleSelectionnee = valeur !== undefined ? cleDe(valeur) : undefined;

  const choisir = (option: T | undefined) => {
    onChange(option);
    setOuvert(false);
  };

  return (
    <>
      <Pressable style={styles.champ} onPress={() => setOuvert(true)}>
        <Text style={styles.champLabel}>{label}</Text>
        <View style={styles.champValeurLigne}>
          <Text
            style={[styles.champValeur, valeur === undefined && styles.champValeurPlaceholder]}
            numberOfLines={1}>
            {valeur !== undefined ? libelleDe(valeur) : libellePlaceholder}
          </Text>
          <ChevronDownIcon size={16} color={couleurs.textTertiary} />
        </View>
      </Pressable>

      <AnimatedModal visible={ouvert} onRequestClose={() => setOuvert(false)}>
        <View style={styles.panneau}>
          <Text style={styles.panneauTitre}>{label}</Text>
          <ScrollView style={styles.liste} showsVerticalScrollIndicator={false}>
            <Pressable style={styles.ligneOption} onPress={() => choisir(undefined)}>
              <Text style={[styles.ligneOptionTexte, valeur === undefined && styles.ligneOptionTexteActif]}>
                {libellePlaceholder}
              </Text>
              {valeur === undefined ? <CheckIcon size={18} color={couleurs.primary} /> : null}
            </Pressable>
            {options.map((option) => {
              const cle = cleDe(option);
              const actif = cle === cleSelectionnee;
              return (
                <Pressable key={cle} style={styles.ligneOption} onPress={() => choisir(option)}>
                  <Text style={[styles.ligneOptionTexte, actif && styles.ligneOptionTexteActif]} numberOfLines={1}>
                    {libelleDe(option)}
                  </Text>
                  {actif ? <CheckIcon size={18} color={couleurs.primary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable style={styles.boutonFermer} onPress={() => setOuvert(false)}>
            <Text style={styles.boutonFermerTexte}>Fermer</Text>
          </Pressable>
        </View>
      </AnimatedModal>
    </>
  );
}

const styles = StyleSheet.create({
  champ: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacements.base,
    paddingVertical: espacements.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: couleurs.border,
  },
  champLabel: {
    fontFamily: polices.bodySemiBold,
    fontSize: tailles.sm,
    color: couleurs.textPrimary,
  },
  champValeurLigne: { flexDirection: 'row', alignItems: 'center', gap: espacements.xs, flexShrink: 1, maxWidth: '60%' },
  champValeur: { fontFamily: polices.bodyMedium, fontSize: tailles.sm, color: couleurs.primary },
  champValeurPlaceholder: { color: couleurs.textTertiary },
  panneau: {
    width: '100%',
    backgroundColor: couleurs.surface,
    borderRadius: rayons.md,
    padding: espacements.base + 4,
  },
  panneauTitre: {
    fontFamily: polices.headingBold,
    fontSize: tailles.md,
    color: couleurs.textPrimary,
    marginBottom: espacements.sm,
  },
  liste: { maxHeight: 320 },
  ligneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: espacements.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: couleurs.border,
    gap: espacements.sm,
  },
  ligneOptionTexte: { fontFamily: polices.bodyMedium, fontSize: tailles.base - 1, color: couleurs.textPrimary, flexShrink: 1 },
  ligneOptionTexteActif: { fontFamily: polices.bodySemiBold, color: couleurs.primary },
  boutonFermer: { alignItems: 'center', paddingTop: espacements.base },
  boutonFermerTexte: { fontFamily: polices.bodySemiBold, fontSize: tailles.sm, color: couleurs.textSecondary },
});
