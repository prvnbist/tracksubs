import { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { GoogleAnalytics } from '@next/third-parties/google'

import { Notifications } from '@mantine/notifications'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './layout.css'

import StatsigWrapper from 'state/statsig'

import theme from './theme'
import Script from 'next/script'

export const metadata: Metadata = {
	title: 'TrackSubs',
	description: 'Streamline your finances and stay on top of recurring expenses effortlessly.',
	keywords: [
		'Subscription',
		'Tracker',
		'Tracking',
		'Transaction',
		'Renewal',
		'Subscription management software',
		'Subscription tracking tool',
		'Subscription monitoring service',
		'Recurring payment tracker',
		'Subscription analytics platform',
		'Subscription billing solution',
		'Subscription renewal reminder',
		'Manage recurring payments',
		'Subscription lifecycle management',
		'Track subscription expenses',
		'Subscription invoice tracking',
		'Automated subscription management',
		'Subscription revenue tracking',
		'Monitor subscription churn',
		'Subscription billing management',
		'Subscription tracking app',
		'Subscription payment tracker',
		'Subscription tracking dashboard',
		'Subscription tracking system',
		'Subscription optimization tool',
	],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<ColorSchemeScript defaultColorScheme="auto" />
				<link rel="apple-touch-icon" sizes="180x180" href="/logos/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/logos/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/logos/favicon-16x16.png" />
				<link rel="manifest" href="/site.webmanifest" />
				{process.env.NODE_ENV === 'production' && <GoogleAnalytics gaId="G-9HQWT4K0XG" />}
				<Script
					src="script"
					data-host-url="https://analytics.prvnbist.com"
					data-website-id="b64a95e5-2fa2-45ca-9ef7-348516e65f59"
				/>
			</head>
			<body>
				<StatsigWrapper>
					<ClerkProvider>
						<MantineProvider defaultColorScheme="auto" theme={theme}>
							<Notifications />
							{children}
						</MantineProvider>
					</ClerkProvider>
				</StatsigWrapper>
			</body>
		</html>
	)
}
