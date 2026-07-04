import { useNavigate } from 'react-router-dom'
import TransactionForm from '../components/TransactionForm'
import Layout from '../components/Layout'

function AddTransaction() {
  const navigate = useNavigate()

  const handleTransactionAdded = () => {
    navigate('/dashboard')
  }

  return (
    <Layout>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 animate-[fadeIn_200ms_ease-out]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-500">Add transaction</p>
          <h1 className="text-3xl font-semibold text-slate-800">Capture a new money move</h1>
          <p className="mt-2 text-sm text-slate-500">Log income or expense details in seconds and keep the flow moving.</p>
        </div>
        <TransactionForm onTransactionAdded={handleTransactionAdded} />
      </div>
    </Layout>
  )
}

export default AddTransaction
