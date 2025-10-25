import express from 'express'
import { validateSelections } from '../controllers/validation.js'
const router = express.Router()
router.post('/validate', validateSelections)
export default router
