import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import localforage from 'localforage';
import { mockBosjolData } from '../utils/mockData';

export interface Milestone {
  id: string;
  year: string;
  title: string;
  desc: string;
  img: string; // base64 or URL
}

export interface PDFFile {
  id: string;
  title: string;
  size: string;
  file: string; // base64 or URL
  thumbnail?: string; // base64 or URL representation of the pdf page or custom cover
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'dropdown';
  label: string;
  placeholder: string;
  options?: string; // Comma-separated for dropdown
}

export interface SocialLink {
  id: string;
  name: string;
  icon: string; // base64 or URL
  url: string;
}

export interface HeroMedia {
  id: string;
  type: 'image' | 'video';
  url: string; // base64 or URL
}

export interface SEOConfig {
  defaultTitle: string;
  defaultDescription: string;
  googleTagManagerId: string;
  googleAnalyticsId: string;
  googleSearchConsoleId: string;
  metaTags: { name: string; content: string }[];
  canonicalUrl: string;
  robotsTxt: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
  };
  twitterCard: {
    title: string;
    description: string;
    image: string;
    site: string;
  };
  schemaMarkup: string;
  redirects: { from: string; to: string }[];
  pageMeta: Record<string, { title: string; description: string; canonical?: string; noindex?: boolean }>;
  sitemap: {
    includeInSitemap: boolean;
    changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  };
  localSEO: {
    businessName: string;
    address: string;
    phone: string;
    email: string;
    openingHours: string;
    latitude: string;
    longitude: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export interface SportPageData {
  id: string;
  slug: string;
  navName: string;
  heroCategory: string;
  heroTitle: string;
  heroImage: string;
  storyTitle: string;
  storyText1: string;
  storyText2: string;
  pdfs: PDFFile[];
  gallery: string[];
  videoBg: string;
  videoText: string;
  videoSubtext: string;
}

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  accentHover: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  buttonRadius: string;
  cardRadius: string;
  headingFont: string;
  bodyFont: string;
}

export interface VenueRule {
  id: string;
  title: string;
  items: string[];
}

export interface BosVenueData {
  theme: ThemeConfig;
  bgImage: string;
  bgOpacity?: number;
  logo: string;
  logoHeight?: number;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  footerDescription?: string;
  socials: SocialLink[];
  home: {
    heroTitle: string;
    heroSubtitle: string;
    storyTitle: string;
    storyText1: string;
    storyText2: string;
    heroMedia: HeroMedia[];
    showcaseImages: string[];
  };
  rulesPdfs: PDFFile[];
  rules: VenueRule[];
  events: {
    id: string;
    title: string;
    date: string;
    story: string;
    media: string[];
  }[];
  contact: {
    title: string;
    subtitle: string;
    inquiryTypes: string[];
  };
}

export interface LegalConfig {
  privacyPolicy: string;
  termsOfService: string;
  legalDisclaimer: string;
}

export interface SiteData {
  theme: ThemeConfig;
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    logo: string;
    logoHeight?: number;
  };
  welcome: {
    title: string;
    subtitle: string;
    logoMain: string;
    logoVenue: string;
    bgImage: string;
  };
  socials: SocialLink[];
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroMedia: HeroMedia[];
    ownerImage: string;
    ownerTitle: string;
    ownerText1: string;
    ownerText2: string;
    milestones: Milestone[];
    brandLogos: string[];
  };
  sportsPages: SportPageData[];
  contact: {
    title: string;
    subtitle: string;
    formFields: FormField[];
  };
  seo: SEOConfig;
  bosVenue: BosVenueData;
  legal: LegalConfig;
}

const defaultData: SiteData = mockBosjolData;

interface AdminContextType {
  data: SiteData;
  updateData: (newData: SiteData) => Promise<void>;
  updateSectionData: (section: keyof SiteData, sectionData: any) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  applyMockData: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const AdminContext = createContext<AdminContextType>({
  data: defaultData,
  updateData: async () => {},
  updateSectionData: async () => {},
  resetToDefaults: async () => {},
  applyMockData: async () => {},
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Handle logout
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setLastActivity(Date.now());
  };

  // Inactivity tracking
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => setLastActivity(Date.now());
    
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    const interval = setInterval(() => {
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() - lastActivity > fiveMinutes) {
        console.log("Auto-logout due to inactivity");
        logout();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      clearInterval(interval);
    };
  }, [isAuthenticated, lastActivity]);

