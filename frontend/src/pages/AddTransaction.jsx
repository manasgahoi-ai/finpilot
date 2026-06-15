import { useNavigate } from 'react-router-dom'
import TransactionForm from '../components/TransactionForm'

function AddTransaction() {
  const navigate = useNavigate()

  const handleTransactionAdded = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-blue-600 hover:text-blue-700 font-semibold flex items-center"
        >
          ← Back to Dashboard
        </button>

        {/* Transaction Form */}
        <TransactionForm onTransactionAdded={handleTransactionAdded} />
      </div>
    </div>
  )
}

export default AddTransaction
