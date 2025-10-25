import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import '../App.css'

import { getItem, deleteItem } from '../services/ItemsAPI'

const CarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const data = await getItem(id)
      setCar(data)
      setLoading(false)
    }
    fetchData()
  }, [id])

  async function handleDelete() {
    const confirmDelete = window.confirm('Are you sure you want to delete this build?')
    if (!confirmDelete) return
    await deleteItem(id)
    navigate('/customcars')
  }

  if (loading) {
    return <div className="page-container">Loading...</div>
  }

  if (!car) {
    return <div className="page-container">Car not found.</div>
  }

  return (
    <div className="page-container">
      <div className="panel">
        <div className="car-header">
          <h1>{car.name}</h1>
          <div className="car-actions">
              <Link to={`/cars/${id}/edit`}><button className="btn btn-primary btn-sm">Edit</button></Link>
              <button onClick={handleDelete} className="btn btn-primary btn-sm">Delete</button>
          </div>
        </div>

        <div className="car-total">
          Total: ${Number(car.totalPrice || 0).toFixed(2)}
        </div>

        <div className="selections-section">
          <h3>Selections</h3>
          <ul className="selections-list">
            {(car.selections || []).map(sel => (
              <li
                key={`${sel.feature_slug}-${sel.option_slug}`}
                className="selection-item"
              >
                <strong>{sel.feature_slug}:</strong> {sel.option_name}{' '}
                {Number(sel.price_delta || 0) !== 0 && (
                  <span className="selection-price">
                    ({Number(sel.price_delta) > 0 ? '+' : ''}
                    ${Number(sel.price_delta).toFixed(2)})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="back-section">
          <Link to="/customcars">
            <button className="btn btn-primary">Back to List</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CarDetails
