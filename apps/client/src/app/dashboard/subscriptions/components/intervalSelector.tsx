'use client'

import { useQueryState } from 'nuqs'

import { SegmentedControl } from '@mantine/core'

import { CYCLES } from 'consts'

const IntervalSelector = () => {
	const [interval, setInterval] = useQueryState('interval', {
		defaultValue: 'ALL',
		history: 'push',
		shallow: false,
	})
	return (
		<SegmentedControl
			size="sm"
			radius="sm"
			bg="dark.8"
			value={interval}
			withItemsBorders={false}
			onChange={value => setInterval(value)}
			data={[{ value: 'ALL', label: 'All' }, ...CYCLES]}
		/>
	)
}

export default IntervalSelector
