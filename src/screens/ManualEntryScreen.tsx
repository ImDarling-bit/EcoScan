import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { obtenirDisque } from '../db/disques';
import { extraireChampsEtiquette, extraireInfosEtiquette } from '../services/ocr';
import { PrimaryButton } from '../components/PrimaryButton';
import { TypeDisqueSelector } from '../components/TypeDisqueSelector';
import { useDisqueStore } from '../store/useDisqueStore';
import { couleurs, espacements, polices, rayons, tailles } from '../theme';
import type { EntreprisesScreenProps } from '../navigation/types';
import type { TypeDisque } from '../types';

export function ManualEntryScreen({
  navigation,
  route,
}: EntreprisesScreenProps<'SaisieManuelle'>): React.JSX.Element {
  const { entrepriseId, entrepriseNom, prefill, disqueId } = route.params;
  const modeEdition = !!disqueId;
  const infosOcr = useMemo(
    () => (prefill?.rawText ? extraireInfosEtiquette(prefill.rawText) : null),
    [prefill?.rawText],
  );

  const { creer, modifier } = useDisqueStore();
  const [serialNumber, setSerialNumber] = useState(prefill?.serialNumber ?? '');
  const [capacity, setCapacity] = useState(infosOcr?.capacite ?? '');
  const [brand, setBrand] = useState(infosOcr?.marque ?? '');
  // Le type est choisi avant le scan (fiche entreprise), mais reste
  // corrigeable ici si besoin.
  const [type, setType] = useState<TypeDisque>(route.params.type);
  const [texteBrut, setTexteBrut] = useState<string | null>(prefill?.rawText ?? null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [chargementDisque, setChargementDisque] = useState(modeEdition);
  const [erreur, setErreur] = useState<string | null>(null);

  const champsOcr = useMemo(() => (texteBrut ? extraireChampsEtiquette(texteBrut) : []), [texteBrut]);

  // En mode édition, on recharge le disque depuis la base (pas seulement
  // depuis le store) : l'écran est aussi accessible depuis l'Historique, où
  // la liste des disques de cette entreprise n'est pas forcément en mémoire.
  useEffect(() => {
    if (!disqueId) {
      return;
    }
    let annule = false;
    (async () => {
      const disque = await obtenirDisque(disqueId);
      if (annule || !disque) {
        return;
      }
      setSerialNumber(disque.serialNumber);
      setCapacity(disque.capacity);
      setBrand(disque.brand);
      setType(disque.type);
      setTexteBrut(disque.rawText);
      setChargementDisque(false);
    })();
    return () => {
      annule = true;
    };
  }, [disqueId]);

  const formulaireValide = serialNumber.trim().length > 0 && capacity.trim().length > 0 && brand.trim().length > 0;

  const enregistrer = async () => {
    if (!formulaireValide) {
      setErreur('S/N, capacité et marque sont obligatoires.');
      return;
    }
    setErreur(null);
    setEnregistrement(true);
    try {
      if (disqueId) {
        await modifier(disqueId, { serialNumber, capacity, brand, type });
      } else {
        await creer({ serialNumber, capacity, brand, type, entrepriseId, rawText: prefill?.rawText ?? null });
      }
      navigation.goBack();
    } catch (error) {
      setErreur((error as Error).message);
    } finally {
      setEnregistrement(false);
    }
  };

  // Le bouton de confirmation vit dans le header (voir `AppHeader`) plutôt
  // qu'en bas du formulaire : plus visible, toujours accessible sans scroller.
  useLayoutEffect(() => {
    navigation.setOptions({
      title: modeEdition ? 'Modifier le disque' : 'Confirmer les informations',
      // eslint-disable-next-line react/no-unstable-nested-components -- requis par l'API `headerRight` de React Navigation, le composant rendu (`PrimaryButton`) est lui stable.
      headerRight: () => (
        <PrimaryButton
          label={modeEdition ? 'Enregistrer' : 'Destruction'}
          onPress={enregistrer}
          disabled={!formulaireValide || chargementDisque}
          chargement={enregistrement}
          taille="compact"
        />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, formulaireValide, enregistrement, chargementDisque, modeEdition, serialNumber, capacity, brand, type]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <Text style={styles.caption}>
          {modeEdition ? 'Modifiez les informations de ce disque' : 'Vérifiez les informations avant de confirmer la destruction'} —{' '}
          <Text style={styles.captionGras}>{entrepriseNom}</Text>
        </Text>

        <Text style={styles.label}>S/N (numéro de série) *</Text>
        <TextInput
          style={styles.input}
          value={serialNumber}
          onChangeText={setSerialNumber}
          placeholder="Ex : WCC4E1234567"
          placeholderTextColor={couleurs.textTertiary}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Type *</Text>
        <TypeDisqueSelector valeur={type} onChange={setType} />

        <Text style={styles.label}>Marque *</Text>
        <TextInput
          style={styles.input}
          value={brand}
          onChangeText={setBrand}
          placeholder="Ex : Seagate"
          placeholderTextColor={couleurs.textTertiary}
        />

        <Text style={styles.label}>Capacité *</Text>
        <TextInput
          style={styles.input}
          value={capacity}
          onChangeText={setCapacity}
          placeholder="Ex : 2 TB"
          placeholderTextColor={couleurs.textTertiary}
        />

        {champsOcr.length > 0 ? (
          <>
            <Text style={styles.label}>Informations lues sur l'étiquette</Text>
            <View style={styles.tableauOcr}>
              {champsOcr.map((champ) => (
                <View key={champ.label} style={styles.ligneChampOcr}>
                  <Text style={styles.champOcrLabel}>{champ.label}</Text>
                  <Text style={styles.champOcrValeur}>{champ.valeur}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {texteBrut ? (
          <>
            <Text style={styles.label}>Texte brut complet</Text>
            <Text style={styles.texteOcr}>{texteBrut}</Text>
          </>
        ) : null}

        {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.background },
  contenu: { padding: espacements.base },
  caption: {
    fontFamily: polices.bodyRegular,
    fontSize: tailles.sm,
    color: couleurs.textSecondary,
    marginBottom: espacements.sm,
  },
  captionGras: { fontFamily: polices.bodySemiBold, color: couleurs.textPrimary },
  label: {
    fontFamily: polices.bodySemiBold,
    fontSize: tailles.xs,
    color: couleurs.textSecondary,
    marginTop: espacements.base,
    marginBottom: espacements.xs + 2,
  },
  input: {
    borderWidth: 1,
    borderColor: couleurs.border,
    borderRadius: rayons.input,
    paddingHorizontal: espacements.md,
    paddingVertical: espacements.sm + 3,
    backgroundColor: couleurs.surface,
    fontFamily: polices.bodyRegular,
    fontSize: tailles.base - 1,
    color: couleurs.textPrimary,
  },
  tableauOcr: {
    backgroundColor: couleurs.surfaceMuted,
    borderRadius: rayons.sm,
    overflow: 'hidden',
  },
  ligneChampOcr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espacements.sm + 2,
    paddingVertical: espacements.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: couleurs.border,
  },
  champOcrLabel: { fontFamily: polices.bodySemiBold, fontSize: tailles.xs, color: couleurs.textSecondary },
  champOcrValeur: { fontFamily: polices.bodyMedium, fontSize: tailles.xs, color: couleurs.textPrimary },
  texteOcr: {
    fontFamily: polices.bodyRegular,
    fontSize: tailles.xs,
    color: couleurs.textSecondary,
    backgroundColor: couleurs.surfaceMuted,
    padding: espacements.sm + 2,
    borderRadius: rayons.sm,
    marginTop: espacements.sm,
  },
  erreur: { fontFamily: polices.bodyMedium, color: couleurs.danger, marginTop: espacements.base, fontSize: tailles.sm },
});
