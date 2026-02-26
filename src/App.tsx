/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Home, 
  Users, 
  Calendar, 
  ClipboardList, 
  Trophy as TrophyIcon, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  Shield, 
  Sword, 
  Zap, 
  CheckCircle2, 
  Clock,
  Menu,
  X,
  Sparkles,
  BookOpen,
  ExternalLink,
  Send,
  UserPlus,
  MoreVertical,
  Check,
  Ban,
  Loader2,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Link as LinkIcon,
  AlertTriangle,
  Search,
  Filter,
  MoreHorizontal,
  ShieldAlert,
  XCircle
} from 'lucide-react';

// --- Types ---

type View = 'landing' | 'dashboard' | 'roster' | 'events' | 'quests' | 'trophy' | 'recruitment' | 'ai' | 'farming' | 'admin' | 'invites' | 'members' | 'join' | 'permissions';
type UserRole = 'Leader' | 'Officer' | 'Member';

interface Member {
  id: string;
  username: string;
  role: UserRole;
  class: string;
  level: number;
  joinedDate: string;
  status: 'Online' | 'Offline';
}

interface InviteCode {
  id: string;
  code: string;
  roleGranted: UserRole;
  status: 'Active' | 'Expired' | 'Maxed' | 'Revoked';
  uses: number;
  maxUses: number;
  expiryDate?: string;
  createdBy: string;
  createdAt: string;
  enabled: boolean;
}

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  type: 'Raid' | 'PVP' | 'Meeting';
}

interface Quest {
  id: string;
  title: string;
  assignedTo: string;
  completed: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface RecruitmentApplication {
  id: string;
  username: string;
  class: string;
  level: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  appliedDate: string;
}

interface FarmingGuide {
  id: string;
  title: string;
  description: string;
  steps: string[];
  rewards: string[];
  status: 'Approved' | 'Pending';
  submittedBy?: string;
}

// --- Mock Data ---

const MOCK_MEMBERS: Member[] = [
  { id: '1', username: 'Aetheris', role: 'Leader', class: 'Void Highlord', level: 100, joinedDate: '2009-10-12', status: 'Online' },
  { id: '2', username: 'Xylos', role: 'Officer', class: 'ArchPaladin', level: 100, joinedDate: '2010-05-20', status: 'Online' },
  { id: '3', username: 'Lyra', role: 'Officer', class: 'Legion DoomKnight', level: 95, joinedDate: '2012-08-15', status: 'Offline' },
  { id: '4', username: 'Kaelen', role: 'Member', class: 'ShadowScythe General', level: 88, joinedDate: '2024-01-05', status: 'Online' },
  { id: '5', username: 'Vesper', role: 'Member', class: 'LightCaster', level: 92, joinedDate: '2024-03-12', status: 'Offline' },
  { id: '6', username: 'Nyx', role: 'Member', class: 'Chaos Slayer', level: 85, joinedDate: '2025-11-30', status: 'Online' },
];

const MOCK_INVITES: InviteCode[] = [
  { id: '1', code: 'VISUAL-ALPHA-2026', roleGranted: 'Member', status: 'Active', uses: 8, maxUses: 10, expiryDate: '2026-03-15', createdBy: 'Aetheris', createdAt: '2026-02-01', enabled: true },
  { id: '2', code: 'OFFICER-PROMO', roleGranted: 'Officer', status: 'Revoked', uses: 1, maxUses: 1, expiryDate: '2026-02-20', createdBy: 'Aetheris', createdAt: '2026-02-10', enabled: false },
  { id: '3', code: 'INFINITY-RELAUNCH', roleGranted: 'Member', status: 'Active', uses: 45, maxUses: 100, expiryDate: '2026-06-01', createdBy: 'Xylos', createdAt: '2026-02-15', enabled: true },
  { id: '4', code: 'ONE-TIME-KEY', roleGranted: 'Member', status: 'Maxed', uses: 1, maxUses: 1, expiryDate: '2026-02-28', createdBy: 'Aetheris', createdAt: '2026-02-24', enabled: true },
];

const MOCK_EVENTS: Event[] = [
  { id: '1', name: 'Void Overlord Raid', date: 'Feb 28, 2026', time: '20:00 UTC', type: 'Raid' },
  { id: '2', name: 'Guild War: Bludrut Keep', date: 'Mar 02, 2026', time: '18:00 UTC', type: 'PVP' },
  { id: '3', name: 'Infinity Relaunch Strategy', date: 'Mar 05, 2026', time: '19:30 UTC', type: 'Meeting' },
];

const MOCK_QUESTS: Quest[] = [
  { id: '1', title: 'Farm 5000 Bone Dust', assignedTo: 'Kaelen', completed: false, difficulty: 'Medium' },
  { id: '2', title: 'Scout Bludrut Keep Entrances', assignedTo: 'Vesper', completed: true, difficulty: 'Easy' },
  { id: '3', title: 'Defeat Ultra Dage', assignedTo: 'Aetheris', completed: false, difficulty: 'Hard' },
];

const MOCK_APPLICATIONS: RecruitmentApplication[] = [
  { id: '1', username: 'DarkKnight99', class: 'ShadowScythe General', level: 85, status: 'Pending', appliedDate: '2026-02-24' },
  { id: '2', username: 'LightBringer', class: 'LightCaster', level: 95, status: 'Accepted', appliedDate: '2026-02-22' },
  { id: '3', username: 'ChaosLord', class: 'Chaos Slayer', level: 70, status: 'Rejected', appliedDate: '2026-02-20' },
  { id: '4', username: 'VoidSeeker', class: 'Void Highlord', level: 100, status: 'Pending', appliedDate: '2026-02-25' },
];

const MOCK_FARMING_GUIDES: FarmingGuide[] = [
  {
    id: '1',
    title: 'Void Highlord (VHL)',
    description: 'The ultimate tanky DPS class. Requires significant time and patience.',
    steps: [
      'Obtain Hadean Onyx from Shadowlord',
      'Farm 15 Roentgenium of VHL',
      'Complete Void Highlord Challenge'
    ],
    rewards: ['Void Highlord Class', 'Abyssal Sword'],
    status: 'Approved'
  },
  {
    id: '2',
    title: 'Legion Revenant (LR)',
    description: 'The best all-around farming and support class in the game.',
    steps: [
      'Join the Legion (/join underworld)',
      'Complete Legion Fealty 1, 2, and 3',
      'Obtain 20 Spellscrolls, 10 Crowns, and 10 Wreaths'
    ],
    rewards: ['Legion Revenant Class'],
    status: 'Approved'
  },
  {
    id: '3',
    title: 'ArchMage',
    description: 'A powerful magical class with complex mechanics.',
    steps: [
      'Complete the main storyline of the game',
      'Farm various elemental essences',
      'Complete the ArchMage questline'
    ],
    rewards: ['ArchMage Class'],
    status: 'Approved'
  }
];

interface Trophy {
  id: string;
  name: string;
  year: string;
  icon: any;
  color: string;
}

const MOCK_TROPHIES: Trophy[] = [
  { id: '1', name: 'First to 100', year: '2010', icon: TrophyIcon, color: 'text-amber-400' },
  { id: '2', name: 'Legion War Winners', year: '2012', icon: Shield, color: 'text-blue-400' },
  { id: '3', name: 'Void Conquerors', year: '2015', icon: Zap, color: 'text-purple-400' },
  { id: '4', name: 'Legacy Founders', year: '2009', icon: Sword, color: 'text-emerald-400' },
];

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
      active 
        ? 'bg-guild-accent/10 text-guild-accent border border-guild-accent/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`}
  >
    <Icon size={20} className={active ? 'glow-text-violet' : 'group-hover:text-guild-accent transition-colors'} />
    <span className="font-medium text-sm tracking-wide">{label}</span>
    {active && (
      <motion.div 
        layoutId="sidebar-active"
        className="ml-auto w-1 h-4 bg-guild-accent rounded-full shadow-[0_0_8px_rgba(139,92,246,0.8)]"
      />
    )}
  </button>
);

