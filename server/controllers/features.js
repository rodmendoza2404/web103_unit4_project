import { pool } from '../config/database.js'

export async function getFeatures(req, res) {
  try {
    const include = req.query.include === 'options'
    const feats = await pool.query('SELECT * FROM features ORDER BY display_order ASC, id ASC')
    if (!include) return res.json(feats.rows)

    const opts = await pool.query('SELECT * FROM options ORDER BY feature_id ASC, id ASC')
    const byFeature = {}
    for (const f of feats.rows) byFeature[f.id] = []
    for (const o of opts.rows) byFeature[o.feature_id]?.push(o)
    const withOptions = feats.rows.map(f => ({ ...f, options: byFeature[f.id] || [] }))
    res.json(withOptions)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function getFeatureById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const f = await pool.query('SELECT * FROM features WHERE id=$1', [id])
    if (!f.rows[0]) return res.status(404).json({ error: 'Feature not found' })
    const include = req.query.include === 'options'
    if (!include) return res.json(f.rows[0])
    const opts = await pool.query('SELECT * FROM options WHERE feature_id=$1 ORDER BY id ASC', [id])
    res.json({ ...f.rows[0], options: opts.rows })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
