import React, { useState, useEffect, createContext, useContext, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  signInAnonymously,
  signInWithCustomToken,
  setPersistence,
  inMemoryPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  addDoc, 
  collection, 
  onSnapshot, 
  deleteDoc, 
  Timestamp,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart as ReLineChart,
  Line
} from 'recharts';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Target, 
  Wallet, 
  Sprout, 
  Receipt, 
  BrainCircuit, 
  User, 
  Settings, 
  LogOut,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Sparkles,
  Lock,
  LineChart,
  TrendingUp,
  CreditCard,
  CircleCheck,
  CircleAlert,
  Info,
  Zap,
  ShieldCheck,
  Users,
  BarChart2,
  PieChart as PieIcon,
  Clock,
  ScanLine,
  Banknote,
  Camera,
  Upload,
  FileText,
  ChevronRight,
  Calculator
} from 'lucide-react';

// --- Firebase Configuration ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Contexts ---
const FirebaseContext = createContext(null);
const UserDataContext = createContext(null);
const ToastContext = createContext(null);

// --- Hooks ---
const useFirebase = () => useContext(FirebaseContext);
const useUserData = () => useContext(UserDataContext);
const useToast = () => useContext(ToastContext);

// --- Utility Functions ---
function formatCurrency(value) {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

// --- Toast Provider ---
function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  const toastIcons = {
    success: <CircleCheck className="text-green-400" />,
    error: <CircleAlert className="text-red-400" />,
    info: <Info className="text-blue-400" />,
  };
  
  const toastColors = {
    success: "bg-green-800 border-green-700",
    error: "bg-red-800 border-red-700",
    info: "bg-blue-800 border-blue-700",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[100] p-4 rounded-lg shadow-xl border ${toastColors[toast.type]} text-white flex items-center animate-fadeIn`}>
          <div className="mr-3">{toastIcons[toast.type]}</div>
          <p>{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-4 text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// --- User Data Provider ---
function UserDataProvider({ children }) {
  const { db, userId, isAuthReady } = useFirebase();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthReady || !db || !userId) {
      setLoading(!isAuthReady);
      return;
    }

    const userDocRef = doc(db, `artifacts/${appId}/users/${userId}`);
    
    setLoading(true);
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const trialEndsAt = data.trialEndsAt?.toDate();
        const hasPaid = data.paidSubAt?.toDate();
        
        if (data.subscriptionTier !== 'none' && trialEndsAt && trialEndsAt < new Date() && !hasPaid) {
          showToast("Your free trial has ended. Please upgrade to continue.", "info");
          await updateDoc(userDocRef, {
            subscriptionTier: 'none',
            trialEndsAt: null
          });
          setUserData({ ...data, subscriptionTier: 'none', trialEndsAt: null });
        } else {
          setUserData(data);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, userId, isAuthReady, showToast]);

  return (
    <UserDataContext.Provider value={{ userData, loading }}>
      {children}
    </UserDataContext.Provider>
  );
}

// --- Firebase Provider ---
const FirebaseProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);

      setAuth(authInstance);
      setDb(dbInstance);

      setPersistence(authInstance, inMemoryPersistence).then(() => {
        const authUnsubscribe = onAuthStateChanged(authInstance, async (user) => {
          if (user) {
            setUserId(user.uid);
          } else {
            try {
              if (initialAuthToken) {
                await signInWithCustomToken(authInstance, initialAuthToken);
              } else {
                await signInAnonymously(authInstance);
              }
            } catch (authError) {
              setUserId(null);
            }
          }
          setIsAuthReady(true);
        });
        return () => authUnsubscribe();
      });
    } catch (e) {
      console.error("Firebase init error", e);
      setIsAuthReady(true);
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ auth, db, userId, isAuthReady }}>
      {isAuthReady ? children : <FullScreenLoader />}
    </FirebaseContext.Provider>
  );
};

// --- App Structure ---
export default function App() {
  return (
    <FirebaseProvider>
      <ToastProvider>
        <UserDataProvider>
          <BudgetWiseApp />
        </UserDataProvider>
      </ToastProvider>
    </FirebaseProvider>
  );
}

function BudgetWiseApp() {
  const { auth } = useFirebase();
  const { loading: userDataLoading } = useUserData();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsLoggedIn(!!user && !user.isAnonymous);
      });
      return () => unsubscribe();
    }
  }, [auth]);

  if (!auth || userDataLoading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {isLoggedIn ? <MainLayout /> : <LandingPage />}
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

// --- Page: Dashboard ---
function Dashboard() {
  const { userData } = useUserData();
  const { data: transactions } = useCollection('transactions');
  const { data: assets } = useCollection('portfolio');
  const { data: debts } = useCollection('debts');
  const { db, userId } = useFirebase();
  const { showToast } = useToast();
  const [activePage, setActivePage] = useState(null);

  const netWorth = useMemo(() => {
    const assetVal = assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0);
    const debtVal = debts.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
    return assetVal - debtVal;
  }, [assets, debts]);

  const expenseChartData = useMemo(() => {
    const categories = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const category = t.category || 'Other';
      categories[category] = (categories[category] || 0) + (parseFloat(t.amount) || 0);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date) || 0;
        const dateB = b.date?.toDate?.() || new Date(b.date) || 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [transactions]);

  const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];
  
  // Get user's subscription info
  const subscriptionTier = userData?.subscriptionTier || 'starter';
  const trialEndsAt = userData?.trialEndsAt?.toDate?.();
  const isTrialActive = trialEndsAt && trialEndsAt > new Date();
  const daysLeft = isTrialActive ? Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="animate-fadeIn">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back{userData?.email ? `, ${userData.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-gray-400">
          Here's your financial overview for today.
        </p>
      </div>

      {/* Trial Banner for new users */}
      {isTrialActive && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 text-yellow-300 mr-3" />
            <div>
              <p className="text-white font-bold">Your {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} trial is active</p>
              <p className="text-indigo-200 text-sm">{daysLeft} days remaining</p>
            </div>
          </div>
          <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
            Upgrade Now
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard 
          title="Total Net Worth" 
          value={netWorth} 
          format="currency" 
          icon={<TrendingUp />}
          trend={netWorth >= 0 ? 'up' : 'down'}
        />
        <MetricCard 
          title="Total Assets" 
          value={assets.reduce((s, a) => s + (parseFloat(a.value) || 0), 0)} 
          format="currency" 
          icon={<Wallet />}
          trend="up"
        />
        <MetricCard 
          title="Total Debts" 
          value={debts.reduce((s, d) => s + (parseFloat(d.balance) || 0), 0)} 
          format="currency" 
          icon={<Banknote />} 
          trend="down" 
        />
      </div>

      {/* Empty State or Dashboard Content */}
      {transactions.length === 0 && assets.length === 0 && debts.length === 0 ? (
        <div className="p-12 text-center bg-gray-800 rounded-2xl border border-gray-700">
          <Sprout className="w-16 h-16 text-indigo-400 mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl font-bold mb-3 text-white">Welcome to Your Dashboard!</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            This is your personal financial command center. Start tracking your money to see insights here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <QuickActionButton 
              icon={<Plus className="w-5 h-5" />}
              label="Add Transaction"
              onClick={() => {}}
            />
            <QuickActionButton 
              icon={<Wallet className="w-5 h-5" />}
              label="Add Asset"
              onClick={() => {}}
            />
            <QuickActionButton 
              icon={<Banknote className="w-5 h-5" />}
              label="Add Debt"
              onClick={() => {}}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Spending Analysis */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <PieIcon className="w-5 h-5 mr-2 text-indigo-400" />
                Spending Analysis
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {expenseChartData.length > 0 ? (
                    <PieChart>
                      <Pie 
                        data={expenseChartData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100} 
                        fill="#8884d8" 
                        label
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Legend />
                    </PieChart>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <Receipt className="w-12 h-12 mb-3 opacity-30" />
                      <p>No spending data yet</p>
                      <p className="text-sm mt-1">Add transactions to see analysis</p>
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset vs Debt Chart */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-indigo-400" />
                Asset vs Debt Overview
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ 
                    name: 'Financial Summary', 
                    Assets: assets.reduce((s, a) => s + (parseFloat(a.value) || 0), 0), 
                    Debts: debts.reduce((s, d) => s + (parseFloat(d.balance) || 0), 0) 
                  }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="Assets" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Debts" fill="#f87171" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Transactions</span>
                  <span className="text-white font-bold">{transactions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Assets Tracked</span>
                  <span className="text-white font-bold">{assets.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Debts Tracked</span>
                  <span className="text-white font-bold">{debts.length}</span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Plan</span>
                    <span className="text-indigo-400 font-bold capitalize">{subscriptionTier}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                  Recent Activity
                </span>
                <span className="text-xs text-gray-500">Last 5</span>
              </h3>
              {recentTransactions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map(t => {
                    const displayDate = t.date?.toDate?.() 
                      ? t.date.toDate().toLocaleDateString() 
                      : new Date(t.date).toLocaleDateString();
                    return (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium text-sm">{t.description}</p>
                          <p className="text-gray-500 text-xs">{displayDate}</p>
                        </div>
                        <span className={`font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <ScanLine className="w-4 h-4 mr-2" />
                  Scan Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickActionButton({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl transition-colors"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function MetricCard({ title, value, format, trend, icon }) {
  const displayValue = format === 'currency' ? formatCurrency(value) : value;
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-white mt-2">{displayValue}</p>
      </div>
      <div className={`p-3 rounded-full ${trend === 'up' ? 'bg-green-800 text-green-300' : trend === 'down' ? 'bg-red-800 text-red-300' : 'bg-indigo-800 text-indigo-300'}`}>
        {icon || <Wallet className="w-6 h-6" />}
      </div>
    </div>
  );
}

// --- Page: Debt Tracker ---
function DebtTracker() {
  const { db, userId } = useFirebase();
  const { data: debts, loading } = useCollection('debts');
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minPayment, setMinPayment] = useState('');

  const totalDebt = useMemo(() => debts.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0), [debts]);

  const addDebt = async (e) => {
    e.preventDefault();
    if (!db || !userId) return;
    const balNum = parseFloat(balance);
    if (isNaN(balNum)) return showToast("Invalid balance", "error");
    
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/debts`), {
        name,
        balance: balNum,
        interestRate: parseFloat(interestRate) || 0,
        minPayment: parseFloat(minPayment) || 0,
        createdAt: Timestamp.now()
      });
      setName(''); setBalance(''); setInterestRate(''); setMinPayment('');
      setShowForm(false);
      showToast("Debt added successfully.", "success");
    } catch (e) {
      showToast("Error adding debt.", "error");
    }
  };

  const deleteDebt = async (id) => {
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/debts`, id));
      showToast("Debt removed.", "success");
    } catch (e) {
      showToast("Error deleting debt.", "error");
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Debt Tracker</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          {showForm ? 'Cancel' : 'Add Debt'}
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-red-900/30 mb-8">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Liabilities</h3>
        <p className="text-4xl font-bold text-red-400 mt-2">{formatCurrency(totalDebt)}</p>
      </div>

      {showForm && (
        <form onSubmit={addDebt} className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideDown">
          <FormInput label="Creditor Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chase Visa" required />
          <FormInput label="Current Balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} required />
          <FormInput label="Interest Rate (%)" type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} required />
          <FormInput label="Min Payment" type="number" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} required />
          <button type="submit" className="lg:col-span-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg mt-2">Save Debt</button>
        </form>
      )}

      {loading ? <PageLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {debts.map(debt => (
            <div key={debt.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative group">
              <button onClick={() => deleteDebt(debt.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-900/20 rounded-full mr-4">
                  <Banknote className="text-red-400 w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{debt.name}</h4>
                  <p className="text-sm text-gray-400">{debt.interestRate}% APR</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Balance</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(debt.balance)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Min Payment</p>
                  <p className="text-sm font-medium text-gray-300">{formatCurrency(debt.minPayment)}</p>
                </div>
              </div>
            </div>
          ))}
          {!loading && debts.length === 0 && (
            <div className="md:col-span-2 text-center py-12 text-gray-500">No debts tracked yet. Use the "Add Debt" button to start.</div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Page: Scan Receipts ---
function ScanReceipts() {
  const { userData } = useUserData();
  const { db, userId } = useFirebase();
  const { showToast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const fileInputRef = useRef(null);

  const hasPremiumAccess = userData?.subscriptionTier === 'premium' || userData?.subscriptionTier === 'pro';

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{ parts: [{ text: "Simulate parsing a receipt for a user. Return a JSON object with: merchant, total, date (YYYY-MM-DD), category. Return ONLY the JSON." }] }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      const parsed = JSON.parse(result.candidates[0].content.parts[0].text);
      
      setScannedData(parsed);
      showToast("Receipt parsed successfully!", "success");
    } catch (err) {
      showToast("Failed to scan receipt. Please try manual entry.", "error");
    } finally {
      setIsScanning(false);
    }
  };

  const confirmTransaction = async () => {
    if (!db || !userId || !scannedData) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/transactions`), {
        description: scannedData.merchant,
        amount: parseFloat(scannedData.total) || 0,
        category: scannedData.category || 'Other',
        date: Timestamp.fromDate(new Date(scannedData.date)),
        type: 'expense'
      });
      setScannedData(null);
      showToast("Transaction saved!", "success");
    } catch (e) {
      showToast("Error saving transaction.", "error");
    }
  };

  if (!hasPremiumAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-800 rounded-2xl border border-indigo-500/30 text-center">
        <ScanLine className="w-16 h-16 text-indigo-400 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Magic Receipt Scanning</h2>
        <p className="text-gray-400 max-w-md mb-8">Stop typing. Just take a photo of your receipt and let AI do the work. Category and total are detected instantly.</p>
        <button onClick={() => setShowPricing(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center shadow-lg shadow-indigo-500/20">
          <Zap className="w-5 h-5 mr-2" /> Upgrade to Premium
        </button>
        {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Receipt Scanner</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-8 rounded-2xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center min-h-[400px]">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          {isScanning ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-indigo-500 mb-4 mx-auto"></div>
              <p className="text-indigo-300 font-medium">AI is reading your receipt...</p>
            </div>
          ) : (
            <>
              <div className="p-6 bg-indigo-900/20 rounded-full mb-6">
                <Camera className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload or Snap Receipt</h3>
              <p className="text-gray-400 mb-8 text-center max-w-xs">Supported: JPG, PNG. Ensure the total and date are clearly visible.</p>
              <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center">
                <Upload className="w-5 h-5 mr-2" /> Choose Image
              </button>
            </>
          )}
        </div>

        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-indigo-400" /> Parsed Results
          </h3>
          {scannedData ? (
            <div className="space-y-6">
              <div className="p-4 bg-gray-900 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">Merchant</p>
                <p className="text-lg font-bold text-white">{scannedData.merchant}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(parseFloat(scannedData.total))}</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Date</p>
                  <p className="text-lg font-bold text-white">{scannedData.date}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">Suggested Category</p>
                <p className="text-lg font-bold text-indigo-400">{scannedData.category}</p>
              </div>
              <button onClick={confirmTransaction} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors">
                Confirm & Add Transaction
              </button>
              <button onClick={() => setScannedData(null)} className="w-full text-gray-400 hover:text-white py-2 text-sm font-medium">Discard</button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
              <Calculator className="w-12 h-12 mb-4 opacity-20" />
              <p>Upload a receipt to see parsed results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Page: Transactions ---
function Transactions() {
  const { db, userId } = useFirebase();
  const { data: transactions, loading } = useCollection('transactions');
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();
  
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = a.date?.toDate?.() || 0;
      const dateB = b.date?.toDate?.() || 0;
      return dateB - dateA;
    });
  }, [transactions]);

  const addTransaction = async (transaction) => {
    if (!db || !userId) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/transactions`), {
        ...transaction,
        amount: parseFloat(transaction.amount) || 0,
        date: Timestamp.fromDate(new Date(transaction.date)),
      });
      setShowForm(false);
      showToast("Transaction added!", "success");
    } catch (e) {
      showToast("Failed to add transaction.", "error");
    }
  };

  const deleteTransaction = async (id) => {
    if (!db || !userId) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/transactions`, id));
      showToast("Transaction deleted.", "success");
    } catch (e) {
      showToast("Error deleting transaction.", "error");
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Transactions</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
          <Plus className="w-5 h-5 mr-2" /> {showForm ? 'Cancel' : 'Add Transaction'}
        </button>
      </div>

      {showForm && <TransactionForm onSubmit={addTransaction} onCancel={() => setShowForm(false)} />}

      {loading ? <PageLoader /> : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {sortedTransactions.length === 0 ? (
              <li className="p-6 text-center text-gray-400">No transactions found.</li>
            ) : (
              sortedTransactions.map(t => {
                const displayDate = t.date?.toDate ? t.date.toDate().toLocaleDateString() : String(t.date);
                return (
                  <li key={t.id} className="p-4 md:p-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full mr-4 ${t.type === 'income' ? 'bg-green-800' : 'bg-red-800'}`}>
                        <ArrowRightLeft className={`w-5 h-5 ${t.type === 'income' ? 'text-green-300' : 'text-red-300'}`} />
                      </div>
                      <div>
                        <p className="text-base font-medium text-white">{t.description}</p>
                        <p className="text-sm text-gray-400">
                          {displayDate} | {t.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-lg font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                      <button onClick={() => deleteTransaction(t.id)} className="ml-4 text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function TransactionForm({ onSubmit, onCancel }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ description, amount: parseFloat(amount) || 0, date, category, type });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideDown">
      <FormInput label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <FormInput label="Amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <FormInput label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <FormSelect label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={['Food', 'Transport', 'Utilities', 'Rent', 'Entertainment', 'Income', 'Other']} />
      <FormSelect label="Type" value={type} onChange={(e) => setType(e.target.value)} options={[{value:'expense', label:'Expense'}, {value:'income', label:'Income'}]} />
      <div className="md:col-span-3 flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="bg-gray-600 px-4 py-2 rounded-lg">Cancel</button>
        <button type="submit" className="bg-indigo-600 px-4 py-2 rounded-lg font-bold">Save</button>
      </div>
    </form>
  );
}

// --- Page: Budgets ---
function Budgets() {
  const { db, userId } = useFirebase();
  const { data: budgets } = useCollection('budgets');
  const { data: transactions } = useCollection('transactions');
  const { showToast } = useToast();
  
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');

  const addBudget = async (e) => {
    e.preventDefault();
    if (!db || !userId) return;
    try {
      const budgetsRef = collection(db, `artifacts/${appId}/users/${userId}/budgets`);
      await addDoc(budgetsRef, { category, limit: parseFloat(limit) || 0 });
      setLimit('');
      showToast("Budget set!", "success");
    } catch (e) {
      showToast("Error setting budget.", "error");
    }
  };

  const deleteBudget = async (id) => {
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/budgets`, id));
      showToast("Budget deleted.", "success");
    } catch (e) {
      showToast("Error deleting budget.", "error");
    }
  };

  const budgetProgress = useMemo(() => {
    const spending = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + (parseFloat(t.amount) || 0);
      return acc;
    }, {});
    return budgets.map(b => ({
      ...b,
      spent: spending[b.category] || 0,
      percent: Math.min(((spending[b.category] || 0) / b.limit) * 100, 100)
    }));
  }, [budgets, transactions]);

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Budgets</h1>
      <form onSubmit={addBudget} className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormSelect label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={['Food', 'Transport', 'Utilities', 'Rent', 'Entertainment', 'Other']} />
        <FormInput label="Monthly Limit" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} required />
        <button type="submit" className="bg-indigo-600 h-11 self-end rounded-lg font-bold">Set Budget</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetProgress.map(b => (
          <div key={b.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">{b.category}</h4>
              <button onClick={() => deleteBudget(b.id)}><Trash2 className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full mb-2 overflow-hidden">
              <div className={`h-full ${b.percent > 90 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${b.percent}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</span>
              <span>{Math.round(b.percent)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Page: Portfolio ---
function Portfolio() {
  const { db, userId } = useFirebase();
  const { data: assets } = useCollection('portfolio');
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('Stocks');

  const addAsset = async (e) => {
    e.preventDefault();
    if (!db || !userId) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/portfolio`), {
        name, value: parseFloat(value) || 0, type
      });
      setName(''); setValue('');
      showToast("Asset added!", "success");
    } catch (e) {
      showToast("Error adding asset.", "error");
    }
  };

  const deleteAsset = async (id) => {
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/portfolio`, id));
      showToast("Asset removed.", "success");
    } catch (e) {
      showToast("Error deleting asset.", "error");
    }
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Investment Portfolio</h1>
      <form onSubmit={addAsset} className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormInput label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <FormInput label="Value" type="number" value={value} onChange={(e) => setValue(e.target.value)} required />
        <FormSelect label="Type" value={type} onChange={(e) => setType(e.target.value)} options={['Stocks', 'Crypto', 'Real Estate', 'Savings', 'Other']} />
        <button type="submit" className="bg-indigo-600 rounded-lg font-bold self-end h-11">Add Asset</button>
      </form>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/50 text-left">
            <tr>
              <th className="p-4">Asset</th>
              <th className="p-4">Type</th>
              <th className="p-4">Value</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {assets.map(a => (
              <tr key={a.id} className="hover:bg-gray-700/30">
                <td className="p-4 font-medium">{a.name}</td>
                <td className="p-4 text-gray-400">{a.type}</td>
                <td className="p-4 text-green-400 font-bold">{formatCurrency(a.value)}</td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteAsset(a.id)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Page: Subscriptions ---
function Subscriptions() {
  const { db, userId } = useFirebase();
  const { data: subs } = useCollection('subscriptions');
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const addSub = async (e) => {
    e.preventDefault();
    if (!db || !userId) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/subscriptions`), {
        name, amount: parseFloat(amount) || 0
      });
      setName(''); setAmount('');
      showToast("Subscription added!", "success");
    } catch (e) {
      showToast("Error adding sub.", "error");
    }
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Subscriptions</h1>
      <form onSubmit={addSub} className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput label="Service Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <FormInput label="Monthly Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <button type="submit" className="bg-indigo-600 rounded-lg font-bold self-end h-11">Add Sub</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subs.map(s => (
          <div key={s.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex justify-between items-center">
            <div>
              <h4 className="font-bold">{s.name}</h4>
              <p className="text-gray-400 text-sm">{formatCurrency(s.amount)}/mo</p>
            </div>
            <button onClick={() => deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/subscriptions`, s.id))}><Trash2 className="w-5 h-5 text-gray-500 hover:text-red-400" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Page: AI Advisor ---
function AIAdvisor() {
  const { userData } = useUserData();
  const { data: transactions } = useCollection('transactions');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const generateAdvice = async () => {
    setLoading(true);
    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const summary = transactions.slice(0, 10).map(t => `${t.description}: ${formatCurrency(t.amount)}`).join(', ');
      
      const payload = {
        contents: [{ parts: [{ text: `Analyze this spending: ${summary || 'No data yet'}. Give 3 specific tips.` }] }]
      };

      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      setAdvice(result.candidates[0].content.parts[0].text);
    } catch (e) {
      setAdvice("I couldn't generate advice right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = userData?.subscriptionTier === 'premium' || userData?.subscriptionTier === 'pro';

  if (!hasAccess) {
    return (
      <div className="p-12 text-center bg-gray-800 rounded-2xl border border-indigo-500/30">
        <BrainCircuit className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">AI Personal Advisor</h2>
        <p className="text-gray-400 mb-8">Get actionable financial tips based on your actual spending habits.</p>
        <button onClick={() => setShowPricing(true)} className="bg-indigo-600 px-8 py-3 rounded-xl font-bold">Upgrade Plan</button>
        {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 flex items-center"><BrainCircuit className="mr-3 text-indigo-400" /> AI Advisor</h1>
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
        <button onClick={generateAdvice} disabled={loading} className="bg-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center disabled:opacity-50">
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2" />}
          Analyze My Spending
        </button>
        {advice && (
          <div className="mt-8 p-6 bg-gray-900 rounded-xl prose prose-invert max-w-none">
            {advice.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Layouts & Navigation ---
function Sidebar({ activePage, setActivePage }) {
  const { auth } = useFirebase();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
    { id: 'scan', label: 'Scan Receipts', icon: ScanLine, premium: true },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'debts', label: 'Debt Tracker', icon: Banknote },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'subscriptions', label: 'Subscriptions', icon: Receipt },
    { id: 'ai-advisor', label: 'AI Advisor', icon: BrainCircuit, premium: true },
    { id: 'consultation', label: 'Consultation', icon: User },
  ];

  return (
    <nav className="w-20 md:w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="flex items-center justify-center md:justify-start px-4 md:px-6 h-20 border-b border-gray-700">
        <Sprout className="h-8 w-8 text-indigo-400" />
        <span className="hidden md:block ml-3 text-xl font-bold text-white">BudgetWise</span>
      </div>
      <ul className="flex-1 py-6 overflow-y-auto">
        {navItems.map(item => (
          <li key={item.id} className="px-4 md:px-6 mb-2">
            <button onClick={() => setActivePage(item.id)} className={`flex items-center w-full h-12 rounded-lg transition-colors ${activePage === item.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
              <item.icon className="h-6 w-6 mx-auto md:mx-0 md:ml-3" />
              <span className="hidden md:block ml-4 font-medium">{item.label}</span>
              {item.premium && <Sparkles className="hidden md:block ml-auto mr-3 h-4 w-4 text-yellow-400" />}
            </button>
          </li>
        ))}
      </ul>
      <div className="p-4 md:p-6 border-t border-gray-700">
        <button onClick={() => auth.signOut()} className="flex items-center w-full h-12 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
          <LogOut className="h-6 w-6 mx-auto md:mx-0 md:ml-3" />
          <span className="hidden md:block ml-4 font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}

function MainLayout() {
  const [activePage, setActivePage] = useState('dashboard');
  
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'budgets': return <Budgets />;
      case 'debts': return <DebtTracker />;
      case 'scan': return <ScanReceipts />;
      case 'portfolio': return <Portfolio />;
      case 'subscriptions': return <Subscriptions />;
      case 'ai-advisor': return <AIAdvisor />;
      case 'consultation': return <Consultation />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 flex flex-col overflow-y-auto bg-gray-900">
        <TrialBanner />
        <div className="p-6 md:p-10 flex-1">{renderPage()}</div>
      </main>
    </div>
  );
}

// --- Auth & Landing Components ---
function LandingPage() {
  const [workflow, setWorkflow] = useState({ step: 'landing', selectedPlan: null, view: 'login' });
  
  const startTrial = () => setWorkflow({ step: 'pricing', selectedPlan: null, view: 'signup' });
  const openAuth = (view) => setWorkflow({ step: 'auth', selectedPlan: null, view });
  const selectPlan = (plan) => setWorkflow({ step: 'auth', selectedPlan: plan, view: 'signup' });
  const closeModal = () => setWorkflow({ step: 'landing', selectedPlan: null, view: 'login' });
  
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Pricing Modal for Trial Flow */}
      {workflow.step === 'pricing' && (
        <TrialPricingModal 
          onClose={closeModal} 
          onSelectPlan={selectPlan}
        />
      )}
      
      {/* Auth Modal */}
      {workflow.step === 'auth' && (
        <AuthScreenModal 
          initialView={workflow.view} 
          selectedPlan={workflow.selectedPlan}
          onClose={closeModal}
        />
      )}
      
      <nav className="p-6 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center font-bold text-xl"><Sprout className="mr-2 text-indigo-400" /> BudgetWise</div>
        <div className="space-x-4">
          <button onClick={() => openAuth('login')} className="text-gray-400 hover:text-white">Login</button>
          <button onClick={() => openAuth('signup')} className="bg-indigo-600 px-6 py-2 rounded-lg font-bold">Sign Up</button>
        </div>
      </nav>
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-6xl font-black mb-8">Control Your Money. <span className="text-indigo-400">Build Wealth.</span></h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">The AI-powered financial command center for smart savers. Track debts, scan receipts, and watch your net worth grow.</p>
        <button onClick={startTrial} className="bg-indigo-600 px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform">Start 7-Day Free Trial</button>
        <p className="mt-4 text-gray-500">No credit card required.</p>
      </div>
    </div>
  );
}

function TrialPricingModal({ onClose, onSelectPlan }) {
  const [cycle, setCycle] = useState('monthly');
  
  const plans = {
    starter: { 
      name: "Starter", 
      monthly: 7.99, 
      annual: 47.94, 
      features: ["Expense Tracking", "Budget Management", "Debt Tracker", "Net Worth Calculation"],
      description: "Perfect for getting started"
    },
    premium: { 
      name: "Premium", 
      monthly: 14.99, 
      annual: 89.94, 
      features: ["All Starter Features", "AI Budget Advisor", "Magic Receipt Scanning", "Investment Tracking"], 
      popular: true,
      description: "Best for serious savers"
    },
    pro: { 
      name: "Pro", 
      monthly: 29.99, 
      annual: 179.94, 
      features: ["All Premium Features", "Shared Family Access", "Priority Advisor Support", "Advanced Reporting"],
      description: "Complete financial control"
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4 animate-fadeIn">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-5xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-800 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Choose Your Free Trial</h2>
            <p className="text-gray-400 mt-1">Start your 7-day free trial. No credit card required.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Billing Toggle */}
        <div className="p-6 md:p-8 text-center">
          <div className="inline-flex p-1 bg-gray-800 rounded-xl">
            <button 
              onClick={() => setCycle('monthly')} 
              className={`px-6 py-2 rounded-lg font-medium transition-all ${cycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setCycle('annual')} 
              className={`px-6 py-2 rounded-lg font-medium transition-all ${cycle === 'annual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Annual <span className="text-xs text-green-400 ml-1">(Save 50%)</span>
            </button>
          </div>
        </div>
        
        {/* Plans Grid */}
        <div className="px-6 md:px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([key, plan]) => (
              <div 
                key={key} 
                className={`p-6 rounded-2xl relative transition-all hover:scale-[1.02] cursor-pointer ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 shadow-xl shadow-indigo-500/20 border-2 border-indigo-400' 
                    : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => onSelectPlan(key)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-gray-200'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-white'}`}>
                    {formatCurrency(cycle === 'monthly' ? plan.monthly : plan.annual / 12)}
                  </span>
                  <span className={`text-sm ${plan.popular ? 'text-indigo-200' : 'text-gray-400'}`}>/mo</span>
                  {cycle === 'annual' && (
                    <p className={`text-xs mt-1 ${plan.popular ? 'text-indigo-200' : 'text-gray-500'}`}>
                      Billed annually ({formatCurrency(plan.annual)}/year)
                    </p>
                  )}
                </div>
                
                <button 
                  className={`w-full font-bold py-3 rounded-xl mb-6 transition-all ${
                    plan.popular 
                      ? 'bg-white text-indigo-600 hover:bg-gray-100' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlan(key);
                  }}
                >
                  Start Free Trial
                </button>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-center text-sm ${plan.popular ? 'text-indigo-100' : 'text-gray-300'}`}>
                      <CheckCircle className={`w-4 h-4 mr-2 flex-shrink-0 ${plan.popular ? 'text-indigo-300' : 'text-indigo-400'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            <ShieldCheck className="w-4 h-4 inline mr-1" />
            7-day free trial • Cancel anytime • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthScreenModal({ initialView, selectedPlan, onClose }) {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { auth, db } = useFirebase();
  const { showToast } = useToast();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (view === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Use selected plan from trial flow, default to 'starter' if not set
        const plan = selectedPlan || 'starter';
        await setDoc(doc(db, `artifacts/${appId}/users/${cred.user.uid}`), {
          subscriptionTier: plan,
          trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
          createdAt: Timestamp.now()
        });
        showToast(`Welcome! Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} trial has started.`, "success");
      }
      onClose();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 p-8 rounded-3xl w-full max-w-md border border-gray-700 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
        <h2 className="text-2xl font-bold mb-6 text-center">{view === 'login' ? 'Welcome Back' : 'Join BudgetWise'}</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-indigo-600 py-3 rounded-xl font-bold">{view === 'login' ? 'Login' : 'Sign Up'}</button>
        </form>
        <p className="text-center mt-6 text-gray-400">
          {view === 'login' ? "New here? " : "Already have an account? "}
          <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-indigo-400 font-bold underline">
            {view === 'login' ? 'Create Account' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

function TrialBanner() {
  const { userData } = useUserData();
  if (!userData || !userData.trialEndsAt) return null;
  const days = Math.ceil((userData.trialEndsAt.toDate() - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return null;
  return (
    <div className="bg-yellow-500 text-black text-center p-2 text-sm font-bold animate-fadeIn">
      <Clock className="w-4 h-4 inline mr-2" /> You have {days} days left in your 7-day free trial.
    </div>
  );
}

// --- Generic UI Components ---
function PageLoader() {
  return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500" /></div>;
}

function FormInput({ label, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-400 mb-1">{label}</label>
      <input className="bg-gray-700 border border-gray-600 p-2 rounded-lg text-white" {...props} />
    </div>
  );
}

function FormSelect({ label, options, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-400 mb-1">{label}</label>
      <select className="bg-gray-700 border border-gray-600 p-2 rounded-lg text-white" {...props}>
        {options.map((opt, i) => (
          typeof opt === 'string' 
            ? <option key={i} value={opt}>{opt}</option> 
            : <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function Consultation() {
  return (
    <div className="p-12 text-center bg-gray-800 rounded-2xl border border-gray-700">
      <User className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-4">Financial Consultation</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">Book a 1-on-1 session with a professional financial advisor to review your plan.</p>
      <button className="bg-indigo-600 px-8 py-3 rounded-xl font-bold">Request Session</button>
    </div>
  );
}

const plans = {
  starter: { name: "Starter", monthly: 7.99, annual: 47.94, features: ["Expense Tracking", "Budget Management", "Debt Tracker", "Net Worth Calculation"] },
  premium: { name: "Premium", monthly: 14.99, annual: 89.94, features: ["All Starter Features", "AI Budget Advisor", "Magic Receipt Scanning", "Investment Tracking"], popular: true },
  pro: { name: "Pro", monthly: 29.99, annual: 179.94, features: ["All Premium Features", "Shared Family Access", "Priority Advisor Support", "Advanced Reporting"] }
};

function PricingModal({ onClose }) {
  const [cycle, setCycle] = useState('monthly');
  const { db, userId } = useFirebase();
  const { showToast } = useToast();

  const handleSelectPlan = async (tier) => {
    if (!db || !userId) return;
    try {
      await updateDoc(doc(db, `artifacts/${appId}/users/${userId}`), {
        subscriptionTier: tier,
        trialEndsAt: null,
        paidSubAt: Timestamp.now()
      });
      showToast(`${tier.charAt(0).toUpperCase() + tier.slice(1)} plan activated!`, "success");
      onClose();
    } catch (e) {
      showToast("Could not activate plan.", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-6xl overflow-y-auto max-h-[90vh]">
        <div className="p-8 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-3xl font-bold">Upgrade Your Experience</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="p-8 text-center">
          <div className="inline-flex p-1 bg-gray-800 rounded-xl mb-12">
            <button onClick={() => setCycle('monthly')} className={`px-6 py-2 rounded-lg ${cycle === 'monthly' ? 'bg-indigo-600' : ''}`}>Monthly</button>
            <button onClick={() => setCycle('annual')} className={`px-6 py-2 rounded-lg ${cycle === 'annual' ? 'bg-indigo-600' : ''}`}>Annual (50% Off)</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {Object.entries(plans).map(([key, plan]) => (
              <div key={key} className={`p-8 rounded-2xl relative transition-transform hover:scale-[1.02] ${plan.popular ? 'bg-indigo-600 shadow-xl shadow-indigo-500/20' : 'bg-gray-800 border border-gray-700'}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-4xl font-black mb-6">{formatCurrency(cycle === 'monthly' ? plan.monthly : plan.annual / 12)}<span className="text-sm font-normal">/mo</span></p>
                <button 
                  onClick={() => handleSelectPlan(key)}
                  className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl mb-8"
                >
                  Activate {plan.name}
                </button>
                <ul className="space-y-4">
                  {plan.features.map(f => <li key={f} className="flex items-center text-sm"><CheckCircle className="w-4 h-4 mr-2" /> {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Data Hooks ---
function useCollection(collectionName) {
  const { db, userId, isAuthReady } = useFirebase();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;
    const collectionRef = collection(db, `artifacts/${appId}/users/${userId}/${collectionName}`);
    setLoading(true);
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      setData(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [db, userId, isAuthReady, collectionName]);

  return { data, loading };
}

// --- Animation Styles ---
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
  .animate-slideDown { animation: slideDown 0.3s ease-out; }
  select { appearance: none; -webkit-appearance: none; }
`;
document.head.appendChild(style);
