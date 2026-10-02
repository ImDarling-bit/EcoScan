import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function DownloadIcon({ size = 20, color = '#FFFFFF' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4v11.5M7.5 11l4.5 4.5 4.5-4.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 18.5h14" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
