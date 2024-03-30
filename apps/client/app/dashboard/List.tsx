'use server'

import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

import db from '../../libs/db'

const users = pgTable('user', {
	id: uuid('id').primaryKey(),
	first_name: text('first_name'),
	last_name: text('last_name'),
	email: text('email'),
})
const List = async () => {
	const data = await db.select().from(users)
	console.log(data)
	return null
}

export default List
