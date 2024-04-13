import { Center, Space, Stack, Text, Title } from '@mantine/core'

import NoiseBackground from 'assets/svgs/noise_background.svg'

const ErrorState = ({
	title = '',
	description = '',
	children,
}: {
	title: string
	description?: string
	children?: JSX.Element
}) => {
	return (
		<Center
			h={320}
			styles={{
				root: {
					backgroundSize: 'cover',
					backgroundPosition: 'center center',
					borderRadius: 'var(--mantine-radius-lg)',
					border: '1px solid var(--mantine-color-dark-5)',
					backgroundImage: `url(${NoiseBackground.src})`,
				},
			}}
		>
			<Stack gap={0} align="center" px={16}>
				<Title order={3}>{title}</Title>
				<Space h={12} />
				<Text c="dimmed" ta="center">
					{description}
				</Text>
				<Space h={16} />
				{children}
			</Stack>
		</Center>
	)
}

export default ErrorState
