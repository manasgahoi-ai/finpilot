import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import { formatCurrency } from '../utils/format'

function TransactionList({ transactions, onTransactionUpdated, onTransactionDeleted }) {
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, transaction: null })
  const [editingTransaction, setEditingTransaction] = useState(null)
  const longPressTimerRef = useRef(null)
  const menuRef = useRef(null)

  // Close context menu when clicking outside
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  // Calculate clamped position to keep menu on screen
  const getClampedPosition = (x, y) => {
    const menuWidth = 160
    const menuHeight = 80
    const padding = 8

    let clampedX = x
    let clampedY = y

    if (x + menuWidth > window.innerWidth - padding) {
      clampedX = window.innerWidth - menuWidth - padding
    }
    if (y + menuHeight > window.innerHeight - padding) {
      clampedY = window.innerHeight - menuHeight - padding
    }

    return { x: clampedX, y: clampedY }
  }

  // Right-click handler (desktop)
  const handleContextMenu = (e, transaction) => {
    e.preventDefault()
    const pos = getClampedPosition(e.clientX, e.clientY)
    setContextMenu({
      show: true,
      x: pos.x,
      y: pos.y,
      transaction
    })
  }

  // Touch handlers (mobile)
  const handleTouchStart = (e, transaction) => {
    longPressTimerRef.current = setTimeout(() => {
      const touch = e.touches[0]
      const pos = getClampedPosition(touch.clientX, touch.clientY)
      setContextMenu({
        show: true,
        x: pos.x,
        y: pos.y,
        transaction
      })
    }, 500) // 500ms long press
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Action handlers
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
    return <p className="text-gray-500">No transactions yet.</p>
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Transactions</h2>
      <div className="space-y-2">
        {transactions.map((t) => (
          <div
            key={t.id}
            onContextMenu={(e) => handleContextMenu(e, t)}
            onTouchStart={(e) => handleTouchStart(e, t)}
            onTouchEnd={handleTouchEnd}
            className="flex justify-between items-center border-b py-3 px-2 hover:bg-gray-50 cursor-pointer select-none"
          >
            <div>
              <p className="font-medium text-gray-800">{t.category}</p>
              <p className="text-sm text-gray-500">
                {t.date} — {t.description || 'No description'}
              </p>
            </div>
            <p className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
              {t.type === 'INCOME' ? '+' : '-'}₹{formatCurrency(t.amount)}
            </p>
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          ref={menuRef}
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`
          }}
        >
          <button
            onClick={handleUpdate}
            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 flex items-center gap-2"
          >
            <span>✏️</span> Update
          </button>
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
          >
            <span>🗑️</span> Delete
          </button>
        </div>
      )}

      {/* Edit Modal */}
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

// Edit Modal Component
function EditTransactionModal({ transaction, onClose, onSave }) {
  const [amount, setAmount] = useState(transaction.amount)
  const [category, setCategory] = useState(transaction.category)
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
      category,
      description,
      type,
      date
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionList
