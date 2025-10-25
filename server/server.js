import express from 'express'
import path from 'path'
import dotenv from 'dotenv'

import featuresRouter from './routes/features.js'
import itemsRouter from './routes/items.js'
import validationRouter from './routes/validation.js'

dotenv.config()
const PORT = process.env.PORT || 3000
const app = express()

app.use(express.json())

app.use('/api', featuresRouter)
app.use('/api', itemsRouter)
app.use('/api', validationRouter)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'))
  app.get('/*', (_, res) => res.sendFile(path.resolve('public', 'index.html')))
}

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`)
})
