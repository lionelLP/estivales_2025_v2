import { NextResponse } from "next/server";

let prices = [
    {
        category: "",
        barbier: { serie1: "39 €", serie2: "32 €" },
        piano: "29 €",
        requiem: "34 €",
        tenors: "27 €",
        pass: { serie1: "73 €", serie2: "66 €" },
    },
    {
        category: "Préférentiel",
        barbier: { serie1: "36 €", serie2: "29 €" },
        piano: "27 €",
        requiem: "31 €",
        tenors: "25 €",
        pass: { serie1: "67 €", serie2: "60 €" },
    },
    {
        category: "Jeunes",
        barbier: { serie1: "15 €", serie2: "10 €" },
        piano: "10 €",
        requiem: "12 €",
        tenors: "8 €",
        pass: { serie1: "27 €", serie2: "22 €" },
    },
];

//Récupérer les prix
export async function GET() {
    return NextResponse.json(prices);
}
//mettre à jour les prix
export async function POST(request: Request) {
    const body = await request.json();
    prices = body;
    return NextResponse.json({ message: "Prix mis à jour" });
}
