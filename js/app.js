// ── INIT ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
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
  renderAll();
  createBannerRobot();
  createMainRobot();
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
        { id:1, name:'General Savings', emoji:'💰', target:5000, current:0, color:'#4f8ef7' },
        { id:2, name:'Emergency Fund', emoji:'🛡️', target:2000, current:0, color:'#10b981' }
      ],
      GOALS: [],
      BILLS: [],
      INCOME_SCHEDULE: [],
      CAL_EVENTS: [],
      ALERTS: [],
      BADGES: BADGES.map(b => ({...b, earned: false})), // copy badges but set unearned
      CHART_DATA: { week: {labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], income:[0,0,0,0,0,0,0], expense:[0,0,0,0,0,0,0]}, month: {labels:['Jan','Feb','Mar','Apr'], income:[0,0,0,0], expense:[0,0,0,0]} }
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
  if(bCard) bCard.textContent = cardString;
  const bExp = document.getElementById('bc-card-exp');
  if(bExp) bExp.textContent = expString;
  
  const wCheck = document.getElementById('wallet-check-card');
  if(wCheck) wCheck.textContent = cardString.split(' ').slice(-2).join(' '); // e.g. •••• 4291
  
  const speechText = document.getElementById('speech-text');
  if(speechText) speechText.textContent = `Hi ${firstName}! I'm AXIS. Ask me anything about your finances!`;
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
      { id:1, emoji:'💻', title:'New Laptop', target:1000, color:'#7c3aed' },
      { id:2, emoji:'✈️', title:'Summer Trip', target:1200, color:'#f59e0b' }
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

function showApp() {
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  
  // ensure data is loaded
  const user = localStorage.getItem('financeu_user') || 'Alex';
  loadUserData(user);
  
  renderAll();
  createBannerRobot();
  createMainRobot();
  // Ensure chart has width before drawing
  setTimeout(() => drawChart(currentChart), 100);
  setInterval(rotateRobotMessage, 6000);
}

function handleLogout() {
  localStorage.removeItem('financeu_logged_in');
  location.reload();
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
  // Calculate total from checking + all vaults
  const totalSaved = VAULTS.reduce((sum, v) => sum + v.current, 0);
  const totalBalance = STATE.checking + totalSaved;
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
    if(diff < 0) diff += 30;
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
    if(diff < 0) diff += 30;
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
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.classList.toggle('active');
}

// ── DATE ───────────────────────────────────────────────────
function setHeaderDate() {
  const el = document.getElementById('hd-date');
  if (!el) return;
  const d = new Date();
  el.innerHTML = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
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
  
  // Goals now share the General Savings balance
  const savingsVault = VAULTS.find(v => v.name === 'General Savings') || { current: 0 };
  const pool = savingsVault.current;

  grid.innerHTML = GOALS.map(g => {
    const pct = Math.min(100, Math.round(pool / g.target * 100));
    const isDone = pct >= 100;
    
    return `<div class="goal-card glass ${isDone ? 'done-goal' : ''}">
      <div class="goal-emoji">${g.emoji}</div>
      <div class="goal-title-txt">${g.title}</div>
      <div class="goal-prog">$${pool.toLocaleString()} / $${g.target.toLocaleString()}</div>
      <div class="goal-bar"><div class="goal-fill" style="width:${pct}%;background:linear-gradient(90deg,${g.color},#7c3aed)"></div></div>
      <div class="goal-pct">${pct}%</div>
      ${isDone ? `<button class="claim-btn" onclick="claimGoal(${g.id})">Mark as Achieved</button>` : `<div class="goal-date">Target: Ongoing</div>`}
    </div>`;
  }).join('');
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
  list.innerHTML = BILLS.map(b => `<li class="pay-item">
    <div class="pay-icon">${b.icon}</div>
    <div class="pay-info"><div class="pay-name">${b.name}</div><div class="pay-due">Due: ${ordinal(b.day)} of each month</div></div>
    <div class="pay-side">
      <div class="pay-amt">$${b.amount.toFixed(2)}</div>
      <button class="pay-now-btn" onclick="payBill(${b.id})">Pay</button>
    </div>
  </li>`).join('');
}

function renderIncomeSched() {
  const list = document.getElementById('income-sched');
  if (!list) return;
  list.innerHTML = INCOME_SCHEDULE.map(i => `<li class="pay-item">
    <div class="pay-icon">${i.icon}</div>
    <div class="pay-info"><div class="pay-name">${i.name}</div><div class="pay-due">${i.note} — ${ordinal(i.day)}</div></div>
    <div class="pay-amt" style="color:var(--green)">+$${i.amount}</div>
  </li>`).join('');
}

