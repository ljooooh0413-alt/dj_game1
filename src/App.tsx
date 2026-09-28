import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameMode, GameState, Gem, ItemType, Position, TargetRangePreset } from './types/game';
import {
  BOARD_SIZE,
  DEFAULT_GEM_TYPES,
  createInitialBoard,
  dropGemsAndRefill,
  findMatches,
  handleSpecialSwap,
  hasValidMoves,
  shuffleBoard,
} from './utils/matchEngine';
import { GEM_PALETTE } from './utils/gemRenderer';
import { soundManager } from './utils/sound';
import { calculateTargetScore, TARGET_PRESETS } from './utils/scoreTargets';
import { INITIAL_INVENTORY, ITEM_DEFINITIONS } from './utils/itemDefinitions';
import { GameHUD } from './components/GameHUD';
import { GameBoard } from './components/GameBoard';
import { ItemBar } from './components/ItemBar';
import { Modals } from './components/Modals';
import { TargetRangeModal } from './components/TargetRangeModal';
import { ParticleCanvasRef } from './components/ParticleCanvas';

export default function App() {
  // Game Configuration & State
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);

  // Target Score Range & Scale Settings
  const [targetRangePreset, setTargetRangePreset] = useState<TargetRangePreset>(() => {
    const saved = localStorage.getItem('jewel_target_preset');
    return (saved as TargetRangePreset) || 'standard';
  });
  const [targetMultiplier, setTargetMultiplier] = useState<number>(() => {
    const saved = localStorage.getItem('jewel_target_multiplier');
    return saved ? Number(saved) : 1.0;
  });
  const [showRangeModal, setShowRangeModal] = useState<boolean>(false);

  // Time Attack Timer
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const timerRef = useRef<number | null>(null);

  // Board State
  const [board, setBoard] = useState<(Gem | null)[][]>(() => createInitialBoard(BOARD_SIZE, BOARD_SIZE));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [hintGem, setHintGem] = useState<Position | null>(null);

  // Item Inventory State
  const [inventory, setInventory] = useState<Record<ItemType, number>>(() => {
    const saved = localStorage.getItem('jewel_inventory');
    if (saved) {
      try {
        return { ...INITIAL_INVENTORY, ...JSON.parse(saved) };
      } catch {
        // fallback
      }
    }
    return { ...INITIAL_INVENTORY };
  });
  const [activeItem, setActiveItem] = useState<ItemType | null>(null);
  const [chargeProgress, setChargeProgress] = useState<number>(0);

  // Sound & Modals
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());
  const [showPlan, setShowPlan] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);

  // VFX Reference
  const particleRef = useRef<ParticleCanvasRef | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  // Load High Score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jewel_high_score');
    if (saved) {
      setHighScore(Number(saved));
    }
  }, []);

  const ALL_ITEMS: ItemType[] = ['hammer', 'bomb', 'lightning_row', 'rainbow_prism', 'shuffle_wand'];
  const ITEM_CHARGE_THRESHOLD = 10000;

  // Update High Score and recharge 1 random item every 10,000 points earned
  const updateScore = useCallback((added: number) => {
    if (added <= 0) return;

    setScore((prev) => {
      const next = prev + added;
      setHighScore((high) => {
        if (next > high) {
          localStorage.setItem('jewel_high_score', String(next));
          return next;
        }
        return high;
      });
      return next;
    });

    // Check 10,000 points item charge progress (charges exactly 1 item)
    setChargeProgress((prevProgress) => {
      const totalAccum = prevProgress + added;
      if (totalAccum >= ITEM_CHARGE_THRESHOLD) {
        const randomItem = ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)];
        setInventory((prevInv) => {
          const nextInv = { ...prevInv, [randomItem]: (prevInv[randomItem] || 0) + 1 };
          localStorage.setItem('jewel_inventory', JSON.stringify(nextInv));
          return nextInv;
        });

        // Trigger celebratory chime and visual popup!
        soundManager.playRainbow();
        const itemName = ITEM_DEFINITIONS[randomItem]?.name || '아이템';
        particleRef.current?.addScorePopup(
          220,
          150,
          `🎁 10,000점 달성! [${itemName}] 1개 충전!`,
          '#FDE047',
          true
        );

        return totalAccum % ITEM_CHARGE_THRESHOLD;
      }

      return totalAccum;
    });
  }, []);

  // Timer loop for Time Attack Mode
  useEffect(() => {
    if (gameMode !== 'time_attack' || gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          soundManager.playGameOver();
          setGameState('game_over');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode, gameState]);

  // Reset Hint on user activity
  const resetIdleTimer = useCallback(() => {
    setHintGem(null);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    // After 6 seconds of idle, find and show a hint!
    idleTimerRef.current = window.setTimeout(() => {
      const move = hasValidMoves(board);
      if (move.hintMove) {
        setHintGem(move.hintMove.from);
      }
    }, 6000);
  }, [board]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Handle Manual Hint Request
  const handleRequestHint = () => {
    soundManager.playSelect();
    const move = hasValidMoves(board);
    if (move.hintMove) {
      setHintGem(move.hintMove.from);
      // Also trigger a sparkle at hint position
      const cellPx = 440 / 8;
      const x = (move.hintMove.from.col + 0.5) * cellPx;
      const y = (move.hintMove.from.row + 0.5) * cellPx;
      particleRef.current?.addScorePopup(x, y, '💡 힌트!', '#FDE047');
    } else {
      handleReshuffle();
    }
  };

  // Reshuffle Board when no moves remain
  const handleReshuffle = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = shuffleBoard(board);
      setBoard(shuffled);
      setIsShuffling(false);
      soundManager.playRainbow();
    }, 800);
  }, [board]);

  // Process Cascades, Gravity, Explosions
  const runCascadeCycle = useCallback(
    async (
      currentBoard: (Gem | null)[][],
      matchesResult: ReturnType<typeof findMatches>,
      comboCount: number,
      isItemAction: boolean = false
    ) => {
      setCombo(comboCount);
      const rows = currentBoard.length;
      const cols = currentBoard[0].length;
      const cellPx = 440 / 8;

      // 1. Play sounds and VFX for each matched gem
      let hasBombExploded = false;
      let hasLaserBlasted = false;
      let hasRainbowUsed = false;

      let centerSumX = 0;
      let centerSumY = 0;
      let gemCount = 0;

      matchesResult.matchedPositions.forEach((key) => {
        const [r, c] = key.split(',').map(Number);
        const gem = currentBoard[r]?.[c];
        if (gem) {
          const x = (c + 0.5) * cellPx;
          const y = (r + 0.5) * cellPx;
          centerSumX += x;
          centerSumY += y;
          gemCount++;

          const color = GEM_PALETTE[gem.type]?.mainColor || '#F59E0B';
          particleRef.current?.addExplosion(x, y, color, 14);

          if (gem.special === 'bomb') hasBombExploded = true;
          if (gem.special === 'line_horizontal') {
            hasLaserBlasted = true;
            particleRef.current?.addLaserBeam('row', r, color);
          }
          if (gem.special === 'line_vertical') {
            hasLaserBlasted = true;
            particleRef.current?.addLaserBeam('col', c, color);
          }
          if (gem.special === 'rainbow') hasRainbowUsed = true;
        }
      });

      // Sound effects
      if (hasBombExploded) {
        soundManager.playBomb();
        particleRef.current?.triggerScreenShake(8);
      } else if (hasLaserBlasted) {
        soundManager.playLaser();
        particleRef.current?.triggerScreenShake(5);
      } else if (hasRainbowUsed) {
        soundManager.playRainbow();
        particleRef.current?.triggerScreenShake(6);
      } else {
        soundManager.playMatch(comboCount);
      }

      // Calculate score and show popup (Blocked when triggered by items)
      if (!isItemAction) {
        const basePoints = 60 * gemCount;
        const comboMultiplier = Math.max(1, comboCount);
        const earned = basePoints * comboMultiplier;
        updateScore(earned);

        if (gemCount > 0) {
          const avgX = centerSumX / gemCount;
          const avgY = centerSumY / gemCount;
          const comboText = comboCount > 1 ? `+${earned} (x${comboCount} COMBO!)` : `+${earned}`;
          particleRef.current?.addScorePopup(avgX, avgY, comboText, comboCount > 1 ? '#F43F5E' : '#FDE047', comboCount > 1);
        }
      } else {
        // Item action: No points awarded
        if (gemCount > 0) {
          const avgX = centerSumX / gemCount;
          const avgY = centerSumY / gemCount;
          particleRef.current?.addScorePopup(avgX, avgY, '아이템 사용 (0점)', '#94A3B8');
        }
      }

      // 2. Prepare board: place newly generated special gems, null out others
      const nextBoard: (Gem | null)[][] = currentBoard.map((row) => [...row]);

      // Remove destroyed gems
      matchesResult.matchedPositions.forEach((key) => {
        const [r, c] = key.split(',').map(Number);
        nextBoard[r][c] = null;
      });

      // Spawn newly synthesized special gems at their designated positions
      matchesResult.newSpecials.forEach(({ pos, special, gemType }) => {
        nextBoard[pos.row][pos.col] = {
          id: `special_${Date.now()}_${Math.random()}`,
          type: gemType,
          special,
          row: pos.row,
          col: pos.col,
        };
      });

      setBoard(nextBoard);

      // Short delay for explosion visual
      await new Promise((res) => setTimeout(res, 220));

      // 3. Drop gems and refill empty cells
      const { newBoard: refilledBoard } = dropGemsAndRefill(nextBoard, DEFAULT_GEM_TYPES);
      setBoard(refilledBoard);

      // Short delay for drop movement
      await new Promise((res) => setTimeout(res, 220));

      // 4. Check for further cascade matches
      const newMatches = findMatches(refilledBoard);

      if (newMatches.matchedPositions.size > 0) {
        // Recursive Cascade (preserve isItemAction status)
        await runCascadeCycle(refilledBoard, newMatches, comboCount + 1, isItemAction);
      } else {
        // End of cascades
        setCombo(1);

        // Check Classic mode level progression
        const target = calculateTargetScore(level, targetRangePreset, targetMultiplier);
        if (gameMode === 'classic') {
          setScore((currentScore) => {
            if (currentScore >= target && gameState === 'playing') {
              soundManager.playLevelClear();
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });
              // Bonus item reward on Level Clear: exactly 1 random item!
              const randomBonus = ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)];
              setInventory((prev) => {
                const next = {
                  ...prev,
                  [randomBonus]: (prev[randomBonus] || 0) + 1,
                };
                localStorage.setItem('jewel_inventory', JSON.stringify(next));
                return next;
              });
              const bonusName = ITEM_DEFINITIONS[randomBonus]?.name || '아이템';
              particleRef.current?.addScorePopup(220, 180, `🎁 레벨 클리어 보너스: [${bonusName}] 1개 획득!`, '#10B981', true);
              setGameState('level_cleared');
            }
            return currentScore;
          });
        }

        // Verify if playable moves exist
        const moves = hasValidMoves(refilledBoard);
        if (!moves.hasMoves) {
          handleReshuffle();
        }

        setIsProcessing(false);
      }
    },
    [level, gameMode, gameState, targetRangePreset, targetMultiplier, updateScore, handleReshuffle]
  );

  // Handle Swap action from Board
  const handleSwap = async (posA: Position, posB: Position) => {
    if (isProcessing || gameState !== 'playing') return;
    resetIdleTimer();

    const gemA = board[posA.row]?.[posA.col];
    const gemB = board[posB.row]?.[posB.col];
    if (!gemA || !gemB) return;

    setIsProcessing(true);
    soundManager.playSwap();

    // Check special dual combinations first (Rainbow + any, Bomb + Bomb, etc.)
    const specialResult = handleSpecialSwap(gemA, gemB, board);
    if (specialResult.handled) {
      if (specialResult.specialDescription) {
        const cellPx = 440 / 8;
        const x = (posB.col + 0.5) * cellPx;
        const y = (posB.row + 0.5) * cellPx;
        particleRef.current?.addScorePopup(x, y, specialResult.specialDescription, '#F43F5E', true);
      }

      await runCascadeCycle(
        board,
        {
          matchedPositions: specialResult.matchedPositions,
          matchGroups: [],
          newSpecials: [],
        },
        1
      );
      return;
    }

    // Standard swap: perform swap on temporary board
    const tempBoard: (Gem | null)[][] = board.map((r) => [...r]);
    tempBoard[posA.row][posA.col] = { ...gemB, row: posA.row, col: posA.col };
    tempBoard[posB.row][posB.col] = { ...gemA, row: posB.row, col: posB.col };

    // Find matches resulting from this swap
    const matches = findMatches(tempBoard, posB);

    if (matches.matchedPositions.size === 0) {
      // Invalid swap: display swap, then revert smoothly
      setBoard(tempBoard);
      await new Promise((res) => setTimeout(res, 180));
      setBoard(board);
      setIsProcessing(false);
      return;
    }

    // Valid swap! Apply and process cascades
    setBoard(tempBoard);
    await new Promise((res) => setTimeout(res, 140));
    await runCascadeCycle(tempBoard, matches, 1);
  };

  // Mode Selection
  const handleSelectMode = (newMode: GameMode) => {
    soundManager.playSelect();
    setGameMode(newMode);
    setScore(0);
    setLevel(1);
    setCombo(1);
    setChargeProgress(0);
    setTimeLeft(60);
    setGameState('playing');
    setBoard(createInitialBoard(BOARD_SIZE, BOARD_SIZE));
  };

  // Reset Target Score & Level to Level 1
  const handleResetTarget = () => {
    soundManager.playRainbow();
    setLevel(1);
    setScore(0);
    setCombo(1);
    setChargeProgress(0);
    setTimeLeft(60);
    setGameState('playing');
    setBoard(createInitialBoard(BOARD_SIZE, BOARD_SIZE));
    const l1Target = calculateTargetScore(1, targetRangePreset, targetMultiplier);
    particleRef.current?.addScorePopup(220, 200, `🎯 레벨 1 (${l1Target.toLocaleString()}점) 리셋!`, '#38BDF8', true);
  };

  // Apply new Target Score Range Preset & Multiplier
  const handleApplyRange = (newPreset: TargetRangePreset, newMultiplier: number, resetLevel: boolean) => {
    soundManager.playRainbow();
    setTargetRangePreset(newPreset);
    setTargetMultiplier(newMultiplier);
    localStorage.setItem('jewel_target_preset', newPreset);
    localStorage.setItem('jewel_target_multiplier', String(newMultiplier));

    if (resetLevel) {
      setLevel(1);
      setScore(0);
      setCombo(1);
      setChargeProgress(0);
      setTimeLeft(60);
      setGameState('playing');
      setBoard(createInitialBoard(BOARD_SIZE, BOARD_SIZE));
    }

    const newTarget = calculateTargetScore(resetLevel ? 1 : level, newPreset, newMultiplier);
    const presetName = TARGET_PRESETS[newPreset]?.name || '설정';
    particleRef.current?.addScorePopup(220, 200, `🎯 ${presetName} 범위 (${newTarget.toLocaleString()}점) 적용!`, '#38BDF8', true);
  };

  // Reset High Score
  const handleResetHighScore = () => {
    soundManager.playSelect();
    localStorage.removeItem('jewel_high_score');
    setHighScore(0);
    particleRef.current?.addScorePopup(220, 200, '🏆 최고 기록 초기화 완료', '#FBBF24', true);
  };

  // Restart Current Game
  const handleRestart = () => {
    soundManager.playSelect();
    setScore(0);
    setCombo(1);
    setChargeProgress(0);
    setTimeLeft(60);
    setGameState('playing');
    setBoard(createInitialBoard(BOARD_SIZE, BOARD_SIZE));
  };

  // Next Level progression
  const handleNextLevel = () => {
    soundManager.playSelect();
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setGameState('playing');
    setBoard(createInitialBoard(BOARD_SIZE, BOARD_SIZE));
  };

  // Item System Handlers
  const handleSelectItem = (type: ItemType) => {
    if (isProcessing) return;
    const count = inventory[type] || 0;
    if (count <= 0) {
      particleRef.current?.addScorePopup(220, 200, '아이템이 부족합니다! 충전 버튼을 누르세요.', '#F43F5E');
      return;
    }

    const def = ITEM_DEFINITIONS[type];
    if (!def.requiresTarget) {
      // Instant item (e.g. Shuffle Wand)
      setInventory((prev) => {
        const next = { ...prev, [type]: Math.max(0, prev[type] - 1) };
        localStorage.setItem('jewel_inventory', JSON.stringify(next));
        return next;
      });
      soundManager.playRainbow();
      particleRef.current?.addScorePopup(220, 200, '🪄 셔플 완드 발동!', '#10B981', true);
      handleReshuffle();
      return;
    }

    // Targeted item: toggle active state
    if (activeItem === type) {
      setActiveItem(null);
    } else {
      soundManager.playItemActivate();
      setActiveItem(type);
      particleRef.current?.addScorePopup(220, 200, `🎯 [${def.name}] 보석을 선택하세요`, def.color);
    }
  };

  const handleUseItemOnTile = async (pos: Position) => {
    if (!activeItem || isProcessing) return;
    const count = inventory[activeItem] || 0;
    if (count <= 0) {
      setActiveItem(null);
      return;
    }

    const itemToUse = activeItem;
    setActiveItem(null); // Clear targeting mode

    // Decrement item count
    setInventory((prev) => {
      const next = { ...prev, [itemToUse]: Math.max(0, prev[itemToUse] - 1) };
      localStorage.setItem('jewel_inventory', JSON.stringify(next));
      return next;
    });

    const cellPx = 440 / 8;
    const x = (pos.col + 0.5) * cellPx;
    const y = (pos.row + 0.5) * cellPx;
    const matchedPositions = new Set<string>();

    if (itemToUse === 'hammer') {
      soundManager.playHammer();
      const targetGem = board[pos.row]?.[pos.col];
      const gemColor = targetGem ? GEM_PALETTE[targetGem.type]?.mainColor : '#F59E0B';
      particleRef.current?.addExplosion(x, y, gemColor || '#F59E0B', 24);
      particleRef.current?.triggerScreenShake(4);
      particleRef.current?.addScorePopup(x, y, '🔨 해머 파괴! (0점)', '#F59E0B', true);
      matchedPositions.add(`${pos.row},${pos.col}`);
    } else if (itemToUse === 'bomb') {
      soundManager.playBomb();
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = pos.row + dr;
          const nc = pos.col + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            matchedPositions.add(`${nr},${nc}`);
            const px = (nc + 0.5) * cellPx;
            const py = (nr + 0.5) * cellPx;
            particleRef.current?.addExplosion(px, py, '#EF4444', 12);
          }
        }
      }
      particleRef.current?.triggerScreenShake(9);
      particleRef.current?.addScorePopup(x, y, '💣 메가 폭탄 폭발! (0점)', '#EF4444', true);
    } else if (itemToUse === 'lightning_row') {
      soundManager.playLaser();
      for (let c = 0; c < BOARD_SIZE; c++) matchedPositions.add(`${pos.row},${c}`);
      for (let r = 0; r < BOARD_SIZE; r++) matchedPositions.add(`${r},${pos.col}`);
      particleRef.current?.addLaserBeam('row', pos.row, '#06B6D4');
      particleRef.current?.addLaserBeam('col', pos.col, '#06B6D4');
      particleRef.current?.triggerScreenShake(7);
      particleRef.current?.addScorePopup(x, y, '⚡ 십자 레이저! (0점)', '#06B6D4', true);
    } else if (itemToUse === 'rainbow_prism') {
      const targetGem = board[pos.row]?.[pos.col];
      if (targetGem) {
        soundManager.playRainbow();
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c]?.type === targetGem.type) {
              matchedPositions.add(`${r},${c}`);
              const px = (c + 0.5) * cellPx;
              const py = (r + 0.5) * cellPx;
              particleRef.current?.addExplosion(px, py, '#A855F7', 12);
            }
          }
        }
        particleRef.current?.triggerScreenShake(8);
        particleRef.current?.addScorePopup(x, y, `🌈 ${targetGem.type.toUpperCase()} 소멸! (0점)`, '#A855F7', true);
      }
    }

    if (matchedPositions.size > 0) {
      setIsProcessing(true);
      await runCascadeCycle(
        board,
        {
          matchedPositions,
          matchGroups: [],
          newSpecials: [],
        },
        1,
        true // isItemAction: true -> No points awarded from item use!
      );
    }
  };

  const handleRefillItems = () => {
    soundManager.playRainbow();
    setInventory({ ...INITIAL_INVENTORY });
    localStorage.setItem('jewel_inventory', JSON.stringify(INITIAL_INVENTORY));
    particleRef.current?.addScorePopup(220, 200, '🎁 모든 아이템 충전 완료!', '#10B981', true);
  };

  const targetScore = calculateTargetScore(level, targetRangePreset, targetMultiplier);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center gap-3 sm:gap-4 my-auto">
        {/* Heads Up Display */}
        <GameHUD
          score={score}
          highScore={highScore}
          level={level}
          targetScore={targetScore}
          combo={combo}
          gameMode={gameMode}
          targetRangePreset={targetRangePreset}
          targetMultiplier={targetMultiplier}
          timeLeft={timeLeft}
          maxTime={60}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(soundManager.toggleMute())}
          onHint={handleRequestHint}
          onRestart={handleRestart}
          onResetTarget={handleResetTarget}
          onResetHighScore={handleResetHighScore}
          onOpenRangeSettings={() => setShowRangeModal(true)}
          onSelectMode={handleSelectMode}
          onOpenPlan={() => setShowPlan(true)}
        />

        {/* 8x8 Jewel Board */}
        <GameBoard
          board={board}
          isProcessing={isProcessing}
          hintGem={hintGem}
          activeItem={activeItem}
          onSwap={handleSwap}
          onUseItemOnTile={handleUseItemOnTile}
          particleRef={particleRef}
          isShuffling={isShuffling}
        />

        {/* Item Arsenal Bar */}
        <ItemBar
          inventory={inventory}
          activeItem={activeItem}
          chargeProgress={chargeProgress}
          chargeThreshold={ITEM_CHARGE_THRESHOLD}
          onSelectItem={handleSelectItem}
          onCancelItem={() => setActiveItem(null)}
          onRefillAll={handleRefillItems}
          isProcessing={isProcessing}
        />

        {/* Bottom Quick Help Info */}
        <div className="w-full flex items-center justify-between text-[11px] text-slate-400 px-2 py-1 bg-slate-900/50 rounded-xl border border-slate-800/80 backdrop-blur-sm">
          <span>인접한 보석을 클릭하거나 스와이프하여 교환하세요</span>
          <button
            onClick={() => setShowRules(true)}
            className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2"
          >
            플레이 팁 & 가이드
          </button>
        </div>
      </div>

      {/* Modals & Overlays */}
      <Modals
        showPlan={showPlan}
        onClosePlan={() => setShowPlan(false)}
        isLevelCleared={gameState === 'level_cleared'}
        level={level}
        score={score}
        onNextLevel={handleNextLevel}
        isGameOver={gameState === 'game_over'}
        finalScore={score}
        highScore={highScore}
        gameMode={gameMode}
        onRetry={handleRestart}
        showRules={showRules}
        onCloseRules={() => setShowRules(false)}
        onOpenRules={() => setShowRules(true)}
      />

      {/* Target Score Range Settings Modal */}
      <TargetRangeModal
        isOpen={showRangeModal}
        onClose={() => setShowRangeModal(false)}
        currentPreset={targetRangePreset}
        currentMultiplier={targetMultiplier}
        currentLevel={level}
        onApplyRange={handleApplyRange}
      />

      {/* Subtle Footer */}
      <footer className="relative z-10 text-center py-2 text-[11px] text-slate-500">
        Jewel Quest · 8×8 Match-3 Puzzle Game
      </footer>
    </div>
  );
}
