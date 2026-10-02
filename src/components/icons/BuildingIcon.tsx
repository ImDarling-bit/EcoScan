import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function BuildingIcon({ size = 20, color = '#1B2430' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={3} width={14} height={18} rx={1.5} stroke={color} strokeWidth={1.6} />
      <Path
        d="M8.5 7h1.5M14 7h1.5M8.5 11h1.5M14 11h1.5M8.5 15h1.5M14 15h1.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path d="M10 21v-3.2c0-.44.36-.8.8-.8h2.4c.44 0 .8.36.8.8V21" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}
