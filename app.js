// ── INIT ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  runSplash();
});


function runSplash() {
  createSplashRobot();
  const fill = document.getElementById('splash-fill');
  const pct = document.getElementById('splash-pct');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 18;
    if (p >= 100) { p = 100; clearInterval(iv); setTimeout(initApp, 400); }
    if (fill) fill.style.width = p + '%';
    if (pct) pct.textContent = Math.floor(p) + '%';
  }, 120);
}

function initApp() {
  document.getElementById('splash').style.opacity = '0';
  document.getElementById('splash').style.transition = 'opacity 0.5s';
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');

    // Check if logged in
    const isLoggedIn = localStorage.getItem('financeu_logged_in') === 'true';
    if (isLoggedIn) {
      showApp();
    } else {
      document.getElementById('auth-page').classList.remove('hidden');
    }
  }, 500);
}

function showApp() {
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // ensure data is loaded
  const user = localStorage.getItem('financeu_user') || 'Alex';
  loadUserData(user);

  renderAll();
  createBannerRobot();
  createMainRobot();


  if (typeof createRobot === 'function') {
    createRobot('floating-robot-canvas', { width: 140, height: 140 });
  }

  // Ensure chart has width before drawing
  setTimeout(() => drawChart(currentChart), 100);
  setInterval(rotateRobotMessage, 6000);
}

let authMode = 'login';
function toggleAuthMode() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  const title = document.getElementById('auth-title');
  const sub = document.getElementById('auth-subtitle');
  const btn = document.querySelector('.auth-btn');
  const swt = document.getElementById('auth-switch-text');
  const sFields = document.getElementById('signup-fields');

  if (authMode === 'login') {
    title.textContent = 'Welcome Back';
    sub.textContent = 'Sign in to manage your finances';
    btn.textContent = 'Sign In';
    swt.textContent = "Don't have an account? Sign up";
    sFields.classList.add('hidden');
  } else {
    title.textContent = 'Create Account';
    sub.textContent = 'Join FinanceU today';
    btn.textContent = 'Sign Up';
    swt.textContent = 'Already have an account? Sign in';
    sFields.classList.remove('hidden');
  }
}

// Save default Alex data initially
const DEFAULT_ALEX_DATA = {
  STATE: JSON.stringify(STATE),
  TRANSACTIONS: JSON.stringify(TRANSACTIONS),
  VAULTS: JSON.stringify(VAULTS),
  GOALS: JSON.stringify(GOALS),
  BILLS: JSON.stringify(BILLS),
  INCOME_SCHEDULE: JSON.stringify(INCOME_SCHEDULE),
  CAL_EVENTS: JSON.stringify(CAL_EVENTS),
  ALERTS: JSON.stringify(ALERTS),
  BADGES: JSON.stringify(BADGES),
  CHART_DATA: JSON.stringify(CHART_DATA)
};

function handleAuth() {
  const user = document.getElementById('auth-user').value.trim();
  const pass = document.getElementById('auth-pass').value.trim();

  if (!user || !pass) {
    alert('Please enter both username and password.');
    return;
  }

  if (authMode === 'login') {
    if (user.toLowerCase() !== 'alex') {
      const stored = localStorage.getItem('financeu_user_data_' + user.toLowerCase());
      if (!stored) {
        alert('Username not found. Please sign up.');
        return;
      }
      const data = JSON.parse(stored);
      if (data.password !== pass) {
        alert('Incorrect password.');
        return;
      }
    } else {
      if (pass !== 'password') {
        alert('Incorrect password for tester account (use: password).');
        return;
      }
    }
  } else if (authMode === 'signup') {
    const card = document.getElementById('auth-card').value.trim();
    const exp = document.getElementById('auth-exp').value.trim();
    const cvv = document.getElementById('auth-cvv').value.trim();

    if (!card || !exp || !cvv) {
      alert('Please fill out all card details for the new account.');
      return;
    }

    // Create new user data
    const newUserData = {
      password: pass,
      card: card,
      exp: exp,
      cvv: cvv,
      STATE: { balance: 0, checking: 0, selectedEmoji: '🎯', calYear: new Date().getFullYear(), calMonth: new Date().getMonth() },
      TRANSACTIONS: [],
      VAULTS: [
        { id: 1, name: 'General Savings', emoji: '💰', target: 5000, current: 0, color: '#4f8ef7' },
        { id: 2, name: 'Emergency Fund', emoji: '🛡️', target: 2000, current: 0, color: '#10b981' }
      ],
      GOALS: [],
      BILLS: [],
      INCOME_SCHEDULE: [],
      CAL_EVENTS: [],
      ALERTS: [],
      BADGES: BADGES.map(b => ({ ...b, earned: false })), // copy badges but set unearned
      CHART_DATA: { week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], income: [0, 0, 0, 0, 0, 0, 0], expense: [0, 0, 0, 0, 0, 0, 0] }, month: { labels: ['Jan', 'Feb', 'Mar', 'Apr'], income: [0, 0, 0, 0], expense: [0, 0, 0, 0] } }
    };

    localStorage.setItem('financeu_user_data_' + user.toLowerCase(), JSON.stringify(newUserData));
  }

  localStorage.setItem('financeu_logged_in', 'true');
  localStorage.setItem('financeu_user', user);

  loadUserData(user);
  showApp();
}

function loadUserData(user) {
  const key = 'financeu_user_data_' + user.toLowerCase();
  const stored = localStorage.getItem(key);

  if (user.toLowerCase() === 'alex' || !stored) {
    // Load Alex mock data
    STATE = JSON.parse(DEFAULT_ALEX_DATA.STATE);
    TRANSACTIONS = JSON.parse(DEFAULT_ALEX_DATA.TRANSACTIONS);
    VAULTS = JSON.parse(DEFAULT_ALEX_DATA.VAULTS);
    BILLS = JSON.parse(DEFAULT_ALEX_DATA.BILLS);
    INCOME_SCHEDULE = JSON.parse(DEFAULT_ALEX_DATA.INCOME_SCHEDULE);
    CAL_EVENTS = JSON.parse(DEFAULT_ALEX_DATA.CAL_EVENTS);
    ALERTS = JSON.parse(DEFAULT_ALEX_DATA.ALERTS);
    BADGES = JSON.parse(DEFAULT_ALEX_DATA.BADGES);
    CHART_DATA = JSON.parse(DEFAULT_ALEX_DATA.CHART_DATA);

    updateUIForUser('Alex', 'Alex Johnson', '•••• •••• 4291', '08/28');
  } else {
    // Load stored user data
    const data = JSON.parse(stored);
    STATE = data.STATE;
    TRANSACTIONS = data.TRANSACTIONS;
    VAULTS = data.VAULTS;
    GOALS = data.GOALS || [];
    BILLS = data.BILLS;
    INCOME_SCHEDULE = data.INCOME_SCHEDULE;
    CAL_EVENTS = data.CAL_EVENTS;
    ALERTS = data.ALERTS;
    BADGES = data.BADGES;
    CHART_DATA = data.CHART_DATA;

    const cardLast4 = data.card.slice(-4);
    updateUIForUser(user, user, '•••• •••• ' + cardLast4, data.exp);
  }
}

