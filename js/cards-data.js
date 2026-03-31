/* ============================================
   CLASS QUEST — Card Database
   ============================================ */

const CARD_DATABASE = [
  // ===== ATTACK CARDS =====
  {
    id: 'atk_001', name: '烈焰斩', type: 'attack', rarity: 'common',
    icon: '🔥', mana: 2, atk: 3, def: 0, spd: 1,
    desc: '挥舞烈焰之刃，对目标造成伤害。',
    effect: 'deal_damage', value: 3
  },
  {
    id: 'atk_002', name: '雷电箭', type: 'attack', rarity: 'common',
    icon: '⚡', mana: 2, atk: 4, def: 0, spd: 2,
    desc: '以闪电之速射出一箭，精准打击。',
    effect: 'deal_damage', value: 4
  },
  {
    id: 'atk_003', name: '冰霜新星', type: 'attack', rarity: 'rare',
    icon: '❄️', mana: 3, atk: 5, def: 0, spd: 1,
    desc: '释放冰霜之力，冻结范围内的一切。',
    effect: 'deal_damage_freeze', value: 5
  },
  {
    id: 'atk_004', name: '暗影突刺', type: 'attack', rarity: 'rare',
    icon: '🗡️', mana: 3, atk: 6, def: 0, spd: 3,
    desc: '从暗影中发起致命一击，速度极快。',
    effect: 'deal_damage', value: 6
  },
  {
    id: 'atk_005', name: '天崩地裂', type: 'attack', rarity: 'epic',
    icon: '💫', mana: 5, atk: 8, def: 0, spd: 0,
    desc: '召唤陨石从天而降，毁灭一切。',
    effect: 'deal_damage_all', value: 8
  },
  {
    id: 'atk_006', name: '神罚之雷', type: 'attack', rarity: 'legendary',
    icon: '⚡', mana: 7, atk: 12, def: 0, spd: 2,
    desc: '召唤九天神雷，净化世间一切邪恶。',
    effect: 'deal_damage_pierce', value: 12
  },
  {
    id: 'atk_007', name: '毒液飞溅', type: 'attack', rarity: 'common',
    icon: '🧪', mana: 1, atk: 2, def: 0, spd: 2,
    desc: '喷射腐蚀毒液，持续造成伤害。',
    effect: 'deal_damage_dot', value: 2
  },
  {
    id: 'atk_008', name: '地狱火柱', type: 'attack', rarity: 'epic',
    icon: '🌋', mana: 6, atk: 10, def: 0, spd: 1,
    desc: '从地底喷涌而出的烈焰火柱，焚烧一切。',
    effect: 'deal_damage', value: 10
  },

  // ===== DEFENSE CARDS =====
  {
    id: 'def_001', name: '铁壁护盾', type: 'defense', rarity: 'common',
    icon: '🛡️', mana: 2, atk: 0, def: 4, spd: 0,
    desc: '竖起坚不可摧的铁壁，抵御攻击。',
    effect: 'gain_armor', value: 4
  },
  {
    id: 'def_002', name: '圣光庇护', type: 'defense', rarity: 'rare',
    icon: '✨', mana: 3, atk: 0, def: 5, spd: 0,
    desc: '圣洁之光笼罩全身，抵挡一切伤害。',
    effect: 'gain_armor_heal', value: 5
  },
  {
    id: 'def_003', name: '冰墙', type: 'defense', rarity: 'common',
    icon: '🧊', mana: 2, atk: 0, def: 3, spd: 0,
    desc: '召唤冰墙挡住敌人的攻击。',
    effect: 'gain_armor', value: 3
  },
  {
    id: 'def_004', name: '龙鳞护甲', type: 'defense', rarity: 'epic',
    icon: '🐉', mana: 4, atk: 0, def: 7, spd: -1,
    desc: '以远古巨龙之鳞打造的护甲，坚固无比。',
    effect: 'gain_armor', value: 7
  },
  {
    id: 'def_005', name: '绝对领域', type: 'defense', rarity: 'legendary',
    icon: '🔮', mana: 6, atk: 0, def: 15, spd: 0,
    desc: '创造绝对防御领域，一切攻击化为乌有。',
    effect: 'gain_armor_immunity', value: 15
  },
  {
    id: 'def_006', name: '石肤术', type: 'defense', rarity: 'common',
    icon: '🪨', mana: 1, atk: 0, def: 2, spd: 0,
    desc: '皮肤石化，获得基础防御。',
    effect: 'gain_armor', value: 2
  },

  // ===== MAGIC CARDS =====
  {
    id: 'mag_001', name: '奥术飞弹', type: 'magic', rarity: 'common',
    icon: '💜', mana: 2, atk: 3, def: 0, spd: 2,
    desc: '发射追踪奥术飞弹，自动锁定目标。',
    effect: 'deal_damage', value: 3
  },
  {
    id: 'mag_002', name: '时间回溯', type: 'magic', rarity: 'epic',
    icon: '⏳', mana: 5, atk: 0, def: 0, spd: 0,
    desc: '逆转时间，恢复到上一回合的状态。',
    effect: 'rewind', value: 1
  },
  {
    id: 'mag_003', name: '召唤元素', type: 'magic', rarity: 'rare',
    icon: '🌊', mana: 4, atk: 4, def: 2, spd: 1,
    desc: '召唤水之元素精灵助战。',
    effect: 'summon_elemental', value: 4
  },
  {
    id: 'mag_004', name: '灵魂吸取', type: 'magic', rarity: 'rare',
    icon: '👻', mana: 3, atk: 3, def: 0, spd: 1,
    desc: '吸取敌人灵魂，造成伤害并恢复自身。',
    effect: 'drain_life', value: 3
  },
  {
    id: 'mag_005', name: '末日审判', type: 'magic', rarity: 'legendary',
    icon: '☄️', mana: 8, atk: 15, def: 0, spd: 0,
    desc: '召唤末日之力，对所有敌人造成毁灭性打击。',
    effect: 'deal_damage_all', value: 15
  },
  {
    id: 'mag_006', name: '镜像分身', type: 'magic', rarity: 'rare',
    icon: '🪞', mana: 3, atk: 0, def: 3, spd: 1,
    desc: '创造一个镜像分身，分担伤害。',
    effect: 'summon_mirror', value: 3
  },

  // ===== BUFF CARDS =====
  {
    id: 'buf_001', name: '力量祝福', type: 'buff', rarity: 'common',
    icon: '💪', mana: 2, atk: 3, def: 0, spd: 0,
    desc: '注入力量，提升攻击力。',
    effect: 'buff_atk', value: 3
  },
  {
    id: 'buf_002', name: '疾风步', type: 'buff', rarity: 'common',
    icon: '💨', mana: 1, atk: 0, def: 0, spd: 3,
    desc: '如风般迅捷，大幅提升速度。',
    effect: 'buff_spd', value: 3
  },
  {
    id: 'buf_003', name: '生命涌泉', type: 'buff', rarity: 'rare',
    icon: '💚', mana: 3, atk: 0, def: 0, spd: 0,
    desc: '涌出生命之泉，恢复大量生命值。',
    effect: 'heal', value: 6
  },
  {
    id: 'buf_004', name: '狂暴', type: 'buff', rarity: 'rare',
    icon: '😤', mana: 3, atk: 6, def: -2, spd: 2,
    desc: '进入狂暴状态，攻击力与速度大幅提升，但防御下降。',
    effect: 'berserk', value: 6
  },
  {
    id: 'buf_005', name: '神圣加护', type: 'buff', rarity: 'epic',
    icon: '🌟', mana: 4, atk: 2, def: 3, spd: 1,
    desc: '获得神圣之力的全方位庇护。',
    effect: 'buff_all', value: 2
  },
  {
    id: 'buf_006', name: '涅槃重生', type: 'buff', rarity: 'legendary',
    icon: '🔥', mana: 5, atk: 0, def: 0, spd: 0,
    desc: '浴火重生，死亡时自动复活并恢复一半生命值。',
    effect: 'revive', value: 50
  },

  // ===== LEGEND CARDS =====
  {
    id: 'leg_001', name: '创世之光', type: 'legend', rarity: 'legendary',
    icon: '☀️', mana: 10, atk: 20, def: 10, spd: 5,
    desc: '传说中的创世之光，蕴含天地之力，毁天灭地。',
    effect: 'ultimate', value: 20
  },
  {
    id: 'leg_002', name: '永恒之枪', type: 'legend', rarity: 'legendary',
    icon: '🔱', mana: 8, atk: 15, def: 5, spd: 3,
    desc: '命运之枪，一旦投出必定命中，无视防御。',
    effect: 'pierce_ultimate', value: 15
  },
  {
    id: 'leg_003', name: '世界树之叶', type: 'legend', rarity: 'legendary',
    icon: '🌿', mana: 6, atk: 0, def: 8, spd: 0,
    desc: '世界树的叶片，蕴含无穷生命力。',
    effect: 'heal_all', value: 10
  },
  {
    id: 'leg_004', name: '虚空吞噬', type: 'legend', rarity: 'legendary',
    icon: '🕳️', mana: 9, atk: 18, def: 0, spd: 1,
    desc: '打开虚空之门，吞噬一切存在。',
    effect: 'banish', value: 18
  },
];

