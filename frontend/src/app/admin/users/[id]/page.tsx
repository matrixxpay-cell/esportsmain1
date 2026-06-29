'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Mail, Phone, Calendar, Globe, Trophy, Wallet, Shield, ShieldOff, CheckCircle, XCircle, Clock, IndianRupee, Gamepad2 } from 'lucide-react'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  completed: 'text-green-400 bg-green-400/10',
  ongoing: 'text-red-400 bg-red-400/10',
  upcoming: 'text-yellow-400 bg-yellow-400/10',
  registration_open: 'text-blue-400 bg-blue-400/10',
  cancelled: 'text-slate-400 bg-slate-400/10',
}

const TX_TYPE_COLORS: Record<string, string> = {
  deposit: 'text-green-400',
  prize: 'text-green-400',
  bonus: 'text-green-400',
  referral: 'text-green-400',
  refund: 'text-blue-400',
  withdrawal: 'text-red-400',
  entry_fee: 'text-red-400',
}

export default function UserDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'tournaments' | 'transactions'>('tournaments')

  useEffect(() => {
    adminService.getUserDetail(id as string)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { toast.error('Failed to load user'); setLoading(false) })
  }, [id])

  const toggleBan = async () => {
    if (!data?.user) return
    try {
      if (data.user.isBanned) {
        await adminService.unbanUser(data.user._id)
        setData((d: any) => ({ ...d, user: { ...d.user, isBanned: false } }))
        toast.success('User unbanned')
      } else {
        const reason = prompt('Ban reason:')
        if (!reason) return
        await adminService.banUser(data.user._id, reason)
        setData((d: any) => ({ ...d, user: { ...d.user, isBanned: true, banReason: reason } }))
        toast.success('User banned')
      }
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>
  if (!data) return <div className="text-center py-20 text-slate-500">User not found</div>

  const { user, wallet, tournaments, transactions } = data

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/users" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="gaming-heading text-xl">User Details</h1>
          <p className="text-slate-400 text-sm">{user.username}</p>
        </div>
        <button onClick={toggleBan}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            user.isBanned ? 'bg-green-400/10 text-green-400 hover:bg-green-400/20' : 'bg-red-400/10 text-red-400 hover:bg-red-400/20'
          }`}>
          {user.isBanned ? <><ShieldOff className="w-4 h-4" /> Unban</> : <><Shield className="w-4 h-4" /> Ban</>}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Info */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-saffron" /> Profile
            </h3>
            <div className="space-y-3">
              <InfoRow icon={<User className="w-4 h-4" />} label="Username" value={user.username} />
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={user.phone} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined" value={new Date(user.createdAt).toLocaleString('en-IN')} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-IN') : 'Never'} />
              <InfoRow icon={<Globe className="w-4 h-4" />} label="Last IP" value={user.lastLoginIp || 'N/A'} />
              <InfoRow icon={<Globe className="w-4 h-4" />} label="Registration IP" value={user.registrationIp || 'N/A'} />
              <InfoRow icon={<CheckCircle className="w-4 h-4" />} label="Referral Code" value={user.referralCode || 'N/A'} />
              <div className="flex gap-2 pt-2">
                {user.isVerified ? (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-400/10 text-green-400">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-400">
                    <XCircle className="w-3 h-3" /> Unverified
                  </span>
                )}
                {user.isBanned && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-400/10 text-red-400">
                    Banned: {user.banReason}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Wallet & Stats */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-neon-blue" /> Wallet
              </h3>
              {wallet ? (
                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="Balance" value={`₹${wallet.balance?.toFixed(2)}`} color="text-white" />
                  <StatBox label="Bonus" value={`₹${wallet.bonusBalance?.toFixed(2)}`} color="text-neon-blue" />
                  <StatBox label="Deposited" value={`₹${wallet.totalDeposited?.toFixed(2)}`} color="text-green-400" />
                  <StatBox label="Withdrawn" value={`₹${wallet.totalWithdrawn?.toFixed(2)}`} color="text-red-400" />
                  <StatBox label="Won" value={`₹${wallet.totalWon?.toFixed(2)}`} color="text-yellow-400" />
                  <StatBox label="Spent" value={`₹${wallet.totalSpent?.toFixed(2)}`} color="text-saffron" />
                </div>
              ) : <p className="text-slate-500 text-sm">No wallet</p>}
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" /> Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Played" value={user.stats?.tournamentsPlayed || 0} color="text-white" />
                <StatBox label="Won" value={user.stats?.tournamentsWon || 0} color="text-yellow-400" />
                <StatBox label="Earnings" value={`₹${user.stats?.totalEarnings || 0}`} color="text-green-400" />
                <StatBox label="Points" value={user.stats?.points || 0} color="text-neon-purple" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setTab('tournaments')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'tournaments' ? 'bg-saffron/20 text-saffron' : 'text-slate-400 hover:text-white'}`}>
            <Gamepad2 className="w-4 h-4 inline mr-1.5" />Tournaments ({tournaments?.length || 0})
          </button>
          <button onClick={() => setTab('transactions')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'transactions' ? 'bg-saffron/20 text-saffron' : 'text-slate-400 hover:text-white'}`}>
            <IndianRupee className="w-4 h-4 inline mr-1.5" />Transactions ({transactions?.length || 0})
          </button>
        </div>

        {/* Tournaments Tab */}
        {tab === 'tournaments' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            {!tournaments?.length ? (
              <div className="text-center py-12 text-slate-500">No tournaments</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs border-b border-white/5">
                    <th className="text-left p-4 font-medium">Tournament</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">Game</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">Team/IGN</th>
                    <th className="text-left p-4 font-medium hidden sm:table-cell">Date</th>
                    <th className="text-left p-4 font-medium">Entry</th>
                    <th className="text-left p-4 font-medium">Result</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {tournaments.map((t: any) => (
                    <tr key={t._id} className="hover:bg-white/[0.02]">
                      <td className="p-4">
                        <Link href={`/admin/tournaments/${t._id}/view`} className="text-white font-medium hover:text-saffron transition-colors">
                          {t.title}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-400 hidden md:table-cell capitalize">{t.game?.replace('-', ' ')}</td>
                      <td className="p-4 text-slate-400 hidden md:table-cell">
                        {t.teamName && <span className="text-neon-blue">{t.teamName}</span>}
                        {t.inGameId && <span className="text-slate-500 text-xs ml-1">({t.inGameId})</span>}
                      </td>
                      <td className="p-4 text-slate-400 hidden sm:table-cell">{new Date(t.startDate).toLocaleDateString('en-IN')}</td>
                      <td className="p-4 text-slate-400">₹{t.entryFee || 0}</td>
                      <td className="p-4">
                        {t.result?.position ? (
                          <span className="text-yellow-400 font-medium">#{t.result.position}</span>
                        ) : t.result?.prizeWon ? (
                          <span className="text-green-400 font-medium">₹{t.result.prizeWon}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status] || 'text-slate-400 bg-slate-400/10'}`}>
                          {t.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {tab === 'transactions' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            {!transactions?.length ? (
              <div className="text-center py-12 text-slate-500">No transactions</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs border-b border-white/5">
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Description</th>
                    <th className="text-right p-4 font-medium">Amount</th>
                    <th className="text-right p-4 font-medium hidden sm:table-cell">Balance</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {transactions.map((tx: any) => (
                    <tr key={tx._id} className="hover:bg-white/[0.02]">
                      <td className="p-4 text-slate-400 whitespace-nowrap">{new Date(tx.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium capitalize ${TX_TYPE_COLORS[tx.type] || 'text-slate-400'}`}>
                          {tx.type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 max-w-[200px] truncate">{tx.description}</td>
                      <td className={`p-4 text-right font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                      </td>
                      <td className="p-4 text-right text-slate-400 hidden sm:table-cell">₹{tx.balanceAfter?.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                          tx.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                          'bg-red-400/10 text-red-400'
                        }`}>{tx.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-500">{icon}</div>
      <div className="flex-1">
        <div className="text-slate-500 text-xs">{label}</div>
        <div className="text-white text-sm">{value}</div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-3 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-slate-500 text-xs mt-0.5">{label}</div>
    </div>
  )
}
