import { Gem, GemType, MatchGroup, Position, SpecialType } from '../types/game';

export const BOARD_SIZE = 8;
export const DEFAULT_GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'diamond'];

let gemIdCounter = 1;

export function getNextGemId(): string {
  return `gem_${Date.now()}_${gemIdCounter++}`;
}

export function getRandomGemType(gemTypes: GemType[] = DEFAULT_GEM_TYPES): GemType {
  const index = Math.floor(Math.random() * gemTypes.length);
  return gemTypes[index];
}

/**
 * Creates an 8x8 board with NO starting 3-matches, guaranteed to have at least one valid move.
 */
export function createInitialBoard(rows = BOARD_SIZE, cols = BOARD_SIZE, gemTypes = DEFAULT_GEM_TYPES): (Gem | null)[][] {
  let board: (Gem | null)[][] = [];
  let attempts = 0;

  do {
    board = [];
    for (let r = 0; r < rows; r++) {
      const row: (Gem | null)[] = [];
      for (let c = 0; c < cols; c++) {
        // Pick a gem type that does not form a 3-match with its left or top neighbors
        const forbidden: GemType[] = [];
        if (c >= 2 && row[c - 1]?.type === row[c - 2]?.type && row[c - 1]?.type) {
          forbidden.push(row[c - 1]!.type);
        }
        if (r >= 2 && board[r - 1][c]?.type === board[r - 2][c]?.type && board[r - 1][c]?.type) {
          forbidden.push(board[r - 1][c]!.type);
        }
        // Also forbid forming a 2x2 square initially
        if (r >= 1 && c >= 1) {
          const top = board[r - 1][c]?.type;
          const left = row[c - 1]?.type;
          const topLeft = board[r - 1][c - 1]?.type;
          if (top && top === left && top === topLeft) {
            forbidden.push(top);
          }
        }

        const validTypes = gemTypes.filter((t) => !forbidden.includes(t));
        const chosenType = validTypes[Math.floor(Math.random() * validTypes.length)] || getRandomGemType(gemTypes);

        row.push({
          id: getNextGemId(),
          type: chosenType,
          special: 'normal',
          row: r,
          col: c,
        });
      }
      board.push(row);
    }
    attempts++;
  } while ((!hasValidMoves(board, gemTypes).hasMoves || findMatches(board).matchedPositions.size > 0) && attempts < 100);

  return board;
}

/**
 * Check whether two positions are horizontally or vertically adjacent.
 */