// ===== HERO CLASSES =====
const HERO_CLASSES = {
  warrior: { name: '战士', icon: '⚔️', color: '#ef4444', atk: 8, def: 6, spd: 4, hp: 100, desc: '近战之王，攻防兼备' },
  mage:    { name: '法师', icon: '🔮', color: '#8b5cf6', atk: 10, def: 3, spd: 5, hp: 80, desc: '魔法大师，伤害爆表' },
  ranger:  { name: '游侠', icon: '🏹', color: '#10b981', atk: 7, def: 4, spd: 8, hp: 85, desc: '速度至上，先发制人' },
  healer:  { name: '牧师', icon: '💚', color: '#06b6d4', atk: 4, def: 5, spd: 5, hp: 90, desc: '治疗支援，团队核心' },
  assassin:{ name: '刺客', icon: '🗡️', color: '#ec4899', atk: 12, def: 2, spd: 9, hp: 70, desc: '高爆暗杀，一击致命' },
  tank:    { name: '坦克', icon: '🛡️', color: '#f97316', atk: 5, def: 10, spd: 3, hp: 120, desc: '铜墙铁壁，守护一切' },
};

// ===== ACHIEVEMENTS =====
const ACHIEVEMENTS = [
  { id: 'first_blood', name: '🩸 第一滴血', desc: '获得第一次对战胜利', condition: s => s.wins >= 1 },
  { id: 'collector', name: '📦 收藏家', desc: '收集10张不同卡牌', condition: s => s.cards.length >= 10 },
  { id: 'rich', name: '💰 小富翁', desc: '累计获得500金币', condition: s => s.totalGoldEarned >= 500 },
  { id: 'warrior_5', name: '⚔️ 五连胜', desc: '连续赢得5场对战', condition: s => s.winStreak >= 5 },
  { id: 'legendary_pull', name: '🌟 欧皇降临', desc: '抽到传说级卡牌', condition: s => s.cards.some(c => c.rarity === 'legendary') },
  { id: 'points_100', name: '💯 百分达人', desc: '累计获得100积分', condition: s => s.points >= 100 },
  { id: 'points_500', name: '🏅 五星上将', desc: '累计获得500积分', condition: s => s.points >= 500 },
  { id: 'full_set', name: '🃏 套牌大师', desc: '集齐所有类型卡牌', condition: s => {
    const types = new Set(s.cards.map(c => c.type));
    return types.has('attack') && types.has('defense') && types.has('magic') && types.has('buff');
  }},
  { id: 'helper', name: '🤝 热心助人', desc: '因帮助同学获得10次加分', condition: s => s.history.filter(h => h.reason === '帮助同学' && h.points > 0).length >= 10 },
  { id: 'speaker', name: '🎤 发言达人', desc: '因积极发言获得20次加分', condition: s => s.history.filter(h => h.reason === '积极发言' && h.points > 0).length >= 20 },
];

