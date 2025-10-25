import { pool } from '../config/database.js'

export async function validateSelections(req, res) {
  try {
    // Expect: { optionIds: number[] } OR { selections: [{featureSlug, optionSlug}] }
    let { optionIds, selections } = req.body || {}
    if (!optionIds && selections) {
      const rows = await pool.query(
        `SELECT o.id FROM options o
         JOIN features f ON o.feature_id=f.id
         WHERE (f.slug, o.slug) IN (${selections.map((_,i)=>`($${2*i+1}, $${2*i+2})`).join(',')})`,
        selections.flatMap(s => [s.featureSlug, s.optionSlug])
      )
      optionIds = rows.rows.map(r => r.id)
    }
    optionIds = optionIds || []
    if (optionIds.length === 0) return res.json({ valid: true, conflicts: [] })

    const result = await pool.query(
      `SELECT option_a, option_b FROM incompatible_pairs
       WHERE (option_a = ANY($1) AND option_b = ANY($1))`,
      [optionIds]
    )
    const conflicts = result.rows
    res.json({ valid: conflicts.length === 0, conflicts })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// helper for items controller
export async function checkIncompatibilities(optionIds) {
  if (!optionIds?.length) return []
  const r = await pool.query(
    `SELECT option_a, option_b FROM incompatible_pairs
     WHERE (option_a = ANY($1) AND option_b = ANY($1))`,
    [optionIds]
  )
  return r.rows
}
