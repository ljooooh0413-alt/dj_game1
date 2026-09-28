import React, { useState } from 'react';
import { TargetRangePreset } from '../types/game';
import { TARGET_PRESETS, calculateTargetScore } from '../utils/scoreTargets';
import { X, Sliders, Check, Sparkles, ArrowRight } from 'lucide-react';

interface TargetRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: TargetRangePreset;
  currentMultiplier: number;
  currentLevel: number;
  onApplyRange: (preset: TargetRangePreset, multiplier: number, resetLevel: boolean) => void;
}

export const TargetRangeModal: React.FC<TargetRangeModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  currentMultiplier,
  currentLevel,
  onApplyRange,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<TargetRangePreset>(currentPreset);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(currentMultiplier);
  const [resetLevelOnApply, setResetLevelOnApply] = useState<boolean>(false);

  if (!isOpen) return null;

  const multipliers = [0.5, 1.0, 1.5, 2.0, 3.0];
  const previewLevels = [1, 2, 3, 5, 10];

  const handleConfirm = () => {
    onApplyRange(selectedPreset, selectedMultiplier, resetLevelOnApply);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">목표 점수 범위 설정</h2>
              <p className="text-xs text-slate-400">플레이 스타일에 맞는 목표 점수 스케일을 선택하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Preset Cards */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">목표 점수 범위 프리셋</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(TARGET_PRESETS) as TargetRangePreset[]).map((key) => {
                const preset = TARGET_PRESETS[key];
                const isSelected = selectedPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPreset(key)}
                    className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm flex items-center gap-1.5">
                          {preset.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium bg-gradient-to-r ${preset.gradient} text-white`}>
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight mb-2">
                        {preset.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
                      <span className="text-slate-500 text-[11px]">범위:</span>
                      <span className="font-mono font-bold text-amber-400 text-xs">{preset.sampleRange}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multiplier Scale */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">추가 배율 조정</label>
              <span className="text-xs font-mono text-indigo-400 font-bold">{selectedMultiplier}x 배율</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {multipliers.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMultiplier(m)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    selectedMultiplier === m
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Preview Table */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>레벨별 목표 점수 미리보기</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {previewLevels.map((lvl) => {
                const target = calculateTargetScore(lvl, selectedPreset, selectedMultiplier);
                return (
                  <div key={lvl} className="bg-slate-900/80 border border-slate-800/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">레벨 {lvl}</span>
                    <span className="text-xs font-bold font-mono text-amber-300 mt-0.5 block truncate">
                      {target >= 10000 ? `${(target / 1000).toFixed(1)}k` : target.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset Level Option */}
          <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">레벨 1부터 새로 시작</span>
              <span className="text-[11px] text-slate-400">
                {resetLevelOnApply
                  ? '범위 적용 시 레벨 1로 초기화됩니다'
                  : `현재 레벨(${currentLevel})을 유지하며 새 목표 점수가 적용됩니다`}
              </span>
            </div>
            <input
              type="checkbox"
              id="reset-level-check"
              checked={resetLevelOnApply}
              onChange={(e) => setResetLevelOnApply(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-900 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>범위 적용하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