// ===== DAILY QUESTS =====
const DAILY_QUEST_TEMPLATES = [
  { text: '获得5次课堂加分', icon: '⭐', target: 5, type: 'points_gain' },
  { text: '进行1场对战', icon: '⚔️', target: 1, type: 'battle' },
  { text: '收集1张新卡牌', icon: '🃏', target: 1, type: 'collect' },
  { text: '帮助同学2次', icon: '🤝', target: 2, type: 'help' },
  { text: '积极发言3次', icon: '🎤', target: 3, type: 'speak' },
  { text: '完成作业获优', icon: '📝', target: 1, type: 'homework' },
  { text: '小组合作完成任务', icon: '👥', target: 1, type: 'teamwork' },
];

// ===== RARITY CONFIG =====
const RARITY_CONFIG = {
  common:    { name: '普通', star: '⭐', color: '#9ca3af', weight: 50 },
  rare:      { name: '稀有', star: '⭐⭐', color: '#3b82f6', weight: 30 },
  epic:      { name: '史诗', star: '⭐⭐⭐', color: '#8b5cf6', weight: 15 },
  legendary: { name: '传说', star: '⭐⭐⭐⭐', color: '#ffd700', weight: 5 },
};

// ===== AVATARS =====
const AVATAR_EMOJIS = ['😊', '😎', '🤓', '😺', '🦊', '🐱', '🦁', '🐯', '🐼', '🐨', '🦄', '🐲', '🦋', '🦉', '🐺', '🎮', '🎯', '🎸', '🎹', '🏆', '🌟', '💫', '🔮', '🎭'];
