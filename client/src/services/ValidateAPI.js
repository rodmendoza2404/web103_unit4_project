export async function validateSelections(selections) {
  const r = await fetch('/api/validate', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ selections })
  })
  return r.json()
}
