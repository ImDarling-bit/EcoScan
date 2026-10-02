import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function ClockIcon({ size = 20, color = '#1B2430' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.6} />
      <Path d="M12 7.5V12l3 2" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
