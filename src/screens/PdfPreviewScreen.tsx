import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Share, { Social } from 'react-native-share';
import { PrimaryButton } from '../components/PrimaryButton';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { couleurs, espacements, polices, tailles } from '../theme';
import type { EntreprisesScreenProps } from '../navigation/types';

function rendreIconeEnveloppe(couleur: string): React.JSX.Element {
  return <EnvelopeIcon size={18} color={couleur} />;
}
function rendreIconeTelechargement(couleur: string): React.JSX.Element {
  return <DownloadIcon size={18} color={couleur} />;
}

// Le type `filedescriptor` exposé par react-native-blob-util pointe vers un
// module `./types` sans déclaration TS résolvable — on retype localement la
// forme exacte attendue côté natif (voir ReactNativeBlobUtilMediaCollection.java).
interface DescripteurFichierMediaStore {
  name: string;
  parentFolder: string;
  mimeType: string;
}

export function PdfPreviewScreen({ route }: EntreprisesScreenProps<'ExportPdfApercu'>): React.JSX.Element {
  const { cheminFichier, entrepriseNom } = route.params;
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const nomFichier = `certificat-destruction-${entrepriseNom}`.replace(/[^a-z0-9-]+/gi, '-');

  const envoyerParMail = async () => {
    try {
      await Share.shareSingle({
        social: Social.Email,
        url: `file://${cheminFichier}`,
        type: 'application/pdf',
        filename: nomFichier,
        subject: `Certificat de destruction — ${entrepriseNom}`,
        message: `Veuillez trouver ci-joint le certificat de destruction pour ${entrepriseNom}.`,
      });
    } catch {
      // Aucune app mail disponible ou envoi annulé par l'utilisateur : rien à signaler.
    }
  };

  const enregistrerDansTelechargements = async () => {
    setEnregistrement(true);
    try {
      const filedata: DescripteurFichierMediaStore = {
        name: `${nomFichier}.pdf`,
        parentFolder: '',
        mimeType: 'application/pdf',
      };
      await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(filedata, 'Download', cheminFichier);
      Alert.alert('Enregistré', 'Le PDF a été ajouté à vos téléchargements.');
    } catch (error) {
      Alert.alert('Échec de l\'enregistrement', (error as Error).message);
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri: `file://${cheminFichier}` }}
        style={styles.pdf}
        onError={(error) => setErreur(String(error))}
      />
      {erreur ? <Text style={styles.erreur}>Impossible d'afficher le PDF : {erreur}</Text> : null}
      <View style={styles.barreActions}>
        <PrimaryButton
          label="Envoyer par mail"
          variant="outline"
          onPress={envoyerParMail}
          icone={rendreIconeEnveloppe}
          style={styles.boutonFlex}
        />
        <PrimaryButton
          label="Enregistrer"
          onPress={enregistrerDansTelechargements}
          chargement={enregistrement}
          icone={rendreIconeTelechargement}
          style={styles.boutonFlex}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.background },
  pdf: { flex: 1 },
  erreur: {
    fontFamily: polices.bodyMedium,
    color: couleurs.danger,
    textAlign: 'center',
    padding: espacements.md,
    fontSize: tailles.sm,
  },
  barreActions: {
    flexDirection: 'row',
    gap: espacements.sm,
    padding: espacements.base,
  },
  boutonFlex: { flex: 1 },
});
