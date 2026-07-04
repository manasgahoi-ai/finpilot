import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import TransactionList from '../components/TransactionList'
import SummaryCards from '../components/SummaryCards'
import Layout from '../components/Layout'

function Dashboard() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summaryError, setSummaryError] = useState('')

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions')
      setTransactions(response.data)
      setError('')
    } catch (error) {
      setError('Failed to load transactions. Please try again.')
      console.error(error)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await api.get('/transactions/summary')
      setSummary(response.data || {})
      setSummaryError('')
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'We could not refresh your financial summary. Showing the last known values.'
      setSummaryError(message)
      console.error('Summary fetch failed:', error)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setError('')
    setSummaryError('')
    await Promise.all([fetchTransactions(), fetchSummary()])
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-sm text-slate-500">Loading your financial overview...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 animate-[fadeIn_200ms_ease-out]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-500">Overview</p>
            <h1 className="text-3xl font-semibold text-slate-800">Your money, at a glance</h1>
            <p className="mt-2 text-sm text-slate-500">Everything important from cash flow to recent activity in one calm view.</p>
          </div>
          <button
            onClick={() => navigate('/add-transaction')}
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-600"
          >
            + Add transaction
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {summaryError && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>{summaryError}</span>
            <button
              onClick={fetchSummary}
              className="shrink-0 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
            >
              Retry
            </button>
          </div>
        )}

        <SummaryCards summary={summary} />
        <TransactionList
          transactions={transactions}
          onTransactionUpdated={refreshData}
          onTransactionDeleted={refreshData}
        />
      </div>
    </Layout>
  )
}

export default Dashboard