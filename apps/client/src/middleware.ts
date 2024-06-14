import { NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
const isOnboardingRoute = createRouteMatcher(['/onboarding'])

export default clerkMiddleware((auth, req) => {
	const { userId, sessionClaims } = auth()

	if (!userId && isOnboardingRoute(req)) {
		return NextResponse.redirect(new URL('/login', req.url))
	}

	if (userId && isOnboardingRoute(req)) {
		return NextResponse.next()
	}

	if (userId && !sessionClaims?.metadata?.is_onboarded) {
		return NextResponse.redirect(new URL('/onboarding', req.url))
	}

	if (userId && isDashboardRoute(req)) return NextResponse.next()
})

export const config = {
	matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
