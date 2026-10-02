import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { couleurs, espacements, polices, tailles } from '../theme';

interface Props {
  titre: string;
  description?: string;
}

export function EmptyState({ titre, description }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.titre}>{titre}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacements.xl,
    paddingTop: espacements.xxl + 24,
  },
  titre: {
    fontFamily: polices.headingBold,
    fontSize: tailles.md,
    color: couleurs.textSecondary,
    textAlign: 'center',
  },
  description: {
    fontFamily: polices.bodyRegular,
    fontSize: tailles.sm,
    color: couleurs.textTertiary,
    textAlign: 'center',
    marginTop: 6,
  },
});
