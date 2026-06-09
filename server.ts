import express from "express";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ limit: '500mb', extended: true }));

  // API endpoints
  app.post("/api/save-mock-data", async (req, res) => {
    try {
      const data = req.body;
      const dataStr = `import { SiteData } from '../context/AdminContext';\n\nexport const mockBosjolData: SiteData = ${JSON.stringify(data, null, 2)};\n`;
      const filePath = path.join(process.cwd(), 'src/utils/mockData.ts');
      
      await fs.writeFile(filePath, dataStr, "utf-8");
      
      try {
        let gitUrl = 'https://github.com/jasonankeodendaal/bosjol-main.git';
        if (process.env.GITHUB_TOKEN) {
          gitUrl = `https://${process.env.GITHUB_TOKEN}@github.com/jasonankeodendaal/bosjol-main.git`;
        }
        
        const tempDir = `/tmp/bosjol-git-temp-${Date.now()}`;
        await execPromise(`rm -rf ${tempDir} || true`);
        await execPromise(`git clone ${gitUrl} ${tempDir}`);
        
        // Copy current files into the cloned repo, ignoring unneeded directories
        const copyOpts = { 
          recursive: true, 
          force: true,
          filter: (src: string) => {
            const basename = path.basename(src);
            return !['node_modules', '.git', '.env', 'dist'].includes(basename);
          }
        };
        await fs.cp(process.cwd(), tempDir, copyOpts);
        
        await execPromise(`cd ${tempDir} && git config user.name "AI Studio Admin"`);
        await execPromise(`cd ${tempDir} && git config user.email "admin@aistudio.com"`);
        await execPromise(`cd ${tempDir} && git add .`);
        await execPromise(`cd ${tempDir} && git commit -m "Update from admin dashboard" || true`);
        const { stdout, stderr } = await execPromise(`cd ${tempDir} && git push origin main`);
        await execPromise(`rm -rf ${tempDir} || true`);
        
        console.log("Successfully pushed to GitHub:", stdout);
      } catch (gitErr: any) {
        console.error("Git commit/push failed:", gitErr);
        return res.status(500).json({ 
          success: false, 
          error: "Failed to push to GitHub. " + (gitErr.message || "Please check your GITHUB_TOKEN environment variable.") 
        });
      }

      res.json({ success: true, message: "Mock data saved and pushed successfully." });
    } catch (error) {
      console.error("Error saving mock data:", error);
      res.status(500).json({ success: false, error: "Failed to save mock data." });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
