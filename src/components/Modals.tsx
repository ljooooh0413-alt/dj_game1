import React from 'react';
import { GameMode } from '../types/game';
import { X, Trophy, Sparkles, CheckCircle2, RotateCcw, Play, BookOpen, Flame, Zap, CircleDot } from 'lucide-react';
import { GemVisual } from '../utils/gemRenderer';

interface ModalsProps {
  // Plan Modal
  showPlan: boolean;
  onClosePlan: () => void;

  // Level Clear Modal
  isLevelCleared: boolean;
  level: number;
  score: number;
  onNextLevel: () => void;

  // Game Over Modal
  isGameOver: boolean;
  finalScore: number;
  highScore: number;
  gameMode: GameMode;
  onRetry: () => void;

  // Rules Modal
  showRules: boolean;
  onCloseRules: () => void;
  onOpenRules: () => void;
}

export const Modals: React.FC<ModalsProps> = ({
  showPlan,
  onClosePlan,
  isLevelCleared,
  level,
  score,
  onNextLevel,
  isGameOver,
  finalScore,
  highScore,
  gameMode,
  onRetry,
  showRules,
  onCloseRules,
}) => {
  return (
    <>
      {/* 1. Implementation Plan Modal (구현 계획서) */}
      {showPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">보석 매치3 퍼즐 게임 구현 계획서</h2>
                  <p className="text-xs text-slate-400">Match-3 Jewel Puzzle Architecture & Technical Specification</p>
                </div>
              </div>
              <button
                onClick={onClosePlan}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
              {/* Section 1 */}
              <section className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <h3 className="text-base font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> 1. 프로젝트 개요 및 핵심 플레이 루프
                </h3>
                <p className="text-slate-300 mb-2">
                  본 프로젝트는 클래식 Bejeweled 및 Candy Crush 스타일의 <strong>8x8 그리드 기반 매치3 보석 퍼즐 게임</strong>입니다.
                  사용자는 인접한 두 보석의 위치를 교환하여 가로 또는 세로로 동일한 보석을 3개 이상 정렬하여 파괴하고 점수를 획득합니다.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-2">
                  <li><strong>사용자 입력:</strong> 클릭/터치 선택 후 인접 타일 교환 또는 직관적인 스와이프/드래그</li>
                  <li><strong>유효성 검사:</strong> 스와이프 시 3매치 또는 특수 보석 발동이 불가능하면 원래 자리로 롤백</li>
                  <li><strong>연쇄 처리:</strong> 매치 제거 → 빈 공간 중력 낙하 → 상단 신규 보석 생성 → 재검사 (캐스케이드 콤보)</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <h3 className="text-base font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 2. 보석 시스템 및 시각 디자인 설계
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <GemVisual type="ruby" size={32} />
                    <span className="text-xs font-semibold text-red-400">루비 (적색)</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <GemVisual type="sapphire" size={32} />
                    <span className="text-xs font-semibold text-blue-400">사파이어 (청색)</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <GemVisual type="emerald" size={32} />
                    <span className="text-xs font-semibold text-emerald-400">에메랄드 (녹색)</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <GemVisual type="topaz" size={32} />
                    <span className="text-xs font-semibold text-amber-400">토파즈 (황색)</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <GemVisual type="amethyst" size={32} />
                    <span className="text-xs font-semibold text-purple-400">자수정 (보라)</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <GemVisual type="diamond" size={32} />
                    <span className="text-xs font-semibold text-cyan-400">다이아 (청백)</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <GemVisual type="citrine" size={32} />
                    <span className="text-xs font-semibold text-orange-400">시트린 (주황)</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <GemVisual type="diamond" special="rainbow" size={32} />
                    <span className="text-xs font-semibold text-fuchsia-400">무지개 큐브</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  각 보석은 색상뿐만 아니라 고유한 패싯 컷(원형, 사각형, 삼각형, 오각형, 마름모, 별형)을 보유하여 색약/색맹 사용자도 실루엣만으로 즉시 구별할 수 있도록 설계되었습니다.
                </p>
              </section>

              {/* Section 3 */}
              <section className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <h3 className="text-base font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4" /> 3. 특수 보석 생성 및 결합 규칙
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-lg">
                    <Flame className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-amber-300">폭탄 보석 (Flame/Bomb Gem)</strong>: T자 또는 L자형 3x3 교차 매치 시 생성. 매치 시 주변 3x3 영역 전체 폭발.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-lg">
                    <Zap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-cyan-300">라인 빔 보석 (Laser Beam Gem)</strong>: 4개 연속 정렬 시 생성 (가로/세로). 매치 시 해당 행 또는 열 전체 관통 레이저 발사.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-lg">
                    <CircleDot className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-purple-300">무지개 하이퍼큐브 (Rainbow Cube)</strong>: 5개 연속 정렬 시 생성. 어떤 일반 보석과 교환해도 해당 색상의 보석을 맵 전체에서 일괄 소멸.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-lg">
                    <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-yellow-300">특수 조합 (Super Combo)</strong>: 무지개+무지개(전체 화면 청소), 폭탄+폭탄(초거대 5x5 폭발), 폭탄+라인(3행 3열 십자 빔).
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <h3 className="text-base font-bold text-pink-400 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 4. 중력 낙하, 콤보 및 자동 셔플 알고리즘
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 pl-1">
                  <li><strong>무한 루프 방지:</strong> 초기 보드 생성 시 3매치가 존재하지 않으면서 최소 1개 이상의 유효 교환이 존재하는 보드 보장.</li>
                  <li><strong>교착 상태 자동 감지:</strong> 유효한 이동이 전혀 남지 않은 경우 알림과 함께 보드를 자동으로 셔플(재배치).</li>
                  <li><strong>다단계 연쇄 콤보:</strong> 낙하 후 발생하는 추가 매치마다 콤보 카운트 증가(x2, x3, x4...) 및 점수 배수 가산.</li>
                  <li><strong>스마트 힌트 시스템:</strong> 5초 이상 입력이 없거나 '힌트' 버튼 클릭 시 유효한 교환 보석을 골드 펄스로 강조 표시.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <h3 className="text-base font-bold text-indigo-400 mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> 5. 게임 모드 구성 및 목표 점수 범위 체계
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs mb-3">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <h4 className="font-bold text-indigo-300 mb-1">클래식 모드</h4>
                    <p className="text-slate-400">레벨별 목표 점수를 달성하여 다음 스테이지로 진행하는 정통 퍼즐 모드.</p>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <h4 className="font-bold text-rose-300 mb-1">타임 어택 모드</h4>
                    <p className="text-slate-400">60초 제한 시간 동안 콤보를 극대화하여 최고 점수를 겨루는 스피드 챌린지.</p>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <h4 className="font-bold text-teal-300 mb-1">릴랙스 모드</h4>
                    <p className="text-slate-400">시간/이동 횟수 제한 없이 마음 편히 보석을 터뜨리는 무제한 힐링 모드.</p>
                  </div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="font-semibold text-amber-300 block mb-1">🎯 확장된 4단계 목표 점수 스케일:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                    <div>• <strong>컴팩트</strong>: 1.5천 ~ 5만점</div>
                    <div>• <strong>스탠다드</strong>: 3.5천 ~ 20만점</div>
                    <div>• <strong>와이드</strong>: 1만 ~ 50만점</div>
                    <div>• <strong>마라톤</strong>: 2.5만 ~ 200만점+</div>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <h3 className="text-base font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 6. Web Audio 신디사이저 & 캔버스 VFX
                </h3>
                <p className="text-xs text-slate-300">
                  외부 사운드 파일 의존성 없이 순수 브라우저 <code>Web Audio API</code> 오실레이터를 통해
                  맑고 청아한 크리스탈 차임(콤보 단계별 펜타토닉 음계 상승), 폭탄의 중저음 우퍼 럼블,
                  레이저 스위프 음을 실시간 합성 출력합니다.
                  또한 <code>HTML5 Canvas</code> 엔진을 통해 60FPS 파편 파티클, 별빛 반짝임, 플로팅 점수, 레이저 빔 이펙트를 제공합니다.
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={onClosePlan}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                확인 및 게임 계속하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Level Clear Modal */}
      {isLevelCleared && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-indigo-500/50 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/30">
              💎
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide mb-1">레벨 {level} 클리어!</h2>
            <p className="text-xs text-indigo-300 mb-4">목표 점수를 달성했습니다! 훌륭합니다!</p>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-5">
              <span className="text-xs text-slate-400 block mb-0.5">현재 누적 점수</span>
              <span className="text-2xl font-black font-mono text-amber-400">{score.toLocaleString()}</span>
            </div>

            <button
              onClick={onNextLevel}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> 다음 레벨 도전
            </button>
          </div>
        </div>
      )}

      {/* 3. Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-rose-950 border-2 border-rose-500/50 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-4xl shadow-lg shadow-rose-500/30">
              ⌛
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide mb-1">
              {gameMode === 'time_attack' ? '시간 종료!' : '게임 오버'}
            </h2>
            <p className="text-xs text-rose-300 mb-4">타임 어택 챌린지가 끝났습니다.</p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                <span className="text-[11px] text-slate-400 block">최종 점수</span>
                <span className="text-lg font-bold font-mono text-amber-400">{finalScore.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                <span className="text-[11px] text-slate-400 block">최고 기록</span>
                <span className="text-lg font-bold font-mono text-slate-200">{highScore.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onRetry}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> 다시 도전하기
            </button>
          </div>
        </div>
      )}

      {/* 4. Rules & How To Play Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>📖</span> 게임 플레이 방법
              </h3>
              <button onClick={onCloseRules} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300">
              <p>• 가로 또는 세로로 인접한 보석을 클릭하거나 드래그하여 교환하세요.</p>
              <p>• 동일한 보석이 3개 이상 정렬되거나, <strong>2×2 정사각형(4개)</strong>으로 모이면 반짝이며 터지고 점수를 획득합니다.</p>
              <p>• 연속으로 터질 때마다 콤보 보너스 배수가 급증합니다.</p>
              <p>• 4개 직선 정렬 시 행/열을 지우는 레이저 보석, T/L자 정렬 시 3x3 폭탄 보석, 5개 정렬 시 무지개 하이퍼큐브가 생성됩니다.</p>
              <p>• <strong>🎁 10,000점 아이템 자동 충전:</strong> 게임 플레이 중 10,000점을 달성할 때마다 하단 보관함에 5가지 아이템 중 1개가 무작위로 자동 충전됩니다!</p>
            </div>
            <button
              onClick={onCloseRules}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
};
