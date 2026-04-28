let STATE = {
  balance: 4285.50,
  checking: 2485.50,
  selectedEmoji: '🎯',
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  score: 450,
  level: 5,
};


let TRANSACTIONS = [
  { id: 1, name: "Amazon - Dorm Decor", category: "shopping", icon: "📦", amount: -85.20, date: "2026-04-27", type: "expense" },
  { id: 2, name: "Scholarship Payout", category: "income", icon: "🎓", amount: 1500.00, date: "2026-04-26", type: "income" },
  { id: 3, name: "Starbucks", category: "food", icon: "☕", amount: -6.45, date: "2026-04-25", type: "expense" },
  { id: 4, name: "Tutoring Income", category: "income", icon: "📚", amount: 120.00, date: "2026-04-24", type: "income" },
  { id: 5, name: "Netflix Subscription", category: "subscription", icon: "📱", amount: -15.99, date: "2026-04-23", type: "expense" },
  { id: 6, name: "Grocery Store", category: "food", icon: "🛒", amount: -42.30, date: "2026-04-22", type: "expense" },
  { id: 7, name: "Part-time Job Pay", category: "income", icon: "💼", amount: 480.00, date: "2026-04-21", type: "income" },
  { id: 8, name: "Campus Bookstore", category: "shopping", icon: "📚", amount: -120.00, date: "2026-04-19", type: "expense" },
  { id: 9, name: "Freelance Design", category: "income", icon: "🎨", amount: 300.00, date: "2026-04-15", type: "income" },
];

let VAULTS = [
  { id: 1, name: "General Savings", emoji: "💰", target: 5000, current: 1800, color: "#4f8ef7" },
  { id: 2, name: "Emergency Fund", emoji: "🛡️", target: 2000, current: 800, color: "#10b981" },
  { id: 3, name: "Travel Fund", emoji: "✈️", target: 1200, current: 450, color: "#f59e0b" },
];

let GOALS = [
  { id: 1, emoji: "💻", title: "New Laptop", target: 1200, current: 0, color: "#7c3aed" },
  { id: 2, emoji: "🎓", title: "Dorm Deposit", target: 500, current: 0, color: "#f59e0b" },
];

let BILLS = [
  { id: 1, name: "Rent / Dorm Fee", icon: "🏠", amount: 800, recurring: true, day: 1, category: "rent" },
  { id: 2, name: "Phone Bill", icon: "📱", amount: 45, recurring: true, day: 15, category: "subscription" },
  { id: 3, name: "Spotify", icon: "🎵", amount: 10.99, recurring: true, day: 20, category: "subscription" },
];

let INCOME_SCHEDULE = [
  { id: 1, name: "Scholarship Payout", icon: "🎓", amount: 1500, recurring: true, day: 18, category: "aid" },
  { id: 2, name: "Part-time Job", icon: "💼", amount: 480, recurring: true, day: 10, category: "job" },
];

let CAL_EVENTS = [
  { id: 4, title: "Tuition Payment", date: "2026-04-27", type: "bill", amount: 2500 },
];




let ALERTS = [
  { id: 1, msg: "Rent due in 3 days", icon: "🏠", urgent: true, when: "2 hours ago" },
  { id: 2, msg: "New Badge: Goal Setter!", icon: "🎖️", urgent: false, when: "5 hours ago" },
  { id: 3, msg: "Scholarship received: $1,500", icon: "💰", urgent: false, when: "1 day ago" },
];

const SAVINGS_TIPS = [
  "Use a student discount for every subscription (Spotify, Apple Music, etc.)",
  "Buy used textbooks or use the library instead of buying new.",
  "Meal prep on Sundays to avoid expensive campus lunches.",
  "Set up an automatic $10 transfer to your 'Emergency Fund' each week.",
  "Check for 'Senior Discounts' or student-only promos at local shops.",
  "Look for graduation grants and smaller scholarships—they add up!",
];

const AXIS_RESPONSES = {
  greeting: (name) => `Hey ${name}! I'm AXIS. Ready to crush your senior year financial goals? 🎓`,
  balance: (bal) => `Your total balance is $${bal.toLocaleString()}. You're looking solid!`,
  bills: () => `You have ${BILLS.length} upcoming bills. Your rent is the biggest one at $800.`,
  savings: () => `You've saved $1,800 in your General Savings vault. You're 36% of the way to your target!`,
  budget: () => `Based on your spending, try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`,
  income: () => `Your income this month: $1,980 from job & scholarships. Great hustle! 🎉`,
  default: (q) => `Great question! Based on your finances, I'd suggest reviewing your ${['savings vaults', 'upcoming bills', 'spending chart'][Math.floor(Math.random() * 3)]}. Want me to explain more?`,
};

const QUICK_QUESTIONS = [
  "When is my scholarship?", "What's my biggest expense?", "Can I afford $100?", "Am I on track for my goals?", "Give me some advice"
];

// ── ROBOT MESSAGES ─────────────────────────────────────────
const ROBOT_MESSAGES = [
  "Rent is due in 3 days! Make sure you have $800 ready.",
  "Your paycheck arrives in 2 days 💸 Time to save some!",
  "You've saved $1,800 this month — amazing progress! 🎉",
  "Don't forget: Spotify renews on the 20th for $10.99",
  "Pro tip: Use the student library to save $100+ on books!",
];

// ── BADGES ─────────────────────────────────────────────────
let BADGES = [
  { name: 'First Save', icon: '💰', earned: true, pts: 100 },
  { name: 'Goal Setter', icon: '🎯', earned: true, pts: 150 },
  { name: 'Bill Master', icon: '🛡️', earned: false, pts: 200 },
  { name: '50% Saved', icon: '📈', earned: false, pts: 300 },
  { name: 'Debt Free', icon: '🕊️', earned: true, pts: 250 },
  { name: '$5K Saved', icon: '💎', earned: false, pts: 500 },
];

// ── DAILY QUESTS ──────────────────────────────────────────
let DAILY_TASKS = [
  { id: 1, title: 'Morning Balance Check', pts: 10, done: true, icon: '☀️' },
  { id: 2, title: 'Review coffee spending', pts: 25, done: false, icon: '☕' },
  { id: 3, title: 'Log a Transaction', pts: 20, done: false, icon: '📝' },
  { id: 4, title: 'Add to Savings Vault', pts: 50, done: false, icon: '🏦' },
];

let SQUAD_QUESTS = [
  { id: 1, title: 'Spring Break Trip', target: 2000, current: 850, members: ['Luis', 'Sarah', 'James'], icon: '🌴' },
  { id: 2, title: 'Graduation Party', target: 500, current: 120, members: ['Luis', 'Emily'], icon: '🎓' },
];

// ── LEADERBOARD ───────────────────────────────────────────
let LEADERBOARD = [
  { name: 'Sarah Miller', score: 1250, avatar: 'SM', color: '#10b981' },
  { name: 'James Wilson', score: 980, avatar: 'JW', color: '#7c3aed' },
  { name: 'Emily Chen', score: 850, avatar: 'EC', color: '#f59e0b' },
  { name: 'Luis Rodriguez', score: 450, avatar: 'LR', color: '#4f8ef7', isMe: true },
  { name: 'Mike Ross', score: 320, avatar: 'MR', color: '#ef4444' },
];


// ── CHARTS ─────────────────────────────────────────────────
let CHART_DATA = {
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    income: [480, 0, 1500, 120, 0, 0, 0],
    expense: [0, 85, 0, 6, 0, 15, 0]
  },
  month: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    income: [480, 300, 1500, 600],
    expense: [100, 200, 85, 150]
  }
};
