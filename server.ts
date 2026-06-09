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

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // API endpoints
  app.post("/api/save-mock-data", async (req, res) => {
    try {
      const data = req.body;
      const dataStr = `import { SiteData } from '../context/AdminContext';\n\nexport const mockBosjolData: SiteData = ${JSON.stringify(data, null, 2)};\n`;
      const filePath = path.join(process.cwd(), 'src/utils/mockData.ts');
      
      await fs.writeFile(filePath, dataStr, "utf-8");
      
      try {
        await execPromise('git config --global init.defaultBranch main || true');
        await execPromise('git init || true');
        await execPromise('git config --global user.name "AI Studio Admin" || true');
        await execPromise('git config --global user.email "admin@aistudio.com" || true');
        await execPromise('git remote remove origin || true');
        
        let gitUrl = 'https://github.com/jasonankeodendaal/bosjol-main.git';
        if (process.env.GITHUB_TOKEN) {
          gitUrl = `https://${process.env.GITHUB_TOKEN}@github.com/jasonankeodendaal/bosjol-main.git`;
        }
        
        await execPromise(`git remote add origin ${gitUrl} || true`);
        await execPromise('git add .');
        await execPromise('git commit -m "Update from admin dashboard" || true');
        const { stdout, stderr } = await execPromise('git push -f origin HEAD:main');
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
