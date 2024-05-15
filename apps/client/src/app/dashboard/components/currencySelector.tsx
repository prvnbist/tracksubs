'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Select } from '@mantine/core'

import { CURRENCY_NAMES } from 'constants/index'

const CurrencySelector = ({ currencies }: { currencies: Array<{ currency: string }> }) => {
	const router = useRouter()
	const searchParams = useSearchParams()

	const currency = searchParams.get('currency')

	const list = useMemo(() => {
		return currencies.map(({ currency }) => ({
			value: currency,
			label: CURRENCY_NAMES.of(currency) ?? '',
		}))
	}, [currencies])

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