export function isAdjacent(posA: Position, posB: Position): boolean {
  const rowDiff = Math.abs(posA.row - posB.row);
  const colDiff = Math.abs(posA.col - posB.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * Detect all standard horizontal and vertical matches (runs of 3+).
 * Also flags where special gems should be spawned.
 */
export function findMatches(
  board: (Gem | null)[][],
  preferredTriggerPos?: Position
): {
  matchedPositions: Set<string>; // "r,c"
  matchGroups: MatchGroup[];
  newSpecials: { pos: Position; special: SpecialType; gemType: GemType }[];
} {
  const rows = board.length;
  const cols = board[0].length;
  const matchedPositions = new Set<string>();
  const matchGroups: MatchGroup[] = [];
  const newSpecials: { pos: Position; special: SpecialType; gemType: GemType }[] = [];

  // Track runs
  const hRuns: { row: number; startCol: number; endCol: number; type: GemType }[] = [];
  const vRuns: { col: number; startRow: number; endRow: number; type: GemType }[] = [];

  // 1. Horizontal runs
  for (let r = 0; r < rows; r++) {
    let matchLen = 1;
    for (let c = 0; c < cols; c++) {
      const current = board[r][c];
      const next = c + 1 < cols ? board[r][c + 1] : null;

      if (current && next && current.type === next.type) {
        matchLen++;
      } else {
        if (matchLen >= 3 && current) {
          hRuns.push({
            row: r,
            startCol: c - matchLen + 1,
            endCol: c,
            type: current.type,
          });
        }
        matchLen = 1;
      }
    }
  }

  // 2. Vertical runs
  for (let c = 0; c < cols; c++) {
    let matchLen = 1;
    for (let r = 0; r < rows; r++) {
      const current = board[r][c];
      const next = r + 1 < rows ? board[r + 1][c] : null;

      if (current && next && current.type === next.type) {
        matchLen++;
      } else {
        if (matchLen >= 3 && current) {
          vRuns.push({
            col: c,
            startRow: r - matchLen + 1,
            endRow: r,
            type: current.type,
          });
        }
        matchLen = 1;
      }
    }
  }

  // Check for T / L shape intersections (Bomb creation!)
  const intersectedH = new Set<number>();
  const intersectedV = new Set<number>();

  hRuns.forEach((hr, hIdx) => {
    vRuns.forEach((vr, vIdx) => {
      if (hr.type === vr.type) {
        // Check intersection point
        if (vr.col >= hr.startCol && vr.col <= hr.endCol && hr.row >= vr.startRow && hr.row <= vr.endRow) {
          intersectedH.add(hIdx);
          intersectedV.add(vIdx);

          const intersectPos: Position = { row: hr.row, col: vr.col };
          newSpecials.push({
            pos: intersectPos,
            special: 'bomb',
            gemType: hr.type,
          });

          // Add all tiles from both
          const gemPositions: Position[] = [];
          for (let col = hr.startCol; col <= hr.endCol; col++) {
            matchedPositions.add(`${hr.row},${col}`);
            gemPositions.push({ row: hr.row, col });
          }
          for (let row = vr.startRow; row <= vr.endRow; row++) {
            matchedPositions.add(`${row},${vr.col}`);
            gemPositions.push({ row, col: vr.col });
          }
          matchGroups.push({
            gems: gemPositions,
            type: hr.type,
          });
        }
      }
    });
  });

  // Process remaining horizontal runs
  hRuns.forEach((hr, hIdx) => {
    if (intersectedH.has(hIdx)) return;

    const len = hr.endCol - hr.startCol + 1;
    const gemPositions: Position[] = [];
    for (let col = hr.startCol; col <= hr.endCol; col++) {
      matchedPositions.add(`${hr.row},${col}`);
      gemPositions.push({ row: hr.row, col });
    }

    // Determine special spawn pos (closest to user trigger pos, else middle)
    let spawnCol = Math.floor((hr.startCol + hr.endCol) / 2);
    if (preferredTriggerPos && preferredTriggerPos.row === hr.row && preferredTriggerPos.col >= hr.startCol && preferredTriggerPos.col <= hr.endCol) {
      spawnCol = preferredTriggerPos.col;
    }
    const spawnPos: Position = { row: hr.row, col: spawnCol };

    if (len >= 5) {
      newSpecials.push({
        pos: spawnPos,
        special: 'rainbow',
        gemType: hr.type,
      });
    } else if (len === 4) {
      newSpecials.push({
        pos: spawnPos,
        special: 'line_horizontal',
        gemType: hr.type,
      });
    }

    matchGroups.push({
      gems: gemPositions,
      type: hr.type,
    });
  });

  // Process remaining vertical runs
  vRuns.forEach((vr, vIdx) => {
    if (intersectedV.has(vIdx)) return;

    const len = vr.endRow - vr.startRow + 1;
    const gemPositions: Position[] = [];
    for (let row = vr.startRow; row <= vr.endRow; row++) {
      matchedPositions.add(`${row},${vr.col}`);
      gemPositions.push({ row, col: vr.col });
    }

    // Determine special spawn pos
    let spawnRow = Math.floor((vr.startRow + vr.endRow) / 2);
    if (preferredTriggerPos && preferredTriggerPos.col === vr.col && preferredTriggerPos.row >= vr.startRow && preferredTriggerPos.row <= vr.endRow) {
      spawnRow = preferredTriggerPos.row;
    }
    const spawnPos: Position = { row: spawnRow, col: vr.col };

    if (len >= 5) {
      newSpecials.push({
        pos: spawnPos,
        special: 'rainbow',
        gemType: vr.type,
      });
    } else if (len === 4) {
      newSpecials.push({
        pos: spawnPos,
        special: 'line_vertical',
        gemType: vr.type,
      });
    }

    matchGroups.push({
      gems: gemPositions,
      type: vr.type,
    });
  });

  // 3. 2x2 Square matches (2×2 정사각형 매치: 4개가 사각형으로 모인 경우 파괴)
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const gTL = board[r][c];
      const gTR = board[r][c + 1];
      const gBL = board[r + 1][c];
      const gBR = board[r + 1][c + 1];

      if (
        gTL &&
        gTR &&
        gBL &&
        gBR &&
        gTL.type === gTR.type &&
        gTL.type === gBL.type &&
        gTL.type === gBR.type
      ) {
        matchedPositions.add(`${r},${c}`);
        matchedPositions.add(`${r},${c + 1}`);
        matchedPositions.add(`${r + 1},${c}`);
        matchedPositions.add(`${r + 1},${c + 1}`);

        matchGroups.push({
          gems: [
            { row: r, col: c },
            { row: r, col: c + 1 },
            { row: r + 1, col: c },
            { row: r + 1, col: c + 1 },
          ],
          type: gTL.type,
        });
      }
    }
  }

  // Trigger special gem powers for any matched gems that already had a special power!
  const processedSpecials = new Set<string>();
  const toProcess: Position[] = [];

  matchedPositions.forEach((key) => {
    const [r, c] = key.split(',').map(Number);
    const gem = board[r]?.[c];
    if (gem && gem.special !== 'normal') {
      toProcess.push({ row: r, col: c });
      processedSpecials.add(key);
    }
  });

  while (toProcess.length > 0) {
    const cur = toProcess.pop()!;
    const gem = board[cur.row]?.[cur.col];
    if (!gem) continue;

    if (gem.special === 'bomb') {
      // Explode 3x3 surrounding
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = cur.row + dr;
          const nc = cur.col + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const key = `${nr},${nc}`;
            if (!matchedPositions.has(key)) {
              matchedPositions.add(key);
              const neighbor = board[nr][nc];
              if (neighbor && neighbor.special !== 'normal' && !processedSpecials.has(key)) {
                toProcess.push({ row: nr, col: nc });
                processedSpecials.add(key);
              }
            }
          }
        }
      }
    } else if (gem.special === 'line_horizontal') {
      // Clear entire row
      for (let c = 0; c < cols; c++) {
        const key = `${cur.row},${c}`;
        if (!matchedPositions.has(key)) {
          matchedPositions.add(key);
          const neighbor = board[cur.row][c];
          if (neighbor && neighbor.special !== 'normal' && !processedSpecials.has(key)) {
            toProcess.push({ row: cur.row, col: c });
            processedSpecials.add(key);
          }
        }
      }
    } else if (gem.special === 'line_vertical') {
      // Clear entire col
      for (let r = 0; r < rows; r++) {
        const key = `${r},${cur.col}`;
        if (!matchedPositions.has(key)) {
          matchedPositions.add(key);
          const neighbor = board[r][cur.col];
          if (neighbor && neighbor.special !== 'normal' && !processedSpecials.has(key)) {
            toProcess.push({ row: r, col: cur.col });
            processedSpecials.add(key);
          }
        }
      }
    } else if (gem.special === 'rainbow') {
      // Clear all gems of a random type or board's most frequent type
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (board[r][c]?.type === gem.type) {
            const key = `${r},${c}`;
            matchedPositions.add(key);
          }
        }
      }
    }
  }

  return { matchedPositions, matchGroups, newSpecials };
}

