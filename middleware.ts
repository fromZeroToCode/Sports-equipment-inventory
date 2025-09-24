import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const loginRoute = request.nextUrl.pathname === "/";
	const dashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

	if (loginRoute) {
		if (request.cookies.get("session")) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
		return NextResponse.next();
	}

	if (dashboardRoute) {
		if (!request.cookies.get("session")) {
			return NextResponse.redirect(new URL("/", request.url));
		}
		return NextResponse.next();
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/dashboard:path*"],
};
