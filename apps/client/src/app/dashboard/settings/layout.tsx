'use client'

import { usePathname, useRouter } from 'next/navigation'
import { IconCreditCard, IconUser } from '@tabler/icons-react'

import { ScrollArea, Tabs } from '@mantine/core'

const CONTAINER_HEIGHT = 'calc(100dvh - 65px)'

export default function Layout({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()

	return (
		<Tabs
			h={CONTAINER_HEIGHT}
			orientation="vertical"
			value={pathname.replace('/dashboard/settings/', '')}
			onChange={value => router.push(`/dashboard/settings/${value}`)}
		>
			<Tabs.List>
				<Tabs.Tab value="profile" leftSection={<IconUser size={18} />}>
					Profile
				</Tabs.Tab>
			</Tabs.List>
			<ScrollArea w="100%" h={CONTAINER_HEIGHT} px={24} type="scroll" offsetScrollbars>
				{children}
			</ScrollArea>
		</Tabs>
	)
}
