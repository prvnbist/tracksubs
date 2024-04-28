import * as React from 'react'

import { Tailwind } from '@react-email/tailwind'
import {
	Body,
	Button,
	Column,
	Container,
	Font,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Row,
	Section,
	Text,
} from '@react-email/components'

export default function UserSignUp({ firstName }: { firstName: string }) {
	return (
		<Html>
			<Head>
				<Font
					fontFamily="Inter"
					fallbackFontFamily="sans-serif"
					webFont={{
						format: 'woff2',
						url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZNhiJ-Ek-_EeAmM.woff2',
					}}
				/>
			</Head>
			<Tailwind>
				<Body className="bg-white my-auto mx-auto font-sans px-2">
					<Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
						<Section>
							<Img
								className="w-16 mx-auto"
								src="https://res.cloudinary.com/prvnbist/image/upload/v1714121226/tracksubs_logo_bright.png"
							/>
							<Text className="text-[32px] text-center">TrackSubs</Text>
						</Section>
						<Hr />
						<Section className="">
							<Text>Hey{firstName ? ` ${firstName}` : ''},</Text>
							<Text>
								Thanks for signing up and welcome to{` `}
								<Link href="https://www.tracksubs.co">TrackSubs</Link>!
							</Text>
						</Section>
						<Link
							href="https://www.tracksubs.co/dashboard"
							className="text-black text-sm bg-yellow-400 py-2 px-3 rounded"
						>
							Go to your dashboard
						</Link>
						<Text>
							Best,
							<br />
							TrackSubs Team
						</Text>
						<Hr />
						<Row className="mt-4">
							<Column align="center">
								<Link
									href="https://www.tracksubs.co/privacy"
									className="underline text-gray-400 text-sm mr-3"
								>
									Privacy
								</Link>
								<Link
									href="https://www.tracksubs.co/terms-of-service"
									className="underline text-gray-400 text-sm"
								>
									Terms of Service
								</Link>
							</Column>
						</Row>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
