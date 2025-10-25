import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const base = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
    }

export const pool = new pg.Pool({
  ...base,
  ssl: { rejectUnauthorized: false },
})
