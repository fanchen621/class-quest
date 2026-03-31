/* ============================================
   CLASS QUEST — Main Application
   ============================================ */

// ===== STATE =====
let state = loadState();

function defaultState() {
  return {
    students: [],
    classes: [{ id: 'default', name: '默认班级' }],
    currentClass: 'default',
    collection: [], // all owned cards
    battles: 0,
    gold: 200,
    gems: 50,
    totalGoldEarned: 200,
    pityCount: 0,
    activities: [],
    dailyQuests: generateDailyQuests(),
    questProgress: {},
    xpHistory: [0],
  };
}

function generateDailyQuests() {
  const shuffled = [...DAILY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4).map((q, i) => ({
    ...q,
    id: `dq_${Date.now()}_${i}`,
    current: 0,
    done: false,
    reward: { gold: 10 + i * 5, gems: i === 3 ? 5 : 0 },
  }));
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('classquest_state'));
    if (s && s.students) {
      // regenerate daily quests if a new day
      if (!s.dailyQuests || !Array.isArray(s.dailyQuests) || s.dailyQuests.length === 0) {
        s.dailyQuests = generateDailyQuests();
        s.questProgress = {};
      }
      return s;
    }
  } catch (e) {}
  return defaultState();
}

function saveState() {
  localStorage.setItem('classquest_state', JSON.stringify(state));
}

// ===== PARTICLES =====
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  const particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: ['#8b5cf6', '#ffd700', '#06b6d4', '#ec4899'][Math.floor(Math.random() * 4)],
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== NAVIGATION =====
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const view = document.getElementById(`view-${viewId}`);
  if (view) view.classList.add('active');
  const link = document.querySelector(`.nav-link[data-view="${viewId}"]`);
  if (link) link.classList.add('active');

  // Refresh view
  if (viewId === 'dashboard') renderDashboard();
  if (viewId === 'students') renderStudents();
  if (viewId === 'cards') renderCards();
  if (viewId === 'leaderboard') renderLeaderboard();
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    switchView(link.dataset.view);
  });
});

