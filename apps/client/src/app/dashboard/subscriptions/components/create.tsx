import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { DatePickerInput } from '@mantine/dates'
import { Button, Group, NumberInput, Select, Space, TextInput } from '@mantine/core'

import { useGlobal } from 'state/global'
import { subscriptions_create } from 'actions'
import { CURRENCIES, CYCLES } from 'constants/index'

const Create = () => {
	const { user, services } = useGlobal()
	const [service, setService] = useState<string | null>(null)

	const memoizedCurrencies = useMemo(() => CURRENCIES, [])
	const cachedServices = useMemo(
		() => services.map(s => ({ value: s.key, label: s.title })),
		[services]
	)

	const form = useForm({
		initialValues: {
			title: '',
			website: '',
			amount: 0,
			currency: 'INR',
			next_billing_date: null,
			interval: 'MONTHLY',
		},
		validate: {
			title: value => (!value.trim() ? 'Please enter the service name' : ''),
			amount: value => (value === 0 ? 'Please enter a valid amount' : ''),
			next_billing_date: value => (!value ? 'Please select billing date' : ''),
		},
		transformValues: values => ({
			...values,
			next_billing_date: dayjs(values.next_billing_date).format('YYYY-MM-DD'),
		}),
	})

	useEffect(() => {
		if (service) {
			const selected = services.find(s => s.key === service)
			if (selected) {
				form.setFieldValue('title', selected.title)
				form.setFieldValue('website', selected.website)
			}
		}
	}, [service])

	const handleSubmit = async () => {
		try {
			const result = await subscriptions_create({ user_id: user.id, ...form.values })
			if (result.status === 'ERROR') {
				// handle error
			}

			form.reset()
			modals.closeAll()
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<>
			<Select
				clearable
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

export default Create
