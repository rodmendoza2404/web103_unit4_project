import express from 'express'
import { getItems, getItemById, createItem, updateItem, deleteItem } from '../controllers/items.js'
const router = express.Router()
router.get('/items', getItems)
router.get('/items/:id', getItemById)
router.post('/items', createItem)
router.patch('/items/:id', updateItem)
router.delete('/items/:id', deleteItem)
export default router