/**
 * Handle a direct swap between two gems.
 * Special cases:
 * - Rainbow + any gem: destroys all gems of that color
 * - Rainbow + Rainbow: clears the entire board!
 * - Bomb + Bomb: clears 5x5 massive explosion!
 * - Bomb + Line: clears 3 rows and 3 columns!
 */
export function handleSpecialSwap(
  gemA: Gem,
  gemB: Gem,
  board: (Gem | null)[][]
): { handled: boolean; matchedPositions: Set<string>; specialDescription?: string } {
  const rows = board.length;
  const cols = board[0].length;
  const matched = new Set<string>();

  // Rainbow + Rainbow: Cosmic Wipeout!
  if (gemA.special === 'rainbow' && gemB.special === 'rainbow') {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        matched.add(`${r},${c}`);
      }
    }
    return { handled: true, matchedPositions: matched, specialDescription: 'COSMIC BOARD WIPEOUT!' };
  }

  // Rainbow + Regular/Special gem
  if (gemA.special === 'rainbow' || gemB.special === 'rainbow') {
    const rainbowGem = gemA.special === 'rainbow' ? gemA : gemB;
    const targetGem = gemA.special === 'rainbow' ? gemB : gemA;

    matched.add(`${rainbowGem.row},${rainbowGem.col}`);
    matched.add(`${targetGem.row},${targetGem.col}`);

    const targetType = targetGem.type;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c]?.type === targetType) {
          matched.add(`${r},${c}`);
        }
      }
    }
    return { handled: true, matchedPositions: matched, specialDescription: `RAINBOW CLEARED ALL ${targetType.toUpperCase()}!` };
  }

  // Bomb + Bomb: Mega 5x5 blast
  if (gemA.special === 'bomb' && gemB.special === 'bomb') {
    const centerR = Math.floor((gemA.row + gemB.row) / 2);
    const centerC = Math.floor((gemA.col + gemB.col) / 2);
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const nr = centerR + dr;
        const nc = centerC + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          matched.add(`${nr},${nc}`);
        }
      }
    }
    return { handled: true, matchedPositions: matched, specialDescription: 'MEGA 5x5 BOMB EXPLOSION!' };
  }

  // Bomb + Line: Cross 3-line wipeout
  const isLineA = gemA.special === 'line_horizontal' || gemA.special === 'line_vertical';
  const isLineB = gemB.special === 'line_horizontal' || gemB.special === 'line_vertical';

  if ((gemA.special === 'bomb' && isLineB) || (gemB.special === 'bomb' && isLineA)) {
    const r = gemA.row;
    const c = gemA.col;
    for (let dr = -1; dr <= 1; dr++) {
      const targetR = r + dr;
      if (targetR >= 0 && targetR < rows) {
        for (let col = 0; col < cols; col++) matched.add(`${targetR},${col}`);
      }
    }
    for (let dc = -1; dc <= 1; dc++) {
      const targetC = c + dc;
      if (targetC >= 0 && targetC < cols) {
        for (let row = 0; row < rows; row++) matched.add(`${row},${targetC}`);
      }
    }
    return { handled: true, matchedPositions: matched, specialDescription: 'TRIPLE LINE BLASTER!' };
  }

  // Line + Line: Clears both row and column (Cross Laser)
  if (isLineA && isLineB) {
    for (let c = 0; c < cols; c++) matched.add(`${gemA.row},${c}`);
    for (let r = 0; r < rows; r++) matched.add(`${r},${gemA.col}`);
    return { handled: true, matchedPositions: matched, specialDescription: 'CROSS LASER BLAST!' };
  }

  return { handled: false, matchedPositions: matched };
}

