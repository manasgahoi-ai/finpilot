import { useEffect, useMemo, useRef, useState } from 'react'
import { formatCurrency } from '../utils/format'

function CountUp({ value, prefix = '', suffix = '', currency = false, className = '' }) {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValueRef = useRef(0)

  useEffect(() => {
    const to = Number(value) || 0
    const from = previousValueRef.current

    // Skip animation entirely when the target value hasn't changed
    // (prevents re-running from 0 on every parent re-render).
    if (from === to) {
      setDisplayValue(to)
      return
    }

    const start = performance.now()

    const step = (now) => {
      const progress = Math.min((now - start) / 700, 1)
      const eased = 1 - (1 - progress) ** 2
      const current = from + (to - from) * eased
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        previousValueRef.current = to
      }
    }

    const frame = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(frame)
      previousValueRef.current = to
    }
  }, [value])

  const formatted = currency
    ? `${prefix}₹${displayValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `${prefix}${displayValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}${suffix}`

  return <p className={className}>{formatted}</p>
}

function SummaryCards({ summary }) {
  const netWorth = (summary.totalIncome || 0) - (summary.totalExpense || 0)
  const isNegative = netWorth < 0
  const savingsRate = Number(summary.savingsRate || 0)

  // Memoize the cards array so child CountUp components only re-animate
  // when the underlying numeric values actually change — not on every
  // parent re-render (e.g. when `summary` is a fresh object reference).
  const cards = useMemo(
    () => [
      {
        label: 'Income',
        value: summary.totalIncome || 0,
        color: 'text-emerald-500',
        trend: 'Monthly inflow',
        currency: true,
        large: false
      },
      {
        label: 'Expenses',
        value: summary.totalExpense || 0,
        color: 'text-red-500',
        trend: 'Tracked spend',
        currency: true,
        large: false
      },
      {
        label: 'Net worth',
        value: Math.abs(netWorth),
        color: isNegative ? 'text-red-500' : 'text-slate-800',
        trend: isNegative ? 'Needs attention' : 'Healthy balance',
        currency: true,
        large: true
      },
      {
        label: 'Savings rate',
        value: savingsRate,
        color: 'text-teal-500',
        trend: savingsRate > 20 ? 'On track' : 'Room to grow',
        currency: false,
        suffix: '%',
        large: false
      }
    ],
    [summary.totalIncome, summary.totalExpense, netWorth, isNegative, savingsRate]
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${card.large ? 'md:col-span-2 xl:col-span-1' : ''}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Live
            </span>
          </div>
          <CountUp
            value={card.value}
            prefix=""
            suffix={card.suffix || ''}
            currency={card.currency}
            className={`mt-4 font-mono text-2xl font-semibold ${card.color} ${card.large ? 'text-3xl' : ''}`}
          />
          <p className="mt-2 text-sm text-slate-500">{card.trend}</p>
        </div>
      ))}
    </div>
  )
}

export default SummaryCards