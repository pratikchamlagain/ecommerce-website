import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_PRODUCT_IMAGE = "/legacy-watch-images/images/watch.webp";
const UPLOAD_SUBDIR = "product-images";
const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads", UPLOAD_SUBDIR);

function sanitizeName(value) {
  return String(value || "product")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "product";
}

function getApiBaseUrl() {
  const configured = process.env.API_PUBLIC_URL || process.env.BACKEND_PUBLIC_URL;

  if (configured && configured.trim()) {
    return configured.trim().replace(/\/$/, "");
  }

  const port = Number(process.env.PORT || 5000);
  return `http://localhost:${port}`;
}

function getImageExtension(contentType, sourceUrl) {
  const type = String(contentType || "").toLowerCase();

  if (type.includes("image/jpeg") || type.includes("image/jpg")) return "jpg";
  if (type.includes("image/png")) return "png";
  if (type.includes("image/webp")) return "webp";
  if (type.includes("image/avif")) return "avif";
  if (type.includes("image/gif")) return "gif";

  try {
    const pathname = new URL(sourceUrl).pathname;
    const ext = path.extname(pathname).replace(".", "").toLowerCase();
    if (ext) return ext;
  } catch (_error) {
    // no-op
  }

  return "jpg";
}

function toAbsoluteUploadUrl(fileName) {
  return `${getApiBaseUrl()}/uploads/${UPLOAD_SUBDIR}/${fileName}`;
}

function isBackendUploadUrl(value) {
  const text = String(value || "").trim();
  return text.startsWith("/uploads/") || text.includes("/uploads/");
}

async function downloadImageBuffer(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Image fetch failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error("URL does not point to an image");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.byteLength > 5 * 1024 * 1024) {
      throw new Error("Image too large (max 5MB)");
    }

    return { buffer, contentType };
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveProductImageUrl({ imageUrl, productName }) {
  const raw = String(imageUrl || "").trim();

  if (!raw) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  if (isBackendUploadUrl(raw)) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }

    return `${getApiBaseUrl()}${raw}`;
  }

  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  try {
    await fs.mkdir(UPLOAD_ROOT, { recursive: true });
    const { buffer, contentType } = await downloadImageBuffer(raw);
    const ext = getImageExtension(contentType, raw);
    const baseName = sanitizeName(productName);
    const fileName = `${baseName}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_ROOT, fileName);

    await fs.writeFile(filePath, buffer);
    return toAbsoluteUploadUrl(fileName);
  } catch (_error) {
    return DEFAULT_PRODUCT_IMAGE;
  }
}