  useEffect(() => {
    localforage.config({
      name: 'BosjolCMS',
      storeName: 'siteData'
    });

    const loadData = async () => {
      try {
        // Fetch live data from server with a timeout to avoid hangs
        let serverData = null;
        try {
           const controller = new AbortController();
           const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
           
           const res = await fetch('/site-data.json', { signal: controller.signal });
           clearTimeout(timeoutId);
           
           if (res.ok) {
             serverData = await res.json();
           }
        } catch (e) {
           console.warn("Could not fetch site-data.json or request timed out", e);
        }

        const isAdmin = window.location.pathname.startsWith('/admin');
        const storedData = await localforage.getItem<any>('siteData');

        // For visitors, prioritize server data. For admins, prefer local draft.
        if (!isAdmin && serverData) {
          setData(serverData);
          setLoading(false);
          return;
        }

        if (storedData) {
          let needsUpdate = false;
          
          if (storedData.socials && !Array.isArray(storedData.socials)) {
            storedData.socials = defaultData.socials;
            needsUpdate = true;
          }
          if (!storedData.sportsPages) {
             storedData.sportsPages = defaultData.sportsPages;
             needsUpdate = true;
          }
          if (storedData.home && !Array.isArray(storedData.home.heroMedia)) {
             storedData.home.heroMedia = defaultData.home.heroMedia;
             needsUpdate = true;
          }
          if (storedData.contact && !Array.isArray(storedData.contact.formFields)) {
             storedData.contact.formFields = defaultData.contact.formFields;
             needsUpdate = true;
          }

          if (!storedData.bosVenue || typeof storedData.bosVenue.home === 'undefined') {
             storedData.bosVenue = defaultData.bosVenue;
             needsUpdate = true;
          }
          if (!storedData.bosVenue.rulesPdfs) {
            storedData.bosVenue.rulesPdfs = [];
            needsUpdate = true;
          } else if (Array.isArray(storedData.bosVenue.rulesPdfs)) {
            const hasLegacyStrings = storedData.bosVenue.rulesPdfs.some((p: any) => typeof p === 'string' || !p || typeof p !== 'object');
            if (hasLegacyStrings) {
              storedData.bosVenue.rulesPdfs = storedData.bosVenue.rulesPdfs.map((p: any, index: number) => {
                if (typeof p === 'string' && p) {
                  return {
                    id: `v_pdf_${Date.now()}_Legacy_${index}`,
                    title: `Venue Document ${index + 1}`,
                    size: "Unknown",
                    file: p,
                    thumbnail: ""
                  };
                } else if (p && typeof p === 'object') {
                  return {
                    id: p.id || `v_pdf_${Date.now()}_Legacy_${index}`,
                    title: p.title || `Venue Document ${index + 1}`,
                    size: p.size || "Unknown",
                    file: p.file || "",
                    thumbnail: p.thumbnail || ""
                  };
                } else {
                  return {
                    id: `v_pdf_${Date.now()}_Legacy_${index}`,
                    title: `Venue Document ${index + 1}`,
                    size: "0.0 MB",
                    file: "",
                    thumbnail: ""
                  };
                }
              });
              needsUpdate = true;
            }
          }
          if (!storedData.bosVenue.rules) {
            storedData.bosVenue.rules = defaultData.bosVenue.rules;
            needsUpdate = true;
          }
          if (!storedData.welcome) {
             storedData.welcome = defaultData.welcome;
             needsUpdate = true;
          }
          if (!storedData.legal) {
             storedData.legal = defaultData.legal;
             needsUpdate = true;
          }
           else {
             // Migration for new theme property
             if (!storedData.bosVenue.theme) {
                storedData.bosVenue.theme = defaultData.bosVenue.theme;
                needsUpdate = true;
             }
             // Migration from images to media
             storedData.bosVenue.events.forEach((ev: any) => {
                if (ev.images && !ev.media) {
                   ev.media = ev.images;
                   delete ev.images;
                   needsUpdate = true;
                }
             });
          }
          if (!storedData.theme) {
             storedData.theme = defaultData.theme;
             needsUpdate = true;
          }
          if (storedData.sportsPages) {
             storedData.sportsPages.forEach((sport: any) => {
               if (sport.pdfs && Array.isArray(sport.pdfs)) {
                 const hasLegacyPdfs = sport.pdfs.some((p: any) => typeof p === 'string' || !p || typeof p !== 'object');
                 if (hasLegacyPdfs) {
                   sport.pdfs = sport.pdfs.map((p: any, index: number) => {
                     if (typeof p === 'string' && p) {
                       return {
                         id: `s_pdf_${Date.now()}_Legacy_${index}`,
                         title: `Sport Document ${index + 1}`,
                         size: "Unknown",
                         file: p,
                         thumbnail: ""
                       };
                     } else if (p && typeof p === 'object') {
                       return {
                         id: p.id || `s_pdf_${Date.now()}_Legacy_${index}`,
                         title: p.title || `Sport Document ${index + 1}`,
                         size: p.size || "Unknown",
                         file: p.file || "",
                         thumbnail: p.thumbnail || ""
                       };
                     } else {
                       return {
                         id: `s_pdf_${Date.now()}_Legacy_${index}`,
                         title: `Sport Document ${index + 1}`,
                         size: "0.0 MB",
                         file: "",
                         thumbnail: ""
                       };
                     }
                   });
                   needsUpdate = true;
                 } else {
                   sport.pdfs.forEach((pdf: any) => {
                     if (pdf.thumbnail === undefined) {
                       pdf.thumbnail = "";
                       needsUpdate = true;
                     }
                   });
                 }
               }
             });
             needsUpdate = true;
          }

          if (needsUpdate) {
             await localforage.setItem('siteData', storedData);
          }

          // Initial migration for SEO if missing or incomplete
          if (!storedData.seo) {
            storedData.seo = defaultData.seo;
            needsUpdate = true;
          } else {
            // Check for missing sub-properties (v2 expansion)
            if (storedData.seo.canonicalUrl === undefined) {
               storedData.seo = { ...defaultData.seo, ...storedData.seo };
               needsUpdate = true;
            }
            // Check for missing sub-properties (v3 expansion - sitemap, local, socials)
            if (storedData.seo.sitemap === undefined) {
               storedData.seo.sitemap = defaultData.seo.sitemap;
               storedData.seo.localSEO = defaultData.seo.localSEO;
               storedData.seo.socialLinks = defaultData.seo.socialLinks;
               needsUpdate = true;
            }
          }

          setData(storedData);
        } else {
          await localforage.setItem('siteData', defaultData);
        }
      } catch (err) {
        console.error("Failed to load CMS data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const updateData = async (newData: SiteData) => {
    setData(newData);
    try {
      await localforage.setItem('siteData', newData);
    } catch (err) {
      console.error("localforage setItem failed:", err);
      // Fallback to storing only essential data if quota is exceeded
    }
  };

  const updateSectionData = async (section: keyof SiteData, sectionData: any) => {
    setData((prev) => {
      const newData = { ...prev, [section]: sectionData };
      localforage.setItem('siteData', newData).catch(console.error);
      return newData;
    });
  };

  const resetToDefaults = async () => {
    setData(defaultData);
    await localforage.setItem('siteData', defaultData);
  };

  const applyMockData = async () => {
    const { mockBosjolData } = await import('../utils/mockData');
    setData(mockBosjolData);
    await localforage.setItem('siteData', mockBosjolData);
  };

  return (
    <AdminContext.Provider value={{ data, updateData, updateSectionData, resetToDefaults, applyMockData, loading, isAuthenticated, login, logout }}>
      {loading ? null : children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
