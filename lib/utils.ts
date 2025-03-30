import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import * as cheerio from "cheerio";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function extractContent(url: string) {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  
  // Get title from meta tags or title tag
  const title = $('meta[property="og:title"]').attr('content') || 
                $('meta[name="twitter:title"]').attr('content') || 
                $('title').text() || 
                "Untitled";

  // Get main content
  const articleText = $('article').text() || // Try article tag first
                     $('main').text() || // Then main tag
                     $('[role="main"]').text() || // Then main role
                     $('body').text(); // Fallback to body

  // Clean up the text
  const text = articleText
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000); // Keep more content for better summarization

  return { title, text };
}
