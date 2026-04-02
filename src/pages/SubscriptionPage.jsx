import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSubscription, createPaymentOrder, verifyPayment,
  getPaymentHistory, cancelSubscription
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Crown, Zap, Star, CheckCircle, ArrowLeft, Clock, CreditCard,
  AlertCircle, Loader, XCircle, Shield, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const PLANS = {
  free: {
    name: 'Free',
    icon: '📚',
    color: 'from-slate-500 to-gray-600',
    bgCard: 'bg-white border-slate-200',
    doubts: 15,
    price: { monthly: 0, quarterly: 0, yearly: 0 },
    features: [
      '15 doubts/month',
      'Knowledge Base access',
      'Basic answer support',
      'View all subjects',
      'Community Q&A',
      'Email notifications',
    ],
    notIncluded: ['Priority response', 'File uploads', 'Dedicated tutor'],
  },
  premium: {
    name: 'Premium',
    icon: '⚡',
    color: 'from-indigo-500 to-purple-600',
    bgCard: 'bg-white border-indigo-300 ring-2 ring-indigo-500',
    doubts: 100,
    price: { monthly: 299, quarterly: 749, yearly: 2499 },
    features: [
      '100 doubts/month',
      'Priority tutor matching',
      'File & image uploads',
      'Advanced search',
      'Faster responses',
      'Email + chat support',
      'Knowledge Base access',
    ],
    notIncluded: ['Dedicated tutor'],
    popular: true,
  },
  pro: {
    name: 'Pro',
    icon: '👑',
    color: 'from-amber-500 to-orange-600',
    bgCard: 'bg-white border-amber-300',
    doubts: 'Unlimited',
    price: { monthly: 599, quarterly: 1499, yearly: 4999 },
    features: [
      'Unlimited doubts/month',
      'Instant priority matching',
      'Dedicated tutor',
      'File & image uploads',
      '24/7 priority support',
      'Analytics dashboard',
      'Response time guarantee',
      'Knowledge Base access',
    ],
    notIncluded: [],
  },
};

