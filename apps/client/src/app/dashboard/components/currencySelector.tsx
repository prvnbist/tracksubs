'use client'

import { use, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Select } from '@mantine/core'

import type { ActionResponse } from 'types'
import { CURRENCY_NAMES } from 'constants/index'

type CurrencySelectorProps = {
	selected: string | undefined
	data: ActionResponse<Array<{ currency: string }>, string>
}

const CurrencySelector = ({ data, selected }: CurrencySelectorProps) => {
	const currencies = use(data)

	const router = useRouter()

	const list = useMemo(() => {
		if (!currencies.data) return []

		if (currencies.data.length === 0 && selected)
			return [{ value: selected, label: CURRENCY_NAMES.of(selected) ?? '' }]

		return currencies.data.map(({ currency }) => ({
			value: currency,
			label: CURRENCY_NAMES.of(currency) ?? '',
		}))
	}, [currencies, selected])

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
