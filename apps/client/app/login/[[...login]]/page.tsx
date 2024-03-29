import { dark } from '@clerk/themes'
import { SignIn } from '@clerk/nextjs'

import { Center } from '@mantine/core'

export default function Page() {
	return (
		<Center pt="lg">
			<SignIn
				appearance={{
					baseTheme: dark,
				}}
			/>
		</Center>
	)
}
