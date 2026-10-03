export const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    console.error('Could not format money', error)
    return `${amount.toFixed(2)} ${currency}`
  }
}