function renderDueSoon() {
  const wrap = document.getElementById('due-soon');
  if (!wrap) return;
  const today = new Date().getDate();
  const sorted = [...BILLS].map(b => {
    let diff = b.day - today;
    if (diff < 0) diff += 30;
    return { ...b, diff };
  }).filter(b => b.diff <= 10).sort((a, b) => a.diff - b.diff);

  wrap.innerHTML = `<div class="due-soon">${sorted.map(b => {
    const cls = b.diff <= 3 ? 'due-urgent' : 'due-warn';
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
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
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
async function askQuestion(q) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;

  msgs.innerHTML += `<div class="msg user">${q}</div>`;
  msgs.scrollTop = msgs.scrollHeight;

  const thinkingId = 'thinking-' + Date.now();
  msgs.innerHTML += `<div class="msg bot" id="${thinkingId}">🤖 AXIS is thinking...</div>`;
  msgs.scrollTop = msgs.scrollHeight;

  let responseText = "";
  let actionData = null;

  try {
    // REAL AI PATH - Call secure backend
    responseText = await callGroq(q);
  } catch (err) {
    console.error(err);
    // LOCAL SMART PATH (Fallback)
    const result = getSmartResponse(q);
    responseText = result.text;
    actionData = result;
  }

  const thinkingEl = document.getElementById(thinkingId);
  if (thinkingEl) {
    let html = `🤖 ${responseText}`;
    if (actionData && actionData.action) {
      html += `<br><button class="ai-action-btn" onclick="${actionData.action}">${actionData.actionText || 'Take me there'}</button>`;
    }
    thinkingEl.innerHTML = html;
  }

  const sp = document.getElementById('speech-text');
  if (sp) sp.textContent = responseText.substring(0, 100) + (responseText.length > 100 ? '...' : '');
  msgs.scrollTop = msgs.scrollHeight;
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
  const nextBill = BILLS.sort((a, b) => a.day - b.day).find(b => b.day >= new Date().getDate()) || BILLS[0];

  // ── NAVIGATION & GUIDANCE ──
  if (ql.includes('how to') || ql.includes('where is') || ql.includes('change') || ql.includes('add')) {
    if (ql.includes('bill')) {
      return {
        text: "To add a bill, navigate to the 'Payments' section and click the '+ Add Bill' button. Or, I can open the menu for you right now!",
        action: "showPage('payments'); openModal('bill-modal')",
        actionText: "Open Add Bill Menu"
      };
    }
    if (ql.includes('vault') || ql.includes('saving')) {
      return {
        text: "You can manage your savings in the 'Savings' tab. You'll see all your vaults there and can create new ones.",
        action: "showPage('savings')",
        actionText: "Go to Savings"
      };
    }
    if (ql.includes('balance') || ql.includes('money')) {
      return {
        text: "Your balance is displayed right on the Dashboard. If you want to add funds, go to the Wallet section.",
        action: "showPage('wallet')",
        actionText: "Go to Wallet"
      };
    }
    if (ql.includes('goal')) {
      return {
        text: "Goals are located in the 'Goals' section. You can track your long-term milestones there!",
        action: "showPage('goals')",
        actionText: "View My Goals"
      };
    }
    return {
      text: "You can navigate using the sidebar on the left. We have Dashboard, Wallet, Savings, Calendar, Payments, and Goals. Which one would you like to see?",
    };
  }

  // ── AUTO-NAVIGATION ──
  if (ql.includes('go to') || ql.includes('show me')) {
    if (ql.includes('wallet')) return { text: "Opening your wallet now...", autoAction: "showPage('wallet')" };
    if (ql.includes('saving')) return { text: "Heading to your savings vaults...", autoAction: "showPage('savings')" };
    if (ql.includes('dashboard')) return { text: "Back to the dashboard!", autoAction: "showPage('dashboard')" };
    if (ql.includes('goal')) return { text: "Checking your goals...", autoAction: "showPage('goals')" };
    if (ql.includes('payment') || ql.includes('bill')) return { text: "Let's look at your bills...", autoAction: "showPage('payments')" };
  }

  // ── DATA ANALYSIS (From previous step) ──
  if (ql.includes('balance') || ql.includes('much money')) {
    return { text: `You have $${STATE.balance.toLocaleString()} available. After your upcoming ${nextBill.name} bill ($${nextBill.amount}), you'll have $${(STATE.balance - nextBill.amount).toLocaleString()} left.` };
  }
  
  if (ql.includes('saving')) {
    return { text: `You've saved $${totalSaved.toLocaleString()} so far! Your "${VAULTS[0].name}" vault is ${Math.round(VAULTS[0].current/VAULTS[0].target*100)}% complete. Keep it up!` };
  }

  if (ql.includes('bill') || ql.includes('due')) {
    return { text: `You have ${BILLS.length} monthly bills totaling $${totalBills.toFixed(2)}. The next one is ${nextBill.name} on the ${ordinal(nextBill.day)}.` };
  }

  if (ql.includes('can i afford') || ql.includes('spend')) {
    const amount = q.match(/\d+/) ? parseInt(q.match(/\d+/)[0]) : 0;
    if (amount > 0) {
      if (amount < STATE.balance * 0.1) return { text: `Yes! $${amount} is less than 10% of your balance. You're safe to spend that.` };
      return { text: `That's $${amount}. It might be tight considering your monthly bills ($${totalBills}). I'd suggest waiting until after your next paycheck.` };
    }
    return { text: "Tell me the amount, and I'll check your budget for you!" };
  }

  return { text: `Looking at your dashboard, everything looks healthy. You have $${STATE.balance.toLocaleString()} and no bills due today. How else can I help?` };
}

