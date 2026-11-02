import avatarUrl from '../../assets/mathis-avatar.jpg';
import './Brand.css';

/**
 * Photo de Mathis AI.
 * Pour la changer : remplace src/assets/mathis-avatar.jpg (image carrée, ~320 px).
 */
export default function MathisAvatar({ size = 36, thinking = false }) {
  return (
    <span
      className={`mathis-avatar ${thinking ? 'is-thinking' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img src={avatarUrl} alt="" width={size} height={size} draggable="false" />
    </span>
  );
}
