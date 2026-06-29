'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, TrendingUp, Clock, CheckCircle, XCircle, RefreshCw, Receipt, ChevronLeft, ChevronRight, Filter, X, User, Calendar, Hash, CreditCard, FileText } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'

const TYPE_COLORS: Record<string, string> = {
  entry_fee: 'bg-green-400/15 text-green-400',
  withdrawal: 'bg-yellow-400/15 text-yellow-400',
  prize: 'bg-neon-purple/15 text-neon-purple',
  deposit: 'bg-neon-blue/15 text-neon-blue',
  refund: 'bg-red-400/15 text-red-400',
  bonus: 'bg-saffron/15 text-saffron',
  referral: 'bg-pink-400/15 text-pink-400',
  adjustment: 'bg-slate-400/15 text-slate-400',
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-400/15 text-green-400',
  pending: 'bg-yellow-400/15 text-yellow-400',
  failed: 'bg-red-400/15 text-red-400',
  reversed: 'bg-orange-400/15 text-orange-400',
}

export default function AdminFinancesPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [txPage, setTxPage] = useState(1)
  const [txPages, setTxPages] = useState(1)
  const [txTotal, setTxTotal] = useState(0)
  const [txType, setTxType] = useState('')
  const [txStatus, setTxStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(false)
  const [selectedTx, setSelectedTx] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const openTxDetail = async (id: string) => {
    setDetailLoading(true)
    setSelectedTx(null)
    try {
      const tx = await adminService.getTransactionDetail(id)
      setSelectedTx(tx)
    } catch { toast.error('Failed to load transaction details') }
    setDetailLoading(false)
  }

  const load = async () => {
    setLoading(true)
    try {
      const [w, a] = await Promise.all([adminService.getPendingWithdrawals(), adminService.getAnalytics()])
      setWithdrawals(w || [])
      setAnalytics(a)
    } catch { toast.error('Failed to load data') }
    setLoading(false)
  }

  const loadTransactions = async (page = 1) => {
    setTxLoading(true)
    try {
      const res = await adminService.getTransactions({ page, type: txType || undefined, status: txStatus || undefined })
      setTransactions(res.data || [])
      setTxPage(res.pagination?.page || 1)
      setTxPages(res.pagination?.pages || 1)
      setTxTotal(res.pagination?.total || 0)
    } catch { toast.error('Failed to load transactions') }
    setTxLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { loadTransactions(1) }, [txType, txStatus])

  const approve = async (id: string) => {
    try {
      await adminService.approveWithdrawal(id)
      toast.success('Withdrawal approved')
      setWithdrawals(w => w.filter(x => x._id !== id))
    } catch { toast.error('Failed to approve') }
  }

  const reject = async (id: string) => {
    try {
      await adminService.rejectWithdrawal(id)
      toast.success('Rejected & refunded')
      setWithdrawals(w => w.filter(x => x._id !== id))
    } catch { toast.error('Failed to reject') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Finances</h1>
          <p className="text-slate-400 text-sm">Revenue, payments and withdrawal management</p>
        </div>
        <button onClick={() => { load(); loadTransactions(txPage) }} className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: analytics?.totalRevenue ? `₹${analytics.totalRevenue.toLocaleString('en-IN')}` : '₹0', sub: 'All entry fees collected', icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Pending Payouts', value: `${withdrawals.length} requests`, sub: 'Awaiting approval', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Total Tournaments', value: analytics?.totalTournaments ?? '—', sub: 'All time', icon: TrendingUp, color: 'text-saffron', bg: 'bg-orange-400/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`font-rajdhani font-bold text-xl ${s.color}`}>{loading ? '...' : s.value}</div>
            <div className="text-white text-sm font-medium mt-1">{s.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* All Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl p-5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-saffron" />
            <h2 className="font-semibold text-white">All Transactions</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-saffron/15 text-saffron">{txTotal} total</span>
          </div>
          <div className="flex gap-2">
            <select value={txType} onChange={e => setTxType(e.target.value)}
              className="text-xs rounded-lg bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 focus:outline-none focus:border-saffron/50">
              <option value="">All Types</option>
              <option value="entry_fee">Entry Fee</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="prize">Prize</option>
              <option value="deposit">Deposit</option>
              <option value="refund">Refund</option>
              <option value="bonus">Bonus</option>
              <option value="referral">Referral</option>
            </select>
            <select value={txStatus} onChange={e => setTxStatus(e.target.value)}
              className="text-xs rounded-lg bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 focus:outline-none focus:border-saffron/50">
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>
        </div>

        {txLoading ? (
          <div className="text-center py-10 text-slate-500">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No transactions found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs border-b border-white/5">
                    <th className="text-left pb-3 font-medium">Date</th>
                    <th className="text-left pb-3 font-medium">User</th>
                    <th className="text-left pb-3 font-medium">Type</th>
                    <th className="text-left pb-3 font-medium">Description</th>
                    <th className="text-right pb-3 font-medium">Amount</th>
                    <th className="text-right pb-3 font-medium">Balance</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {transactions.map((tx: any) => (
                    <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => openTxDetail(tx._id)}>
                      <td className="py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <div className="text-slate-600 text-[10px]">{new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-white text-xs font-medium">{tx.userId?.username || '—'}</div>
                        <div className="text-slate-500 text-[10px]">{tx.userId?.email || ''}</div>
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${TYPE_COLORS[tx.type] || 'bg-slate-400/15 text-slate-400'}`}>
                          {tx.type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300 text-xs max-w-[200px] truncate">
                        {tx.description}
                        {tx.tournamentId?.title && (
                          <div className="text-[10px] text-saffron/70">{tx.tournamentId.title}</div>
                        )}
                      </td>
                      <td className={`py-3 text-right font-rajdhani font-bold text-sm ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right text-xs text-slate-500">
                        ₹{tx.balanceAfter?.toLocaleString('en-IN') ?? '—'}
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[tx.status] || 'bg-slate-400/15 text-slate-400'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-[10px] text-slate-600 max-w-[120px] truncate">
                        {tx.razorpayPaymentId || tx.razorpayOrderId || tx.reference || tx.upiId || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {txPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className="text-xs text-slate-500">Page {txPage} of {txPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => loadTransactions(txPage - 1)} disabled={txPage <= 1}
                    className="p-2 rounded-lg glass-card text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => loadTransactions(txPage + 1)} disabled={txPage >= txPages}
                    className="p-2 rounded-lg glass-card text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {(selectedTx || detailLoading) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => { setSelectedTx(null); setDetailLoading(false) }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[520px] max-h-[80vh] overflow-y-auto glass-card rounded-2xl z-50 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-saffron" /> Transaction Details
                </h3>
                <button onClick={() => { setSelectedTx(null); setDetailLoading(false) }} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {detailLoading ? (
                <div className="text-center py-12 text-slate-500">Loading...</div>
              ) : selectedTx && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03]">
                    <div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${TYPE_COLORS[selectedTx.type] || 'bg-slate-400/15 text-slate-400'}`}>
                        {selectedTx.type?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className={`font-rajdhani font-bold text-2xl ${selectedTx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedTx.amount >= 0 ? '+' : ''}₹{Math.abs(selectedTx.amount).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem icon={<Hash className="w-3.5 h-3.5" />} label="Transaction ID" value={selectedTx._id} mono />
                    <DetailItem icon={<Calendar className="w-3.5 h-3.5" />} label="Date" value={new Date(selectedTx.createdAt).toLocaleString('en-IN')} />
                    <DetailItem icon={<User className="w-3.5 h-3.5" />} label="User" value={selectedTx.userId?.username || '—'} />
                    <DetailItem icon={<FileText className="w-3.5 h-3.5" />} label="Email" value={selectedTx.userId?.email || '—'} />
                  </div>

                  <div className="space-y-2">
                    <DetailRow label="Description" value={selectedTx.description || '—'} />
                    <DetailRow label="Status" value={
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedTx.status] || 'bg-slate-400/15 text-slate-400'}`}>
                        {selectedTx.status}
                      </span>
                    } />
                    <DetailRow label="Balance After" value={selectedTx.balanceAfter != null ? `₹${selectedTx.balanceAfter.toLocaleString('en-IN')}` : '—'} />
                    {selectedTx.tournamentId && (
                      <>
                        <DetailRow label="Tournament" value={selectedTx.tournamentId.title || '—'} highlight />
                        <DetailRow label="Game" value={selectedTx.tournamentId.game?.replace('-', ' ') || '—'} />
                        <DetailRow label="Entry Fee" value={`₹${selectedTx.tournamentId.entryFee || 0}`} />
                        <DetailRow label="Prize Pool" value={`₹${selectedTx.tournamentId.prizePool || 0}`} />
                      </>
                    )}
                    {selectedTx.razorpayOrderId && <DetailRow label="Razorpay Order" value={selectedTx.razorpayOrderId} mono />}
                    {selectedTx.razorpayPaymentId && <DetailRow label="Razorpay Payment" value={selectedTx.razorpayPaymentId} mono />}
                    {selectedTx.razorpaySignature && <DetailRow label="Signature" value={selectedTx.razorpaySignature} mono />}
                    {selectedTx.upiId && <DetailRow label="UPI ID" value={selectedTx.upiId} />}
                    {selectedTx.reference && <DetailRow label="Reference" value={selectedTx.reference} mono />}
                    {selectedTx.processedBy && <DetailRow label="Processed By" value={selectedTx.processedBy.username || selectedTx.processedBy} />}
                    {selectedTx.processedAt && <DetailRow label="Processed At" value={new Date(selectedTx.processedAt).toLocaleString('en-IN')} />}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Withdrawal Requests */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white">Withdrawal Requests</h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-400/15 text-yellow-400">{withdrawals.length} pending</span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading...</div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No pending withdrawals</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-white/5">
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium">Details</th>
                  <th className="text-left pb-3 font-medium">Requested</th>
                  <th className="text-left pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {withdrawals.map(w => (
                  <tr key={w._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 text-white font-medium">{w.userId?.username ?? 'Unknown'}</td>
                    <td className="py-3 text-yellow-400 font-rajdhani font-bold">₹{Math.abs(w.amount).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-slate-400 text-xs">{w.upiId ?? w.description ?? '—'}</td>
                    <td className="py-3 text-slate-400">{new Date(w.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => approve(w._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-400/15 text-green-400 hover:bg-green-400/25 transition-colors">
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button onClick={() => reject(w._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors">
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mb-1">{icon}{label}</div>
      <div className={`text-white text-xs ${mono ? 'font-mono break-all' : ''}`}>{value}</div>
    </div>
  )
}

function DetailRow({ label, value, mono, highlight }: { label: string; value: React.ReactNode; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`text-xs text-right max-w-[60%] ${mono ? 'font-mono break-all text-slate-300' : highlight ? 'text-saffron font-medium' : 'text-white'}`}>{value}</span>
    </div>
  )
}
