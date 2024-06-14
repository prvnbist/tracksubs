'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Select } from '@mantine/core'

import { CURRENCY_NAMES } from 'constants/index'

type CurrencySelectorProps = {
	selected: string | undefined
	currencies: Array<{ currency: string }>
}

const CurrencySelector = ({ currencies, selected }: CurrencySelectorProps) => {
	const router = useRouter()

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
				value={selected}
				clearable={false}
				allowDeselect={false}
				onChange={value => router.push(`/dashboard/?currency=${value}`)}
			/>
		</>
	)
}

export default CurrencySelector
