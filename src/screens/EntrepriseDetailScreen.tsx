import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AnimatedModal } from '../components/AnimatedModal';
import { DisqueListItem } from '../components/DisqueListItem';
import { EmptyState } from '../components/EmptyState';
import { FadeInItem } from '../components/FadeInItem';
import { PrimaryButton } from '../components/PrimaryButton';
import { TypeDisqueSelector } from '../components/TypeDisqueSelector';
import { CameraIcon } from '../components/icons/CameraIcon';
import { FilePdfIcon } from '../components/icons/FilePdfIcon';
import { useDisqueStore } from '../store/useDisqueStore';
import { useSessionStore } from '../store/useSessionStore';
import { formaterLibelleSession } from '../db/sessions';
import { couleurs, espacements, ombres, polices, rayons, tailles } from '../theme';
import type { EntreprisesScreenProps } from '../navigation/types';
import type { Disque, TypeDisque } from '../types';

interface SectionSession {
  title: string;
  sessionId: string;
  data: Disque[];
}

// Références stables (hors composant) pour les icônes des PrimaryButton —
// évite de recréer une fonction à chaque rendu (react/no-unstable-nested-components).
function rendreIconeScan(couleur: string): React.JSX.Element {
  return <CameraIcon size={18} color={couleur} />;
}
function rendreIconePdf(couleur: string): React.JSX.Element {
  return <FilePdfIcon size={18} color={couleur} />;
}

export function EntrepriseDetailScreen({
  route,
  navigation,
}: EntreprisesScreenProps<'EntrepriseDetail'>): React.JSX.Element {
  const { entrepriseId, nom } = route.params;
  const { disquesEntreprise, chargement, chargerPourEntreprise, supprimer } = useDisqueStore();
  const { sessions, creerNouvelleSession, chargerPourEntreprise: chargerSessions } = useSessionStore();
  const [type, setType] = useState<TypeDisque>('HDD');
  const [popupTypeVisible, setPopupTypeVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      chargerPourEntreprise(entrepriseId);
      chargerSessions(entrepriseId);
    }, [entrepriseId, chargerPourEntreprise, chargerSessions]),
  );

  const sections = useMemo<SectionSession[]>(
    () =>
      sessions.map((session) => ({
        title: formaterLibelleSession(session),
        sessionId: session.id,
        data: disquesEntreprise.filter((disque) => disque.sessionId === session.id),
      })),
    [sessions, disquesEntreprise],
  );

  const rafraichir = () => {
    chargerPourEntreprise(entrepriseId);
    chargerSessions(entrepriseId);
  };

  const ouvrirEdition = (disque: Disque) => {
    navigation.navigate('SaisieManuelle', {
      entrepriseId,
      entrepriseNom: nom,
      type: disque.type,
      disqueId: disque.id,
    });
  };

  const demanderSuppression = (disque: Disque) => {
    Alert.alert('Supprimer ce disque ?', `SN ${disque.serialNumber} sera définitivement supprimé.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => supprimer(disque.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.ligneCta}>
        <PrimaryButton
          label="Scanner un disque"
          onPress={() => setPopupTypeVisible(true)}
          icone={rendreIconeScan}
          style={styles.ctaFlex}
        />
        <PrimaryButton
          label="Exporter PDF"
          variant="outline"
          onPress={() => navigation.navigate('ExportPdfSessions', { entrepriseId, entrepriseNom: nom })}
          icone={rendreIconePdf}
          style={styles.ctaFlex}
        />
      </View>

      <View style={styles.ligneEnTeteListe}>
        <Text style={styles.enTeteListe}>Disques associés ({disquesEntreprise.length})</Text>
        <Pressable onPress={() => creerNouvelleSession(entrepriseId)} hitSlop={8}>
          <Text style={styles.lienNouvelleSessionTexte}>+ Nouvelle session</Text>
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FadeInItem index={index}>
            <DisqueListItem disque={item} onEdit={ouvrirEdition} onDelete={demanderSuppression} />
          </FadeInItem>
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.enTeteSection}>{section.title}</Text>
        )}
        stickySectionHeadersEnabled={false}
        refreshing={chargement}
        onRefresh={rafraichir}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={
          !chargement ? (
            <EmptyState
              titre="Aucun disque enregistré"
              description="Scannez ou saisissez un disque pour cette entreprise"
            />
          ) : undefined
        }
      />

      <Pressable
        style={styles.lienSaisieManuelle}
        onPress={() => navigation.navigate('SaisieManuelle', { entrepriseId, entrepriseNom: nom, type })}>
        <Text style={styles.lienSaisieManuelleTexte}>Saisir manuellement sans scan</Text>
      </Pressable>

      <AnimatedModal visible={popupTypeVisible} onRequestClose={() => setPopupTypeVisible(false)}>
        <View style={styles.modalContenu}>
          <Text style={styles.modalTitre}>Type de disque</Text>
          <TypeDisqueSelector valeur={type} onChange={setType} />
          <View style={styles.modalActions}>
            <Pressable style={styles.modalBoutonAnnuler} onPress={() => setPopupTypeVisible(false)}>
              <Text style={styles.modalBoutonTexteAnnuler}>Annuler</Text>
            </Pressable>
            <PrimaryButton
              label="Scanner"
              taille="compact"
              onPress={() => {
                setPopupTypeVisible(false);
                navigation.navigate('Scan', { entrepriseId, entrepriseNom: nom, type });
              }}
            />
          </View>
        </View>
      </AnimatedModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.background },
  ligneCta: {
    flexDirection: 'row',
    gap: espacements.sm,
    marginHorizontal: espacements.base,
    marginTop: espacements.sm,
    marginBottom: espacements.md,
  },
  ctaFlex: { flex: 1 },
  ligneEnTeteListe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacements.base,
    marginBottom: espacements.sm,
  },
  lienNouvelleSessionTexte: {
    fontFamily: polices.bodySemiBold,
    color: couleurs.primary,
    fontSize: tailles.xs + 1,
  },
  enTeteListe: {
    fontFamily: polices.headingBold,
    fontSize: tailles.sm + 1,
    color: couleurs.textPrimary,
  },
  liste: { paddingHorizontal: espacements.base, paddingBottom: espacements.base, gap: espacements.sm },
  enTeteSection: {
    fontFamily: polices.bodySemiBold,
    fontSize: tailles.xs,
    color: couleurs.textTertiary,
    textTransform: 'uppercase',
    paddingVertical: espacements.sm,
  },
  lienSaisieManuelle: {
    alignItems: 'center',
    paddingVertical: espacements.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: couleurs.border,
    backgroundColor: couleurs.surface,
  },
  lienSaisieManuelleTexte: {
    fontFamily: polices.bodySemiBold,
    color: couleurs.textSecondary,
    fontSize: tailles.sm,
    textDecorationLine: 'underline',
  },
  modalContenu: {
    width: '100%',
    backgroundColor: couleurs.surface,
    borderRadius: rayons.md,
    padding: espacements.base + 4,
    ...ombres.lg,
  },
  modalTitre: {
    fontFamily: polices.headingBold,
    fontSize: tailles.md,
    color: couleurs.textPrimary,
    marginBottom: espacements.md,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: espacements.base,
    gap: espacements.sm,
  },
  modalBoutonAnnuler: { paddingHorizontal: espacements.base, paddingVertical: espacements.sm + 2, borderRadius: rayons.sm },
  modalBoutonTexteAnnuler: { fontFamily: polices.bodySemiBold, color: couleurs.textSecondary, fontSize: tailles.xs + 1 },
});
