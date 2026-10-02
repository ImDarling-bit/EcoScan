import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function EnvelopeIcon({ size = 20, color = '#FFFFFF' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 6.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M4 7l8 6.2L20 7" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
