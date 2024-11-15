import dayjs from 'dayjs'
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

import { currencyFormatter } from 'utils'

type Interval = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

const INTERVALS: { [key in Interval]: string } = {
	MONTHLY: 'Monthly',
	QUARTERLY: 'Quarterly',
	YEARLY: 'Yearly',
}

type CommonProps = {
	collaboratorName: string
	collaboratorShare: number
	ownerName: string
	subscriptionAmount: number
	subscriptionCurrency: string
	subscriptionInterval: Interval
	subscriptionNextBillingDate: string
	subscriptionSplitStrategy: 'EQUALLY' | 'UNEQUALLY' | 'PERCENTAGE'
	subscriptionTitle: string
	type: 'ADDED' | 'REMOVED'
}

export default function Common({
	collaboratorName = 'Sumit',
	collaboratorShare = 100,
	ownerName = 'Praveen',
	subscriptionAmount = 649,
	subscriptionCurrency = 'INR',
	subscriptionInterval = 'MONTHLY',
	subscriptionNextBillingDate = '2024-11-15',
	subscriptionSplitStrategy = 'EQUALLY',
	subscriptionTitle = 'Netflix',
	type = 'ADDED',
}: CommonProps) {
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
								You have been {type === 'ADDED' ? 'added to' : 'removed from'} the
								subscription: {subscriptionTitle} as a collaborator by {ownerName}.
							</Text>
						</Section>
						<Row className="py-[6px] border-b border-solid border-slate-200 mt-[-1px]">
							<Column className="text-sm font-medium text-slate-700">Frequency</Column>
							<Column align="right" className="text-sm text-slate-700">
								{INTERVALS[subscriptionInterval as Interval]}
							</Column>
						</Row>
						<Row className="py-[6px] border-b border-solid border-slate-200 mt-[-1px]">
							<Column className="text-sm font-medium text-slate-700">
								Next Billing Date
							</Column>
							<Column align="right" className="text-sm text-slate-700">
								{dayjs(subscriptionNextBillingDate).format('MMM DD, YYYY')}
							</Column>
						</Row>
						<Row className="py-[6px] border-b border-solid border-slate-200 mt-[-1px]">
							<Column className="text-sm font-medium text-slate-700">Amount</Column>
							<Column align="right" className="text-sm text-slate-700">
								{currencyFormatter(collaboratorShare, subscriptionCurrency)} (
								{currencyFormatter(subscriptionAmount, subscriptionCurrency)})
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
