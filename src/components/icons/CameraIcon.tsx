import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function CameraIcon({ size = 22, color = '#FFFFFF' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8.5c0-.83.67-1.5 1.5-1.5h1.4l.9-1.4c.28-.43.75-.6 1.2-.6h5.6c.44 0 .9.17 1.2.6l.9 1.4h1.4c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={13} r={3.4} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}
