import express from 'express'
import { getFeatures, getFeatureById } from '../controllers/features.js'
const router = express.Router()
router.get('/features', getFeatures)
router.get('/features/:id', getFeatureById)
export default router
