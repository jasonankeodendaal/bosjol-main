import { SiteData } from '../context/AdminContext';

export const mockBosjolData: SiteData = {
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
    email: "info@bosjol.co.za",
    phone: "076 905 3652",
    address: "BOSJOL Arena, South Africa",
    logo: ""
  },
  welcome: {
    title: "WELCOME TO BOSJOL",
    subtitle: "VENUES & SPORTS ARENA",
    logoMain: "",
    logoVenue: "",
    bgImage: "https://images.unsplash.com/photo-1541625602330-2277e94b41c6?q=80&w=2070&auto=format&fit=crop"
  },
  socials: [
    { id: "s1", name: "Instagram", icon: "", url: "https://www.instagram.com/bosjol_arena/" },
    { id: "s2", name: "Facebook", icon: "", url: "https://www.facebook.com/bosjol/" }
  ],
  home: {
    heroTitle: "BOSJOL \n <span class=\"text-transparent bg-clip-text bg-gradient-to-r from-green to-lime\">ARENA</span>",
    heroSubtitle: "Your premier destination for high-energy indoor sports and exclusive events. Experience the pulse of competition.",
    heroMedia: [
       { id: "hm1", type: "image", url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop" }
    ],
    ownerTitle: "MEET THE TEAM",
    ownerImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
    ownerText1: "Founded by Gerda and Francois Odendaal, BOSJOL was born from a passion for bringing people together through sport and celebration.",
    ownerText2: "\"We believe that sport is more than a game—it's a community. Our arena is built to provide the best environment for athletes to shine and for families to enjoy.\"",
    milestones: [
      {
        id: "m1",
        year: "2018",
        title: "The Vision",
        desc: "BOSJOL started with a dream of creating a world-class indoor sports facility that doubles as a premium event venue.",
        img: "https://images.unsplash.com/photo-1542652694-40abf526446e?q=80&w=2070&auto=format&fit=crop"
      },
      {
        id: "m2",
        year: "2021",
        title: "Official Opening",
        desc: "We opened our doors to the public, introducing professional-grade indoor cricket and netball courts.",
        img: "https://images.unsplash.com/photo-1589859762194-eaae75c61f64?q=80&w=2070&auto=format&fit=crop"
      }
    ],
    brandLogos: []
  },
  sportsPages: [
    {
      id: "sport_cricket",
      slug: "indoor-cricket",
      navName: "Indoor Cricket",
      heroCategory: "Cricket Division",
      heroTitle: "Indoor Cricket",
      heroImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop",
      storyTitle: "THE ACTION NEVER \n<span class=\"text-primary/50\">STOPS</span>",
      storyText1: "Fast-paced, exciting, and competitive. Our indoor cricket leagues are designed for players of all skill levels, from social teams to provincial competitors.",
      storyText2: "With high-tension nets and professional surfaces, every ball counts. Join a league today and experience the intensity of the tightest overs in the game.",
      pdfs: [
        { id: "p1", title: "Indoor Cricket Rules", size: "1.2 MB", file: "" }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000"
      ],
      videoBg: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000",
      videoText: "Watch the highlights",
      videoSubtext: "League Finals 2024"
    },
    {
      id: "sport_netball",
      slug: "indoor-netball",
      navName: "Indoor Netball",
      heroCategory: "Netball Division",
      heroTitle: "Indoor Netball",
      heroImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop",
      storyTitle: "PRECISION AND \n<span class=\"text-primary/50\">SPEED</span>",
      storyText1: "Our indoor netball courts host thriving leagues where speed and accuracy are the keys to victory. It's the perfect way to stay fit and social.",
      storyText2: "From junior training sessions to senior competitive leagues, BOSJOL provides a safe and professional environment for the sport we love.",
      pdfs: [
        { id: "p1", title: "League Schedule", size: "800 KB", file: "" }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000"
      ],
      videoBg: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000",
      videoText: "See the action",
      videoSubtext: "Mid-week Social"
    }
  ],
  contact: {
    title: "PLAN YOUR \n<span class=\"text-green\">NEXT WIN</span>",
    subtitle: "Enquire about league registrations, venue hire for private parties, or general information.",
    formFields: [
      { id: "f1", type: "text", label: "Group/Team Name", placeholder: "TEAM NAME" },
      { id: "f2", type: "email", label: "Email Address", placeholder: "EMAIL ADDRESS" },
      { id: "f3", type: "dropdown", label: "Interest", placeholder: "WHAT ARE YOU INTERESTED IN?", options: "Indoor Cricket, Indoor Netball, Venue Hire, Kids Parties" },
      { id: "f4", type: "textarea", label: "Message", placeholder: "YOUR MESSAGE" }
    ]
  },
  seo: {
    defaultTitle: "BOSJOL | Indoor Sports & Event Venue",
    defaultDescription: "The best indoor cricket and netball arena in the region. Elite facilities for sports and private events.",
    googleTagManagerId: "",
    googleAnalyticsId: "",
    googleSearchConsoleId: "",
    metaTags: [],
    canonicalUrl: "https://bosjol.co.za",
    robotsTxt: "User-agent: *\nAllow: /",
    openGraph: {
      title: "BOSJOL | Indoor Sports",
      description: "Join our leagues and experience the best indoor sports arena.",
      image: ""
    },
    twitterCard: {
      title: "BOSJOL | Sports & Events",
      description: "Push beyond limits with BOSJOL.",
      image: "",
      site: "@bosjol"
    },
    schemaMarkup: "",
    redirects: [],
    pageMeta: {},
    sitemap: {
      includeInSitemap: true,
      changeFreq: 'weekly',
      priority: 0.8
    },
    localSEO: {
      businessName: "BOSJOL Arena",
      address: "South Africa",
      phone: "076 905 3652",
      email: "info@bosjol.co.za",
      openingHours: "Mon-Sat: 08:30 - 22:00",
      latitude: "",
      longitude: ""
    },
    socialLinks: {
      facebook: "https://www.facebook.com/bosjol/",
      instagram: "https://www.instagram.com/bosjol_arena/",
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
    email: "events@bosjol.co.za",
    phone: "072 888 0544",
    address: "BOS Venue Arena",
    footerDescription: "Multi-sport hub, premium event venue. Celebrations at their best in Mpumalanga.",
    socials: [],
    home: {
      heroTitle: "BOS VENUE",
      heroSubtitle: "CELEBRATIONS AT THEIR BEST",
      storyTitle: "AN UNFORGETTABLE SETTING",
      storyText1: "Whether it is a wedding ceremony, a milestone birthday, or a corporate function, BOS VENUE provides a versatile and elegant backdrop.",
      storyText2: "Our team ensures that every detail is perfect, from the lighting to the layout, crafting moments that last a lifetime.",
      heroMedia: [
        { id: "b_hm1", type: "image", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" }
      ],
      showcaseImages: [
        "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=1000",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000"
      ]
    },
    rulesPdfs: [
      { id: "v_pdf1", title: "Venue Pricing 2026", size: "1.5 MB", file: "" },
      { id: "v_pdf2", title: "Ceremony Packages", size: "2.1 MB", file: "" }
    ],
    rules: [
      { 
        id: "vr1", 
        title: "VENUE GUIDELINES", 
        items: [
          "Strictly no smoking inside the venue area.",
          "Noise levels must be reduced between 23:00 and 00:00.",
          "All music to be switched off at midnight sharp.",
          "Respect the surrounding nature and wildlife."
        ] 
      },
      { 
        id: "vr2", 
        title: "CLIENT RESPONSIBILITIES", 
        items: [
          "50% Non-refundable deposit required to secure date.",
          "Final guest count to be confirmed 14 days prior.",
          "Catering requirements finalized 21 days prior.",
          "Clients are responsible for their own security of valuables."
        ] 
      }
    ],
    events: [],
    contact: {
      title: "HOST YOUR EVENT",
      subtitle: "Contact us to view the venue and discuss your requirements."
    }
  }
};
