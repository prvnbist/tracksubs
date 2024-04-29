'use client'

import { useMemo } from 'react'

import { Box, Card, Center, RingProgress, Space, Text, Title } from '@mantine/core'

import { useGlobal } from 'state/global'

const ALLOWED_SUBSCRIPTIONS = 10

export default function Page() {
	const { user } = useGlobal()

	const color = useMemo(() => {
		const count = user.total_subscriptions
		if (count > 0 && count <= 5) return 'green'
		else if (count > 5 && count <= 8) return 'orange'
		else if (count > 8) return 'red.6'
		else return 'dark.4'
	}, [user.total_subscriptions])

	return (
		<div>
			<Space h={24} />
			<Title order={2}>Usage</Title>
			<Space h={16} />
			<Box w={480}>
				<Card withBorder>
					<Title order={4}>Subscriptions</Title>
					<Text c="dimmed" size="sm">
						Selected plan allows you to create upto {ALLOWED_SUBSCRIPTIONS} subscriptions.
					</Text>
					<Center>
						<RingProgress
							label={
								<Center>
									<Text>
										{user.total_subscriptions}/{ALLOWED_SUBSCRIPTIONS}
									</Text>
								</Center>
							}
							roundCaps
							size={160}
							thickness={20}
							sections={[
								{
									color,
									tooltip: 'Used',
									value: user.total_subscriptions * 10,
								},
							]}
						/>
					</Center>
				</Card>
			</Box>
		</div>
	)
}
