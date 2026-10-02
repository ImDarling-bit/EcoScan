import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackHeaderProps } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppHeader, TitreAvecSousTitre } from '../components/AppHeader';
import { BuildingIcon } from '../components/icons/BuildingIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { EntrepriseListScreen } from '../screens/EntrepriseListScreen';
import { EntrepriseDetailScreen } from '../screens/EntrepriseDetailScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ManualEntryScreen } from '../screens/ManualEntryScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { PdfSessionSelectionScreen } from '../screens/PdfSessionSelectionScreen';
import { PdfPreviewScreen } from '../screens/PdfPreviewScreen';
import { couleurs, polices, tailles } from '../theme';
import type { EntreprisesStackParamList, HistoriqueStackParamList, RootTabParamList } from './types';

const EntreprisesStack = createNativeStackNavigator<EntreprisesStackParamList>();
const HistoriqueStack = createNativeStackNavigator<HistoriqueStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// Références stables (définies hors composant) pour les options de rendu de
// la navigation : évite de recréer ces fonctions à chaque rendu du parent.
function rendreHeader(props: NativeStackHeaderProps): React.JSX.Element {
  return <AppHeader {...props} />;
}

function rendreIconeEntreprises({ color, size }: { color: string; size: number }): React.JSX.Element {
  return <BuildingIcon size={size} color={color} />;
}

function rendreIconeHistorique({ color, size }: { color: string; size: number }): React.JSX.Element {
  return <ClockIcon size={size} color={color} />;
}

function rendreTitreAccueil(): React.JSX.Element {
  return <TitreAvecSousTitre titre="EcoScan" sousTitre="Scan et suivi de destruction de disques" />;
}

function optionsEntrepriseDetail({
  route,
}: {
  route: { params: EntreprisesStackParamList['EntrepriseDetail'] };
}): { title: string } {
  return { title: route.params.nom };
}

function EntreprisesNavigator(): React.JSX.Element {
  return (
    <EntreprisesStack.Navigator screenOptions={{ header: rendreHeader }}>
      <EntreprisesStack.Screen
        name="EntrepriseListe"
        component={EntrepriseListScreen}
        options={{ title: 'EcoScan', headerTitle: rendreTitreAccueil }}
      />
      <EntreprisesStack.Screen
        name="EntrepriseDetail"
        component={EntrepriseDetailScreen}
        options={optionsEntrepriseDetail}
      />
      <EntreprisesStack.Screen
        name="Scan"
        component={ScanScreen}
        options={{ title: 'Scanner un disque', headerShown: false }}
      />
      <EntreprisesStack.Screen
        name="SaisieManuelle"
        component={ManualEntryScreen}
        options={{ title: 'Confirmer les informations' }}
      />
      <EntreprisesStack.Screen
        name="ExportPdfSessions"
        component={PdfSessionSelectionScreen}
        options={{ title: 'Exporter en PDF' }}
      />
      <EntreprisesStack.Screen
        name="ExportPdfApercu"
        component={PdfPreviewScreen}
        options={{ title: 'Aperçu du PDF' }}
      />
    </EntreprisesStack.Navigator>
  );
}

function HistoriqueNavigator(): React.JSX.Element {
  return (
    <HistoriqueStack.Navigator screenOptions={{ header: rendreHeader }}>
      <HistoriqueStack.Screen name="Historique" component={HistoryScreen} options={{ title: 'Historique' }} />
    </HistoriqueStack.Navigator>
  );
}

export function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: couleurs.primary,
          tabBarInactiveTintColor: couleurs.textTertiary,
          tabBarStyle: styles.barreOnglets,
          tabBarLabelStyle: styles.libelleOnglet,
        }}>
        <Tab.Screen
          name="EntreprisesTab"
          component={EntreprisesNavigator}
          options={{ title: 'Entreprises', tabBarIcon: rendreIconeEntreprises }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              // Un tap sur l'onglet Entreprises revient toujours à la liste.
              navigation.navigate('EntreprisesTab', { screen: 'EntrepriseListe' });
            },
          })}
        />
        <Tab.Screen
          name="HistoriqueTab"
          component={HistoriqueNavigator}
          options={{ title: 'Historique', tabBarIcon: rendreIconeHistorique }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  barreOnglets: {
    height: 72,
    backgroundColor: couleurs.surface,
    borderTopColor: couleurs.border,
  },
  libelleOnglet: {
    fontFamily: polices.bodySemiBold,
    fontSize: tailles.xs - 1,
  },
});
