import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { AnimatedModal } from '../components/AnimatedModal';
import { EntrepriseListItem } from '../components/EntrepriseListItem';
import { FadeInItem } from '../components/FadeInItem';
import { PrimaryButton } from '../components/PrimaryButton';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { useEntrepriseStore } from '../store/useEntrepriseStore';
import { couleurs, espacements, ombres, polices, rayons, tailles } from '../theme';
import type { EntreprisesScreenProps } from '../navigation/types';
import type { Entreprise } from '../types';

export function EntrepriseListScreen({ navigation }: EntreprisesScreenProps<'EntrepriseListe'>): React.JSX.Element {
  const { entreprises, chargement, charger, creer, modifier, supprimer } = useEntrepriseStore();
  const [recherche, setRecherche] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [nouveauNom, setNouveauNom] = useState('');
  const [erreurModal, setErreurModal] = useState<string | null>(null);
  // Présente uniquement en mode renommage : l'entreprise éditée par la modale.
  const [entrepriseEnEdition, setEntrepriseEnEdition] = useState<Entreprise | null>(null);

  const fabOpacite = useSharedValue(0);
  const fabEchelle = useSharedValue(0.5);
  useEffect(() => {
    fabOpacite.value = withDelay(150, withSpring(1));
    fabEchelle.value = withDelay(150, withSpring(1));
  }, [fabOpacite, fabEchelle]);
  const fabStyleAnime = useAnimatedStyle(() => ({
    opacity: fabOpacite.value,
    transform: [{ scale: fabEchelle.value }],
  }));

  useFocusEffect(
    useCallback(() => {
      charger(recherche);
      // On ne veut recharger qu'à l'entrée sur l'écran, pas à chaque frappe.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    const handle = setTimeout(() => charger(recherche), 250);
    return () => clearTimeout(handle);
  }, [recherche, charger]);

  const ouvrirEntreprise = (entreprise: Entreprise) => {
    navigation.navigate('EntrepriseDetail', { entrepriseId: entreprise.id, nom: entreprise.nom });
  };

  const fermerModal = () => {
    setModalVisible(false);
    setNouveauNom('');
    setErreurModal(null);
    setEntrepriseEnEdition(null);
  };

  const ouvrirCreation = () => {
    setEntrepriseEnEdition(null);
    setNouveauNom('');
    setErreurModal(null);
    setModalVisible(true);
  };

  const ouvrirEdition = (entreprise: Entreprise) => {
    setEntrepriseEnEdition(entreprise);
    setNouveauNom(entreprise.nom);
    setErreurModal(null);
    setModalVisible(true);
  };

  const confirmerModal = async () => {
    if (!nouveauNom.trim()) {
      return;
    }
    setErreurModal(null);
    try {
      if (entrepriseEnEdition) {
        await modifier(entrepriseEnEdition.id, nouveauNom);
      } else {
        await creer({ nom: nouveauNom });
      }
      fermerModal();
    } catch (error) {
      setErreurModal((error as Error).message);
    }
  };

  const demanderSuppression = (entreprise: Entreprise) => {
    Alert.alert(
      'Supprimer cette entreprise ?',
      `« ${entreprise.nom} » et tous ses disques associés seront définitivement supprimés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => supprimer(entreprise.id) },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>
        {entreprises.length} entreprise{entreprises.length > 1 ? 's' : ''} suivie
        {entreprises.length > 1 ? 's' : ''}
      </Text>
      <SearchBar value={recherche} onChangeText={setRecherche} placeholder="Rechercher une entreprise" />
      <FlatList
        data={entreprises}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FadeInItem index={index}>
            <EntrepriseListItem
              entreprise={item}
              onPress={ouvrirEntreprise}
              onEdit={ouvrirEdition}
              onDelete={demanderSuppression}
            />
          </FadeInItem>
        )}
        contentContainerStyle={styles.liste}
        refreshing={chargement}
        onRefresh={() => charger(recherche)}
        ListEmptyComponent={
          !chargement ? (
            <EmptyState
              titre="Aucune entreprise"
              description="Créez votre première entreprise avec le bouton +"
            />
          ) : undefined
        }
      />

      <Animated.View style={[styles.fabConteneur, fabStyleAnime]}>
        <Pressable onPress={ouvrirCreation}>
          <LinearGradient
            colors={[couleurs.primary, couleurs.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}>
            <Text style={styles.fabTexte}>+</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <AnimatedModal visible={modalVisible} onRequestClose={fermerModal}>
        <View style={styles.modalContenu}>
          <Text style={styles.modalTitre}>{entrepriseEnEdition ? "Renommer l'entreprise" : 'Nouvelle entreprise'}</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Nom de l'entreprise"
            value={nouveauNom}
            onChangeText={setNouveauNom}
            autoFocus
          />
          {erreurModal ? <Text style={styles.modalErreur}>{erreurModal}</Text> : null}
          <View style={styles.modalActions}>
            <Pressable style={styles.modalBoutonAnnuler} onPress={fermerModal}>
              <Text style={styles.modalBoutonTexteAnnuler}>Annuler</Text>
            </Pressable>
            <PrimaryButton
              label={entrepriseEnEdition ? 'Enregistrer' : 'Créer'}
              onPress={confirmerModal}
              taille="compact"
            />
          </View>
        </View>
      </AnimatedModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.background },
  caption: {
    fontFamily: polices.bodyRegular,
    fontSize: tailles.sm,
    color: couleurs.textSecondary,
    paddingHorizontal: espacements.base,
    paddingTop: espacements.sm,
  },
  // paddingBottom généreux : le FAB flotte par-dessus la liste (position
  // absolute), sans cette marge sa dernière carte serait masquée derrière.
  liste: {
    padding: espacements.base,
    paddingTop: espacements.sm,
    paddingBottom: espacements.base + 56 + espacements.lg,
    gap: espacements.sm,
  },
  fabConteneur: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    ...ombres.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabTexte: { color: couleurs.textInverse, fontSize: 28, lineHeight: 30 },
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
  modalInput: {
    borderWidth: 1,
    borderColor: couleurs.border,
    borderRadius: rayons.input,
    paddingHorizontal: espacements.md,
    paddingVertical: espacements.sm + 2,
    fontFamily: polices.bodyRegular,
    fontSize: tailles.base - 1,
    color: couleurs.textPrimary,
  },
  modalErreur: {
    fontFamily: polices.bodyMedium,
    color: couleurs.danger,
    fontSize: tailles.xs + 1,
    marginTop: espacements.sm,
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
