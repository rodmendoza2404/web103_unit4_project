export default function PriceBar({ total, children }) {
  return (
    <div className="pricebar">
      <div style={{ fontWeight: 700 }}>Total: ${Number(total || 0).toFixed(2)}</div>
      <div style={{ display: 'flex', gap: 12 }}>{children}</div>
    </div>
  )
}
