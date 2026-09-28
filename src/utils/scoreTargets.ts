import { TargetRangePreset } from '../types/game';

export interface RangePresetInfo {
  id: TargetRangePreset;
  name: string;
  badge: string;
  description: string;
  baseL1: number;
  sampleRange: string;
  gradient: string;
}

export const TARGET_PRESETS: Record<TargetRangePreset, RangePresetInfo> = {
  compact: {
    id: 'compact',
    name: '컴팩트',
    badge: '빠른 진행',
    description: '1,500점부터 시작하여 빠른 템포로 레벨업을 즐기는 모드',
    baseL1: 1500,
    sampleRange: '1.5천 ~ 5만점',
    gradient: 'from-emerald-500 to-teal-600',
  },
  standard: {
    id: 'standard',
    name: '스탠다드',
    badge: '기본 권장',
    description: '3,500점부터 시작하여 점진적으로 확장되는 균형잡힌 목표',
    baseL1: 3500,
    sampleRange: '3.5천 ~ 20만점',
    gradient: 'from-blue-500 to-indigo-600',
  },
  wide: {
    id: 'wide',
    name: '와이드 챌린지',
    badge: '확장 범위',
    description: '10,000점부터 시작하여 대규모 콤보와 전략을 요구하는 고득점 범위',
    baseL1: 10000,
    sampleRange: '1만 ~ 50만점',
    gradient: 'from-amber-500 to-orange-600',
  },
  marathon: {
    id: 'marathon',
    name: '메가 마라톤',
    badge: '초광범위',
    description: '25,000점부터 수백만 점까지 이어지는 장기전 익스트림 퍼즐',
    baseL1: 25000,
    sampleRange: '2.5만 ~ 200만점+',
    gradient: 'from-rose-500 to-purple-600',
  },
};

/**
 * Calculates a cleanly rounded target score for any level based on the selected range preset and multiplier.
 */
export function calculateTargetScore(
  level: number,
  preset: TargetRangePreset = 'standard',
  multiplier: number = 1
): number {
  const base = TARGET_PRESETS[preset]?.baseL1 || 3500;
  const l = Math.max(1, level);

  // Progressive quadratic growth curve: L1 = 1x, L2 ≈ 2.4x, L3 ≈ 4.5x, L5 ≈ 11.5x, L10 ≈ 47x
  const growthFactor = 1 + (l - 1) * 1.1 + ((l - 1) * (l - 1)) * 0.35;
  const rawScore = base * growthFactor * Math.max(0.2, multiplier);

  // Clean rounding
  if (rawScore < 10000) {
    return Math.round(rawScore / 100) * 100;
  } else if (rawScore < 100000) {
    return Math.round(rawScore / 500) * 500;
  } else {
    return Math.round(rawScore / 1000) * 1000;
  }
}
