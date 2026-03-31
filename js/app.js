/* ============================================
   CLASS QUEST v2 — Main Application
   ============================================ */

// ===== STATE =====
let state = loadState();
let currentDetailStudentId = null; // track which student detail is open

function defaultState() {
  return {
    students: [],
    classes: [{ id: 'default', name: '默认班级' }],
    currentClass: 'default',
    collection: [],
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
    ...q, id: `dq_${Date.now()}_${i}`, current: 0, done: false,
    reward: { gold: 10 + i * 5, gems: i === 3 ? 5 : 0 },
  }));
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('classquest_state'));
    if (s && s.students) {
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

// ===== LOADING SCREEN =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('done');
  }, 600);
});

// ===== SCROLL REVEAL =====
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== RIPPLE EFFECT =====
document.addEventListener('click', e => {
  const btn = e.target.closest('.ripple');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
  const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
  btn.style.setProperty('--ripple-x', x + '%');
  btn.style.setProperty('--ripple-y', y + '%');
});

// ===== ANIMATED NUMBER COUNTER =====
function animateValue(el, start, end, duration = 600) {
  if (start === end) { el.textContent = end; return; }
  const range = end - start;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.round(start + range * eased);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function setAnimatedText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const old = parseInt(el.textContent) || 0;
  if (old !== value) animateValue(el, old, value);
}

