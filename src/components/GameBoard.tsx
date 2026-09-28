import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Gem, ItemType, Position } from '../types/game';
import { GemVisual } from '../utils/gemRenderer';
import { ParticleCanvas, ParticleCanvasRef } from './ParticleCanvas';
import { isAdjacent } from '../utils/matchEngine';

interface GameBoardProps {
  board: (Gem | null)[][];
  isProcessing: boolean;
  hintGem?: Position | null;
  activeItem?: ItemType | null;
  onSwap: (posA: Position, posB: Position) => void;
  onUseItemOnTile?: (pos: Position) => void;
  particleRef: React.RefObject<ParticleCanvasRef | null>;
  isShuffling?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  isProcessing,
  hintGem,
  activeItem = null,
  onSwap,
  onUseItemOnTile,
  particleRef,
  isShuffling = false,
}) => {
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [hoveredTile, setHoveredTile] = useState<Position | null>(null);
  const [dragStart, setDragStart] = useState<{ pos: Position; clientX: number; clientY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [boardSizePx, setBoardSizePx] = useState<number>(440);

  // Clear selections when active item changes
  useEffect(() => {
    if (activeItem) {
      setSelectedPos(null);
    }
  }, [activeItem]);

  // Responsive board sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setBoardSizePx(Math.min(width, 480));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleTileClick = useCallback(
    (row: number, col: number) => {
      if (isProcessing) return;

      // If Item Targeting mode is active, execute item action on clicked tile
      if (activeItem && onUseItemOnTile) {
        onUseItemOnTile({ row, col });
        return;
      }

      if (!selectedPos) {
        // Select first gem
        if (board[row]?.[col]) {
          setSelectedPos({ row, col });
        }
      } else {
        // If clicking same gem, deselect
        if (selectedPos.row === row && selectedPos.col === col) {
          setSelectedPos(null);
          return;
        }

        // If adjacent, trigger swap
        if (isAdjacent(selectedPos, { row, col })) {
          const from = selectedPos;
          setSelectedPos(null);
          onSwap(from, { row, col });
        } else {
          // Select new gem instead
          if (board[row]?.[col]) {
            setSelectedPos({ row, col });
          }
        }
      }
    },
    [isProcessing, activeItem, onUseItemOnTile, selectedPos, board, onSwap]
  );

  // Swipe / Drag handling for touch & mouse
  const handlePointerDown = (row: number, col: number, e: React.PointerEvent) => {
    if (isProcessing || activeItem) return;
    setDragStart({
      pos: { row, col },
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  const handlePointerUp = (row: number, col: number, e: React.PointerEvent) => {
    if (isProcessing || activeItem || !dragStart) {
      setDragStart(null);
      return;
    }

    const dx = e.clientX - dragStart.clientX;
    const dy = e.clientY - dragStart.clientY;
    const threshold = 20; // 20px drag threshold

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      let targetRow = dragStart.pos.row;
      let targetCol = dragStart.pos.col;

      if (Math.abs(dx) > Math.abs(dy)) {
        targetCol += dx > 0 ? 1 : -1;
      } else {
        targetRow += dy > 0 ? 1 : -1;
      }

      // Check bounds
      if (targetRow >= 0 && targetRow < board.length && targetCol >= 0 && targetCol < board[0].length) {
        setSelectedPos(null);
        setDragStart(null);
        onSwap(dragStart.pos, { row: targetRow, col: targetCol });
        return;
      }
    }

    setDragStart(null);
  };

  const cellSize = boardSizePx / 8;

  // Compute item targeting highlight preview
  const isTileInItemTarget = (r: number, c: number): { inRange: boolean; styleClass: string } => {
    if (!activeItem || !hoveredTile) return { inRange: false, styleClass: '' };

    if (activeItem === 'hammer') {
      if (r === hoveredTile.row && c === hoveredTile.col) {
        return {
          inRange: true,
          styleClass: 'ring-2 ring-amber-400 bg-amber-500/35 shadow-lg shadow-amber-500/40 scale-105 z-10 animate-pulse',
        };
      }
    } else if (activeItem === 'bomb') {
      if (Math.abs(r - hoveredTile.row) <= 1 && Math.abs(c - hoveredTile.col) <= 1) {
        return {
          inRange: true,
          styleClass: 'ring-1 ring-rose-500 bg-rose-500/25 shadow-md shadow-rose-500/30 scale-105 z-10',
        };
      }
    } else if (activeItem === 'lightning_row') {
      if (r === hoveredTile.row || c === hoveredTile.col) {
        return {
          inRange: true,
          styleClass: 'ring-1 ring-cyan-400 bg-cyan-500/25 shadow-md shadow-cyan-500/30 z-10',
        };
      }
    } else if (activeItem === 'rainbow_prism') {
      const targetType = board[hoveredTile.row]?.[hoveredTile.col]?.type;
      if (targetType && board[r]?.[c]?.type === targetType) {
        return {
          inRange: true,
          styleClass: 'ring-2 ring-purple-400 bg-purple-500/30 shadow-md shadow-purple-500/30 scale-105 z-10 animate-pulse',
        };
      }
    }

    return { inRange: false, styleClass: '' };
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[480px] aspect-square mx-auto rounded-2xl p-2.5 sm:p-3 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 transition-all shadow-2xl overflow-hidden select-none ${
        activeItem ? 'border-amber-400/90 shadow-amber-500/20 cursor-crosshair' : 'border-slate-700/80'
      }`}
      onMouseLeave={() => setHoveredTile(null)}
    >
      {/* Subtle background glow grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

      {/* 8x8 Grid Container */}
      <div
        className="relative w-full h-full grid grid-cols-8 grid-rows-8 gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 backdrop-blur-sm shadow-inner"
        style={{ touchAction: 'none' }}
      >
        {board.map((row, r) =>
          row.map((gem, c) => {
            const isSelected = selectedPos?.row === r && selectedPos?.col === c;
            const isHint = hintGem?.row === r && hintGem?.col === c;
            const isEvenCell = (r + c) % 2 === 0;
            const itemTarget = isTileInItemTarget(r, c);

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleTileClick(r, c)}
                onMouseEnter={() => setHoveredTile({ row: r, col: c })}
                onPointerDown={(e) => handlePointerDown(r, c, e)}
                onPointerUp={(e) => handlePointerUp(r, c, e)}
                className={`relative flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150 ${
                  isEvenCell ? 'bg-slate-900/40' : 'bg-slate-800/30'
                } hover:bg-slate-700/40 ${
                  itemTarget.inRange
                    ? itemTarget.styleClass
                    : isSelected
                    ? 'ring-2 ring-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/30 z-10 scale-105'
                    : ''
                }`}
              >
                {gem ? (
                  <GemVisual
                    type={gem.type}
                    special={gem.special}
                    size={cellSize * 0.78}
                    isHint={isHint}
                    className={`transform transition-all ${
                      isSelected || itemTarget.inRange ? 'scale-110 drop-shadow-xl' : 'hover:scale-105'
                    }`}
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Particle & VFX Canvas overlay */}
      <ParticleCanvas
        ref={particleRef}
        width={boardSizePx}
        height={boardSizePx}
      />

      {/* Reshuffle Notice Overlay */}
      {isShuffling && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-3 animate-spin">
            ✨
          </div>
          <h3 className="text-xl font-bold text-white mb-1">가능한 이동 없음</h3>
          <p className="text-sm text-slate-300">보석들을 새롭게 섞는 중입니다...</p>
        </div>
      )}
    </div>
  );
};

