import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import TransactionList from '../components/TransactionList'
import SummaryCards from '../components/SummaryCards'

function Dashboard() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions')
      setTransactions(response.data)
    } catch (error) {
      setError('Failed to load transactions. Please try again.')
      console.error(error)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await api.get('/transactions/summary')
      setSummary(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setError('')
    await Promise.all([fetchTransactions(), fetchSummary()])
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header with Add and Logout Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">FinPilot Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/add-transaction')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Add Transaction
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <SummaryCards summary={summary} />
      <TransactionList
        transactions={transactions}
        onTransactionUpdated={refreshData}
        onTransactionDeleted={refreshData}
      />
    </div>
  )
}

export default Dashboard