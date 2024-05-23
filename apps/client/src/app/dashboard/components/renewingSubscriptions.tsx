import { IconInfoCircle } from '@tabler/icons-react'
import { Paper, Group, Title, Stack, Space, Tooltip, Text, SimpleGrid } from '@mantine/core'

const RenewingSubscriptions = ({ data }: { data: { this_week: number; this_month: number } }) => {
	return (
		<Paper p="xl" withBorder shadow="md">
			<Group gap={8}>
				<Title order={4}>Renewal</Title>
				<Tooltip
					multiline
					offset={8}
					position="top"
					color="dark.6"
					label="*Filtered by selected currency"
					transitionProps={{ transition: 'fade-up', duration: 300 }}
				>
					<IconInfoCircle size={16} />
				</Tooltip>
			</Group>
			<Space h={24} />
			<SimpleGrid cols={2}>
				<Stack>
					<Title c="dimmed" size="13px" tt="uppercase">
						This Week
					</Title>
					<Text title="Active" size="48px" ff="monospace">
						{data.this_week}
					</Text>
				</Stack>
				<Stack>
					<Title c="dimmed" size="13px" tt="uppercase">
						This Month
					</Title>
					<Text title="Active" size="48px" ff="monospace">
						{data.this_month}
					</Text>
				</Stack>
			</SimpleGrid>
		</Paper>
	)
}

export default RenewingSubscriptions
