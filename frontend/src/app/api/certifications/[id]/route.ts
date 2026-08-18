import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_URL =
    process.env.NODE_ENV === "production"
        ? "https://portfolio-admin-panel-sigma.vercel.app"
        : "http://localhost:4000";

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, "");

type RouteContext = {
    params: {
        id: string;
    };
};

export async function GET(_request: NextRequest, context: RouteContext) {
    const backendUrl = `${BACKEND_URL}/api/certifications/${encodeURIComponent(context.params.id)}`;

    const response = await fetch(backendUrl, {
        cache: "no-store",
        headers: {
            Accept: "application/json",
        },
    });

    const body = await response.text();

    return new NextResponse(body, {
        status: response.status,
        headers: {
            "Content-Type": response.headers.get("content-type") || "application/json",
        },
    });
}
