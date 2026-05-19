import "server-only";

import axios from "axios";
import { WC_REST_BASE_PATH } from "@/lib/constants";

const WOO_REQUEST_TIMEOUT_MS = 25_000;

export function createWooClient() {
  const baseURL = process.env.WC_BASE_URL?.replace(/\/$/, "");
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;

  if (!baseURL || !key || !secret) {
    throw new Error(
      "WooCommerce is not configured. Set WC_BASE_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET in .env.local",
    );
  }

  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  const apiBase = new URL(WC_REST_BASE_PATH, `${baseURL}/`).toString();

  return axios.create({
    baseURL: apiBase,
    timeout: WOO_REQUEST_TIMEOUT_MS,
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
  });
}
