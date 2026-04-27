// ── APP STATE ──────────────────────────────────────────────
let STATE = {
  balance: 4285.50,
  checking: 2485.50,
  selectedEmoji: '🎯',
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
};

// ── TRANSACTIONS ───────────────────────────────────────────
let TRANSACTIONS = [
  { id:1, name:'Part-time Job', category:'income', icon:'💼', amount:920, date:'2026-04-22', type:'income' },
  { id:2, name:'Grocery Store', category:'food', icon:'🛒', amount:-64.20, date:'2026-04-21', type:'expense' },
  { id:3, name:'Financial Aid', category:'income', icon:'🎓', amount:500, date:'2026-04-20', type:'income' },
  { id:4, name:'Spotify', category:'subscription', icon:'🎵', amount:-9.99, date:'2026-04-19', type:'expense' },
  { id:5, name:'Bus Pass', category:'transport', icon:'🚌', amount:-45, date:'2026-04-18', type:'expense' },
  { id:6, name:'Dining Hall', category:'food', icon:'🍱', amount:-120, date:'2026-04-17', type:'expense' },
  { id:7, name:'Freelance Design', category:'income', icon:'🎨', amount:420, date:'2026-04-15', type:'income' },
  { id:8, name:'Netflix', category:'subscription', icon:'🎬', amount:-15.99, date:'2026-04-14', type:'expense' },
  { id:9, name:'Phone Bill', category:'utilities', icon:'📱', amount:-55, date:'2026-04-13', type:'expense' },
  { id:10, name:'Tutoring Income', category:'income', icon:'📚', amount:200, date:'2026-04-10', type:'income' },
  { id:11, name:'Rent Payment', category:'rent', icon:'🏠', amount:-800, date:'2026-04-01', type:'expense' },
  { id:12, name:'Electric Bill', category:'utilities', icon:'💡', amount:-48, date:'2026-04-03', type:'expense' },
];

// ── VAULTS (Accounts) ──────────────────────────────────────
let VAULTS = [
  { id:1, name:'General Savings', emoji:'💰', target:5000, current:1000, color:'#4f8ef7' },
  { id:2, name:'Emergency Fund', emoji:'🛡️', target:2000, current:600, color:'#10b981' },
];

// ── GOALS (Targets that share the Savings balance) ─────────
let GOALS = [
  { id:1, emoji:'🎓', title:'Graduate Debt-Free', target:5000, color:'#4f8ef7' },
  { id:2, emoji:'🚗', title:'Buy a Used Car', target:3500, color:'#7c3aed' },
  { id:3, emoji:'💻', title:'New MacBook', target:1299, color:'#10b981' },
  { id:4, emoji:'✈️', title:'Study Abroad Fund', target:2500, color:'#f59e0b' },
];

// ── BILLS ──────────────────────────────────────────────────
let BILLS = [
  { id:1, name:'Rent', icon:'🏠', amount:800, day:1, category:'rent' },
  { id:2, name:'Phone Bill', icon:'📱', amount:55, day:13, category:'utilities' },
  { id:3, name:'Netflix', icon:'🎬', amount:15.99, day:14, category:'subscription' },
  { id:4, name:'Spotify', icon:'🎵', amount:9.99, day:19, category:'subscription' },
  { id:5, name:'Internet', icon:'🌐', amount:49.99, day:8, category:'utilities' },
  { id:6, name:'Gym Membership', icon:'🏋️', amount:29.99, day:5, category:'other' },
];

// ── INCOME SCHEDULE ────────────────────────────────────────
let INCOME_SCHEDULE = [
  { name:'Part-time Job Paycheck', icon:'💼', amount:920, day:22, note:'Bi-weekly' },
  { name:'Financial Aid Disbursement', icon:'🎓', amount:500, day:20, note:'Monthly' },
  { name:'Tutoring Sessions', icon:'📚', amount:200, day:15, note:'Monthly' },
];