/**
 * Check if the board currently contains any valid moves that the player can make.
 * Also returns the first hint found!
 */
export function hasValidMoves(
  board: (Gem | null)[][],
  gemTypes: GemType[] = DEFAULT_GEM_TYPES
): { hasMoves: boolean; hintMove?: { from: Position; to: Position } } {
  const rows = board.length;
  const cols = board[0].length;

  // Clone board representation for simulation
  const clone = board.map((r) => r.map((g) => (g ? { ...g } : null)));

  const directions = [
    { dr: 0, dc: 1 }, // Right
    { dr: 1, dc: 0 }, // Down
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gem = clone[r][c];
      if (!gem) continue;

      for (const { dr, dc } of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr < rows && nc < cols) {
          const neighbor = clone[nr][nc];
          if (!neighbor) continue;

          // Special swap combination check (e.g. rainbow, two specials)
          if (gem.special !== 'normal' || neighbor.special !== 'normal') {
            if (gem.special === 'rainbow' || neighbor.special === 'rainbow' || (gem.special !== 'normal' && neighbor.special !== 'normal')) {
              return {
                hasMoves: true,
                hintMove: { from: { row: r, col: c }, to: { row: nr, col: nc } },
              };
            }
          }

          // Swap and test
          clone[r][c] = neighbor;
          clone[nr][nc] = gem;

          const matches = findMatches(clone);
          if (matches.matchedPositions.size > 0) {
            // Revert
            clone[r][c] = gem;
            clone[nr][nc] = neighbor;
            return {
              hasMoves: true,
              hintMove: { from: { row: r, col: c }, to: { row: nr, col: nc } },
            };
          }

          // Revert
          clone[r][c] = gem;
          clone[nr][nc] = neighbor;
        }
      }
    }
  }

  return { hasMoves: false };
}

