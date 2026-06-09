import { decompressPdfBase64 } from "./compression";

export const openPdfInNewTab = async (pdf: { title?: string; file: string; size?: string }) => {
  if (!pdf || !pdf.file) {
    alert("This document does not have an uploaded file yet.");
    return;
  }

  // Open the tab immediately to bypass popup blockers
  const newTab = window.open("", "_blank");
  if (newTab) {
    newTab.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loading ${pdf.title || "PDF"}...</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #0f172a; color: white; font-family: ui-sans-serif, system-ui, sans-serif; }
            .loader { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #00a850; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <div class="loader" style="margin: 0 auto 20px;"></div>
            <div style="font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8;">Loading Secure Document</div>
            <div style="font-size: 11px; margin-top: 8px; color: #475569; font-family: monospace;">${pdf.size || "Authenticating"}</div>
          </div>
        </body>
      </html>
    `);
    newTab.document.close();
  }

  try {
    let base64 = pdf.file;
    if (base64.startsWith("data:application/pdf;compressed-gzip;base64,")) {
      base64 = await decompressPdfBase64(base64);
    }
    
    let payload = base64;
    if (base64.includes(",")) {
      payload = base64.split(",")[1];
    }
    const binaryStr = atob(payload);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    
    if (newTab) {
      // Re-write to an iframe to ensure it renders nicely with a title and overrides the blob uuid
      newTab.document.open();
      newTab.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${pdf.title || "PDF Document"}</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100vh; background-color: #333; overflow: hidden; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${blobUrl}"></iframe>
          </body>
        </html>
      `);
      newTab.document.close();
    } else {
      // Fallback
      window.open(blobUrl, "_blank");
    }
  } catch (err) {
    console.error("Failed to open PDF", err);
    if (newTab) {
      newTab.document.body.innerHTML = `
        <div style="text-align: center; color: #ef4444; margin-top: 3rem; font-family: ui-sans-serif, system-ui;">
          <h2 style="margin-bottom: 0.5rem;">Document Unavailable</h2>
          <p style="color: #64748b; font-size: 14px;">The document could not be processed or decompressed.</p>
        </div>
      `;
    }
  }
};
