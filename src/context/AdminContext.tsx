import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import localforage from 'localforage';

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
  };
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
}

const defaultData: SiteData = {
  theme: {
    primaryColor: '#0a0a0a',
    accentColor: '#4ade80',
    accentHover: '#22c55e',
    secondaryColor: '#f5f5f5',
    backgroundColor: '#ffffff',
    textColor: '#171717',
    borderColor: '#e5e5e5',
    buttonRadius: '0.75rem',
    cardRadius: '1.5rem',
    headingFont: 'Space Grotesk, sans-serif',
    bodyFont: 'Inter, sans-serif'
  },
  company: {
    name: "BOSJOL",
    email: "Hello@bosjol.com",
    phone: "+27 80 555 0199",
    address: "Multi Sports Arena HQ",
    logo: "" // Default empty, falls back to text
  },
  welcome: {
    title: "Welcome to BOSJOL",
    subtitle: "Push beyond limits.",
    logoMain: "",
    logoVenue: "",
    bgImage: "https://images.unsplash.com/photo-1541625602330-2277e94b41c6?q=80&w=2070&auto=format&fit=crop"
  },
  socials: [
    { id: "s1", name: "Instagram", icon: "", url: "#" },
    { id: "s2", name: "Facebook", icon: "", url: "#" },
    { id: "s3", name: "YouTube", icon: "", url: "#" }
  ],
  home: {
    heroTitle: "UNLEASH \n YOUR <span class=\"text-transparent bg-clip-text bg-gradient-to-r from-green to-lime\">ENERGY</span>",
    heroSubtitle: "Push beyond limits. A new dimension of athletic excellence crafted for the modern competitor.",
    heroMedia: [
       { id: "hm1", type: "image", url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop" }
    ],
    ownerTitle: "MEET THE OWNER",
    ownerImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
    ownerText1: "Founded on the belief that peak athletic performance requires an environment that breathes energy, Bosjol was born from a singular passion to rip up the traditional playbook of sterile gym environments.",
    ownerText2: "\"We wanted to build more than a brand. We wanted to build a frequency. A space where every athlete feels the pulse of greatness the moment they step in.\"",
    milestones: [
      {
        id: "m1",
        year: "2018",
        title: "The Blueprint",
        desc: "The initial vision for a revolutionary athletic space was drafted on a single napkin, dreaming of a venue where performance meets pure energy.",
        img: "https://images.unsplash.com/photo-1542652694-40abf526446e?q=80&w=2070&auto=format&fit=crop"
      },
      {
        id: "m2",
        year: "2021",
        title: "Groundbreaking",
        desc: "Construction began on the first dedicated multi-sports arena. We engineered custom surfaces and dynamic lighting to set new physical standards.",
        img: "https://images.unsplash.com/photo-1589859762194-eaae75c61f64?q=80&w=2070&auto=format&fit=crop"
      },
      {
        id: "m3",
        year: "2026",
        title: "Vanguard Era",
        desc: "Bosjol officially opened its doors, welcoming a new generation of athletes to experience the premier destination for athletic progression.",
        img: "https://images.unsplash.com/photo-1519315901367-f34f11ce3c1c?q=80&w=1911&auto=format&fit=crop"
      }
    ],
    brandLogos: []
  },
  sportsPages: [
    {
      id: "sport_1",
      slug: "track-and-field",
      navName: "Track & Field",
      heroCategory: "Elite Division",
      heroTitle: "Track & Field",
      heroImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop",
      storyTitle: "THE SPIRIT OF \n<span class=\"text-primary/50\">THE DISCIPLINE</span>",
      storyText1: "Track and field is the purest distillation of human ability. Speed, strength, endurance, and aerial grace coming together. At Bosjol, we don't just host track events; we elevate them into cinematic showcases.",
      storyText2: "Our custom surfaces are formulated to return maximum energy. Every angle, every lighting rig is designed to capture the breathtaking motion of the athlete. This is where records are chased and shattered in an atmosphere that demands nothing less than perfection.",
      pdfs: [
        { id: "p1", title: "Official Tournament Rules 2026", size: "2.4 MB", file: "" },
        { id: "p2", title: "Athlete Registration Form", size: "1.1 MB", file: "" },
        { id: "p3", title: "Code of Conduct & Ethics", size: "840 KB", file: "" },
        { id: "p4", title: "Venue Equipment Guidelines", size: "3.2 MB", file: "" },
      ],
      gallery: [
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519315901367-f34f11ce3c1c?q=80&w=1911&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1483726234545-481d6e8802ec?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1605296830714-7caca5f4c541?q=80&w=2070&auto=format&fit=crop",
      ],
      videoBg: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop",
      videoText: "Play Highlight Reel",
      videoSubtext: "2026 Championship Flow"
    }
  ],
  contact: {
    title: "Get \n<span class=\"text-green\">In Touch</span>",
    subtitle: "Connect with the Bosjol team. Elevate your athletic organization, request bespoke events, or inquire about partnerships.",
    formFields: [
      { id: "f1", type: "text", label: "Full Name", placeholder: "FULL NAME" },
      { id: "f2", type: "email", label: "Email Address", placeholder: "EMAIL ADDRESS" },
      { id: "f3", type: "dropdown", label: "Inquiry Type", placeholder: "INQUIRY TYPE", options: "Event Hosting, Brand Partnership, Press & Media, General Inquiry" },
      { id: "f4", type: "textarea", label: "Your Message", placeholder: "YOUR MESSAGE" }
    ]
  },
  seo: {
    defaultTitle: "BOSJOL | Elite Athletic Performance",
    defaultDescription: "Push beyond limits with BOSJOL. The premier destination for athletic progression and high-energy sports venues.",
    googleTagManagerId: "",
    googleAnalyticsId: "",
    googleSearchConsoleId: "",
    metaTags: [],
    canonicalUrl: "https://bosjol.com",
    robotsTxt: "User-agent: *\nAllow: /",
    openGraph: {
      title: "BOSJOL | Elite Athletic Performance",
      description: "Push beyond limits with BOSJOL.",
      image: ""
    },
    twitterCard: {
      title: "BOSJOL | Elite Athletic Performance",
      description: "Push beyond limits with BOSJOL.",
      image: "",
      site: "@bosjol"
    },
    schemaMarkup: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"BOSJOL\"\n}",
    redirects: [],
    pageMeta: {
      "home": { title: "BOSJOL | Home", description: "Welcome to BOSJOL." },
      "venue": { title: "BOS Venue | Events", description: "BOS Venue events and bookings." }
    },
    sitemap: {
      includeInSitemap: true,
      changeFreq: 'weekly',
      priority: 0.8
    },
    localSEO: {
      businessName: "BOSJOL Athletic Performance",
      address: "",
      phone: "",
      email: "hello@bosjol.com",
      openingHours: "Mon-Sun: 06:00 - 22:00",
      latitude: "",
      longitude: ""
    },
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: ""
    }
  },
  bosVenue: {
    theme: {
        primaryColor: '#0a0a0a',
        accentColor: '#4ade80',
        accentHover: '#22c55e',
        secondaryColor: '#f5f5f5',
        backgroundColor: '#ffffff',
        textColor: '#171717',
        borderColor: '#e5e5e5',
        buttonRadius: '0.75rem',
        cardRadius: '1.5rem',
        headingFont: 'Space Grotesk, sans-serif',
        bodyFont: 'Inter, sans-serif'
    },
    bgImage: "https://images.unsplash.com/photo-1542652694-40abf526446e?q=80&w=2070&auto=format&fit=crop",
    logo: "",
    companyName: "BOS VENUE",
    email: "events@bosjol.com",
    phone: "+27 80 555 0200",
    address: "BOS Venue Center, 100 Arena Way",
    socials: [
      { id: "bs1", name: "Instagram", icon: "", url: "#" }
    ],
    home: {
      heroTitle: "BOS VENUE",
      heroSubtitle: "Where Greatness Gathers",
      storyTitle: "Our Story",
      storyText1: "Bos Venue is more than just an event space.",
      storyText2: "A legendary experience awaits.",
      heroMedia: [
        { id: "b_hm1", type: "image", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" }
      ],
      showcaseImages: [
        "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=1000",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000"
      ]
    },
    events: [
      {
        id: "ev1",
        title: "Winter Invitational",
        date: "Dec 10, 2025",
        story: "A spectacular showcase of talent.",
        media: ["https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=1000"]
      }
    ],
    contact: {
      title: "Get In Touch",
      subtitle: "Plan your next event with us."
    },
    rulesPdfs: [],
    rules: [
      { id: 'r1', title: 'VENUE RULES', items: ['No smoking indoors', 'Respect the wildlife', 'Music off at midnight'] },
      { id: 'r2', title: 'BOOKING POLICY', items: ['50% deposit required', 'Refundable up to 30 days', 'Final headcount 7 days before'] }
    ]
  }
};

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
        const storedData = await localforage.getItem<any>('siteData');
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
