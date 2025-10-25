export async function getItems() {
  const r = await fetch('/api/items'); return r.json()
}
export async function getItem(id) {
  const r = await fetch(`/api/items/${id}`); return r.json()
}
export async function createItem(payload) {
  const r = await fetch('/api/items', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
  return r.json()
}
export async function updateItem(id, payload) {
  const r = await fetch(`/api/items/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
  return r.json()
}
export async function deleteItem(id) {
  const r = await fetch(`/api/items/${id}`, { method:'DELETE' })
  return r.json()
}