// ── CALENDAR EVENTS ────────────────────────────────────────
let CAL_EVENTS = [
  { title:'Rent Due', date:`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-01`, amount:800, type:'expense' },
  { title:'Paycheck', date:`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-22`, amount:920, type:'income' },
  { title:'Netflix Renewal', date:`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-14`, amount:15.99, type:'expense' },
  { title:'Financial Aid', date:`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-20`, amount:500, type:'income' },
  { title:'Phone Bill', date:`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-13`, amount:55, type:'expense' },
];

// ── ALERTS ─────────────────────────────────────────────────
let ALERTS = [
  { icon:'🔴', msg:'Rent $800 due in 3 days!', when:'May 1st', urgent:true },
  { icon:'🟡', msg:'Phone bill $55 due in 8 days', when:'May 13th', urgent:false },
  { icon:'🟢', msg:'Paycheck $920 arriving in 2 days', when:'April 22nd', urgent:false },
  { icon:'💡', msg:'You saved 47% of income this month!', when:'Tip', urgent:false },
  { icon:'🎯', msg:'New Laptop goal is 65% complete!', when:'Goal', urgent:false },
];

// ── SAVINGS TIPS ───────────────────────────────────────────
const SAVINGS_TIPS = [
  'Cook at home 4x/week to save ~$120/month on dining.',
  'Use student discounts — Spotify, Apple, Adobe all offer them.',
  'Auto-transfer $50 every paycheck to your emergency fund.',
  'Track subscriptions monthly — cancel unused ones.',
  'Buy used textbooks or rent them to save up to 80%.',
  'Apply for FAFSA and local scholarships every semester.',
];

// ── CHAT RESPONSES ─────────────────────────────────────────
const CHAT_RESPONSES = {
  balance: () => `Your current balance is $${STATE.balance.toLocaleString()}. You're in good shape! 💚`,
  savings: () => `You have $1,800 saved across ${VAULTS.length} vaults. Your top goal is graduating debt-free!`,
  bills: () => `You have ${BILLS.length} recurring bills totaling $${BILLS.reduce((a,b)=>a+b.amount,0).toFixed(2)}/month.`,
  budget: () => `Based on your spending, try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`,
  income: () => `Your income this month: $1,840 from job, financial aid & tutoring. Great hustle! 🎉`,
  default: (q) => `Great question! Based on your finances, I'd suggest reviewing your ${['savings vaults','upcoming bills','spending chart'][Math.floor(Math.random()*3)]}. Want me to explain more?`,
};

const QUICK_QUESTIONS = [
  "What's my balance?","How much have I saved?","What bills are due?","Give me a budget tip","How's my income?",
];

// ── ROBOT MESSAGES ─────────────────────────────────────────
const ROBOT_MESSAGES = [
  "Rent is due in 3 days! Make sure you have $800 ready.",
  "Your paycheck arrives in 2 days 💸 Time to save some!",
  "You've saved $877 this month — amazing progress! 🎉",
  "Don't forget: Netflix renews on the 14th for $15.99",
  "Pro tip: Cook at home this week to save $30+!",
];

// ── BADGES ─────────────────────────────────────────────────
let BADGES = [
  { icon:'💰', name:'First Save', earned:true },
  { icon:'🎯', name:'Goal Setter', earned:true },
  { icon:'📅', name:'Bill Master', earned:true },
  { icon:'🚀', name:'50% Saved', earned:false },
  { icon:'🏆', name:'Debt Free', earned:false },
  { icon:'💎', name:'$5K Saved', earned:false },
];

// ── SPENDING CHART DATA ────────────────────────────────────
let CHART_DATA = {
  week: {
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    income:[0,0,200,0,920,0,0],
    expense:[64,0,120,46,0,85,30],
  },
  month: {
    labels:['Jan','Feb','Mar','Apr'],
    income:[1200,1640,1500,1840],
    expense:[1050,920,1100,963],
  },
};
