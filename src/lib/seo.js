import { useEffect } from "react";

const FALLBACK_SITE = "https://gradelyclass.space";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || FALLBACK_SITE).replace(/\/$/, "");

function upsertMeta(attribute, key, content) {
  if (typeof document === "undefined" || content == null) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (typeof document === "undefined") return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export function useSeo({
  title,
  description,
  path = "/",
  image = `${SITE_URL}/og-image.png`,
  noindex = false,
  type = "website",
}) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    if (title) document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    );
    upsertLink("canonical", url);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
    upsertMeta("name", "twitter:card", "summary_large_image");
  }, [title, description, path, image, noindex, type]);
}

export function pageTitle(page) {
  return page ? `${page} · Gradely` : "Gradely — A Simple Grade Tracker for Students";
}
