import { useId } from 'react';
import './Brand.css';

/** Avatar de Mathis AI : monogramme "M" sur fond dégradé. */
export default function MathisAvatar({ size = 36, thinking = false }) {
  const gradientId = useId();
  return (
    <span
      className={`mathis-avatar ${thinking ? 'is-thinking' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="12" fill="#0d1322" stroke={`url(#${gradientId})`} strokeWidth="1.5" />
        <path
          d="M11 28V13l9 8 9-8v15"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
