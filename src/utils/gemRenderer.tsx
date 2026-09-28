import React from 'react';
import { GemType, SpecialType } from '../types/game';

export const GEM_PALETTE: Record<GemType, {
  name: string;
  koreanName: string;
  mainColor: string;
  glowColor: string;
  shapeDescription: string;
}> = {
  ruby: {
    name: 'Ruby',
    koreanName: '루비 (빨강)',
    mainColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    shapeDescription: '마름모 / 육각 다이아몬드 컷',
  },
  sapphire: {
    name: 'Sapphire',
    koreanName: '사파이어 (파랑)',
    mainColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    shapeDescription: '물방울 / 쿠션 헥사곤',
  },
  emerald: {
    name: 'Emerald',
    koreanName: '에메랄드 (초록)',
    mainColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    shapeDescription: '정사각 에메랄드 컷',
  },
  topaz: {
    name: 'Topaz',
    koreanName: '토파즈 (노랑)',
    mainColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    shapeDescription: '삼각형 트릴리언트 컷',
  },
  amethyst: {
    name: 'Amethyst',
    koreanName: '자수정 (보라)',
    mainColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.6)',
    shapeDescription: '오각형 브릴리언트 컷',
  },
  citrine: {
    name: 'Citrine',
    koreanName: '시트린 (주황)',
    mainColor: '#F97316',
    glowColor: 'rgba(249, 115, 22, 0.6)',
    shapeDescription: '타원 로젠지 컷',
  },
  diamond: {
    name: 'Diamond',
    koreanName: '다이아몬드 (청백)',
    mainColor: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    shapeDescription: '팔각 스타 프리즘 컷',
  },
};

interface GemVisualProps {
  type: GemType;
  special?: SpecialType;
  size?: number;
  isHint?: boolean;
  className?: string;
}

