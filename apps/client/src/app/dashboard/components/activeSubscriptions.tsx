import { IconInfoCircle } from '@tabler/icons-react'
import { Paper, Group, Title, Stack, Space, Tooltip, Text } from '@mantine/core'

const ActiveSubscriptions = ({ data }: { data: { active: number; total: number } }) => {
	return (
		<Paper p="xl" withBorder shadow="md">
			<Group gap={8}>
				<Title order={4}>Subscriptions</Title>
				<Tooltip
					multiline
					offset={8}
					position="top"
					color="dark.6"
					label={
						<Stack gap={4} p={4}>
							<Text>Active/Total</Text>
							<Text c="dimmed" size="sm">
								*Filtered by selected currency
							</Text>
						</Stack>
					}
					transitionProps={{ transition: 'fade-up', duration: 300 }}
				>
					<IconInfoCircle size={16} />
				</Tooltip>
			</Group>
			<Space h={24} />
			<Group gap={0}>
				<Text title="Active" size="48px" c="green.4" ff="monospace">
					{data.active}
				</Text>
				<Text title="Total" c="dimmed" size="48px" ff="monospace">
					/{data.total}
				</Text>
			</Group>
		</Paper>
	)
}

export default ActiveSubscriptions
