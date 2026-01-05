import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    console.log("Debug upload route hit");
    return NextResponse.json({ message: "Debug route working" });
}