function updateUIForUser(firstName, fullName, cardString, expString) {
  const initial = firstName.charAt(0).toUpperCase();
  document.getElementById('sidebar-avatar').textContent = initial;
  document.getElementById('sidebar-pname').textContent = fullName;
  document.getElementById('dash-greeting').innerHTML = `Good morning, ${firstName} 👋`;

  const bCard = document.getElementById('bc-card-number');
  if (bCard) bCard.textContent = cardString;
  const bExp = document.getElementById('bc-card-exp');
  if (bExp) bExp.textContent = expString;

  const wCheck = document.getElementById('wallet-check-card');
  if (wCheck) wCheck.textContent = cardString.split(' ').slice(-2).join(' '); // e.g. •••• 4291

  const speechText = document.getElementById('speech-text');
  if (speechText) speechText.textContent = `Hi ${firstName}! I'm AXIS. Ask me anything about your finances!`;
}

function saveUserData() {
  const user = localStorage.getItem('financeu_user');
  if (!user || user.toLowerCase() === 'alex') return; // Don't overwrite Alex

  const key = 'financeu_user_data_' + user.toLowerCase();
  const stored = localStorage.getItem(key);
  if (stored) {
    const data = JSON.parse(stored);
    data.STATE = STATE;
    data.TRANSACTIONS = TRANSACTIONS;
    data.VAULTS = VAULTS;
    data.GOALS = GOALS || [

      { id: 1, emoji: '💻', title: 'New Laptop', target: 1000, color: '#7c3aed' },
      { id: 2, emoji: '✈️', title: 'Summer Trip', target: 1200, color: '#f59e0b' }
    ];
    data.BILLS = BILLS;
    data.INCOME_SCHEDULE = INCOME_SCHEDULE;
    data.CAL_EVENTS = CAL_EVENTS;
    data.ALERTS = ALERTS;
    data.BADGES = BADGES;
    data.CHART_DATA = CHART_DATA;
    window.VAULTS = data.VAULTS || [];
    window.TRANSACTIONS = data.TRANSACTIONS || [];
    window.BILLS = data.BILLS || [];
    window.CAL_EVENTS = data.CAL_EVENTS || [];
    window.ALERTS = data.ALERTS || [];
    window.CHART_DATA = data.CHART_DATA || CHART_DATA;
    localStorage.setItem(key, JSON.stringify(data));
  }
}

function handleLogout() {
  localStorage.removeItem('financeu_logged_in');
  location.reload();
}

function initTheme() {
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    document.body.classList.add(currentTheme);
    if (currentTheme === 'light-mode') {
      const checkbox = document.querySelector('#checkbox');
      if (checkbox) checkbox.checked = true;
    }
  }
}

function toggleTheme() {
  const checkbox = document.querySelector('#checkbox');
  if (checkbox.checked) {
    document.body.classList.add('light-mode');
    localStorage.setItem('theme', 'light-mode');
  } else {
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark-mode');
  }
  // Re-draw charts to update colors
  if (typeof drawChart === 'function') drawChart(currentChart);
  if (typeof drawRingChart === 'function') drawRingChart();
}



function renderAll() {
  updateAchievements();
  renderBalances();
  setHeaderDate();
  renderTransactions();
  drawChart('week');
  renderVaults();
  renderGoals();
  renderBills();
  renderCalendar();
  renderAlerts();
  renderQuickQuestions();
  renderBadges();
  renderSavingsTips();
  drawRingChart();
  renderIncomeSched();
  renderDueSoon();
  renderQuests();
  renderSquadQuests();
  renderLeaderboard();
  updateProfileStats();
}


function updateAchievements() {
  const totalSaved = VAULTS.reduce((a, v) => a + v.current, 0);
  const anyVaultOver50 = VAULTS.some(v => (v.current / v.target) >= 0.5);
  const paidBillsCount = TRANSACTIONS.filter(t => t.name.startsWith('Paid:')).length;

  BADGES.forEach(b => {
    if (b.name === 'First Save' && totalSaved > 0) b.earned = true;
    if (b.name === 'Goal Setter' && VAULTS.length > 0) b.earned = true;
    if (b.name === 'Bill Master' && paidBillsCount > 0) b.earned = true;
    if (b.name === '50% Saved' && anyVaultOver50) b.earned = true;
    if (b.name === 'Debt Free' && STATE.balance > 100) b.earned = true;
    if (b.name === '$5K Saved' && totalSaved >= 5000) b.earned = true;
  });
}

