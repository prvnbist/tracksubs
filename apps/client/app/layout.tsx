import { ClerkProvider } from '@clerk/nextjs'

import { ColorSchemeScript, MantineProvider } from '@mantine/core'

import '@mantine/core/styles.css'

import theme from './theme'

export const metadata = {
	title: 'Track subscriptions by Praveen Bisht',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<ColorSchemeScript defaultColorScheme="dark" />
			</head>
			<body>
				<ClerkProvider>
					<MantineProvider defaultColorScheme="dark" theme={theme}>
						{children}
					</MantineProvider>
				</ClerkProvider>
			</body>
		</html>
	)
}
