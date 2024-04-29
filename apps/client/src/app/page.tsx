'use client'
import Link from 'next/link'
import Image from 'next/image'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useGate } from 'statsig-react'
import {
	Anchor,
	Badge,
	Button,
	Container,
	Flex,
	Group,
	Space,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { isEmail } from '@mantine/form'
import { notifications } from '@mantine/notifications'

import Logo from 'assets/svgs/logo'
import { waitlist_add } from 'actions'

import classes from './page.module.css'

export default function Page(): JSX.Element {
	const { isLoaded, isSignedIn } = useUser()
	const { value: is_signup_allowed } = useGate('is_signup_allowed')

	const [email, setEmail] = useState('')

	const subscribe = async () => {
		try {
			if (!!email.trim()) {
				if (isEmail('ERROR')(email.trim()) === 'ERROR') {
					return notifications.show({
						title: 'Warning',
						message: 'Please enter a valid email.',
					})
				}

				const result = await waitlist_add(email.trim())

				if (result.status === 'ERROR') {
					if (result.message === 'ALREADY_ADDED') {
						return notifications.show({
							message: `You're already added to the waitlist👋🏽`,
						})
					} else {
						throw Error()
					}
				}

				notifications.show({
					title: 'Added',
					message: 'Successfully added you to the waitlist, cheers🍾',
				})

				setEmail('')
			}
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Unable to join the waitlist, please try again!',
			})
		}
	}
	return (
		<main>
			<Flex component="header" align="center" h="90dvh" className={classes.header}>
				{!is_signup_allowed && (
					<Badge variant="light" color="pink" className={classes.coming_soon}>
						Coming Soon
					</Badge>
				)}
				<Flex direction="column" align="center" justify="center" w="100%">
					<Logo size={120} />
					<Space h={8} />
					<Title>Track Subs</Title>
					<Space h={8} />
					<Text ta="center" size="18px" px={16} w={380} style={{ lineHeight: '24px' }}>
						Streamline your finances and stay on top of recurring expenses effortlessly.
					</Text>
					<Space h={16} />
					<Group gap={16}>
						{is_signup_allowed && isLoaded ? (
							isSignedIn ? (
								<Link href="/dashboard">
									<Button>Go to dashboard</Button>
								</Link>
							) : (
								<Link href="/login">
									<Button>Get Started</Button>
								</Link>
							)
						) : (
							<Stack>
								<Group>
									<TextInput
										w={280}
										value={email}
										placeholder="example@gmail.com"
										onChange={e => setEmail(e.target.value)}
									/>
									<Button onClick={subscribe}>Join Waitlist</Button>
								</Group>
							</Stack>
						)}
					</Group>
				</Flex>
			</Flex>
			<Flex
				align="center"
				component="section"
				bg="var(--mantine-color-dark-6)"
				className={classes.fold_1_wrapper}
			>
				<Container w="100%" className={classes.fold_1_content}>
					<div>
						<div>
							<Stack gap={4}>
								<Image
									src="/images/hulu_card.svg"
									width="260"
									height="60"
									alt="hulu_card"
								/>
								<Image
									src="/images/netflix_card.svg"
									width="260"
									height="60"
									alt="netflix_card"
								/>
								<Image
									src="/images/disney_plus_card.svg"
									width="260"
									height="60"
									alt="disney_plus_card"
								/>
							</Stack>
						</div>
					</div>
					<div>
						<Title order={2} textWrap="balance">
							Stay on Top of Your Subscriptions
						</Title>
						<Space h={16} />
						<Text size="lg">
							Easily track subscriptions, no more spreadsheets or forgetting payments with
							our intuitive system.
						</Text>
					</div>
				</Container>
			</Flex>
			<Group py={16} gap={16} justify="center">
				<Anchor
					c="white"
					target="_blank"
					component={Link}
					underline="hover"
					rel="noreferrer noopener"
					href="https://github.com/prvnbist/tracksubs"
				>
					Github
				</Anchor>
				<Anchor c="white" component={Link} href="/changelog" underline="hover">
					Changelog
				</Anchor>
				<Anchor c="white" component={Link} href="/privacy" underline="hover">
					Privacy
				</Anchor>
				<Anchor c="white" component={Link} href="/terms-of-service" underline="hover">
					Terms of Service
				</Anchor>
			</Group>
		</main>
	)
}
