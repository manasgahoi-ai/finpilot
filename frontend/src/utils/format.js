// Utility function to format currency in Indian format
export const formatCurrency = (value) => {
  const num = Number(value) || 0
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Canonical category taxonomy shared across the app.
// Must stay in sync with the ML service and backend.
export const categoryOptions = [
  'FOOD',
  'SHOPPING',
  'SUBSCRIPTION',
  'TRANSPORT',
  'EMI',
  'INCOME',
  'UTILITIES',
  'MEDICAL',
  'INVESTMENT',
  'CASH',
  'OTHER'
]

// Normalize any incoming category string to the canonical taxonomy.
// Falls back to 'OTHER' for unknown / free-text values.
export const formatCategory = (value) => {
  if (!value) return 'OTHER'
  const upper = String(value).toUpperCase()
  return categoryOptions.includes(upper) ? upper : 'OTHER'
}

// Render a category token as a human-readable label (e.g. "FOOD" -> "Food").
export const formatCategoryLabel = (value) => {
  const canonical = formatCategory(value)
  return canonical.charAt(0) + canonical.slice(1).toLowerCase()
}