// ===== PARTICLES (enhanced with shooting stars) =====
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  const particles = [];
  const shootingStars = [];

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  // Floating particles
  const colors = ['#8b5cf6', '#ffd700', '#06b6d4', '#ec4899', '#3b82f6'];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
    });
  }

  // Shooting stars
  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * w, y: 0,
      len: 60 + Math.random() * 80,
      speed: 4 + Math.random() * 4,
      alpha: 1,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
    });
    setTimeout(spawnShootingStar, 3000 + Math.random() * 5000);
  }
  spawnShootingStar();

  // Constellation lines
  function getCloseParticles() {
    const lines = [];
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) lines.push([particles[i], particles[j], 1 - dist / 120]);
      }
    }
    return lines;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Constellation lines
    const lines = getCloseParticles();
    lines.forEach(([a, b, alpha]) => {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(139,92,246,${alpha * 0.08})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Floating particles
    particles.forEach(p => {
      p.x += p.dx; p.y += p.dy; p.pulse += 0.02;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      const glow = 0.3 + Math.sin(p.pulse) * 0.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * glow;
      ctx.fill();
      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * 0.1;
      ctx.fill();
    });

    // Shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.alpha -= 0.01;
      if (s.alpha <= 0 || s.x > w + 100 || s.y > h + 100) { shootingStars.splice(i, 1); continue; }
      const tailX = s.x - Math.cos(s.angle) * s.len;
      const tailY = s.y - Math.sin(s.angle) * s.len;
      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(1, `rgba(255,255,255,${s.alpha})`);
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== CONFETTI =====
function fireConfetti(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const confetti = [];
  const colors = ['#ffd700', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#06b6d4', '#f97316'];
  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: -Math.random() * 15 - 5,
      w: 4 + Math.random() * 6, h: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.3,
      gravity: 0.15 + Math.random() * 0.1,
      life: 1,
    });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    confetti.forEach(c => {
      c.x += c.vx; c.vy += c.gravity; c.y += c.vy;
      c.rot += c.rotV; c.vx *= 0.99; c.life -= 0.008;
      if (c.life <= 0) return;
      alive = true;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.globalAlpha = c.life;
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    });
    frame++;
    if (alive && frame < 200) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ===== NAVIGATION =====
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.mob-link').forEach(l => l.classList.remove('active'));
  const view = document.getElementById(`view-${viewId}`);
  if (view) view.classList.add('active');
  const link = document.querySelector(`.nav-link[data-view="${viewId}"]`);
  if (link) link.classList.add('active');
  const mobLink = document.querySelector(`.mob-link[data-view="${viewId}"]`);
  if (mobLink) mobLink.classList.add('active');

  if (viewId === 'dashboard') renderDashboard();
  if (viewId === 'students') renderStudents();
  if (viewId === 'cards') renderCards();
  if (viewId === 'leaderboard') renderLeaderboard();

  // Re-trigger reveal for new view
  setTimeout(initReveal, 50);
}

document.querySelectorAll('.nav-link, .mob-link').forEach(link => {
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
  const w = canvas.width; const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const data = state.xpHistory.slice(-14);
  if (data.length < 2) {
    ctx.fillStyle = '#6060a0'; ctx.font = '14px -apple-system, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('数据积累中...', w / 2, h / 2);
    return;
  }
  const max = Math.max(...data, 1);
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const cW = w - pad.left - pad.right; const cH = h - pad.top - pad.bottom;
  // Grid
  ctx.strokeStyle = 'rgba(139,92,246,0.1)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (cH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
  }
  const step = cW / (data.length - 1);
  const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
  grad.addColorStop(0, 'rgba(139,92,246,0.4)'); grad.addColorStop(1, 'rgba(139,92,246,0)');
  // Area
  ctx.beginPath(); ctx.moveTo(pad.left, h - pad.bottom);
  data.forEach((v, i) => { ctx.lineTo(pad.left + i * step, pad.top + cH - (v / max) * cH); });
  ctx.lineTo(pad.left + (data.length - 1) * step, h - pad.bottom); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();
  // Line
  ctx.beginPath();
  data.forEach((v, i) => { const x = pad.left + i * step; const y = pad.top + cH - (v / max) * cH; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2.5; ctx.stroke();
  // Points
  data.forEach((v, i) => {
    const x = pad.left + i * step; const y = pad.top + cH - (v / max) * cH;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5cf6'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  });
  ctx.fillStyle = '#6060a0'; ctx.font = '10px -apple-system, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('近14天', w / 2, h - 5);
}

// ===== DASHBOARD =====
function renderDashboard() {
  setAnimatedText('statStudents', state.students.length);
  setAnimatedText('statCards', state.collection.length);
  setAnimatedText('statBattles', state.battles);
  const totalAch = state.students.reduce((s, x) => s + (x.achievements ? x.achievements.length : 0), 0);
  setAnimatedText('statAchievements', totalAch);
  setAnimatedText('totalGold', state.gold);
  setAnimatedText('totalGems', state.gems);

  const questEl = document.getElementById('dailyQuests');
  if (state.dailyQuests && state.dailyQuests.length > 0) {
    questEl.innerHTML = state.dailyQuests.map(q => `
      <div class="quest-item ${q.done ? 'done' : ''}" onclick="claimQuest('${q.id}')">
        <div class="quest-check">${q.done ? '✓' : ''}</div>
        <span class="activity-icon">${q.icon}</span>
        <span class="quest-text">${q.text}</span>
        <span class="quest-reward">${q.done ? '已领取' : `+${q.reward.gold}💰${q.reward.gems ? ' +' + q.reward.gems + '💎' : ''}`}</span>
      </div>`).join('');
  } else {
    questEl.innerHTML = '<div class="quest-item"><span class="quest-text" style="color:var(--text-muted)">今日任务已完成！明天再来 ✨</span></div>';
  }

  const actEl = document.getElementById('activityFeed');
  const recent = state.activities.slice(-20).reverse();
  actEl.innerHTML = recent.length > 0 ? recent.map(a => `
    <div class="activity-item"><span class="activity-icon">${a.icon}</span><span class="activity-text">${a.text}</span><span class="activity-time">${a.time}</span></div>
  `).join('') : '<div class="activity-item"><span class="activity-text" style="color:var(--text-muted)">还没有动态，开始冒险吧！</span></div>';

  drawXPChart();
}

function claimQuest(id) {
  const q = state.dailyQuests.find(q => q.id === id);
  if (!q || q.done) return;
  if (q.current >= q.target) {
    q.done = true; state.gold += q.reward.gold; state.gems += q.reward.gems;
    state.totalGoldEarned += q.reward.gold;
    addActivity('✅', `完成任务「${q.text}」，获得 ${q.reward.gold}💰`);
    toast(`任务完成！+${q.reward.gold}💰`, 'success');
    saveState(); renderDashboard();
  } else { toast(`进度: ${q.current}/${q.target}`, 'info'); }
}

function advanceQuest(type, amount = 1) {
  if (!state.dailyQuests) return;
  state.dailyQuests.forEach(q => { if (q.type === type && !q.done) q.current = Math.min(q.current + amount, q.target); });
}

// ===== STUDENTS =====
function renderStudents() {
  const grid = document.getElementById('studentGrid');
  const classStudents = state.students.filter(s => s.classId === state.currentClass);
  if (classStudents.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px 20px;">
      <div style="font-size:64px;margin-bottom:16px;" class="reveal">👥</div>
      <h3 style="color:var(--text-secondary);margin-bottom:8px;">还没有英雄</h3>
      <p style="color:var(--text-muted);margin-bottom:24px;">点击「招募英雄」开始你的冒险</p>
      <button class="btn-primary ripple" onclick="openAddStudent()">➕ 招募英雄</button></div>`;
    setTimeout(initReveal, 50);
    return;
  }
  grid.innerHTML = classStudents.map((s, i) => {
    const ci = HERO_CLASSES[s.heroClass] || HERO_CLASSES.warrior;
    const level = calcLevel(s.points);
    const xpPct = calcXPPercent(s.points);
    const avatar = s.avatar || AVATAR_EMOJIS[Math.abs(hashCode(s.name)) % AVATAR_EMOJIS.length];
    return `<div class="hero-card reveal" style="--delay:${i * 0.05}s" onclick="openStudentDetail('${s.id}')">
      <div class="hero-card-top" style="background:linear-gradient(160deg,${ci.color}22,${ci.color}08)">
        <div class="hero-level">${level}</div>
        <div class="hero-avatar" style="background:${ci.color}">${avatar}</div>
        <div class="hero-class-badge" style="background:${ci.color}33;color:${ci.color};border:1px solid ${ci.color}55">${ci.icon} ${ci.name}</div>
      </div>
      <div class="hero-card-body">
        <div class="hero-name">${s.name}</div>
        <div class="hero-xp-bar"><div class="hero-xp-fill" style="width:${xpPct}%"></div></div>
        <div class="hero-stats">
          <div class="hero-stat"><div class="hero-stat-value" style="color:var(--red)">${ci.atk + Math.floor(level * 0.5)}</div><div class="hero-stat-label">ATK</div></div>
          <div class="hero-stat"><div class="hero-stat-value" style="color:var(--blue)">${ci.def + Math.floor(level * 0.3)}</div><div class="hero-stat-label">DEF</div></div>
          <div class="hero-stat"><div class="hero-stat-value" style="color:var(--green)">${ci.spd + Math.floor(level * 0.2)}</div><div class="hero-stat-label">SPD</div></div>
        </div>
        <div class="hero-points-display">💰 ${s.points}</div>
      </div></div>`;
  }).join('');
  setTimeout(initReveal, 50);
}

function calcLevel(points) { return Math.max(1, Math.floor(Math.sqrt(points / 10)) + 1); }
function calcXPPercent(points) {
  const lv = calcLevel(points);
  const prev = (lv - 1) * (lv - 1) * 10; const next = lv * lv * 10;
  return Math.min(100, ((points - prev) / (next - prev)) * 100);
}
function hashCode(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; } return h; }
function genId() { return 'stu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8); }

function openAddStudent() {
  document.getElementById('studentName').value = '';
  openModal('modalAddStudent');
}

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
  if (state.students.some(s => s.name === name && s.classId === state.currentClass)) {
    toast(`「${name}」已存在`, 'error'); return;
  }
  const classOpt = document.querySelector('.class-option.selected');
  const heroClass = classOpt ? classOpt.dataset.class : 'warrior';
  const color = document.getElementById('studentColor').value;
  state.students.push({
    id: genId(), name, heroClass, color,
    avatar: AVATAR_EMOJIS[Math.abs(hashCode(name)) % AVATAR_EMOJIS.length],
    classId: state.currentClass, points: 0, cards: [],
    wins: 0, losses: 0, winStreak: 0, achievements: [], history: [],
    totalGoldEarned: 0, createdAt: Date.now(),
  });
  addActivity('🆕', `${name} 加入了冒险队伍！`);
  toast(`${name} 已招募！`, 'success');
  saveState(); closeModal('modalAddStudent'); renderStudents();
}

// ===== BATCH IMPORT (FIXED) =====
function openBatchAdd() {
  document.getElementById('batchNames').value = '';
  document.getElementById('batchPreview').style.display = 'none';
  document.getElementById('batchImportBtn').style.display = 'none';
  openModal('modalBatch');
}

function parseBatchInput(text) {
  const lines = text.split(/\n/).filter(l => l.trim());
  const results = [];
  const existingNames = new Set(state.students.filter(s => s.classId === state.currentClass).map(s => s.name));
  const seenInBatch = new Set();

  lines.forEach((line, idx) => {
    // Support both , and ，
    const parts = line.trim().split(/[,，]/);
    const name = parts[0].trim();
    if (!name) return;
    const classStr = parts.length > 1 ? parts[1].trim() : '';
    const heroClass = Object.keys(HERO_CLASSES).find(k => HERO_CLASSES[k].name === classStr) || 'warrior';
    const isDup = existingNames.has(name) || seenInBatch.has(name);
    if (!isDup) seenInBatch.add(name);
    results.push({ name, heroClass, isDup, line: idx + 1 });
  });
  return results;
}

function batchPreviewShow() {
  const text = document.getElementById('batchNames').value;
  const parsed = parseBatchInput(text);
  if (parsed.length === 0) { toast('请输入至少一个姓名', 'error'); return; }

  const preview = document.getElementById('batchPreview');
  const list = document.getElementById('batchPreviewList');
  const countEl = document.getElementById('batchCount');
  const importBtn = document.getElementById('batchImportBtn');

  const newCount = parsed.filter(p => !p.isDup).length;
  countEl.textContent = newCount;

  list.innerHTML = parsed.map(p => {
    const ci = HERO_CLASSES[p.heroClass];
    return `<span class="batch-tag ${p.isDup ? 'dup' : ''}" title="${p.isDup ? '已存在，将跳过' : ci.name}">${p.name}${p.isDup ? ' ⚠️' : ' ' + ci.icon}</span>`;
  }).join('');

  preview.style.display = 'block';
  importBtn.style.display = newCount > 0 ? 'block' : 'none';
}

function batchImport() {
  const text = document.getElementById('batchNames').value;
  const parsed = parseBatchInput(text);
  const toImport = parsed.filter(p => !p.isDup);
  if (toImport.length === 0) { toast('没有可导入的新英雄', 'error'); return; }

  let count = 0;
  toImport.forEach(p => {
    state.students.push({
      id: genId(), name: p.name, heroClass: p.heroClass,
      color: HERO_CLASSES[p.heroClass].color,
      avatar: AVATAR_EMOJIS[Math.abs(hashCode(p.name)) % AVATAR_EMOJIS.length],
      classId: state.currentClass, points: 0, cards: [],
      wins: 0, losses: 0, winStreak: 0, achievements: [], history: [],
      totalGoldEarned: 0, createdAt: Date.now(),
    });
    count++;
  });

  const skipped = parsed.filter(p => p.isDup).length;
  let msg = `成功招募 ${count} 名英雄！`;
  if (skipped > 0) msg += ` (${skipped} 名已跳过)`;

  toast(msg, 'success');
  addActivity('📋', `批量招募了 ${count} 名英雄`);
  saveState(); closeModal('modalBatch'); renderStudents();
}

// ===== STUDENT DETAIL (WITH INDIVIDUAL POINTS) =====
function openStudentDetail(id) {
  currentDetailStudentId = id;
  const s = state.students.find(s => s.id === id);
  if (!s) return;
  const ci = HERO_CLASSES[s.heroClass] || HERO_CLASSES.warrior;
  const level = calcLevel(s.points);

  document.getElementById('detailStudentName').textContent = `${s.name} 的英雄档案`;
  document.getElementById('detailHeroCard').innerHTML = `
    <div class="game-card rarity-${level >= 20 ? 'legendary' : level >= 10 ? 'epic' : level >= 5 ? 'rare' : 'common'}" style="width:100%;height:100%">
      <div class="game-card-inner">
        <div class="card-mana">${level}</div>
        <div class="card-rarity-star">${level >= 20 ? '⭐⭐⭐⭐' : level >= 10 ? '⭐⭐⭐' : level >= 5 ? '⭐⭐' : '⭐'}</div>
        <div class="card-art" style="font-size:80px">${s.avatar || '😊'}</div>
        <div class="card-info">
          <div class="card-name">${s.name}</div>
          <div class="card-type">${ci.icon} ${ci.name} · Lv.${level}</div>
          <div class="card-desc">${ci.desc}</div>
        </div>
        <div class="card-stats-bar">
          <span class="card-stat atk">⚔${ci.atk + Math.floor(level * 0.5)}</span>
          <span class="card-stat def">🛡${ci.def + Math.floor(level * 0.3)}</span>
          <span class="card-stat spd">💨${ci.spd + Math.floor(level * 0.2)}</span>
        </div>
      </div></div>`;

  document.getElementById('detailStats').innerHTML = `
    <div class="detail-stat-item"><div class="detail-stat-value" style="color:var(--gold)">${s.points}</div><div class="detail-stat-label">总积分</div></div>
    <div class="detail-stat-item"><div class="detail-stat-value" style="color:var(--green)">${s.wins}</div><div class="detail-stat-label">胜场</div></div>
    <div class="detail-stat-item"><div class="detail-stat-value" style="color:var(--red)">${s.losses}</div><div class="detail-stat-label">败场</div></div>
    <div class="detail-stat-item"><div class="detail-stat-value" style="color:var(--purple)">${s.winStreak}</div><div class="detail-stat-label">连胜</div></div>
    <div class="detail-stat-item"><div class="detail-stat-value" style="color:var(--cyan)">${level}</div><div class="detail-stat-label">等级</div></div>
    <div class="detail-stat-item"><div class="detail-stat-value" style="color:var(--pink)">${s.cards ? s.cards.length : 0}</div><div class="detail-stat-label">卡牌</div></div>`;

  const cardList = document.getElementById('detailCardList');
  cardList.innerHTML = s.cards && s.cards.length > 0
    ? s.cards.map(c => `<div class="mini-card" title="${c.name}" onclick="showCardDetail('${c.id}')">${c.icon}</div>`).join('')
    : '<span style="color:var(--text-muted);font-size:13px">还没有卡牌，去召唤吧！</span>';

  const histEl = document.getElementById('detailHistory');
  const history = (s.history || []).slice(-20).reverse();
  histEl.innerHTML = history.length > 0
    ? history.map(h => `<div class="history-item"><span class="h-points ${h.points > 0 ? 'positive' : 'negative'}">${h.points > 0 ? '+' : ''}${h.points}</span><span>${h.reason || ''}</span><span style="color:var(--text-muted);font-size:11px;margin-left:auto">${h.time || ''}</span></div>`).join('')
    : '<span style="color:var(--text-muted);font-size:13px">暂无记录</span>';

  const achEl = document.getElementById('detailAchievements');
  checkAchievements(s);
  achEl.innerHTML = s.achievements && s.achievements.length > 0
    ? s.achievements.map(aId => { const a = ACHIEVEMENTS.find(x => x.id === aId); return a ? `<span class="achievement-badge">${a.name}</span>` : ''; }).join('')
    : '<span style="color:var(--text-muted);font-size:13px">还没有成就</span>';

  openModal('modalStudentDetail');
}

// Individual point controls
function quickPointSingle(pts) {
  if (!currentDetailStudentId) return;
  applyPointsToStudent(currentDetailStudentId, pts, pts > 0 ? '快速加分' : '快速扣分');
}

function applySingleCustom() {
  if (!currentDetailStudentId) return;
  const val = parseInt(document.getElementById('singleCustomPts').value);
  if (!val || val === 0) { toast('请输入有效分值', 'error'); return; }
  applyPointsToStudent(currentDetailStudentId, val, val > 0 ? '自定义加分' : '自定义扣分');
  document.getElementById('singleCustomPts').value = '';
}

function applyPointsToStudent(studentId, points, reason) {
  const s = state.students.find(x => x.id === studentId);
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

  const icon = points > 0 ? '➕' : '➖';
  addActivity(icon, `${s.name} ${points > 0 ? '获得' : '扣除'} ${Math.abs(points)} 分`);
  toast(`${s.name}: ${points > 0 ? '+' : ''}${points} 分`, points > 0 ? 'success' : 'error');

  if (points > 0) advanceQuest('points_gain');

  // Update XP history
  const totalPts = state.students.reduce((a, x) => a + x.points, 0);
  state.xpHistory.push(totalPts);
  if (state.xpHistory.length > 30) state.xpHistory.shift();

  saveState();
  // Refresh detail view
  openStudentDetail(studentId);
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

// ===== BULK POINTS =====
let selectedPointStudents = new Set();

function quickAddPoints() {
  document.getElementById('pointsModalTitle').textContent = '➕ 加分';
  selectedPointStudents.clear(); renderPointStudents(); openModal('modalPoints');
}
function quickSubtractPoints() {
  document.getElementById('pointsModalTitle').textContent = '➖ 扣分';
  selectedPointStudents.clear(); renderPointStudents(); openModal('modalPoints');
}
function renderPointStudents() {
  const grid = document.getElementById('pointsStudentSelect');
  const cs = state.students.filter(s => s.classId === state.currentClass);
  grid.innerHTML = cs.map(s => `
    <div class="student-select-item ${selectedPointStudents.has(s.id) ? 'selected' : ''}" onclick="togglePointStudent('${s.id}')">
      <div class="ss-avatar" style="background:${HERO_CLASSES[s.heroClass]?.color || '#8b5cf6'}">${s.avatar || '😊'}</div>
      <div>${s.name}</div></div>`).join('');
}
function togglePointStudent(id) {
  if (selectedPointStudents.has(id)) selectedPointStudents.delete(id); else selectedPointStudents.add(id);
  renderPointStudents();
}
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); document.getElementById('customPoints').value = '';
  });
});
function applyPoints() {
  if (selectedPointStudents.size === 0) { toast('请先选择学生', 'error'); return; }
  const isSub = document.getElementById('pointsModalTitle').textContent.includes('扣分');
  const customVal = document.getElementById('customPoints').value;
  let pts = customVal ? parseInt(customVal) : parseInt(document.querySelector('.preset-btn.active')?.dataset.points || 5);
  if (isSub) pts = -Math.abs(pts); else pts = Math.abs(pts);
  const reason = document.getElementById('pointsReason').value;
  selectedPointStudents.forEach(id => {
    const s = state.students.find(x => x.id === id);
    if (!s) return;
    s.points = Math.max(0, s.points + pts);
    if (!s.history) s.history = [];
    s.history.push({ points: pts, reason, time: formatTime() });
    if (pts > 0) { state.gold += pts; state.totalGoldEarned += pts; s.totalGoldEarned = (s.totalGoldEarned || 0) + pts; }
    checkAchievements(s);
  });
  const names = [...selectedPointStudents].map(id => state.students.find(s => s.id === id)?.name).join('、');
  addActivity(pts > 0 ? '➕' : '➖', `${names} ${pts > 0 ? '获得' : '扣除'} ${Math.abs(pts)} 分（${reason}）`);
  toast(`${pts > 0 ? '+' : ''}${pts} 分已应用`, 'success');
  if (pts > 0) advanceQuest('points_gain', selectedPointStudents.size);
  const totalPts = state.students.reduce((s, x) => s + x.points, 0);
  state.xpHistory.push(totalPts);
  if (state.xpHistory.length > 30) state.xpHistory.shift();
  saveState(); closeModal('modalPoints'); renderDashboard();
}

// ===== RANDOM =====
function quickRandom() {
  const cs = state.students.filter(s => s.classId === state.currentClass);
  if (cs.length === 0) { toast('还没有学生可以随机', 'error'); return; }
  const spinner = document.getElementById('randomSpinner');
  const wheel = document.getElementById('spinnerWheel');
  const result = document.getElementById('spinnerResult');
  spinner.classList.remove('hidden'); result.classList.remove('visible');
  const segAngle = 360 / cs.length;
  let gradient = '';
  cs.forEach((s, i) => {
    const color = HERO_CLASSES[s.heroClass]?.color || '#8b5cf6';
    gradient += `${color} ${i * segAngle}deg ${(i + 1) * segAngle}deg, `;
  });
  wheel.style.background = `conic-gradient(${gradient.slice(0, -2)})`;
  wheel.style.transform = 'rotate(0deg)';
  wheel.innerHTML = cs.map((s, i) => {
    const angle = segAngle * i + segAngle / 2;
    return `<div style="position:absolute;top:50%;left:50%;transform:rotate(${angle}deg) translateY(-120px);font-size:12px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8);white-space:nowrap">${s.name}</div>`;
  }).join('');
  const winner = Math.floor(Math.random() * cs.length);
  const finalAngle = 360 * 6 + (360 - winner * segAngle - segAngle / 2);
  setTimeout(() => { wheel.style.transition = 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)'; wheel.style.transform = `rotate(${finalAngle}deg)`; }, 100);
  setTimeout(() => {
    const s = cs[winner];
    result.textContent = `🎉 ${s.name}！`; result.classList.add('visible');
    addActivity('🎲', `随机选中了 ${s.name}`); toast(`${s.name} 被选中了！`, 'info');
    s.points += 2; if (!s.history) s.history = [];
    s.history.push({ points: 2, reason: '随机选中奖励', time: formatTime() });
    setTimeout(() => { spinner.classList.add('hidden'); wheel.style.transition = 'none'; saveState(); }, 2500);
  }, 4200);
}

// ===== GROUP =====
function quickGroup() {
  const cs = state.students.filter(s => s.classId === state.currentClass);
  if (cs.length < 2) { toast('至少需要2名学生', 'error'); return; }
  const shuffled = [...cs].sort(() => Math.random() - 0.5);
  const groupCount = Math.min(4, Math.ceil(shuffled.length / 3));
  const groups = Array.from({ length: groupCount }, () => []);
  shuffled.forEach((s, i) => groups[i % groupCount].push(s.name));
  const groupText = groups.map((g, i) => `第${i + 1}组: ${g.join('、')}`).join('\n');
  addActivity('👥', `随机分组完成 (${groupCount}组)`); toast(`已分为 ${groupCount} 组`, 'success');
  alert(`🎲 随机分组结果：\n\n${groupText}`);
}

// ===== CARDS =====
function renderCards(filter = 'all') {
  const collection = document.getElementById('cardCollection');
  const allCards = filter === 'all' ? CARD_DATABASE : CARD_DATABASE.filter(c => c.type === filter);
  const typeNames = { attack: '攻击', defense: '防御', magic: '法术', buff: '增益', legend: '传说' };
  collection.innerHTML = allCards.map(card => {
    const isOwned = state.collection.some(c => c.baseId === card.id);
    return `<div class="game-card rarity-${card.rarity} reveal" style="--delay:${allCards.indexOf(card) * 0.03}s;${!isOwned ? 'filter:brightness(0.3) grayscale(1)' : ''}" onclick="${isOwned ? `showCardDetail('${card.id}')` : ''}">
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
      </div></div>`;
  }).join('');
  setTimeout(initReveal, 50);
}
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); renderCards(btn.dataset.filter);
  });
});
function showCardDetail(cardId) {
  const card = CARD_DATABASE.find(c => c.id === cardId) || state.collection.find(c => c.baseId === cardId || c.id === cardId);
  if (!card) return;
  const typeNames = { attack: '攻击', defense: '防御', magic: '法术', buff: '增益', legend: '传说' };
  document.getElementById('cardDetailView').innerHTML = `
    <div class="game-card rarity-${card.rarity}" style="width:280px;height:400px;margin:0 auto">
      <div class="game-card-inner">
        <div class="card-mana">${card.mana}</div>
        <div class="card-rarity-star">${RARITY_CONFIG[card.rarity].star}</div>
        <div class="card-art" style="font-size:80px">${card.icon}</div>
        <div class="card-info">
          <div class="card-name" style="font-size:18px">${card.name}</div>
          <div class="card-type">${typeNames[card.type] || card.type} · ${RARITY_CONFIG[card.rarity].name}</div>
          <div class="card-desc" style="-webkit-line-clamp:unset">${card.desc}</div>
        </div>
        <div class="card-stats-bar">
          <span class="card-stat atk">⚔ ${card.atk}</span>
          <span class="card-stat def">🛡 ${card.def}</span>
          <span class="card-stat spd">💨 ${card.spd}</span>
        </div>
      </div></div>`;
  openModal('modalCardDetail');
}

// ===== GACHA =====
function gachaPull(count) {
  const cost = count === 1 ? 10 : 90;
  if (state.gems < cost) { toast('💎 不足！通过积分和对战获取', 'error'); return; }
  state.gems -= cost;
  const results = [];
  for (let i = 0; i < count; i++) {
    state.pityCount++;
    let rarity;
    if (state.pityCount >= 90) { rarity = 'legendary'; state.pityCount = 0; }
    else {
      const roll = Math.random() * 100;
      if (roll < 5) rarity = 'legendary';
      else if (roll < 20) rarity = 'epic';
      else if (roll < 50) rarity = 'rare';
      else rarity = 'common';
      if (rarity === 'legendary') state.pityCount = 0;
    }
    const pool = CARD_DATABASE.filter(c => c.rarity === rarity);
    const card = pool[Math.floor(Math.random() * pool.length)];
    const ownedCard = { ...card, baseId: card.id, id: 'owned_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), obtainedAt: Date.now() };
    state.collection.push(ownedCard); results.push(ownedCard);
    const cs = state.students.filter(s => s.classId === state.currentClass);
    if (cs.length > 0) {
      const student = cs[Math.floor(Math.random() * cs.length)];
      if (!student.cards) student.cards = [];
      student.cards.push(ownedCard); checkAchievements(student);
    }
    if (rarity === 'legendary') advanceQuest('collect');
  }
  showGachaResults(results); saveState();
  document.getElementById('pityCount').textContent = state.pityCount;
  document.getElementById('pityFill').style.width = `${(state.pityCount / 90) * 100}%`;
}
function showGachaResults(cards) {
  const overlay = document.getElementById('gachaOverlay');
  const container = document.getElementById('gachaResults');
  overlay.classList.remove('hidden');
  container.innerHTML = cards.map((card, i) => `
    <div class="gacha-result-card" style="animation-delay:${i * 0.15}s;width:${cards.length <= 5 ? '180px' : '140px'};height:${cards.length <= 5 ? '260px' : '200px'}">
      <div class="game-card rarity-${card.rarity}">
        <div class="game-card-inner">
          <div class="card-mana">${card.mana}</div>
          <div class="card-rarity-star">${RARITY_CONFIG[card.rarity].star}</div>
          <div class="card-art">${card.icon}</div>
          <div class="card-info"><div class="card-name">${card.name}</div><div class="card-type">${RARITY_CONFIG[card.rarity].name}</div></div>
          <div class="card-stats-bar"><span class="card-stat atk">⚔${card.atk}</span><span class="card-stat def">🛡${card.def}</span><span class="card-stat spd">💨${card.spd}</span></div>
        </div></div></div>`).join('');
  if (cards.some(c => c.rarity === 'legendary')) {
    overlay.style.background = 'radial-gradient(circle,rgba(255,215,0,.15),rgba(0,0,0,.95))';
    fireConfetti('confettiCanvas');
  } else { overlay.style.background = 'rgba(0,0,0,.9)'; }
  addActivity('✨', `召唤了 ${cards.length} 张卡牌${cards.some(c => c.rarity === 'legendary') ? '（含传说！）' : ''}`);
}
function closeGachaResults() { document.getElementById('gachaOverlay').classList.add('hidden'); renderDashboard(); }

// ===== BATTLE =====
let battleState = null;
function startBattleMode(mode) {
  const cs = state.students.filter(s => s.classId === state.currentClass);
  if (cs.length < 2 && mode !== 'boss') { toast('至少需要2名学生', 'error'); return; }
  if (mode === '1v1') { const sh = [...cs].sort(() => Math.random() - 0.5); initBattle(sh[0], sh[1] || cs[0]); }
  else if (mode === 'group') { const sh = [...cs].sort(() => Math.random() - 0.5); const mid = Math.ceil(sh.length / 2); initBattle(sh[0], sh[mid] || sh[1], sh.slice(0, mid), sh.slice(mid)); }
  else if (mode === 'boss') {
    const boss = { id: 'boss', name: '暗影巨龙 🐉', heroClass: 'tank', avatar: '🐉', points: 500, wins: 99, losses: 0, winStreak: 99, cards: [], history: [], achievements: [] };
    const hero = cs.length > 0 ? cs.sort((a, b) => b.points - a.points)[0] : { id: 'hero', name: '勇者', heroClass: 'warrior', avatar: '⚔️', points: 100, cards: [], wins: 0, losses: 0, winStreak: 0, history: [], achievements: [] };
    initBattle(hero, boss);
  }
}
function initBattle(player, enemy, team1 = null, team2 = null) {
  const pc = HERO_CLASSES[player.heroClass] || HERO_CLASSES.warrior;
  const ec = HERO_CLASSES[enemy.heroClass] || HERO_CLASSES.warrior;
  const pl = calcLevel(player.points); const el = enemy.id === 'boss' ? 25 : calcLevel(enemy.points);
  battleState = {
    player: { student: player, hp: pc.hp + pl * 5, maxHp: pc.hp + pl * 5, atk: pc.atk + Math.floor(pl * 0.5), def: pc.def + Math.floor(pl * 0.3), spd: pc.spd + Math.floor(pl * 0.2), mana: 3, maxMana: 10, hand: drawBattleCards(4), armor: 0 },
    enemy: { student: enemy, hp: ec.hp + el * 5, maxHp: ec.hp + el * 5, atk: ec.atk + Math.floor(el * 0.5), def: ec.def + Math.floor(el * 0.3), spd: ec.spd + Math.floor(el * 0.2), mana: 3, maxMana: 10, hand: drawBattleCards(4), armor: 0 },
    turn: 'player', turnNumber: 1, log: [], team1, team2, mode: team1 ? 'group' : (enemy.id === 'boss' ? 'boss' : '1v1'),
  };
  document.getElementById('battleSetup').classList.add('hidden');
  document.getElementById('battleArena').classList.remove('hidden');
  renderBattle();
}
function drawBattleCards(n) { const cards = []; for (let i = 0; i < n; i++) cards.push({ ...CARD_DATABASE[Math.floor(Math.random() * CARD_DATABASE.length)] }); return cards; }
function renderBattle() {
  if (!battleState) return;
  const { player, enemy } = battleState;
  const pc = HERO_CLASSES[player.student.heroClass] || HERO_CLASSES.warrior;
  document.getElementById('playerAvatar').innerHTML = player.student.avatar || '😊';
  document.getElementById('playerAvatar').style.background = pc.color;
  document.getElementById('playerName').textContent = player.student.name;
  document.getElementById('playerHP').style.width = `${(player.hp / player.maxHp) * 100}%`;
  document.getElementById('playerHP').className = 'hp-fill' + (player.hp / player.maxHp < 0.3 ? ' danger' : '');
  document.getElementById('playerATK').textContent = player.atk;
  document.getElementById('playerDEF').textContent = player.def;
  const ec = HERO_CLASSES[enemy.student.heroClass] || HERO_CLASSES.warrior;
  document.getElementById('enemyAvatar').innerHTML = enemy.student.avatar || '🐉';
  document.getElementById('enemyAvatar').style.background = ec.color;
  document.getElementById('enemyName').textContent = enemy.student.name;
  document.getElementById('enemyHP').style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
  document.getElementById('enemyATK').textContent = enemy.atk;
  document.getElementById('enemyDEF').textContent = enemy.def;
  document.getElementById('playerHand').innerHTML = player.hand.map((c, i) => `
    <div class="battle-card" onclick="playBattleCard(${i})" title="${c.name}: ${c.desc}">
      <div class="bc-icon">${c.icon}</div><div class="bc-name">${c.name}</div>
      <div class="bc-dmg">${c.atk > 0 ? '⚔' + c.atk : ''}${c.def > 0 ? ' 🛡' + c.def : ''}</div>
      <div style="font-size:9px;color:var(--blue)">💎${c.mana}</div></div>`).join('');
  document.getElementById('enemyHand').innerHTML = enemy.hand.map(() => '<div class="battle-card" style="background:linear-gradient(135deg,#2a2a4a,#1a1a35);cursor:default"><div class="bc-icon">🃏</div></div>').join('');
  document.getElementById('turnIndicator').textContent = battleState.turn === 'player' ? `🎯 ${player.student.name} 的回合` : `⏳ ${enemy.student.name} 的回合`;
  document.getElementById('battleLog').innerHTML = battleState.log.slice(-10).map(l => `<div class="log-entry ${l.type}">${l.text}</div>`).join('');
  document.getElementById('btnEndTurn').textContent = `结束回合 ⏭️ (💎${player.mana}/${player.maxMana})`;
}
function playBattleCard(index) {
  if (!battleState || battleState.turn !== 'player') return;
  const p = battleState.player; const card = p.hand[index]; if (!card) return;
  if (p.mana < card.mana) { toast('法力不足！', 'error'); return; }
  p.mana -= card.mana; executeCardEffect(card, p, battleState.enemy); p.hand.splice(index, 1);
  if (p.hand.length < 5) p.hand.push(...drawBattleCards(1));
  battleState.log.push({ text: `🃏 ${p.student.name} 使用了 ${card.icon}${card.name}！`, type: card.atk > 0 ? 'damage' : 'info' });
  renderBattle(); checkBattleEnd();
}
function executeCardEffect(card, src, tgt) {
  const dmg = Math.max(1, card.atk + src.atk - tgt.def);
  switch (card.effect) {
    case 'deal_damage': case 'deal_damage_pierce': tgt.hp = Math.max(0, tgt.hp - dmg); break;
    case 'deal_damage_freeze': tgt.hp = Math.max(0, tgt.hp - dmg); tgt.spd = Math.max(0, tgt.spd - 1); break;
    case 'deal_damage_dot': tgt.hp = Math.max(0, tgt.hp - dmg); break;
    case 'gain_armor': case 'gain_armor_immunity': src.armor += card.value; break;
    case 'gain_armor_heal': src.armor += card.value; src.hp = Math.min(src.maxHp, src.hp + card.value); break;
    case 'heal': case 'heal_all': src.hp = Math.min(src.maxHp, src.hp + card.value); break;
    case 'drain_life': tgt.hp = Math.max(0, tgt.hp - dmg); src.hp = Math.min(src.maxHp, src.hp + Math.floor(dmg / 2)); break;
    case 'buff_atk': src.atk += card.value; break;
    case 'buff_spd': src.spd += card.value; break;
    case 'buff_all': src.atk += card.value; src.def += card.value; src.spd += 1; break;
    case 'berserk': src.atk += card.value; src.spd += 2; src.def = Math.max(0, src.def - 2); break;
    case 'summon_elemental': tgt.hp = Math.max(0, tgt.hp - dmg); src.armor += card.def; break;
    case 'ultimate': case 'pierce_ultimate': case 'banish': tgt.hp = Math.max(0, tgt.hp - card.atk); break;
    case 'revive': src.hp = Math.min(src.maxHp, src.hp + Math.floor(src.maxHp * 0.5)); break;
    default: tgt.hp = Math.max(0, tgt.hp - Math.max(1, dmg));
  }
}
function endTurn() {
  if (!battleState || battleState.turn !== 'player') return;
  battleState.turn = 'enemy'; renderBattle();
  setTimeout(enemyTurn, 1000);
}
function enemyTurn() {
  if (!battleState) return;
  const e = battleState.enemy; const p = battleState.player;
  let played = false;
  for (let i = e.hand.length - 1; i >= 0; i--) {
    if (e.mana >= e.hand[i].mana) {
      const card = e.hand[i]; e.mana -= card.mana;
      executeCardEffect(card, e, p); e.hand.splice(i, 1);
      if (e.hand.length < 5) e.hand.push(...drawBattleCards(1));
      battleState.log.push({ text: `🃏 ${e.student.name} 使用了 ${card.icon}${card.name}！`, type: 'damage' });
      played = true; break;
    }
  }
  if (!played) {
    const dmg = Math.max(1, e.atk - p.def); p.hp = Math.max(0, p.hp - dmg);
    battleState.log.push({ text: `⚔️ ${e.student.name} 普通攻击，造成 ${dmg} 点伤害`, type: 'damage' });
  }
  battleState.turnNumber++;
  battleState.turn = 'player';
  p.mana = Math.min(p.maxMana, 3 + Math.floor(battleState.turnNumber / 2));
  e.mana = Math.min(e.maxMana, 3 + Math.floor(battleState.turnNumber / 2));
  renderBattle(); checkBattleEnd();
}
function checkBattleEnd() {
  if (!battleState) return;
  const { player, enemy } = battleState;
  if (enemy.hp <= 0) { battleState.log.push({ text: `🎉 ${player.student.name} 获得胜利！`, type: 'info' }); setTimeout(() => endBattle('win'), 1500); }
  else if (player.hp <= 0) { battleState.log.push({ text: `💀 ${player.student.name} 战败了...`, type: 'info' }); setTimeout(() => endBattle('lose'), 1500); }
}
function endBattle(result) {
  if (!battleState) return;
  const player = battleState.player.student; const enemy = battleState.enemy.student;
  if (result === 'win') {
    const ps = state.students.find(s => s.id === player.id);
    if (ps) { ps.wins = (ps.wins || 0) + 1; ps.winStreak = (ps.winStreak || 0) + 1; ps.points += 10; if (!ps.history) ps.history = []; ps.history.push({ points: 10, reason: '对战胜利', time: formatTime() }); checkAchievements(ps); }
    state.gold += 20; state.gems += 5; state.totalGoldEarned += 20;
    addActivity('⚔️', `${player.name} 击败了 ${enemy.name}！+10分 +20💰`);
    toast('🎉 胜利！+10分 +20💰 +5💎', 'success'); advanceQuest('battle');
  } else {
    const ps = state.students.find(s => s.id === player.id);
    if (ps) { ps.losses = (ps.losses || 0) + 1; ps.winStreak = 0; ps.points = Math.max(0, ps.points - 3); if (!ps.history) ps.history = []; ps.history.push({ points: -3, reason: '对战失败', time: formatTime() }); }
    addActivity('💀', `${player.name} 被 ${enemy.name} 击败了...`); toast('战败了... -3分', 'error');
  }
  state.battles++; saveState();
  setTimeout(() => { document.getElementById('battleArena').classList.add('hidden'); document.getElementById('battleSetup').classList.remove('hidden'); battleState = null; }, 2000);
}
function forfeitBattle() { if (battleState) endBattle('lose'); }

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
  if (students.length === 0) { content.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-muted)">还没有英雄数据</div>'; return; }
  const vl = { points: '积分', cards: '卡牌', wins: '胜场', achievements: '成就' };
  content.innerHTML = students.map((s, i) => {
    const ci = HERO_CLASSES[s.heroClass] || HERO_CLASSES.warrior;
    const rc = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal';
    const val = sortBy === 'cards' ? (s.cards?.length || 0) : sortBy === 'achievements' ? (s.achievements?.length || 0) : s[sortBy] || 0;
    return `<div class="lb-entry"><div class="lb-rank ${rc}">${i + 1}</div>
      <div class="lb-avatar" style="background:${ci.color}">${s.avatar || '😊'}</div>
      <div class="lb-info"><div class="lb-name">${s.name}</div><div class="lb-subtitle">${ci.icon} ${ci.name} · Lv.${calcLevel(s.points)}</div></div>
      <div class="lb-value">${val} <span style="font-size:12px;color:var(--text-secondary)">${vl[sortBy]}</span></div></div>`;
  }).join('');
}
document.querySelectorAll('.lb-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active'); renderLeaderboard(tab.dataset.lb);
  });
});

// ===== MODALS =====
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
});

// ===== TOAST =====
function toast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
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

// ===== KEYBOARD =====
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
  if (!state.students) state.students = [];
  if (!state.collection) state.collection = [];
  if (!state.activities) state.activities = [];
  if (!state.xpHistory) state.xpHistory = [0];
  if (!state.dailyQuests || state.dailyQuests.length === 0) state.dailyQuests = generateDailyQuests();
  document.getElementById('pityCount').textContent = state.pityCount;
  document.getElementById('pityFill').style.width = `${(state.pityCount / 90) * 100}%`;
  document.getElementById('totalGold').textContent = state.gold;
  document.getElementById('totalGems').textContent = state.gems;
  renderDashboard();
  saveState();
  setTimeout(initReveal, 100);
}

init();
