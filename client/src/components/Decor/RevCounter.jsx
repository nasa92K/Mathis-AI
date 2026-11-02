import './RevCounter.css';

// Compte-tours décoratif : 0 à 9 (x1000 tr/min), zone rouge à partir de 7.
const START = -225; // angle de départ (degrés)
const SWEEP = 270; // amplitude totale
const MAX = 9;
const REDLINE = 7;

const toRad = (deg) => (deg * Math.PI) / 180;
const point = (angle, radius) => [100 + radius * Math.cos(toRad(angle)), 100 + radius * Math.sin(toRad(angle))];
const angleFor = (value) => START + (value / MAX) * SWEEP;

function arcPath(from, to, radius) {
  const [x1, y1] = point(angleFor(from), radius);
  const [x2, y2] = point(angleFor(to), radius);
  const large = angleFor(to) - angleFor(from) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
}

const ticks = [];
for (let i = 0; i <= MAX * 2; i++) {
  const value = i / 2;
  const major = i % 2 === 0;
  const [x1, y1] = point(angleFor(value), major ? 70 : 74);
  const [x2, y2] = point(angleFor(value), 82);
  ticks.push({ value, major, x1, y1, x2, y2, red: value >= REDLINE });
}

export default function RevCounter({ label = 'x1000 tr/min', className = '' }) {
  return (
    <div className={`rev-counter ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" className="rev-counter__bezel" />
        <path d={arcPath(0, REDLINE, 82)} className="rev-counter__track" />
        <path d={arcPath(REDLINE, MAX, 82)} className="rev-counter__redline" />
        {ticks.map((tick) => (
          <line
            key={tick.value}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            className={`rev-counter__tick ${tick.major ? 'is-major' : ''} ${tick.red ? 'is-red' : ''}`}
          />
        ))}
        {ticks
          .filter((tick) => tick.major)
          .map((tick) => {
            const [x, y] = point(angleFor(tick.value), 56);
            return (
              <text key={`n${tick.value}`} x={x} y={y} className={`rev-counter__num ${tick.red ? 'is-red' : ''}`}>
                {tick.value}
              </text>
            );
          })}
        <text x="100" y="168" className="rev-counter__label">
          {label}
        </text>
        <g className="rev-counter__needle">
          <line x1="100" y1="100" x2="100" y2="30" />
        </g>
        <circle cx="100" cy="100" r="7" className="rev-counter__hub" />
      </svg>
    </div>
  );
}
