import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAdmin,
  SiteData,
  Milestone,
  PDFFile,
} from "../context/AdminContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Save,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  LogOut,
  Globe,
  Search,
  Tag,
  Settings,
  Code,
  MapPin,
  Share2,
} from "lucide-react";
import Editor from "react-simple-wysiwyg";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    data,
    updateData,
    updateSectionData,
    resetToDefaults,
    applyMockData,
    logout,
  } = useAdmin();

  const [draft, setDraft] = useState<SiteData>(
    JSON.parse(JSON.stringify(data)),
  );
  const [activeTab, setActiveTab] = useState<
    | "company"
    | "theme"
    | "home"
    | "sports"
    | "contact"
    | "bosVenue"
    | "welcome"
    | "seo"
    | "maintenance"
    | "legal"
  >("company");
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({});
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFileTarget, setCurrentFileTarget] = useState<{
    path: string[];
    arrayIndex?: number;
  } | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSave = async (section: keyof SiteData) => {
    setIsSaving((prev) => ({ ...prev, [section]: true }));
    await updateData(draft);
    setTimeout(
      () => setIsSaving((prev) => ({ ...prev, [section]: false })),
      800,
    );
  };

  const updateDraft = (path: string[], value: any) => {
    setDraft((prev) => {
      const newDraft = JSON.parse(JSON.stringify(prev));
      let current: any = newDraft;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newDraft;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentFileTarget) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64 = reader.result as string;

      const path = currentFileTarget.path;
      const isPdfType = path.some((p) => p === "pdfs" || p === "rulesPdfs");
      const { compressPdfBase64, compressImageBase64 } =
        await import("../utils/compression");

      if (isPdfType) {
        const isThumbnail = path[path.length - 1] === "thumbnail";
        if (isThumbnail) {
          // Compress the thumbnail image using canvas scaling and JPEG quality reduction
          base64 = await compressImageBase64(base64, 480, 480, 0.7);
        } else {
          // Compress the PDF document itself using Web Compression API (gzip)
          base64 = await compressPdfBase64(base64);
        }
      } else if (
        base64.startsWith("data:image/") &&
        !base64.startsWith("data:image/svg+xml")
      ) {
        // Compress all other uploaded images to prevent out of memory and payload size errors
        base64 = await compressImageBase64(base64, 1200, 1200, 0.85);
      }

      if (currentFileTarget.arrayIndex !== undefined) {
        // Handle array updates (like milestones, pdfs, gallery)
        setDraft((prev) => {
          const newDraft = JSON.parse(JSON.stringify(prev));
          let current: any = newDraft;

          const arrayIndex = currentFileTarget.arrayIndex!;

          if (isPdfType) {
            const isThumbnail = path[path.length - 1] === "thumbnail";
            if (isThumbnail) {
              // Path is like ['sportsPages', sportIdx, 'pdfs', 'thumbnail'] or ['bosVenue', 'rulesPdfs', 'thumbnail']
              // Parent array path is path.length - 2
              for (let i = 0; i < path.length - 2; i++) {
                current = current[path[i]];
              }
              const arr = current[path[path.length - 2]];
              if (arr && arr[arrayIndex]) {
                if (typeof arr[arrayIndex] === "string") {
                  arr[arrayIndex] = {
                    id: `pdf_fallback_${Date.now()}`,
                    title: "Venue/Sport Document",
                    size: "Unknown",
                    file: "",
                    thumbnail: base64,
                  };
                } else {
                  arr[arrayIndex].thumbnail = base64;
                }
              }
            } else {
              // Path is like ['sportsPages', sportIdx, 'pdfs'] or ['bosVenue', 'rulesPdfs']
              for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
              }
              const arr = current[path[path.length - 1]];
              if (arr && arr[arrayIndex]) {
                if (typeof arr[arrayIndex] === "string") {
                  arr[arrayIndex] = {
                    id: `pdf_fallback_${Date.now()}`,
                    title: "Venue/Sport Document",
                    size: "Unknown",
                    file: base64,
                    thumbnail: "",
                  };
                } else {
                  arr[arrayIndex].file = base64;
                }
                // Calculate file size dynamically
                const sizeInBytes = Math.round((base64.length * 3) / 4);
                const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(1);
                arr[arrayIndex].size = `${sizeInMB} MB`;
              }
            }
          } else {
            for (let i = 0; i < path.length - 1; i++) {
              current = current[path[i]];
            }
            const arr = current[path[path.length - 1]];
            if (path.includes("milestones")) {
              arr[arrayIndex].img = base64;
            } else if (path.includes("gallery")) {
              arr[arrayIndex] = base64;
            } else if (path.includes("socials")) {
              arr[arrayIndex].icon = base64;
            } else if (path.includes("heroMedia")) {
              arr[arrayIndex].url = base64;
            } else {
              arr[arrayIndex] = base64;
            }
          }
          return newDraft;
        });
      } else {
        updateDraft(currentFileTarget.path, base64);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCurrentFileTarget(null);
  };

  const triggerFileInput = (
    path: string[],
    arrayIndex?: number,
    accept: string = "image/*",
  ) => {
    setCurrentFileTarget({ path, arrayIndex });
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const renderDropdown = (
    label: string,
    path: string[],
    options: string[],
  ) => {
    const val = path.reduce((acc: any, key) => acc[key], draft);
    return (
      <div className="mb-4">
        <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
          {label}
        </label>
        <select
          className="w-full bg-white border border-primary/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green outline-none"
          value={val}
          onChange={(e) => updateDraft(path, e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderInput = (label: string, path: string[], isTextArea = false) => {
    const val = path.reduce((acc: any, key) => acc[key], draft);
    return (
      <div className="mb-4">
        <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
          {label}
        </label>
        {isTextArea ? (
          <Editor
            containerProps={{
              style: { resize: "vertical", minHeight: "150px" },
            }}
            value={val}
            onChange={(e) => updateDraft(path, e.target.value)}
          />
        ) : (
          <input
            type="text"
            className="w-full bg-white border border-primary/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green outline-none"
            value={val}
            onChange={(e) => updateDraft(path, e.target.value)}
          />
        )}
      </div>
    );
  };

  const renderImageUpload = (
    label: string,
    path: string[],
    arrayIndex?: number,
    isVideo: boolean = false,
  ) => {
    let src = "";
    if (arrayIndex !== undefined) {
      const arr = path.reduce((acc: any, key) => acc[key], draft);
      src =
        path.includes("gallery") ||
        path.includes("media") ||
        path.includes("brandLogos") ||
        path.includes("showcaseImages")
          ? arr[arrayIndex]
          : path.includes("socials")
            ? arr[arrayIndex].icon
            : path.includes("heroMedia")
              ? arr[arrayIndex].url
              : arr[arrayIndex].img;
    } else {
      src = path.reduce((acc: any, key) => acc[key], draft);
    }

    return (
      <div className="mb-6">
        <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
          {label}
        </label>
        <div
          className="relative h-20 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-green transition-colors group"
          onClick={() =>
            triggerFileInput(
              path,
              arrayIndex,
              isVideo ? "video/*,image/*" : "image/*",
            )
          }
        >
          {src ? (
            <>
              {(isVideo && src.includes("video")) || src.endsWith(".mp4") ? (
                <video
                  src={src}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <img
                  src={src}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1 drop-shadow-md">
                <Upload className="text-white w-5 h-5" />
                <span className="text-white font-medium text-[10px] px-2 py-0.5 bg-black/50 rounded-full">
                  Replace
                </span>
              </div>
            </>
          ) : (
            <>
              <ImageIcon className="text-primary/30 w-6 h-6 mb-1" />
              <span className="text-primary/50 font-medium text-[10px] text-center px-2">
                Click to upload
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-primary/5 pt-24 md:pt-32 pb-12 md:pb-20 px-3 md:px-8 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-10">
        {/* Full-Width Header Navigation */}
        <div className="w-full bg-white rounded-xl md:rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
          {/* Top Bar: Brand & Session */}
          <div className="px-4 md:px-8 py-3 md:py-4 border-b border-primary/5 flex justify-between items-center bg-primary text-white">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-white/10 p-1.5 md:p-2 rounded-lg">
                <Settings className="w-5 h-5 md:w-6 md:h-6 text-green" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg md:text-xl uppercase tracking-wider leading-none">
                  BOSJOL Management
                </h2>
                <p className="text-[9px] md:text-[10px] text-white/50 font-mono mt-1 uppercase tracking-widest">
                  Admin Dashboard v3.0
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest"
            >
              <LogOut size={12} className="md:w-3.5 md:h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>

          {/* Navigation Rows - Scrollable on mobile */}
          <div className="bg-primary/5 flex flex-col overflow-hidden">
            <div className="px-3 py-2 flex overflow-x-auto no-scrollbar gap-2 items-center">
              {[
                { id: "company", label: "Identity", icon: Globe },
                { id: "theme", label: "Aesthetics", icon: Settings },
                { id: "seo", label: "Engine", icon: Search },
                { id: "maintenance", label: "System", icon: Code },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all font-bold text-[10px] md:text-[11px] uppercase tracking-wider whitespace-nowrap ${activeTab === tab.id ? "bg-primary text-white shadow-lg" : "text-primary/40 hover:text-primary hover:bg-white"}`}
                >
                  <tab.icon size={12} className="md:w-3.5 md:h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="h-px w-full bg-primary/5 mx-2" />

            <div className="px-3 py-2 flex overflow-x-auto no-scrollbar gap-2 items-center">
              {[
                { id: "home", label: "Home Page" },
                { id: "sports", label: "Sports Pages" },
                { id: "bosVenue", label: "Venue Site" },
                { id: "contact", label: "Contact" },
                { id: "welcome", label: "Welcome" },
                { id: "legal", label: "Legal" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all font-bold text-[10px] md:text-[11px] uppercase tracking-wider whitespace-nowrap ${activeTab === tab.id ? "bg-green text-primary shadow-lg" : "text-primary/40 hover:text-primary hover:bg-white"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Area - Now Full Width */}
        <div className="w-full bg-white rounded-xl md:rounded-2xl shadow-sm border border-primary/5 p-6 md:p-8">
          <div className="mb-8 border-b border-primary/10 pb-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-primary tracking-tight">
              {activeTab === "company" ? "Identity" :
               activeTab === "theme" ? "Aesthetics" :
               activeTab === "seo" ? "Engine (SEO & Data)" :
               activeTab === "maintenance" ? "System Maintenance" :
               activeTab === "home" ? "Home Page Configuration" :
               activeTab === "sports" ? "Sports Pages Configuration" :
               activeTab === "bosVenue" ? "Bos Venue Configuration" :
               activeTab === "contact" ? "Contact Configuration" :
               activeTab === "welcome" ? "Welcome Overlay Configuration" :
               activeTab === "legal" ? "Legal Documents Configuration" : ""}
            </h2>
            <p className="text-sm text-primary/60 mt-1">
              {activeTab === "company" ? "Configure core brand identity, company details, and social channels." :
               activeTab === "theme" ? "Customize visual aesthetics, typography, and color schemes for all site modules." :
               "Adjust configuration and data settings for this section."}
            </p>
          </div>
           {activeTab === "legal" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-display font-bold text-primary uppercase tracking-wider">
                  Legal Documents
                </h3>
                  <button
                  onClick={() => handleSave("legal")}
                  className="bg-green text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-lime transition-all shadow-md hover:shadow-lg"
                >
                  {isSaving["legal"] ? "Saving..." : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {renderInput("Privacy Policy", ["legal", "privacyPolicy"], true)}
                {renderInput("Terms of Service", ["legal", "termsOfService"], true)}
                {renderInput("Legal Disclaimer", ["legal", "legalDisclaimer"], true)}
              </div>
            </motion.div>
          )}

          {activeTab === "company" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-display font-bold text-primary uppercase tracking-wider">
                  Company Information
                </h3>
                <button
                  onClick={() => {
                    handleSave("company");
                    handleSave("socials");
                  }}
                  className="bg-green text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-lime transition-all shadow-md hover:shadow-lg"
                >
                  {isSaving["company"] || isSaving["socials"] ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                  {renderImageUpload("Company Logo", ["company", "logo"])}
                  {renderInput("Company Name", ["company", "name"])}
                  {renderInput("Email Address", ["company", "email"])}
                </div>
                <div>
                  {renderInput("Phone Number (+27 for South Africa)", [
                    "company",
                    "phone",
                  ])}
                  {renderInput("Physical Address", ["company", "address"])}

                  <div className="flex justify-between items-center mt-8 mb-4">
                    <h4 className="font-bold text-sm tracking-widest uppercase text-primary">
                      Social Links
                    </h4>
                    <button
                      onClick={() =>
                        updateDraft(
                          ["socials"],
                          [
                            ...draft.socials,
                            {
                              id: `s_${Date.now()}`,
                              name: "New Social",
                              icon: "",
                              url: "",
                            },
                          ],
                        )
                      }
                      className="bg-primary text-white p-1 rounded hover:bg-green"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {draft.socials.map((social, idx) => (
                      <div
                        key={social.id}
                        className="bg-primary/5 p-4 rounded-xl border border-primary/10 relative"
                      >
                        <button
                          onClick={() => {
                            const newS = [...draft.socials];
                            newS.splice(idx, 1);
                            updateDraft(["socials"], newS);
                          }}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-primary/70 uppercase mb-1">
                              Icon
                            </label>
                            <div
                              className="w-full h-16 border-2 border-dashed border-primary/20 rounded cursor-pointer flex items-center justify-center hover:border-green overflow-hidden relative"
                              onClick={() =>
                                triggerFileInput(
                                  ["socials"],
                                  idx,
                                  "image/png, image/jpeg, image/svg+xml",
                                )
                              }
                            >
                              {social.icon ? (
                                <img
                                  src={social.icon}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <ImageIcon
                                  size={20}
                                  className="text-primary/30"
                                />
                              )}
                            </div>
                          </div>
                          <div className="col-span-2 space-y-2">
                            <input
                              type="text"
                              value={social.name}
                              placeholder="Platform Name"
                              onChange={(e) => {
                                const n = [...draft.socials];
                                n[idx].name = e.target.value;
                                updateDraft(["socials"], n);
                              }}
                              className="w-full text-xs p-2 rounded border border-primary/20"
                            />
                            <input
                              type="text"
                              value={social.url}
                              placeholder="URL"
                              onChange={(e) => {
                                const n = [...draft.socials];
                                n[idx].url = e.target.value;
                                updateDraft(["socials"], n);
                              }}
                              className="w-full text-xs p-2 rounded border border-primary/20"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "theme" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
                <h3 className="text-2xl font-display font-bold text-primary">
                  Theme & Branding Editor
                </h3>
                <button
                  onClick={() => handleSave("theme")}
                  className="bg-green text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-lime transition-all"
                >
                  {isSaving["theme"] ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl mb-8">
                <h4 className="font-bold uppercase tracking-wider text-primary mb-4">
                  Main Site Theme Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Primary Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{ backgroundColor: draft.theme.primaryColor }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.theme.primaryColor}
                      onChange={(e) =>
                        updateDraft(["theme", "primaryColor"], e.target.value)
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Accent Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{ backgroundColor: draft.theme.accentColor }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.theme.accentColor}
                      onChange={(e) =>
                        updateDraft(["theme", "accentColor"], e.target.value)
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Accent Hover{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{ backgroundColor: draft.theme.accentHover }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.theme.accentHover}
                      onChange={(e) =>
                        updateDraft(["theme", "accentHover"], e.target.value)
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Secondary Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{ backgroundColor: draft.theme.secondaryColor }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.theme.secondaryColor}
                      onChange={(e) =>
                        updateDraft(["theme", "secondaryColor"], e.target.value)
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Background Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{ backgroundColor: draft.theme.backgroundColor }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.theme.backgroundColor}
                      onChange={(e) =>
                        updateDraft(
                          ["theme", "backgroundColor"],
                          e.target.value,
                        )
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Text Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{ backgroundColor: draft.theme.textColor }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.theme.textColor}
                      onChange={(e) =>
                        updateDraft(["theme", "textColor"], e.target.value)
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Border Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{ backgroundColor: draft.theme.borderColor }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.theme.borderColor}
                      onChange={(e) =>
                        updateDraft(["theme", "borderColor"], e.target.value)
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-4">
                  {renderInput("Button Border Radius (e.g. 0.75rem)", [
                    "theme",
                    "buttonRadius",
                  ])}
                  {renderInput("Card Border Radius (e.g. 1.5rem)", [
                    "theme",
                    "cardRadius",
                  ])}
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl mb-8 border border-primary/10 shadow-sm">
                <h4 className="font-bold uppercase tracking-wider text-primary mb-4 text-sm">
                  Main Site Branding
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
                      Logo Display Height (px)
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="120"
                      value={draft.company?.logoHeight || 48}
                      onChange={(e) =>
                        updateDraft(
                          ["company", "logoHeight"],
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full accent-green"
                    />
                    <span className="text-[10px] font-mono text-primary/40">
                      {draft.company?.logoHeight || 48}px
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl mb-8 border border-primary/10 shadow-sm">
                <h4 className="font-bold uppercase tracking-wider text-primary mb-4">
                  Bos Venue Theme Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Primary Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{
                          backgroundColor: draft.bosVenue.theme.primaryColor,
                        }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.bosVenue.theme.primaryColor}
                      onChange={(e) =>
                        updateDraft(
                          ["bosVenue", "theme", "primaryColor"],
                          e.target.value,
                        )
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Accent Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{
                          backgroundColor: draft.bosVenue.theme.accentColor,
                        }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.bosVenue.theme.accentColor}
                      onChange={(e) =>
                        updateDraft(
                          ["bosVenue", "theme", "accentColor"],
                          e.target.value,
                        )
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Accent Hover{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{
                          backgroundColor: draft.bosVenue.theme.accentHover,
                        }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.bosVenue.theme.accentHover}
                      onChange={(e) =>
                        updateDraft(
                          ["bosVenue", "theme", "accentHover"],
                          e.target.value,
                        )
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Secondary Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{
                          backgroundColor: draft.bosVenue.theme.secondaryColor,
                        }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.bosVenue.theme.secondaryColor}
                      onChange={(e) =>
                        updateDraft(
                          ["bosVenue", "theme", "secondaryColor"],
                          e.target.value,
                        )
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Background Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{
                          backgroundColor: draft.bosVenue.theme.backgroundColor,
                        }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.bosVenue.theme.backgroundColor}
                      onChange={(e) =>
                        updateDraft(
                          ["bosVenue", "theme", "backgroundColor"],
                          e.target.value,
                        )
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Text Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{
                          backgroundColor: draft.bosVenue.theme.textColor,
                        }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.bosVenue.theme.textColor}
                      onChange={(e) =>
                        updateDraft(
                          ["bosVenue", "theme", "textColor"],
                          e.target.value,
                        )
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Border Color{" "}
                      <div
                        className="w-4 h-4 rounded-full border border-primary/20"
                        style={{
                          backgroundColor: draft.bosVenue.theme.borderColor,
                        }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      value={draft.bosVenue.theme.borderColor}
                      onChange={(e) =>
                        updateDraft(
                          ["bosVenue", "theme", "borderColor"],
                          e.target.value,
                        )
                      }
                      className="w-full h-10 cursor-pointer rounded-lg border-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-4">
                  {renderInput("Button Border Radius (e.g. 0.75rem)", [
                    "bosVenue",
                    "theme",
                    "buttonRadius",
                  ])}
                  {renderInput("Card Border Radius (e.g. 1.5rem)", [
                    "bosVenue",
                    "theme",
                    "cardRadius",
                  ])}
                </div>

                <div className="mt-8 border-t border-primary/10 pt-8">
                  <h4 className="font-bold uppercase tracking-wider text-primary mb-4 text-sm">
                    Bos Venue Branding & Overlays
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
                        Background Overlay Opacity
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                          draft.bosVenue?.bgOpacity !== undefined
                            ? draft.bosVenue.bgOpacity
                            : 80
                        }
                        onChange={(e) =>
                          updateDraft(
                            ["bosVenue", "bgOpacity"],
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full accent-green"
                      />
                      <span className="text-[10px] font-mono text-primary/40">
                        {draft.bosVenue?.bgOpacity !== undefined
                          ? draft.bosVenue.bgOpacity
                          : 80}
                        %
                      </span>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
                        Logo Display Height (px)
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={draft.bosVenue?.logoHeight || 120}
                        onChange={(e) =>
                          updateDraft(
                            ["bosVenue", "logoHeight"],
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full accent-green"
                      />
                      <span className="text-[10px] font-mono text-primary/40">
                        {draft.bosVenue?.logoHeight || 120}px
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-8 rounded-2xl mb-8 border border-primary/10 shadow-sm">
                <h4 className="font-bold uppercase tracking-wider text-primary mb-6 text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Main Site Typography &
                  Aesthetics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {renderDropdown(
                    "Heading Font",
                    ["theme", "headingFont"],
                    ["'Oswald', sans-serif", "'Space Grotesk', sans-serif", "'Outfit', sans-serif", "'Playfair Display', serif"]
                  )}
                  {renderDropdown(
                    "Body Font", 
                    ["theme", "bodyFont"],
                    ["'Inter', sans-serif", "'JetBrains Mono', monospace"]
                  )}
                  {renderInput("Button Border Radius (e.g. 0.75rem)", [
                    "theme",
                    "buttonRadius",
                  ])}
                  {renderInput("Card Border Radius (e.g. 1.5rem)", [
                    "theme",
                    "cardRadius",
                  ])}
                </div>

                <div className="mt-8 pt-8 border-t border-primary/10">
                  <h5 className="font-bold text-[10px] uppercase tracking-widest text-primary/40 mb-4">
                    Branding Extras
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
                        Logo Display Height (px)
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        value={draft.company?.logoHeight || 48}
                        onChange={(e) =>
                          updateDraft(
                            ["company", "logoHeight"],
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full accent-green h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] font-mono text-primary/40">
                          20px
                        </span>
                        <span className="text-[10px] font-bold text-green">
                          {draft.company?.logoHeight || 48}px
                        </span>
                        <span className="text-[10px] font-mono text-primary/40">
                          120px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-8 rounded-2xl mb-8 border border-primary/10 shadow-sm border-l-4 border-l-green">
                <h4 className="font-bold uppercase tracking-wider text-primary mb-6 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Bos Venue Site Typography &
                  Identity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {renderInput("Heading Font", [
                    "bosVenue",
                    "theme",
                    "headingFont",
                  ])}
                  {renderInput("Body Font", ["bosVenue", "theme", "bodyFont"])}
                  {renderInput("Button Border Radius", [
                    "bosVenue",
                    "theme",
                    "buttonRadius",
                  ])}
                  {renderInput("Card Border Radius", [
                    "bosVenue",
                    "theme",
                    "cardRadius",
                  ])}
                </div>

                <div className="mt-8 pt-8 border-t border-primary/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
                        Background Overlay Opacity
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                          draft.bosVenue?.bgOpacity !== undefined
                            ? draft.bosVenue.bgOpacity
                            : 80
                        }
                        onChange={(e) =>
                          updateDraft(
                            ["bosVenue", "bgOpacity"],
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full accent-green h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] font-mono text-primary/40">
                          0%
                        </span>
                        <span className="text-[10px] font-bold text-green">
                          {draft.bosVenue?.bgOpacity !== undefined
                            ? draft.bosVenue.bgOpacity
                            : 80}
                          %
                        </span>
                        <span className="text-[10px] font-mono text-primary/40">
                          100%
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
                        Logo Display Height (px)
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={draft.bosVenue?.logoHeight || 120}
                        onChange={(e) =>
                          updateDraft(
                            ["bosVenue", "logoHeight"],
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full accent-green h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] font-mono text-primary/40">
                          20px
                        </span>
                        <span className="text-[10px] font-bold text-green">
                          {draft.bosVenue?.logoHeight || 120}px
                        </span>
                        <span className="text-[10px] font-mono text-primary/40">
                          200px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "home" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
                <h3 className="text-2xl font-display font-bold text-primary">
                  Home Page Editor
                </h3>
                <button
                  onClick={() => handleSave("home")}
                  className="bg-green text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-lime transition-all"
                >
                  {isSaving["home"] ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold uppercase tracking-wider text-primary">
                    Hero Background Media
                  </h4>
                  <button
                    onClick={() =>
                      updateDraft(
                        ["home", "heroMedia"],
                        [
                          ...draft.home.heroMedia,
                          { id: `hm_${Date.now()}`, type: "image", url: "" },
                        ],
                      )
                    }
                    className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded text-xs hover:bg-green"
                  >
                    <Plus size={14} /> Add Media
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {draft.home.heroMedia.map((media, idx) => (
                    <div
                      key={media.id}
                      className="relative bg-white rounded-xl border border-primary/20 p-2"
                    >
                      <button
                        onClick={() => {
                          const arr = [...draft.home.heroMedia];
                          arr.splice(idx, 1);
                          updateDraft(["home", "heroMedia"], arr);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600"
                      >
                        <Trash2 size={12} />
                      </button>
                      <select
                        value={media.type}
                        onChange={(e) => {
                          const arr = [...draft.home.heroMedia];
                          arr[idx].type = e.target.value as "image" | "video";
                          updateDraft(["home", "heroMedia"], arr);
                        }}
                        className="w-full text-xs p-1 mb-2 border border-primary/10 rounded"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                      <div
                        className="relative h-24 rounded border border-dashed border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden cursor-pointer hover:border-green"
                        onClick={() =>
                          triggerFileInput(
                            ["home", "heroMedia"],
                            idx,
                            media.type === "video" ? "video/*" : "image/*",
                          )
                        }
                      >
                        {media.url ? (
                          media.type === "video" ||
                          media.url.includes("video") ||
                          media.url.endsWith(".mp4") ? (
                            <video
                              src={media.url}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={media.url}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <ImageIcon size={20} className="text-primary/30" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {renderInput("Hero Title", ["home", "heroTitle"], true)}
                {renderInput("Hero Subtitle", ["home", "heroSubtitle"], true)}
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl mb-8">
                <h4 className="font-bold uppercase tracking-wider text-primary mb-4">
                  Meet the Owner
                </h4>
                {renderImageUpload("Owner Image", ["home", "ownerImage"])}
                {renderInput("Section Title", ["home", "ownerTitle"])}
                {renderInput("Story Paragraph 1", ["home", "ownerText1"], true)}
                {renderInput(
                  "Story Paragraph 2 (Quote)",
                  ["home", "ownerText2"],
                  true,
                )}
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold uppercase tracking-wider text-primary">
                    Growth Story (Milestones)
                  </h4>
                  <button
                    onClick={() => {
                      const newMilestone: Milestone = {
                        id: Date.now().toString(),
                        year: "YYYY",
                        title: "New Stage",
                        desc: "Description",
                        img: "",
                      };
                      updateDraft(
                        ["home", "milestones"],
                        [...draft.home.milestones, newMilestone],
                      );
                    }}
                    className="bg-primary text-white p-2 rounded-lg hover:bg-green transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  {draft.home.milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className="bg-white p-6 rounded-xl border border-primary/10 relative"
                    >
                      <button
                        onClick={() => {
                          const newM = [...draft.home.milestones];
                          newM.splice(idx, 1);
                          updateDraft(["home", "milestones"], newM);
                        }}
                        className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderImageUpload(
                          `Milestone ${idx + 1} Image`,
                          ["home", "milestones"],
                          idx,
                        )}
                        <div>
                          <div className="mb-4">
                            <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
                              Year
                            </label>
                            <input
                              type="text"
                              className="w-full bg-white border border-primary/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green outline-none"
                              value={m.year}
                              onChange={(e) => {
                                const newM = [...draft.home.milestones];
                                newM[idx].year = e.target.value;
                                updateDraft(["home", "milestones"], newM);
                              }}
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
                              Title
                            </label>
                            <input
                              type="text"
                              className="w-full bg-white border border-primary/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green outline-none"
                              value={m.title}
                              onChange={(e) => {
                                const newM = [...draft.home.milestones];
                                newM[idx].title = e.target.value;
                                updateDraft(["home", "milestones"], newM);
                              }}
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
                              Description
                            </label>
                            <textarea
                              className="w-full bg-white border border-primary/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green outline-none"
                              rows={3}
                              value={m.desc}
                              onChange={(e) => {
                                const newM = [...draft.home.milestones];
                                newM[idx].desc = e.target.value;
                                updateDraft(["home", "milestones"], newM);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Logos */}
              <div className="bg-primary/5 p-6 rounded-2xl mb-8">
                <h4 className="font-bold uppercase tracking-wider text-primary mb-4 border-b border-primary/10 pb-2">
                  Brand Logos
                </h4>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider">
                    Brand Logos (Scrolling Strip)
                  </label>
                  <button
                    onClick={() =>
                      updateDraft(
                        ["home", "brandLogos"],
                        [...(draft.home.brandLogos || []), ""],
                      )
                    }
                    className="flex items-center gap-1 bg-white text-primary border border-primary/10 px-2 py-1 rounded text-xs hover:bg-green"
                  >
                    <Plus size={14} /> Add Logo
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(draft.home.brandLogos || []).map((logo, idx) => (
                    <div
                      key={idx}
                      className="relative bg-white rounded-xl border border-primary/20 p-2"
                    >
                      <button
                        onClick={() => {
                          const arr = [...(draft.home.brandLogos || [])];
                          arr.splice(idx, 1);
                          updateDraft(["home", "brandLogos"], arr);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600"
                      >
                        <Trash2 size={12} />
                      </button>
                      {renderImageUpload(
                        `Logo ${idx + 1}`,
                        ["home", "brandLogos"],
                        idx,
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "sports" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
                <h3 className="text-2xl font-display font-bold text-primary">
                  Sports Pages Editor
                </h3>
                <button
                  onClick={() => {
                    const newSport = JSON.parse(
                      JSON.stringify(draft.sportsPages[0] || {}),
                    );
                    newSport.id = `sport_${Date.now()}`;
                    newSport.navName = "New Sport";
                    newSport.slug = `new-sport-${Date.now()}`;
                    updateDraft(
                      ["sportsPages"],
                      [...draft.sportsPages, newSport],
                    );
                    setExpandedSport(newSport.id);
                  }}
                  className="bg-green text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-lime hover:text-primary transition-colors"
                >
                  <Plus size={16} /> Add Sport
                </button>
                <button
                  onClick={() => handleSave("sportsPages")}
                  className="bg-green text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-lime transition-all"
                >
                  {isSaving["sportsPages"] ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {draft.sportsPages.map((sport, sportIdx) => (
                  <div
                    key={sport.id}
                    className="bg-white rounded-2xl border border-primary/10 overflow-hidden shadow-sm"
                  >
                    <button
                      className="w-full bg-primary/5 p-4 flex justify-between items-center text-primary font-bold tracking-widest uppercase hover:bg-primary/10 transition-colors"
                      onClick={() =>
                        setExpandedSport(
                          expandedSport === sport.id ? null : sport.id,
                        )
                      }
                    >
                      {sport.navName || "Unnamed Sport"}
                      <div className="flex items-center gap-4">
                        {expandedSport !== sport.id && (
                          <div className="text-xs text-primary/50 normal-case tracking-normal">
                            /{sport.slug}
                          </div>
                        )}
                        {expandedSport === sport.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedSport === sport.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-white px-6 py-6 border-t border-primary/5 space-y-8"
                        >
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                const newArr = [...draft.sportsPages];
                                newArr.splice(sportIdx, 1);
                                updateDraft(["sportsPages"], newArr);
                                setExpandedSport(null);
                              }}
                              className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 font-bold bg-red-50 px-3 py-1.5 rounded-lg"
                            >
                              <Trash2 size={16} /> Delete Sport
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderInput("Navigation Name", [
                              "sportsPages",
                              sportIdx,
                              "navName",
                            ])}
                            {renderInput("URL Slug", [
                              "sportsPages",
                              sportIdx,
                              "slug",
                            ])}
                          </div>

                          <div className="bg-primary/5 p-6 rounded-2xl">
                            <h4 className="font-bold uppercase tracking-wider text-primary mb-4">
                              Hero Section
                            </h4>
                            {renderImageUpload("Hero Background Image", [
                              "sportsPages",
                              sportIdx,
                              "heroImage",
                            ])}
                            {renderInput("Category Name", [
                              "sportsPages",
                              sportIdx,
                              "heroCategory",
                            ])}
                            {renderInput("Main Title", [
                              "sportsPages",
                              sportIdx,
                              "heroTitle",
                            ])}
                          </div>

                          <div className="bg-primary/5 p-6 rounded-2xl">
                            <h4 className="font-bold uppercase tracking-wider text-primary mb-4">
                              Story of the Discipline
                            </h4>
                            {renderInput("Title", [
                              "sportsPages",
                              sportIdx,
                              "storyTitle",
                            ])}
                            {renderInput(
                              "Description Paragraph 1",
                              ["sportsPages", sportIdx, "storyText1"],
                              true,
                            )}
                            {renderInput(
                              "Description Paragraph 2",
                              ["sportsPages", sportIdx, "storyText2"],
                              true,
                            )}
                          </div>

                          {/* PDF Documents */}
                          <div className="bg-primary/5 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold uppercase tracking-wider text-primary">
                                PDF Documents
                              </h4>
                              <button
                                onClick={() => {
                                  const newPdf: PDFFile = {
                                    id: Date.now().toString(),
                                    title: "New Document",
                                    size: "Unknown",
                                    file: "",
                                  };
                                  updateDraft(
                                    ["sportsPages", sportIdx, "pdfs"],
                                    [
                                      ...draft.sportsPages[sportIdx].pdfs,
                                      newPdf,
                                    ],
                                  );
                                }}
                                className="bg-primary text-white p-2 rounded-lg hover:bg-green transition-colors"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                            <div className="space-y-4">
                              {draft.sportsPages[sportIdx].pdfs.map(
                                (p, idx) => (
                                  <div
                                    key={p.id}
                                    className="bg-white p-4 rounded-xl border border-primary/10 flex items-center justify-between gap-4"
                                  >
                                    <div className="flex-1 grid grid-cols-1 gap-4">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          placeholder="Document Name"
                                          className="flex-1 bg-white border border-primary/20 rounded-lg p-2 text-sm focus:ring-2 outline-none"
                                          value={p.title}
                                          onChange={(e) => {
                                            const newP = [
                                              ...draft.sportsPages[sportIdx]
                                                .pdfs,
                                            ];
                                            newP[idx].title = e.target.value;
                                            updateDraft(
                                              ["sportsPages", sportIdx, "pdfs"],
                                              newP,
                                            );
                                          }}
                                        />
                                      </div>
                                      <div className="flex flex-col md:flex-row gap-4 md:items-center">
                                        <div className="flex items-center gap-2 border border-primary/10 p-2 rounded-lg bg-primary/5">
                                          <button
                                            onClick={() =>
                                              triggerFileInput(
                                                [
                                                  "sportsPages",
                                                  sportIdx,
                                                  "pdfs",
                                                ],
                                                idx,
                                                ".pdf,application/pdf",
                                              )
                                            }
                                            className="flex-shrink-0 bg-white hover:bg-white text-primary px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1 shadow-sm"
                                          >
                                            <Upload size={14} />{" "}
                                            {p.file
                                              ? "Replace PDF"
                                              : "Upload PDF"}
                                          </button>
                                          {p.file && (
                                            <span className="text-xs text-green font-medium">
                                              Uploaded
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 border border-primary/10 p-2 rounded-lg bg-primary/5">
                                          <div
                                            className="w-10 h-10 border border-dashed border-primary/20 bg-white rounded flex items-center justify-center overflow-hidden cursor-pointer"
                                            onClick={() =>
                                              triggerFileInput(
                                                [
                                                  "sportsPages",
                                                  sportIdx,
                                                  "pdfs",
                                                  "thumbnail",
                                                ],
                                                idx,
                                                "image/*",
                                              )
                                            }
                                          >
                                            {p.thumbnail ? (
                                              <img
                                                src={p.thumbnail}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <ImageIcon
                                                size={14}
                                                className="text-primary/30"
                                              />
                                            )}
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-xs font-bold uppercase text-primary/70">
                                              Thumbnail
                                            </span>
                                            <span className="text-[10px] text-primary/50">
                                              Required for tiny portraits
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const newP = [
                                          ...draft.sportsPages[sportIdx].pdfs,
                                        ];
                                        newP.splice(idx, 1);
                                        updateDraft(
                                          ["sportsPages", sportIdx, "pdfs"],
                                          newP,
                                        );
                                      }}
                                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Gallery Images */}
                          <div className="bg-primary/5 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold uppercase tracking-wider text-primary">
                                Gallery Archives
                              </h4>
                              <button
                                onClick={() => {
                                  updateDraft(
                                    ["sportsPages", sportIdx, "gallery"],
                                    [
                                      ...draft.sportsPages[sportIdx].gallery,
                                      "",
                                    ],
                                  );
                                }}
                                className="bg-primary text-white p-2 rounded-lg hover:bg-green transition-colors"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                              {draft.sportsPages[sportIdx].gallery.map(
                                (img, idx) => (
                                  <div key={idx} className="relative group">
                                    <button
                                      onClick={() => {
                                        const newG = [
                                          ...draft.sportsPages[sportIdx]
                                            .gallery,
                                        ];
                                        newG.splice(idx, 1);
                                        updateDraft(
                                          ["sportsPages", sportIdx, "gallery"],
                                          newG,
                                        );
                                      }}
                                      className="absolute top-2 right-2 text-white bg-red-500/80 hover:bg-red-500 p-2 rounded-lg transition-colors z-20"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                    {renderImageUpload(
                                      `Image ${idx + 1}`,
                                      ["sportsPages", sportIdx, "gallery"],
                                      idx,
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          <div className="bg-primary/5 p-6 rounded-2xl">
                            <h4 className="font-bold uppercase tracking-wider text-primary mb-4">
                              Video Highlight Section
                            </h4>
                            {renderImageUpload("Video Thumbnail/Cover", [
                              "sportsPages",
                              sportIdx,
                              "videoBg",
                            ])}
                            {renderInput("Main Text", [
                              "sportsPages",
                              sportIdx,
                              "videoText",
                            ])}
                            {renderInput("Subtext", [
                              "sportsPages",
                              sportIdx,
                              "videoSubtext",
                            ])}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "bosVenue" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
                <h3 className="text-2xl font-display font-bold text-primary">
                  Bos Venue Builder
                </h3>
                <button
                  onClick={() => handleSave("bosVenue")}
                  className="bg-green text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-lime transition-all"
                >
                  {isSaving["bosVenue"] ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-primary/5 p-6 rounded-2xl">
                  <h4 className="font-bold uppercase tracking-wider text-primary mb-4 border-b border-primary/10 pb-2">
                    Venue General Info
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderImageUpload("Venue Background Image", [
                      "bosVenue",
                      "bgImage",
                    ])}
                    {renderImageUpload("Venue Logo", ["bosVenue", "logo"])}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderInput("Venue Name", ["bosVenue", "companyName"])}
                      {renderInput("Email Address", ["bosVenue", "email"])}
                      {renderInput("Phone Number (+27 for South Africa)", [
                        "bosVenue",
                        "phone",
                      ])}
                      {renderInput("Physical Address", ["bosVenue", "address"])}
                      {renderInput("Footer Description", ["bosVenue", "footerDescription"], true)}
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">Inquiry Types (comma separated)</label>
                        <textarea
                          className="w-full bg-white border border-primary/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green outline-none"
                          value={draft.bosVenue.contact.inquiryTypes.join(', ')}
                          onChange={(e) => updateDraft(["bosVenue", "contact", "inquiryTypes"], e.target.value.split(',').map(s => s.trim()))}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-8 mb-4">
                    <h4 className="font-bold text-sm tracking-widest uppercase text-primary">
                      Venue Social Links
                    </h4>
                    <button
                      onClick={() =>
                        updateDraft(
                          ["bosVenue", "socials"],
                          [
                            ...draft.bosVenue.socials,
                            {
                              id: `bs_${Date.now()}`,
                              name: "New Social",
                              icon: "",
                              url: "",
                            },
                          ],
                        )
                      }
                      className="bg-primary text-white p-1 rounded hover:bg-green"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {draft.bosVenue.socials.map((social, idx) => (
                      <div
                        key={social.id}
                        className="bg-white p-4 rounded-xl border border-primary/10 relative"
                      >
                        <button
                          onClick={() => {
                            const newS = [...draft.bosVenue.socials];
                            newS.splice(idx, 1);
                            updateDraft(["bosVenue", "socials"], newS);
                          }}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-primary/70 uppercase mb-1">
                              Icon
                            </label>
                            <div
                              className="w-full h-16 border-2 border-dashed border-primary/20 rounded cursor-pointer flex items-center justify-center hover:border-green overflow-hidden relative bg-primary/5"
                              onClick={() =>
                                triggerFileInput(
                                  ["bosVenue", "socials"],
                                  idx,
                                  "image/png, image/jpeg, image/svg+xml",
                                )
                              }
                            >
                              {social.icon ? (
                                <img
                                  src={social.icon}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <ImageIcon
                                  size={20}
                                  className="text-primary/30"
                                />
                              )}
                            </div>
                          </div>
                          <div className="col-span-2 space-y-2">
                            <input
                              type="text"
                              value={social.name}
                              placeholder="Platform Name"
                              onChange={(e) => {
                                const n = [...draft.bosVenue.socials];
                                n[idx].name = e.target.value;
                                updateDraft(["bosVenue", "socials"], n);
                              }}
                              className="w-full text-xs p-2 rounded border border-primary/20"
                            />
                            <input
                              type="text"
                              value={social.url}
                              placeholder="URL"
                              onChange={(e) => {
                                const n = [...draft.bosVenue.socials];
                                n[idx].url = e.target.value;
                                updateDraft(["bosVenue", "socials"], n);
                              }}
                              className="w-full text-xs p-2 rounded border border-primary/20"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Home Subpage */}
                <div className="bg-primary/5 p-6 rounded-2xl">
                  <h4 className="font-bold uppercase tracking-wider text-primary mb-4 border-b border-primary/10 pb-2">
                    Home Page Content
                  </h4>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider">
                      Hero Media (Video/Image AutoPlay Loop)
                    </label>
                    <button
                      onClick={() =>
                        updateDraft(
                          ["bosVenue", "home", "heroMedia"],
                          [
                            ...draft.bosVenue.home.heroMedia,
                            {
                              id: `b_hm_${Date.now()}`,
                              type: "image",
                              url: "",
                            },
                          ],
                        )
                      }
                      className="flex items-center gap-1 bg-white text-primary border border-primary/10 px-2 py-1 rounded text-xs hover:bg-green"
                    >
                      <Plus size={14} /> Add Media
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {draft.bosVenue.home.heroMedia.map((media, idx) => (
                      <div
                        key={media.id}
                        className="relative bg-white rounded-xl border border-primary/20 p-2"
                      >
                        <button
                          onClick={() => {
                            const arr = [...draft.bosVenue.home.heroMedia];
                            arr.splice(idx, 1);
                            updateDraft(["bosVenue", "home", "heroMedia"], arr);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                        <select
                          value={media.type}
                          onChange={(e) => {
                            const arr = [...draft.bosVenue.home.heroMedia];
                            arr[idx].type = e.target.value as "image" | "video";
                            updateDraft(["bosVenue", "home", "heroMedia"], arr);
                          }}
                          className="w-full text-xs p-1 mb-2 border border-primary/10 rounded"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                        <div
                          className="relative h-24 rounded border border-dashed border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden cursor-pointer hover:border-green"
                          onClick={() =>
                            triggerFileInput(
                              ["bosVenue", "home", "heroMedia"],
                              idx,
                              media.type === "video" ? "video/*" : "image/*",
                            )
                          }
                        >
                          {media.url ? (
                            media.type === "video" ||
                            media.url.includes("video") ||
                            media.url.endsWith(".mp4") ? (
                              <video
                                src={media.url}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={media.url}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <ImageIcon size={20} className="text-primary/30" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {renderInput("Hero Title", ["bosVenue", "home", "heroTitle"])}
                  {renderInput("Hero Subtitle", [
                    "bosVenue",
                    "home",
                    "heroSubtitle",
                  ])}
                  {renderInput("Story Title", [
                    "bosVenue",
                    "home",
                    "storyTitle",
                  ])}
                  {renderInput(
                    "Story Text 1",
                    ["bosVenue", "home", "storyText1"],
                    true,
                  )}
                  {renderInput(
                    "Story Text 2",
                    ["bosVenue", "home", "storyText2"],
                    true,
                  )}

                  {/* Venue Rules & Pricing PDFs */}
                  <div className="bg-primary/5 p-6 rounded-2xl mt-8">
                    <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                      <h4 className="font-bold uppercase tracking-wider text-primary">
                        Rules & Pricing (PDFs)
                      </h4>
                      <button
                        onClick={() => {
                          const newPdf: PDFFile = {
                            id: `v_pdf_${Date.now()}`,
                            title: "New Rule/Price List",
                            size: "0.0 MB",
                            file: "",
                          };
                          updateDraft(
                            ["bosVenue", "rulesPdfs"],
                            [...(draft.bosVenue.rulesPdfs || []), newPdf],
                          );
                        }}
                        className="flex items-center gap-1 bg-white text-primary border border-primary/10 px-2 py-1 rounded text-xs hover:bg-green"
                      >
                        <Plus size={14} /> Add PDF
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(draft.bosVenue.rulesPdfs || []).map((pdf, idx) => (
                        <div
                          key={pdf.id}
                          className="bg-white p-6 rounded-xl border border-primary/10 relative"
                        >
                          <button
                            onClick={() => {
                              const newP = [...draft.bosVenue.rulesPdfs];
                              newP.splice(idx, 1);
                              updateDraft(["bosVenue", "rulesPdfs"], newP);
                            }}
                            className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="flex flex-col sm:flex-row gap-6 items-start">
                            {/* Left slot: PDF File state & selector */}
                            <div className="flex flex-col gap-2 items-center">
                              <label className="block text-[9px] font-bold text-primary/40 uppercase leading-none self-start">
                                PDF Document
                              </label>
                              <div
                                className={`w-16 h-16 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group ${
                                  pdf.file
                                    ? "bg-green/5 border-green"
                                    : "bg-primary/5 border-primary/10 hover:border-green"
                                }`}
                                onClick={() =>
                                  triggerFileInput(
                                    ["bosVenue", "rulesPdfs"],
                                    idx,
                                    "application/pdf",
                                  )
                                }
                              >
                                {pdf.file ? (
                                  <>
                                    <FileText className="text-green w-6 h-6 mb-1" />
                                    <span className="text-[8px] font-bold text-green uppercase leading-none">
                                      REPLACE
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="text-primary/20 w-6 h-6 mb-1 group-hover:text-green group-hover:scale-105 transition-all" />
                                    <span className="text-[8px] font-bold text-primary/40 uppercase leading-none group-hover:text-green">
                                      UPLOAD
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Middle slot: Thumbnail Image */}
                            <div className="flex flex-col gap-2 items-center font-sans">
                              <label className="block text-[9px] font-bold text-primary/40 uppercase leading-none self-start">
                                Thumb Image
                              </label>
                              <div
                                className={`w-16 h-16 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group ${
                                  pdf.thumbnail
                                    ? "border-green"
                                    : "bg-primary/5 border-primary/10 hover:border-green"
                                }`}
                                onClick={() =>
                                  triggerFileInput(
                                    ["bosVenue", "rulesPdfs", "thumbnail"],
                                    idx,
                                    "image/*",
                                  )
                                }
                              >
                                {pdf.thumbnail ? (
                                  <div className="relative w-full h-full">
                                    <img
                                      src={pdf.thumbnail}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                      <span className="text-white text-[8px] font-bold uppercase">
                                        REPLACE
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <ImageIcon className="text-primary/20 w-6 h-6 mb-1 group-hover:text-green group-hover:scale-105 transition-all" />
                                    <span className="text-[8px] font-bold text-primary/40 uppercase leading-none group-hover:text-green">
                                      ADD IMAGE
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Right slot: Field info */}
                            <div className="flex-1 space-y-4 w-full">
                              <div>
                                <label className="block text-[10px] font-bold text-primary/40 uppercase mb-1">
                                  Document Title
                                </label>
                                <input
                                  type="text"
                                  value={pdf.title}
                                  onChange={(e) => {
                                    const newP = [...draft.bosVenue.rulesPdfs];
                                    newP[idx].title = e.target.value;
                                    updateDraft(
                                      ["bosVenue", "rulesPdfs"],
                                      newP,
                                    );
                                  }}
                                  className="w-full bg-primary/5 border-none rounded p-2 text-xs font-bold font-sans"
                                />
                              </div>
                              <div className="flex justify-between items-center bg-primary/5 px-3 py-2 rounded-lg">
                                <span className="text-[10px] font-mono text-primary/40 uppercase">
                                  Size: {pdf.size || "Unknown"}
                                </span>
                                {pdf.file && (
                                  <span className="text-[10px] font-bold text-green uppercase">
                                    PDF Uploaded
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Side-by-Side Venue Rules List */}
                  <div className="bg-primary/5 p-6 rounded-2xl mt-8">
                    <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                      <h4 className="font-bold uppercase tracking-wider text-primary">
                        Side-by-Side Rules List
                      </h4>
                      <button
                        onClick={() => {
                          const newRule = {
                            id: `vr_${Date.now()}`,
                            title: "RULE SECTION",
                            items: ["New rule item"],
                          };
                          updateDraft(
                            ["bosVenue", "rules"],
                            [...(draft.bosVenue.rules || []), newRule],
                          );
                        }}
                        className="flex items-center gap-1 bg-white text-primary border border-primary/10 px-2 py-1 rounded text-xs hover:bg-green"
                      >
                        <Plus size={14} /> Add Rule Group
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {(draft.bosVenue.rules || []).map((rule, idx) => (
                        <div
                          key={rule.id}
                          className="bg-white p-6 rounded-xl border border-primary/10 relative"
                        >
                          <button
                            onClick={() => {
                              const newR = [...draft.bosVenue.rules];
                              newR.splice(idx, 1);
                              updateDraft(["bosVenue", "rules"], newR);
                            }}
                            className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="mb-6">
                            <label className="block text-[10px] font-bold text-primary/40 uppercase mb-1">
                              Group Title
                            </label>
                            <input
                              type="text"
                              value={rule.title}
                              onChange={(e) => {
                                const newR = [...draft.bosVenue.rules];
                                newR[idx].title = e.target.value;
                                updateDraft(["bosVenue", "rules"], newR);
                              }}
                              className="w-full bg-primary/5 border-none rounded p-3 text-sm font-bold uppercase tracking-widest text-primary"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-primary/40 uppercase mb-1">
                              Rules (One per line)
                            </label>
                            <textarea
                              value={rule.items.join("\n")}
                              onChange={(e) => {
                                const newR = [...draft.bosVenue.rules];
                                newR[idx].items = e.target.value.split("\n");
                                updateDraft(["bosVenue", "rules"], newR);
                              }}
                              rows={6}
                              className="w-full bg-primary/5 border-none rounded p-3 text-sm font-sans leading-relaxed text-primary/80"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4 mt-6">
                    <h4 className="font-bold text-sm tracking-widest uppercase text-primary">
                      Tiny Portrait Showcase Images
                    </h4>
                    <button
                      onClick={() =>
                        updateDraft(
                          ["bosVenue", "home", "showcaseImages"],
                          [...draft.bosVenue.home.showcaseImages, ""],
                        )
                      }
                      className="bg-primary text-white p-1 rounded hover:bg-green"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {draft.bosVenue.home.showcaseImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <button
                          onClick={() => {
                            const newG = [
                              ...draft.bosVenue.home.showcaseImages,
                            ];
                            newG.splice(idx, 1);
                            updateDraft(
                              ["bosVenue", "home", "showcaseImages"],
                              newG,
                            );
                          }}
                          className="absolute top-2 right-2 text-white bg-red-500/80 hover:bg-red-500 p-1.5 rounded-lg transition-colors z-20"
                        >
                          <Trash2 size={12} />
                        </button>
                        {renderImageUpload(
                          `Image ${idx + 1}`,
                          ["bosVenue", "home", "showcaseImages"],
                          idx,
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events Subpage */}
                <div className="bg-primary/5 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                    <h4 className="font-bold uppercase tracking-wider text-primary">
                      Previous Events
                    </h4>
                    <button
                      onClick={() => {
                        const newEv = {
                          id: `ev_${Date.now()}`,
                          title: "New Event",
                          date: "Date",
                          story: "Story details...",
                          images: [""],
                        };
                        updateDraft(
                          ["bosVenue", "events"],
                          [...draft.bosVenue.events, newEv],
                        );
                      }}
                      className="flex items-center gap-1 bg-white text-primary border border-primary/10 px-3 py-1.5 rounded text-xs font-bold uppercase hover:bg-green"
                    >
                      <Plus size={14} /> Add Event
                    </button>
                  </div>
                  <div className="space-y-6">
                    {draft.bosVenue.events.map((ev, evIdx) => (
                      <div
                        key={ev.id}
                        className="bg-white p-6 rounded-xl border border-primary/10 relative"
                      >
                        <button
                          onClick={() => {
                            const newE = [...draft.bosVenue.events];
                            newE.splice(evIdx, 1);
                            updateDraft(["bosVenue", "events"], newE);
                          }}
                          className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          {renderInput("Event Title", [
                            "bosVenue",
                            "events",
                            evIdx,
                            "title",
                          ])}
                          {renderInput("Event Date", [
                            "bosVenue",
                            "events",
                            evIdx,
                            "date",
                          ])}
                        </div>
                        {renderInput(
                          "Event Story",
                          ["bosVenue", "events", evIdx, "story"],
                          true,
                        )}

                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider">
                              Event Highlights (Images/Videos)
                            </label>
                            <button
                              onClick={() =>
                                updateDraft(
                                  ["bosVenue", "events", evIdx, "media"],
                                  [...draft.bosVenue.events[evIdx].media, ""],
                                )
                              }
                              className="bg-primary text-white p-1 rounded hover:bg-green text-[10px]"
                            >
                              <Plus size={12} /> Add Media
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {ev.media.map((media, imgIdx) => (
                              <div key={imgIdx} className="relative group">
                                <button
                                  onClick={() => {
                                    const newG = [
                                      ...draft.bosVenue.events[evIdx].media,
                                    ];
                                    newG.splice(imgIdx, 1);
                                    updateDraft(
                                      ["bosVenue", "events", evIdx, "media"],
                                      newG,
                                    );
                                  }}
                                  className="absolute top-1 right-1 text-white bg-red-500/80 hover:bg-red-500 p-1 rounded transition-colors z-20"
                                >
                                  <Trash2 size={10} />
                                </button>
                                {renderImageUpload(
                                  `Media ${imgIdx + 1}`,
                                  ["bosVenue", "events", evIdx, "media"],
                                  imgIdx,
                                  true,
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Subpage info */}
                <div className="bg-primary/5 p-6 rounded-2xl">
                  <h4 className="font-bold uppercase tracking-wider text-primary mb-4 border-b border-primary/10 pb-2">
                    Venue Contact Page Info
                  </h4>
                  {renderInput("Contact Title", [
                    "bosVenue",
                    "contact",
                    "title",
                  ])}
                  {renderInput("Contact Subtitle", [
                    "bosVenue",
                    "contact",
                    "subtitle",
                  ])}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "contact" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
                <h3 className="text-2xl font-display font-bold text-primary">
                  Contact Page Editor
                </h3>
                <button
                  onClick={() => handleSave("contact")}
                  className="bg-green text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-lime transition-all"
                >
                  {isSaving["contact"] ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
              <div className="bg-primary/5 p-6 rounded-2xl">
                {renderInput("Header Title", ["contact", "title"])}
                {renderInput("Header Subtitle", ["contact", "subtitle"])}
                <p className="text-xs text-primary/60 mt-4 italic">
                  Note: Physical address, phone, and email are controlled from
                  the 'Company' tab.
                </p>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold uppercase tracking-wider text-primary">
                    Form Builder
                  </h4>
                  <button
                    onClick={() => {
                      const newFields = [...(draft.contact.formFields || [])];
                      newFields.push({
                        id: `f_${Date.now()}`,
                        type: "text",
                        label: "New Field",
                        placeholder: "PLACEHOLDER",
                      });
                      updateDraft(["contact", "formFields"], newFields);
                    }}
                    className="flex items-center gap-2 bg-green text-white px-3 py-1.5 rounded-lg text-sm hover:bg-lime transition-colors"
                  >
                    <Plus size={16} /> Add Field
                  </button>
                </div>

                <div className="space-y-4">
                  {draft.contact.formFields?.map((field, idx) => (
                    <div
                      key={field.id}
                      className="bg-white p-4 rounded-xl border border-primary/10 flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-primary">
                          Field {idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            const newFields = [...draft.contact.formFields];
                            newFields.splice(idx, 1);
                            updateDraft(["contact", "formFields"], newFields);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-primary/70 uppercase mb-2">
                            Type
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const newFields = [...draft.contact.formFields];
                              newFields[idx].type = e.target.value as any;
                              updateDraft(["contact", "formFields"], newFields);
                            }}
                            className="w-full bg-primary/5 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-green"
                          >
                            <option value="text">Text / Short Answer</option>
                            <option value="email">Email</option>
                            <option value="dropdown">Dropdown Options</option>
                            <option value="textarea">Long Message</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-primary/70 uppercase mb-2">
                            Label
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...draft.contact.formFields];
                              newFields[idx].label = e.target.value;
                              updateDraft(["contact", "formFields"], newFields);
                            }}
                            className="w-full bg-primary/5 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-green"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-primary/70 uppercase mb-2">
                            Placeholder
                          </label>
                          <input
                            type="text"
                            value={field.placeholder}
                            onChange={(e) => {
                              const newFields = [...draft.contact.formFields];
                              newFields[idx].placeholder = e.target.value;
                              updateDraft(["contact", "formFields"], newFields);
                            }}
                            className="w-full bg-primary/5 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-green"
                          />
                        </div>
                      </div>

                      {field.type === "dropdown" && (
                        <div>
                          <label className="block text-xs font-bold text-primary/70 uppercase mb-2">
                            Dropdown Options (Comma Separated)
                          </label>
                          <input
                            type="text"
                            value={field.options || ""}
                            onChange={(e) => {
                              const newFields = [...draft.contact.formFields];
                              newFields[idx].options = e.target.value;
                              updateDraft(["contact", "formFields"], newFields);
                            }}
                            className="w-full bg-primary/5 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-green"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "welcome" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
                <h3 className="text-2xl font-display font-bold text-primary">
                  Welcome Page Editor
                </h3>
                <button
                  onClick={() => handleSave("welcome")}
                  className="bg-green text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-lime transition-all"
                >
                  {isSaving["welcome"] ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-8">
                <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 shadow-sm">
                  <h4 className="font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2 text-sm border-b border-primary/10 pb-4">
                    <Settings className="w-4 h-4 text-green" /> Branding & Logos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {renderImageUpload("Main Logo", ["welcome", "logoMain"])}
                    {renderImageUpload("Venue Logo", ["welcome", "logoVenue"])}
                  </div>
                  {renderInput("Title", ["welcome", "title"])}
                  {renderInput("Subtitle", ["welcome", "subtitle"])}
                </div>

                <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 shadow-sm">
                  <h4 className="font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2 text-sm border-b border-primary/10 pb-4">
                    <ImageIcon className="w-4 h-4 text-green" /> Aesthetic Background
                  </h4>
                  {renderImageUpload("Background Image", ["welcome", "bgImage"])}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "seo" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-3">
                  <Globe className="text-green" size={24} />
                  <h3 className="text-2xl font-display font-bold text-primary">
                    SEO & Meta Strategy
                  </h3>
                </div>
                <button
                  onClick={() => handleSave("seo")}
                  className="bg-green text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-lime transition-all"
                >
                  {isSaving["seo"] ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={16} /> Save Strategy
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Global Settings */}
                <div className="bg-primary/5 p-8 rounded-2xl border border-primary/5 shadow-sm">
                  <h4 className="font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2 text-sm border-b border-primary/10 pb-4">
                    <Settings className="w-4 h-4" /> Global Meta Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {renderInput("Default Page Title", ["seo", "defaultTitle"])}
                    {renderInput("Default Meta Description", [
                      "seo",
                      "defaultDescription",
                    ])}
                    {renderInput("Canonical Base URL", ["seo", "canonicalUrl"])}
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">
                      Robots.txt Content
                    </label>
                    <textarea
                      value={draft.seo.robotsTxt}
                      onChange={(e) =>
                        updateDraft(["seo", "robotsTxt"], e.target.value)
                      }
                      className="w-full bg-white border border-primary/20 rounded-lg p-3 text-xs font-mono focus:ring-2 focus:ring-green outline-none min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Social Metadata */}
                <div className="bg-primary/5 p-8 rounded-2xl border border-primary/5 shadow-sm">
                  <h4 className="font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2 text-sm border-b border-primary/10 pb-4">
                    <Code className="w-4 h-4" /> Social Graph (OG & Twitter)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-4">
                      <h5 className="font-bold text-xs uppercase text-primary/50 flex items-center gap-2">
                        Open Graph (Facebook/Linked)
                      </h5>
                      {renderInput("OG Title", ["seo", "openGraph", "title"])}
                      {renderInput("OG Description", [
                        "seo",
                        "openGraph",
                        "description",
                      ])}
                      {renderImageUpload("OG Share Image", [
                        "seo",
                        "openGraph",
                        "image",
                      ])}
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-bold text-xs uppercase text-primary/50 flex items-center gap-2">
                        Twitter Card
                      </h5>
                      {renderInput("Twitter Title", [
                        "seo",
                        "twitterCard",
                        "title",
                      ])}
                      {renderInput("Twitter Description", [
                        "seo",
                        "twitterCard",
                        "description",
                      ])}
                      {renderInput("Twitter Handle (@user)", [
                        "seo",
                        "twitterCard",
                        "site",
                      ])}
                      {renderImageUpload("Twitter Share Image", [
                        "seo",
                        "twitterCard",
                        "image",
                      ])}
                    </div>
                  </div>
                </div>

                {/* Page-Specific Meta */}
                <div className="bg-primary/5 p-8 rounded-2xl border border-primary/5 shadow-sm">
                  <h4 className="font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2 text-sm border-b border-primary/10 pb-4">
                    <FileText className="w-4 h-4" /> Page-Level Control
                  </h4>
                  <div className="space-y-4">
                    {["home", "venue", "contact", "sports"].map((page) => (
                      <div
                        key={page}
                        className="bg-white p-6 rounded-xl border border-primary/5"
                      >
                        <h5 className="font-bold uppercase tracking-widest text-[10px] text-green mb-4">
                          {page} Page Defaults
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-primary/40 uppercase mb-1">
                              Title Tag
                            </label>
                            <input
                              value={draft.seo.pageMeta[page]?.title || ""}
                              onChange={(e) => {
                                const pm = { ...draft.seo.pageMeta };
                                pm[page] = {
                                  ...pm[page],
                                  title: e.target.value,
                                };
                                updateDraft(["seo", "pageMeta"], pm);
                              }}
                              className="w-full bg-primary/5 border-none rounded p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-primary/40 uppercase mb-1">
                              Meta Description
                            </label>
                            <input
                              value={
                                draft.seo.pageMeta[page]?.description || ""
                              }
                              onChange={(e) => {
                                const pm = { ...draft.seo.pageMeta };
                                pm[page] = {
                                  ...pm[page],
                                  description: e.target.value,
                                };
                                updateDraft(["seo", "pageMeta"], pm);
                              }}
                              className="w-full bg-primary/5 border-none rounded p-2 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical SEO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Local SEO */}
                  <div className="bg-primary/5 p-8 rounded-2xl border border-primary/5 shadow-sm">
                    <h4 className="font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2 text-sm border-b border-primary/10 pb-4">
                      <MapPin className="w-4 h-4 text-green" /> Local SEO (NAP
                      Data)
                    </h4>
                    <div className="space-y-4">
                      {renderInput("Business Name", [
                        "seo",
                        "localSEO",
                        "businessName",
                      ])}
                      {renderInput("Physical Address", [
                        "seo",
                        "localSEO",
                        "address",
                      ])}
                      <div className="grid grid-cols-2 gap-4">
                        {renderInput("Phone", ["seo", "localSEO", "phone"])}
                        {renderInput("Email", ["seo", "localSEO", "email"])}
                      </div>
                      {renderInput("Opening Hours (Schema format)", [
                        "seo",
                        "localSEO",
                        "openingHours",
                      ])}
                      <div className="grid grid-cols-2 gap-4">
                        {renderInput("Latitude", [
                          "seo",
                          "localSEO",
                          "latitude",
                        ])}
                        {renderInput("Longitude", [
                          "seo",
                          "localSEO",
                          "longitude",
                        ])}
                      </div>
                      <p className="text-[10px] text-primary/40 italic">
                        This data is used to generate LocalBusiness JSON-LD
                        markup automatically.
                      </p>
                    </div>
                  </div>

                  {/* Social Connectivity */}
                  <div className="bg-primary/5 p-8 rounded-2xl border border-primary/5 shadow-sm">
                    <h4 className="font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2 text-sm border-b border-primary/10 pb-4">
                      <Share2 className="w-4 h-4 text-green" /> Social
                      Connectivity
                    </h4>
                    <div className="space-y-4">
                      {renderInput("Facebook Page URL", [
                        "seo",
                        "socialLinks",
                        "facebook",
                      ])}
                      {renderInput("Instagram Profile", [
                        "seo",
                        "socialLinks",
                        "instagram",
                      ])}
                      {renderInput("Twitter / X Profile", [
                        "seo",
                        "socialLinks",
                        "twitter",
                      ])}
                      {renderInput("LinkedIn Company", [
                        "seo",
                        "socialLinks",
                        "linkedin",
                      ])}
                      {renderInput("YouTube Channel", [
                        "seo",
                        "socialLinks",
                        "youtube",
                      ])}
                      <p className="text-[10px] text-primary/40 italic">
                        Linked profiles improve Search Engine trust and 'SameAs'
                        authority.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sitemap & Robots */}
                <div className="bg-primary/5 p-8 rounded-2xl border border-primary/5 shadow-sm">
                  <h4 className="font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2 text-sm border-b border-primary/10 pb-4">
                    <Settings className="w-4 h-4 text-green" /> XML Sitemap &
                    Indexing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft.seo.sitemap.includeInSitemap}
                          onChange={(e) =>
                            updateDraft(
                              ["seo", "sitemap", "includeInSitemap"],
                              e.target.checked,
                            )
                          }
                          className="accent-green w-4 h-4"
                        />
                        <span className="text-xs font-bold uppercase">
                          Include in XML Sitemap
                        </span>
                      </label>
                      <div>
                        <label className="block text-[10px] font-bold text-primary/40 uppercase mb-1">
                          Update Frequency
                        </label>
                        <select
                          value={draft.seo.sitemap.changeFreq}
                          onChange={(e) =>
                            updateDraft(
                              ["seo", "sitemap", "changeFreq"],
                              e.target.value,
                            )
                          }
                          className="w-full bg-white border border-primary/10 rounded-lg p-2 text-xs"
                        >
                          {[
                            "always",
                            "hourly",
                            "daily",
                            "weekly",
                            "monthly",
                            "yearly",
                            "never",
                          ].map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-primary/40 uppercase mb-1">
                          Priority (0.0 - 1.0)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1.0"
                          value={draft.seo.sitemap.priority}
                          onChange={(e) =>
                            updateDraft(
                              ["seo", "sitemap", "priority"],
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-full bg-white border border-primary/10 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <h5 className="text-[10px] font-bold uppercase text-primary/40 mb-2">
                        Robots.txt Configuration
                      </h5>
                      <textarea
                        value={draft.seo.robotsTxt}
                        onChange={(e) =>
                          updateDraft(["seo", "robotsTxt"], e.target.value)
                        }
                        className="w-full bg-white border border-primary/20 rounded-lg p-3 text-xs font-mono focus:ring-2 focus:ring-green outline-none min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Technical SEO Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-primary/5 p-8 rounded-2xl border border-primary/5 shadow-sm">
                    <h4 className="font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2 text-sm border-b border-primary/10 pb-4">
                      <Tag className="w-4 h-4 text-green" /> Tracking &
                      Integrations
                    </h4>
                    <div className="space-y-4">
                      {renderInput("Google Analytics (G-XXXXXX)", [
                        "seo",
                        "googleAnalyticsId",
                      ])}
                      {renderInput("Google Tag Manager (GTM-XXXXX)", [
                        "seo",
                        "googleTagManagerId",
                      ])}
                      {renderInput("Search Console Token", [
                        "seo",
                        "googleSearchConsoleId",
                      ])}
                    </div>

                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                          Global Header Meta Tags
                        </h5>
                        <button
                          onClick={() =>
                            updateDraft(
                              ["seo", "metaTags"],
                              [
                                ...draft.seo.metaTags,
                                { name: "", content: "" },
                              ],
                            )
                          }
                          className="bg-primary text-white p-1 rounded hover:bg-green"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {draft.seo.metaTags.map((tag, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              placeholder="Name"
                              value={tag.name}
                              onChange={(e) => {
                                const nt = [...draft.seo.metaTags];
                                nt[idx].name = e.target.value;
                                updateDraft(["seo", "metaTags"], nt);
                              }}
                              className="flex-1 bg-white border border-primary/10 rounded-lg p-2 text-[10px]"
                            />
                            <input
                              placeholder="Content"
                              value={tag.content}
                              onChange={(e) => {
                                const nt = [...draft.seo.metaTags];
                                nt[idx].content = e.target.value;
                                updateDraft(["seo", "metaTags"], nt);
                              }}
                              className="flex-1 bg-white border border-primary/10 rounded-lg p-2 text-[10px]"
                            />
                            <button
                              onClick={() => {
                                const nt = [...draft.seo.metaTags];
                                nt.splice(idx, 1);
                                updateDraft(["seo", "metaTags"], nt);
                              }}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-8 rounded-2xl border border-primary/5 shadow-sm">
                    <h4 className="font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2 text-sm border-b border-primary/10 pb-4">
                      <Code className="w-4 h-4 text-green" /> Schema & Technical
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-primary/40 uppercase mb-1">
                          Raw Schema Markup (JSON-LD)
                        </label>
                        <textarea
                          value={draft.seo.schemaMarkup}
                          onChange={(e) =>
                            updateDraft(["seo", "schemaMarkup"], e.target.value)
                          }
                          className="w-full bg-white border border-primary/20 rounded-lg p-3 text-xs font-mono focus:ring-2 focus:ring-green outline-none min-h-[150px]"
                          placeholder="{ '@context': 'https://schema.org', ... }"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                            URL Redirects
                          </h5>
                          <button
                            onClick={() =>
                              updateDraft(
                                ["seo", "redirects"],
                                [...draft.seo.redirects, { from: "", to: "" }],
                              )
                            }
                            className="bg-primary text-white p-1 rounded hover:bg-green"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {draft.seo.redirects.map((redir, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                placeholder="/from-path"
                                value={redir.from}
                                onChange={(e) => {
                                  const nr = [...draft.seo.redirects];
                                  nr[idx].from = e.target.value;
                                  updateDraft(["seo", "redirects"], nr);
                                }}
                                className="flex-1 bg-white border border-primary/10 rounded-lg p-2 text-[10px]"
                              />
                              <input
                                placeholder="/to-path"
                                value={redir.to}
                                onChange={(e) => {
                                  const nr = [...draft.seo.redirects];
                                  nr[idx].to = e.target.value;
                                  updateDraft(["seo", "redirects"], nr);
                                }}
                                className="flex-1 bg-white border border-primary/10 rounded-lg p-2 text-[10px]"
                              />
                              <button
                                onClick={() => {
                                  const nr = [...draft.seo.redirects];
                                  nr.splice(idx, 1);
                                  updateDraft(["seo", "redirects"], nr);
                                }}
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "maintenance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
                <h3 className="text-2xl font-display font-bold text-primary">
                  Maintenance & System
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-green/10 p-8 rounded-3xl border border-green/20 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green/20 rounded-full flex items-center justify-center mb-6">
                    <Save className="text-green w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-display font-bold text-primary mb-2">
                    Commit to Source
                  </h4>
                  <p className="text-sm text-primary/60 mb-8 max-w-xs">
                    Save all current session edits (including base64 uploads)
                    directly to the server as official mock data.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        setIsSaving((prev) => ({ ...prev, mock: true }));
                        setSaveMessage(null);
                        const res = await fetch("/api/save-mock-data", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(draft),
                        });
                        const data = await res.json();
                        if (data.success) {
                          await updateData(draft);
                          setSaveMessage({ type: 'success', text: data.message || "Mock data saved and applied successfully!" });
                        } else {
                          setSaveMessage({ type: 'error', text: `Error saving/pushing data: ${data.error || 'Unknown error'}` });
                        }
                      } catch (e: any) {
                        setSaveMessage({ type: 'error', text: `Network/Server Error: ${e.message}` });
                      } finally {
                        setIsSaving((prev) => ({ ...prev, mock: false }));
                      }
                    }}
                    className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg ${isSaving["mock"] ? "bg-primary/20 cursor-not-allowed" : "bg-green hover:bg-lime text-primary"}`}
                    disabled={isSaving["mock"]}
                  >
                    {isSaving["mock"] ? "Saving & Pushing..." : "Save as Mock Data"}
                  </button>
                  {saveMessage && (
                    <div className={`mt-4 p-4 rounded-xl text-sm ${saveMessage.type === 'success' ? 'bg-green/10 text-green-700 border border-green' : 'bg-red-100 text-red-700 border border-red-500'}`}>
                      {saveMessage.text}
                    </div>
                  )}
                </div>

                <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Trash2 className="text-red-500 w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-display font-bold text-primary mb-2">
                    Factory Reset
                  </h4>
                  <p className="text-sm text-primary/60 mb-8 max-w-xs">
                    Completely clear all customizations and reset the entire
                    website to its original factory state.
                  </p>
                  <button
                    onClick={async () => {
                      if (
                        confirm(
                          "DANGER: This action is irreversible. All your changes will be deleted. Proceed?",
                        )
                      ) {
                        await resetToDefaults();
                        window.location.reload();
                      }
                    }}
                    className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                  >
                    Reset All Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
