import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

async function downloadImage(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image:", error);
    return "/homepage/description.jpg";
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    const siteUrl = new URL(url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Récupérer le favicon
    let favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      `${siteUrl.origin}/favicon.ico`;

    // Rendre l'URL du favicon absolue si elle est relative
    if (favicon && !favicon.startsWith("http")) {
      favicon = new URL(favicon, siteUrl.origin).href;
    }

    // Récupérer les métadonnées og
    const ogTags: { [key: string]: string } = {};
    $('meta[property^="og:"]').each((_, element) => {
      const property = $(element).attr("property");
      const content = $(element).attr("content");
      if (property && content) {
        ogTags[property] = content;
      }
    });

    let image = ogTags["og:image"] || "";
    if (image) {
      image = await downloadImage(image);
    } else {
      image = "/homepage/description.jpg";
    }

    // Télécharger le favicon
    let faviconBase64 = null;
    try {
      faviconBase64 = await downloadImage(favicon);
    } catch (error) {
      console.error("Erreur lors du téléchargement du favicon:", error);
    }

    // Récupérer la date de publication
    let publishDate =
      ogTags["article:published_time"] ||
      $('meta[property="article:published_time"]').attr("content") ||
      $('meta[name="date"]').attr("content") ||
      new Date().toISOString();

    const metadata = {
      title: ogTags["og:title"] || $("title").text(),
      description:
        ogTags["og:description"] ||
        $('meta[name="description"]').attr("content") ||
        "",
      image: image,
      favicon: faviconBase64,
      url: url,
      publishDate: publishDate,
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Erreur lors de l'extraction:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'extraction des métadonnées" },
      { status: 500 }
    );
  }
}
