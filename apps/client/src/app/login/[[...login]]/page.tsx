import type { Metadata } from 'next'
import { dark } from '@clerk/themes'
import { SignIn } from '@clerk/nextjs'

import { Center } from '@mantine/core'

export const metadata: Metadata = {
	title: 'Login | TrackSubs',
}

export default function Page() {
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
