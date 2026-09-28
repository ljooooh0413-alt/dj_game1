import React from 'react';
import { GameMode, TargetRangePreset } from '../types/game';
import { TARGET_PRESETS } from '../utils/scoreTargets';
import { Volume2, VolumeX, Lightbulb, RotateCcw, FileText, Sparkles, Trophy, Timer, Sliders } from 'lucide-react';

interface GameHUDProps {
  score: number;
  highScore: number;
  level: number;
  targetScore: number;
  combo: number;
  gameMode: GameMode;
  targetRangePreset: TargetRangePreset;
  targetMultiplier: number;
  timeLeft?: number;
  maxTime?: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onHint: () => void;
  onRestart: () => void;
  onResetTarget: () => void;
  onResetHighScore?: () => void;
  onOpenRangeSettings: () => void;
  onSelectMode: (mode: GameMode) => void;
  onOpenPlan: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  level,
  targetScore,
  combo,
  gameMode,
  targetRangePreset,
  targetMultiplier,
  timeLeft = 60,
  maxTime = 60,
  isMuted,
  onToggleMute,
  onHint,
  onRestart,
  onResetTarget,
  onResetHighScore,
  onOpenRangeSettings,
  onSelectMode,
  onOpenPlan,
}) => {
  const levelProgress = Math.min(100, Math.floor((score / targetScore) * 100));
  const timeProgress = maxTime > 0 ? Math.max(0, Math.min(100, (timeLeft / maxTime) * 100)) : 100;
  const currentPresetInfo = TARGET_PRESETS[targetRangePreset] || TARGET_PRESETS.standard;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3">
      {/* Top Navbar */}
      <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60 shadow-lg">
        {/* Title & Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-rose-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 leading-none">
              보석 매치 3
            </h1>
            <span className="text-[11px] text-slate-400 font-medium">Jewel Quest</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenPlan}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400 transition-all shadow-sm"
            title="구현 계획서 및 시스템 설계서 보기"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">구현 계획서</span>
          </button>

          <button
            onClick={onHint}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 hover:border-amber-400 transition-all shadow-sm"
            title="유효한 이동 힌트 찾기"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>힌트</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg text-slate-300 bg-slate-800/80 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onRestart}
            className="p-1.5 rounded-lg text-slate-300 bg-slate-800/80 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors"
            title="새 게임 시작"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="inline-flex p-1 bg-slate-900/60 rounded-xl border border-slate-800 backdrop-blur-sm">
          <button
            onClick={() => onSelectMode('classic')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              gameMode === 'classic'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            클래식 모드
          </button>
          <button
            onClick={() => onSelectMode('time_attack')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              gameMode === 'time_attack'
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            타임 어택
          </button>
          <button
            onClick={() => onSelectMode('endless')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              gameMode === 'endless'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            릴랙스 모드
          </button>
        </div>

        {/* Combo Badge */}
        {combo > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 animate-pulse text-xs font-bold tracking-wider shadow-md">
            <span>🔥 콤보 x{combo}</span>
          </div>
        )}
      </div>

      {/* Score & Progression Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Current Score */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[11px] font-medium text-slate-400">현재 점수</span>
          <span className="text-xl font-extrabold text-amber-400 font-mono tracking-tight">
            {score.toLocaleString()}
          </span>
        </div>

        {/* High Score */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-center">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>최고 기록</span>
            </div>
            {onResetHighScore && highScore > 0 && (
              <button
                onClick={onResetHighScore}
                className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
                title="최고 기록 초기화"
              >
                초기화
              </button>
            )}
          </div>
          <span className="text-xl font-bold text-slate-200 font-mono tracking-tight">
            {highScore.toLocaleString()}
          </span>
        </div>

        {/* Mode-specific Metric: Level / Timer */}
        {gameMode === 'classic' && (
           <div className="col-span-2 bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between">
             <div className="flex justify-between items-center text-[11px]">
               <div className="flex items-center gap-1.5 flex-wrap">
                 <span className="font-semibold text-indigo-300">레벨 {level}</span>
                 <button
                   onClick={onOpenRangeSettings}
                   className="px-2 py-0.5 text-[10px] font-semibold text-indigo-300 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/40 rounded flex items-center gap-1 transition-all shadow-sm"
                   title="목표 점수 범위 및 배율 설정"
                 >
                   <Sliders className="w-2.5 h-2.5" />
                   <span>범위: {currentPresetInfo.name}</span>
                 </button>
                 <button
                   onClick={onResetTarget}
                   className="px-2 py-0.5 text-[10px] font-semibold text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 rounded flex items-center gap-1 transition-all shadow-sm"
                   title="목표 점수를 레벨 1로 리셋"
                 >
                   <RotateCcw className="w-2.5 h-2.5" />
                   <span>리셋</span>
                 </button>
               </div>
               <span className="text-slate-400 font-mono font-medium">
                 {score.toLocaleString()} / {targetScore.toLocaleString()}
               </span>
             </div>
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
               <div
                 className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                 style={{ width: `${levelProgress}%` }}
               />
             </div>
           </div>
        )}

        {gameMode === 'time_attack' && (
          <div className="col-span-2 bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-rose-300 flex items-center gap-1">
                <Timer className="w-3 h-3 text-rose-400" /> 남은 시간
              </span>
              <span className={`font-mono font-bold ${timeLeft <= 10 ? 'text-rose-400 animate-ping' : 'text-slate-200'}`}>
                {timeLeft}초
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  timeLeft <= 10 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                }`}
                style={{ width: `${timeProgress}%` }}
              />
            </div>
          </div>
        )}

        {gameMode === 'endless' && (
          <div className="col-span-2 bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 block">릴랙스 모드</span>
              <span className="text-xs text-slate-400">시간/이동 제한 없이 자유롭게 플레이</span>
            </div>
            <span className="text-lg">🌿</span>
          </div>
        )}
      </div>
    </div>
  );
};