const DURATIONS = [
  { key: 'monthly', label: 'Monthly', discount: null },
  { key: 'quarterly', label: 'Quarterly', discount: 'Save 17%' },
  { key: 'yearly', label: 'Yearly', discount: 'Save 30%' },
];

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [activeTab, setActiveTab] = useState('plans');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, payRes] = await Promise.allSettled([
        getSubscription(),
        getPaymentHistory(),
      ]);
      if (subRes.status === 'fulfilled') {
        setSubscription(subRes.value.data.subscription || null);
      }
      if (payRes.status === 'fulfilled') {
        setPayments(payRes.value.data.payments || []);
      }
    } catch (err) {
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType) => {
    if (planType === 'free') return;
    setError('');
    setProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError('Payment system failed to load. Check your internet connection.');
        setProcessing(false);
        return;
      }
      const { data } = await createPaymentOrder({ planType, duration: selectedDuration });
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!keyId) {
        setError('Razorpay key not configured. Add VITE_RAZORPAY_KEY_ID to your .env file.');
        setProcessing(false);
        return;
      }
      const options = {
        key: keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'Smart Doubts Platform',
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan — ${selectedDuration}`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            setSuccessMsg(`🎉 Payment successful! You are now on the ${planType} plan.`);
            await fetchData();
            setTimeout(() => setSuccessMsg(''), 6000);
          } catch (err) {
            setError('Payment verification failed. Contact support with your payment ID.');
          } finally {
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#4f46e5' },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your subscription? You will revert to the free plan immediately.')) return;
    try {
      setError('');
      await cancelSubscription({ reason: 'User initiated cancellation' });
      setSuccessMsg('Subscription cancelled. You have been moved to the free plan.');
      await fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const currentPlan = subscription?.planType || 'free';
  const daysLeft = subscription?.endDate
    ? Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-10">
          <button
            onClick={() => navigate('/student')}
            className="flex items-center gap-2 text-indigo-300 hover:text-white mb-8 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Unlock Full Potential
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-3">
              Choose Your Plan
            </h1>
            <p className="text-indigo-200 text-lg max-w-xl mx-auto">
              Get more doubts resolved, faster responses, and exclusive features with premium plans.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-900/50 border border-green-500/50 text-green-200 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Current Plan Banner */}
        {subscription && subscription.status === 'active' && (
          <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 rounded-2xl px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-indigo-300" />
              <div>
                <p className="text-indigo-200 text-sm">Current Plan</p>
                <p className="text-white font-bold text-lg">{PLANS[currentPlan]?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-indigo-200 text-sm">
              <Clock className="w-4 h-4" />
              <span>{daysLeft} days remaining</span>
            </div>
            <button
              onClick={handleCancel}
              className="text-red-300 hover:text-red-200 text-sm font-medium flex items-center gap-1 transition"
            >
              <XCircle className="w-4 h-4" />
              Cancel Subscription
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-white/10 p-1 rounded-xl w-fit">
          {['plans', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium text-sm capitalize transition ${
                activeTab === tab ? 'bg-white text-slate-900' : 'text-indigo-200 hover:text-white'
              }`}
            >
              {tab === 'history' ? 'Payment History' : 'Plans'}
            </button>
          ))}
        </div>

        {activeTab === 'plans' && (
          <>
            {/* Duration Selector */}
            <div className="flex justify-center">
              <div className="inline-flex bg-white/10 p-1 rounded-xl gap-1">
                {DURATIONS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setSelectedDuration(d.key)}
                    className={`relative px-5 py-2.5 rounded-lg font-medium text-sm transition ${
                      selectedDuration === d.key
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-indigo-200 hover:text-white'
                    }`}
                  >
                    {d.label}
                    {d.discount && (
                      <span className="ml-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {d.discount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Cards */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader className="w-10 h-10 animate-spin text-indigo-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(PLANS).map(([key, plan]) => {
                  const price = plan.price[selectedDuration];
                  const isCurrentPlan = currentPlan === key && subscription?.status === 'active';
                  const isDowngrade = key === 'free' && currentPlan !== 'free';

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Object.keys(PLANS).indexOf(key) * 0.1 }}
                      className={`relative bg-white rounded-3xl overflow-hidden shadow-xl border-2 flex flex-col ${
                        plan.popular ? 'border-indigo-400 scale-[1.02]' : 'border-slate-100'
                      } hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}
                    >
                      {plan.popular && (
                        <div className={`bg-gradient-to-r ${plan.color} text-white text-center py-2 text-sm font-bold`}>
                          ⭐ Most Popular
                        </div>
                      )}
                      <div className={`bg-gradient-to-br ${plan.color} text-white px-6 py-6`}>
                        <div className="text-4xl mb-2">{plan.icon}</div>
                        <h3 className="text-2xl font-extrabold mb-1">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                          {price === 0 ? (
                            <span className="text-4xl font-black">Free</span>
                          ) : (
                            <>
                              <span className="text-lg">₹</span>
                              <span className="text-4xl font-black">{price.toLocaleString('en-IN')}</span>
                              <span className="text-white/70 text-sm">/{selectedDuration.replace('ly', '')}</span>
                            </>
                          )}
                        </div>
                        <p className="text-white/80 text-sm mt-1">{plan.doubts} doubts / month</p>
                      </div>

                      <div className="px-6 py-5 flex-1 flex flex-col">
                        <ul className="space-y-2.5 mb-6 flex-1">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                          {plan.notIncluded.map((f, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-sm text-slate-400">
                              <XCircle className="w-4 h-4 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        {isCurrentPlan ? (
                          <div className="w-full py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-center font-semibold">
                            ✓ Current Plan
                          </div>
                        ) : key === 'free' ? (
                          <div className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 text-center font-medium text-sm">
                            Always Free
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpgrade(key)}
                            disabled={processing}
                            className={`w-full py-3 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 bg-gradient-to-r ${plan.color} hover:opacity-90 disabled:opacity-50`}
                          >
                            {processing ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {processing ? 'Processing...' : isDowngrade ? 'Choose Plan' : 'Upgrade Now'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              {[
                { icon: Shield, label: 'Secure Payments via Razorpay' },
                { icon: CheckCircle, label: 'Cancel anytime' },
                { icon: Star, label: '100% satisfaction guarantee' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-indigo-300 text-sm">
                  <badge.icon className="w-4 h-4" />
                  {badge.label}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                Payment History
              </h3>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-indigo-400" /></div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-indigo-300">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No payment history yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Date', 'Plan', 'Amount', 'Status', 'Payment ID'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-indigo-300 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="px-4 py-3 text-white">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className="capitalize text-indigo-200 font-medium">{p.planType}</span>
                        </td>
                        <td className="px-4 py-3 text-white font-bold">₹{p.amount?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            p.paymentStatus === 'success' ? 'bg-green-500/20 text-green-300' :
                            p.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-indigo-300 font-mono text-xs">{p.paymentId || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
