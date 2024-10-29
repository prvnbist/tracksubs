'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { Select } from '@mantine/core'

import { CURRENCY_NAMES } from 'consts'

type CurrencySelectorProps = {
	currency: string
	data: Array<{ currency: string }>
}

const CurrencySelector = ({ data, currency }: CurrencySelectorProps) => {
	const router = useRouter()

	const list = useMemo(() => {
		if (!data) return []

		if (data.length === 0 && currency)
			return [{ value: currency, label: CURRENCY_NAMES.of(currency) ?? '' }]

		return data.map(({ currency }) => ({
			value: currency,
			label: CURRENCY_NAMES.of(currency) ?? '',
		}))
	}, [data, currency])

	return (
		<>
			<Select
				searchable
				data={list}
				value={currency}
				clearable={false}
				allowDeselect={false}
				onChange={value => router.push(`/dashboard/?currency=${value}`)}
			/>
		</>
	)
}

export default CurrencySelector
