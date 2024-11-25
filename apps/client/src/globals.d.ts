export type {}

declare global {
	interface CustomJwtSessionClaims {
		metadata: {
			user_id: string
			currency: string
			timezone: string
			is_onboarded: boolean
			plan: 'FREE'
		}
	}
}
