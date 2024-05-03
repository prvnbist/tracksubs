import { Fragment } from 'react'
import { Tailwind } from '@react-email/tailwind'
import {
	Body,
	Column,
	Container,
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
import { CURRENCY_NAMES } from 'constants/index'

type Subscription = { id: string; amount: number; currency: string; title: string }

type RenewalAlertProps = {
	firstName: string
	subscriptions: Array<Subscription>
}

type ByCurrency = Record<string, { total: number; currency: string; list: Array<Subscription> }>

export default function RenewalAlert({ firstName = '', subscriptions = [] }: RenewalAlertProps) {
	const byCurrency = Object.values(
		subscriptions.reduce((acc: ByCurrency, curr) => {
			const { currency } = curr

			const item = acc[currency]

			if (item) {
				item.list.push(curr)
				item.total += curr.amount
			} else {
				acc[currency] = { total: curr.amount, currency, list: [curr] }
			}

			return acc
		}, {})
	)

	return (
		<Html>
			<Head />
			<Tailwind>
				<Body
					className="bg-white my-auto mx-auto font-sans px-2"
					style={{
						fontFamily:
							'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
					}}
				>
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
							<Text>Following subscription/s will be renewed tomorrow.</Text>
						</Section>
						<Section>
							<Row>
								<Column className="text-xs uppercase font-bold text-slate-500 py-2">
									Title
								</Column>
								<Column
									align="right"
									className="text-xs uppercase font-bold text-slate-500 py-2"
								>
									Amount
								</Column>
							</Row>
							{byCurrency.map(item => {
								return (
									<Fragment key={item.currency}>
										<Row className="py-1 border-b border-solid border-slate-200">
											<Column align="right" className="text-sm text-slate-700">
												{CURRENCY_NAMES.of(item.currency)}
											</Column>
										</Row>
										{item.list.map(subcription => (
											<Row
												key={subcription.id}
												className="py-[6px] border-b border-solid border-slate-200 mt-[-1px]"
											>
												<Column className="text-sm font-medium text-slate-700">
													{subcription.title}
												</Column>
												<Column align="right" className="text-sm text-slate-700">
													{currencyFormatter(
														subcription.amount / 100,
														subcription.currency
													)}
												</Column>
											</Row>
										))}
										<Row className="py-[6px]">
											<Column className="text-sm font-medium text-slate-700">
												Total
											</Column>
											<Column align="right" className="text-sm text-slate-700">
												{currencyFormatter(item.total / 100, item.currency)}
											</Column>
										</Row>
										<div style={{ height: '16px' }} />
									</Fragment>
								)
							})}
						</Section>
						<Section>
							<Link
								href="https://www.tracksubs.co/dashboard"
								className="text-black text-sm bg-yellow-400 py-2 px-3 rounded"
							>
								Go to your dashboard
							</Link>
						</Section>
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
