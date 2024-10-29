import { NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware((auth, req) => {
	const { userId } = auth()

	if (!userId && isDashboardRoute(req)) return NextResponse.redirect(new URL('/login', req.url))

	return NextResponse.next()
})

export const config = {
	matcher: ['/((?!.*\\..*|_next).*)', '/(api|trpc)(.*)'],
}
