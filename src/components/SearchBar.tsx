import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SearchIcon } from './icons/SearchIcon';
import { couleurs, espacements, ombres, polices, rayons, tailles } from '../theme';

interface Props {
  value: string;
  onChangeText: (texte: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <SearchIcon size={18} color={couleurs.textTertiary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Rechercher...'}
        placeholderTextColor={couleurs.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacements.sm,
    marginHorizontal: espacements.base,
    marginVertical: espacements.md,
    paddingHorizontal: espacements.md + 2,
    borderRadius: rayons.input,
    borderWidth: 1,
    borderColor: couleurs.border,
    backgroundColor: couleurs.surface,
    ...ombres.sm,
  },
  input: {
    flex: 1,
    paddingVertical: espacements.sm + 2,
    fontFamily: polices.bodyRegular,
    fontSize: tailles.base - 1,
    color: couleurs.textPrimary,
  },
});