/**
 * Shuffle the board when no valid moves are left.
 */
export function shuffleBoard(
  board: (Gem | null)[][],
  gemTypes: GemType[] = DEFAULT_GEM_TYPES
): (Gem | null)[][] {
  const rows = board.length;
  const cols = board[0].length;
  const allGems: Gem[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gem = board[r][c];
      if (gem) allGems.push(gem);
    }
  }

  let attempts = 0;
  let newBoard: (Gem | null)[][] = [];

  do {
    // Fisher-Yates shuffle
    for (let i = allGems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allGems[i], allGems[j]] = [allGems[j], allGems[i]];
    }

    newBoard = [];
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      const row: (Gem | null)[] = [];
      for (let c = 0; c < cols; c++) {
        const gem = { ...allGems[idx], row: r, col: c };
        row.push(gem);
        idx++;
      }
      newBoard.push(row);
    }

    // Must not have immediate matches, but must have valid moves
    const currentMatches = findMatches(newBoard);
    const validMoves = hasValidMoves(newBoard, gemTypes);

    if (currentMatches.matchedPositions.size === 0 && validMoves.hasMoves) {
      return newBoard;
    }

    attempts++;
  } while (attempts < 50);

  // If hard to shuffle without matches, regenerate fresh initial board
  return createInitialBoard(rows, cols, gemTypes);
}

/**
 * Drop gems down into empty spots, and spawn new gems from the top.
 */
export function dropGemsAndRefill(
  board: (Gem | null)[][],
  gemTypes: GemType[] = DEFAULT_GEM_TYPES
): { newBoard: (Gem | null)[][]; droppedCount: number } {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard: (Gem | null)[][] = board.map((r) => [...r]);
  let droppedCount = 0;

  for (let c = 0; c < cols; c++) {
    let emptyRow = rows - 1;

    // Shift existing gems down
    for (let r = rows - 1; r >= 0; r--) {
      if (newBoard[r][c] !== null) {
        if (emptyRow !== r) {
          newBoard[emptyRow][c] = {
            ...newBoard[r][c]!,
            row: emptyRow,
            col: c,
          };
          newBoard[r][c] = null;
          droppedCount++;
        }
        emptyRow--;
      }
    }

    // Refill remaining top empty cells
    for (let r = emptyRow; r >= 0; r--) {
      newBoard[r][c] = {
        id: getNextGemId(),
        type: getRandomGemType(gemTypes),
        special: 'normal',
        row: r,
        col: c,
      };
      droppedCount++;
    }
  }

  return { newBoard, droppedCount };
}
