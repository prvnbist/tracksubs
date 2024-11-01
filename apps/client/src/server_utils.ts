'server-only'

import { auth } from '@clerk/nextjs/server'
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action'

export const getUserMetadata = async () => {
	const { sessionClaims } = auth()

	return sessionClaims?.metadata!
}

export const actionClient = createSafeActionClient({
	handleServerError(e) {
		if (e instanceof Error) {
			return e.message
		}

		return DEFAULT_SERVER_ERROR_MESSAGE
	},
}).use(async ({ next }) => {
	const { userId: authId } = auth()

	if (!authId) {
		throw new Error('User is not authorized.')
	}

	const metadata = await getUserMetadata()

	return next({ ctx: { authId, ...metadata } })
})