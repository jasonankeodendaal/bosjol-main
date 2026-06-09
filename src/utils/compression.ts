/**
 * Compression and Decompression helpers for saving localStorage / localforage space
 * for PDFs and thumbnail images uploaded via the Admin interface.
 */

/**
 * Compresses an image (base64 data-URI) using an HTML5 canvas.
 * Downscales images larger than maxWidth/maxHeight and encodes to JPEG at specified quality.
 */
export function compressImageBase64(
  base64Str: string,
  maxWidth = 480,
  maxHeight = 480,
  quality = 0.7,
): Promise<string> {
  return new Promise((resolve) => {
    // If it's not a standard image dataURI, just return it as-is
    if (!base64Str || !base64Str.startsWith("data:image/")) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Restrict to max dimensions
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Convert to compressed jpeg
      const mimeType = "image/webp";
      const compressed = canvas.toDataURL(mimeType, quality);
      resolve(compressed);
    };

    img.onerror = () => {
      resolve(base64Str);
    };

    img.src = base64Str;
  });
}

/**
 * Compresses a PDF (base64 data-URI) using the browser's native CompressionStream.
 * Handles the fallback scenario gracefully if CompressionStream is absent.
 */
export async function compressPdfBase64(base64Str: string): Promise<string> {
  try {
    if (!base64Str) return "";

    // If already compressed
    if (base64Str.startsWith("data:application/pdf;compressed-gzip;base64,")) {
      return base64Str;
    }

    // If not a PDF data URL, just return
    if (!base64Str.startsWith("data:application/pdf;base64,")) {
      return base64Str;
    }

    const parts = base64Str.split(",");
    const payload = parts[1];
    if (!payload) return base64Str;

    // Convert base64 to Uint8Array
    const binaryStr = atob(payload);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    if (typeof CompressionStream !== "undefined") {
      const stream = new Blob([bytes])
        .stream()
        .pipeThrough(new CompressionStream("gzip"));
      const response = new Response(stream);
      const compressedBlob = await response.blob();

      const compressedPayload = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            const resParts = reader.result.split(",");
            resolve(resParts[1] || "");
          } else {
            reject(new Error("Failed to read compressed PDF Blob"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(compressedBlob);
      });

      return `data:application/pdf;compressed-gzip;base64,${compressedPayload}`;
    }
  } catch (error) {
    console.error("PDF compression failed, falling back to original", error);
  }
  return base64Str;
}

/**
 * Decompresses a compressed PDF (base64 data-URI) back to base64 PDF representation.
 */
export async function decompressPdfBase64(base64Str: string): Promise<string> {
  try {
    if (!base64Str) return "";

    if (!base64Str.startsWith("data:application/pdf;compressed-gzip;base64,")) {
      return base64Str; // Not compressed, return as-is
    }

    const parts = base64Str.split(",");
    const payload = parts[1];
    if (!payload) return base64Str;

    // Convert base64 to Uint8Array
    const binaryStr = atob(payload);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    if (typeof DecompressionStream !== "undefined") {
      const stream = new Blob([bytes])
        .stream()
        .pipeThrough(new DecompressionStream("gzip"));
      const response = new Response(stream);
      const decompressedBlob = await response.blob();

      const decompressedPayload = await new Promise<string>(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              const resParts = reader.result.split(",");
              resolve(resParts[1] || "");
            } else {
              reject(new Error("Failed to read decompressed PDF Blob"));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(decompressedBlob);
        },
      );

      return `data:application/pdf;base64,${decompressedPayload}`;
    }
  } catch (error) {
    console.error("PDF decompression failed, return as-is", error);
  }
  return base64Str;
}
