export interface InvestmentPackage {
  id: number;
  name: string;
  investment: number;
  dailyProfit: number;
  totalProfit: number;
  duration: number;
  color: string;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "investment" | "earning";
  amount: number;
  status: "pending" | "completed" | "rejected";
  method?: string;
  description: string;
  created_at: string;
}

export interface UserInvestment {
  id: string;
  package_id: number;
  package_name: string;
  amount: number;
  daily_profit: number;
  total_profit: number;
  duration: number;
  days_completed: number;
  status: "active" | "completed";
  started_at: string;
  last_earning_at: string;
}

export interface User {
  username: string;
  mobile: string;
  balance: number;
  total_invested: number;
  total_earnings: number;
  investments: UserInvestment[];
  transactions: Transaction[];
  created_at: string;
  role: "user" | "admin";
}

export const INVESTMENT_PACKAGES: InvestmentPackage[] = [
  {
    id: 1,
    name: "Starter",
    investment: 280,
    dailyProfit: 60,
    totalProfit: 3900,
    duration: 65,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: 2,
    name: "Basic",
    investment: 680,
    dailyProfit: 170,
    totalProfit: 11050,
    duration: 65,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 3,
    name: "Bronze",
    investment: 1280,
    dailyProfit: 320,
    totalProfit: 20800,
    duration: 65,
    color: "from-teal-500 to-cyan-600",
  },
  {
    id: 4,
    name: "Silver",
    investment: 1880,
    dailyProfit: 470,
    totalProfit: 30550,
    duration: 65,
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: 5,
    name: "Gold",
    investment: 2980,
    dailyProfit: 745,
    totalProfit: 48425,
    duration: 65,
    color: "from-amber-500 to-yellow-600",
  },
  {
    id: 6,
    name: "Platinum",
    investment: 4350,
    dailyProfit: 1095,
    totalProfit: 71175,
    duration: 65,
    color: "from-yellow-500 to-orange-600",
  },
  {
    id: 7,
    name: "Diamond",
    investment: 6380,
    dailyProfit: 1620,
    totalProfit: 105300,
    duration: 65,
    color: "from-orange-500 to-red-600",
  },
  {
    id: 8,
    name: "Elite",
    investment: 9780,
    dailyProfit: 2440,
    totalProfit: 158600,
    duration: 65,
    color: "from-rose-500 to-pink-600",
  },
  {
    id: 9,
    name: "Crown",
    investment: 16680,
    dailyProfit: 4270,
    totalProfit: 277550,
    duration: 65,
    color: "from-purple-500 to-violet-600",
  },
];

export const CONTACT_NUMBER = "03043310635";
export const JAZZCASH_NUMBER = "03043310635";
export const ACCOUNT_NAME = "Muhammad Salman";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Investment Plans", href: "/#plans" },
  { label: "About", href: "/#features" },
  { label: "Contact", href: "/#contact" },
];

export const DASHBOARD_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Investment Plans", href: "/dashboard/invest", icon: "TrendingUp" },
  { label: "Deposit", href: "/dashboard/deposit", icon: "Wallet" },
  { label: "Withdraw", href: "/dashboard/withdraw", icon: "ArrowDownLeft" },
  { label: "My Earnings", href: "/dashboard/earnings", icon: "Coins" },
  { label: "History", href: "/dashboard/history", icon: "History" },
  { label: "Profile", href: "/dashboard/profile", icon: "User" },
];

export const WHY_CHOOSE_US = [
  {
    title: "Secure System",
    description: "Encrypted transactions and safe funds with 256-bit SSL security",
    icon: "Shield",
  },
  {
    title: "Fast Withdraw",
    description: "24-hour automated withdrawal processing directly to your account",
    icon: "Zap",
  },
  {
    title: "Daily Profits",
    description: "Earn consistent daily returns on your investment automatically",
    icon: "TrendingUp",
  },
  {
    title: "Expert Support",
    description: "Round-the-clock dedicated assistance from our professional team",
    icon: "Headphones",
  },
  {
    title: "Flexible Plans",
    description: "Choose from 9 investment packages tailored to your goals",
    icon: "Layers",
  },
  {
    title: "Proven Track Record",
    description: "Trusted by thousands of investors across Pakistan",
    icon: "Award",
  },
];
