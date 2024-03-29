import { Button, Text, Title } from '@mantine/core'
import { RegisterLink, LoginLink } from '@kinde-oss/kinde-auth-nextjs/components'

export default function Page(): JSX.Element {
	return (
		<main>
			<Title>Headings</Title>
			<Text>Paragraph</Text>
			<Button>Submit</Button>
			<LoginLink>Sign in</LoginLink>
			<RegisterLink>Sign up</RegisterLink>
		</main>
	)
}
