import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import { getItems, deleteItem } from '../services/ItemsAPI'

const ViewCars = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const data = await getItems()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function handleDelete(id) {
    if (!window.confirm('Delete this build?')) return
    await deleteItem(id)
    refresh()
  }

  return (
    <div className="page-container">
      <div className="viewcars-header">
        <h1>Saved Builds</h1>
        <Link to="/"><button className="btn btn-primary">+ New Build</button></Link>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div>No builds yet. <Link to="/">Create one</Link>.</div>
      ) : (
        <ul className="build-list">
          {items.map(it => (
            <li key={it.id} className="build-card">
              <div className="build-info">
                <div className="build-name">{it.name}</div>
                <div className="build-price">
                  Total: ${Number(it.totalPrice || it.base_price || 0).toFixed(2)}
                </div>
              </div>
              <div className="build-actions">
                <Link to={`/cars/${it.id}`}><button className="btn btn-primary btn-sm">View</button></Link>
                <Link to={`/cars/${it.id}/edit`}><button className="btn btn-primary btn-sm">Edit</button></Link>
                <button onClick={() => handleDelete(it.id)} className="btn btn-primary btn-sm">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ViewCars
