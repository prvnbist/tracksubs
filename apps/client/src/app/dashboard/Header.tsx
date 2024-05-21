'use client'

import Link from 'next/link'
import { useClerk } from '@clerk/clerk-react'
import { IconLogout, IconSettings } from '@tabler/icons-react'
import { usePathname, useRouter } from 'next/navigation'

import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { Avatar, Burger, Button, Flex, Menu, useComputedColorScheme } from '@mantine/core'

import Logo from 'assets/svgs/logo'
import { useGlobal } from 'state/global'

const Header = (): JSX.Element => {
	const router = useRouter()
	const { user } = useGlobal()
	const { signOut } = useClerk()

	const isMobile = useMediaQuery('(max-width: 56.25em)')

	const initials = `${user.first_name[0]}${user.last_name ? user.last_name[0] : ''}`

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

const MobileMenu = () => {
	const router = useRouter()
	const pathname = usePathname()

	const { user } = useGlobal()

	const [opened, { open, close }] = useDisclosure()

	const scheme = useComputedColorScheme()

	const goto = (path: string) => {
		router.push(path)
		close()
	}

	const color = scheme === 'light' ? 'yellow.8' : 'yellow'

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
					c={pathname === '/dashboard' ? color : ''}
					onClick={() => goto(`/dashboard/?currency=${user.currency}`)}
				>
					Dashboard
				</Menu.Item>
				<Menu.Item
					title="Subscriptions"
					onClick={() => goto('/dashboard/subscriptions')}
					c={pathname === '/dashboard/subscriptions' ? color : ''}
				>
					Subscriptions
				</Menu.Item>
				<Menu.Item
					title="Transactions"
					onClick={() => goto('/dashboard/transactions')}
					c={pathname === '/dashboard/transactions' ? color : ''}
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

	const { user } = useGlobal()

	const scheme = useComputedColorScheme()

	const color = scheme === 'light' ? 'default' : 'subtle'
	return (
		<Flex gap="sm">
			<Button
				size="xs"
				radius="xl"
				title="Dashboard"
				onClick={() => router.push(`/dashboard/?currency=${user.currency}`)}
				variant={pathname === '/dashboard' ? 'filled' : color}
			>
				Dashboard
			</Button>
			<Button
				size="xs"
				radius="xl"
				title="Subscriptions"
				onClick={() => router.push('/dashboard/subscriptions')}
				variant={pathname === '/dashboard/subscriptions' ? 'filled' : color}
			>
				Subscriptions
			</Button>
			<Button
				size="xs"
				radius="xl"
				title="Transactions"
				onClick={() => router.push('/dashboard/transactions')}
				variant={pathname === '/dashboard/transactions' ? 'filled' : color}
			>
				Transactions
			</Button>
		</Flex>
	)
}
