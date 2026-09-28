import { ItemInfo, ItemType } from '../types/game';

export const INITIAL_INVENTORY: Record<ItemType, number> = {
  hammer: 3,
  bomb: 2,
  lightning_row: 2,
  rainbow_prism: 1,
  shuffle_wand: 2,
};

export const ITEM_DEFINITIONS: Record<ItemType, ItemInfo> = {
  hammer: {
    type: 'hammer',
    name: '매직 해머',
    badge: '단일 파괴',
    description: '선택한 보석 1개를 즉각 파괴합니다 (점수 0점 / 위기 탈출용).',
    requiresTarget: true,
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.5)',
  },
  bomb: {
    type: 'bomb',
    name: '메가 폭탄',
    badge: '3x3 광역 폭발',
    description: '선택한 위치를 중심으로 3×3 영역을 폭파합니다 (점수 0점 / 위기 탈출용).',
    requiresTarget: true,
    color: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
  lightning_row: {
    type: 'lightning_row',
    name: '십자 레이저',
    badge: '가로/세로 관통',
    description: '선택한 타일의 가로 행과 세로 열을 레이저로 일소합니다 (점수 0점).',
    requiresTarget: true,
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.5)',
  },
  rainbow_prism: {
    type: 'rainbow_prism',
    name: '무지개 프리즘',
    badge: '색상 일괄 소멸',
    description: '선택한 보석과 같은 색상의 모든 보석을 맵 전체에서 제거합니다 (점수 0점).',
    requiresTarget: true,
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
  shuffle_wand: {
    type: 'shuffle_wand',
    name: '셔플 완드',
    badge: '즉시 재배치',
    description: '즉시 보드의 모든 보석을 마법으로 재배치합니다 (점수 0점).',
    requiresTarget: false,
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.5)',
  },
};
