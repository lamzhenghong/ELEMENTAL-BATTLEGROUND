import { Compass, Hammer, Landmark, Sparkles, Sword, Trophy, Users } from 'lucide-react';
import mainMenuBg from '../../assets/main_menu_bg.jpg';

interface GameHomePartyMember {
  id: string;
  name: string;
  element: string;
  level: number;
  avatarPlaceholder: string;
}

interface GameHomeProps {
  partyMembers: GameHomePartyMember[];
  readyQuestCount: number;
  isDungeonLocked: boolean;
  isWishLocked: boolean;
  onStory: () => void;
  onArena: () => void;
  onRogue: () => void;
  onParty: () => void;
  onWish: () => void;
  onForge: () => void;
  onQuest: () => void;
}

const GameHome = ({
  partyMembers,
  readyQuestCount,
  isDungeonLocked,
  isWishLocked,
  onStory,
  onArena,
  onRogue,
  onParty,
  onWish,
  onForge,
  onQuest,
}: GameHomeProps) => {
  const actions = [
    { label: 'Combat Arena', icon: Sword, onClick: onArena },
    { label: 'Rogue Ruins', icon: Landmark, onClick: onRogue, locked: isDungeonLocked },
    { label: 'Party Setup', icon: Users, onClick: onParty },
    { label: 'Celestial Summons', icon: Sparkles, onClick: onWish, locked: isWishLocked },
    { label: 'Forge and Ascension', icon: Hammer, onClick: onForge },
    { label: 'Quest Log', icon: Trophy, onClick: onQuest },
  ];

  return (
    <section
      aria-label="Game home"
      className="relative isolate min-h-[540px] overflow-hidden rounded-xl border border-white/15 bg-slate-950 shadow-2xl"
    >
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${mainMenuBg})` }}
      />
      <div className="absolute inset-0 -z-10 bg-slate-950/50" />
      <div className="absolute inset-x-0 bottom-0 top-1/3 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />

      <div className="flex min-h-[540px] flex-col justify-end gap-5 p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl space-y-3 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-300">Current Campaign</p>
          <h2 className="font-display text-3xl font-black sm:text-4xl">Continue your journey</h2>
          <button
            type="button"
            onClick={onStory}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          >
            <Compass className="h-4 w-4" />
            Continue Story
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {actions.map(({ label, icon: Icon, onClick, locked }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex min-h-16 items-center gap-2 rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-left text-xs font-black uppercase tracking-wide text-slate-100 backdrop-blur-sm transition hover:border-amber-300/70 hover:bg-slate-900/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
            >
              <Icon className="h-4 w-4 shrink-0 text-amber-300" />
              <span className="min-w-0 leading-tight">{label}</span>
              {locked && <span className="ml-auto text-[9px] text-red-300">Locked</span>}
            </button>
          ))}
        </div>

        <div className="grid gap-3 text-slate-100 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-slate-950/75 p-3 backdrop-blur-sm">
            <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-slate-400">Current party</span>
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
              {partyMembers.map(member => (
                <div key={member.id} className="flex shrink-0 items-center gap-1.5 text-xs">
                  <span className={`h-7 w-7 rounded-full border ${member.avatarPlaceholder}`} aria-hidden="true" />
                  <span className="max-w-20 truncate font-bold">{member.name}</span>
                  <span className="text-[10px] text-slate-400">Lv.{member.level}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center rounded-lg border border-white/10 bg-slate-950/75 px-3 py-2 text-xs font-bold backdrop-blur-sm">
            <Trophy className="mr-2 h-4 w-4 text-amber-300" />
            {readyQuestCount} rewards ready
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameHome;
