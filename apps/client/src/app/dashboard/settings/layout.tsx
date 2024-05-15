'use client'

import { usePathname, useRouter } from 'next/navigation'
import { IconChartPie2, IconCreditCard, IconFileInvoice, IconUser } from '@tabler/icons-react'

import { useMediaQuery } from '@mantine/hooks'
import { Box, Tabs } from '@mantine/core'

const CONTAINER_HEIGHT = 'calc(100dvh - 65px)'

export default function Layout({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()

	const isMobile = useMediaQuery('(max-width: 56.25em)')

	return (
		<Tabs
			h={CONTAINER_HEIGHT}
			orientation={isMobile ? 'horizontal' : 'vertical'}
			value={pathname.replace('/dashboard/settings/', '')}
			onChange={value => router.push(`/dashboard/settings/${value}`)}
		>
			<Tabs.List>
				<Tabs.Tab value="profile" leftSection={<IconUser size={18} />}>
					Profile
				</Tabs.Tab>
				<Tabs.Tab value="plan" leftSection={<IconFileInvoice size={18} />}>
					Plan
				</Tabs.Tab>
				<Tabs.Tab value="payment-methods" leftSection={<IconCreditCard size={18} />}>
					Payment Methods
				</Tabs.Tab>
				<Tabs.Tab value="usage" leftSection={<IconChartPie2 size={18} />}>
					Usage
				</Tabs.Tab>
			</Tabs.List>
			<Box pl={isMobile ? 0 : 24} w="100%">
				{children}
			</Box>
		</Tabs>
	)
}
