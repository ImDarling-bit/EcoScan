import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function ChevronDownIcon({ size = 18, color = '#5B6672' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9.5 12 15.5 18 9.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
