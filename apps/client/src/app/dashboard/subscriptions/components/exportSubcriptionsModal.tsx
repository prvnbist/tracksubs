import { useState } from 'react'
import { json2csv } from 'json-2-csv'

import { useMap } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Button, Group, Space, Stack, TextInput } from '@mantine/core'

import { downloadCSV, track } from 'utils'

import { subscription_export } from '../action'

const ExportSubscriptionsModal = () => {
	const [loading, setStatus] = useState(false)
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

	const onExport = async () => {
		try {
			track('btn-export-subscription')
			setStatus(true)

			const notification_id = notifications.show({
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

			const result = await subscription_export(list)

			if (result.status === 'ERROR') {
				return notifications.show({
					color: 'red.5',
					title: 'Export Failed',
					message: result.message,
				})
			}

			const csv = await json2csv(result.data)

			await downloadCSV(csv, 'tracksubs_subscriptions')

			notifications.hide(notification_id)
		} catch (error) {
			notifications.show({
				color: 'red.5',
				title: 'Export Failed',
				message: 'Failed to export the susbcriptions data, please try again!',
			})
		} finally {
			setStatus(false)
		}
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
