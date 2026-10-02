import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { couleurs, mise_en_page, polices, tailles } from '../theme';

const logo = require('../assets/logo-eco-taurus.png');

/**
 * Titre sur deux lignes (titre + accroche) pour un écran donné — à passer en
 * `options.headerTitle` (voir `AppHeader`). Utilisé pour l'écran d'accueil.
 */
export function TitreAvecSousTitre({ titre, sousTitre }: { titre: string; sousTitre: string }): React.JSX.Element {
  return (
    <View style={styles.blocTitre}>
      <Text style={styles.titreAvecSousTitre} numberOfLines={1}>
        {titre}
      </Text>
      <Text style={styles.sousTitre} numberOfLines={1}>
        {sousTitre}
      </Text>
    </View>
  );
}

/**
 * En-tête commun à tous les écrans (racines et empilés) : logo ECO TAURUS
 * sur les écrans racines, flèche retour sur les autres — voir le handoff
 * design (`design_handoff_hdd_traceability/README.md`, section "Header").
 */
export function AppHeader({ navigation, route, options, back }: NativeStackHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const titre = options.title ?? route.name;
  // Détourne `headerRight` (convention standard de React Navigation) pour
  // afficher une action à droite de ce header custom, ex: le bouton
  // "Destruction" de l'écran de confirmation.
  const droite = options.headerRight?.({ canGoBack: !!back });
  // Détourne aussi `headerTitle` (accepte une fonction dans React Navigation)
  // pour afficher un sous-titre sous le titre, ex: l'accroche de l'écran d'accueil.
  const titrePersonnalise =
    typeof options.headerTitle === 'function' ? options.headerTitle({ children: String(titre) }) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.contenu}>
        {back ? (
          <Pressable style={styles.retour} onPress={navigation.goBack} hitSlop={12}>
            <Text style={styles.fleche}>‹</Text>
          </Pressable>
        ) : (
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        )}
        {titrePersonnalise ?? (
          <Text style={styles.titre} numberOfLines={1}>
            {titre}
          </Text>
        )}
        {droite ?? (!back ? <View style={styles.espaceur} /> : null)}
      </View>
      <LinearGradient
        colors={[couleurs.primary, couleurs.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.filet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: couleurs.surface,
  },
  filet: { height: 3 },
  contenu: {
    minHeight: mise_en_page.hauteurEntete,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  logo: { width: 28, height: 28 },
  retour: { width: 28, alignItems: 'flex-start', justifyContent: 'center' },
  fleche: { fontSize: 26, color: couleurs.textPrimary, lineHeight: 26 },
  titre: {
    flex: 1,
    fontFamily: polices.headingExtraBold,
    fontSize: tailles.lg - 2,
    color: couleurs.textPrimary,
  },
  blocTitre: { flex: 1 },
  titreAvecSousTitre: {
    fontFamily: polices.headingExtraBold,
    fontSize: tailles.lg - 2,
    color: couleurs.textPrimary,
  },
  sousTitre: {
    fontFamily: polices.bodyRegular,
    fontSize: tailles.xs,
    color: couleurs.textSecondary,
    marginTop: 1,
  },
  espaceur: { width: 28 },
});
