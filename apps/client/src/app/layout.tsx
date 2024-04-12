import { ClerkProvider } from '@clerk/nextjs'

import { Notifications } from '@mantine/notifications'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

import theme from './theme'

export const metadata = {
	title: 'MySubs | Praveen Bisht',
	description: 'Manage subscriptions hassle-free. Track, organize, and save with ease.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<ColorSchemeScript defaultColorScheme="dark" />
				<link rel="apple-touch-icon" sizes="180x180" href="/logos/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/logos/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/logos/favicon-16x16.png" />
				<link rel="manifest" href="/site.webmanifest" />
			</head>
			<body>
				<ClerkProvider>
					<MantineProvider defaultColorScheme="dark" theme={theme}>
						<Notifications />
						{children}
					</MantineProvider>
				</ClerkProvider>
			</body>
		</html>
	)
}
