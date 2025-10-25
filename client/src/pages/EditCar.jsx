import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../App.css'

import { getItem, updateItem, deleteItem } from '../services/ItemsAPI'
import { getFeatures } from '../services/FeaturesAPI'

import Configurator from '../components/Configurator'
import PriceBar from '../components/PriceBar'

import { calcPrice } from '../utilities/calcprice'

const EditCar = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [basePrice, setBasePrice] = useState(0)
  const [features, setFeatures] = useState([])
  const [selections, setSelections] = useState([])
  const [valid, setValid] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching data for car ID:', id)
        
        const featureData = await getFeatures(true)
        console.log('Features loaded:', featureData)
        setFeatures(featureData)

        const itemData = await getItem(id)
        console.log('Item data loaded:', itemData)
        
        if (itemData && !itemData.error) {
          setName(itemData.name)
          setBasePrice(Number(itemData.base_price) || 0)
          const mappedSelections = (itemData.selections || []).map(s => ({
            featureSlug: s.feature_slug,
            optionSlug: s.option_slug,
          }))
          console.log('Mapped selections:', mappedSelections)
          setSelections(mappedSelections)
        } else {
          console.error('Failed to load item data:', itemData)
          setError('Car not found or failed to load')
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load car data')
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const selectedOptions = useMemo(() => {
    const featureMap = Object.fromEntries(features.map(f => [f.slug, f]))
    return selections
      .map(sel => featureMap[sel.featureSlug]?.options?.find(o => o.slug === sel.optionSlug))
      .filter(Boolean)
  }, [features, selections])

  const total = calcPrice(basePrice, selectedOptions)

  async function handleSave() {
    if (!valid || saving) return
    setSaving(true)

    const updatedCar = {
      name,
      base_price: Number(basePrice),
      selections,
    }

    const res = await updateItem(id, updatedCar)
    if (res?.error) {
      alert(res.error)
      setSaving(false)
      return
    }

    navigate(`/cars/${id}`)
  }

  async function handleDelete() {
    const confirmDelete = window.confirm('Are you sure you want to delete this build?')
    if (!confirmDelete) return

    await deleteItem(id)
    navigate('/customcars')
  }

  if (loading) {
    return <div className="page-container">Loading...</div>
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/customcars')}>Back to List</button>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1>Edit Custom Car</h1>

      <div className="form-section">
        <label>
          Build Name:
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            type="text"
            placeholder="Enter car name"
          />
        </label>

        <label>
          Base Price ($):
          <input
            value={basePrice}
            onChange={e => setBasePrice(e.target.value)}
            type="number"
          />
        </label>
      </div>

      <Configurator
        value={selections}
        onChange={setSelections}
        onValidityChange={ok => setValid(ok)}
      />

      <PriceBar total={total}>
        <button onClick={() => navigate(`/cars/${id}`)} className="btn btn-primary" disabled={saving}>Cancel</button>
        <button onClick={handleDelete} className="btn btn-primary" disabled={saving}>Delete</button>
        <button onClick={handleSave} className="btn btn-primary" disabled={!valid || saving}>Save</button>
      </PriceBar>
    </div>
  )
}

export default EditCar