// ===== XP CHART =====
function drawXPChart() {
  const canvas = document.getElementById('xpChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const data = state.xpHistory.slice(-14);
  if (data.length < 2) {
    ctx.fillStyle = '#6060a0';
    ctx.font = '14px "Noto Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillText('数据积累中...', w / 2, h / 2);
    return;
  }

  const max = Math.max(...data, 1);
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  // Grid
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.stroke();
  }

  // Line
  const step = chartW / (data.length - 1);
  const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
  gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
  gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

  // Area
  ctx.beginPath();
  ctx.moveTo(padding.left, h - padding.bottom);
  data.forEach((v, i) => {
    const x = padding.left + i * step;
    const y = padding.top + chartH - (v / max) * chartH;
    ctx.lineTo(x, y);
  });
  ctx.lineTo(padding.left + (data.length - 1) * step, h - padding.bottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = padding.left + i * step;
    const y = padding.top + chartH - (v / max) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Points
  data.forEach((v, i) => {
    const x = padding.left + i * step;
    const y = padding.top + chartH - (v / max) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5cf6';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Labels
  ctx.fillStyle = '#6060a0';
  ctx.font = '10px "Orbitron"';
  ctx.textAlign = 'center';
  ctx.fillText('近14天', w / 2, h - 5);
}

// ===== DASHBOARD =====
function renderDashboard() {
  // Stats
  document.getElementById('statStudents').textContent = state.students.length;
  document.getElementById('statCards').textContent = state.collection.length;
  document.getElementById('statBattles').textContent = state.battles;
  const totalAchievements = state.students.reduce((sum, s) => sum + (s.achievements ? s.achievements.length : 0), 0);
  document.getElementById('statAchievements').textContent = totalAchievements;

  // Gold & Gems
  document.getElementById('totalGold').textContent = state.gold;
  document.getElementById('totalGems').textContent = state.gems;

  // Daily Quests
  const questEl = document.getElementById('dailyQuests');
  if (state.dailyQuests && state.dailyQuests.length > 0) {
    questEl.innerHTML = state.dailyQuests.map(q => `
      <div class="quest-item ${q.done ? 'done' : ''}" onclick="claimQuest('${q.id}')">
        <div class="quest-check">${q.done ? '✓' : ''}</div>
        <span class="activity-icon">${q.icon}</span>
        <span class="quest-text">${q.text}</span>
        <span class="quest-reward">${q.done ? '已领取' : `+${q.reward.gold}💰${q.reward.gems ? ' +' + q.reward.gems + '💎' : ''}`}</span>
      </div>
    `).join('');
  } else {
    questEl.innerHTML = '<div class="quest-item"><span class="quest-text" style="color:var(--text-muted)">今日任务已完成！明天再来 ✨</span></div>';
  }

  // Activities
  const actEl = document.getElementById('activityFeed');
  const recent = state.activities.slice(-20).reverse();
  actEl.innerHTML = recent.length > 0 ? recent.map(a => `
    <div class="activity-item">
      <span class="activity-icon">${a.icon}</span>
      <span class="activity-text">${a.text}</span>
      <span class="activity-time">${a.time}</span>
    </div>
  `).join('') : '<div class="activity-item"><span class="activity-text" style="color:var(--text-muted)">还没有动态，开始冒险吧！</span></div>';

  // XP Chart
  drawXPChart();

  // Update nav
  document.getElementById('totalGold').textContent = state.gold;
  document.getElementById('totalGems').textContent = state.gems;
}

function claimQuest(id) {
  const q = state.dailyQuests.find(q => q.id === id);
  if (!q || q.done) return;
  if (q.current >= q.target) {
    q.done = true;
    state.gold += q.reward.gold;
    state.gems += q.reward.gems;
    state.totalGoldEarned += q.reward.gold;
    addActivity('✅', `完成任务「${q.text}」，获得 ${q.reward.gold}💰`);
    toast(`任务完成！+${q.reward.gold}💰`, 'success');
    saveState();
    renderDashboard();
  } else {
    toast(`进度: ${q.current}/${q.target}`, 'info');
  }
}

function advanceQuest(type, amount = 1) {
  if (!state.dailyQuests) return;
  state.dailyQuests.forEach(q => {
    if (q.type === type && !q.done) {
      q.current = Math.min(q.current + amount, q.target);
    }
  });
}

// ===== STUDENTS =====
function renderStudents() {
  const grid = document.getElementById('studentGrid');
  const classStudents = state.students.filter(s => s.classId === state.currentClass);

  if (classStudents.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
        <div style="font-size: 64px; margin-bottom: 16px;">👥</div>
        <h3 style="color: var(--text-secondary); margin-bottom: 8px;">还没有英雄</h3>
        <p style="color: var(--text-muted); margin-bottom: 24px;">点击「招募英雄」开始你的冒险</p>
        <button class="btn-primary" onclick="openAddStudent()">➕ 招募英雄</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = classStudents.map(s => {
    const classInfo = HERO_CLASSES[s.heroClass] || HERO_CLASSES.warrior;
    const level = calcLevel(s.points);
    const xpPercent = calcXPPercent(s.points);
    const avatar = s.avatar || AVATAR_EMOJIS[Math.abs(hashCode(s.name)) % AVATAR_EMOJIS.length];

    return `
      <div class="hero-card" onclick="openStudentDetail('${s.id}')">
        <div class="hero-card-top" style="background: linear-gradient(160deg, ${classInfo.color}22, ${classInfo.color}08);">
          <div class="hero-level">${level}</div>
          <div class="hero-avatar" style="background: ${classInfo.color};">${avatar}</div>
          <div class="hero-class-badge" style="background: ${classInfo.color}33; color: ${classInfo.color}; border: 1px solid ${classInfo.color}55;">
            ${classInfo.icon} ${classInfo.name}
          </div>
        </div>
        <div class="hero-card-body">
          <div class="hero-name">${s.name}</div>
          <div class="hero-xp-bar">
            <div class="hero-xp-fill" style="width: ${xpPercent}%;"></div>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <div class="hero-stat-value" style="color: var(--red);">${classInfo.atk + Math.floor(level * 0.5)}</div>
              <div class="hero-stat-label">ATK</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-value" style="color: var(--blue);">${classInfo.def + Math.floor(level * 0.3)}</div>
              <div class="hero-stat-label">DEF</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-value" style="color: var(--green);">${classInfo.spd + Math.floor(level * 0.2)}</div>
              <div class="hero-stat-label">SPD</div>
            </div>
          </div>
          <div class="hero-points-display">💰 ${s.points}</div>
        </div>
      </div>
    `;
  }).join('');
}

function calcLevel(points) {
  return Math.max(1, Math.floor(Math.sqrt(points / 10)) + 1);
}

function calcXPPercent(points) {
  const level = calcLevel(points);
  const prevThreshold = (level - 1) * (level - 1) * 10;
  const nextThreshold = level * level * 10;
  return Math.min(100, ((points - prevThreshold) / (nextThreshold - prevThreshold)) * 100);
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function openAddStudent() {
  document.getElementById('studentName').value = '';
  openModal('modalAddStudent');
}

// Class picker
document.querySelectorAll('.class-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.class-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

function addStudent(e) {
  e.preventDefault();
  const name = document.getElementById('studentName').value.trim();
  if (!name) return;
  const classOpt = document.querySelector('.class-option.selected');
  const heroClass = classOpt ? classOpt.dataset.class : 'warrior';
  const color = document.getElementById('studentColor').value;

  const student = {
    id: 'stu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name,
    heroClass,
    color,
    avatar: AVATAR_EMOJIS[Math.abs(hashCode(name)) % AVATAR_EMOJIS.length],
    classId: state.currentClass,
    points: 0,
    cards: [],
    wins: 0,
    losses: 0,
    winStreak: 0,
    achievements: [],
    history: [],
    totalGoldEarned: 0,
    createdAt: Date.now(),
  };

  state.students.push(student);
  addActivity('🆕', `${name} 加入了冒险队伍！`);
  toast(`${name} 已招募！`, 'success');
  saveState();
  closeModal('modalAddStudent');
  renderStudents();
}

function openBatchAdd() {
  document.getElementById('batchNames').value = '';
  openModal('modalBatch');
}

function batchImport() {
  const text = document.getElementById('batchNames').value.trim();
  if (!text) return;
  const lines = text.split('\n').filter(l => l.trim());
  let count = 0;
  lines.forEach(line => {
    const parts = line.split(/[,，]/);
    const name = parts[0].trim();
    if (!name || state.students.some(s => s.name === name)) return;
    const className = parts[1] ? parts[1].trim() : '';
    const heroClass = Object.keys(HERO_CLASSES).find(k =>
      HERO_CLASSES[k].name === className
    ) || 'warrior';

    state.students.push({
      id: 'stu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name,
      heroClass,
      color: HERO_CLASSES[heroClass].color,
      avatar: AVATAR_EMOJIS[Math.abs(hashCode(name)) % AVATAR_EMOJIS.length],
      classId: state.currentClass,
      points: 0,
      cards: [],
      wins: 0,
      losses: 0,
      winStreak: 0,
      achievements: [],
      history: [],
      totalGoldEarned: 0,
      createdAt: Date.now(),
    });
    count++;
  });

  toast(`成功招募 ${count} 名英雄！`, 'success');
  addActivity('📋', `批量招募了 ${count} 名英雄`);
  saveState();
  closeModal('modalBatch');
  renderStudents();
}

function openStudentDetail(id) {
  const s = state.students.find(s => s.id === id);
  if (!s) return;
  const classInfo = HERO_CLASSES[s.heroClass] || HERO_CLASSES.warrior;
  const level = calcLevel(s.points);

  document.getElementById('detailStudentName').textContent = `${s.name} 的英雄档案`;

  // Hero card (large)
  document.getElementById('detailHeroCard').innerHTML = `
    <div class="game-card rarity-${level >= 20 ? 'legendary' : level >= 10 ? 'epic' : level >= 5 ? 'rare' : 'common'}" style="width:100%;height:100%;">
      <div class="game-card-inner">
        <div class="card-mana">${level}</div>
        <div class="card-rarity-star">${level >= 20 ? '⭐⭐⭐⭐' : level >= 10 ? '⭐⭐⭐' : level >= 5 ? '⭐⭐' : '⭐'}</div>
        <div class="card-art" style="font-size:80px;">${s.avatar || '😊'}</div>
        <div class="card-info">
          <div class="card-name">${s.name}</div>
          <div class="card-type">${classInfo.icon} ${classInfo.name} · Lv.${level}</div>
          <div class="card-desc">${classInfo.desc}</div>
        </div>
        <div class="card-stats-bar">
          <span class="card-stat atk">⚔${classInfo.atk + Math.floor(level * 0.5)}</span>
          <span class="card-stat def">🛡${classInfo.def + Math.floor(level * 0.3)}</span>
          <span class="card-stat spd">💨${classInfo.spd + Math.floor(level * 0.2)}</span>
        </div>
      </div>
    </div>
  `;

  // Stats
  document.getElementById('detailStats').innerHTML = `
    <div class="detail-stat-item">
      <div class="detail-stat-value" style="color:var(--gold)">${s.points}</div>
      <div class="detail-stat-label">总积分</div>
    </div>
    <div class="detail-stat-item">
      <div class="detail-stat-value" style="color:var(--green)">${s.wins}</div>
      <div class="detail-stat-label">胜场</div>
    </div>
    <div class="detail-stat-item">
      <div class="detail-stat-value" style="color:var(--red)">${s.losses}</div>
      <div class="detail-stat-label">败场</div>
    </div>
    <div class="detail-stat-item">
      <div class="detail-stat-value" style="color:var(--purple)">${s.winStreak}</div>
      <div class="detail-stat-label">连胜</div>
    </div>
    <div class="detail-stat-item">
      <div class="detail-stat-value" style="color:var(--cyan)">${level}</div>
      <div class="detail-stat-label">等级</div>
    </div>
    <div class="detail-stat-item">
      <div class="detail-stat-value" style="color:var(--pink)">${s.cards ? s.cards.length : 0}</div>
      <div class="detail-stat-label">卡牌</div>
    </div>
  `;

  // Cards
  const cardList = document.getElementById('detailCardList');
  if (s.cards && s.cards.length > 0) {
    cardList.innerHTML = s.cards.map(c => `
      <div class="mini-card" title="${c.name}" onclick="showCardDetail('${c.id}')">${c.icon}</div>
    `).join('');
  } else {
    cardList.innerHTML = '<span style="color:var(--text-muted);font-size:13px;">还没有卡牌，去召唤吧！</span>';
  }

  // History
  const histEl = document.getElementById('detailHistory');
  const history = (s.history || []).slice(-20).reverse();
  histEl.innerHTML = history.length > 0 ? history.map(h => `
    <div class="history-item">
      <span class="h-points ${h.points > 0 ? 'positive' : 'negative'}">${h.points > 0 ? '+' : ''}${h.points}</span>
      <span>${h.reason || ''}</span>
      <span style="color:var(--text-muted);font-size:11px;margin-left:auto;">${h.time || ''}</span>
    </div>
  `).join('') : '<span style="color:var(--text-muted);font-size:13px;">暂无记录</span>';

  // Achievements
  const achEl = document.getElementById('detailAchievements');
  checkAchievements(s);
  achEl.innerHTML = s.achievements && s.achievements.length > 0
    ? s.achievements.map(aId => {
        const a = ACHIEVEMENTS.find(x => x.id === aId);
        return a ? `<span class="achievement-badge">${a.name}</span>` : '';
      }).join('')
    : '<span style="color:var(--text-muted);font-size:13px;">还没有成就</span>';

  openModal('modalStudentDetail');
}

function checkAchievements(student) {
  if (!student.achievements) student.achievements = [];
  ACHIEVEMENTS.forEach(a => {
    if (student.achievements.includes(a.id)) return;
    if (a.condition(student)) {
      student.achievements.push(a.id);
      addActivity('🎖️', `${student.name} 解锁成就「${a.name}」！`);
      toast(`成就解锁！${a.name}`, 'success');
    }
  });
}

// ===== POINTS =====
let selectedPointStudents = new Set();

function quickAddPoints() {
  document.getElementById('pointsModalTitle').textContent = '➕ 加分';
  selectedPointStudents.clear();
  renderPointStudents();
  openModal('modalPoints');
}

function quickSubtractPoints() {
  document.getElementById('pointsModalTitle').textContent = '➖ 扣分';
  selectedPointStudents.clear();
  renderPointStudents();
  openModal('modalPoints');
}

function renderPointStudents() {
  const grid = document.getElementById('pointsStudentSelect');
  const classStudents = state.students.filter(s => s.classId === state.currentClass);
  grid.innerHTML = classStudents.map(s => `
    <div class="student-select-item ${selectedPointStudents.has(s.id) ? 'selected' : ''}" onclick="togglePointStudent('${s.id}')">
      <div class="ss-avatar" style="background:${HERO_CLASSES[s.heroClass]?.color || '#8b5cf6'}">${s.avatar || '😊'}</div>
      <div>${s.name}</div>
    </div>
  `).join('');
}

function togglePointStudent(id) {
  if (selectedPointStudents.has(id)) selectedPointStudents.delete(id);
  else selectedPointStudents.add(id);
  renderPointStudents();
}

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('customPoints').value = '';
  });
});

function applyPoints() {
  if (selectedPointStudents.size === 0) {
    toast('请先选择学生', 'error');
    return;
  }
  const isSubtract = document.getElementById('pointsModalTitle').textContent.includes('扣分');
  const customVal = document.getElementById('customPoints').value;
  let points = customVal ? parseInt(customVal) : parseInt(document.querySelector('.preset-btn.active')?.dataset.points || 5);
  if (isSubtract) points = -Math.abs(points);
  else points = Math.abs(points);
  const reason = document.getElementById('pointsReason').value;

  selectedPointStudents.forEach(id => {
    const s = state.students.find(x => x.id === id);
    if (!s) return;
    s.points = Math.max(0, s.points + points);
    if (!s.history) s.history = [];
    s.history.push({ points, reason, time: formatTime() });
    if (points > 0) {
      state.gold += points;
      state.totalGoldEarned += points;
      s.totalGoldEarned = (s.totalGoldEarned || 0) + points;
    }
    checkAchievements(s);
  });

  const names = [...selectedPointStudents].map(id => state.students.find(s => s.id === id)?.name).join('、');
  const icon = points > 0 ? '➕' : '➖';
  addActivity(icon, `${names} ${points > 0 ? '获得' : '扣除'} ${Math.abs(points)} 分（${reason}）`);
  toast(`${points > 0 ? '+' : ''}${points} 分已应用`, 'success');

  // Update daily quest
  if (points > 0) advanceQuest('points_gain', selectedPointStudents.size);

  // Update XP history
  const totalPoints = state.students.reduce((s, x) => s + x.points, 0);
  state.xpHistory.push(totalPoints);
  if (state.xpHistory.length > 30) state.xpHistory.shift();

  saveState();
  closeModal('modalPoints');
  renderDashboard();
}

// ===== RANDOM =====
function quickRandom() {
  const classStudents = state.students.filter(s => s.classId === state.currentClass);
  if (classStudents.length === 0) {
    toast('还没有学生可以随机', 'error');
    return;
  }
  const spinner = document.getElementById('randomSpinner');
  const wheel = document.getElementById('spinnerWheel');
  const result = document.getElementById('spinnerResult');
  spinner.classList.remove('hidden');
  result.classList.remove('visible');

  // Build wheel segments
  const segCount = classStudents.length;
  const segAngle = 360 / segCount;
  let gradient = '';
  classStudents.forEach((s, i) => {
    const color = HERO_CLASSES[s.heroClass]?.color || '#8b5cf6';
    gradient += `${color} ${i * segAngle}deg ${(i + 1) * segAngle}deg, `;
  });
  gradient = gradient.slice(0, -2);
  wheel.style.background = `conic-gradient(${gradient})`;
  wheel.style.transform = 'rotate(0deg)';

  // Add names
  wheel.innerHTML = classStudents.map((s, i) => {
    const angle = segAngle * i + segAngle / 2;
    return `<div style="position:absolute;top:50%;left:50%;transform:rotate(${angle}deg) translateY(-120px);font-size:12px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.8);white-space:nowrap;">${s.name}</div>`;
  }).join('');

  // Spin
  const winner = Math.floor(Math.random() * segCount);
  const finalAngle = 360 * 5 + (360 - winner * segAngle - segAngle / 2);
  setTimeout(() => {
    wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    wheel.style.transform = `rotate(${finalAngle}deg)`;
  }, 100);

  setTimeout(() => {
    const s = classStudents[winner];
    result.textContent = `🎉 ${s.name}！`;
    result.classList.add('visible');
    addActivity('🎲', `随机选中了 ${s.name}`);
    toast(`${s.name} 被选中了！`, 'info');

    // Auto award point
    s.points += 2;
    if (!s.history) s.history = [];
    s.history.push({ points: 2, reason: '随机选中奖励', time: formatTime() });

    setTimeout(() => {
      spinner.classList.add('hidden');
      wheel.style.transition = 'none';
      saveState();
    }, 2500);
  }, 4200);
}

// ===== GROUP =====
function quickGroup() {
  const classStudents = state.students.filter(s => s.classId === state.currentClass);
  if (classStudents.length < 2) {
    toast('至少需要2名学生', 'error');
    return;
  }
  const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
  const groupCount = Math.min(4, Math.ceil(shuffled.length / 3));
  const groups = Array.from({ length: groupCount }, () => []);
  shuffled.forEach((s, i) => groups[i % groupCount].push(s.name));

  const groupText = groups.map((g, i) => `第${i + 1}组: ${g.join('、')}`).join('\n');
  addActivity('👥', `随机分组完成 (${groupCount}组)`);
  toast(`已分为 ${groupCount} 组`, 'success');
  alert(`🎲 随机分组结果：\n\n${groupText}`);
}

// ===== CARDS COLLECTION =====
function renderCards(filter = 'all') {
  const collection = document.getElementById('cardCollection');
  let cards = [...state.collection];

  if (filter !== 'all') {
    cards = cards.filter(c => c.type === filter);
  }

  // Also show uncollected (grayed)
  const owned = new Set(cards.map(c => c.id));
  const allCards = filter === 'all' ? CARD_DATABASE : CARD_DATABASE.filter(c => c.type === filter);

  collection.innerHTML = allCards.map(card => {
    const isOwned = owned.has(card.id) || state.collection.some(c => c.baseId === card.id);
    const rarityClass = `rarity-${card.rarity}`;
    const typeNames = { attack: '攻击', defense: '防御', magic: '法术', buff: '增益', legend: '传说' };

    return `
      <div class="game-card ${rarityClass}" style="${!isOwned ? 'filter: brightness(0.3) grayscale(1);' : ''}" onclick="${isOwned ? `showCardDetail('${card.id}')` : ''}">
        <div class="game-card-inner">
          <div class="card-mana">${card.mana}</div>
          <div class="card-rarity-star">${RARITY_CONFIG[card.rarity].star}</div>
          <div class="card-art">${card.icon}</div>
          <div class="card-info">
            <div class="card-name">${isOwned ? card.name : '???'}</div>
            <div class="card-type">${typeNames[card.type] || card.type} · ${RARITY_CONFIG[card.rarity].name}</div>
            <div class="card-desc">${isOwned ? card.desc : '尚未获得'}</div>
          </div>
          <div class="card-stats-bar">
            <span class="card-stat atk">⚔${card.atk}</span>
            <span class="card-stat def">🛡${card.def}</span>
            <span class="card-stat spd">💨${card.spd}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards(btn.dataset.filter);
  });
});

function showCardDetail(cardId) {
  const card = CARD_DATABASE.find(c => c.id === cardId) || state.collection.find(c => c.baseId === cardId || c.id === cardId);
  if (!card) return;
  const rarityClass = `rarity-${card.rarity}`;
  const typeNames = { attack: '攻击', defense: '防御', magic: '法术', buff: '增益', legend: '传说' };

  document.getElementById('cardDetailView').innerHTML = `
    <div class="game-card ${rarityClass}" style="width:280px;height:400px;margin:0 auto;">
      <div class="game-card-inner">
        <div class="card-mana">${card.mana}</div>
        <div class="card-rarity-star">${RARITY_CONFIG[card.rarity].star}</div>
        <div class="card-art" style="font-size:80px;">${card.icon}</div>
        <div class="card-info">
          <div class="card-name" style="font-size:18px;">${card.name}</div>
          <div class="card-type">${typeNames[card.type] || card.type} · ${RARITY_CONFIG[card.rarity].name}</div>
          <div class="card-desc" style="-webkit-line-clamp:unset;">${card.desc}</div>
        </div>
        <div class="card-stats-bar">
          <span class="card-stat atk">⚔ ${card.atk}</span>
          <span class="card-stat def">🛡 ${card.def}</span>
          <span class="card-stat spd">💨 ${card.spd}</span>
        </div>
      </div>
    </div>
  `;
  openModal('modalCardDetail');
}

// ===== GACHA =====
function gachaPull(count) {
  const cost = count === 1 ? 10 : 90;
  if (state.gems < cost) {
    toast('💎 不足！通过积分和对战获取', 'error');
    return;
  }

  state.gems -= cost;
  const results = [];

  for (let i = 0; i < count; i++) {
    state.pityCount++;
    let rarity;
    if (state.pityCount >= 90) {
      rarity = 'legendary';
      state.pityCount = 0;
    } else {
      const roll = Math.random() * 100;
      const rConfig = RARITY_CONFIG;
      if (roll < rConfig.legendary.weight) rarity = 'legendary';
      else if (roll < rConfig.legendary.weight + rConfig.epic.weight) rarity = 'epic';
      else if (roll < rConfig.legendary.weight + rConfig.epic.weight + rConfig.rare.weight) rarity = 'rare';
      else rarity = 'common';

      if (rarity === 'legendary') state.pityCount = 0;
    }

    // Pick card from rarity pool
    const pool = CARD_DATABASE.filter(c => c.rarity === rarity);
    const card = pool[Math.floor(Math.random() * pool.length)];

    const ownedCard = {
      ...card,
      baseId: card.id,
      id: 'owned_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      obtainedAt: Date.now(),
    };

    state.collection.push(ownedCard);
    results.push(ownedCard);

    // Add to random student
    const classStudents = state.students.filter(s => s.classId === state.currentClass);
    if (classStudents.length > 0) {
      const student = classStudents[Math.floor(Math.random() * classStudents.length)];
      if (!student.cards) student.cards = [];
      student.cards.push(ownedCard);
      checkAchievements(student);
    }

    if (rarity === 'legendary') {
      advanceQuest('collect');
    }
  }

  // Show results
  showGachaResults(results);
  saveState();

  // Update pity display
  document.getElementById('pityCount').textContent = state.pityCount;
  document.getElementById('pityFill').style.width = `${(state.pityCount / 90) * 100}%`;
}

function showGachaResults(cards) {
  const overlay = document.getElementById('gachaOverlay');
  const container = document.getElementById('gachaResults');
  overlay.classList.remove('hidden');

  container.innerHTML = cards.map((card, i) => `
    <div class="gacha-result-card" style="animation-delay: ${i * 0.15}s; width: ${cards.length <= 5 ? '180px' : '140px'}; height: ${cards.length <= 5 ? '260px' : '200px'};">
      <div class="game-card rarity-${card.rarity}">
        <div class="game-card-inner">
          <div class="card-mana">${card.mana}</div>
          <div class="card-rarity-star">${RARITY_CONFIG[card.rarity].star}</div>
          <div class="card-art">${card.icon}</div>
          <div class="card-info">
            <div class="card-name">${card.name}</div>
            <div class="card-type">${RARITY_CONFIG[card.rarity].name}</div>
          </div>
          <div class="card-stats-bar">
            <span class="card-stat atk">⚔${card.atk}</span>
            <span class="card-stat def">🛡${card.def}</span>
            <span class="card-stat spd">💨${card.spd}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const hasLegendary = cards.some(c => c.rarity === 'legendary');
  if (hasLegendary) {
    overlay.style.background = 'radial-gradient(circle, rgba(255,215,0,0.15), rgba(0,0,0,0.95))';
  } else {
    overlay.style.background = 'rgba(0, 0, 0, 0.9)';
  }

  addActivity('✨', `召唤了 ${cards.length} 张卡牌${hasLegendary ? '（含传说！）' : ''}`);
}

function closeGachaResults() {
  document.getElementById('gachaOverlay').classList.add('hidden');
  renderDashboard();
}

// ===== BATTLE SYSTEM =====
let battleState = null;

function startBattleMode(mode) {
  const classStudents = state.students.filter(s => s.classId === state.currentClass);
  if (classStudents.length < 2 && mode !== 'boss') {
    toast('至少需要2名学生', 'error');
    return;
  }

  if (mode === '1v1') {
    const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
    const p1 = shuffled[0];
    const p2 = shuffled[1] || classStudents[0];
    initBattle(p1, p2);
  } else if (mode === 'group') {
    const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    const team1 = shuffled.slice(0, mid);
    const team2 = shuffled.slice(mid);
    // Use team leaders
    initBattle(team1[0], team2[0], team1, team2);
  } else if (mode === 'boss') {
    const boss = {
      id: 'boss',
      name: '暗影巨龙 🐉',
      heroClass: 'tank',
      avatar: '🐉',
      points: 500,
      wins: 99,
      losses: 0,
      winStreak: 99,
      cards: [],
      history: [],
      achievements: [],
    };
    const hero = classStudents.length > 0
      ? classStudents.sort((a, b) => b.points - a.points)[0]
      : { id: 'hero', name: '勇者', heroClass: 'warrior', avatar: '⚔️', points: 100, cards: [], wins: 0, losses: 0, winStreak: 0, history: [], achievements: [] };
    initBattle(hero, boss);
  }
}

function initBattle(player, enemy, team1 = null, team2 = null) {
  const pClass = HERO_CLASSES[player.heroClass] || HERO_CLASSES.warrior;
  const eClass = HERO_CLASSES[enemy.heroClass] || HERO_CLASSES.warrior;
  const pLevel = calcLevel(player.points);
  const eLevel = enemy.id === 'boss' ? 25 : calcLevel(enemy.points);

  battleState = {
    player: {
      student: player,
      hp: (pClass.hp + pLevel * 5),
      maxHp: (pClass.hp + pLevel * 5),
      atk: pClass.atk + Math.floor(pLevel * 0.5),
      def: pClass.def + Math.floor(pLevel * 0.3),
      spd: pClass.spd + Math.floor(pLevel * 0.2),
      mana: 3,
      maxMana: 10,
      hand: drawBattleCards(4),
      armor: 0,
    },
    enemy: {
      student: enemy,
      hp: (eClass.hp + eLevel * 5),
      maxHp: (eClass.hp + eLevel * 5),
      atk: eClass.atk + Math.floor(eLevel * 0.5),
      def: eClass.def + Math.floor(eLevel * 0.3),
      spd: eClass.spd + Math.floor(eLevel * 0.2),
      mana: 3,
      maxMana: 10,
      hand: drawBattleCards(4),
      armor: 0,
    },
    turn: 'player',
    turnNumber: 1,
    log: [],
    team1,
    team2,
    mode: team1 ? 'group' : (enemy.id === 'boss' ? 'boss' : '1v1'),
  };

  // Show arena
  document.getElementById('battleSetup').classList.add('hidden');
  document.getElementById('battleArena').classList.remove('hidden');
  renderBattle();
}

function drawBattleCards(count) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    const card = CARD_DATABASE[Math.floor(Math.random() * CARD_DATABASE.length)];
    cards.push({ ...card });
  }
  return cards;
}

function renderBattle() {
  if (!battleState) return;
  const { player, enemy } = battleState;

  // Player
  const pClass = HERO_CLASSES[player.student.heroClass] || HERO_CLASSES.warrior;
  document.getElementById('playerAvatar').innerHTML = player.student.avatar || '😊';
  document.getElementById('playerAvatar').style.background = pClass.color;
  document.getElementById('playerName').textContent = player.student.name;
  document.getElementById('playerHP').style.width = `${(player.hp / player.maxHp) * 100}%`;
  if (player.hp / player.maxHp < 0.3) document.getElementById('playerHP').classList.add('danger');
  else document.getElementById('playerHP').classList.remove('danger');
  document.getElementById('playerATK').textContent = player.atk;
  document.getElementById('playerDEF').textContent = player.def;

  // Enemy
  const eClass = HERO_CLASSES[enemy.student.heroClass] || HERO_CLASSES.warrior;
  document.getElementById('enemyAvatar').innerHTML = enemy.student.avatar || '🐉';
  document.getElementById('enemyAvatar').style.background = eClass.color;
  document.getElementById('enemyName').textContent = enemy.student.name;
  document.getElementById('enemyHP').style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
  document.getElementById('enemyATK').textContent = enemy.atk;
  document.getElementById('enemyDEF').textContent = enemy.def;

  // Player hand
  const handEl = document.getElementById('playerHand');
  handEl.innerHTML = player.hand.map((card, i) => `
    <div class="battle-card" onclick="playBattleCard(${i})" title="${card.name}: ${card.desc}">
      <div class="bc-icon">${card.icon}</div>
      <div class="bc-name">${card.name}</div>
      <div class="bc-dmg">${card.atk > 0 ? '⚔' + card.atk : ''}${card.def > 0 ? ' 🛡' + card.def : ''}</div>
      <div style="font-size:9px;color:var(--blue);">💎${card.mana}</div>
    </div>
  `).join('');

  // Enemy hand (face down)
  const enemyHandEl = document.getElementById('enemyHand');
  enemyHandEl.innerHTML = enemy.hand.map(() => `
    <div class="battle-card" style="background: linear-gradient(135deg, #2a2a4a, #1a1a35); cursor:default;">
      <div class="bc-icon">🃏</div>
    </div>
  `).join('');

  // Turn indicator
  document.getElementById('turnIndicator').textContent =
    battleState.turn === 'player' ? `🎯 ${player.student.name} 的回合` : `⏳ ${enemy.student.name} 的回合`;

  // Log
  const logEl = document.getElementById('battleLog');
  logEl.innerHTML = battleState.log.slice(-10).map(l => `
    <div class="log-entry ${l.type}">${l.text}</div>
  `).join('');
  logEl.scrollTop = logEl.scrollHeight;

  // Mana display
  document.getElementById('btnEndTurn').textContent = `结束回合 ⏭️ (💎${player.mana}/${player.maxMana})`;
}

function playBattleCard(index) {
  if (!battleState || battleState.turn !== 'player') return;
  const player = battleState.player;
  const card = player.hand[index];
  if (!card) return;
  if (player.mana < card.mana) {
    toast('法力不足！', 'error');
    return;
  }

  player.mana -= card.mana;
  executeCardEffect(card, player, battleState.enemy);
  player.hand.splice(index, 1);

  // Draw a new card
  if (player.hand.length < 5) {
    player.hand.push(...drawBattleCards(1));
  }

  addBattleLog(`🃏 ${player.student.name} 使用了 ${card.icon}${card.name}！`, card.atk > 0 ? 'damage' : 'info');
  renderBattle();
  checkBattleEnd();
}

function executeCardEffect(card, source, target) {
  const dmg = Math.max(1, card.atk + source.atk - target.def);
  switch (card.effect) {
    case 'deal_damage':
    case 'deal_damage_pierce':
      target.hp = Math.max(0, target.hp - dmg);
      break;
    case 'deal_damage_freeze':
      target.hp = Math.max(0, target.hp - dmg);
      target.spd = Math.max(0, target.spd - 1);
      break;
    case 'deal_damage_dot':
      target.hp = Math.max(0, target.hp - dmg);
      // Extra damage next turn handled in endTurn
      break;
    case 'gain_armor':
    case 'gain_armor_immunity':
      source.armor += card.value;
      break;
    case 'gain_armor_heal':
      source.armor += card.value;
      source.hp = Math.min(source.maxHp, source.hp + card.value);
      break;
    case 'heal':
    case 'heal_all':
      source.hp = Math.min(source.maxHp, source.hp + card.value);
      break;
    case 'drain_life':
      target.hp = Math.max(0, target.hp - dmg);
      source.hp = Math.min(source.maxHp, source.hp + Math.floor(dmg / 2));
      break;
    case 'buff_atk':
      source.atk += card.value;
      break;
    case 'buff_spd':
      source.spd += card.value;
      break;
    case 'buff_all':
      source.atk += card.value;
      source.def += card.value;
      source.spd += 1;
      break;
    case 'berserk':
      source.atk += card.value;
      source.spd += 2;
      source.def = Math.max(0, source.def - 2);
      break;
    case 'summon_elemental':
      target.hp = Math.max(0, target.hp - dmg);
      source.armor += card.def;
      break;
    case 'ultimate':
    case 'pierce_ultimate':
    case 'banish':
      target.hp = Math.max(0, target.hp - card.atk);
      break;
    case 'revive':
      source.hp = Math.min(source.maxHp, source.hp + Math.floor(source.maxHp * 0.5));
      break;
    default:
      target.hp = Math.max(0, target.hp - Math.max(1, dmg));
  }
}

function endTurn() {
  if (!battleState || battleState.turn !== 'player') return;
  battleState.turn = 'enemy';
  renderBattle();

  // Enemy AI
  setTimeout(() => {
    enemyTurn();
  }, 1000);
}

function enemyTurn() {
  if (!battleState) return;
  const enemy = battleState.enemy;
  const player = battleState.player;

  // Simple AI: play affordable cards
  let played = false;
  for (let i = enemy.hand.length - 1; i >= 0; i--) {
    if (enemy.mana >= enemy.hand[i].mana) {
      const card = enemy.hand[i];
      enemy.mana -= card.mana;
      executeCardEffect(card, enemy, player);
      enemy.hand.splice(i, 1);
      if (enemy.hand.length < 5) enemy.hand.push(...drawBattleCards(1));
      addBattleLog(`🃏 ${enemy.student.name} 使用了 ${card.icon}${card.name}！`, 'damage');
      played = true;
      break;
    }
  }

  if (!played) {
    // Basic attack
    const dmg = Math.max(1, enemy.atk - player.def);
    player.hp = Math.max(0, player.hp - dmg);
    addBattleLog(`⚔️ ${enemy.student.name} 发起普通攻击，造成 ${dmg} 点伤害`, 'damage');
  }

  // New turn
  battleState.turnNumber++;
  battleState.turn = 'player';
  player.mana = Math.min(player.maxMana, 3 + Math.floor(battleState.turnNumber / 2));
  enemy.mana = Math.min(enemy.maxMana, 3 + Math.floor(battleState.turnNumber / 2));

  renderBattle();
  checkBattleEnd();
}

function checkBattleEnd() {
  if (!battleState) return;
  const { player, enemy } = battleState;

  if (enemy.hp <= 0) {
    addBattleLog(`🎉 ${player.student.name} 获得胜利！`, 'info');
    setTimeout(() => endBattle('win'), 1500);
  } else if (player.hp <= 0) {
    addBattleLog(`💀 ${player.student.name} 战败了...`, 'info');
    setTimeout(() => endBattle('lose'), 1500);
  }
}

function endBattle(result) {
  if (!battleState) return;
  const player = battleState.player.student;
  const enemy = battleState.enemy.student;

  if (result === 'win') {
    const pStudent = state.students.find(s => s.id === player.id);
    if (pStudent) {
      pStudent.wins = (pStudent.wins || 0) + 1;
      pStudent.winStreak = (pStudent.winStreak || 0) + 1;
      pStudent.points += 10;
      if (!pStudent.history) pStudent.history = [];
      pStudent.history.push({ points: 10, reason: '对战胜利', time: formatTime() });
      checkAchievements(pStudent);
    }
    state.gold += 20;
    state.gems += 5;
    state.totalGoldEarned += 20;
    addActivity('⚔️', `${player.name} 击败了 ${enemy.name}！+10分 +20💰`);
    toast('🎉 胜利！+10分 +20💰 +5💎', 'success');
    advanceQuest('battle');
  } else {
    const pStudent = state.students.find(s => s.id === player.id);
    if (pStudent) {
      pStudent.losses = (pStudent.losses || 0) + 1;
      pStudent.winStreak = 0;
      pStudent.points = Math.max(0, pStudent.points - 3);
      if (!pStudent.history) pStudent.history = [];
      pStudent.history.push({ points: -3, reason: '对战失败', time: formatTime() });
    }
    addActivity('💀', `${player.name} 被 ${enemy.name} 击败了...`);
    toast('战败了... -3分', 'error');
  }

  state.battles++;
  saveState();

  setTimeout(() => {
    document.getElementById('battleArena').classList.add('hidden');
    document.getElementById('battleSetup').classList.remove('hidden');
    battleState = null;
  }, 2000);
}

function forfeitBattle() {
  if (!battleState) return;
  endBattle('lose');
}

function addBattleLog(text, type = 'info') {
  if (!battleState) return;
  battleState.log.push({ text, type });
}

// ===== LEADERBOARD =====
function renderLeaderboard(sortBy = 'points') {
  const content = document.getElementById('leaderboardContent');
  let students = [...state.students];

  switch (sortBy) {
    case 'points': students.sort((a, b) => b.points - a.points); break;
    case 'cards': students.sort((a, b) => (b.cards?.length || 0) - (a.cards?.length || 0)); break;
    case 'wins': students.sort((a, b) => b.wins - a.wins); break;
    case 'achievements': students.sort((a, b) => (b.achievements?.length || 0) - (a.achievements?.length || 0)); break;
  }

  if (students.length === 0) {
    content.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-muted);">还没有英雄数据</div>';
    return;
  }

  const valueKey = { points: 'points', cards: 'cards', wins: 'wins', achievements: 'achievements' };
  const valueLabel = { points: '积分', cards: '卡牌', wins: '胜场', achievements: '成就' };

  content.innerHTML = students.map((s, i) => {
    const classInfo = HERO_CLASSES[s.heroClass] || HERO_CLASSES.warrior;
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal';
    const value = sortBy === 'cards' ? (s.cards?.length || 0) : sortBy === 'achievements' ? (s.achievements?.length || 0) : s[sortBy] || 0;

    return `
      <div class="lb-entry">
        <div class="lb-rank ${rankClass}">${i + 1}</div>
        <div class="lb-avatar" style="background:${classInfo.color}">${s.avatar || '😊'}</div>
        <div class="lb-info">
          <div class="lb-name">${s.name}</div>
          <div class="lb-subtitle">${classInfo.icon} ${classInfo.name} · Lv.${calcLevel(s.points)}</div>
        </div>
        <div class="lb-value">${value} <span style="font-size:12px;color:var(--text-secondary)">${valueLabel[sortBy]}</span></div>
      </div>
    `;
  }).join('');
}

document.querySelectorAll('.lb-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderLeaderboard(tab.dataset.lb);
  });
});

