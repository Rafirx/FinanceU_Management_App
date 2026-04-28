// ── CALENDAR ───────────────────────────────────────────────
function renderCalendar() {
  const grid = document.getElementById('cal-grid');
  const title = document.getElementById('cal-title');
  if (!grid) return;

  const y = STATE.calYear, m = STATE.calMonth;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  title.textContent = `${months[m]} ${y}`;

  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const today = new Date();

  // Clear and rebuild event lookup
  const evMap = {};

  // 1. Static Events
  CAL_EVENTS.forEach(ev => {
    if (!evMap[ev.date]) evMap[ev.date] = [];
    evMap[ev.date].push(ev);
  });

  // 2. Recurring Bills (Payments)
  BILLS.forEach(b => {
    const isRecurring = b.recurring || (b.day && !b.date);
    if (isRecurring) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`;
      if (!evMap[dateStr]) evMap[dateStr] = [];
      evMap[dateStr].push({ title: b.name, amount: b.amount, type: 'bill', icon: b.icon });
    } else if (b.date) {
      if (!evMap[b.date]) evMap[b.date] = [];
      evMap[b.date].push({ title: b.name, amount: b.amount, type: 'bill', icon: b.icon });
    }
  });

  // 3. Recurring Income
  INCOME_SCHEDULE.forEach(inc => {
    const isRecurring = inc.recurring || (inc.day && !inc.date);
    if (isRecurring) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(inc.day).padStart(2, '0')}`;
      if (!evMap[dateStr]) evMap[dateStr] = [];
      evMap[dateStr].push({ title: inc.name, amount: inc.amount, type: 'income', icon: inc.icon });
    } else if (inc.date) {
      if (!evMap[inc.date]) evMap[inc.date] = [];
      evMap[inc.date].push({ title: inc.name, amount: inc.amount, type: 'income', icon: inc.icon });
    }
  });


  grid.innerHTML = '';

  // Prev month padding
  const prevDays = new Date(y, m, 0).getDate();
  for (let i = first - 1; i >= 0; i--) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.textContent = prevDays - i;
    grid.appendChild(d);
  }

  // Current month days
  for (let day = 1; day <= days; day++) {
    const d = document.createElement('div');
    d.className = 'cal-day';
    d.textContent = day;

    const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const evs = evMap[dateStr];

    if (today.getFullYear() === y && today.getMonth() === m && today.getDate() === day) {
      d.classList.add('today');
    }
    if (evs) {
      const hasIncome = evs.some(e => e.type === 'income');
      const hasExpense = evs.some(e => e.type === 'expense' || e.type === 'bill');

      if (hasIncome) d.classList.add('has-income');
      if (hasExpense) d.classList.add('has-expense');
      
      d.title = evs.map(e => `${e.title} $${e.amount || 0}`).join(', ');


    }

    d.addEventListener('click', () => showDayEvents(dateStr, evs));
    grid.appendChild(d);
  }

  // Fill remaining cells
  const total = first + days;
  const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= remaining; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.textContent = i;
    grid.appendChild(d);
  }
}

function changeMonth(dir) {
  STATE.calMonth += dir;
  if (STATE.calMonth > 11) { STATE.calMonth = 0; STATE.calYear++; }
  if (STATE.calMonth < 0) { STATE.calMonth = 11; STATE.calYear--; }
  renderCalendar();
}

function showDayEvents(dateStr, evs) {
  const modal = document.getElementById('day-events-modal');
  const list = document.getElementById('day-events-list');
  const empty = document.getElementById('day-no-events');
  const title = document.getElementById('day-modal-title');
  
  if (!modal || !list) return;

  // Format title
  const d = new Date(dateStr + 'T00:00:00');
  title.textContent = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  list.innerHTML = '';
  if (!evs || evs.length === 0) {
    empty.classList.remove('hidden');
    list.classList.add('hidden');
  } else {
    empty.classList.add('hidden');
    list.classList.remove('hidden');
    
    list.innerHTML = evs.map(e => {
      const isInc = e.type === 'income';
      const color = isInc ? 'var(--green)' : 'var(--red)';
      const sign = isInc ? '+' : '-';
      return `<li class="day-ev-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--glass-border);">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:8px; height:8px; border-radius:50%; background:${color}"></div>
          <div style="font-weight:600; font-size:0.95rem;">${e.title}</div>
        </div>
        <div style="font-weight:700; color:${color};">${sign}$${Math.abs(e.amount).toFixed(2)}</div>
      </li>`;
    }).join('');
  }

  openModal('day-events-modal');
}

function renderUpcomingEvents() {
  const list = document.getElementById('events-list');
  if (!list) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const todayStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // 1. Get explicit events
  let all = [...CAL_EVENTS].map(e => ({ ...e, source: 'event' }));

  // 2. Add Bills
  BILLS.forEach(b => {
    const isRecurring = b.recurring || (b.day && !b.date);
    if (isRecurring) {
      // Find the next occurrence
      let billDate = new Date(y, m, b.day);
      if (b.day < d) billDate.setMonth(billDate.getMonth() + 1);
      const bStr = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}-${String(billDate.getDate()).padStart(2, '0')}`;
      all.push({ title: b.name, amount: b.amount, date: bStr, type: 'expense', source: 'bill' });
    } else if (b.date >= todayStr) {
      all.push({ title: b.name, amount: b.amount, date: b.date, type: 'expense', source: 'bill' });
    }
  });

  // 3. Add Income
  INCOME_SCHEDULE.forEach(inc => {
    const isRecurring = inc.recurring || (inc.day && !inc.date);
    if (isRecurring) {
      let incDate = new Date(y, m, inc.day);
      if (inc.day < d) incDate.setMonth(incDate.getMonth() + 1);
      const iStr = `${incDate.getFullYear()}-${String(incDate.getMonth() + 1).padStart(2, '0')}-${String(incDate.getDate()).padStart(2, '0')}`;
      all.push({ title: inc.name, amount: inc.amount, date: iStr, type: 'income', source: 'income' });
    } else if (inc.date >= todayStr) {
      all.push({ title: inc.name, amount: inc.amount, date: inc.date, type: 'income', source: 'income' });
    }
  });

  const upcoming = all
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  list.innerHTML = upcoming.map(ev => {
    const isInc = ev.type === 'income';
    const color = isInc ? 'var(--green)' : ev.type === 'expense' ? 'var(--red)' : 'var(--yellow)';
    const sign = isInc ? '+' : '-';
    
    // Format date for display
    const dateObj = new Date(ev.date + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `<li class="ev-item">
      <div class="ev-dot" style="background:${color}"></div>
      <div class="ev-info">
        <div class="ev-title">${ev.title}</div>
        <div class="ev-date">${label} • ${ev.source.charAt(0).toUpperCase() + ev.source.slice(1)}</div>
      </div>
      <div class="ev-amt" style="color:${color}">${sign}$${Math.abs(ev.amount).toFixed(2)}</div>
    </li>`;
  }).join('');
}

function addCalEvent() {
  const title = document.getElementById('ev-title').value.trim();
  const date = document.getElementById('ev-date').value;
  const amt = parseFloat(document.getElementById('ev-amt').value) || 0;
  const type = document.getElementById('ev-type').value;
  if (!title || !date) { showToast('Please fill in all fields'); return; }
  CAL_EVENTS.push({ title, date, amount: amt, type });
  saveUserData();
  closeModals();
  renderCalendar();
  // Also renderAll to sync other pages
  renderAll();
  showToast(`Event "${title}" added!`);
}
