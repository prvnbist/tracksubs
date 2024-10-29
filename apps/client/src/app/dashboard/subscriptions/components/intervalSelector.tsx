'use client'

import { useQueryState } from 'nuqs'

import { SegmentedControl, useComputedColorScheme } from '@mantine/core'

import { CYCLES } from 'consts'

const IntervalSelector = () => {
	const scheme = useComputedColorScheme()

	const [interval, setInterval] = useQueryState('interval', {
		defaultValue: 'ALL',
		history: 'push',
		shallow: false,
	})
	return (
		<SegmentedControl
			size="sm"
			radius="sm"
			value={interval}
			withItemsBorders={false}
			bg={scheme === 'light' ? 'gray.3' : 'dark.8'}
			onChange={value => setInterval(value)}
			data={[{ value: 'ALL', label: 'All' }, ...CYCLES]}
		/>
	)
}

export default IntervalSelector