function renderBalances() {
  // Calculate total from checking + all vaults + all goals
  const totalVaults = VAULTS.reduce((sum, v) => sum + v.current, 0);
  const totalGoals = GOALS.reduce((sum, g) => sum + g.current, 0);
  const totalBalance = STATE.checking + totalVaults + totalGoals;
  STATE.balance = totalBalance; // Keep state in sync

  document.getElementById('bal-display').textContent = totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const checkDisplay = document.getElementById('wallet-check-display');
  if (checkDisplay) checkDisplay.textContent = '$' + STATE.checking.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const saveDisplay = document.getElementById('wallet-save-display');
  const emerDisplay = document.getElementById('wallet-emer-display');
  const savingsVault = VAULTS.find(v => v.name === 'General Savings');
  if (saveDisplay) saveDisplay.textContent = '$' + (savingsVault ? savingsVault.current : 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  // Example for emergency fund
  const emergencyFund = VAULTS.find(v => v.name.toLowerCase().includes('emergency'));
  if (emerDisplay) emerDisplay.textContent = '$' + (emergencyFund ? emergencyFund.current : 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  // Update dashboard stats
  const statInc = document.getElementById('stat-inc');
  const statExp = document.getElementById('stat-exp');
  const statSaved = document.getElementById('stat-saved');
  const statDue = document.getElementById('stat-due');
  const statDueCount = document.getElementById('stat-due-count');

  const incomeThisMonth = TRANSACTIONS.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expensesThisMonth = TRANSACTIONS.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const dueSoonAmt = BILLS.filter(b => {
    let diff = b.day - new Date().getDate();
    if (diff < 0) diff += 30;
    return diff <= 10;
  }).reduce((sum, b) => sum + b.amount, 0);

  if (statInc) statInc.textContent = '$' + incomeThisMonth.toLocaleString('en-US');
  if (statExp) statExp.textContent = '$' + expensesThisMonth.toLocaleString('en-US');
  if (statSaved) {
    const sVault = VAULTS.find(v => v.name === 'General Savings');
    statSaved.textContent = '$' + (sVault ? sVault.current : 0).toLocaleString('en-US');
  }
  if (statDue) statDue.textContent = '$' + dueSoonAmt.toLocaleString('en-US');
  if (statDueCount) statDueCount.textContent = BILLS.filter(b => {
    let diff = b.day - new Date().getDate();
    if (diff < 0) diff += 30;
    return diff <= 10;
  }).length + ' bills';
}

// ── PAGE NAVIGATION ────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  const nb = document.getElementById('nb-' + name);
  if (nb) nb.classList.add('active');
  // Close sidebar and overlay on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
  }
  // Re-draw chart when switching to dashboard
  if (name === 'dashboard') drawChart(currentChart);
  if (name === 'goals') { drawRingChart(); }

  // Hide floating robot when on assistant page
  const trigger = document.getElementById('floating-axis-trigger');
  if (trigger) {
    if (name === 'assistant') trigger.classList.add('hidden');
    else trigger.classList.remove('hidden');
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.classList.toggle('active');
}

// ── CHAT DRAWER ──
function toggleChatDrawer() {
  const drawer = document.getElementById('chat-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (!drawer || !overlay) return;

  drawer.classList.toggle('open');
  overlay.classList.toggle('active');

  if (drawer.classList.contains('open')) {
    renderQuickQuestionsDrawer();
    const trigger = document.getElementById('floating-axis-trigger');
    if (trigger) trigger.classList.add('hidden');
  } else {
    const trigger = document.getElementById('floating-axis-trigger');
    // Only show back if NOT on assistant page
    const onAssistant = document.getElementById('page-assistant').classList.contains('active');
    if (trigger && !onAssistant) trigger.classList.remove('hidden');
  }
}

function renderQuickQuestionsDrawer() {
  const wrap = document.getElementById('drawer-quick-qs');
  if (!wrap) return;
  wrap.innerHTML = QUICK_QUESTIONS.map(q =>
    `<button class="qq-btn" onclick='askQuestion(${JSON.stringify(q)}, true)'>${q}</button>`
  ).join('');
}

function sendDrawerChat() {
  const input = document.getElementById('drawer-chat-in');
  const q = input.value.trim();
  if (!q) return;
  input.value = '';
  askQuestion(q, true);
}

// ── DATE ───────────────────────────────────────────────────
function setHeaderDate() {
  const el = document.getElementById('hd-date');
  if (!el) return;
  const d = new Date();
  el.innerHTML = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// ── TRANSACTIONS ───────────────────────────────────────────
function renderTransactions(filter = 'all', limit = null) {
  const recent = document.getElementById('recent-tx');
  const full = document.getElementById('full-tx');
  let txs = filter === 'all' ? TRANSACTIONS : TRANSACTIONS.filter(t => t.type === filter);

  const makeItem = t => {
    const isInc = t.amount > 0;
    return `<li class="tx-item">
      <div class="tx-icon" style="background:${isInc ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)'}">${t.icon}</div>
      <div class="tx-info"><div class="tx-name">${t.name}</div><div class="tx-date">${formatDate(t.date)}</div></div>
      <div class="tx-amt ${isInc ? 'inc' : 'exp'}">${isInc ? '+' : ''}$${Math.abs(t.amount).toFixed(2)}</div>
    </li>`;
  };

  if (recent) recent.innerHTML = TRANSACTIONS.slice(0, 5).map(makeItem).join('');
  if (full) full.innerHTML = txs.map(makeItem).join('');
}

function filterTx(val) { renderTransactions(val); }

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── VAULTS ─────────────────────────────────────────────────
function renderVaults() {
  const grid = document.getElementById('vaults-grid');
  if (!grid) return;
  grid.innerHTML = VAULTS.map(v => {
    const pct = Math.min(100, Math.round(v.current / v.target * 100));
    return `<div class="vault-card glass">
      <div class="vault-emoji">${v.emoji}</div>
      <div class="vault-name">${v.name}</div>
      <div class="vault-amounts">$${v.current.toLocaleString()} of $${v.target.toLocaleString()}</div>
      <div class="vault-bar"><div class="vault-fill" style="width:${pct}%;background:${v.color}"></div></div>
      <div class="vault-pct">${pct}% complete</div>
      <button style="margin-top:12px;width:100%;padding:8px;border:none;border-radius:8px;background:var(--bg2);color:var(--text);cursor:pointer;font-size:0.8rem;transition:0.2s" onmouseover="this.style.background='var(--accent)'" onmouseout="this.style.background='var(--bg2)'" onclick="openFundVaultModal(${v.id})">+ Transfer Funds</button>
    </div>`;
  }).join('');
  const el = document.getElementById('total-saved-display');
  if (el) el.textContent = '$' + VAULTS.reduce((a, v) => a + v.current, 0).toLocaleString();
}

// ── GOALS ──────────────────────────────────────────────────
function renderGoals() {
  const grid = document.getElementById('goals-grid');
  if (!grid) return;

  grid.innerHTML = GOALS.map(g => {
    const pct = Math.min(100, Math.round(g.current / g.target * 100));
    const isDone = pct >= 100;

    return `<div class="goal-card glass ${isDone ? 'done-goal' : ''}" style="padding: 24px;">
      <div class="goal-emoji" style="font-size:2rem; margin-bottom:12px;">${g.emoji}</div>
      <div class="goal-title-txt" style="font-size:1.1rem; font-weight:800;">${g.title}</div>
      <div class="goal-prog" style="color:var(--text2); margin-bottom:16px;">$${g.current.toLocaleString()} / $${g.target.toLocaleString()}</div>
      <div class="goal-bar" style="height:10px; background:rgba(255,255,255,0.05);"><div class="goal-fill" style="width:${pct}%;background:linear-gradient(90deg,${g.color},var(--accent2))"></div></div>
      <div class="goal-pct" style="font-weight:800; color:${g.color}; margin-top:8px;">${pct}%</div>
      <div class="goal-actions" style="margin-top:20px; display:flex; gap:10px;">
        ${isDone ? 
          `<button class="add-btn" onclick="claimGoal(${g.id})" style="flex:1; background:linear-gradient(135deg, #10b981, #059669)">Claim Achievement</button>` : 
          `<button class="add-btn" onclick="openFundGoalModal(${g.id})" style="flex:1;">+ Transfer</button>`
        }
      </div>
    </div>`;
  }).join('');
}

function openFundGoalModal(id) {
  document.getElementById('fund-goal-id').value = id;
  openModal('fund-goal-modal');
}

function submitFundGoal() {
  const id = parseInt(document.getElementById('fund-goal-id').value);
  const amt = parseFloat(document.getElementById('fund-goal-amt').value);

  if (!amt || amt <= 0) { showToast('Enter a valid amount'); return; }
  if (amt > STATE.checking) { showToast('Insufficient balance in Checking!'); return; }

  const goal = GOALS.find(g => g.id === id);
  if (!goal) return;

  // Deduct from checking
  STATE.checking -= amt;

  // Add to goal
  goal.current += amt;

  // Record transaction
  TRANSACTIONS.unshift({ id: Date.now(), name: `Goal: ${goal.title}`, category: 'transfer', icon: goal.emoji, amount: -amt, date: new Date().toISOString().split('T')[0], type: 'expense' });
  addPoints(50, 'Goal contribution');

  saveUserData();
  closeModals();
  renderAll();
  showToast(`Transferred $${amt.toFixed(2)} to ${goal.title}!`);
}

function claimGoal(id) {
  const idx = GOALS.findIndex(g => g.id === id);
  if (idx === -1) return;
  const g = GOALS[idx];

  // Note: Money and transactions are kept intact (user request)

  // Remove the goal from the active list
  GOALS.splice(idx, 1);

  saveUserData();
  renderAll();
  showToast(`Congratulations on achieving ${g.title}! 🎊`);
}

// ── BILLS ──────────────────────────────────────────────────
function renderBills() {
  const list = document.getElementById('recurring-list');
  if (!list) return;
  list.innerHTML = BILLS.map(b => {
    const isRecurring = b.recurring || (b.day && !b.date);
    const dueLabel = isRecurring
      ? `Due: ${ordinal(b.day)} of each month`
      : `Due: ${formatDate(b.date)}`;

    return `<li class="pay-item">
      <div class="pay-icon">${b.icon}</div>
      <div class="pay-info"><div class="pay-name">${b.name}</div><div class="pay-due">${dueLabel}</div></div>
      <div class="pay-side">
        <div class="pay-amt">$${b.amount.toFixed(2)}</div>
        <button class="pay-now-btn" onclick="payBill(${b.id})">Pay</button>
      </div>
    </li>`;
  }).join('');
}

function renderIncomeSched() {
  const list = document.getElementById('income-sched');
  if (!list) return;
  list.innerHTML = INCOME_SCHEDULE.map(i => {
    const isRecurring = i.recurring || (i.day && !i.date);
    const dueLabel = isRecurring
      ? `Each month — ${ordinal(i.day)}`
      : `${formatDate(i.date)}`;

    return `<li class="pay-item">
      <div class="pay-icon">${i.icon}</div>
      <div class="pay-info"><div class="pay-name">${i.name}</div><div class="pay-due">${dueLabel}</div></div>
      <div class="pay-amt" style="color:var(--green)">+$${i.amount}</div>
    </li>`;
  }).join('');
}

function renderDueSoon() {
  const wrap = document.getElementById('due-soon');
  if (!wrap) return;
  const today = new Date();
  const todayDay = today.getDate();

  const sorted = [...BILLS].map(b => {
    let diff;
    if (b.recurring) {
      diff = b.day - todayDay;
      if (diff < 0) diff += 30; // Approximation for monthly cycle
    } else {
      const bDate = new Date(b.date);
      const timeDiff = bDate - today;
      diff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    return { ...b, diff };
  }).filter(b => b.diff >= 0 && b.diff <= 7).sort((a, b) => a.diff - b.diff);

  if (sorted.length === 0) {
    wrap.innerHTML = '<p style="color:var(--text2);text-align:center;padding:20px;">No bills due in the next 7 days.</p>';
    return;
  }

  wrap.innerHTML = `<div class="due-soon">${sorted.map(b => {
    const cls = b.diff <= 2 ? 'due-urgent' : 'due-warn';
    const txt = b.diff === 0 ? 'Due TODAY!' : `Due in ${b.diff} day${b.diff > 1 ? 's' : ''}`;
    return `<div class="due-card ${cls}">
      <div class="due-icon">${b.icon}</div>
      <div class="due-info"><div class="due-name">${b.name}</div><div class="due-days">${txt}</div></div>
      <div class="due-side">
        <div class="due-amt">$${b.amount.toFixed(2)}</div>
        <button class="due-pay-btn" onclick="payBill(${b.id})">Pay</button>
      </div>
    </div>`;
  }).join('')}</div>`;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function payBill(id) {
  const idx = BILLS.findIndex(b => b.id === id);
  if (idx === -1) return;
  const bill = BILLS[idx];

  document.getElementById('pay-bill-id').value = id;
  document.getElementById('pay-confirm-text').textContent = `Pay $${bill.amount.toFixed(2)} for ${bill.name}?`;

  renderPaymentSources();
  openModal('pay-confirm-modal');
}

function renderPaymentSources() {
  const sel = document.getElementById('pay-source');
  if (!sel) return;

  let html = `<option value="checking">💳 Checking ($${STATE.checking.toLocaleString()})</option>`;
  VAULTS.forEach(v => {
    html += `<option value="vault-${v.id}">${v.emoji} ${v.name} ($${v.current.toLocaleString()})</option>`;
  });
  sel.innerHTML = html;
}

function submitPayBill() {
  const id = parseInt(document.getElementById('pay-bill-id').value);
  const source = document.getElementById('pay-source').value;

  const idx = BILLS.findIndex(b => b.id === id);
  if (idx === -1) return;
  const bill = BILLS[idx];

  let sourceObj = null;
  let sourceName = 'Checking';

  if (source === 'checking') {
    if (STATE.checking < bill.amount) { showToast('Insufficient funds in Checking!'); return; }
    STATE.checking -= bill.amount;
  } else {
    const vaultId = parseInt(source.split('-')[1]);
    sourceObj = VAULTS.find(v => v.id === vaultId);
    if (!sourceObj) return;
    if (sourceObj.current < bill.amount) { showToast(`Insufficient funds in ${sourceObj.name}!`); return; }
    sourceObj.current -= bill.amount;
    sourceName = sourceObj.name;
  }

  // Deduct from total balance
  STATE.balance -= bill.amount;

  // Record transaction
  TRANSACTIONS.unshift({
    id: Date.now(),
    name: `Paid: ${bill.name}`,
    category: bill.category || 'bill',
    icon: bill.icon || '💸',
    amount: -bill.amount,
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });

  // Remove the bill
  BILLS.splice(idx, 1);

  saveUserData();
  closeModals();
  renderAll();
  showToast(`Paid $${bill.amount.toFixed(2)} from ${sourceName}.`);
}

// ── ALERTS ─────────────────────────────────────────────────
function renderAlerts() {
  const list = document.getElementById('alerts-list');
  if (!list) return;
  list.innerHTML = ALERTS.map(a => `<li class="alert-item">
    <div class="alert-icon">${a.icon}</div>
    <div class="alert-info"><div class="alert-msg">${a.msg}</div><div class="alert-when">${a.when}</div></div>
  </li>`).join('');
  const badge = document.getElementById('notif-badge');
  if (badge) badge.textContent = ALERTS.filter(a => a.urgent).length;
}

// ── SAVINGS TIPS ───────────────────────────────────────────
function renderSavingsTips() {
  const list = document.getElementById('tips-list');
  if (!list) return;
  list.innerHTML = SAVINGS_TIPS.map(t => `<li class="tip-item">${t}</li>`).join('');
}

// ── BADGES ─────────────────────────────────────────────────
function renderBadges() {
  const grid = document.getElementById('badges-grid');
  if (!grid) return;
  grid.innerHTML = BADGES.map(b => `
    <div class="badge-item" style="opacity:${b.earned ? 1 : 0.35}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
    </div>`).join('');
}

// ── QUICK QUESTIONS ────────────────────────────────────────
function renderQuickQuestions() {
  const wrap = document.getElementById('quick-qs');
  if (!wrap) return;
  // Use JSON.stringify to safely escape quotes in the question string
  wrap.innerHTML = QUICK_QUESTIONS.map(q =>
    `<button class="qq-btn" onclick='askQuestion(${JSON.stringify(q)})'>${q}</button>`
  ).join('');
}

// ── CHAT (SMART AI) ────────────────────────────────────────
function sendChat() {
  const input = document.getElementById('chat-in');
  const q = input.value.trim();
  if (!q) return;
  input.value = '';
  askQuestion(q);
}

// ── AI CONFIG & GEMINI INTEGRATION ─────────────────────────
async function askQuestion(q, isDrawer = false) {
  const msgsId = isDrawer ? 'drawer-chat-msgs' : 'chat-msgs';
  const msgs = document.getElementById(msgsId);
  if (!msgs) return;

  msgs.innerHTML += `<div class="msg user">${q}</div>`;
  msgs.scrollTop = msgs.scrollHeight;

  const thinkingId = 'thinking-' + Date.now();
  msgs.innerHTML += `<div class="msg bot" id="${thinkingId}">🤖 AXIS is thinking...</div>`;
  msgs.scrollTop = msgs.scrollHeight;

  // Simulate a small delay to make the AI feel "real"
  setTimeout(() => {
    try {
      const result = getSmartResponse(q);
      const responseText = result.text;
      const actionData = result;

      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) {
        let html = `🤖 ${responseText}`;
        if (actionData && actionData.action) {
          // If in drawer, close drawer before running action if it's a page switch
          const finalAction = actionData.action.includes('showPage') && isDrawer
            ? `toggleChatDrawer(); ${actionData.action}`
            : actionData.action;
          html += `<br><button class="ai-action-btn" onclick="${finalAction}">${actionData.actionText || 'Take me there'}</button>`;
        }
        thinkingEl.innerHTML = html;
      }

      const sp = document.getElementById('speech-text');
      if (sp) sp.textContent = responseText.substring(0, 100) + (responseText.length > 100 ? '...' : '');
      msgs.scrollTop = msgs.scrollHeight;
    } catch (err) {
      console.error("AI Brain Error:", err);
      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) thinkingEl.innerHTML = "🤖 Oops, I got a bit confused. Can you try asking that again?";
    }
  }, 600);
}

async function callGroq(userPrompt) {
  const user = localStorage.getItem('financeu_user') || 'Alex';
  const systemPrompt = `
    You are AXIS, a smart, friendly financial co-pilot for a college student named ${user}.
    Your tone is encouraging, tech-savvy, and helpful. 
    
    CURRENT FINANCIAL DATA:
    - Balance: $${STATE.balance}
    - Recent Transactions: ${JSON.stringify(TRANSACTIONS.slice(0, 5))}
    - Monthly Bills: ${JSON.stringify(BILLS)}
    - Savings Vaults: ${JSON.stringify(VAULTS)}

    GUIDELINES:
    1. Keep responses concise (under 3 sentences unless asked for detail).
    2. Use the data above to give SPECIFIC advice.
    3. If they ask how to do something in the app, tell them where it is.
    4. Mention specific bills or goals by name.
    
    USER QUESTION: ${userPrompt}
  `;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.reply;
}

function getSmartResponse(q) {
  const ql = q.toLowerCase();

  // Data Context
  const totalBills = BILLS.reduce((a, b) => a + b.amount, 0);
  const totalSaved = VAULTS.reduce((a, v) => a + v.current, 0);
  const nextBill = [...BILLS].sort((a, b) => a.day - b.day).find(b => b.day >= new Date().getDate()) || BILLS[0];

  // ── THE "DECISION CHECK" (WOW MOMENT) ──
  if (ql.includes('can i afford') || ql.includes('should i buy') || ql.includes('spend')) {
    const amountMatch = q.match(/\$?\d+/);
    const amount = amountMatch ? parseInt(amountMatch[0].replace('$', '')) : 0;

    if (amount === 0) return { text: "How much does it cost? Tell me the amount and I'll check your budget." };

    // 1. Check current checking balance
    if (amount > STATE.checking) {
      return { text: `Ouch. $${amount} is more than what's in your checking account ($${STATE.checking.toLocaleString()}). You'd have to dip into your savings goals for that.` };
    }

    // 2. Check upcoming bills in the next 14 days
    const today = new Date().getDate();
    const upcomingBills = BILLS.filter(b => {
      let diff = b.day - today;
      if (diff < 0) diff += 30;
      return diff <= 14;
    });
    const billsTotal = upcomingBills.reduce((sum, b) => sum + b.amount, 0);

    if (STATE.checking - amount < billsTotal) {
      const tightBill = upcomingBills[0];
      return {
        text: `I'd wait. If you spend $${amount} now, you'll be short for your ${tightBill.name} ($${tightBill.amount}) due in ${tightBill.day - today} days. Priorities first!`,
        action: "showPage('payments')",
        actionText: "View Upcoming Bills"
      };
    }

    // 3. Check against goals (The WOW moment)
    const activeGoals = GOALS || [];
    if (activeGoals.length > 0) {
      const topGoal = activeGoals[0];
      const savingsVault = VAULTS.find(v => v.name === 'General Savings') || { current: 0 };
      
      // Calculation for "Sets back achievement by X weeks"
      // Assume average saving of $50/week for college students
      const weeklySavings = 50; 
      const weeksDelay = Math.ceil(amount / weeklySavings);
      
      return {
        text: `Whoa! Buying that hoodie ($${amount}) would set your "${topGoal.title}" achievement back by about ${weeksDelay} weeks. Is the style worth the delay?`,
        action: "showPage('goals')",
        actionText: "Review My Goal Progress"
      };
    }

    return { text: `Go for it! $${amount} fits in your budget, and you'll still have enough for your ${nextBill ? nextBill.name : 'upcoming'} bill.` };
  }

  // ── NEW SENIOR-YEAR INTENTS ──

  // 1. Scholarship / Paycheck Check
  if (ql.includes('scholarship') || ql.includes('paycheck') || ql.includes('income')) {
    const nextInc = INCOME_SCHEDULE[0];
    if (!nextInc) return { text: "You don't have any scholarships or income scheduled yet. Want to add one?" };
    return {
      text: `Your next ${nextInc.name} ($${nextInc.amount}) is scheduled for the ${ordinal(nextInc.day)} of the month. Hang in there!`,
      action: "showPage('payments')",
      actionText: "View Income Schedule"
    };
  }

  // 2. Biggest Expense Check
  if (ql.includes('biggest') || ql.includes('most expensive') || ql.includes('spent the most')) {
    const expenses = TRANSACTIONS.filter(t => t.amount < 0);
    if (expenses.length === 0) return { text: "You haven't spent anything yet! Your wallet is safe... for now." };
    const topTx = [...expenses].sort((a, b) => a.amount - b.amount)[0];
    return {
      text: `Your biggest spend recently was "${topTx.name}" at $${Math.abs(topTx.amount).toFixed(2)}. Do you think you can cut back there next month?`,
      action: "showPage('dashboard')",
      actionText: "Check My Charts"
    };
  }

  // 3. Goal Progress
  if (ql.includes('track') || ql.includes('goals') || ql.includes('milestone')) {
    const topGoal = GOALS[0];
    if (!topGoal) return { text: "You haven't set any goals yet! Head to the Goals tab to start saving for your senior year milestones." };
    const savingsVault = VAULTS.find(v => v.name === 'General Savings') || { current: 0 };
    const pct = Math.round((savingsVault.current / topGoal.target) * 100);
    return {
      text: `You are ${pct}% of the way to your "${topGoal.title}" goal! You only need $${(topGoal.target - savingsVault.current).toLocaleString()} more to cross the finish line.`,
      action: "showPage('goals')",
      actionText: "See All Goals"
    };
  }

  // 4. College Advice
  if (ql.includes('advice') || ql.includes('tip') || ql.includes('help')) {
    const tip = SAVINGS_TIPS[Math.floor(Math.random() * SAVINGS_TIPS.length)];
    return {
      text: `Here's a tip for a future college pro: ${tip}`,
    };
  }

  // ── NAVIGATION & GUIDANCE ──
  if (ql.includes('how to') || ql.includes('where is') || ql.includes('change') || ql.includes('add')) {
    if (ql.includes('bill')) {
      return {
        text: "To add a bill, go to the 'Payments' section and click '+ Add Bill'. Want me to open it?",
        action: "showPage('payments'); openModal('bill-modal')",
        actionText: "Open Add Bill"
      };
    }
    if (ql.includes('goal')) {
      return {
        text: "You can track your college milestones in the 'Goals' section.",
        action: "showPage('goals')",
        actionText: "Go to Goals"
      };
    }
  }

  // 5. Saving Advice (Specific)
  if (ql.includes('how can i save') || ql.includes('save more')) {
    const sVault = VAULTS.find(v => v.name === 'General Savings');
    return {
      text: `To save more, try setting up an automatic transfer to your "${sVault ? sVault.name : 'Savings'}" vault. Also, your tutoring income is a great source to boost your goals!`,
      action: "showPage('goals')",
      actionText: "View My Vaults"
    };
  }

  // 6. Level & Gamification
  if (ql.includes('level') || ql.includes('points') || ql.includes('score')) {
    return {
      text: `You're currently Level ${STATE.level} with ${STATE.score} points! You need ${200 - (STATE.score % 200)} more points to reach Level ${STATE.level + 1}. Keep crushing those quests!`,
      action: "showPage('leaderboard')",
      actionText: "See Leaderboard"
    };
  }

  // 7. Squad Quests
  if (ql.includes('squad') || ql.includes('friend') || ql.includes('group')) {
    const topSquad = SQUAD_QUESTS[0];
    return {
      text: `You're currently in ${SQUAD_QUESTS.length} squad quests. Your "${topSquad.title}" group has already saved $${topSquad.current}!`,
      action: "showPage('leaderboard')",
      actionText: "View Squad Quests"
    };
  }

  // 8. Rent & Specific Bills
  if (ql.includes('rent')) {
    const rentBill = BILLS.find(b => b.category === 'rent');
    if (!rentBill) return { text: "I don't see a rent bill in your schedule. Want to add one?" };
    return {
      text: `Your rent ($${rentBill.amount}) is due on the ${ordinal(rentBill.day)} of every month. I'll remind you 3 days before!`,
      action: "showPage('payments')",
      actionText: "Manage Bills"
    };
  }

  // 9. Explanations (New)
  if (ql.includes('automatic transfer')) {
    return {
      text: "An automatic transfer is a set-and-forget way to save! It's a scheduled move of money from your Checking to a Savings Vault (like $20 every Friday). It helps you save consistently without even thinking about it.",
      action: "showPage('goals')",
      actionText: "Try it in Goals"
    };
  }

  // ── GENERAL STATUS ──
  if (ql.includes('balance') || ql.includes('much money')) {
    return { text: `Total balance is $${STATE.balance.toLocaleString()}. Your checking has $${STATE.checking.toLocaleString()}.` };
  }

  if (ql.includes('saving')) {
    const totalS = VAULTS.reduce((a, v) => a + v.current, 0);
    return { text: `You've saved $${totalS.toLocaleString()} so far! Your progress looks great.` };
  }

  if (ql.includes('bill') || ql.includes('due')) {
    if (!nextBill) return { text: "No bills due soon! Enjoy the freedom." };
    return { text: `You have ${BILLS.length} bills. The next one is ${nextBill.name} ($${nextBill.amount}) on the ${ordinal(nextBill.day)}.` };
  }

  return { text: "I'm AXIS, your financial co-pilot. Ask me things like 'Can I afford $100?' or 'When is my scholarship?'" };
}

// ── MODALS ─────────────────────────────────────────────────
function openModal(id) {
  const bg = document.getElementById('modal-bg');
  const modal = document.getElementById(id);
  if (!bg || !modal) return;

  bg.classList.remove('hidden');
  modal.classList.remove('hidden');
  
  // Force reflow
  void modal.offsetWidth;

  modal.classList.add('open');
  
  if (id === 'vault-modal') renderEmojiPicker();
  if (id === 'recv-modal') renderQR();
  if (id === 'topup-modal') renderTopUpDestinations();
  if (id === 'autotransfer-modal') renderAutoTransferDestinations();
}

function renderAutoTransferDestinations() {
  const sel = document.getElementById('at-dest');
  if (!sel) return;
  
  // Restricted to Financial Goals only per user request
  let options = GOALS.map(g => `<option value="goal_${g.id}">${g.emoji} ${g.title}</option>`).join('');
  
  sel.innerHTML = options;
}


function renderTopUpDestinations() {
  const sel = document.getElementById('topup-dest');
  if (!sel) return;

  let html = `<option value="checking">Checking Account</option>`;
  VAULTS.forEach(v => {
    html += `<option value="vault-${v.id}">${v.emoji} ${v.name}</option>`;
  });

  sel.innerHTML = html;
}

function closeModals() {
  const bg = document.getElementById('modal-bg');
  const modals = document.querySelectorAll('.modal');
  
  modals.forEach(m => m.classList.remove('open'));
  
  // Wait for modal transition to finish before hiding everything
  setTimeout(() => {
    bg.classList.add('hidden');
    modals.forEach(m => m.classList.add('hidden'));
  }, 400);
}



function toggleBillRecurring() {
  const isRec = document.getElementById('b-recurring').checked;
  document.getElementById('b-day-wrap').classList.toggle('hidden', !isRec);
  document.getElementById('b-date-wrap').classList.toggle('hidden', isRec);
}

function toggleIncomeRecurring() {
  const isRec = document.getElementById('i-recurring').checked;
  document.getElementById('i-day-wrap').classList.toggle('hidden', !isRec);
  document.getElementById('i-date-wrap').classList.toggle('hidden', isRec);
}

function renderEmojiPicker() {
  const emojis = ['🎯', '✈️', '💻', '📚', '🎓', '🚗', '🏠', '🎵', '🍔', '💪', '🌴', '🎮', '💊', '👟', '📷'];
  const pick = document.getElementById('emoji-pick');
  if (!pick) return;
  pick.innerHTML = emojis.map(e =>
    `<span class="emoji-opt${STATE.selectedEmoji === e ? ' selected' : ''}" onclick="selectEmoji('${e}',this)">${e}</span>`
  ).join('');
}

function selectEmoji(e, el) {
  STATE.selectedEmoji = e;
  document.querySelectorAll('.emoji-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function renderQR() {
  const inner = document.getElementById('qr-inner');
  if (!inner) return;
  inner.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement('div');
    cell.className = 'qr-cell';
    cell.style.background = Math.random() > 0.5 ? '#4f8ef7' : 'transparent';
    inner.appendChild(cell);
  }
}

// ── ACTIONS ────────────────────────────────────────────────
function handleSend() {
  const to = document.getElementById('send-to').value.trim();
  const amt = parseFloat(document.getElementById('send-amt').value);
  if (!to || !amt) { showToast('Please fill all fields'); return; }
  if (amt > STATE.balance) { showToast('Insufficient balance!'); return; }

  STATE.balance -= amt;
  STATE.checking -= amt;

  document.getElementById('bal-display').textContent = STATE.balance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const checkDisplay = document.getElementById('wallet-check-display');
  if (checkDisplay) checkDisplay.textContent = '$' + STATE.checking.toLocaleString('en-US', { minimumFractionDigits: 2 });

  TRANSACTIONS.unshift({ id: Date.now(), name: `Sent to ${to}`, category: 'transfer', icon: '↑', amount: -amt, date: new Date().toISOString().split('T')[0], type: 'expense' });
  addPoints(20, 'Transaction logged');
  saveUserData();

  closeModals();
  renderAll();
  showToast(`$${amt.toFixed(2)} sent to ${to}!`);
}

function handleTopUp() {
  const amt = parseFloat(document.getElementById('topup-amt').value);
  const dest = document.getElementById('topup-dest').value;
  if (!amt || amt <= 0) { showToast('Enter a valid amount'); return; }

  if (dest === 'checking') {
    STATE.balance += amt;
    STATE.checking += amt;
    TRANSACTIONS.unshift({ id: Date.now(), name: 'Top Up: Checking', category: 'income', icon: '💳', amount: amt, date: new Date().toISOString().split('T')[0], type: 'income' });
  } else if (dest.startsWith('vault-')) {
    const targetId = parseInt(dest.split('-')[1]);
    const vault = VAULTS.find(v => v.id === targetId);
    if (vault) {
      STATE.balance += amt;
      vault.current += amt;
      TRANSACTIONS.unshift({
        id: Date.now(),
        name: `Top Up: ${vault.name}`,
        category: 'income',
        icon: vault.emoji,
        amount: amt,
        date: new Date().toISOString().split('T')[0],
        type: 'income'
      });
    } else {
      showToast('Error: Could not find target account.');
    }
  }

  saveUserData();
  closeModals();
  renderAll();
  const vaultName = dest === 'checking' ? 'Checking' : (VAULTS.find(v => dest.includes(v.id.toString()))?.name || 'Account');
  showToast(`$${amt.toFixed(2)} added to ${vaultName}!`);
}

function setAmt(n) { document.getElementById('topup-amt').value = n; }

function copyId() {
  navigator.clipboard.writeText('@alexj.financeu').catch(() => { });
  showToast('ID copied to clipboard!');
}

// ── ADD VAULT ──────────────────────────────────────────────
function addVault() {
  const name = document.getElementById('v-name').value.trim();
  const target = parseFloat(document.getElementById('v-target').value) || 0;
  const current = parseFloat(document.getElementById('v-current').value) || 0;
  if (!name || !target) { showToast('Fill in vault name and target'); return; }
  const colors = ['#4f8ef7', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];
  VAULTS.push({ id: Date.now(), name, emoji: STATE.selectedEmoji, target, current, color: colors[VAULTS.length % colors.length] });
  addPoints(100, 'New Vault created');
  saveUserData();

  closeModals();
  renderAll();
  showToast(`Vault "${name}" created!`);
}

function openFundVaultModal(id) {
  document.getElementById('fund-vault-id').value = id;
  openModal('fund-vault-modal');
}

function submitFundVault() {
  const id = parseInt(document.getElementById('fund-vault-id').value);
  const amt = parseFloat(document.getElementById('fund-vault-amt').value);

  if (!amt || amt <= 0) { showToast('Enter a valid amount'); return; }
  if (amt > STATE.balance) { showToast('Insufficient balance in Checking!'); return; }

  const vault = VAULTS.find(v => v.id === id);
  if (!vault) return;

  // Deduct from checking/balance
  STATE.balance -= amt;
  STATE.checking -= amt;

  // Add to vault
  vault.current += amt;

  // Record transaction
  TRANSACTIONS.unshift({ id: Date.now(), name: `Transfer to ${vault.name}`, category: 'transfer', icon: vault.emoji, amount: -amt, date: new Date().toISOString().split('T')[0], type: 'expense' });
  addPoints(50, 'Savings contribution');

  saveUserData();

  closeModals();
  renderAll();
  showToast(`Transferred $${amt.toFixed(2)} to ${vault.name}!`);
}

// ── ADD BILL ───────────────────────────────────────────────
function addBill() {
  const name = document.getElementById('b-name').value.trim();
  const amt = parseFloat(document.getElementById('b-amt').value) || 0;
  const recurring = document.getElementById('b-recurring').checked;
  const day = parseInt(document.getElementById('b-day').value) || 1;
  const date = document.getElementById('b-date').value;
  const cat = document.getElementById('b-cat').value;

  if (!name || !amt) { showToast('Fill in bill details'); return; }
  if (!recurring && !date) { showToast('Please select a due date'); return; }

  const icons = { rent: '🏠', food: '🍔', transport: '🚌', subscription: '📱', utilities: '💡', tuition: '🎓', other: '📦' };

  BILLS.push({
    id: Date.now(),
    name,
    icon: icons[cat] || '📦',
    amount: amt,
    recurring,
    day: recurring ? day : null,
    date: recurring ? null : date,
    category: cat
  });

  saveUserData();
  closeModals();
  renderAll();
  showToast(`${recurring ? 'Recurring' : 'One-time'} bill "${name}" added!`);
}

function addIncome() {
  const name = document.getElementById('i-name').value.trim();
  const amt = parseFloat(document.getElementById('i-amt').value) || 0;
  const recurring = document.getElementById('i-recurring').checked;
  const day = parseInt(document.getElementById('i-day').value) || 1;
  const date = document.getElementById('i-date').value;
  const cat = document.getElementById('i-cat').value;

  if (!name || !amt) { showToast('Fill in income details'); return; }
  if (!recurring && !date) { showToast('Please select a date'); return; }

  const icons = { job: '💼', freelance: '🎨', gift: '🎁', aid: '🎓', other: '💰' };

  INCOME_SCHEDULE.push({
    id: Date.now(),
    name,
    icon: icons[cat] || '💰',
    amount: amt,
    recurring,
    day: recurring ? day : null,
    date: recurring ? null : date,
    category: cat
  });

  saveUserData();
  closeModals();
  renderAll();
  showToast(`${recurring ? 'Recurring' : 'One-time'} income "${name}" added!`);
}

function handleAutoTransfer() {
  const destVal = document.getElementById('at-dest').value;
  const amt = parseFloat(document.getElementById('at-amt').value);
  const freq = document.getElementById('at-freq').value;

  if (!amt || amt <= 0) { showToast('Please enter a valid amount'); return; }

  const [type, id] = destVal.split('_');
  let targetName = "";

  if (type === 'vault') {
    const vault = VAULTS.find(v => v.id == id);
    targetName = vault ? vault.name : 'Vault';
  } else {
    const goal = GOALS.find(g => g.id == id);
    targetName = goal ? goal.title : 'Goal';
  }

  // Add rule to STATE (mocking)
  if (!STATE.autoTransferRules) STATE.autoTransferRules = [];
  STATE.autoTransferRules.push({
    id: Date.now(),
    destId,
    vaultName: vault.name,
    amount: amt,
    frequency: freq
  });

  saveUserData();
  closeModals();
  showToast(`⚡ Success! $${amt.toFixed(2)} will be transferred to ${vault.name} ${freq}.`);
  
  // Update AI context or speech if needed
  const speech = document.getElementById('speech-text');
  if (speech) speech.textContent = `Great move, Alex! Your automatic transfer to ${vault.name} is all set up.`;
}

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}

// ── GAMIFICATION ──────────────────────────────────────────
function renderQuests() {
  const list = document.getElementById('daily-quests');
  const countEl = document.getElementById('quest-count');
  if (!list) return;

  const doneCount = DAILY_TASKS.filter(t => t.done).length;
  countEl.textContent = `${doneCount}/${DAILY_TASKS.length} Done`;

  list.innerHTML = DAILY_TASKS.map(t => `
    <li class="quest-item ${t.done ? 'done' : ''}">
      <div class="quest-icon">${t.icon}</div>
      <div class="quest-info">
        <div class="quest-title">${t.title}</div>
        <div class="quest-pts">+${t.pts} pts</div>
      </div>
      <div class="quest-check" onclick="toggleQuest(${t.id})"></div>
    </li>
  `).join('');
}

function toggleQuest(id) {
  const quest = DAILY_TASKS.find(t => t.id === id);
  if (!quest) return;
  
  if (!quest.done) {
    quest.done = true;
    addPoints(quest.pts, `Quest: ${quest.title}`);
  } else {
    quest.done = false;
    // Don't subtract points for simplicity, or do it if you want
    STATE.score -= quest.pts;
    updateProfileStats();
  }
  
  renderQuests();
  renderLeaderboard();
  saveUserData();
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  if (!list) return;

  // Update "Me" in leaderboard
  const me = LEADERBOARD.find(u => u.isMe);
  if (me) me.score = STATE.score;

  const sorted = [...LEADERBOARD].sort((a, b) => b.score - a.score);

  list.innerHTML = sorted.map((u, i) => `
    <li class="lb-item ${u.isMe ? 'is-me' : ''}">
      <div class="lb-rank">${i + 1}</div>
      <div class="lb-avatar" style="background:${u.color}">${u.avatar}</div>
      <div class="lb-name">${u.name} ${u.isMe ? '(You)' : ''}</div>
      <div class="lb-score">${u.score.toLocaleString()} pts</div>
    </li>
  `).join('');
}

function addPoints(pts, reason) {
  STATE.score += pts;
  if (reason && pts > 0) {
    showToast(`+${pts} pts! ${reason}`);
  }
  
  // Simple level logic
  STATE.level = Math.floor(STATE.score / 200) + 1;
  
  updateProfileStats();
  saveUserData();
}

function updateProfileStats() {
  const lvlEl = document.getElementById('user-level');
  const scoreEl = document.getElementById('user-score');
  if (lvlEl) lvlEl.textContent = STATE.level;
  if (scoreEl) scoreEl.textContent = STATE.score;
}

// ── SQUAD QUESTS ──────────────────────────────────────────
function renderSquadQuests() {
  const grid = document.getElementById('squad-quests');
  if (!grid) return;

  grid.innerHTML = SQUAD_QUESTS.map(q => {
    const pct = Math.min(100, Math.round((q.current / q.target) * 100));
    return `
      <div class="squad-card glass">
        <div class="squad-head">
          <div class="squad-icon">${q.icon}</div>
          <div class="squad-title">${q.title}</div>
        </div>
        <div class="squad-prog-text">
          <span>$${q.current.toLocaleString()} / $${q.target.toLocaleString()}</span>
          <span>${pct}%</span>
        </div>
        <div class="squad-bar">
          <div class="squad-fill" style="width:${pct}%"></div>
        </div>
        <div class="squad-footer">
          <div class="squad-members">
            ${q.members.map(m => `<div class="squad-avatar" title="${m}">${m.charAt(0)}</div>`).join('')}
          </div>
          <button class="see-all" style="font-size:0.7rem" onclick="showToast('Contribution sent to ${q.title}!')">Contribute</button>
        </div>
      </div>
    `;
  }).join('');
}

