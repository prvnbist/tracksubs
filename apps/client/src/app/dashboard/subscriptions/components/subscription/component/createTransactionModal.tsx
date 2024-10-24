import dayjs from 'dayjs'
import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useQueryClient } from '@tanstack/react-query'

import { modals } from '@mantine/modals'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { Button, Group, Select, Space, TextInput } from '@mantine/core'

import { track } from 'utils'
import type { ISubscription } from 'types'
import { useGlobal } from 'state/global'

import { transaction_create } from '../../../action'

const CreateTransactionModal = ({ subscription }: { subscription: ISubscription }) => {
	const queryClient = useQueryClient()

	const { payment_methods } = useGlobal()

	const [paidOn, setPaidOn] = useState<Date>(new Date())
	const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null)

	const { execute } = useAction(transaction_create, {
		onSuccess: async () => {
			await track('btn-create-transaction')

			queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
			queryClient.invalidateQueries({ queryKey: ['transactions'] })

			modals.closeAll()

			notifications.show({
				color: 'green',
				title: 'Success',
				message: 'Successfully created the transaction.',
			})
		},
		onError: () => {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: 'Failed to create a transaction.',
			})
		},
	})

	const create = () =>
		execute({
			...(paymentMethodId && { paymentMethodId }),
			amount: subscription.amount,
			currency: subscription.currency,
			id: subscription.id,
			next_billing_date: dayjs(subscription.next_billing_date).format('YYYY-MM-DD'),
			paidOn: dayjs(paidOn).format('YYYY-MM-DD'),
		})

	return (
		<div>
			<TextInput readOnly disabled label="Title" defaultValue={subscription.title} />
			<Space h={16} />
			<TextInput readOnly disabled label="Website" defaultValue={subscription.website ?? ''} />
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
			<Button fullWidth disabled={!paidOn} onClick={create}>
				Create Transaction
			</Button>
		</div>
	)
}

export default CreateTransactionModal
