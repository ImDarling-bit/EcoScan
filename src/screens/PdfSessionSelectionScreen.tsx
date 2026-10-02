import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState } from '../components/EmptyState';
import { useDisqueStore } from '../store/useDisqueStore';
import { useSessionStore } from '../store/useSessionStore';
import { useEntrepriseStore } from '../store/useEntrepriseStore';
import { formaterLibelleSession } from '../db/sessions';
import { genererRapportSessions, type SessionAvecDisques } from '../services/pdf';
import { couleurs, espacements, polices, rayons, tailles } from '../theme';
import type { EntreprisesScreenProps } from '../navigation/types';

export function PdfSessionSelectionScreen({
  route,
  navigation,
}: EntreprisesScreenProps<'ExportPdfSessions'>): React.JSX.Element {
  const { entrepriseId, entrepriseNom } = route.params;
  const { sessions, chargerPourEntreprise: chargerSessions } = useSessionStore();
  const { disquesEntreprise, chargerPourEntreprise: chargerDisques } = useDisqueStore();
  const { entreprises, charger: chargerEntreprises } = useEntrepriseStore();
  const [selectionnees, setSelectionnees] = useState<Set<string>>(new Set());
  const [inclureAnnexes, setInclureAnnexes] = useState(false);
  const [generation, setGeneration] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      chargerSessions(entrepriseId);
      chargerDisques(entrepriseId);
      chargerEntreprises();
    }, [entrepriseId, chargerSessions, chargerDisques, chargerEntreprises]),
  );

  const nbDisquesParSession = useMemo(() => {
    const compteur = new Map<string, number>();
    disquesEntreprise.forEach((disque) => {
      compteur.set(disque.sessionId, (compteur.get(disque.sessionId) ?? 0) + 1);
    });
    return compteur;
  }, [disquesEntreprise]);

  const basculer = (sessionId: string) => {
    setSelectionnees((precedent) => {
      const suivant = new Set(precedent);
      if (suivant.has(sessionId)) {
        suivant.delete(sessionId);
      } else {
        suivant.add(sessionId);
      }
      return suivant;
    });
  };

  const genererEtOuvrir = async () => {
    const entreprise = entreprises.find((e) => e.id === entrepriseId);
    if (!entreprise || selectionnees.size === 0) {
      return;
    }
    setErreur(null);
    setGeneration(true);
    try {
      const sessionsAvecDisques: SessionAvecDisques[] = sessions
        .filter((session) => selectionnees.has(session.id))
        .map((session) => ({
          session,
          disques: disquesEntreprise.filter((disque) => disque.sessionId === session.id),
        }));

      const chemin = await genererRapportSessions(entreprise, sessionsAvecDisques, { inclureAnnexes });
      navigation.replace('ExportPdfApercu', { cheminFichier: chemin, entrepriseNom });
    } catch (error) {
      setErreur((error as Error).message);
    } finally {
      setGeneration(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Sélectionnez les sessions à inclure dans le PDF. Toutes les entrées enregistrées pour
        les sessions cochées seront listées de façon exhaustive.
      </Text>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const coche = selectionnees.has(item.id);
          const nb = nbDisquesParSession.get(item.id) ?? 0;
          return (
            <Pressable style={styles.ligne} onPress={() => basculer(item.id)}>
              <View style={[styles.case, coche && styles.caseCochee]}>
                {coche ? <Text style={styles.caseCocheeTexte}>✓</Text> : null}
              </View>
              <View style={styles.ligneTexte}>
                <Text style={styles.ligneTitre}>{formaterLibelleSession(item)}</Text>
                <Text style={styles.ligneSousTitre}>
                  {nb} disque{nb > 1 ? 's' : ''}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState titre="Aucune session" description="Scannez au moins un disque pour créer une session" />
        }
      />

      <Pressable style={styles.ligneOption} onPress={() => setInclureAnnexes((valeur) => !valeur)}>
        <View style={[styles.case, inclureAnnexes && styles.caseCochee]}>
          {inclureAnnexes ? <Text style={styles.caseCocheeTexte}>✓</Text> : null}
        </View>
        <View style={styles.ligneTexte}>
          <Text style={styles.ligneTitre}>Annexe détaillée par disque</Text>
          <Text style={styles.ligneSousTitre}>
            Ajoute une page par disque avec le texte brut scanné (P/N, WWN...)
          </Text>
        </View>
      </Pressable>

      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}

      <Pressable
        style={[styles.bouton, (selectionnees.size === 0 || generation) && styles.boutonDesactive]}
        disabled={selectionnees.size === 0 || generation}
        onPress={genererEtOuvrir}>
        {generation ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.boutonTexte}>
            Générer le PDF ({selectionnees.size} session{selectionnees.size > 1 ? 's' : ''})
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.background },
  instructions: {
    fontFamily: polices.bodyRegular,
    fontSize: tailles.sm,
    color: couleurs.textSecondary,
    padding: espacements.base,
    paddingBottom: espacements.sm,
  },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.surface,
    paddingHorizontal: espacements.base,
    paddingVertical: espacements.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: couleurs.border,
  },
  case: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: couleurs.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: espacements.md,
  },
  caseCochee: { backgroundColor: couleurs.primary, borderColor: couleurs.primary },
  caseCocheeTexte: { color: couleurs.textInverse, fontFamily: polices.headingBold, fontSize: tailles.sm },
  ligneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.surface,
    paddingHorizontal: espacements.base,
    paddingVertical: espacements.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: couleurs.border,
  },
  ligneTexte: { flex: 1 },
  ligneTitre: { fontFamily: polices.headingBold, fontSize: tailles.base - 1, color: couleurs.textPrimary },
  ligneSousTitre: { fontFamily: polices.bodyRegular, fontSize: tailles.sm, color: couleurs.textSecondary, marginTop: 2 },
  erreur: {
    fontFamily: polices.bodyMedium,
    color: couleurs.danger,
    textAlign: 'center',
    marginBottom: espacements.sm,
    fontSize: tailles.sm,
  },
  bouton: {
    margin: espacements.base,
    backgroundColor: couleurs.primary,
    paddingVertical: espacements.md + 2,
    borderRadius: rayons.input,
    alignItems: 'center',
  },
  boutonDesactive: { opacity: 0.5 },
  boutonTexte: { fontFamily: polices.headingBold, color: couleurs.textInverse, fontSize: tailles.base - 1 },
});
