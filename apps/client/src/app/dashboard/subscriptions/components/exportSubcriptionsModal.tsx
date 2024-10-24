import { json2csv } from 'json-2-csv'
import { useRef, useState } from 'react'

import { useMap } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { Button, Group, Space, Stack, TextInput } from '@mantine/core'

import { downloadCSV, track } from 'utils'

import { subscription_export } from '../action'
import { useAction } from 'next-safe-action/hooks'

const ExportSubscriptionsModal = () => {
	const [loading, setStatus] = useState(false)
	const notificationRef = useRef<string | null>(null)
	const columns = useMap([
		['title', 'Title'],
		['website', 'Website'],
		['amount', 'Amount'],
		['currency', 'Currency'],
		['frequency', 'Frequency'],
		['interval', 'Interval'],
		['is_active', 'Is Active'],
		['next_billing_date', 'Next Billing Date'],
	])

	const isValid = Array.from(columns.entries()).every(([, value]) => value.trim())

	const { execute } = useAction(subscription_export, {
		onSuccess: async ({ data }) => {
			track('btn-export-subscription')
			const csv = await json2csv(data!)

			await downloadCSV(csv, 'tracksubs_subscriptions')

			modals.closeAll()
		},
		onError: ({ error }) => {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: error.serverError || 'Failed to export the subscriptions',
			})
		},
		onSettled: () => {
			setStatus(false)
			if (notificationRef.current) {
				notifications.hide(notificationRef.current)
			}
		},
	})

	const onExport = async () => {
		setStatus(true)

		notificationRef.current = notifications.show({
			color: 'green',
			loading: true,
			title: 'Exporting Subscriptions',
			message: 'Please wait while we prepare to export your subscriptions data.',
		})

		const list = Array.from(columns.entries()).reduce(
			(acc: Record<string, string>, [key, value]) => {
				acc[key] = value
				return acc
			},
			{}
		)

		await execute({ columns: list })
	}

	return (
		<>
			<Stack>
				{Array.from(columns.entries()).map(([key, value]) => (
					<Group key={key}>
						<TextInput flex={1} readOnly disabled defaultValue={key} />
						<TextInput
							flex={1}
							value={value}
							onChange={e => columns.set(key, e.target.value)}
						/>
					</Group>
				))}
			</Stack>
			<Space h={16} />
			<Button fullWidth disabled={!isValid || loading} loading={loading} onClick={onExport}>
				Export
			</Button>
		</>
	)
}

export default ExportSubscriptionsModal
