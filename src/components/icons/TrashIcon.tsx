import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function TrashIcon({ size = 18, color = '#B3432F' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 7h14M9.5 7V5.3c0-.5.4-.8.8-.8h3.4c.44 0 .8.36.8.8V7" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path
        d="M7 7l.8 12c.04.7.6 1.2 1.3 1.2h6c.7 0 1.26-.5 1.3-1.2L17 7"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M10.3 10.5v6M13.7 10.5v6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
