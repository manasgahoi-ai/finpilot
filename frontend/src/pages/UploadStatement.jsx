import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { categoryOptions, formatCategory, formatCategoryLabel } from '../utils/format'

function UploadStatement() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [isProtected, setIsProtected] = useState('no')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Accept a file only if it looks like a PDF. We check both the MIME type
  // and the extension because some OSes report an empty MIME type for
  // dropped files (e.g. when dragged from Finder/Explorer).
  const isPdfFile = (candidate) => {
    if (!candidate) return false
    if (candidate.type === 'application/pdf') return true
    const name = candidate.name?.toLowerCase() || ''
    return name.endsWith('.pdf')
  }

  const acceptFile = (candidate) => {
    if (!isPdfFile(candidate)) {
      setFile(null)
      setError('Only PDF statements are supported. Please choose a .pdf file.')
      return false
    }
    setFile(candidate)
    setError('')
    return true
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)

    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) {
      acceptFile(droppedFile)
    }
  }

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      acceptFile(selectedFile)
    }
  }

  const parseStatement = async () => {
    if (!file) {
      setError('Please choose a PDF statement to continue.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (isProtected === 'yes' && password.trim()) {
        formData.append('password', password)
      }

      const response = await api.post('/statement/parse-statement', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const raw = Array.isArray(response.data?.transactions) ? response.data.transactions : []
      setTransactions(
        raw.map((transaction) => ({
          ...transaction,
          category: formatCategory(transaction.category)
        }))
      )
    } catch (err) {
      setError(err.response?.data?.message || 'We could not read that statement. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateTransactionCategory = (index, value) => {
    setTransactions((current) =>
      current.map((transaction, transactionIndex) =>
        transactionIndex === index ? { ...transaction, category: value } : transaction
      )
    )
  }

  const saveTransactions = async () => {
    if (!transactions.length) {
      setError('There are no transactions to save yet.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/statement/statements/confirm', {
        transactions: transactions.map((transaction) => ({
          ...transaction,
          category: formatCategory(transaction.category),
          type: transaction.type || 'DEBIT'
        }))
      })

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save the extracted transactions.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6 animate-[fadeIn_200ms_ease-out]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-500">Upload statement</p>
            <h1 className="text-3xl font-semibold text-slate-800">Bring in your bank activity</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Drop a PDF, let FinPilot extract the transactions, and confirm them before they land in your dashboard.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div
              onDrop={handleDrop}
              onDragOver={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 16V4" />
                  <path d="m8 8 4-4 4 4" />
                  <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-800">Drop your PDF here</h2>
              <p className="mt-2 text-sm text-slate-500">PDF statements from most banks are supported</p>
              <label className="mt-5 inline-flex cursor-pointer items-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600">
                Choose file
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
              </label>
              {file && <p className="mt-4 text-sm text-slate-600">Selected: {file.name}</p>}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Password protected</p>
                <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setIsProtected('no')}
                    className={`rounded-full px-3 py-1.5 text-sm ${isProtected === 'no' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProtected('yes')}
                    className={`rounded-full px-3 py-1.5 text-sm ${isProtected === 'yes' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {isProtected === 'yes' && (
                <div className="mt-4 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter statement password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={parseStatement}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {loading ? 'Reading statement…' : 'Analyze statement'}
            </button>

            {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Extracted transactions</h2>
                <p className="text-sm text-slate-500">Review and adjust categories before saving.</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
                {transactions.length} found
              </span>
            </div>

            <div className="mt-4 max-h-[420px] space-y-3 overflow-auto pr-2">
              {transactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Your preview will appear here after analysis.
                </div>
              ) : (
                transactions.map((transaction, index) => (
                  <div key={`${transaction.description}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-800">{transaction.description || 'Imported transaction'}</p>
                        <p className="mt-1 text-sm text-slate-500">{transaction.date} • {transaction.type === 'CREDIT' ? 'Credit' : 'Debit'}</p>
                      </div>
                      <p className={`font-mono text-sm font-semibold ${transaction.type === 'CREDIT' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}₹{Number(transaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <select
                        value={formatCategory(transaction.category)}
                        onChange={(event) => updateTransactionCategory(index, event.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>{formatCategoryLabel(option)}</option>
                        ))}
                      </select>
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                        AI suggested
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={saveTransactions}
              disabled={loading || transactions.length === 0}
              className="mt-6 w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? 'Saving…' : 'Confirm & save'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default UploadStatement
