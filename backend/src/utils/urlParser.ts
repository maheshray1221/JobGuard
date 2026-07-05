import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import ApiError from "./apiError.js";

const MAX_REDIRECTS = 3;

const isPrivateAddress = (address: string): boolean => {
  const normalized = address.toLowerCase();

  if (isIP(normalized) === 4) {
    const [first = 0, second = 0] = normalized
      .split(".")
      .map((part) => Number(part));

    return (
      first === 10 ||
      first === 127 ||
      first === 0 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 100 && second >= 64 && second <= 127) ||
      first >= 224
    );
  }

  if (isIP(normalized) === 6) {
    return (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb") ||
      normalized.startsWith("::ffff:127.") ||
      normalized.startsWith("::ffff:10.") ||
      normalized.startsWith("::ffff:192.168.")
    );
  }

  return true;
};

const assertSafePublicUrl = async (value: string): Promise<URL> => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new ApiError(422, "Invalid URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new ApiError(422, "Only HTTP and HTTPS URLs are supported");
  }

  if (url.username || url.password) {
    throw new ApiError(422, "URLs with embedded credentials are not allowed");
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new ApiError(422, "Private network URLs are not allowed");
  }

  try {
    const addresses = await lookup(hostname, { all: true });
    if (
      addresses.length === 0 ||
      addresses.some(({ address }) => isPrivateAddress(address))
    ) {
      throw new ApiError(422, "Private network URLs are not allowed");
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(422, "URL host could not be resolved");
  }

  return url;
};

const fetchPublicPage = async (initialUrl: string): Promise<string> => {
  let currentUrl = initialUrl;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const safeUrl = await assertSafePublicUrl(currentUrl);

    const response = await axios.get<string>(safeUrl.toString(), {
      timeout: 10_000,
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (response.status < 300) {
      return response.data;
    }

    const location = response.headers.location;
    if (!location || redirects === MAX_REDIRECTS) {
      throw new ApiError(422, "URL has too many or invalid redirects");
    }

    currentUrl = new URL(location, safeUrl).toString();
  }

  throw new ApiError(422, "URL could not be fetched");
};

export const fetchAndParseURL = async (url: string): Promise<string> => {
  let html: string;

  try {
    html = await fetchPublicPage(url);
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof AxiosError) {
      const status = error.response?.status;

      if (status === 403 || status === 429) {
        throw new ApiError(
          422,
          "This website blocks automated access. Paste the job description manually.",
        );
      }

      if (error.code === "ECONNABORTED") {
        throw new ApiError(422, "URL fetch timed out. Please try again.");
      }

      if (error.code === "ENOTFOUND") {
        throw new ApiError(422, "URL does not exist. Check it and try again.");
      }
    }

    throw new ApiError(422, "Could not fetch content from the URL");
  }

  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, iframe, noscript").remove();

  const cleanText = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);

  if (cleanText.length < 50) {
    throw new ApiError(422, "The page did not contain enough useful content");
  }

  return cleanText;
};
