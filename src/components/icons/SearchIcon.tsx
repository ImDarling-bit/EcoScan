import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function SearchIcon({ size = 18, color = '#7A8694' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={10.5} cy={10.5} r={6.5} stroke={color} strokeWidth={1.8} />
      <Path d="M19 19l-3.8-3.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
