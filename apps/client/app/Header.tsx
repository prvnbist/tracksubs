'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useClerk } from '@clerk/clerk-react'

import { Button, Flex } from '@mantine/core'

const Header = (): JSX.Element => {
	const router = useRouter()
	const pathname = usePathname()
	const { signOut } = useClerk()
	return (
		<Flex h={64} component="header" align="center" justify="space-between">
			<Flex gap="sm">
				<Button
					size="xs"
					radius="xl"
					title="Dashboard"
					onClick={() => router.push('/dashboard')}
					variant={pathname === '/dashboard' ? 'filled' : 'subtle'}
				>
					Home
				</Button>
				<Button
					size="xs"
					radius="xl"
					title="Subscriptions"
					onClick={() => router.push('/subscriptions')}
					variant={pathname === '/subscriptions' ? 'filled' : 'subtle'}
				>
					Subscriptions
				</Button>
			</Flex>
			<Button
				size="xs"
				color="red.4"
				title="Logout"
				variant="subtle"
				onClick={() => signOut(() => router.push('/'))}
			>
				Logout
			</Button>
		</Flex>
	)
}
export default Header
