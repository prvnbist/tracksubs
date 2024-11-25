'use client'

import Link from 'next/link'
import { useClerk } from '@clerk/nextjs'
import { IconLogout, IconSettings } from '@tabler/icons-react'
import { usePathname, useRouter } from 'next/navigation'

import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { Avatar, Burger, Button, Flex, Menu } from '@mantine/core'

import Logo from 'assets/svgs/logo'
import { useGlobal } from 'state/global'
import { getInitials, getUserName } from 'utils'

const Header = (): JSX.Element => {
	const router = useRouter()
	const { user } = useGlobal()
	const { signOut } = useClerk()

	const isMobile = useMediaQuery('(max-width: 56.25em)')

	const initials = getInitials(getUserName(user))

	return (
		<Flex h={64} component="header" align="center" justify="space-between">
			<Link href="/" title="Home">
				<Logo size={32} />
			</Link>
			{isMobile ? <MobileMenu /> : <DesktopMenu />}
			<Menu shadow="md" width={200} position="bottom-end">
				<Menu.Target>
					<Avatar
						size={30}
						color="blue"
						name={initials}
						autoCapitalize="on"
						src={user.image_url}
						alt={`${user.first_name} ${user.last_name}`}
						title={`${user.first_name} ${user.last_name}`}
					/>
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
						onClick={() => signOut({ redirectUrl: '/' })}
					>
						Logout
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Flex>
	)
}
export default Header

const MobileMenu = () => {
	const router = useRouter()
	const pathname = usePathname()

	const [opened, { open, close }] = useDisclosure()

	const goto = (path: string) => {
		router.push(path)
		close()
	}

	return (
		<Menu
			shadow="md"
			width={200}
			position="bottom"
			closeOnEscape
			closeOnClickOutside
			closeOnItemClick
			onClose={() => close()}
		>
			<Menu.Target>
				<Burger
					size="sm"
					opened={opened}
					aria-label="Toggle navigation"
					onClick={() => (opened ? close() : open())}
				/>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					title="Dashboard"
					onClick={() => goto('/dashboard')}
					c={pathname === '/dashboard' ? 'yellow' : ''}
				>
					Dashboard
				</Menu.Item>
				<Menu.Item
					title="Subscriptions"
					onClick={() => goto('/dashboard/subscriptions')}
					c={pathname === '/dashboard/subscriptions' ? 'yellow' : ''}
				>
					Subscriptions
				</Menu.Item>
				<Menu.Item
					title="Transactions"
					onClick={() => goto('/dashboard/transactions')}
					c={pathname === '/dashboard/transactions' ? 'yellow' : ''}
				>
					Transactions
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	)
}

const DesktopMenu = () => {
	const router = useRouter()
	const pathname = usePathname()

	return (
		<Flex gap="sm">
			<Button
				size="xs"
				radius="xl"
				title="Dashboard"
				onClick={() => router.push('/dashboard')}
				variant={pathname === '/dashboard' ? 'filled' : 'subtle'}
			>
				Dashboard
			</Button>
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
	)
}