// ===== MODALS =====
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// Close modal on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.add('hidden');
  });
});

// ===== TOAST =====
function toast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ===== ACTIVITY =====
function addActivity(icon, text) {
  state.activities.push({ icon, text, time: formatTime() });
  if (state.activities.length > 100) state.activities = state.activities.slice(-100);
}

function formatTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === '1') switchView('dashboard');
  if (e.key === '2') switchView('students');
  if (e.key === '3') switchView('cards');
  if (e.key === '4') switchView('gacha');
  if (e.key === '5') switchView('battle');
  if (e.key === '6') switchView('leaderboard');
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal:not(.hidden)').forEach(m => m.classList.add('hidden'));
    document.getElementById('gachaOverlay').classList.add('hidden');
    document.getElementById('randomSpinner').classList.add('hidden');
  }
});

// ===== INIT =====
function init() {
  initParticles();

  // Ensure state arrays
  if (!state.students) state.students = [];
  if (!state.collection) state.collection = [];
  if (!state.activities) state.activities = [];
  if (!state.xpHistory) state.xpHistory = [0];
  if (!state.dailyQuests || state.dailyQuests.length === 0) {
    state.dailyQuests = generateDailyQuests();
  }

  // Update pity display
  document.getElementById('pityCount').textContent = state.pityCount;
  document.getElementById('pityFill').style.width = `${(state.pityCount / 90) * 100}%`;

  // Update nav stats
  document.getElementById('totalGold').textContent = state.gold;
  document.getElementById('totalGems').textContent = state.gems;

  renderDashboard();
  saveState();
}

// Boot
init();