// ── MODALS ─────────────────────────────────────────────────
function openModal(id) {
  document.getElementById('modal-bg').classList.remove('hidden');
  document.getElementById(id).classList.remove('hidden');
  if (id === 'vault-modal') renderEmojiPicker();
  if (id === 'recv-modal') renderQR();
  if (id === 'topup-modal') renderTopUpDestinations();
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
  document.getElementById('modal-bg').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function renderEmojiPicker() {
  const emojis = ['🎯','✈️','💻','📚','🎓','🚗','🏠','🎵','🍔','💪','🌴','🎮','💊','👟','📷'];
  const pick = document.getElementById('emoji-pick');
  if (!pick) return;
  pick.innerHTML = emojis.map(e =>
    `<span class="emoji-opt${STATE.selectedEmoji===e?' selected':''}" onclick="selectEmoji('${e}',this)">${e}</span>`
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
  navigator.clipboard.writeText('@alexj.financeu').catch(() => {});
  showToast('ID copied to clipboard!');
}

// ── ADD VAULT ──────────────────────────────────────────────
function addVault() {
  const name = document.getElementById('v-name').value.trim();
  const target = parseFloat(document.getElementById('v-target').value) || 0;
  const current = parseFloat(document.getElementById('v-current').value) || 0;
  if (!name || !target) { showToast('Fill in vault name and target'); return; }
  const colors = ['#4f8ef7','#7c3aed','#10b981','#f59e0b','#ef4444'];
  VAULTS.push({ id: Date.now(), name, emoji: STATE.selectedEmoji, target, current, color: colors[VAULTS.length % colors.length] });
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
  
  saveUserData();
  closeModals();
  renderAll();
  showToast(`Transferred $${amt.toFixed(2)} to ${vault.name}!`);
}

// ── ADD BILL ───────────────────────────────────────────────
function addBill() {
  const name = document.getElementById('b-name').value.trim();
  const amt = parseFloat(document.getElementById('b-amt').value) || 0;
  const day = parseInt(document.getElementById('b-day').value) || 1;
  const cat = document.getElementById('b-cat').value;
  if (!name || !amt) { showToast('Fill in bill details'); return; }
  const icons = { rent:'🏠', food:'🍔', transport:'🚌', subscription:'📱', utilities:'💡', tuition:'🎓', other:'📦' };
  BILLS.push({ id: Date.now(), name, icon: icons[cat] || '📦', amount: amt, day, category: cat });
  saveUserData();
  closeModals();
  renderAll();
  showToast(`Bill "${name}" added!`);
}

// ── ADD GOAL ───────────────────────────────────────────────
function addGoal() {
  const title = document.getElementById('g-title').value.trim();
  const target = parseFloat(document.getElementById('g-target').value) || 0;
  if (!title || !target) { showToast('Fill in goal title and target'); return; }
  const emojis = ['🎓','🚗','🏠','✈️','💼','💍','👶','🏔️'];
  const colors = ['#4f8ef7','#7c3aed','#10b981','#f59e0b'];
  GOALS.push({ 
    id: Date.now(), 
    emoji: emojis[GOALS.length % emojis.length], 
    title, 
    target, 
    color: colors[GOALS.length % colors.length] 
  });
  saveUserData();
  closeModals();
  renderAll();
  showToast(`Goal "${title}" created!`);
}

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}
