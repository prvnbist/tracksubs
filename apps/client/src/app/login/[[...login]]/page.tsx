import type { Metadata } from 'next'
import { dark } from '@clerk/themes'
import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { Center } from '@mantine/core'

export const metadata: Metadata = {
	title: 'Login | TrackSubs',
}

export default function Page() {
	const { userId } = auth()

	if (userId) return redirect('/dashboard')

	return (
		<Center pt={80}>
			<SignIn
				appearance={{
					baseTheme: dark,
					elements: {
						footerAction: { display: 'none' },
					},
					layout: {
						privacyPageUrl: '/privacy',
						termsPageUrl: '/terms-of-service',
					},
				}}
			/>
		</Center>
	)
}
