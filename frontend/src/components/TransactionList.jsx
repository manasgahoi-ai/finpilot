import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import api from '../api/axios'
import { formatCurrency, categoryOptions, formatCategory, formatCategoryLabel } from '../utils/format'

function TransactionList({ transactions, onTransactionUpdated, onTransactionDeleted }) {
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, transaction: null })
  const [editingTransaction, setEditingTransaction] = useState(null)
  const longPressTimerRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu({ show: false, x: 0, y: 0, transaction: null })
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  const getClampedPosition = (x, y, menuWidth = 160, menuHeight = 80) => {
    const padding = 8

    let clampedX = x
    let clampedY = y

    if (x + menuWidth > window.innerWidth - padding) {
      clampedX = Math.max(padding, window.innerWidth - menuWidth - padding)
    }
    if (y + menuHeight > window.innerHeight - padding) {
      clampedY = Math.max(padding, window.innerHeight - menuHeight - padding)
    }

    return { x: clampedX, y: clampedY }
  }

  // After the menu mounts, measure its actual rendered size and re-clamp
  // the position so it never overflows the viewport, regardless of content.
  useLayoutEffect(() => {
    if (!contextMenu.show || !menuRef.current) return

    const rect = menuRef.current.getBoundingClientRect()
    const { x, y } = getClampedPosition(contextMenu.x, contextMenu.y, rect.width, rect.height)

    if (x !== contextMenu.x || y !== contextMenu.y) {
      setContextMenu((prev) => ({ ...prev, x, y }))
    }
  }, [contextMenu.show, contextMenu.x, contextMenu.y])

  const handleContextMenu = (e, transaction) => {
    e.preventDefault()
    const pos = getClampedPosition(e.clientX, e.clientY)
    setContextMenu({ show: true, x: pos.x, y: pos.y, transaction })
  }

  const handleTouchStart = (e, transaction) => {
    longPressTimerRef.current = setTimeout(() => {
      const touch = e.touches[0]
      const pos = getClampedPosition(touch.clientX, touch.clientY)
      setContextMenu({ show: true, x: pos.x, y: pos.y, transaction })
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleUpdate = () => {
    setEditingTransaction(contextMenu.transaction)
    setContextMenu({ show: false, x: 0, y: 0, transaction: null })
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${contextMenu.transaction.id}`)
        if (onTransactionDeleted) onTransactionDeleted()
      } catch (error) {
        console.error('Failed to delete transaction:', error)
        alert('Failed to delete transaction')
      }
    }
    setContextMenu({ show: false, x: 0, y: 0, transaction: null })
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-800">No transactions yet</p>
        <p className="mt-2 text-sm text-slate-500">Your latest cash flow will appear here as soon as you record it.</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Recent activity</h2>
          <p className="text-sm text-slate-500">Long-press or right-click to edit or delete.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {transactions.length} entries
        </span>
      </div>

      <div className="space-y-3">
        {transactions.map((t) => (
          <div
            key={t.id}
            onContextMenu={(e) => handleContextMenu(e, t)}
            onTouchStart={(e) => handleTouchStart(e, t)}
            onTouchEnd={handleTouchEnd}
            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-800">{t.category}</p>
              <p className="mt-1 text-sm text-slate-500">
                {t.date} • {t.description || 'No description'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600">
                {t.type === 'CREDIT' ? 'Credit' : 'Debit'}
              </span>
              <p className={`font-mono text-lg font-semibold ${t.type === 'CREDIT' ? 'text-emerald-500' : 'text-red-500'}`}>
                {t.type === 'CREDIT' ? '+' : '-'}₹{formatCurrency(t.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {contextMenu.show && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[160px] rounded-2xl border border-slate-200 bg-white py-1 shadow-lg"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <button onClick={handleUpdate} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
            <span>✏️</span> Update
          </button>
          <button onClick={handleDelete} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
            <span>🗑️</span> Delete
          </button>
        </div>
      )}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={async (updatedData) => {
            try {
              await api.put(`/transactions/${editingTransaction.id}`, updatedData)
              setEditingTransaction(null)
              if (onTransactionUpdated) onTransactionUpdated()
            } catch (error) {
              console.error('Failed to update transaction:', error)
              alert('Failed to update transaction')
            }
          }}
        />
      )}
    </div>
  )
}

function EditTransactionModal({ transaction, onClose, onSave }) {
  const [amount, setAmount] = useState(transaction.amount)
  const [category, setCategory] = useState(formatCategory(transaction.category))
  const [description, setDescription] = useState(transaction.description || '')
  const [type, setType] = useState(transaction.type)
  const [date, setDate] = useState(transaction.date)

  const handleSubmit = (e) => {
    e.preventDefault()
    const today = new Date().toISOString().split('T')[0]
    if (date > today) {
      alert('Date cannot be in the future.')
      return
    }
    onSave({
      amount: parseFloat(amount),
      category: formatCategory(category),
      description,
      type,
      date
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-800">Update transaction</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="DEBIT">Debit</option>
              <option value="CREDIT">Credit</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{formatCategoryLabel(option)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows="3"
            />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-600">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionList
