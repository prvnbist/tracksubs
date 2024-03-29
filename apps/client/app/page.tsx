'use client'
import Link from 'next/link'

import { useUser } from '@clerk/nextjs'
import { Button, Title } from '@mantine/core'

export default function Page(): JSX.Element {
	const { isLoaded, isSignedIn } = useUser()
	return (
		<main>
			<Title>Homepage</Title>
			{isLoaded ? (
				isSignedIn ? (
					<Link href="/dashboard">
						<Button>Dashboard</Button>
					</Link>
				) : (
					<Link href="/login">
						<Button>Login</Button>
					</Link>
				)
			) : null}
		</main>
	)
}
