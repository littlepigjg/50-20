import React, { useMemo } from 'react';
import type { CellType, Direction, Level, OneWayPassage, Portal, Position, RobotState } from '../../engine/types';
import { positionEquals } from '../../engine/GameEngine';

interface GameGridProps {
  level: Level;
  robotState: RobotState;
  collectedStars: Position[];
  cellSize?: number;
  isAnimating?: boolean;
}

const DIRECTION_ROTATION: Record<Direction, number> = {
  0: -90,
  1: 0,
  2: 90,
  3: 180,
};

const CellContent: React.FC<{ type: CellType }> = ({ type }) => {
  switch (type) {
    case 'wall':
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-sm flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-gradient-to-br from-gray-500 to-gray-700 rounded-sm border border-gray-900/30" />
        </div>
      );
    case 'pit':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-4/5 h-4/5 bg-gradient-to-br from-gray-900 to-black rounded-full shadow-inner border-2 border-gray-800">
            <div className="w-full h-full flex items-center justify-center text-red-500 text-xs">
              ⚠
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const Robot: React.FC<{ direction: Direction; size: number }> = ({ direction, size }) => {
  const rotation = DIRECTION_ROTATION[direction];
  const robotSize = size * 0.7;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out z-20"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg
        width={robotSize}
        height={robotSize}
        viewBox="0 0 64 64"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="robotBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="robotHead" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="52" rx="18" ry="6" fill="rgba(0,0,0,0.2)" />
        <rect x="14" y="28" width="36" height="24" rx="4" fill="url(#robotBody)" />
        <circle cx="32" cy="20" r="14" fill="url(#robotHead)" />
        <rect x="22" y="34" width="20" height="10" rx="2" fill="#1e3a8a" />
        <circle cx="26" cy="18" r="3" fill="#fff" />
        <circle cx="38" cy="18" r="3" fill="#fff" />
        <circle cx="26" cy="18" r="1.5" fill="#1e3a8a" />
        <circle cx="38" cy="18" r="1.5" fill="#1e3a8a" />
        <path d="M56 32 L62 32 M62 32 L58 28 M62 32 L58 36" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="18" y="40" width="4" height="8" rx="1" fill="#1e40af" />
        <rect x="42" y="40" width="4" height="8" rx="1" fill="#1e40af" />
      </svg>
    </div>
  );
};

const Star: React.FC<{ collected?: boolean; justCollected?: boolean }> = ({
  collected,
  justCollected,
}) => (
  <div
    className={`absolute inset-0 flex items-center justify-center z-10 transition-all duration-500
      ${collected ? 'opacity-0 scale-0' : 'opacity-100'}
      ${justCollected ? 'animate-pop scale-150' : 'animate-bounce-slow'}
    `}
  >
    <svg
      width="60%"
      height="60%"
      viewBox="0 0 24 24"
      className="drop-shadow-md"
    >
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="url(#starGrad)"
        stroke="#ca8a04"
        strokeWidth="0.5"
      />
    </svg>
  </div>
);

const Goal: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center z-0">
    <div className="w-4/5 h-4/5 rounded-lg bg-gradient-to-br from-green-300 to-emerald-500 flex items-center justify-center animate-pulse">
      <span className="text-white text-xl font-bold drop-shadow">🏁</span>
    </div>
  </div>
);

const Start: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center z-0">
    <div className="w-4/5 h-4/5 rounded-lg border-2 border-dashed border-blue-400 bg-blue-100/50 flex items-center justify-center">
      <span className="text-blue-500 text-sm font-bold">起</span>
    </div>
  </div>
);

const PortalEntrance: React.FC<{ portalId: string }> = ({ portalId: _portalId }) => (
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <div className="w-4/5 h-4/5 rounded-full bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center animate-pulse shadow-lg shadow-purple-300/50">
      <span className="text-white text-lg font-bold drop-shadow">🌀</span>
    </div>
  </div>
);

const PortalExit: React.FC<{ portalId: string }> = ({ portalId: _portalId }) => (
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <div className="w-4/5 h-4/5 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-300/50">
      <span className="text-white text-lg font-bold drop-shadow">🔮</span>
    </div>
  </div>
);

