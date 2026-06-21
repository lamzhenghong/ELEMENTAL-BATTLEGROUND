import React, { useState, useEffect } from 'react';
import { X, Check, Lock, Gift, Sparkles, Star, Shield, Coins, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import { AetheriaAudioEngine } from '../utils/audio';

interface LoginRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimedDays: number[];
  unlockedDaysCount: number;
  nextRewardUnlockTime: number;
  onClaimDay: (day: number) => void;
}

export default function LoginRewardModal({ 
  isOpen, 
  onClose, 
  claimedDays, 
  unlockedDaysCount, 
  nextRewardUnlockTime, 
  onClaimDay 
}: LoginRewardModalProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (claimedDays.length >= 7) {
      setTimeLeft('All rewards claimed!');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = nextRewardUnlockTime - now;
      if (diff <= 0) {
        setTimeLeft('Next reward is ready!');
      } else {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextRewardUnlockTime, claimedDays.length]);

  if (!isOpen) return null;

  const REWARDS_INFO = [
    {
      day: 1,
      title: '4-Star Hero',
      desc: 'Get a random 4-Star companion.',
      icon: <Gift className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />,
      tag: 'HERO',
      colorClass: 'from-indigo-900/40 to-slate-900/60 border-indigo-500/30'
    },
    {
      day: 2,
      title: '4-Star Weapon',
      desc: 'Get a random 4-Star weapon.',
      icon: <Shield className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />,
      tag: 'WEAPON',
      colorClass: 'from-purple-900/40 to-slate-900/60 border-purple-500/30'
    },
    {
      day: 3,
      title: '3,000 Gems',
      desc: 'Wishes for gacha summons.',
      icon: <Sparkles className="w-6 h-6 text-sky-400" />,
      tag: 'GEMS',
      colorClass: 'from-sky-900/40 to-slate-900/60 border-sky-500/35'
    },
    {
      day: 4,
      title: '20,000 Mora',
      desc: 'Gold currency for upgrades.',
      icon: <Coins className="w-6 h-6 text-yellow-500" />,
      tag: 'MORA',
      colorClass: 'from-yellow-900/30 to-slate-900/60 border-yellow-500/25'
    },
    {
      day: 5,
      title: '50,000 Mora',
      desc: 'Gold currency for upgrades.',
      icon: <Coins className="w-6 h-6 text-amber-500" />,
      tag: 'MORA',
      colorClass: 'from-amber-900/30 to-slate-900/60 border-amber-500/25'
    },
    {
      day: 6,
      title: '5,000 Gems',
      desc: 'Wishes for gacha summons.',
      icon: <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />,
      tag: 'GEMS',
      colorClass: 'from-pink-900/40 to-slate-900/60 border-pink-500/30'
    },
    {
      day: 7,
      title: '5-Star Deity',
      desc: 'Guaranteed 5-Star Deity.',
      icon: <Star className="w-7 h-7 text-amber-400 fill-amber-400 animate-bounce" />,
      tag: 'LEGEND',
      colorClass: 'from-amber-500/20 via-slate-900/70 to-yellow-950/30 border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
    }
  ];

  const currentClaimableDay = claimedDays.length + 1;

  const handleClaim = (day: number) => {
    // Can only claim if it is the current sequential unclaimed day AND it is unlocked
    if (day !== currentClaimableDay || day > unlockedDaysCount) return;
    AetheriaAudioEngine.playWaveClear();
    onClaimDay(day);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-5xl bg-gradient-to-b from-[#0d1222] to-[#04060c] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
        id="login_rewards_modal_body"
      >
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-1/4 w-[300px] h-[150px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[150px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-white/5 gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-[10px] bg-amber-400/10 text-amber-300 font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border border-amber-400/20 select-none">NEWBIE EXCLUSIVE</span>
              {claimedDays.length < 7 && timeLeft && (
                <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1.5 select-none">
                  <Timer className="w-3 h-3 text-indigo-400" />
                  Next reward: <span className="font-extrabold text-white">{timeLeft}</span>
                </span>
              )}
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase font-display mt-2 select-none">
              🧭 7-Day Ascension Logins
            </h3>
            <p className="text-xs text-slate-400 mt-1 lowercase font-mono select-none">
              claim rewards sequentially to establish your frontline elemental strike team immediately.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all text-xs cursor-pointer focus:outline-none flex items-center justify-center shrink-0 self-end sm:self-auto"
            aria-label="Exit Login Rewards"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto py-6 pr-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {REWARDS_INFO.map((reward) => {
              const day = reward.day;
              const isClaimed = claimedDays.includes(day);
              const isClaimable = day === currentClaimableDay && day <= unlockedDaysCount;
              const isLockedByTimer = day === currentClaimableDay && day > unlockedDaysCount;
              const isLockedByOrder = day > currentClaimableDay;

              return (
                <div 
                  key={day}
                  className={`p-4.5 rounded-xl border flex flex-col justify-between relative min-h-[220px] transition-all group ${reward.colorClass} ${
                    isClaimable 
                      ? 'ring-2 ring-amber-400 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] bg-slate-900/60 scale-[1.02] -translate-y-1' 
                      : isClaimed 
                        ? 'opacity-55 bg-black/45 border-white/5' 
                        : (isLockedByTimer ? 'border-indigo-500/20 bg-indigo-950/5 opacity-85' : 'bg-black/25 border-white/5 opacity-70')
                  }`}
                >
                  {/* Claimed check overlay */}
                  {isClaimed && (
                    <div className="absolute inset-0 bg-slate-950/25 rounded-xl flex flex-col items-center justify-center gap-1.5 z-10 font-mono select-none">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                        <Check className="w-5 h-5 text-emerald-400 stroke-[3px]" />
                      </div>
                      <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">CLAIMED</span>
                    </div>
                  )}

                  {/* Day marker */}
                  <div className="flex flex-row justify-between items-center border-b border-white/5 pb-2 w-full gap-1 whitespace-nowrap overflow-hidden select-none">
                    <span className="text-xs font-black font-display text-white shrink-0">DAY {day}</span>
                    <span className="text-[7px] font-mono uppercase bg-white/5 text-slate-400 px-1.5 py-0.5 rounded leading-none font-bold shrink-0">
                      {reward.tag}
                    </span>
                  </div>

                  {/* Icon & Details */}
                  <div className="my-4 flex flex-col items-center text-center space-y-2.5 select-none">
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl group-hover:border-white/10 transition-colors">
                      {reward.icon}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wide leading-tight line-clamp-1">{reward.title}</h4>
                      <p className="text-[9px] text-slate-400 font-medium leading-relaxed font-mono tracking-tight mt-1 line-clamp-2">{reward.desc}</p>
                    </div>
                  </div>

                  {/* Bottom button/status */}
                  <div className="pt-2 border-t border-white/5 mt-auto">
                    {isClaimable ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(day)}
                        className="w-full py-1.5 bg-amber-400 hover:bg-amber-350 text-slate-950 font-black text-[9.5px] rounded-sm uppercase tracking-widest transition-all hover:scale-[1.04] active:scale-[0.96] cursor-pointer"
                      >
                        CLAIM NOW
                      </button>
                    ) : isClaimed ? (
                      <div className="text-center text-[8.5px] text-emerald-400 font-mono uppercase font-black py-1.5 tracking-wider select-none">
                        SECURED
                      </div>
                    ) : isLockedByTimer ? (
                      <div className="flex items-center justify-center gap-1 text-[8.5px] text-indigo-400 font-mono uppercase font-black py-1.5 animate-pulse select-none">
                        <Timer className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Locked (Timer)</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-[8.5px] text-slate-500 font-mono uppercase font-bold py-1.5 select-none">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Locked (Order)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Tips Banner */}
          <div className="p-4 bg-indigo-500/10 border border-indigo-400/20 rounded-xl flex items-center gap-3 text-xs text-slate-300 select-none">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="leading-relaxed font-mono uppercase text-[10px]">
              👑 <b>PRO TIP:</b> Day 1 gives an epic 4-star squad member to boost reaction coverage. Day 7 gives a guaranteed elite non-limited 5-star Deity! Keep logging in or claim sequentially to secure all items. You can re-open this menu anytime by going to **Settings ⚙️ &rarr; LOGIN REWARD**!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
