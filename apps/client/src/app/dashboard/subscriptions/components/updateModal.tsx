'use client'

import dayjs from 'dayjs'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { Button, Group, NumberInput, Select, Stack, TextInput } from '@mantine/core'

import type { ISubscription } from 'types'
import { useGlobal } from 'state/global'
import { CURRENCIES, CYCLES } from 'consts'

import { subscriptions_update } from '../action'

const diff = (obj1: any, obj2: any) => {
	const result: any = {}

	for (const key in obj1) {
		const _key = key as keyof ISubscription
		if (obj2[_key] !== undefined && obj1[_key] !== obj2[_key]) {
			result[_key] = obj2[_key]
		}
	}

	return result
}

type ExcludedKeys =
	| 'email_alert'
	| 'id'
	| 'is_active'
	| 'next_billing_date'
	| 'payment_method_id'
	| 'service'

type FormValues = Omit<ISubscription, ExcludedKeys>

const UpdateModal = ({ subscription }: { subscription: ISubscription }) => {
	const queryClient = useQueryClient()

	const { user, services } = useGlobal()
	const [service, setService] = useState<string | null>(subscription.service || null)

	const [nextBillingDate, setNextBillingDate] = useState<Date | null>(
		new Date(subscription.next_billing_date) || null
	)

	const cachedCurrencies = useMemo(() => CURRENCIES, [])
	const cachedServices = useMemo(
		() => Object.values(services).map(s => ({ value: s.key, label: s.title })),
		[services]
	)

	const form = useForm<FormValues>({
		initialValues: {
			amount: subscription.amount / 100,
			currency: subscription.currency,
			interval: subscription.interval,
			title: subscription.title,
			user_id: subscription.user_id,
			website: subscription.website,
		},
		validate: {
			title: value => (!value?.trim() ? 'Please enter the service name' : ''),
			amount: value => (value === 0 ? 'Please enter a valid amount' : ''),
		},
	})

	const { execute, isPending } = useAction(subscriptions_update, {
		onSuccess: () => {
			notifications.show({
				color: 'green',
				title: 'Success',
				message: `Successfully updated the subscription - ${form.values.title}`,
			})
			queryClient.invalidateQueries({ queryKey: ['user'] })
			queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
			form.reset()
			modals.closeAll()
		},
		onError: () => {
			notifications.show({
				color: 'red',
				title: 'Error',
				message: 'Failed to update the subscription',
			})
		},
	})

	useEffect(() => {
		if (service) {
			const selected = services[service]
			if (selected) {
				form.setFieldValue('title', selected.title)
				form.setFieldValue('website', selected.website)
			}
		}
	}, [service, services, form.setFieldValue])

	const handleSubmit = async () => {
		if (!nextBillingDate) {
			return notifications.show({
				color: 'orange',
				title: 'Warning',
				message: 'Please select the next billing date.',
			})
		}

		const data = form.values

		data.amount = data.amount * 100
		data.website = data.website || null

		await execute({
			id: subscription.id,
			body: {
				...data,
				service,
				next_billing_date: dayjs(nextBillingDate).format('YYYY-MM-DD') ?? null,
			},
		})
	}

	return (
		<Stack>
			<Select
				searchable
				label="Service"
				value={service}
				data={cachedServices}
				onChange={setService}
				placeholder="Select a service"
			/>
			<TextInput
				required
				label="Title"
				placeholder="Enter the title ex: Netflix"
				{...form.getInputProps('title')}
			/>
			<TextInput
				label="Website"
				placeholder="Enter the website url"
				{...form.getInputProps('website')}
			/>
			<NumberInput
				min={0}
				required
				hideControls
				label="Amount"
				decimalScale={2}
				thousandSeparator=","
				allowNegative={false}
				placeholder="Enter the amount"
				{...form.getInputProps('amount')}
			/>
			<Select
				required
				clearable
				searchable
				label="Currency"
				data={cachedCurrencies}
				placeholder="Select a currency"
				{...form.getInputProps('currency')}
			/>
			<DatePickerInput
				required
				allowDeselect={false}
				minDate={new Date()}
				label="Next Billing Date"
				placeholder="Select next billing date"
				value={nextBillingDate}
				onChange={setNextBillingDate}
			/>
			<Select
				required
				label="Cycle"
				data={CYCLES}
				allowDeselect={false}
				placeholder="Choose a cycle"
				{...form.getInputProps('interval')}
			/>
			<Group justify="flex-end">
				<Button onClick={handleSubmit} disabled={isPending} loading={isPending}>
					Save
				</Button>
			</Group>
		</Stack>
	)
}

export default UpdateModal
