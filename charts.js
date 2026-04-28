// ── SPENDING BAR CHART ─────────────────────────────────────
let currentChart = 'week';
let chartAnimFrame = null;

function updateChartDataFromTransactions() {
  // Reset data
  CHART_DATA.week.income = [0,0,0,0,0,0,0];
  CHART_DATA.week.expense = [0,0,0,0,0,0,0];
  CHART_DATA.month.income = [0,0,0,0];
  CHART_DATA.month.expense = [0,0,0,0];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const now = new Date();
  
  TRANSACTIONS.forEach(t => {
    const d = new Date(t.date);
    const amt = Math.abs(t.amount);
    
    // Weekly (current week)
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    if (diff <= 7) {
      const dayIdx = d.getDay(); // 0 (Sun) to 6 (Sat)
      // Map to labels ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      let labelIdx = dayIdx - 1;
      if (labelIdx === -1) labelIdx = 6;
      
      if (t.type === 'income') CHART_DATA.week.income[labelIdx] += amt;
      else CHART_DATA.week.expense[labelIdx] += amt;
    }
    
    // Monthly (last 4 months)
    const mIdx = d.getMonth();
    const mLabel = months[mIdx];
    const labelPos = CHART_DATA.month.labels.indexOf(mLabel);
    if (labelPos !== -1) {
      if (t.type === 'income') CHART_DATA.month.income[labelPos] += amt;
      else CHART_DATA.month.expense[labelPos] += amt;
    }
  });
}

function drawChart(mode) {
  const canvas = document.getElementById('spend-chart');
  if (!canvas) return;
  
  updateChartDataFromTransactions();

  // Fix: Use the parent container width to cover full box
  const parent = canvas.closest('.card-section');
  let W = parent ? parent.clientWidth - 40 : canvas.offsetWidth;
  if (W <= 0) W = 350;

  const ctx = canvas.getContext('2d');
  const data = CHART_DATA[mode];
  const dpr = window.devicePixelRatio || 1;
  const H = 180;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  const pad = { top: 20, right: 20, bottom: 36, left: 40 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const n = data.labels.length;
  const barW = (cW / n) * 0.35;
  const max = Math.max(...data.income, ...data.expense) * 1.2 || 100;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  const isLight = document.body.classList.contains('light-mode');
  ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + cH - (cH * i / 4);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
    ctx.fillStyle = isLight ? '#1e293b' : 'rgba(136,146,164,0.6)';

    ctx.font = '10px Inter';
    ctx.fillText('$' + Math.round(max * i / 4), 0, y + 4);
  }


  // Bars
  data.labels.forEach((lbl, i) => {
    const x = pad.left + (cW / n) * i + (cW / n) * 0.15;

    // Income bar
    const incH = (data.income[i] / max) * cH;
    const gInc = ctx.createLinearGradient(0, pad.top + cH - incH, 0, pad.top + cH);
    gInc.addColorStop(0, '#4f8ef7');
    gInc.addColorStop(1, 'rgba(79,142,247,0.2)');
    ctx.fillStyle = gInc;
    ctx.beginPath();
    ctx.roundRect(x, pad.top + cH - incH, barW, incH, [4, 4, 0, 0]);
    ctx.fill();

    // Expense bar
    const expH = (data.expense[i] / max) * cH;
    const gExp = ctx.createLinearGradient(0, pad.top + cH - expH, 0, pad.top + cH);
    gExp.addColorStop(0, '#ef4444');
    gExp.addColorStop(1, 'rgba(239,68,68,0.2)');
    ctx.fillStyle = gExp;
    ctx.beginPath();
    ctx.roundRect(x + barW + 3, pad.top + cH - expH, barW, expH, [4, 4, 0, 0]);
    ctx.fill();

    // Label
    ctx.fillStyle = isLight ? '#334155' : 'rgba(136,146,164,0.8)';

    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(lbl, x + barW, H - 8);

  });

  // Legend
  ctx.textAlign = 'left';
  [['4f8ef7', 'Income'], ['ef4444', 'Expense']].forEach(([col, lbl], i) => {
    const lx = pad.left + i * 90;
    ctx.fillStyle = '#' + col;
    ctx.fillRect(lx, 6, 10, 10);
    ctx.fillStyle = isLight ? '#1e293b' : 'rgba(136,146,164,0.9)';

    ctx.font = '11px Inter';
    ctx.fillText(lbl, lx + 14, 15);
  });

}

function switchChart(mode, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  currentChart = mode;
  drawChart(mode);
}

// ── SAVINGS RING CHART ─────────────────────────────────────
function drawRingChart() {
  const canvas = document.getElementById('ring-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const S = 160;
  canvas.width = S; canvas.height = S;
  const cx = S / 2, cy = S / 2, r = 60, lw = 14;
  
  // Total money available for goals
  const savingsVault = VAULTS.find(v => v.name === 'General Savings') || { current: 0 };
  const totalAvailable = savingsVault.current;
  
  // Total needed for all goals
  const totalTarget = GOALS.reduce((sum, g) => sum + g.target, 0);
  
  // Update the center display to show actual total saved
  const totalSavedDisplay = document.getElementById('total-saved-display');
  if (totalSavedDisplay) {
    totalSavedDisplay.textContent = '$' + totalAvailable.toLocaleString();
  }
  
  let angle = -Math.PI / 2;
  ctx.clearRect(0, 0, S, S);

  // Background ring
  const isLight = document.body.classList.contains('light-mode');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  ctx.lineWidth = lw;
  ctx.stroke();


  if (totalTarget > 0) {
    GOALS.forEach(g => {
      // How much of the total pool is "allocated" to this goal
      // In a pooled model, we can visualize how much of the target is covered
      const funded = Math.min(g.target, totalAvailable); 
      // Wait, if we have multiple goals, we should show them as segments of the total pool
      // Actually, let's just show how much of the total pool is "used" by each goal's progress
      const sweep = (Math.min(g.target, totalAvailable) / Math.max(totalTarget, totalAvailable)) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.arc(cx, cy, r, angle, angle + sweep);
      ctx.strokeStyle = g.color;
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.stroke();
      angle += sweep + 0.05;
    });
  } else if (totalAvailable > 0) {
    // Just show a solid ring for General Savings if no goals
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#4f8ef7';
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  // Update breakdown to show GOALS and their current funding status
  const bd = document.getElementById('savings-breakdown');
  if (bd) {
    let html = `
      <div class="s-item">
        <div class="s-dot" style="background:#4f8ef7"></div>
        <span>💰 General Savings</span>
        <span style="margin-left:auto;font-weight:600">$${totalAvailable.toLocaleString()}</span>
      </div>`;
      
    html += GOALS.map(g => {
      const funded = Math.min(g.target, totalAvailable);
      return `
      <div class="s-item">
        <div class="s-dot" style="background:${g.color}"></div>
        <span>${g.emoji} ${g.title}</span>
        <span style="margin-left:auto;font-weight:600">$${funded.toLocaleString()} / $${g.target.toLocaleString()}</span>
      </div>`;
    }).join('');
    
    bd.innerHTML = html;
  }
}
