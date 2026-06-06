export interface Profile {
  id: string;
  username: string;
  mobile: string;
  password_hash?: string;
  balance: number;
  total_invested: number;
  total_earnings: number;
  role: "user" | "admin";
  device_id: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentPackage {
  id: number;
  name: string;
  investment: number;
  daily_profit: number;
  total_profit: number;
  duration: number;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  proof_url: string;
  status: "pending" | "approved" | "rejected";
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
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

export interface Transaction {
  id: string;
  user_id: string;
  type: "deposit" | "withdrawal" | "investment" | "earning";
  amount: number;
  status: "pending" | "completed" | "rejected";
  method?: string;
  description: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  account_number: string;
  account_name: string;
  method: string;
  status: "pending" | "approved" | "rejected";
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  key: string;
  value: string;
}
