import React from 'react';
import { ItemType } from '../types/game';
import { ITEM_DEFINITIONS } from '../utils/itemDefinitions';
import { Hammer, Bomb, Zap, Sparkles, Shuffle, X, Gift } from 'lucide-react';

interface ItemBarProps {
  inventory: Record<ItemType, number>;
  activeItem: ItemType | null;
  chargeProgress: number;
  chargeThreshold?: number;
  onSelectItem: (item: ItemType) => void;
  onCancelItem: () => void;
  onRefillAll: () => void;
  isProcessing: boolean;
}

export const ItemBar: React.FC<ItemBarProps> = ({
  inventory,
  activeItem,
  chargeProgress,
  chargeThreshold = 10000,
  onSelectItem,
  onCancelItem,
  onRefillAll,
  isProcessing,
}) => {
  const items: ItemType[] = ['hammer', 'bomb', 'lightning_row', 'rainbow_prism', 'shuffle_wand'];
  const progressPercent = Math.min(100, Math.floor((chargeProgress / chargeThreshold) * 100));

  const renderIcon = (type: ItemType, isSelected: boolean) => {
    const iconClass = `w-5 h-5 transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`;
    switch (type) {
      case 'hammer':
        return <Hammer className={`${iconClass} text-amber-400`} />;
      case 'bomb':
        return <Bomb className={`${iconClass} text-rose-400`} />;
      case 'lightning_row':
        return <Zap className={`${iconClass} text-cyan-400`} />;
      case 'rainbow_prism':
        return <Sparkles className={`${iconClass} text-purple-400`} />;
      case 'shuffle_wand':
        return <Shuffle className={`${iconClass} text-emerald-400`} />;
    }
  };

  const activeItemInfo = activeItem ? ITEM_DEFINITIONS[activeItem] : null;

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col gap-2">
      {/* Active Targeting Alert Banner */}
      {activeItem && activeItemInfo && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/60 shadow-lg shadow-indigo-500/20 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold text-amber-300">[{activeItemInfo.name}]</span>
            <span className="text-slate-300">보드에서 적용할 보석을 선택하세요</span>
          </div>
          <button
            onClick={onCancelItem}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>취소</span>
          </button>
        </div>
      )}

      {/* Main Item Container */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 shadow-xl backdrop-blur-md">
        {/* Header with 10,000pt Recharge Gauge */}
        <div className="flex items-center justify-between px-1 mb-1.5 flex-wrap gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-300 tracking-wide">아이템 보관함</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
              <Gift className="w-3 h-3 text-amber-400 animate-bounce" />
              <span>10,000점마다 1개 충전</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">· 아이템 점수 미부여 (0점)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
            <span className="text-amber-400">{chargeProgress.toLocaleString()}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{chargeThreshold.toLocaleString()}점</span>
          </div>
        </div>

        {/* Recharge Progress Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2.5 p-0.5 border border-slate-800 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 transition-all duration-300 rounded-full shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 5 Item Action Slots */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {items.map((type) => {
            const info = ITEM_DEFINITIONS[type];
            const count = inventory[type] || 0;
            const isSelected = activeItem === type;
            const isDisabled = count <= 0 || isProcessing;

            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectItem(type)}
                disabled={isDisabled}
                className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all select-none ${
                  isSelected
                    ? 'bg-indigo-950/90 border-amber-400 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50 scale-105 z-10'
                    : count > 0
                    ? 'bg-slate-900/80 border-slate-700/70 hover:border-slate-500 hover:bg-slate-800/80 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-40 cursor-not-allowed'
                }`}
                title={`${info.name} (${info.badge}) - ${info.description}`}
              >
                {/* Count Badge */}
                <div
                  className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black font-mono shadow-sm transition-transform ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 scale-110'
                      : count > 0
                      ? 'bg-indigo-600 text-white border border-indigo-400/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {count}
                </div>

                {/* Icon */}
                <div className="mb-1 p-1">
                  {renderIcon(type, isSelected)}
                </div>

                {/* Name */}
                <span
                  className={`text-[10px] sm:text-[11px] font-bold tracking-tight truncate w-full text-center ${
                    isSelected ? 'text-amber-300' : 'text-slate-300'
                  }`}
                >
                  {info.name}
                </span>

                {/* Subtitle / badge */}
                <span className="text-[9px] text-slate-400 hidden sm:block truncate w-full text-center">
                  {info.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
