// Utility function to format currency in Indian format
export const formatCurrency = (value) => {
  const num = Number(value) || 0
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
