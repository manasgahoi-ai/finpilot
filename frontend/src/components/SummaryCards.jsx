import { formatCurrency } from '../utils/format'

function SummaryCards({ summary }) {
  const netWorth = (summary.totalIncome || 0) - (summary.totalExpense || 0)
  const isNegative = netWorth < 0

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-500">Total Income</p>
        <p className="text-2xl font-bold text-green-600">₹{formatCurrency(summary.totalIncome)}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-500">Total Expense</p>
        <p className="text-2xl font-bold text-red-600">₹{formatCurrency(summary.totalExpense)}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-500">Net Worth</p>
        <p className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-blue-600'}`}>
          ₹{formatCurrency(Math.abs(netWorth))}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-500">Savings Rate</p>
        <p className="text-2xl font-bold text-purple-600">{summary.savingsRate || 0}%</p>
      </div>
    </div>
  )
}

export default SummaryCards