const Card = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-guild-card border border-white/5 rounded-xl p-6 glow-border ${className}`} {...props}>
    {children}
  </div>
);

// --- Views ---

const LandingPage = ({ onEnter, onJoin }: { onEnter: () => void, onJoin: () => void }) => (
  <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-guild-bg">
    {/* Abstract Background Texture */}
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-guild-accent/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-guild-accent-secondary/20 blur-[120px] rounded-full" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
    </div>

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="relative z-10 text-center px-4"
    >
      <h1 className="text-8xl md:text-9xl font-display font-bold tracking-tighter text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
        VISUAL
      </h1>
      <p className="text-2xl md:text-3xl font-light tracking-[0.3em] text-guild-accent uppercase mb-8 glow-text-violet">
        Legacy Reborn
      </p>
      
      <div className="h-px w-24 bg-white/20 mx-auto mb-8" />
      
      <p className="text-slate-400 text-sm tracking-widest uppercase mb-12">
        Founded 2009 <span className="mx-3 text-white/20">|</span> Reforged for Infinity
      </p>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0_0_25px_rgba(139,92,246,0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          className="px-10 py-4 bg-guild-accent text-white font-semibold tracking-widest uppercase rounded-full transition-all duration-300 hover:bg-guild-accent/80"
        >
          Enter Guild HQ
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0_0_25px_rgba(139,92,246,0.2)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onJoin}
          className="px-10 py-4 bg-transparent border border-white/20 text-white font-semibold tracking-widest uppercase rounded-full transition-all duration-300 hover:bg-white/5"
        >
          Join Legacy
        </motion.button>
      </div>
    </motion.div>
  </div>
);

const DashboardView = () => (
  <div className="space-y-8">
    <header className="flex flex-col gap-2">
      <h2 className="text-3xl font-display font-bold text-white">Welcome back, Aetheris</h2>
      <p className="text-slate-400">The guild is currently preparing for the next major expansion.</p>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats */}
      <Card className="lg:col-span-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm uppercase tracking-wider">Active Members</span>
          <Users size={20} className="text-guild-accent-secondary" />
        </div>
        <div className="text-5xl font-display font-bold text-white mb-2">42</div>
        <div className="text-xs text-emerald-400 flex items-center gap-1">
          <Zap size={12} /> +4 this week
        </div>
      </Card>

      {/* Upcoming Event */}
      <Card className="lg:col-span-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Calendar size={80} />
        </div>
        <div className="relative z-10">
          <span className="text-guild-accent text-xs font-bold uppercase tracking-widest mb-4 block">Next Major Event</span>
          <h3 className="text-2xl font-bold text-white mb-2">Void Overlord Raid</h3>
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <div className="flex items-center gap-1"><Clock size={14} /> Feb 28, 20:00 UTC</div>
            <div className="flex items-center gap-1"><Shield size={14} /> Required Level: 80+</div>
          </div>
          <button className="mt-6 text-sm font-semibold text-guild-accent-secondary hover:underline flex items-center gap-1">
            View Details <ChevronRight size={16} />
          </button>
        </div>
      </Card>

      {/* Announcements */}
      <Card className="lg:col-span-3">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Zap size={18} className="text-guild-accent" /> Latest Announcements
        </h3>
        <div className="space-y-6">
          {[
            { date: 'Today', title: 'Infinity Relaunch confirmed for Summer 2026', author: 'Aetheris' },
            { date: 'Yesterday', title: 'New Roster requirements for Officers', author: 'Xylos' },
            { date: '3 days ago', title: 'Guild Bank now accepting Void Auras', author: 'Lyra' },
          ].map((news, i) => (
            <div key={i} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
              <div className="text-xs text-slate-500 w-20 pt-1">{news.date}</div>
              <div>
                <h4 className="text-slate-200 font-medium hover:text-guild-accent cursor-pointer transition-colors">{news.title}</h4>
                <p className="text-xs text-slate-500 mt-1">Posted by {news.author}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const RosterView = () => (
  <div className="space-y-8">
    <header>
      <h2 className="text-3xl font-display font-bold text-white">Guild Roster</h2>
      <p className="text-slate-400">The elite warriors of Visual.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {MOCK_MEMBERS.map((member) => (
        <Card key={member.id} className="hover:border-guild-accent/30 transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-guild-accent/50 transition-colors">
              {member.role === 'Leader' ? <Shield className="text-guild-accent" size={24} /> : 
               member.role === 'Officer' ? <Sword className="text-guild-accent-secondary" size={24} /> : 
               <Users className="text-slate-400" size={24} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">{member.username}</h4>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-400 uppercase tracking-tighter">
                  LVL {member.level}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{member.class}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${
              member.role === 'Leader' ? 'text-guild-accent' : 
              member.role === 'Officer' ? 'text-guild-accent-secondary' : 
              'text-slate-500'
            }`}>
              {member.role}
            </span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const AdminDashboardView = ({ members, invites, events }: { members: Member[], invites: InviteCode[], events: Event[] }) => {
  const activeInvites = invites.filter(i => i.enabled && i.status === 'Active').length;
  const onlineMembers = members.filter(m => m.status === 'Online').length;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Shield className="text-guild-accent" /> Admin Overview
        </h2>
        <p className="text-slate-400">High-level guild health and activity metrics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-guild-accent/20">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total Members</p>
          <p className="text-3xl font-bold text-white">{members.length}</p>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><Zap size={12} /> {onlineMembers} Online</p>
        </Card>
        <Card className="border-guild-accent-secondary/20">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Active Invites</p>
          <p className="text-3xl font-bold text-white">{activeInvites}</p>
          <p className="text-xs text-slate-500 mt-2">Across {invites.length} total codes</p>
        </Card>
        <Card className="border-amber-500/20">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Upcoming Events</p>
          <p className="text-3xl font-bold text-white">{events.length}</p>
          <p className="text-xs text-slate-500 mt-2">Next in 2 days</p>
        </Card>
        <Card className="border-emerald-500/20">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Avg. Attendance</p>
          <p className="text-3xl font-bold text-white">88%</p>
          <p className="text-xs text-emerald-400 mt-2">Stable</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-guild-accent" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { user: 'Kaelen', action: 'joined via code VISUAL-ALPHA', time: '2h ago' },
              { user: 'Xylos', action: 'created event "Void Raid"', time: '5h ago' },
              { user: 'Aetheris', action: 'revoked invite code "OFFICER-PROMO"', time: '1d ago' },
              { user: 'Nyx', action: 'reached Level 85', time: '2d ago' },
            ].map((act, i) => (
              <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <p className="text-slate-300"><span className="text-guild-accent font-bold">{act.user}</span> {act.action}</p>
                <span className="text-[10px] text-slate-500 uppercase">{act.time}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap size={18} className="text-guild-accent-secondary" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-guild-accent/10 hover:border-guild-accent/30 hover:text-white transition-all text-center">
              Create Event
            </button>
            <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-guild-accent/10 hover:border-guild-accent/30 hover:text-white transition-all text-center">
              New Invite
            </button>
            <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-guild-accent/10 hover:border-guild-accent/30 hover:text-white transition-all text-center">
              Export Roster
            </button>
            <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-guild-accent/10 hover:border-guild-accent/30 hover:text-white transition-all text-center">
              Guild Settings
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const AdminView = ({ 
  events, setEvents, 
  members, setMembers, 
  trophies, setTrophies,
  guides, setGuides 
}: { 
  events: Event[], setEvents: any, 
  members: Member[], setMembers: any,
  trophies: Trophy[], setTrophies: any,
  guides: FarmingGuide[], setGuides: any
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'roster' | 'trophies' | 'guides'>('events');
  const [editingItem, setEditingItem] = useState<{ type: string, data: any } | null>(null);

  const deleteItem = (type: string, id: string) => {
    if (type === 'events') setEvents(events.filter(e => e.id !== id));
    if (type === 'roster') setMembers(members.filter(m => m.id !== id));
    if (type === 'trophies') setTrophies(trophies.filter(t => t.id !== id));
    if (type === 'guides') setGuides(guides.filter(g => g.id !== id));
  };

  const approveGuide = (id: string) => {
    setGuides(guides.map(g => g.id === id ? { ...g, status: 'Approved' } : g));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { type, data } = editingItem;
    if (type === 'events') setEvents(events.map(item => item.id === data.id ? data : item));
    if (type === 'roster') setMembers(members.map(item => item.id === data.id ? data : item));
    if (type === 'trophies') setTrophies(trophies.map(item => item.id === data.id ? data : item));
    if (type === 'guides') setGuides(guides.map(item => item.id === data.id ? data : item));
    
    setEditingItem(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Settings className="text-guild-accent" /> Content Management
        </h2>
        <p className="text-slate-400">Edit guild events, achievements, and guides.</p>
      </header>

      <div className="flex gap-2 border-b border-white/5 pb-4 overflow-x-auto">
        {['events', 'roster', 'trophies', 'guides'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab 
                ? 'bg-guild-accent text-white' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Manage Events</h3>
              <button 
                onClick={() => setEditingItem({ type: 'events', data: { id: Date.now().toString(), name: '', date: '', time: '', type: 'Raid' } })}
                className="p-2 bg-guild-accent/10 border border-guild-accent/20 text-guild-accent rounded-lg hover:bg-guild-accent hover:text-white transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            {events.map(event => (
              <Card key={event.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">{event.name}</h4>
                  <p className="text-xs text-slate-500">{event.date} • {event.time}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingItem({ type: 'events', data: { ...event } })}
                    className="p-2 text-slate-400 hover:text-guild-accent transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteItem('events', event.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Manage Roster</h3>
              <button 
                onClick={() => setEditingItem({ type: 'roster', data: { id: Date.now().toString(), username: '', role: 'Member', class: '', level: 1 } })}
                className="p-2 bg-guild-accent/10 border border-guild-accent/20 text-guild-accent rounded-lg hover:bg-guild-accent hover:text-white transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            {members.map(member => (
              <Card key={member.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">{member.username}</h4>
                  <p className="text-xs text-slate-500">{member.role} • {member.class}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingItem({ type: 'roster', data: { ...member } })}
                    className="p-2 text-slate-400 hover:text-guild-accent transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteItem('roster', member.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'trophies' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Manage Achievements</h3>
              <button 
                onClick={() => setEditingItem({ type: 'trophies', data: { id: Date.now().toString(), name: '', year: '', icon: TrophyIcon, color: 'text-amber-400' } })}
                className="p-2 bg-guild-accent/10 border border-guild-accent/20 text-guild-accent rounded-lg hover:bg-guild-accent hover:text-white transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            {trophies.map(trophy => (
              <Card key={trophy.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">{trophy.name}</h4>
                  <p className="text-xs text-slate-500">{trophy.year}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingItem({ type: 'trophies', data: { ...trophy } })}
                    className="p-2 text-slate-400 hover:text-guild-accent transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteItem('trophies', trophy.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'guides' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Pending Approvals</h3>
            {guides.filter(g => g.status === 'Pending').length === 0 && (
              <p className="text-sm text-slate-500 italic">No pending guides to review.</p>
            )}
            {guides.filter(g => g.status === 'Pending').map(guide => (
              <Card key={guide.id} className="flex items-center justify-between border-amber-500/20 bg-amber-500/5">
                <div>
                  <h4 className="font-bold text-white">{guide.title}</h4>
                  <p className="text-xs text-slate-500">Submitted by {guide.submittedBy || 'Unknown'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveGuide(guide.id)} className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                    <Check size={16} />
                  </button>
                  <button onClick={() => deleteItem('guides', guide.id)} className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                    <Ban size={16} />
                  </button>
                </div>
              </Card>
            ))}

            <h3 className="text-lg font-bold text-white mt-8">Active Guides</h3>
            {guides.filter(g => g.status === 'Approved').map(guide => (
              <Card key={guide.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">{guide.title}</h4>
                  <p className="text-xs text-slate-500">{guide.description.substring(0, 50)}...</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingItem({ type: 'guides', data: { ...guide } })}
                    className="p-2 text-slate-400 hover:text-guild-accent transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteItem('guides', guide.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-guild-card border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6 capitalize">
                {events.find(e => e.id === editingItem.data.id) || members.find(m => m.id === editingItem.data.id) || trophies.find(t => t.id === editingItem.data.id) || guides.find(g => g.id === editingItem.data.id) ? 'Edit' : 'Add'} {editingItem.type.slice(0, -1)}
              </h3>
              
              <form onSubmit={handleSaveEdit} className="space-y-4">
                {editingItem.type === 'events' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Event Name</label>
                      <input 
                        type="text" 
                        value={editingItem.data.name} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Date</label>
                        <input 
                          type="text" 
                          value={editingItem.data.date} 
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, date: e.target.value } })}
                          className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                          placeholder="Feb 28, 2026"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Time</label>
                        <input 
                          type="text" 
                          value={editingItem.data.time} 
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, time: e.target.value } })}
                          className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                          placeholder="20:00 UTC"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {editingItem.type === 'roster' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Username</label>
                      <input 
                        type="text" 
                        value={editingItem.data.username} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, username: e.target.value } })}
                        className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Class</label>
                      <input 
                        type="text" 
                        value={editingItem.data.class} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, class: e.target.value } })}
                        className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Role</label>
                        <select 
                          value={editingItem.data.role} 
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, role: e.target.value } })}
                          className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                        >
                          <option value="Leader">Leader</option>
                          <option value="Officer">Officer</option>
                          <option value="Member">Member</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Level</label>
                        <input 
                          type="number" 
                          value={editingItem.data.level} 
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, level: parseInt(e.target.value) } })}
                          className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {editingItem.type === 'trophies' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Achievement Name</label>
                      <input 
                        type="text" 
                        value={editingItem.data.name} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Year</label>
                      <input 
                        type="text" 
                        value={editingItem.data.year} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, year: e.target.value } })}
                        className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                        required
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'guides' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Guide Title</label>
                      <input 
                        type="text" 
                        value={editingItem.data.title} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                        className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Description</label>
                      <textarea 
                        value={editingItem.data.description} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                        className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none h-24 resize-none"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-guild-accent text-white rounded-lg text-sm font-semibold hover:bg-guild-accent/80 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EventsView = ({ isAdmin }: { isAdmin: boolean }) => {
  const [showAttendance, setShowAttendance] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Upcoming Events</h2>
          <p className="text-slate-400">Coordinate and conquer.</p>
        </div>
        {isAdmin && (
          <button className="px-4 py-2 bg-guild-accent text-white rounded-lg text-sm font-bold hover:bg-guild-accent/80 transition-all flex items-center gap-2">
            <Plus size={18} /> Create Event
          </button>
        )}
      </header>

      <div className="space-y-4">
        {MOCK_EVENTS.map((event) => (
          <Card key={event.id} className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                  event.type === 'Raid' ? 'border-red-500/30 text-red-400 bg-red-500/5' :
                  event.type === 'PVP' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' :
                  'border-guild-accent/30 text-guild-accent bg-guild-accent/5'
                }`}>
                  {event.type}
                </span>
                <h3 className="text-xl font-bold text-white">{event.name}</h3>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-sm">
                <div className="flex items-center gap-1"><Calendar size={14} /> {event.date}</div>
                <div className="flex items-center gap-1"><Clock size={14} /> {event.time}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin ? (
                <button 
                  onClick={() => setShowAttendance(event.id)}
                  className="px-4 py-2 rounded-lg bg-guild-accent-secondary/10 border border-guild-accent-secondary/20 text-guild-accent-secondary text-sm font-semibold hover:bg-guild-accent-secondary hover:text-white transition-all"
                >
                  Manage Attendance
                </button>
              ) : (
                <>
                  <button className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-guild-accent/10 border border-guild-accent/20 text-guild-accent text-sm font-semibold hover:bg-guild-accent hover:text-white transition-all">
                    Going
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm font-semibold hover:bg-white/10 transition-all">
                    Maybe
                  </button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Attendance Modal */}
      <AnimatePresence>
        {showAttendance && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAttendance(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-guild-card border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Attendance: {MOCK_EVENTS.find(e => e.id === showAttendance)?.name}</h3>
                <button onClick={() => setShowAttendance(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-1">Going</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                  <p className="text-[10px] text-amber-400 uppercase tracking-widest mb-1">Maybe</p>
                  <p className="text-2xl font-bold text-white">8</p>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1">Declined</p>
                  <p className="text-2xl font-bold text-white">10</p>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {MOCK_MEMBERS.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                        {member.username[0]}
                      </div>
                      <span className="text-sm text-white font-medium">{member.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/30">Present</button>
                      <button className="px-3 py-1 bg-white/5 text-slate-500 text-[10px] font-bold uppercase rounded border border-white/10">Absent</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setShowAttendance(null)}
                  className="px-6 py-2 bg-guild-accent text-white rounded-lg font-bold hover:bg-guild-accent/80 transition-all"
                >
                  Save Attendance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuestsView = () => (
  <div className="space-y-8">
    <header>
      <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
        <Sword className="text-guild-accent" /> Quest Board
      </h2>
      <p className="text-slate-400">Ongoing campaigns and objectives.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {MOCK_QUESTS.map((quest) => (
        <Card key={quest.id} className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
              quest.difficulty === 'Hard' ? 'border-red-500 text-red-500 bg-red-500/5' :
              quest.difficulty === 'Medium' ? 'border-amber-500 text-amber-500 bg-amber-500/5' :
              'border-emerald-500 text-emerald-500 bg-emerald-500/5'
            }`}>
              {quest.difficulty}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{quest.title}</h3>
          <p className="text-sm text-slate-400 mb-6">Assigned to: {quest.assignedTo}</p>
          
          <div className="space-y-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 uppercase tracking-widest">Status</span>
              <span className={quest.completed ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {quest.completed ? "Completed" : "In Progress"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: quest.completed ? '100%' : '45%' }}
                className={`h-full ${quest.completed ? 'bg-emerald-500' : 'bg-guild-accent'} shadow-[0_0_10px_rgba(139,92,246,0.5)]`}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const PermissionsMatrixView = () => {
  const matrix = [
    { action: 'View Dashboard', leader: true, officer: true, member: true },
    { action: 'View Roster', leader: true, officer: true, member: true },
    { action: 'View Events', leader: true, officer: true, member: true },
    { action: 'Suggest Farming Guide', leader: true, officer: true, member: true },
    { action: 'Create/Edit Events', leader: true, officer: true, member: false },
    { action: 'Manage Attendance', leader: true, officer: true, member: false },
    { action: 'Update Member Roles', leader: true, officer: true, member: false },
    { action: 'Kick Members', leader: true, officer: true, member: false },
    { action: 'Approve Farming Guides', leader: true, officer: true, member: false },
    { action: 'Manage Invite Codes', leader: true, officer: false, member: false },
    { action: 'Guild Settings', leader: true, officer: false, member: false },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <ShieldAlert className="text-guild-accent" /> Permissions Matrix
        </h2>
        <p className="text-slate-400">Role-based access control definitions.</p>
      </header>

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-[0.2em]">
              <th className="p-4 font-semibold">Action / Capability</th>
              <th className="p-4 font-semibold text-center">Leader</th>
              <th className="p-4 font-semibold text-center">Officer</th>
              <th className="p-4 font-semibold text-center">Member</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {matrix.map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-slate-300 font-medium">{row.action}</td>
                <td className="p-4 text-center">
                  {row.leader ? <CheckCircle2 className="text-emerald-500 mx-auto" size={18} /> : <XCircle className="text-red-500/30 mx-auto" size={18} />}
                </td>
                <td className="p-4 text-center">
                  {row.officer ? <CheckCircle2 className="text-emerald-500 mx-auto" size={18} /> : <XCircle className="text-red-500/30 mx-auto" size={18} />}
                </td>
                <td className="p-4 text-center">
                  {row.member ? <CheckCircle2 className="text-emerald-500 mx-auto" size={18} /> : <XCircle className="text-red-500/30 mx-auto" size={18} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const TrophyRoomView = ({ trophies }: { trophies: Trophy[] }) => (
  <div className="space-y-8">
    <header>
      <h2 className="text-3xl font-display font-bold text-white">Trophy Room</h2>
      <p className="text-slate-400">Our legacy, etched in stone.</p>
    </header>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {trophies.map((trophy) => (
        <Card key={trophy.id} className="flex flex-col items-center text-center gap-4 group hover:scale-105 transition-transform">
          <div className={`p-4 rounded-full bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors ${trophy.color}`}>
            <trophy.icon size={32} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">{trophy.name}</h4>
            <p className="text-xs text-slate-500 mt-1">{trophy.year}</p>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const RecruitmentView = () => {
  const [apps, setApps] = useState(MOCK_APPLICATIONS);

  const updateStatus = (id: string, status: 'Accepted' | 'Rejected') => {
    setApps(apps.map(app => app.id === id ? { ...app, status } : app));
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Recruitment Admin</h2>
          <p className="text-slate-400">Review and manage officer applications.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Total Applied</p>
            <p className="text-xl font-bold text-white">{apps.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Accepted</p>
            <p className="text-xl font-bold text-guild-accent-secondary">{apps.filter(a => a.status === 'Accepted').length}</p>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {apps.map((app) => (
          <Card key={app.id} className="flex flex-col md:flex-row md:items-center gap-6 group">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-white">{app.username}</h3>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-400">
                  LVL {app.level}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border ${
                  app.status === 'Accepted' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                  app.status === 'Rejected' ? 'border-red-500/30 text-red-400 bg-red-500/5' :
                  'border-amber-500/30 text-amber-400 bg-amber-500/5'
                }`}>
                  {app.status}
                </span>
              </div>
              <p className="text-sm text-slate-400">{app.class}</p>
              <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">Applied on {app.appliedDate}</p>
            </div>

            {app.status === 'Pending' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => updateStatus(app.id, 'Accepted')}
                  className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                  title="Accept"
                >
                  <Check size={18} />
                </button>
                <button 
                  onClick={() => updateStatus(app.id, 'Rejected')}
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  title="Reject"
                >
                  <Ban size={18} />
                </button>
              </div>
            )}
            
            {app.status !== 'Pending' && (
              <button 
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-slate-300 transition-all"
                title="Options"
              >
                <MoreVertical size={18} />
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

const AIView = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3-flash-preview";
      const response = await genAI.models.generateContent({
        model,
        contents: userMsg,
        config: {
          systemInstruction: "You are the Visual Guild AI Assistant. You help guild members with AQW Infinity strategies, farming tips, and guild information. Be helpful, concise, and maintain a cool, gaming-focused tone.",
        }
      });

      const aiMsg = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'ai', content: aiMsg }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Error connecting to the Void. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-4">
      <header>
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Sparkles className="text-guild-accent" /> Visual AI Room
        </h2>
        <p className="text-slate-400">Ask the Void for guidance on your journey.</p>
      </header>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <Sparkles size={48} className="mb-4 text-guild-accent" />
              <p className="text-sm uppercase tracking-widest">The AI is ready. Ask anything about AQW.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-guild-accent text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-guild-accent" />
                <span className="text-xs text-slate-500 uppercase tracking-widest">Consulting the Void...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-white/5">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-guild-accent transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="p-2 bg-guild-accent text-white rounded-lg hover:bg-guild-accent/80 transition-colors disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const FarmingView = ({ guides, onSuggest }: { guides: FarmingGuide[], onSuggest: () => void }) => (
  <div className="space-y-8">
    <header className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <BookOpen className="text-guild-accent-secondary" /> Farming Guides
        </h2>
        <p className="text-slate-400">Step-by-step guidance for the most powerful gear.</p>
      </div>
      <button 
        onClick={onSuggest}
        className="px-4 py-2 bg-guild-accent-secondary/10 border border-guild-accent-secondary/20 text-guild-accent-secondary rounded-lg text-sm font-semibold hover:bg-guild-accent-secondary hover:text-white transition-all flex items-center gap-2"
      >
        <Plus size={16} /> Suggest Guide
      </button>
    </header>

    <div className="grid grid-cols-1 gap-6">
      {guides.filter(g => g.status === 'Approved').map((guide) => (
        <Card key={guide.id} className="hover:border-guild-accent-secondary/30 transition-all">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">{guide.title}</h3>
              <p className="text-slate-400 mb-6">{guide.description}</p>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-guild-accent-secondary uppercase tracking-widest">Required Steps</h4>
                <ul className="space-y-2">
                  {guide.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-slate-500 shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="md:w-64 shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Rewards</h4>
                <div className="space-y-2">
                  {guide.rewards.map((reward, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-emerald-400">
                      <Zap size={12} /> {reward}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const InvitesView = ({ invites, setInvites }: { invites: InviteCode[], setInvites: any }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvite, setNewInvite] = useState<Partial<InviteCode>>({
    roleGranted: 'Member',
    maxUses: 10,
    enabled: true
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const toggleInvite = (id: string) => {
    setInvites(invites.map(inv => inv.id === id ? { ...inv, enabled: !inv.enabled } : inv));
  };

  const deleteInvite = (id: string) => {
    if (confirm('Are you sure you want to delete this invite code? This action cannot be undone.')) {
      setInvites(invites.filter(inv => inv.id !== id));
    }
  };

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const invite: InviteCode = {
      id: Math.random().toString(36).substr(2, 9),
      code: `VISUAL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      roleGranted: newInvite.roleGranted as UserRole,
      status: 'Active',
      uses: 0,
      maxUses: newInvite.maxUses || 1,
      expiryDate: newInvite.expiryDate || '2026-12-31',
      createdBy: 'Aetheris',
      createdAt: new Date().toISOString().split('T')[0],
      enabled: true
    };
    setInvites([invite, ...invites]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <LinkIcon className="text-guild-accent-secondary" /> Invite Management
          </h2>
          <p className="text-slate-400">Control who enters the legacy.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-guild-accent text-white rounded-lg font-bold hover:bg-guild-accent/80 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Create Invite
        </button>
      </header>

      <Card className="border-amber-500/20 bg-amber-500/5 flex items-start gap-4 p-4">
        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
        <div className="text-sm text-amber-200/80">
          <p className="font-bold text-amber-400 mb-1">Security Warning</p>
          Invite codes grant immediate access to the guild. Revoke or disable codes if they are shared publicly or leaked. Joining requires a valid account login.
        </div>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-[0.2em]">
              <th className="pb-4 font-semibold">Code</th>
              <th className="pb-4 font-semibold">Role</th>
              <th className="pb-4 font-semibold">Status</th>
              <th className="pb-4 font-semibold">Uses</th>
              <th className="pb-4 font-semibold">Expiry</th>
              <th className="pb-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {invites.map((inv) => (
              <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <td className="py-4">
                  <span className="font-mono text-guild-accent-secondary font-bold">{inv.code}</span>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    inv.roleGranted === 'Leader' ? 'border-guild-accent text-guild-accent' :
                    inv.roleGranted === 'Officer' ? 'border-guild-accent-secondary text-guild-accent-secondary' :
                    'border-slate-500 text-slate-400'
                  }`}>
                    {inv.roleGranted}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`flex items-center gap-1.5 ${
                    !inv.enabled ? 'text-slate-500' :
                    inv.status === 'Active' ? 'text-emerald-400' :
                    inv.status === 'Revoked' ? 'text-red-400' :
                    'text-amber-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      !inv.enabled ? 'bg-slate-500' :
                      inv.status === 'Active' ? 'bg-emerald-400' :
                      inv.status === 'Revoked' ? 'bg-red-400' :
                      'bg-amber-400'
                    }`} />
                    {!inv.enabled ? 'Disabled' : inv.status}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-guild-accent-secondary" 
                        style={{ width: `${(inv.uses / inv.maxUses) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{inv.uses}/{inv.maxUses}</span>
                  </div>
                </td>
                <td className="py-4 text-slate-400">{inv.expiryDate}</td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => copyToClipboard(inv.code, 'Code')}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Copy Code"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => toggleInvite(inv.id)}
                      className={`p-1.5 transition-colors ${inv.enabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'}`}
                      title={inv.enabled ? 'Disable' : 'Enable'}
                    >
                      <Zap size={16} />
                    </button>
                    <button 
                      onClick={() => deleteInvite(inv.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invite Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-guild-card border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Create Invite Code</h3>
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Role Granted</label>
                  <select 
                    value={newInvite.roleGranted}
                    onChange={(e) => setNewInvite({ ...newInvite, roleGranted: e.target.value as UserRole })}
                    className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                  >
                    <option value="Member">Member</option>
                    <option value="Officer">Officer</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Max Uses</label>
                    <input 
                      type="number" 
                      value={newInvite.maxUses}
                      onChange={(e) => setNewInvite({ ...newInvite, maxUses: parseInt(e.target.value) })}
                      className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Expiry Date</label>
                    <input 
                      type="date" 
                      onChange={(e) => setNewInvite({ ...newInvite, expiryDate: e.target.value })}
                      className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input 
                    type="checkbox" 
                    id="one-time" 
                    onChange={(e) => setNewInvite({ ...newInvite, maxUses: e.target.checked ? 1 : 10 })}
                    className="w-4 h-4 rounded border-white/10 bg-guild-bg text-guild-accent focus:ring-guild-accent"
                  />
                  <label htmlFor="one-time" className="text-sm text-slate-400">One-time use only</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-guild-accent text-white rounded-lg text-sm font-semibold hover:bg-guild-accent/80 transition-all"
                  >
                    Generate Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JoinView = ({ onJoinSuccess, onBack, invites }: { onJoinSuccess: () => void, onBack?: () => void, invites: InviteCode[] }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'verified' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedInvite, setVerifiedInvite] = useState<InviteCode | null>(null);

  const handleVerify = async () => {
    if (!code) return;
    setStatus('validating');
    
    // Simulate RPC call: join_guild_by_code(code)
    setTimeout(() => {
      const invite = invites.find(inv => inv.code.toUpperCase() === code.toUpperCase());
      
      if (!invite) {
        setStatus('error');
        setErrorMsg("Invalid Invitation. This code doesn't exist or has been revoked.");
      } else if (!invite.enabled) {
        setStatus('error');
        setErrorMsg("Invitation Revoked. This code is no longer active.");
      } else if (invite.uses >= invite.maxUses) {
        setStatus('error');
        setErrorMsg("Capacity Reached. This invite has reached its maximum uses.");
      } else if (invite.expiryDate && new Date(invite.expiryDate) < new Date()) {
        setStatus('error');
        setErrorMsg("Invitation Expired. This link is no longer active.");
      } else {
        setVerifiedInvite(invite);
        setStatus('verified');
      }
    }, 1500);
  };

  const handleJoin = () => {
    setStatus('success');
    setTimeout(() => {
      onJoinSuccess();
    }, 2000);
  };

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
          >
            <ChevronLeft size={18} />
            Back to home
          </button>
        )}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="text-emerald-500" size={40} />
          </div>
          <div>
            <h2 className="text-4xl font-display font-bold text-white mb-2">The gates are open.</h2>
            <p className="text-slate-400">Welcome to Visual. Your journey begins now.</p>
          </div>
          <button 
            onClick={onJoinSuccess}
            className="px-8 py-3 bg-guild-accent text-white rounded-xl font-bold hover:bg-guild-accent/80 transition-all shadow-lg shadow-guild-accent/20"
          >
            Enter Guild HQ
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] relative flex items-center justify-center p-4">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors z-10"
        >
          <ChevronLeft size={18} />
          Back to home
        </button>
      )}
      <Card className="w-full max-w-md p-8 border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-guild-accent to-transparent opacity-50" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-guild-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-guild-accent/20">
            <Shield className="text-guild-accent" size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Accept Your Invitation</h2>
          <p className="text-sm text-slate-400">Enter your unique code to join the legacy.</p>
        </div>

        {status === 'idle' || status === 'error' ? (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2 block font-bold">Invite Code</label>
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VISUAL-XXXXXX"
                className="w-full bg-guild-bg border border-white/10 rounded-xl px-4 py-4 text-center font-mono text-xl tracking-widest text-guild-accent-secondary focus:border-guild-accent outline-none transition-all"
              />
              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-3 text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                >
                  <AlertTriangle size={14} />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </div>
            <button 
              onClick={handleVerify}
              disabled={!code || status === 'validating'}
              className="w-full py-4 bg-guild-accent text-white rounded-xl font-bold hover:bg-guild-accent/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'validating' ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verifying Credentials...
                </>
              ) : (
                'Check Invitation'
              )}
            </button>
            <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest">
              Invitations are unique and case-sensitive.
            </p>
          </div>
        ) : status === 'validating' ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="animate-spin text-guild-accent mx-auto" size={48} />
            <p className="text-slate-400 animate-pulse">Consulting the Void...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="w-12 h-12 bg-guild-accent-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="text-guild-accent-secondary" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Visual</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Role: {verifiedInvite?.roleGranted}</p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-slate-400 text-center">Invitation verified. Claim your spot in the legacy.</p>
              <button 
                onClick={handleJoin}
                className="w-full py-4 bg-guild-accent text-white rounded-xl font-bold hover:bg-guild-accent/80 transition-all shadow-lg shadow-guild-accent/20"
              >
                Accept Invite & Join
              </button>
              <button 
                onClick={() => setStatus('idle')}
                className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                Use a different code
              </button>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
};

const MembersManagementView = ({ members, setMembers }: { members: Member[], setMembers: any }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const updateRole = (id: string, role: UserRole) => {
    setMembers(members.map(m => m.id === id ? { ...m, role } : m));
  };

  const kickMember = (id: string) => {
    if (confirm('Are you sure you want to kick this member?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Users className="text-guild-accent" /> Member Management
          </h2>
          <p className="text-slate-400">Manage the elite ranks of Visual.</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-guild-card border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-guild-accent outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-guild-card border border-white/5 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none text-slate-300"
          >
            <option value="All">All Roles</option>
            <option value="Leader">Leader</option>
            <option value="Officer">Officer</option>
            <option value="Member">Member</option>
          </select>
          <button className="p-2 bg-guild-card border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Users size={24} className="text-slate-500" />
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-guild-card ${
                member.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-500'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white">{member.username}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border ${
                  member.role === 'Leader' ? 'border-guild-accent text-guild-accent' :
                  member.role === 'Officer' ? 'border-guild-accent-secondary text-guild-accent-secondary' :
                  'border-slate-500 text-slate-400'
                }`}>
                  {member.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{member.class} • Joined {member.joinedDate}</p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <select 
                value={member.role}
                onChange={(e) => updateRole(member.id, e.target.value as UserRole)}
                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-slate-400 outline-none"
              >
                <option value="Member">Member</option>
                <option value="Officer">Officer</option>
                <option value="Leader">Leader</option>
              </select>
              <button 
                onClick={() => kickMember(member.id)}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Kick"
              >
                <Ban size={16} />
              </button>
              <button className="p-2 text-slate-500 hover:text-white transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('Leader'); // Default to Leader for demo

  // State for editable content
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [trophies, setTrophies] = useState<Trophy[]>(MOCK_TROPHIES);
  const [guides, setGuides] = useState<FarmingGuide[]>(MOCK_FARMING_GUIDES);
  const [invites, setInvites] = useState<InviteCode[]>(MOCK_INVITES);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestion, setSuggestion] = useState({ title: '', description: '', steps: '' });

  const underConstructionBanner = (
    <div className="sticky top-0 left-0 right-0 w-full z-[60] flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/95 text-slate-900 text-sm font-semibold shadow-lg border-b border-amber-600/50">
      <AlertTriangle size={18} className="shrink-0" aria-hidden />
      <span>This site is still under construction</span>
    </div>
  );

  if (view === 'landing') {
    return (
      <>
        {underConstructionBanner}
        <LandingPage onEnter={() => setView('dashboard')} onJoin={() => setView('join')} />
      </>
    );
  }

  if (view === 'join') {
    return (
      <div className="min-h-screen bg-guild-bg text-slate-200 font-sans selection:bg-guild-accent/30">
        {underConstructionBanner}
        <JoinView invites={invites} onJoinSuccess={() => setView('dashboard')} onBack={() => setView('landing')} />
      </div>
    );
  }

  const isAdmin = userRole === 'Leader' || userRole === 'Officer';
  const isLeader = userRole === 'Leader';

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGuide: FarmingGuide = {
      id: Math.random().toString(36).substr(2, 9),
      title: suggestion.title,
      description: suggestion.description,
      steps: suggestion.steps.split('\n').filter(s => s.trim()),
      rewards: ['To be determined'],
      status: 'Pending',
      submittedBy: 'MemberUser'
    };
    setGuides([...guides, newGuide]);
    setSuggestion({ title: '', description: '', steps: '' });
    setShowSuggestModal(false);
    alert("Guide suggested! Awaiting admin approval.");
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard': return isAdmin ? <AdminDashboardView members={members} invites={invites} events={events} /> : <DashboardView />;
      case 'roster': return <RosterView />;
      case 'events': return <EventsView isAdmin={isAdmin} />;
      case 'quests': return <QuestsView />;
      case 'trophy': return <TrophyRoomView trophies={trophies} />;
      case 'recruitment': return <RecruitmentView />;
      case 'ai': return <AIView />;
      case 'permissions': return <PermissionsMatrixView />;
      case 'invites': return isLeader ? <InvitesView invites={invites} setInvites={setInvites} /> : <DashboardView />;
      case 'members': return isAdmin ? <MembersManagementView members={members} setMembers={setMembers} /> : <DashboardView />;
      case 'join': return <JoinView invites={invites} onJoinSuccess={() => setView('dashboard')} onBack={() => setView('landing')} />;
      case 'farming': return (
        <>
          <FarmingView guides={guides} onSuggest={() => setShowSuggestModal(true)} />
          <AnimatePresence>
            {showSuggestModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSuggestModal(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md bg-guild-card border border-white/10 rounded-2xl p-8 shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-white mb-6">Suggest Farming Guide</h3>
                  <form onSubmit={handleSuggestSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Guide Title</label>
                      <input 
                        type="text" 
                        value={suggestion.title}
                        onChange={(e) => setSuggestion({ ...suggestion, title: e.target.value })}
                        className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                        placeholder="e.g. Blodrut Keep Farming"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Short Description</label>
                      <input 
                        type="text" 
                        value={suggestion.description}
                        onChange={(e) => setSuggestion({ ...suggestion, description: e.target.value })}
                        className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none"
                        placeholder="What is this guide for?"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Steps (One per line)</label>
                      <textarea 
                        value={suggestion.steps}
                        onChange={(e) => setSuggestion({ ...suggestion, steps: e.target.value })}
                        className="w-full bg-guild-bg border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-guild-accent outline-none h-32 resize-none"
                        placeholder="Step 1&#10;Step 2&#10;Step 3"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowSuggestModal(false)}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 px-4 py-2 bg-guild-accent-secondary text-white rounded-lg text-sm font-semibold hover:bg-guild-accent-secondary/80 transition-all"
                      >
                        Submit Suggestion
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      );
      case 'admin': return isAdmin ? (
        <AdminView 
          events={events} setEvents={setEvents}
          members={members} setMembers={setMembers}
          trophies={trophies} setTrophies={setTrophies}
          guides={guides} setGuides={setGuides}
        />
      ) : <DashboardView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-guild-bg flex flex-wrap text-slate-200">
      <div className="w-full shrink-0">{underConstructionBanner}</div>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-guild-card/80 backdrop-blur-lg border-b border-white/5 z-50 flex items-center justify-between px-6">
        <h1 className="font-display font-bold text-xl tracking-tighter text-white">VISUAL</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-guild-card border-r border-white/5 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-10 hidden lg:block">
            <h1 className="font-display font-bold text-2xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              VISUAL
            </h1>
            <p className="text-[10px] text-guild-accent font-bold uppercase tracking-[0.2em] mt-1">Guild HQ</p>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem 
              icon={Home} 
              label="Home" 
              active={view === 'dashboard'} 
              onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Users} 
              label="Roster" 
              active={view === 'roster'} 
              onClick={() => { setView('roster'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Calendar} 
              label="Events" 
              active={view === 'events'} 
              onClick={() => { setView('events'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={ClipboardList} 
              label="Quest Board" 
              active={view === 'quests'} 
              onClick={() => { setView('quests'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={TrophyIcon} 
              label="Trophy Room" 
              active={view === 'trophy'} 
              onClick={() => { setView('trophy'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={BookOpen} 
              label="Farming Guide" 
              active={view === 'farming'} 
              onClick={() => { setView('farming'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Sparkles} 
              label="AI Room" 
              active={view === 'ai'} 
              onClick={() => { setView('ai'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={ShieldAlert} 
              label="Permissions" 
              active={view === 'permissions'} 
              onClick={() => { setView('permissions'); setIsSidebarOpen(false); }} 
            />
            
            <div className="h-px bg-white/5 my-4" />

            {isAdmin && (
              <>
                <SidebarItem 
                  icon={Settings} 
                  label="Admin Portal" 
                  active={view === 'admin'} 
                  onClick={() => { setView('admin'); setIsSidebarOpen(false); }} 
                />
                <SidebarItem 
                  icon={Users} 
                  label="Manage Members" 
                  active={view === 'members'} 
                  onClick={() => { setView('members'); setIsSidebarOpen(false); }} 
                />
                {isLeader && (
                  <SidebarItem 
                    icon={LinkIcon} 
                    label="Invite Codes" 
                    active={view === 'invites'} 
                    onClick={() => { setView('invites'); setIsSidebarOpen(false); }} 
                  />
                )}
                <SidebarItem 
                  icon={UserPlus} 
                  label="Join Guild (Demo)" 
                  active={view === 'join'} 
                  onClick={() => { setView('join'); setIsSidebarOpen(false); }} 
                />
              </>
            )}
            
            <SidebarItem 
              icon={UserPlus} 
              label="Recruitment" 
              active={view === 'recruitment'} 
              onClick={() => { setView('recruitment'); setIsSidebarOpen(false); }} 
            />

            <a 
              href="https://aqwwiki.wikidot.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all group"
            >
              <ExternalLink size={20} className="group-hover:text-guild-accent-secondary transition-colors" />
              <span className="font-medium text-sm tracking-wide">AQW Wiki</span>
            </a>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
            {/* Role Switcher for Demo */}
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Current Role</p>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="w-full bg-transparent text-xs text-guild-accent font-bold outline-none cursor-pointer"
              >
                <option value="Leader">Leader</option>
                <option value="Officer">Officer</option>
                <option value="Member">Member</option>
              </select>
            </div>

            <button 
              onClick={() => setView('landing')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto pt-24 lg:pt-12 px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
