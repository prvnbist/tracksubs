import { currencyFormatter } from 'utils'
import { Tailwind } from '@react-email/tailwind'
import {
	Body,
	Column,
	Container,
	Font,
	Head,
	Hr,
	Html,
	Img,
	Link,
	Row,
	Section,
	Text,
} from '@react-email/components'

type ChangedProps = {
	fromShare: number
	toShare: number
	collaboratorName: string
	ownerName: string
	subscriptionTitle: string
	subscriptionAmount: number
	subscriptionCurrency: string
	subscriptionSplitStrategy: 'CUSTOM'
}

export default function Changed({
	fromShare = 162.25,
	toShare = 100,
	collaboratorName = 'Sumit',
	ownerName = 'Praveen',
	subscriptionTitle = 'Netflix',
	subscriptionAmount = 649,
	subscriptionCurrency = 'INR',
	subscriptionSplitStrategy = 'CUSTOM',
}: ChangedProps) {
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
							<Text>Hey{collaboratorName ? ` ${collaboratorName}` : ''},</Text>
							<Text>
								Your share in the subscription: {subscriptionTitle} has been changed from{' '}
								{currencyFormatter(fromShare, subscriptionCurrency)} to{' '}
								{currencyFormatter(toShare, subscriptionCurrency)} by {ownerName}.
							</Text>
						</Section>
						<Row className="py-[6px] border-b border-solid border-slate-200 mt-[-1px]">
							<Column className="text-sm font-medium text-slate-700">Before</Column>
							<Column align="right" className="text-sm text-slate-700">
								{currencyFormatter(fromShare, subscriptionCurrency)}
							</Column>
						</Row>
						<Row className="py-[6px] border-b border-solid border-slate-200 mt-[-1px]">
							<Column className="text-sm font-medium text-slate-700">Now</Column>
							<Column align="right" className="text-sm text-slate-700">
								{currencyFormatter(toShare, subscriptionCurrency)}
							</Column>
						</Row>
						<Section className="mt-10" />
						<Link
							href="https://www.tracksubs.co/dashboard"
							className="text-black text-sm bg-yellow-400 py-2 px-3 rounded"
						>
							Go to your dashboard
						</Link>
						<Section className="mt-10" />
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
