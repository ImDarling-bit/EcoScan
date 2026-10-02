import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function FilePdfIcon({ size = 22, color = '#FFFFFF' }: Props): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 3.5h7.2L19 8.3V19.5c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-15c0-.55.45-1 1-1Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M14 3.5V8h4.8" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path
        d="M8.6 17.2v-4h1.1c.66 0 1.2.54 1.2 1.2v1.6c0 .66-.54 1.2-1.2 1.2h-1.1Zm4.1 0v-4h1.75M12.7 15.3h1.55m2.05 1.9v-4h2"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
