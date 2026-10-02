import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function PencilIcon({ size = 18, color = '#5B6672' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.7 4.3a1.5 1.5 0 0 1 2.1 0l1.9 1.9a1.5 1.5 0 0 1 0 2.1L9.4 18.6l-4.4 1 1-4.4L15.7 4.3Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M14 6.5 17.5 10" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}
