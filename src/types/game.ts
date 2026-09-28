export type GemType = 'ruby' | 'sapphire' | 'emerald' | 'topaz' | 'amethyst' | 'citrine' | 'diamond';

export type SpecialType = 'normal' | 'bomb' | 'line_horizontal' | 'line_vertical' | 'rainbow';

export interface Gem {
  id: string;
  type: GemType;
  special: SpecialType;
  row: number;
  col: number;
  isMatched?: boolean;
  isHint?: boolean;
  isSwapping?: boolean;
}

export type GameMode = 'classic' | 'time_attack' | 'endless';

export type TargetRangePreset = 'compact' | 'standard' | 'wide' | 'marathon';

export type GameState = 'menu' | 'playing' | 'paused' | 'level_cleared' | 'game_over';

export interface Position {
  row: number;
  col: number;
}

export interface MatchGroup {
  gems: Position[];
  type: GemType;
  isSpecialCreation?: {
    position: Position;
    specialType: SpecialType;
    gemType: GemType;
  };
}

export interface LevelConfig {
  level: number;
  targetScore: number;
  movesAllowed?: number; // for classic move limit if enabled
  timeLimit?: number; // for time attack
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  shape?: 'shard' | 'star' | 'circle';
}

export interface ScorePopup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  isCombo?: boolean;
}

export interface LaserBeam {
  id: number;
  type: 'row' | 'col';
  index: number;
  color: string;
  alpha: number;
}

export type ItemType = 'hammer' | 'bomb' | 'lightning_row' | 'rainbow_prism' | 'shuffle_wand';

export interface ItemInfo {
  type: ItemType;
  name: string;
  badge: string;
  description: string;
  requiresTarget: boolean;
  color: string;
  glowColor: string;
}

export type InventoryState = Record<ItemType, number>;
