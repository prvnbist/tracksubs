'use client'

import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/clerk-react'

import { Button, Title } from '@mantine/core'

export default function Page(): JSX.Element {
	const router = useRouter()
	const { signOut } = useClerk()
	return (
		<main>
			<Title>Dashboard</Title>
			<Button onClick={() => signOut(() => router.push('/'))}>Logout</Button>
		</main>
	)
}
