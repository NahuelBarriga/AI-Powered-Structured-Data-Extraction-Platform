import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("session");
  
  if (sessionCookie) {
    return NextResponse.next();
  }

  try {
    console.log("No session cookie found, initiating onboarding process.");
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const onboardResponse = await fetch(`${backendUrl}/api/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    //   credentials: "include",
    });
    const response = NextResponse.next();

    const setCookie = onboardResponse.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (error) {
    console.error("Error during onboarding:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
