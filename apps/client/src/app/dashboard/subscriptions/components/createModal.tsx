'use client'

import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { Button, Group, NumberInput, Select, Space, TextInput } from '@mantine/core'

import { ISubscription } from 'types'
import { useGlobal } from 'state/global'
import { CURRENCIES, CYCLES } from 'constants/index'
import { subscriptions_create, subscriptions_update } from 'actions'

const diff = (obj1: any, obj2: any) => {
	const result: any = {}

	for (let key in obj1) {
		let _key = key as keyof ISubscription
		if (obj2[_key] !== undefined && obj1[_key] !== obj2[_key]) {
			result[_key] = obj2[_key]
		}
	}

	return result
}

const CreateModal = ({ subscription }: { subscription?: ISubscription }) => {
	const queryClient = useQueryClient()

	const { user, services } = useGlobal()
	const [service, setService] = useState<string | null>(subscription?.service ?? null)

	const memoizedCurrencies = useMemo(() => CURRENCIES, [])
	const cachedServices = useMemo(
		() => Object.values(services).map(s => ({ value: s.key, label: s.title })),
		[services]
	)

	const form = useForm<Partial<ISubscription>>({
		initialValues: {
			title: subscription?.title ?? '',
			website: subscription?.website ?? '',
			service: subscription?.service ?? null,
			interval: subscription?.interval ?? 'MONTHLY',
			currency: subscription?.currency ?? (user.currency || 'INR'),
			next_billing_date: subscription?.next_billing_date ?? null,
			amount: subscription?.amount ? subscription?.amount / 100 : 0,
		},
		validate: {
			title: value => (!value?.trim() ? 'Please enter the service name' : ''),
			amount: value => (value === 0 ? 'Please enter a valid amount' : ''),
			next_billing_date: value => (!value ? 'Please select billing date' : ''),
		},
	})

	useEffect(() => {
		if (service) {
			const selected = services[service]
			if (selected) {
				form.setFieldValue('title', selected.title)
				form.setFieldValue('website', selected.website)
				form.setFieldValue('service', service)
			}
		}
	}, [service])

	const handleSubmit = async () => {
		const data = { ...form.values }

		try {
			data.amount = (data?.amount ?? 0) * 100
			data.next_billing_date = dayjs(data.next_billing_date).format('YYYY-MM-DD')

			let result: any

			if (subscription?.id) {
				const diffResult = diff(subscription, data)
				result = await subscriptions_update(subscription.id, diffResult)
			} else {
				result = await subscriptions_create(data)
			}

			if (result.status === 'ERROR') {
				return notifications.show({
					color: 'red.4',
					title: 'Error',
					message: result.message,
				})
			}

			notifications.show({
				color: 'green',
				title: 'Success',
				message: `Successfully ${subscription?.id ? 'updated' : 'created'} the subscription - ${data.title}`,
			})

			queryClient.invalidateQueries({ queryKey: ['user'] })
			queryClient.invalidateQueries({ queryKey: ['subscriptions'] })

			form.reset()
			modals.closeAll()
		} catch (error) {
			notifications.show({
				color: 'red',
				title: 'Failed',
				message: `Failed to ${subscription?.id ? 'update' : 'create'} the subscription - ${data.title}`,
			})
		}
	}

	return (
		<>
			<Select
				searchable
				label="Service"
				value={service}
				data={cachedServices}
				onChange={setService}
				placeholder="Select a service"
			/>
			<Space h={16} />
			<TextInput
				required
				label="Title"
				placeholder="Enter the title ex: Netflix"
				{...form.getInputProps('title')}
			/>
			<Space h={16} />
			<TextInput
				label="Website"
				placeholder="Enter the website url"
				{...form.getInputProps('website')}
			/>
			<Space h={16} />
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
			<Space h={16} />
			<Select
				required
				clearable
				searchable
				label="Currency"
				data={memoizedCurrencies}
				placeholder="Select a currency"
				{...form.getInputProps('currency')}
			/>
			<Space h={16} />
			<DatePickerInput
				required
				allowDeselect={false}
				minDate={new Date()}
				label="Next Billing Date"
				placeholder="Select next billing date"
				{...form.getInputProps('next_billing_date')}
			/>
			<Space h={16} />
			<Select
				required
				label="Cycle"
				data={CYCLES}
				allowDeselect={false}
				placeholder="Choose a cycle"
				{...form.getInputProps('interval')}
			/>
			<Space h={16} />
			<Group justify="flex-end" mt="md">
				<Button onClick={handleSubmit}>Save</Button>
			</Group>
		</>
	)
}

export default CreateModal
