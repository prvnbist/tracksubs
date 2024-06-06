'use client'

import { Card, Center, RingProgress, SimpleGrid, Space, Text, Title } from '@mantine/core'

import { PLANS } from 'constants/index'
import { useGlobal } from 'state/global'

const usageBasedColor = (usage: number) => {
	switch (true) {
		case usage <= 1 / 3:
			return 'green'
		case usage > 1 / 3 && usage <= 2 / 3:
			return 'orange'
		case usage > 2 / 3:
			return 'red.6'
		default:
			return 'dark.7'
	}
}

export default function Page() {
	const { user } = useGlobal()

	const plan = PLANS[user.plan]!

	return (
		<div>
			<Space h={24} />
			<Title order={2}>Usage</Title>
			<Space h={16} />
			<SimpleGrid cols={{ base: 1, xs: 1, md: 2 }}>
				<Card withBorder>
					<Title order={4}>Subscriptions</Title>
					<Text c="dimmed" size="sm">
						Selected plan allows you to create upto {plan.subscriptions} subscriptions.
					</Text>
					<Center>
						<RingProgress
							label={
								<Center>
									<Text>
										{user.usage.total_subscriptions}/{plan.subscriptions}
									</Text>
								</Center>
							}
							roundCaps
							size={160}
							thickness={20}
							sections={
								user.usage.total_subscriptions > 0
									? [
											{
												tooltip: 'Used',
												color: usageBasedColor(
													user.usage.total_subscriptions / plan.subscriptions
												),
												value:
													user.usage.total_subscriptions * (100 / plan.subscriptions),
											},
										]
									: []
							}
						/>
					</Center>
				</Card>
				<Card withBorder>
					<Title order={4}>Alerts</Title>
					<Text c="dimmed" size="sm">
						Selected plan allows you to set upto {plan.alerts} alerts.
					</Text>
					<Center>
						<RingProgress
							label={
								<Center>
									<Text>
										{user.usage.total_alerts}/{plan.alerts}
									</Text>
								</Center>
							}
							roundCaps
							size={160}
							thickness={20}
							sections={
								user.usage.total_alerts > 0
									? [
											{
												tooltip: 'Used',
												value: user.usage.total_alerts * (100 / plan.alerts),
												color: usageBasedColor(user.usage.total_alerts / plan.alerts),
											},
										]
									: []
							}
						/>
					</Center>
				</Card>
			</SimpleGrid>
		</div>
	)
}
