import dayjs from 'dayjs'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { modals } from '@mantine/modals'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { Button, Group, Select, Space, TextInput } from '@mantine/core'

import { ISubscription } from 'types'
import { useGlobal } from 'state/global'
import { transaction_create } from 'actions'

const CreateTransactionModal = ({ subscription }: { subscription: ISubscription }) => {
	const queryClient = useQueryClient()

	const { payment_methods } = useGlobal()

	const [paidOn, setPaidOn] = useState<Date>(new Date())
	const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null)

	const create = async () => {
		try {
			await transaction_create({ ...subscription, paidOn, paymentMethodId: paymentMethodId! })

			queryClient.invalidateQueries({ queryKey: ['subscriptions'] })

			modals.closeAll()

			notifications.show({
				color: 'green',
				title: 'Success',
				message: 'Successfully created the transaction.',
			})
		} catch (error) {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: 'Failed to create a transaction.',
			})
		}
	}

	return (
		<div>
			<TextInput readOnly disabled label="Title" defaultValue={subscription.title} />
			<Space h={16} />
			<TextInput readOnly disabled label="Website" defaultValue={subscription.website} />
			<Space h={16} />
			<Group gap={16}>
				<TextInput
					w={100}
					readOnly
					disabled
					label="Currency"
					defaultValue={subscription.currency}
				/>
				<TextInput
					flex={1}
					readOnly
					disabled
					label="Amount"
					defaultValue={subscription.amount / 100}
				/>
			</Group>
			<Space h={16} />
			<TextInput
				readOnly
				disabled
				label="Renewal Date"
				defaultValue={dayjs(subscription.next_billing_date).format('MMM DD, YYYY')}
			/>
			<Space h={16} />
			<DatePickerInput
				required
				label="Paid on"
				value={paidOn}
				minDate={new Date()}
				placeholder="Select billing date"
				onChange={value => setPaidOn(value!)}
			/>
			<Space h={16} />
			<Select
				searchable
				label="Payment Method"
				value={paymentMethodId}
				onChange={setPaymentMethodId}
				placeholder="Select a payment method"
				data={payment_methods.map(pm => ({ value: pm.id, label: pm.title }))}
			/>
			<Space h={16} />
			<Button fullWidth disabled={!paidOn || !paymentMethodId} onClick={create}>
				Create Transaction
			</Button>
		</div>
	)
}

export default CreateTransactionModal
