import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { analyserPhotoDisque, usePhotoHauteResolution, ZONE_SCAN } from '../services/scan';
import { choisirNumeroSerie, extraireInfosEtiquette } from '../services/ocr';
import { usePermissionCamera } from '../services/permissions';
import { couleurs, espacements, polices, rayons, tailles } from '../theme';
import type { EntreprisesScreenProps } from '../navigation/types';
import type { ScanResult } from '../types';

export function ScanScreen({ navigation, route }: EntreprisesScreenProps<'Scan'>): React.JSX.Element {
  const { entrepriseId, entrepriseNom, type } = route.params;
  const device = useCameraDevice('back');
  const { accordee: permissionAccordee, peutDemander, demander } = usePermissionCamera();
  const photoOutput = usePhotoHauteResolution();
  const [resultat, setResultat] = useState<ScanResult | null>(null);
  const [analyseEnCours, setAnalyseEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!permissionAccordee && peutDemander) {
      demander();
    }
  }, [permissionAccordee, peutDemander, demander]);

  // Déclenché uniquement par le bouton "Scanner", une fois le disque bien
  // cadré : une seule photo haute résolution, analysée une seule fois
  // (codes-barres + OCR sur la même image). Rien ne se passe en continu.
  const scanner = async () => {
    setErreur(null);
    setAnalyseEnCours(true);
    try {
      const photo = await photoOutput.capturePhotoToFile({ flashMode: 'auto' }, {});
      const { codesBarres, rawText } = await analyserPhotoDisque(photo.filePath);

      if (codesBarres.length === 0 && !rawText.trim()) {
        setErreur("Rien n'a été détecté. Rapprochez-vous, stabilisez l'appareil et réessayez.");
        return;
      }

      const { serialNumber, fiable } = choisirNumeroSerie(codesBarres, rawText);
      setResultat({ serialNumber, fiable, rawText });
    } catch (error) {
      setErreur((error as Error).message);
    } finally {
      setAnalyseEnCours(false);
    }
  };

  const relancerScan = () => {
    setResultat(null);
    setErreur(null);
  };

  const confirmer = () => {
    if (!resultat) {
      return;
    }
    navigation.replace('SaisieManuelle', {
      entrepriseId,
      entrepriseNom,
      type,
      prefill: {
        serialNumber: resultat.serialNumber ?? '',
        rawText: resultat.rawText,
      },
    });
  };

  if (!permissionAccordee) {
    return (
      <View style={styles.centre}>
        <Text style={styles.texteInfo}>
          {peutDemander
            ? "L'accès à la caméra est nécessaire pour scanner un disque."
            : "L'accès à la caméra a été refusé. Autorisez-le depuis les réglages de l'application."}
        </Text>
        {peutDemander ? (
          <Pressable style={styles.boutonPrimaire} onPress={demander}>
            <Text style={styles.boutonPrimaireTexte}>Autoriser la caméra</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={styles.boutonSecondaire}
          onPress={() => navigation.navigate('SaisieManuelle', { entrepriseId, entrepriseNom, type })}>
          <Text style={styles.boutonSecondaireTexte}>Saisir manuellement</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centre}>
        <Text style={styles.texteInfo}>Aucune caméra disponible sur cet appareil.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!resultat}
        outputs={[photoOutput]}
      />

      <View style={styles.cadre} pointerEvents="none" />

      {!resultat ? (
        <View style={styles.bandeauInstructions}>
          {erreur ? <Text style={styles.erreurTexte}>{erreur}</Text> : (
            <Text style={styles.instructionsTexte}>
              Cadrez toute l'étiquette du disque, puis appuyez sur Scanner
            </Text>
          )}
          <Pressable
            style={[styles.boutonScanner, analyseEnCours && styles.boutonDesactive]}
            onPress={scanner}
            disabled={analyseEnCours}>
            {analyseEnCours ? (
              <ActivityIndicator color={couleurs.textInverse} />
            ) : (
              <Text style={styles.boutonScannerTexte}>Scanner</Text>
            )}
          </Pressable>
          <Pressable
            style={styles.lienSaisieManuelle}
            onPress={() => navigation.navigate('SaisieManuelle', { entrepriseId, entrepriseNom, type })}>
            <Text style={styles.lienSaisieManuelleTexte}>Saisie manuelle</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.panneauResultat}>
          <Text style={styles.panneauTitre}>Disque détecté</Text>
          {!resultat.fiable ? (
            <Text style={styles.avertissement}>
              ⚠️ Information non confirmée par recoupement — vérifiez-la avant de continuer
            </Text>
          ) : null}
          <Text style={styles.panneauLabel}>S/N</Text>
          <Text style={styles.panneauValeur}>{resultat.serialNumber}</Text>
          {(() => {
            const { marque, capacite } = extraireInfosEtiquette(resultat.rawText ?? '');
            if (!marque && !capacite) {
              return null;
            }
            return (
              <Text style={styles.panneauSousTitre}>
                {[marque, capacite].filter(Boolean).join(' · ')}
              </Text>
            );
          })()}
          <View style={styles.panneauActions}>
            <Pressable style={styles.boutonSecondaire} onPress={relancerScan}>
              <Text style={styles.boutonSecondaireTexte}>Rescanner</Text>
            </Pressable>
            <Pressable style={styles.boutonPrimaire} onPress={confirmer}>
              <Text style={styles.boutonPrimaireTexte}>Continuer</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacements.lg,
    gap: espacements.md,
    backgroundColor: couleurs.background,
  },
  texteInfo: {
    fontFamily: polices.bodyRegular,
    fontSize: tailles.base - 1,
    color: couleurs.textSecondary,
    textAlign: 'center',
  },
  // Purement visuel : guide l'utilisateur pour cadrer l'étiquette entière
  // avant d'appuyer sur Scanner (voir ZONE_SCAN dans src/services/scan.ts).
  cadre: {
    position: 'absolute',
    top: `${ZONE_SCAN.y * 100}%`,
    left: `${ZONE_SCAN.x * 100}%`,
    width: `${ZONE_SCAN.width * 100}%`,
    height: `${ZONE_SCAN.height * 100}%`,
    borderWidth: 2,
    borderColor: couleurs.surface,
    borderRadius: rayons.lg,
  },
  bandeauInstructions: {
    position: 'absolute',
    bottom: espacements.xl,
    left: espacements.base,
    right: espacements.base,
    alignItems: 'center',
    gap: espacements.md,
  },
  instructionsTexte: {
    fontFamily: polices.bodyRegular,
    color: couleurs.surface,
    fontSize: tailles.sm + 1,
    textAlign: 'center',
    backgroundColor: 'rgba(27, 36, 48, 0.6)',
    paddingHorizontal: espacements.md,
    paddingVertical: espacements.sm,
    borderRadius: rayons.sm,
  },
  erreurTexte: {
    fontFamily: polices.bodyRegular,
    color: couleurs.surface,
    fontSize: tailles.sm + 1,
    textAlign: 'center',
    backgroundColor: 'rgba(179, 67, 47, 0.9)',
    paddingHorizontal: espacements.md,
    paddingVertical: espacements.sm,
    borderRadius: rayons.sm,
  },
  boutonScanner: {
    backgroundColor: couleurs.primary,
    paddingHorizontal: espacements.xl,
    paddingVertical: espacements.md + 4,
    borderRadius: 30,
    minWidth: 160,
    alignItems: 'center',
  },
  boutonDesactive: { opacity: 0.6 },
  boutonScannerTexte: { fontFamily: polices.headingBold, color: couleurs.textInverse, fontSize: tailles.md },
  lienSaisieManuelle: { paddingVertical: espacements.xs + 2 },
  lienSaisieManuelleTexte: {
    fontFamily: polices.bodySemiBold,
    color: couleurs.surface,
    fontSize: tailles.sm,
    textDecorationLine: 'underline',
  },
  panneauResultat: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: couleurs.surface,
    borderTopLeftRadius: rayons.lg,
    borderTopRightRadius: rayons.lg,
    padding: espacements.base + 4,
  },
  panneauTitre: {
    fontFamily: polices.headingExtraBold,
    fontSize: tailles.md,
    color: couleurs.textPrimary,
    marginBottom: espacements.md,
  },
  avertissement: {
    fontFamily: polices.bodyMedium,
    fontSize: tailles.sm,
    color: couleurs.warningText,
    backgroundColor: couleurs.warningLight,
    paddingHorizontal: espacements.sm + 2,
    paddingVertical: espacements.sm,
    borderRadius: rayons.sm,
    marginBottom: espacements.md,
  },
  panneauLabel: {
    fontFamily: polices.bodySemiBold,
    fontSize: tailles.xs,
    color: couleurs.textSecondary,
    marginTop: espacements.sm,
  },
  panneauValeur: { fontFamily: polices.headingExtraBold, fontSize: tailles.lg - 1, color: couleurs.textPrimary },
  panneauSousTitre: {
    fontFamily: polices.bodySemiBold,
    fontSize: tailles.base - 1,
    color: couleurs.primary,
    marginTop: espacements.xs,
  },
  panneauActions: { flexDirection: 'row', gap: espacements.md, marginTop: espacements.lg },
  boutonPrimaire: {
    flex: 1,
    backgroundColor: couleurs.primary,
    paddingVertical: espacements.md + 2,
    borderRadius: rayons.input,
    alignItems: 'center',
  },
  boutonPrimaireTexte: { fontFamily: polices.headingBold, color: couleurs.textInverse, fontSize: tailles.sm + 1 },
  boutonSecondaire: {
    flex: 1,
    backgroundColor: couleurs.surfaceMuted,
    paddingVertical: espacements.md + 2,
    borderRadius: rayons.input,
    alignItems: 'center',
  },
  boutonSecondaireTexte: { fontFamily: polices.headingBold, color: couleurs.textSecondary, fontSize: tailles.sm + 1 },
});
