import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

import { getXataClient } from './xata'

const xata = getXataClient()
const pool = new Pool({ connectionString: xata.sql.connectionString, max: 7 })
const db = drizzle(pool)

export default db
