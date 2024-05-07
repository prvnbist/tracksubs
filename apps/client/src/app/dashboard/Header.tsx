'use client'

import Link from 'next/link'
import { useClerk } from '@clerk/clerk-react'
import { IconLogout, IconSettings } from '@tabler/icons-react'
import { usePathname, useRouter } from 'next/navigation'

import { Avatar, Button, Flex, Menu } from '@mantine/core'

import Logo from 'assets/svgs/logo'
import { useGlobal } from 'state/global'

const Header = (): JSX.Element => {
	const router = useRouter()
	const { user } = useGlobal()
	const pathname = usePathname()
	const { signOut } = useClerk()

	const initials = `${user.first_name[0]}${user.last_name ? user.last_name[0] : ''}`

	return (
		<Flex h={64} component="header" align="center" justify="space-between">
			<Link href="/" title="Home">
				<Logo size={32} />
			</Link>
			<Flex gap="sm">
				<Button
					size="xs"
					radius="xl"
					title="Subscriptions"
					onClick={() => router.push('/dashboard/subscriptions')}
					variant={pathname === '/dashboard/subscriptions' ? 'filled' : 'subtle'}
				>
					Subscriptions
				</Button>
				<Button
					size="xs"
					radius="xl"
					title="Transactions"
					onClick={() => router.push('/dashboard/transactions')}
					variant={pathname === '/dashboard/transactions' ? 'filled' : 'subtle'}
				>
					Transactions
				</Button>
			</Flex>
			<Menu shadow="md" width={200} position="bottom-end">
				<Menu.Target>
					<Avatar
						size={30}
						src={user.image_url}
						alt={`${user.first_name} ${user.last_name}`}
						title={`${user.first_name} ${user.last_name}`}
					>
						{initials}
					</Avatar>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Item
						title="Settings"
						leftSection={<IconSettings size={18} />}
						onClick={() => router.push('/dashboard/settings/profile')}
					>
						Settings
					</Menu.Item>
					<Menu.Item
						color="red"
						title="Logout"
						leftSection={<IconLogout size={18} />}
						onClick={() => signOut(() => router.push('/'))}
					>
						Logout
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Flex>
	)
}
export default Header
