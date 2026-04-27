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

  // Build event lookup
  const evMap = {};
  CAL_EVENTS.forEach(ev => {
    const d = ev.date;
    if (!evMap[d]) evMap[d] = [];
    evMap[d].push(ev);
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
      const hasExpense = evs.some(e => e.type === 'expense');
      d.classList.add(hasIncome && !hasExpense ? 'has-income' : hasExpense ? 'has-expense' : 'has-event');
      d.title = evs.map(e => `${e.title} $${e.amount}`).join(', ');
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

  renderUpcomingEvents();
}

function changeMonth(dir) {
  STATE.calMonth += dir;
  if (STATE.calMonth > 11) { STATE.calMonth = 0; STATE.calYear++; }
  if (STATE.calMonth < 0) { STATE.calMonth = 11; STATE.calYear--; }
  renderCalendar();
}

function showDayEvents(dateStr, evs) {
  if (!evs || evs.length === 0) return;
  showToast(evs.map(e => `${e.title}: $${e.amount}`).join(' | '));
}

function renderUpcomingEvents() {
  const list = document.getElementById('events-list');
  if (!list) return;
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
  const upcoming = [...CAL_EVENTS]
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  list.innerHTML = upcoming.map(ev => {
    const color = ev.type === 'income' ? 'var(--green)' : ev.type === 'expense' ? 'var(--red)' : 'var(--yellow)';
    const sign = ev.type === 'income' ? '+' : '-';
    const d = new Date(ev.date);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `<li class="ev-item">
      <div class="ev-dot" style="background:${color}"></div>
      <div class="ev-info"><div class="ev-title">${ev.title}</div><div class="ev-date">${label}</div></div>
      <div class="ev-amt" style="color:${color}">${sign}$${Math.abs(ev.amount)}</div>
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
