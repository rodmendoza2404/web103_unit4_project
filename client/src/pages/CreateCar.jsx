import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

import { getFeatures } from '../services/FeaturesAPI'
import { createItem } from '../services/ItemsAPI'

import Configurator from '../components/Configurator'
import PriceBar from '../components/PriceBar'

import { calcPrice } from '../utilities/calcprice'

const CreateCar = () => {
  const navigate = useNavigate()

  const [name, setName] = useState('My Custom Build')
  const [basePrice, setBasePrice] = useState(300)
  const [features, setFeatures] = useState([])
  const [selections, setSelections] = useState([])
  const [valid, setValid] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getFeatures(true).then(setFeatures)
  }, [])

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

    const newItem = {
      name,
      base_price: Number(basePrice),
      selections,
      submitted_by: 'Rod',
    }

    const res = await createItem(newItem)
    if (res?.error) {
      alert(res.error)
      setSaving(false)
      return
    }

    navigate('/customcars')
  }

  return (
    <div className="page-container">
      <h1>Create Custom Car</h1>
      <div className='panel'>

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
      </div>

      <Configurator
        value={selections}
        onChange={setSelections}
        onValidityChange={ok => setValid(ok)}
      />

      <PriceBar total={total}>
        <button onClick={() => navigate('/customcars')} disabled={saving}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={!valid || saving}>
          Save
        </button>
      </PriceBar>
    </div>
  )
}

export default CreateCar
