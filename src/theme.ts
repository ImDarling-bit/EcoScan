/**
 * Design tokens ECO TAURUS — repris de
 * design_handoff_hdd_traceability/design-tokens.json. Toute valeur de style
 * en dur (couleur, police, radius, espacement) dans un écran/composant
 * devrait venir d'ici, pas être réinventée localement.
 */

export const couleurs = {
  background: '#F4F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF0F6',
  border: '#D8E1EA',
  borderStrong: '#B9C7D4',
  textPrimary: '#1B2430',
  textSecondary: '#5B6672',
  textTertiary: '#7A8694',
  textInverse: '#FFFFFF',
  primary: '#2E75B6',
  primaryDark: '#1F5586',
  primaryLight: '#DCE9F5',
  accent: '#8DC63F',
  accentDark: '#5C9427',
  accentLight: '#EAF5DC',
  success: '#5C9427',
  successLight: '#EAF5DC',
  warning: '#C97A2E',
  warningLight: '#F6E7D2',
  warningText: '#A6621F',
  danger: '#B3432F',
  dangerLight: '#F5DED8',
} as const;

// Polices statiques embarquées dans android/app/src/main/assets/fonts —
// nom de fichier (sans extension) = fontFamily sur Android.
export const polices = {
  headingBold: 'Manrope-Bold', // 700
  headingExtraBold: 'Manrope-ExtraBold', // 800
  bodyRegular: 'PublicSans-Regular', // 400
  bodyMedium: 'PublicSans-Medium', // 500
  bodySemiBold: 'PublicSans-SemiBold', // 600
} as const;

export const tailles = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 19,
  xl: 23,
  xxl: 28,
} as const;

export const espacements = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const rayons = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
  input: 10,
} as const;

export const mise_en_page = {
  hauteurEntete: 56,
  hauteurBarreOnglets: 72,
} as const;

// Équivalents RN (shadow* iOS + elevation Android) des ombres CSS du handoff
// (design-tokens.json > shadow). À étaler sur les cartes/boutons flottants
// pour donner du relief plutôt que des blocs plats.
export const ombres = {
  sm: {
    shadowColor: '#1B231E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#1B231E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1B231E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 8,
  },
} as const;
