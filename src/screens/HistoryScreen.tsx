import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { DisqueListItem } from '../components/DisqueListItem';
import { EmptyState } from '../components/EmptyState';
import { FilterDropdown } from '../components/FilterDropdown';
import { SearchBar } from '../components/SearchBar';
import { useDisqueStore } from '../store/useDisqueStore';
import { useEntrepriseStore } from '../store/useEntrepriseStore';
import { couleurs, espacements, ombres, polices, rayons, tailles } from '../theme';
import type { RootTabParamList } from '../navigation/types';
import type { Disque, Entreprise, TypeDisque } from '../types';

const TYPES: TypeDisque[] = ['HDD', 'SSD', 'NVMe'];

interface Periode {
  jours: number;
  libelle: string;
}

const PERIODES: Periode[] = [
  { jours: 7, libelle: '7 derniers jours' },
  { jours: 30, libelle: '30 derniers jours' },
  { jours: 90, libelle: '90 derniers jours' },
];

export function HistoryScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const { historique, chargement, chargerHistorique, supprimer } = useDisqueStore();
  const { entreprises, charger: chargerEntreprises } = useEntrepriseStore();

  // On filtre par entreprise sélectionnée (son id), pas par son nom : deux
  // entreprises différentes peuvent porter le même nom, un filtre basé sur
  // le nom serait ambigu (et cassait le rendu des chips : clés dupliquées).
  const [entrepriseSelectionnee, setEntrepriseSelectionnee] = useState<Entreprise | undefined>(undefined);
  const [type, setType] = useState<TypeDisque | undefined>(undefined);
  const [periode, setPeriode] = useState<Periode | undefined>(undefined);
  const [brand, setBrand] = useState('');

  const unFiltreActif = !!entrepriseSelectionnee || !!type || !!periode || !!brand.trim();

  // Affiché sur chaque carte (le filtre entreprise n'est pas toujours actif).
  const nomParEntrepriseId = useMemo(
    () => new Map(entreprises.map((entreprise) => [entreprise.id, entreprise.nom])),
    [entreprises],
  );

  const reinitialiserFiltres = () => {
    setEntrepriseSelectionnee(undefined);
    setType(undefined);
    setPeriode(undefined);
    setBrand('');
  };

  useEffect(() => {
    chargerEntreprises();
  }, [chargerEntreprises]);

  const ouvrirEdition = (disque: Disque) => {
    navigation.navigate('EntreprisesTab', {
      screen: 'SaisieManuelle',
      params: {
        entrepriseId: disque.entrepriseId,
        entrepriseNom: nomParEntrepriseId.get(disque.entrepriseId) ?? '',
        type: disque.type,
        disqueId: disque.id,
      },
    });
  };

  const demanderSuppression = (disque: Disque) => {
    Alert.alert('Supprimer ce disque ?', `SN ${disque.serialNumber} sera définitivement supprimé.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => supprimer(disque.id) },
    ]);
  };

  useEffect(() => {
    chargerHistorique({
      entrepriseId: entrepriseSelectionnee?.id,
      type,
      brand: brand.trim() || undefined,
      dateDebut: periode ? new Date(Date.now() - periode.jours * 24 * 60 * 60 * 1000).toISOString() : undefined,
    });
  }, [entrepriseSelectionnee, type, periode, brand, chargerHistorique]);

  return (
    <View style={styles.container}>
      <FlatList
        data={historique}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DisqueListItem
            disque={item}
            entrepriseNom={nomParEntrepriseId.get(item.entrepriseId)}
            onEdit={ouvrirEdition}
            onDelete={demanderSuppression}
          />
        )}
        contentContainerStyle={styles.liste}
        refreshing={chargement}
        onRefresh={() =>
          chargerHistorique({
            entrepriseId: entrepriseSelectionnee?.id,
            type,
            brand: brand.trim() || undefined,
            dateDebut: periode
              ? new Date(Date.now() - periode.jours * 24 * 60 * 60 * 1000).toISOString()
              : undefined,
          })
        }
        ListHeaderComponent={
          <View style={styles.carteFiltres}>
            <View style={styles.ligneEnteteFiltres}>
              <Text style={styles.compteur}>
                {historique.length} résultat{historique.length > 1 ? 's' : ''}
              </Text>
              {unFiltreActif ? (
                <Pressable style={styles.pilleReinitialiser} onPress={reinitialiserFiltres} hitSlop={6}>
                  <Text style={styles.pilleReinitialiserTexte}>Réinitialiser</Text>
                </Pressable>
              ) : null}
            </View>

            <SearchBar value={brand} onChangeText={setBrand} placeholder="Filtrer par marque" />

            <FilterDropdown
              label="Entreprise"
              options={entreprises}
              valeur={entrepriseSelectionnee}
              onChange={setEntrepriseSelectionnee}
              getKey={(entreprise) => entreprise.id}
              getLabel={(entreprise) => entreprise.nom}
              libellePlaceholder="Toutes les entreprises"
            />
            <FilterDropdown
              label="Type"
              options={TYPES}
              valeur={type}
              onChange={setType}
              libellePlaceholder="Tous les types"
            />
            <FilterDropdown
              label="Période"
              options={PERIODES}
              valeur={periode}
              onChange={setPeriode}
              getKey={(p) => String(p.jours)}
              getLabel={(p) => p.libelle}
              libellePlaceholder="Toute la période"
            />
          </View>
        }
        ListEmptyComponent={
          !chargement ? (
            <EmptyState
              titre="Aucun résultat"
              description={unFiltreActif ? 'Aucun disque ne correspond à ces filtres.' : 'Aucun disque enregistré pour le moment.'}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.background },
  // Pas de marginHorizontal ici : le padding horizontal du FlatList
  // (`styles.liste`) s'applique déjà au header comme aux cartes de la liste,
  // ce qui garde un alignement identique entre les deux.
  carteFiltres: {
    backgroundColor: couleurs.surface,
    borderRadius: rayons.lg,
    borderWidth: 1,
    borderColor: couleurs.border,
    marginTop: espacements.sm,
    marginBottom: espacements.base,
    paddingBottom: espacements.md,
    ...ombres.sm,
  },
  ligneEnteteFiltres: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacements.base,
    paddingTop: espacements.md,
  },
  compteur: {
    fontFamily: polices.headingBold,
    fontSize: tailles.sm + 1,
    color: couleurs.textPrimary,
  },
  pilleReinitialiser: {
    paddingHorizontal: espacements.sm + 2,
    paddingVertical: 5,
    borderRadius: rayons.pill,
    backgroundColor: couleurs.dangerLight,
  },
  pilleReinitialiserTexte: {
    fontFamily: polices.bodySemiBold,
    fontSize: tailles.xs,
    color: couleurs.danger,
  },
  liste: { paddingHorizontal: espacements.base, gap: espacements.sm, paddingBottom: espacements.base },
});
