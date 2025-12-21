import { useMemo } from 'react';
import { getColor, getPastel } from '@/lib/colors';

export function Avatar({ seed, size = 128, ...props }: { seed: string; size?: number }) {
  const backgroundColor = getPastel(getColor(seed), 4);
  const color = getColor(seed);

  return (
    <div
      style={{
        borderRadius: '100%',
        width: size,
        height: size,
        backgroundColor: '#' + backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        color: '#' + color,
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}
      {...props}
    >
      {seed.slice(0, 2)}
    </div>
  );
}
