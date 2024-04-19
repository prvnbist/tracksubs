import { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { GoogleAnalytics } from '@next/third-parties/google'

import { Notifications } from '@mantine/notifications'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

import StatsigWrapper from 'state/statsig'

import theme from './theme'

export const metadata: Metadata = {
	title: 'TrackSubs',
	description: 'Streamline your finances and stay on top of recurring expenses effortlessly.',
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
				{process.env.NODE_ENV === 'production' && <GoogleAnalytics gaId="G-9HQWT4K0XG" />}
			</head>
			<body>
				<StatsigWrapper>
					<ClerkProvider>
						<MantineProvider defaultColorScheme="dark" theme={theme}>
							<Notifications />
							{children}
						</MantineProvider>
					</ClerkProvider>
				</StatsigWrapper>
			</body>
		</html>
	)
}
