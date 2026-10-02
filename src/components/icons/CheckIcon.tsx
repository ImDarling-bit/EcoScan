import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function CheckIcon({ size = 18, color = '#2E75B6' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5 9.5 17 19 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
