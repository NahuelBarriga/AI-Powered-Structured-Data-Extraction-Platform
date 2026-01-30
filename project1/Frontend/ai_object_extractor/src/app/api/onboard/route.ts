import { NextResponse } from "next/server";

export async function POST() {
  const res = await fetch("http://localhost:4000/auth/onboard", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const cookies = res.headers.get("set-cookie");

  const response = NextResponse.json({ ok: true });

  if (cookies) {
    response.headers.set("set-cookie", cookies);
  }

  return response;
}
