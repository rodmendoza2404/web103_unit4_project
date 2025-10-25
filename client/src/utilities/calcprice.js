export function calcPrice(basePrice, selectedOptionRows) {
  const base = Number(basePrice || 0)
  const deltas = (selectedOptionRows || []).map(r => Number(r.price_delta || 0))
  return base + deltas.reduce((a,b)=>a+b, 0)
}
