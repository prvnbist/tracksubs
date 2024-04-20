import Link from 'next/link'
import { Metadata } from 'next'
import { IconArrowLeft } from '@tabler/icons-react'

import { Button, Container, Space, Text, Title } from '@mantine/core'

export const metadata: Metadata = {
	title: 'Privacy | TrackSubs',
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
			<Title order={2}>Privacy Policy</Title>
			<Space h={16} />
			<Text c="dimmed">
				TrackSubs ("tracksubs.co", "we", "us", and/or "our") built the subscription tracking app
				as a Freemium app. This SERVICE is provided at no cost and is intended for use as is.
			</Text>
			<Space h={16} />
			<Text c="dimmed">
				This page serves to inform visitors about my policies concerning the collection,
				utilization, and disclosure of Personal Information should they choose to utilize my
				Service.
			</Text>
			<Space h={16} />
			<Text c="dimmed">
				By opting to utilize my Service, you consent to the collection and utilization of
				information in accordance with this policy. The Personal Information gathered is
				utilized for the provision and enhancement of the Service. I pledge not to employ or
				distribute your information to any party except as outlined in this Privacy Policy. The
				terminologies employed in this Privacy Policy carry the same connotations as those in
				our Terms and Conditions, accessible at Subs Tracker, unless explicitly defined
				differently herein.
			</Text>
			<Space h={24} />
			<Title order={3}>Information Collection and Use</Title>
			<Space h={16} />
			<Text c="dimmed">
				To enhance your experience with our Service, we may ask you to provide certain
				personally identifiable information, such as your Email ID, Profile Photo, and Full
				Name, through Google OAuth Login initiated by you. Please note that the app may utilize
				third-party services that collect information for identification purposes.
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
			<Space h={24} />
			<Title order={3}>Log Data</Title>
			<Space h={16} />
			<Text c="dimmed">
				I'd like to inform you that when you use my Service and encounter an error in the app, I
				collect data and information, including Log Data, through third-party products on your
				phone. This Log Data may comprise details such as your device's Internet Protocol ("IP")
				address, device name, operating system version, app configuration when using my Service,
				the time and date of your Service usage, and other pertinent statistics.
			</Text>
			<Space h={24} />
			<Title order={3}>Cookies</Title>
			<Space h={16} />
			<Text c="dimmed">
				Cookies are small data files commonly utilized as anonymous unique identifiers. They are
				sent to your browser from websites you visit and stored in your device's internal
				memory. While this Service does not explicitly utilize these "cookies," it may
				incorporate third-party code and libraries that do for information collection and
				service enhancement purposes. You have the choice to accept or decline these cookies and
				can be notified when a cookie is being sent to your device. However, declining our
				cookies may result in limited access to certain portions of this Service.
			</Text>
			<Space h={24} />
			<Title order={3}>Service Providers</Title>
			<Space h={16} />
			<Text c="dimmed">
				I may employ third-party companies and individuals due to the following reasons:
			</Text>
			<Space h={16} />
			<ul>
				<Text component="li" c="dimmed">
					To facilitate our Service;
				</Text>
				<Text component="li" c="dimmed">
					To provide the Service on our behalf;
				</Text>
				<Text component="li" c="dimmed">
					To perform Service-related services; or
				</Text>
				<Text component="li" c="dimmed">
					To assist us in analyzing how our Service is used.
				</Text>
			</ul>
			<Space h={16} />
			<Text c="dimmed">
				I wish to inform users of this Service that third parties may have access to their
				Personal Information. This access is necessary for them to carry out tasks assigned to
				them on our behalf. However, they are bound by obligation not to disclose or utilize the
				information for any other purpose.
			</Text>
			<Space h={24} />
			<Title order={3}>Security</Title>
			<Space h={16} />
			<Text c="dimmed">
				Your trust in providing us with your Personal Information is greatly valued, and we are
				dedicated to employing commercially acceptable measures to safeguard it. However, it's
				important to note that no method of transmission over the internet or electronic storage
				is entirely secure and reliable. Therefore, while we endeavor to maintain the highest
				standards of security, we cannot guarantee absolute security for your information.
			</Text>
			<Space h={24} />
			<Title order={3}>Links to Other Sites</Title>
			<Space h={16} />
			<Text c="dimmed">
				This Service might include links to other websites. Clicking on a third-party link will
				redirect you to that site. Please be aware that these external sites are not operated by
				me. Therefore, I strongly recommend reviewing the Privacy Policy of these websites. I do
				not have control over, nor do I assume responsibility for, the content, privacy
				policies, or practices of any third-party sites or services.
			</Text>
			<Space h={24} />
			<Title order={3}>Children’s Privacy</Title>
			<Space h={16} />
			<Text c="dimmed">
				I do not knowingly collect personally identifiable information from children. I
				encourage all children to refrain from submitting any personally identifiable
				information through the Application and/or Services. It is recommended that parents and
				legal guardians monitor their children's Internet usage and assist in enforcing this
				Policy by instructing their children not to provide personally identifiable information
				through the Application and/or Services without permission. If you suspect that a child
				has provided personally identifiable information to us through the Application and/or
				Services, please contact us. Additionally, you must be at least 16 years of age to
				consent to the processing of your personally identifiable information in your country
				(in some countries, we may allow your parent or guardian to do so on your behalf).
			</Text>
			<Space h={24} />
			<Title order={3}>Changes to This Privacy Policy</Title>
			<Space h={16} />
			<Text c="dimmed">
				I reserve the right to update our Privacy Policy periodically. Therefore, it's
				recommended that you review this page periodically for any changes. Any alterations will
				be communicated by posting the updated Privacy Policy on this page.
			</Text>
			<Space h={16} />
			<Text c="dimmed">This policy is effective as of 2024-05-01</Text>
			<Space h={24} />
			<Title order={3}>Contact Us</Title>
			<Space h={16} />
			<Text c="dimmed">
				If you have any questions or suggestions regarding my Privacy Policy, please feel free
				to contact me at <Link href="mailto:prvnbist@gmail.com">prvnbist@gmail.com</Link>.
			</Text>
		</Container>
	)
}
