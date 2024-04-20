import Link from 'next/link'
import { Metadata } from 'next'
import { IconArrowLeft } from '@tabler/icons-react'

import { Button, Container, List, Space, Text, Title } from '@mantine/core'

export const metadata: Metadata = {
	title: 'Terms of Service | TrackSubs',
}

export default function Page() {
	return (
		<Container py={120}>
			<Link href="/">
				<Button variant="outline" color="dark.2" leftSection={<IconArrowLeft size={18} />}>
					Home
				</Button>
			</Link>
			<Space h={32} />
			<Title order={2}>Terms & Conditions</Title>
			<Space h={16} />
			<Text c="dimmed">
				By downloading or utilizing the app, Chrome extension, and website, you automatically
				agree to these terms. Therefore, it's essential to carefully read them before using the
				app. You are not permitted to copy or alter the app, any of its components, or our
				trademarks in any manner. Attempting to extract the source code of the app or
				translating it into other languages, or creating derivative versions, is also
				prohibited. The app itself, along with all trademarks, copyrights, database rights, and
				other intellectual property rights associated with it, remain the property of TrackSubs
				and their licensors.
			</Text>
			<Space h={16} />
			<Text c="dimmed">
				TrackSubs ("tracksubs.co", "we", "us", and/or "our") developed the TrackSubs app with a
				commitment to ensuring its usefulness and efficiency. Hence, we retain the right to
				modify the app or introduce charges for its services, at our discretion and for any
				valid reason. Rest assured, we will never impose charges for the app or its services
				without transparently communicating the specifics of what you're paying for.
			</Text>
			<Space h={16} />
			<Text c="dimmed">
				The TrackSubs app stores and processes personal data provided by you to deliver our
				Service. Ensuring the security of your phone and access to the app is your
				responsibility. Therefore, we advise against jailbreaking or rooting your phone, which
				involves removing software restrictions imposed by the official operating system of your
				device. Such actions may expose your phone to malware, viruses, or malicious programs,
				compromise its security features, and potentially result in the TrackSubs app
				malfunctioning or becoming inoperable.
			</Text>
			<Space h={16} />
			<Text c="dimmed">
				The app utilizes third-party services, each of which has its own set of Terms and
				Conditions. You can find the links to the Terms and Conditions of these third-party
				service providers below:
			</Text>
			<Space h={16} />
			<ul>
				<li>
					<Link
						target="_blank"
						rel="noreferrer noopener"
						href="https://policies.google.com/privacy?hl=en-US"
					>
						Google Analytics
					</Link>
				</li>
			</ul>
			<Space h={16} />
			<Text c="dimmed">
				It's important to note that there are certain circumstances for which tracksubs.co
				cannot be held responsible. Some functionalities of the app necessitate an active
				internet connection. This connection can be through Wi-Fi or provided by your mobile
				network provider. However, tracksubs.co cannot assume responsibility if the app does not
				function at full capacity due to the absence of Wi-Fi or depletion of your data
				allowance.
			</Text>
			<Space h={16} />
			<Text c="dimmed">
				When using the app outside an area with Wi-Fi, it's important to remember that your
				agreement with your mobile network provider still applies. This means you may incur
				charges from your mobile provider for data usage while accessing the app, or other
				third-party charges. By using the app, you accept responsibility for such charges,
				including roaming data charges if you use the app outside your home territory (i.e.,
				region or country) without disabling data roaming. If you are not the bill payer for the
				device on which you're using the app, please ensure you have obtained permission from
				the bill payer to use the app.
			</Text>
			<Space h={16} />
			<Text c="dimmed">
				Similarly, tracksubs.co cannot always assume responsibility for how you use the app.
				It's your responsibility to ensure that your device remains charged. If your device runs
				out of battery and you're unable to access the Service, tracksubs.co cannot accept
				liability.
			</Text>
			<Space h={16} />
			<Text c="dimmed">
				Regarding tracksubs.co's responsibility for your use of the app, it's crucial to
				understand that while we strive to maintain accuracy and timeliness, we rely on third
				parties to furnish us with information to make it accessible to you. tracksubs.co cannot
				be held liable for any loss, whether direct or indirect, resulting from your complete
				reliance on this functionality of the app.
			</Text>
			<Space h={16} />
			<Text c="dimmed">
				At some juncture, we may contemplate updating the app. Currently, the app is accessible
				on various platforms, and the system requirements (including any additional systems we
				may choose to extend the app's availability to) could change. Consequently, you'll need
				to download updates if you wish to continue using the app. Please note that tracksubs.co
				does not guarantee continuous updates to ensure relevance or compatibility with the
				version installed on your device. Nonetheless, you agree to accept updates to the
				application when they are offered to you. Additionally, we reserve the right to cease
				providing the app and may terminate its use at any time without prior notice to you.
				Unless notified otherwise, upon termination: (a) the rights and licenses granted to you
				in these terms will cease; (b) you must discontinue using the app and, if necessary,
				remove it from your device.
			</Text>
			<Space h={24} />
			<Title order={3}>Changes to This Terms and Conditions</Title>
			<Space h={16} />
			<Text c="dimmed">
				TrackSubs reserves the right to update our Terms and Conditions periodically. Therefore,
				we recommend reviewing this page periodically for any changes. Any alterations will be
				communicated by posting the updated Terms and Conditions on this page.
			</Text>
			<Text c="dimmed">This policy is effective as of 2024-05-01</Text>
			<Space h={16} />
			<Text c="dimmed">
				If you have any questions or suggestions regarding my terms of services, please feel
				free to contact me at <Link href="mailto:prvnbist@gmail.com">prvnbist@gmail.com</Link>.
			</Text>
		</Container>
	)
}
