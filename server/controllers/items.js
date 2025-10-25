import { pool } from '../config/database.js'
import { checkIncompatibilities } from './validation.js'

function computeTotal(base, rows) {
  const deltas = rows.map(r => Number(r.price_delta || 0))
  return Number(base || 0) + deltas.reduce((a,b)=>a+b, 0)
}

export async function getItems(req, res) {
  try {
    const items = await pool.query('SELECT * FROM custom_items ORDER BY id DESC')
    
    // For each item, calculate the total price by including selections
    const itemsWithTotals = await Promise.all(
      items.rows.map(async (item) => {
        const sel = await pool.query(
          `SELECT o.price_delta
           FROM item_options io
           JOIN options o ON io.option_id=o.id
           WHERE io.custom_item_id=$1`, [item.id])
        
        const totalPrice = computeTotal(item.base_price, sel.rows)
        return { ...item, totalPrice }
      })
    )
    
    res.json(itemsWithTotals)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function getItemById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const item = await pool.query('SELECT * FROM custom_items WHERE id=$1', [id])
    if (!item.rows[0]) return res.status(404).json({ error: 'Not found' })
    const sel = await pool.query(
      `SELECT io.*, o.name as option_name, o.slug as option_slug, o.price_delta, f.id as feature_id, f.slug as feature_slug
       FROM item_options io
       JOIN options o ON io.option_id=o.id
       JOIN features f ON io.feature_id=f.id
       WHERE io.custom_item_id=$1
       ORDER BY f.display_order, f.id`, [id])
    const totalPrice = computeTotal(item.rows[0].base_price, sel.rows)
    res.json({ ...item.rows[0], selections: sel.rows, totalPrice })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function createItem(req, res) {
  try {
    const { name, base_price, preview_image, submitted_by, selections } = req.body || {}

    let optRows = { rows: [] }
    let optionIds = []

    if (selections && selections.length > 0) {
      const params = selections.flatMap(s => [s.featureSlug, s.optionSlug])
      const placeholders = selections.map((_,i)=>`($${2*i+1}, $${2*i+2})`).join(',')
      optRows = await pool.query(
        `SELECT o.id, o.feature_id FROM options o
         JOIN features f ON o.feature_id=f.id
         WHERE (f.slug, o.slug) IN (${placeholders})`, params)
      optionIds = optRows.rows.map(r => r.id)
    }

    const conflicts = await checkIncompatibilities(optionIds)
    if (conflicts.length) return res.status(409).json({ error: 'Incompatible selection', details: { pairs: conflicts } })

    const created = await pool.query(
      `INSERT INTO custom_items (name, base_price, preview_image, submitted_by)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, base_price ?? 0, preview_image ?? null, submitted_by ?? null]
    )
    const itemId = created.rows[0].id

    for (const r of optRows.rows) {
      await pool.query(
        `INSERT INTO item_options (custom_item_id, feature_id, option_id)
         VALUES ($1,$2,$3)
         ON CONFLICT (custom_item_id, feature_id) DO UPDATE SET option_id=EXCLUDED.option_id`,
        [itemId, r.feature_id, r.id]
      )
    }

    const sel = await pool.query(
      `SELECT io.*, o.name as option_name, o.slug as option_slug, o.price_delta, f.id as feature_id, f.slug as feature_slug
       FROM item_options io
       JOIN options o ON io.option_id=o.id
       JOIN features f ON io.feature_id=f.id
       WHERE io.custom_item_id=$1`, [itemId])
    const totalPrice = computeTotal(created.rows[0].base_price, sel.rows)
    res.status(201).json({ ...created.rows[0], selections: sel.rows, totalPrice })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

export async function updateItem(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { name, base_price, preview_image, selections } = req.body || {}

    if (name !== undefined || base_price !== undefined || preview_image !== undefined) {
      await pool.query(
        `UPDATE custom_items SET
          name = COALESCE($2, name),
          base_price = COALESCE($3, base_price),
          preview_image = COALESCE($4, preview_image)
         WHERE id=$1`,
        [id, name, base_price, preview_image]
      )
    }

    if (selections && selections.length > 0) {
      const params = selections.flatMap(s => [s.featureSlug, s.optionSlug])
      const placeholders = selections.map((_,i)=>`($${2*i+1}, $${2*i+2})`).join(',')
      const optRows = await pool.query(
        `SELECT o.id, o.feature_id FROM options o
         JOIN features f ON o.feature_id=f.id
         WHERE (f.slug, o.slug) IN (${placeholders})`, params)

      const optionIds = optRows.rows.map(r => r.id)
      const conflicts = await checkIncompatibilities(optionIds)
      if (conflicts.length) return res.status(409).json({ error: 'Incompatible selection', details: { pairs: conflicts } })

      for (const r of optRows.rows) {
        await pool.query(
          `INSERT INTO item_options (custom_item_id, feature_id, option_id)
           VALUES ($1,$2,$3)
           ON CONFLICT (custom_item_id, feature_id) DO UPDATE SET option_id=EXCLUDED.option_id`,
          [id, r.feature_id, r.id]
        )
      }
    }

    const item = await pool.query('SELECT * FROM custom_items WHERE id=$1', [id])
    if (!item.rows[0]) return res.status(404).json({ error: 'Not found' })
    const sel = await pool.query(
      `SELECT io.*, o.name as option_name, o.slug as option_slug, o.price_delta, f.id as feature_id, f.slug as feature_slug
       FROM item_options io
       JOIN options o ON io.option_id=o.id
       JOIN features f ON io.feature_id=f.id
       WHERE io.custom_item_id=$1`, [id])
    const totalPrice = Number(item.rows[0].base_price || 0) + sel.rows.reduce((sum,r)=>sum+Number(r.price_delta||0),0)
    res.json({ ...item.rows[0], selections: sel.rows, totalPrice })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

export async function deleteItem(req, res) {
  try {
    const id = parseInt(req.params.id)
    await pool.query('DELETE FROM custom_items WHERE id=$1', [id])
    res.json({ deleted: true, id })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}