const ONEWAY_ROTATION: Record<Direction, number> = {
  0: 0,
  1: 90,
  2: 180,
  3: 270,
};

const OneWayCell: React.FC<{ direction: Direction }> = ({ direction }) => {
  const rotation = ONEWAY_ROTATION[direction];
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div
        className="w-4/5 h-4/5 rounded-lg bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-md border-2 border-orange-600"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="flex flex-col items-center">
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-transparent border-b-white drop-shadow" />
          <div className="w-4 h-1 bg-white rounded-full mt-0.5" />
        </div>
      </div>
    </div>
  );
};

export const GameGrid: React.FC<GameGridProps> = ({
  level,
  robotState,
  collectedStars,
  cellSize = 60,
}) => {
  const { grid, width, height, start, goal, stars, portals, oneWayPassages } = level;

  const cells = useMemo(() => {
    const result: { x: number; y: number; type: CellType }[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        result.push({ x, y, type: grid[y][x] });
      }
    }
    return result;
  }, [grid, width, height]);

  const collectedIds = useMemo(() => {
    const set = new Set<string>();
    collectedStars.forEach((p) => set.add(`${p.x},${p.y}`));
    return set;
  }, [collectedStars]);

  const starIds = useMemo(() => {
    const set = new Set<string>();
    stars.forEach((p) => set.add(`${p.x},${p.y}`));
    return set;
  }, [stars]);

  const portalEntrances = useMemo(() => {
    const map = new Map<string, Portal>();
    portals.forEach((p) => map.set(`${p.entrance.x},${p.entrance.y}`, p));
    return map;
  }, [portals]);

  const portalExits = useMemo(() => {
    const map = new Map<string, Portal>();
    portals.forEach((p) => {
      if (p.exit.x >= 0 && p.exit.y >= 0) {
        map.set(`${p.exit.x},${p.exit.y}`, p);
      }
    });
    return map;
  }, [portals]);

  const oneWayMap = useMemo(() => {
    const map = new Map<string, OneWayPassage>();
    oneWayPassages.forEach((ow) => map.set(`${ow.position.x},${ow.position.y}`, ow));
    return map;
  }, [oneWayPassages]);

  return (
    <div
      className="relative bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl p-2 shadow-inner"
      style={{
        width: width * cellSize + 16,
        height: height * cellSize + 16,
      }}
    >
      <div
        className="relative rounded-xl overflow-hidden bg-slate-100"
        style={{
          width: width * cellSize,
          height: height * cellSize,
        }}
      >
        {cells.map(({ x, y, type }) => (
          <div
            key={`cell-${x}-${y}`}
            className={`absolute border border-slate-300/50
              ${(x + y) % 2 === 0 ? 'bg-slate-50' : 'bg-slate-100'}
            `}
            style={{
              left: x * cellSize,
              top: y * cellSize,
              width: cellSize,
              height: cellSize,
            }}
          >
            <CellContent type={type} />

            {positionEquals({ x, y }, start) && <Start />}

            {positionEquals({ x, y }, goal) && <Goal />}

            {portalEntrances.has(`${x},${y}`) && (
              <PortalEntrance portalId={portalEntrances.get(`${x},${y}`)!.id} />
            )}

            {portalExits.has(`${x},${y}`) && !portalEntrances.has(`${x},${y}`) && (
              <PortalExit portalId={portalExits.get(`${x},${y}`)!.id} />
            )}

            {oneWayMap.has(`${x},${y}`) && (
              <OneWayCell direction={oneWayMap.get(`${x},${y}`)!.direction} />
            )}

            {starIds.has(`${x},${y}`) && (
              <Star
                collected={collectedIds.has(`${x},${y}`)}
                justCollected={false}
              />
            )}
          </div>
        ))}

        <div
          className="absolute transition-all duration-300 ease-in-out"
          style={{
            left: robotState.position.x * cellSize,
            top: robotState.position.y * cellSize,
            width: cellSize,
            height: cellSize,
          }}
        >
          <Robot direction={robotState.direction} size={cellSize} />
        </div>
      </div>
    </div>
  );
};

export default GameGrid;