export const GemVisual: React.FC<GemVisualProps> = ({
  type,
  special = 'normal',
  size = 52,
  isHint = false,
  className = '',
}) => {
  const info = GEM_PALETTE[type] || GEM_PALETTE.ruby;

  // Render distinct faceted cuts per gem type for instant silhouette recognizability
  const renderCut = () => {
    switch (type) {
      case 'ruby': // Red Hexagonal Diamond
        return (
          <g>
            <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="#B91C1C" />
            <polygon points="50,14 80,32 80,68 50,86 20,68 20,32" fill="#DC2626" />
            {/* Top crown facets */}
            <polygon points="50,14 68,26 50,38 32,26" fill="#F87171" opacity="0.9" />
            <polygon points="50,14 80,32 68,26" fill="#EF4444" />
            <polygon points="50,14 20,32 32,26" fill="#FCA5A5" opacity="0.85" />
            {/* Table center */}
            <polygon points="50,38 68,26 68,62 50,74 32,62 32,26" fill="#EF4444" />
            {/* Specular sparkle highlight */}
            <polygon points="32,26 44,22 42,34 32,32" fill="#FFFFFF" opacity="0.75" />
            <circle cx="34" cy="28" r="3" fill="#FFFFFF" opacity="0.95" />
          </g>
        );

      case 'sapphire': // Blue Teardrop/Oval cut
        return (
          <g>
            <path
              d="M 50,8 C 76,8 88,34 88,60 C 88,80 72,92 50,92 C 28,92 12,80 12,60 C 12,34 24,8 50,8 Z"
              fill="#1D4ED8"
            />
            <path
              d="M 50,15 C 70,15 80,38 80,60 C 80,76 66,85 50,85 C 34,85 20,76 20,60 C 20,38 30,15 50,15 Z"
              fill="#2563EB"
            />
            {/* Facets */}
            <polygon points="50,22 68,40 50,56 32,40" fill="#60A5FA" opacity="0.8" />
            <polygon points="50,22 32,40 28,26" fill="#BFDBFE" opacity="0.75" />
            <polygon points="32,40 50,56 50,76 26,64" fill="#1E40AF" />
            <polygon points="68,40 50,56 50,76 74,64" fill="#3B82F6" />
            <ellipse cx="36" cy="30" rx="5" ry="3" fill="#FFFFFF" opacity="0.9" transform="rotate(-25 36 30)" />
          </g>
        );

      case 'emerald': // Green Square Octagonal Cut
        return (
          <g>
            <polygon points="26,10 74,10 90,26 90,74 74,90 26,90 10,74 10,26" fill="#047857" />
            <polygon points="30,16 70,16 84,30 84,70 70,84 30,84 16,70 16,30" fill="#059669" />
            {/* Inner table */}
            <polygon points="36,24 64,24 76,36 76,64 64,76 36,76 24,64 24,36" fill="#10B981" />
            {/* Crown facets */}
            <polygon points="30,16 70,16 64,24 36,24" fill="#34D399" opacity="0.85" />
            <polygon points="16,30 30,16 36,24 24,36" fill="#A7F3D0" opacity="0.8" />
            <polygon points="84,70 70,84 64,76 76,64" fill="#065F46" />
            <polygon points="24,36 36,24 30,32" fill="#FFFFFF" opacity="0.85" />
            <circle cx="28" cy="28" r="2.5" fill="#FFFFFF" />
          </g>
        );

      case 'topaz': // Amber Yellow Triangular Trilliant cut
        return (
          <g>
            <polygon points="50,10 92,82 8,82" fill="#B45309" />
            <polygon points="50,18 84,76 16,76" fill="#D97706" />
            {/* Inner facets radiating from center */}
            <polygon points="50,18 50,54 16,76" fill="#FBBF24" opacity="0.9" />
            <polygon points="50,18 84,76 50,54" fill="#F59E0B" />
            <polygon points="16,76 84,76 50,54" fill="#92400E" />
            {/* Center gem star */}
            <polygon points="50,30 65,62 35,62" fill="#FDE68A" opacity="0.75" />
            <ellipse cx="44" cy="36" rx="4" ry="2.5" fill="#FFFFFF" opacity="0.9" transform="rotate(-30 44 36)" />
          </g>
        );

      case 'amethyst': // Purple Brilliant Round / Pentagon Cut
        return (
          <g>
            <polygon points="50,8 90,38 75,88 25,88 10,38" fill="#5B21B6" />
            <polygon points="50,16 82,41 70,80 30,80 18,41" fill="#7C3AED" />
            {/* Center table pentagon */}
            <polygon points="50,28 72,45 64,70 36,70 28,45" fill="#8B5CF6" />
            {/* Upper facets */}
            <polygon points="50,16 50,28 28,45 18,41" fill="#DDD6FE" opacity="0.8" />
            <polygon points="50,16 82,41 72,45 50,28" fill="#A78BFA" opacity="0.7" />
            <circle cx="34" cy="34" r="3" fill="#FFFFFF" opacity="0.9" />
            <line x1="34" y1="28" x2="34" y2="40" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
            <line x1="28" y1="34" x2="40" y2="34" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
          </g>
        );

      case 'citrine': // Orange Lozenge / Oval Cut
        return (
          <g>
            <polygon points="50,8 92,50 50,92 8,50" fill="#C2410C" />
            <polygon points="50,16 84,50 50,84 16,50" fill="#EA580C" />
            <polygon points="50,28 72,50 50,72 28,50" fill="#FB923C" />
            <polygon points="50,16 84,50 72,50 50,28" fill="#F97316" />
            <polygon points="50,16 16,50 28,50 50,28" fill="#FDBA74" opacity="0.85" />
            <circle cx="38" cy="38" r="3" fill="#FFFFFF" opacity="0.9" />
          </g>
        );

      case 'diamond': // Cyan / White 8-Point Star Diamond Cut
      default:
        return (
          <g>
            <polygon points="50,6 64,22 88,22 76,46 88,70 64,70 50,94 36,70 12,70 24,46 12,22 36,22" fill="#0891B2" />
            <polygon points="50,14 60,26 78,26 69,46 78,66 60,66 50,86 40,66 22,66 31,46 22,26 40,26" fill="#06B6D4" />
            <polygon points="50,22 62,38 62,54 50,70 38,54 38,38" fill="#67E8F9" />
            <polygon points="50,14 50,22 38,38 22,26" fill="#CFFAFE" opacity="0.9" />
            <circle cx="42" cy="30" r="3.5" fill="#FFFFFF" opacity="0.95" />
            {/* Sparkle lines */}
            <line x1="42" y1="22" x2="42" y2="38" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.9" />
            <line x1="34" y1="30" x2="50" y2="30" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.9" />
          </g>
        );
    }
  };

  // Special Overlays: Bomb, Line, Rainbow
  const renderSpecialOverlay = () => {
    if (special === 'normal') return null;

    if (special === 'bomb') {
      return (
        <g className="animate-pulse">
          {/* Flame aura and bomb symbol */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#F59E0B" strokeWidth="3" opacity="0.75" strokeDasharray="6,4" />
          <circle cx="50" cy="50" r="16" fill="rgba(239, 68, 68, 0.85)" stroke="#FEF08A" strokeWidth="2" />
          {/* Flame Icon */}
          <path
            d="M 50,38 C 45,43 43,47 45,52 C 46,55 49,57 52,56 C 55,55 57,51 55,47 C 54,45 52,43 50,38 Z"
            fill="#FEF08A"
          />
          <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
        </g>
      );
    }

    if (special === 'line_horizontal') {
      return (
        <g>
          <circle cx="50" cy="50" r="44" fill="none" stroke="#67E8F9" strokeWidth="2" opacity="0.6" />
          {/* Horizontal laser beam indicators */}
          <line x1="4" y1="50" x2="96" y2="50" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <polygon points="8,50 18,44 18,56" fill="#FFFFFF" />
          <polygon points="92,50 82,44 82,56" fill="#FFFFFF" />
        </g>
      );
    }

    if (special === 'line_vertical') {
      return (
        <g>
          <circle cx="50" cy="50" r="44" fill="none" stroke="#67E8F9" strokeWidth="2" opacity="0.6" />
          {/* Vertical laser beam indicators */}
          <line x1="50" y1="4" x2="50" y2="96" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <polygon points="50,8 44,18 56,18" fill="#FFFFFF" />
          <polygon points="50,92 44,82 56,82" fill="#FFFFFF" />
        </g>
      );
    }

    if (special === 'rainbow') {
      return (
        <g>
          <defs>
            <linearGradient id="rainbow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="20%" stopColor="#F59E0B" />
              <stop offset="40%" stopColor="#10B981" />
              <stop offset="60%" stopColor="#06B6D4" />
              <stop offset="80%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#rainbow-grad)" strokeWidth="4" className="animate-spin origin-center" />
          <circle cx="50" cy="50" r="22" fill="url(#rainbow-grad)" opacity="0.9" />
          <polygon points="50,30 55,44 69,45 58,54 62,68 50,60 38,68 42,54 31,45 45,44" fill="#FFFFFF" />
        </g>
      );
    }

    return null;
  };

  return (
    <div
      className={`relative select-none flex items-center justify-center transition-transform ${className} ${
        isHint ? 'animate-bounce' : ''
      }`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md overflow-visible"
        style={{
          filter: isHint
            ? `drop-shadow(0 0 10px #F59E0B) drop-shadow(0 0 16px ${info.glowColor})`
            : special !== 'normal'
            ? `drop-shadow(0 0 8px ${info.glowColor})`
            : undefined,
        }}
      >
        {renderCut()}
        {renderSpecialOverlay()}
      </svg>
    </div>
  );
};
