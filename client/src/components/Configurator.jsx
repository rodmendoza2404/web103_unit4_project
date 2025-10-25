import { useEffect, useMemo, useState } from 'react'
import { getFeatures } from '../services/FeaturesAPI'
import { validateSelections } from '../services/ValidateAPI'

export default function Configurator({ value, onChange, onValidityChange }) {
  const [features, setFeatures] = useState([])
  const [conflicts, setConflicts] = useState([])

  useEffect(() => {
    getFeatures(true).then(setFeatures)
  }, [])

  useEffect(() => {
    if (features.length === 0) return
    const current = Object.fromEntries((value || []).map(s => [s.featureSlug, s.optionSlug]))
    const filled = features.map(f => {
      const fallback = (f.options || []).find(o => o.is_default) || (f.options || [])[0]
      return { featureSlug: f.slug, optionSlug: current[f.slug] || (fallback?.slug ?? '') }
    })
    if (JSON.stringify(value || []) !== JSON.stringify(filled)) onChange?.(filled)
  }, [features])

  useEffect(() => {
    if (!value || value.length === 0) return
    validateSelections(value).then(res => {
      setConflicts(res.conflicts || [])
      onValidityChange?.(res.valid, res.conflicts || [])
    })
  }, [value, onValidityChange])

  function updateSelection(featureSlug, optionSlug) {
    const next = (value || []).map(s => s.featureSlug === featureSlug ? { featureSlug, optionSlug } : s)
    if (!next.find(s => s.featureSlug === featureSlug)) next.push({ featureSlug, optionSlug })
    onChange?.(next)
  }

  const conflictSet = useMemo(() => {
    const set = new Set()
    for (const c of conflicts) { set.add(c.option_a); set.add(c.option_b) }
    return set
  }, [conflicts])

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {features.map(f => (
        <div key={f.id} className="feature-card">
          <div className="feature-title">{f.name}</div>

          <div className="chips">
            {(f.options || []).map(opt => {
              const selected = (value || []).some(s => s.featureSlug === f.slug && s.optionSlug === opt.slug)
              const isConflicted = conflictSet.has(opt.id)

              return (
                <label
                  key={opt.id}
                  className={`chip ${selected ? 'selected' : ''}`}
                  title={isConflicted ? 'This option is part of a conflicting combination' : undefined}
                  style={isConflicted ? { outline: '2px solid #b00020' } : undefined}
                >
                  <input
                    type="radio"
                    name={`feature-${f.slug}`}
                    value={opt.slug}
                    checked={selected}
                    onChange={() => updateSelection(f.slug, opt.slug)}
                  />
                  {opt.name}{' '}
                  {Number(opt.price_delta) !== 0
                    ? ` ( ${Number(opt.price_delta) > 0 ? '+' : ''}$${Number(opt.price_delta).toFixed(2)} )`
                    : ''}
                </label>
              )
            })}
          </div>
        </div>
      ))}

      {conflicts.length > 0 && (
        <div style={{ color: '#b00020', fontSize: 14 }}>
          Some choices are incompatible. Please adjust before saving.
        </div>
      )}
    </div>
  )
}
