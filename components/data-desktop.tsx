"use client";

import {
  Blocks,
  BriefcaseBusiness,
  CircleUserRound,
  Download,
  ExternalLink,
  FileChartColumnIncreasing,
  FileText,
  Github,
  Linkedin,
  Mail,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type AppId = "about" | "projects" | "work" | "resume" | "contact";

type PortfolioApp = {
  id: AppId;
  title: string;
  subtitle: string;
  icon: typeof CircleUserRound;
  accent: string;
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

type WindowPosition = {
  top: number;
  left: number;
};

type WindowSize = {
  width: number;
  height: number;
};

type MinimizeTransform = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

type ResizeDirection = "n" | "e" | "s" | "w" | "ne" | "nw" | "se" | "sw";

type ProjectImage = {
  src: string;
  alt: string;
};

type Project = {
  title: string;
  githubUrl?: string;
  applicationUrl?: string;
  type: string;
  metric: string;
  visualLabel: string;
  tone: string;
  images: ProjectImage[];
  summary: string;
  tags: string[];
};

type PdfViewport = {
  width: number;
  height: number;
};

type PdfRenderTask = {
  promise: Promise<void>;
  cancel: () => void;
};

type PdfPageProxy = {
  getViewport: (options: { scale: number }) => PdfViewport;
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
    transform?: [number, number, number, number, number, number];
  }) => PdfRenderTask;
};

type PdfDocumentProxy = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPageProxy>;
  destroy?: () => Promise<void>;
};

type PdfLoadingTask = {
  promise: Promise<PdfDocumentProxy>;
  destroy?: () => Promise<void>;
};

type PdfJsApi = {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (source: { url: string }) => PdfLoadingTask;
};

const closeTransitionMs = 180;
const openTransitionMs = 760;
const zoomTransitionMs = 520;
const minimizeTransitionMs = 620;
const fallbackSiteScale = 0.78;

function getSiteScale() {
  if (typeof document === "undefined") {
    return fallbackSiteScale;
  }

  const scale = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--site-scale"),
  );

  return Number.isFinite(scale) && scale > 0 ? scale : fallbackSiteScale;
}

const initialAppStates: Record<AppId, boolean> = {
  about: false,
  projects: false,
  work: false,
  resume: false,
  contact: false,
};

const initialMinimizeTransforms: Record<AppId, MinimizeTransform> = {
  about: { x: 0, y: 0, scaleX: 0.08, scaleY: 0.08 },
  projects: { x: 0, y: 0, scaleX: 0.08, scaleY: 0.08 },
  work: { x: 0, y: 0, scaleX: 0.08, scaleY: 0.08 },
  resume: { x: 0, y: 0, scaleX: 0.08, scaleY: 0.08 },
  contact: { x: 0, y: 0, scaleX: 0.08, scaleY: 0.08 },
};

const apps: PortfolioApp[] = [
  {
    id: "about",
    title: "About",
    subtitle: "whoami.profile",
    icon: CircleUserRound,
    accent: "#61e2c2",
    position: { top: 40, left: 500, width: 1300, height: 850 },
  },
  {
    id: "projects",
    title: "Projects",
    subtitle: "case_studies/",
    icon: Blocks,
    accent: "#c7f464",
    position: { top: 20, left: 540, width: 1300, height: 900 },
  },
  {
    id: "work",
    title: "Work Experience",
    subtitle: "career_timeline.log",
    icon: BriefcaseBusiness,
    accent: "#ff6ea8",
    position: { top: 30, left: 500, width: 1200, height: 900 },
  },
  {
    id: "resume",
    title: "Resume",
    subtitle: "resume.snapshot",
    icon: FileText,
    accent: "#f4b942",
    position: { top: 10, left: 600, width: 1000, height: 1000 },
  },
  {
    id: "contact",
    title: "Contact",
    subtitle: "links_and_signal",
    icon: Mail,
    accent: "#8bd3ff",
    position: { top: 140, left: 950, width: 1200, height: 660 },
  },
];

const projects: Project[] = [
  {
    title: "Prompt Space",
    applicationUrl: "https://promptspace.online/",
    githubUrl: "https://github.com/donavanyieh/prompt-space",
    type: "GenAI Product",
    metric: "Prompt literacy platform",
    visualLabel: "prompt systems",
    tone: "#61e2c2",
    images: [
      {
        src: "/projects/promptspace.jpg",
        alt: "Prompt Space application screenshot",
      },
    ],
    summary:
      "A web application for organizing prompts, tracking changes, and gathering feedback on prompt effectiveness. Deployed with on Google Cloud, SSO authentication.",
    tags: ["Web Development", "PostgreSQL", "Google Cloud", "Git"],
  },
  {
    title: "Vulnerable Software Prediction Modelling",
    type: "ML Research",
    metric: "73% F1-score",
    visualLabel: "vulnerability model",
    tone: "#ff6ea8",
    images: [
      {
        src: "/projects/vulnerable_software.jpg",
        alt: "Prompt Space application screenshot",
      },
    ],
    summary:
      "Built an end-to-end pipeline (data collection -> NLP/ data processing -> classification) to predict open source software affected by new vulnerabilities. Achieved 73% F1-score (9 p.p. higher than benchmarks at that time). Final model served via Python (Flask) endpoint with web interface.",
    tags: ["Web Scraping", "Data Processing", "Machine Learning", "Classification", "Research"],
  },
  {
    title: "Persona Driven Application Debugger",
    githubUrl: "https://github.com/donavanyieh/DYWA_prod",
    type: "Agentic Personas Simulation",
    metric: "OpenAI Codex Hackathon 2026",
    visualLabel: "signal explorer",
    tone: "#c7f464",
    images: [
      {
        src: "/projects/persona_debugger.png",
        alt: "Prompt Space application screenshot",
      },
    ],
    summary:
      "Moving beyond function level debugging and code improvement, to user-product level code understanding. We set personas (AI Agents) with goals, and give them free reign to operate on web application. Personas report whether they achieve their goal, and/or any difficulties. Other AI agents modify the code if necessary in a sandbox before making pull requests",
    tags: ["Web Application", "Agentic Development", "Dashboarding"],
  },
  {
    title: "LLM Experiment Suite",
    githubUrl: "https://github.com/donavanyieh/LLMExperimentSuite",
    type: "Evaluation Tool",
    metric: "Used in Workshops",
    visualLabel: "eval suite",
    tone: "#f4b942",
    images: [
      {
        src: "/projects/llmexperiment.jpg",
        alt: "Prompt Space application screenshot",
      },
    ],
    summary:
      "Visualize and compare outputs across different LLMs, understand token decisions, and response stability. Built this website as a side project and eventually used in GenAI upskilling workshops",
    tags: ["LLM evaluation", "Prompt Engineering", "Observability","Data Visualization"],
  },
  {
    title: "Daily Attention Newsletter",
    githubUrl: "https://github.com/donavanyieh/Daily-Attention-Scraper",
    type: "Automation",
    metric: "Daily research digest",
    visualLabel: "research digest",
    tone: "#8bd3ff",
    images: [
      {
        src: "/projects/daily_attention.jpg",
        alt: "Prompt Space application screenshot",
      },
    ],
    summary:
      "Inspired to automate my mornings. Deployed a CRON job to scrape arxiv and huggingface papers, and provide a daily summary of advancements and new tools. Use LLMs to parse papers and extract key information, insights, and brainstorm ways to apply to daily work with chatbot 'Chat with Paper' feature.",
    tags: ["Python", "Supabase", "Web Scraping","GenAI", "Multimodal Processing"],
  },
  {
    title: "Other Projects",
    type: "Others",
    metric: "Data Science and Analytics",
    visualLabel: "",
    tone: "#8f7cff",
    images: [],
    summary:
      "Check out my Github and Kaggle link for more projects, at https://github.com/donavanyieh and https://www.kaggle.com/yiehyuheng",
    tags: ["Data Science", "Data Analytics"],
  },
];

const workExperiences = [
  {
    period: "May 2026 - Present",
    role: "Research Engineer",
    org: "Singapore Management University",
    focus: "LLMs & Software Vulnerabilities",
    summary:
      "My research field is in the application of Gen AI in software engineering and cybersecurity.\n I am building multi-agent systems to detect vulnerability inducing commits in code repositories",
  },
  {
    period: "Feb 2025 - Mar 2026",
    role: "Data Scientist",
    org: "PwC",
    focus: "SG AI Factory, GenAI applications",
    summary:
      "Part of the Engineering and Applied Research team within PwC's internal AI team (AI Factory). I lead end to end projects on GenAI implementation for internal tooling. Built agentic workflows for ESG reporting gaps analysis, information retrieval pipelines for compliance, and multimodal document processing.\n\nI also conduct workshops internally and externally, and mentor juniors.",
  },
  {
    period: "Jan 2024 - Jan 2025",
    role: "Data Scientist II",
    org: "Synthesis",
    focus: "Geosegmentation & Product Distribution",
    summary:
      "Worked with alcohol brands to develop similiarity matching algorithms on maps data (venue metadata, place reviews, menu analysis, footfall etc) to help create product distribution strategies.",
  },
  {
    period: "Jun 2022 - Dec 2023",
    role: "Data Scientist I",
    org: "Synthesis",
    focus: "Audience Segmentation",
    summary:
      "Extracted and analyzed social, behavioural, advertising, and open-web datasets to build audience personas. We scrape upwards of 100+ million data points, segment them, and look for distinct properties within and inter user segment through machine learning techniques (network analytics, clustering, NLP, image analysis).",
  },
  {
    period: "Jan 2022 - May 2022",
    role: "Research Assistant",
    org: "Singapore Management University",
    focus: "Software Analytics Research Group",
    summary:
      "Implemented extreme multi-label classifiers, scraped vulnerability data across web domains, and evaluated NLP feature engineering methods. Achieved a 73% F1-score (9 p.p. higher than benchmarks at that time). Final model served via Python (Flask) endpoint with web interface.",
  },
  {
    period: "2019 - 2022",
    role: "Data Scientist/ Analyst (Internships)",
    org: "Various companies: Johnson & Johnson, Ahrefs, Accenture",
    focus: "Analytics, search, and regional app rollout",
    summary:
      "Still in University, did a bunch of internships.\nBuilt analytics dashboards, forecasting models, retrieve/rerank experiments, data pipelines, and business-analysis support across early roles.",
  },
];

const aboutTechSections = [
  {
    title: "GenAI",
    items: [
      "LLM applications",
      "Agentic AI",
      "RAG Chatbots",
      "Multimodal processing",
      "Evaluations",
      "Prompt Engineering"
    ],
  },
  {
    title: "Machine Learning & Data",
    items: [
      "Python",
      "SQL",
      "Web Scraping",
      "Data Processing",
      "Natural Language Processing",
      "Computer Vision"
    ],
  },
  {
    title: "Cloud & Product",
    items: [
      "Google Cloud",
      "DevOps",
      "Git",
      "Docker",
      "CI/CD",
      "Stakeholder Management"
    ],
  },
];

const aboutNotes = [
  "I actively take part in triathlons and trial races. I've travelled to Vietnam, Hong Kong, and Malaysia for races.",
  "I make coffee. I believe that it is easier to make a nice drip coffee than an espresso based coffee, despite what others say.",
  "I recently started gaming with my friends. I never gamed a lot but figured I do not have many years left to enjoy gaming with friends. I learnt that I am terrible at games.",
];

const resumePdfFilename = "Donavan Yieh Resume.pdf";
const resumePdfUrl = `/resume/${encodeURIComponent(resumePdfFilename)}`;
const resumeDefaultZoom = 0.8;
const resumeMinZoom = 0.5;
const resumeMaxZoom = 1.35;
const resumeZoomStep = 0.1;

const links = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/donavan-yieh-yuheng/",
    display: "linkedin.com/in/donavan-yieh-yuheng",
    icon: Linkedin,
  },
  {
    label: "GitHub",
    href: "https://github.com/donavanyieh",
    display: "github.com/donavanyieh",
    icon: Github,
  },
  {
    label: "Email",
    href: "mailto:yiehyuheng@gmail.com",
    display: "yiehyuheng@gmail.com",
    icon: Mail,
  },
  {
    label: "Resume",
    href: resumePdfUrl,
    display: "Download Resume",
    icon: FileText,
  },
];

export function DataDesktop() {
  const closeTimers = useRef<Partial<Record<AppId, number>>>({});
  const dockIconRefs = useRef<Partial<Record<AppId, HTMLSpanElement | null>>>({});
  const openingTimers = useRef<Partial<Record<AppId, number>>>({});
  const minimizeTimers = useRef<Partial<Record<AppId, number>>>({});
  const zoomTimers = useRef<Partial<Record<AppId, number>>>({});
  const [openApps, setOpenApps] = useState<Record<AppId, boolean>>({
    about: true,
    projects: false,
    work: false,
    resume: false,
    contact: false,
  });
  const [closingApps, setClosingApps] = useState<Record<AppId, boolean>>(initialAppStates);
  const [minimizedApps, setMinimizedApps] =
    useState<Record<AppId, boolean>>(initialAppStates);
  const [minimizingApps, setMinimizingApps] =
    useState<Record<AppId, boolean>>(initialAppStates);
  const [openingApps, setOpeningApps] =
    useState<Record<AppId, boolean>>(initialAppStates);
  const [zoomingApps, setZoomingApps] =
    useState<Record<AppId, boolean>>(initialAppStates);
  const [minimizeTransforms, setMinimizeTransforms] =
    useState<Record<AppId, MinimizeTransform>>(initialMinimizeTransforms);
  const [focusedApp, setFocusedApp] = useState<AppId>("about");
  const [highestZ, setHighestZ] = useState(8);
  const [zIndexes, setZIndexes] = useState<Record<AppId, number>>({
    about: 5,
    projects: 3,
    work: 2,
    resume: 1,
    contact: 1,
  });
  const [positions, setPositions] = useState<Record<AppId, WindowPosition>>({
    about: apps[0].position,
    projects: apps[1].position,
    work: apps[2].position,
    resume: apps[3].position,
    contact: apps[4].position,
  });
  const [sizes, setSizes] = useState<Record<AppId, WindowSize>>({
    about: apps[0].position,
    projects: apps[1].position,
    work: apps[2].position,
    resume: apps[3].position,
    contact: apps[4].position,
  });
  const [maximizedApps, setMaximizedApps] = useState<Record<AppId, boolean>>({
    about: false,
    projects: false,
    work: false,
    resume: false,
    contact: false,
  });

  const focused = useMemo(
    () => apps.find((app) => app.id === focusedApp) ?? apps[0],
    [focusedApp],
  );

  useEffect(() => {
    const closeTimersByApp = closeTimers.current;
    const minimizeTimersByApp = minimizeTimers.current;
    const openingTimersByApp = openingTimers.current;
    const zoomTimersByApp = zoomTimers.current;

    return () => {
      Object.values(closeTimersByApp).forEach((timer) => {
        if (timer) {
          window.clearTimeout(timer);
        }
      });
      Object.values(minimizeTimersByApp).forEach((timer) => {
        if (timer) {
          window.clearTimeout(timer);
        }
      });
      Object.values(openingTimersByApp).forEach((timer) => {
        if (timer) {
          window.clearTimeout(timer);
        }
      });
      Object.values(zoomTimersByApp).forEach((timer) => {
        if (timer) {
          window.clearTimeout(timer);
        }
      });
    };
  }, []);

  function getWindowFallbackRect(id: AppId) {
    const siteScale = getSiteScale();
    const logicalViewportWidth = window.innerWidth / siteScale;
    const logicalViewportHeight = window.innerHeight / siteScale;

    if (maximizedApps[id]) {
      return {
        left: 12 * siteScale,
        top: 60 * siteScale,
        width: (logicalViewportWidth - 24) * siteScale,
        height: (logicalViewportHeight - 48 - 142 - 24) * siteScale,
      };
    }

    return {
      left: positions[id].left * siteScale,
      top: (positions[id].top + 48) * siteScale,
      width: Math.min(sizes[id].width, logicalViewportWidth - 36) * siteScale,
      height: Math.min(
        sizes[id].height,
        logicalViewportHeight - 48 - 142 - positions[id].top - 12,
      ) * siteScale,
    };
  }

  function getDockTransform(id: AppId, sourceRect: DOMRect | null): MinimizeTransform {
    const siteScale = getSiteScale();
    const source = sourceRect ?? getWindowFallbackRect(id);
    const target = dockIconRefs.current[id]?.getBoundingClientRect() ?? {
      left: window.innerWidth / 2 - 26 * siteScale,
      top: window.innerHeight - 78 * siteScale,
      width: 52 * siteScale,
      height: 52 * siteScale,
    };

    return {
      x: (target.left - source.left) / siteScale,
      y: (target.top - source.top) / siteScale,
      scaleX: Math.max(target.width / Math.max(source.width, 1), 0.03),
      scaleY: Math.max(target.height / Math.max(source.height, 1), 0.03),
    };
  }

  function openApp(id: AppId) {
    const closeTimer = closeTimers.current[id];
    const openingTimer = openingTimers.current[id];
    const minimizeTimer = minimizeTimers.current[id];
    const zoomTimer = zoomTimers.current[id];
    const nextZ = highestZ + 1;
    const shouldAnimateOpen =
      !openApps[id] || closingApps[id] || minimizedApps[id] || minimizingApps[id];

    if (closeTimer) {
      window.clearTimeout(closeTimer);
      delete closeTimers.current[id];
    }

    if (openingTimer) {
      window.clearTimeout(openingTimer);
      delete openingTimers.current[id];
    }

    if (minimizeTimer) {
      window.clearTimeout(minimizeTimer);
      delete minimizeTimers.current[id];
    }

    if (zoomTimer) {
      window.clearTimeout(zoomTimer);
      delete zoomTimers.current[id];
    }

    if (shouldAnimateOpen) {
      setMinimizeTransforms((current) => ({ ...current, [id]: getDockTransform(id, null) }));
      setOpeningApps((current) => ({ ...current, [id]: true }));

      openingTimers.current[id] = window.setTimeout(() => {
        setOpeningApps((current) => ({ ...current, [id]: false }));
        delete openingTimers.current[id];
      }, openTransitionMs);
    } else {
      setOpeningApps((current) => ({ ...current, [id]: false }));
    }

    setClosingApps((current) => ({ ...current, [id]: false }));
    setMinimizedApps((current) => ({ ...current, [id]: false }));
    setMinimizingApps((current) => ({ ...current, [id]: false }));
    setZoomingApps((current) => ({ ...current, [id]: false }));
    setOpenApps((current) => ({ ...current, [id]: true }));
    setFocusedApp(id);
    setHighestZ(nextZ);
    setZIndexes((current) => ({ ...current, [id]: nextZ }));
  }

  function closeApp(id: AppId) {
    const existingTimer = closeTimers.current[id];
    const openingTimer = openingTimers.current[id];
    const minimizeTimer = minimizeTimers.current[id];
    const zoomTimer = zoomTimers.current[id];

    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    if (openingTimer) {
      window.clearTimeout(openingTimer);
      delete openingTimers.current[id];
    }

    if (minimizeTimer) {
      window.clearTimeout(minimizeTimer);
      delete minimizeTimers.current[id];
    }

    if (zoomTimer) {
      window.clearTimeout(zoomTimer);
      delete zoomTimers.current[id];
    }

    setClosingApps((current) => ({ ...current, [id]: true }));
    setOpeningApps((current) => ({ ...current, [id]: false }));
    setMinimizingApps((current) => ({ ...current, [id]: false }));
    setZoomingApps((current) => ({ ...current, [id]: false }));

    closeTimers.current[id] = window.setTimeout(() => {
      setOpenApps((current) => {
        const nextOpenApps = { ...current, [id]: false };

        setFocusedApp((currentFocusedApp) => {
          if (currentFocusedApp !== id) {
            return currentFocusedApp;
          }

          return apps.find((app) => nextOpenApps[app.id])?.id ?? id;
        });

        return nextOpenApps;
      });
      setClosingApps((current) => ({ ...current, [id]: false }));
      setMinimizedApps((current) => ({ ...current, [id]: false }));
      setMaximizedApps((current) => ({ ...current, [id]: false }));
      delete closeTimers.current[id];
    }, closeTransitionMs);
  }

  function minimizeApp(id: AppId, sourceRect: DOMRect | null) {
    const closeTimer = closeTimers.current[id];
    const openingTimer = openingTimers.current[id];
    const existingTimer = minimizeTimers.current[id];
    const zoomTimer = zoomTimers.current[id];

    if (closeTimer) {
      window.clearTimeout(closeTimer);
      delete closeTimers.current[id];
    }

    if (openingTimer) {
      window.clearTimeout(openingTimer);
      delete openingTimers.current[id];
    }

    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    if (zoomTimer) {
      window.clearTimeout(zoomTimer);
      delete zoomTimers.current[id];
    }

    setMinimizeTransforms((current) => ({ ...current, [id]: getDockTransform(id, sourceRect) }));
    setClosingApps((current) => ({ ...current, [id]: false }));
    setMinimizedApps((current) => ({ ...current, [id]: false }));
    setOpeningApps((current) => ({ ...current, [id]: false }));
    setMinimizingApps((current) => ({ ...current, [id]: true }));
    setZoomingApps((current) => ({ ...current, [id]: false }));

    minimizeTimers.current[id] = window.setTimeout(() => {
      setMinimizedApps((current) => ({ ...current, [id]: true }));
      setMinimizingApps((current) => ({ ...current, [id]: false }));
      setFocusedApp((currentFocusedApp) => {
        if (currentFocusedApp !== id) {
          return currentFocusedApp;
        }

        const nextFocusedApp = apps.find(
          (app) => app.id !== id && openApps[app.id] && !minimizedApps[app.id],
        );

        return nextFocusedApp?.id ?? id;
      });
      delete minimizeTimers.current[id];
    }, minimizeTransitionMs);
  }

  function registerDockIcon(id: AppId, element: HTMLSpanElement | null) {
    dockIconRefs.current[id] = element;
  }

  function focusApp(id: AppId) {
    const nextZ = highestZ + 1;
    setFocusedApp(id);
    setHighestZ(nextZ);
    setZIndexes((current) => ({ ...current, [id]: nextZ }));
  }

  function moveApp(id: AppId, position: WindowPosition) {
    setPositions((current) => ({ ...current, [id]: position }));
  }

  function resizeApp(id: AppId, position: WindowPosition, size: WindowSize) {
    setPositions((current) => ({ ...current, [id]: position }));
    setSizes((current) => ({ ...current, [id]: size }));
  }

  function toggleMaximizeApp(id: AppId) {
    const zoomTimer = zoomTimers.current[id];

    if (zoomTimer) {
      window.clearTimeout(zoomTimer);
    }

    focusApp(id);
    setZoomingApps((current) => ({ ...current, [id]: true }));
    setMaximizedApps((current) => ({ ...current, [id]: !current[id] }));

    zoomTimers.current[id] = window.setTimeout(() => {
      setZoomingApps((current) => ({ ...current, [id]: false }));
      delete zoomTimers.current[id];
    }, zoomTransitionMs);
  }

  return (
    <main className="desktop" aria-label="DataOS portfolio desktop">
      <MenuBar activeTitle={focused.title} />

      <DesktopIcons onOpen={openApp} />

      <section className="desktop-stage" aria-label="Open portfolio windows">
        {apps.map((app) =>
          openApps[app.id] && (!minimizedApps[app.id] || minimizingApps[app.id]) ? (
            <Window
              app={app}
              isClosing={closingApps[app.id]}
              isMinimizing={minimizingApps[app.id]}
              isOpening={openingApps[app.id]}
              isMaximized={maximizedApps[app.id]}
              isFocused={focusedApp === app.id}
              isZooming={zoomingApps[app.id]}
              key={app.id}
              onClose={() => closeApp(app.id)}
              onFocus={() => focusApp(app.id)}
              onMinimize={(sourceRect) => minimizeApp(app.id, sourceRect)}
              onMove={(position) => moveApp(app.id, position)}
              onMaximize={() => toggleMaximizeApp(app.id)}
              onResize={(position, size) => resizeApp(app.id, position, size)}
              minimizeTransform={minimizeTransforms[app.id]}
              position={positions[app.id]}
              size={sizes[app.id]}
              zIndex={zIndexes[app.id]}
            >
              <AppContent id={app.id} openApp={openApp} />
            </Window>
          ) : null,
        )}
      </section>

      <Dock
        focusedApp={focusedApp}
        minimizedApps={minimizedApps}
        minimizingApps={minimizingApps}
        openingApps={openingApps}
        onOpen={openApp}
        openApps={openApps}
        registerDockIcon={registerDockIcon}
      />
    </main>
  );
}

function MenuBar({ activeTitle }: { activeTitle: string }) {
  return (
    <header className="menu-bar">
      <div className="menu-left">
        <span className="apple-dot" aria-hidden="true" />
        <strong>Donavan OS</strong>
        <span>Portfolio</span>
      </div>
      <div className="menu-right">
        <span>Singapore</span>
      </div>
    </header>
  );
}

function DesktopIcons({ onOpen }: { onOpen: (id: AppId) => void }) {
  return (
    <nav className="desktop-icons" aria-label="Desktop shortcuts">
      <button className="desktop-app" onClick={() => onOpen("about")} type="button">
        <span
          className="desktop-app-icon"
          style={{ "--accent": "#8bd3ff" } as React.CSSProperties}
        >
          <Sparkles size={31} strokeWidth={1.9} />
        </span>
        <span>How to navigate</span>
      </button>
    </nav>
  );
}

function Dock({
  focusedApp,
  minimizedApps,
  minimizingApps,
  openingApps,
  openApps,
  onOpen,
  registerDockIcon,
}: {
  focusedApp: AppId;
  minimizedApps: Record<AppId, boolean>;
  minimizingApps: Record<AppId, boolean>;
  openingApps: Record<AppId, boolean>;
  openApps: Record<AppId, boolean>;
  onOpen: (id: AppId) => void;
  registerDockIcon: (id: AppId, element: HTMLSpanElement | null) => void;
}) {
  return (
    <nav className="dock" aria-label="Portfolio dock">
      {apps.map((app) => {
        const Icon = app.icon;
        const isActive = focusedApp === app.id && openApps[app.id] && !minimizedApps[app.id];

        return (
          <button
            className={`dock-button ${isActive ? "is-active" : ""} ${minimizingApps[app.id] ? "is-receiving" : ""} ${openingApps[app.id] ? "is-launching" : ""}`}
            data-dock-app={app.id}
            key={app.id}
            onClick={() => onOpen(app.id)}
            title={`Open ${app.title}`}
            type="button"
          >
            <span
              className="dock-icon"
              data-dock-icon={app.id}
              ref={(element) => registerDockIcon(app.id, element)}
              style={{ "--accent": app.accent } as React.CSSProperties}
            >
              <Icon size={26} strokeWidth={1.8} />
            </span>
            <span className="dock-label">{app.title}</span>
            {openApps[app.id] ? <span className="dock-running" /> : null}
          </button>
        );
      })}
    </nav>
  );
}

function Window({
  app,
  children,
  isFocused,
  isClosing,
  isMinimizing,
  isOpening,
  isMaximized,
  isZooming,
  minimizeTransform,
  onClose,
  onFocus,
  onMaximize,
  onMinimize,
  onMove,
  onResize,
  position,
  size,
  zIndex,
}: {
  app: PortfolioApp;
  children: React.ReactNode;
  isFocused: boolean;
  isClosing: boolean;
  isMinimizing: boolean;
  isOpening: boolean;
  isMaximized: boolean;
  isZooming: boolean;
  minimizeTransform: MinimizeTransform;
  onClose: () => void;
  onFocus: () => void;
  onMaximize: () => void;
  onMinimize: (sourceRect: DOMRect | null) => void;
  onMove: (position: WindowPosition) => void;
  onResize: (position: WindowPosition, size: WindowSize) => void;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
}) {
  const Icon = app.icon;
  const windowRef = useRef<HTMLElement | null>(null);
  const minWidth = 340;
  const minHeight = 280;

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  function handleChromePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (
      event.button !== 0 ||
      isMaximized ||
      window.matchMedia("(max-width: 760px)").matches
    ) {
      return;
    }

    const windowElement = windowRef.current;

    if (!windowElement) {
      return;
    }

    event.preventDefault();

    const rect = windowElement.getBoundingClientRect();
    const siteScale = getSiteScale();
    const stageRect = (windowElement.offsetParent as HTMLElement | null)?.getBoundingClientRect();
    const stageWidth = (stageRect?.width ?? window.innerWidth) / siteScale;
    const stageHeight = (stageRect?.height ?? window.innerHeight - 134) / siteScale;
    const windowWidth = rect.width / siteScale;
    const windowHeight = rect.height / siteScale;
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = position.left;
    const startTop = position.top;
    const minLeft = 12;
    const minTop = 12;
    const maxLeft = Math.max(minLeft, stageWidth - windowWidth - 12);
    const maxTop = Math.max(minTop, stageHeight - windowHeight - 12);

    function handlePointerMove(moveEvent: PointerEvent) {
      onMove({
        left: clamp(startLeft + (moveEvent.clientX - startX) / siteScale, minLeft, maxLeft),
        top: clamp(startTop + (moveEvent.clientY - startY) / siteScale, minTop, maxTop),
      });
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  }

  function handleChromeDoubleClick(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    event.preventDefault();
    onMaximize();
  }

  function handleResizePointerDown(
    event: React.PointerEvent<HTMLSpanElement>,
    direction: ResizeDirection,
  ) {
    if (
      event.button !== 0 ||
      isMaximized ||
      window.matchMedia("(max-width: 760px)").matches
    ) {
      return;
    }

    const windowElement = windowRef.current;

    if (!windowElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onFocus();

    const siteScale = getSiteScale();
    const stageRect = (windowElement.offsetParent as HTMLElement | null)?.getBoundingClientRect();
    const stageWidth = (stageRect?.width ?? window.innerWidth) / siteScale;
    const stageHeight = (stageRect?.height ?? window.innerHeight - 134) / siteScale;
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = position.left;
    const startTop = position.top;
    const startWidth = size.width;
    const startHeight = size.height;
    const minLeft = 12;
    const minTop = 12;

    function handlePointerMove(moveEvent: PointerEvent) {
      const deltaX = (moveEvent.clientX - startX) / siteScale;
      const deltaY = (moveEvent.clientY - startY) / siteScale;
      let nextLeft = startLeft;
      let nextTop = startTop;
      let nextWidth = startWidth;
      let nextHeight = startHeight;

      if (direction.includes("e")) {
        nextWidth = clamp(startWidth + deltaX, minWidth, stageWidth - startLeft - minLeft);
      }

      if (direction.includes("s")) {
        nextHeight = clamp(startHeight + deltaY, minHeight, stageHeight - startTop - minTop);
      }

      if (direction.includes("w")) {
        nextWidth = clamp(startWidth - deltaX, minWidth, startLeft + startWidth - minLeft);
        nextLeft = startLeft + startWidth - nextWidth;
      }

      if (direction.includes("n")) {
        nextHeight = clamp(startHeight - deltaY, minHeight, startTop + startHeight - minTop);
        nextTop = startTop + startHeight - nextHeight;
      }

      onResize(
        { left: nextLeft, top: nextTop },
        { width: nextWidth, height: nextHeight },
      );
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  }

  function handleMinimizeClick() {
    onMinimize(windowRef.current?.getBoundingClientRect() ?? null);
  }

  return (
    <article
      className={`window ${isFocused ? "is-focused" : ""} ${isMaximized ? "is-maximized" : ""} ${isClosing ? "is-closing" : ""} ${isMinimizing ? "is-minimizing" : ""} ${isOpening ? "is-opening" : ""} ${isZooming ? "is-zooming" : ""}`}
      onPointerDown={onFocus}
      ref={windowRef}
      style={
        {
          "--accent": app.accent,
          "--top": `${position.top}px`,
          "--left": `${position.left}px`,
          "--width": `${size.width}px`,
          "--height": `${size.height}px`,
          "--minimize-x": `${minimizeTransform.x}px`,
          "--minimize-y": `${minimizeTransform.y}px`,
          "--minimize-scale-x": minimizeTransform.scaleX,
          "--minimize-scale-y": minimizeTransform.scaleY,
          zIndex,
        } as React.CSSProperties
      }
    >
      <header
        className="window-chrome"
        onDoubleClick={handleChromeDoubleClick}
        onPointerDown={handleChromePointerDown}
      >
        <div className="traffic-lights">
          <button
            aria-label={`Close ${app.title}`}
            className="light close"
            onClick={onClose}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            <X size={10} />
          </button>
          <button
            aria-label={`Minimize ${app.title}`}
            className="light minimize"
            onClick={handleMinimizeClick}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            <Minimize2 size={10} />
          </button>
          <button
            aria-label={`Maximize ${app.title}`}
            className="light maximize"
            onClick={onMaximize}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            <Maximize2 size={10} />
          </button>
        </div>
        <div className="window-title">
          <Icon size={15} strokeWidth={1.8} />
          <span>{app.title}</span>
          <small>{app.subtitle}</small>
        </div>
      </header>
      <div className="window-body">{children}</div>
      <span
        aria-hidden="true"
        className="resize-handle resize-n"
        onPointerDown={(event) => handleResizePointerDown(event, "n")}
      />
      <span
        aria-hidden="true"
        className="resize-handle resize-e"
        onPointerDown={(event) => handleResizePointerDown(event, "e")}
      />
      <span
        aria-hidden="true"
        className="resize-handle resize-s"
        onPointerDown={(event) => handleResizePointerDown(event, "s")}
      />
      <span
        aria-hidden="true"
        className="resize-handle resize-w"
        onPointerDown={(event) => handleResizePointerDown(event, "w")}
      />
      <span
        aria-hidden="true"
        className="resize-handle resize-ne"
        onPointerDown={(event) => handleResizePointerDown(event, "ne")}
      />
      <span
        aria-hidden="true"
        className="resize-handle resize-nw"
        onPointerDown={(event) => handleResizePointerDown(event, "nw")}
      />
      <span
        aria-hidden="true"
        className="resize-handle resize-se"
        onPointerDown={(event) => handleResizePointerDown(event, "se")}
      />
      <span
        aria-hidden="true"
        className="resize-handle resize-sw"
        onPointerDown={(event) => handleResizePointerDown(event, "sw")}
      />
    </article>
  );
}

function AppContent({ id, openApp }: { id: AppId; openApp: (id: AppId) => void }) {
  if (id === "about") {
    return <AboutWindow openApp={openApp} />;
  }

  if (id === "projects") {
    return <ProjectsWindow />;
  }

  if (id === "work") {
    return <WorkExperienceWindow />;
  }

  if (id === "resume") {
    return <ResumeWindow />;
  }

  return <ContactWindow />;
}

function AboutWindow({ openApp }: { openApp: (id: AppId) => void }) {
  return (
    <div className="about-layout">
      <section className="identity-block">
        <p className="eyebrow">Data Scientist/ AI Engineer/ Applied Research</p>
        <h1>Hi, I&apos;m Donavan.</h1>
        <p>
          Welcome to my portfolio. I like tinkering with and building things,
          especially GenAI applications, software intelligence, and data products
          that feel useful instead of being merely impressive.
        </p>
        <p>
          <b>I have worked across applied research, development of GenAI tools, and a variety of ML fields such as
          geospatial analytics, audience segmentation, and traditional ML tasks (e.g. classification and demand forecasting).</b>
        </p>
        <p>Disclaimer that <b>this portfolio site is almost entirely vibe coded, using Claude (via Cline extension on Visual Studio).</b> See the below section for my thoughts on GenAI.</p>
        <p className="about-navigation-note"><b>Please navigate around this application through the dock at the bottom. The windows can be dragged, resized, minimized, and maximized, so feel free to explore this like a tiny desktop.</b></p>
        <div className="identity-actions">
          <button type="button" onClick={() => openApp("projects")}>
            <Blocks size={16} />
            Projects
          </button>
          <button type="button" onClick={() => openApp("work")}>
            <BriefcaseBusiness size={16} />
            Work
          </button>
          <button type="button" onClick={() => openApp("resume")}>
            <FileText size={16} />
            Resume
          </button>
          <button type="button" onClick={() => openApp("contact")}>
            <Mail size={16} />
            Contact
          </button>
        </div>
      </section>

      <section className="about-section about-genai">
        <h2>My thoughts on GenAI</h2>
        <p><b>I have mixed feelings about AI.</b></p>
        <p>When gpt 4 first came out, it completely changed the project I was working on. Our initial workflow was with OCR, rules based data wrangling, and hours of manual validation to extract structured data from a wide variety of menu images. When we swapped to (then) Gemini, the zero shot results was amazing, and we understood instantly that we had to pivot our workflow to incorporate LLMs more.</p> 
        <p>I think GenAI is most exciting when it becomes reliably useful, with grounded retrieval and clear frameworks for understanding performance, but I do not believe that it can replace humans yet, especially for complex problems where human judgement is needed, like compliance, business recommendations, or even just the nuance of understanding what someone does at work.</p>
        <p>Fast forward to now, GenAI is used pretty much used daily for coding tasks, including building this portfolio site. At the risk of forgetting fundementals, I still think it is pretty neat that I, as a non software engineer, can build this site and focus on the creative aspect.</p>
        <p> However, as someone who still came from a computing background before ChatGPT and LLMs, I wonder if this is the right direction, for people who build systems to not understand even the basics of the systems they are building.</p>
        <p>It feels liberating but strange that I can create this site <b>almost</b> without touching the code. (I still did the deployments and read CSS/javascript elements to make my prompting more effective).</p>
        <p>Who knows what the future of computer science and coding is lol. This is written in 2026, let's see how well it ages...</p>
      </section>

      <section className="about-section" aria-label="Tech stack">
        <h2>Tech Skills</h2>
        <div className="about-tech-stack">
          {aboutTechSections.map((section) => (
            <div className="about-tech-group" key={section.title}>
              <p className="about-section-label">{section.title}</p>
              <div className="about-tech-grid">
                {section.items.map((item) => (
                  <div className="about-tech-card" key={item}>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section" aria-label="When I am not coding">
        <h2>When I&apos;m not coding</h2>
        <ul className="about-note-list">
          {aboutNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ProjectsWindow() {
  return (
    <div className="projects-layout">
      <div className="window-intro">
        <p className="eyebrow">Couple of things i'm proud of</p>
        <h2>Some cool projects</h2>
      </div>

      <div className="project-grid">
        {projects.map((project) => {
          const featuredImage = project.images[0];
          const projectLinks = [
            project.githubUrl
              ? { href: project.githubUrl, label: "Github Link", Icon: Github }
              : null,
            project.applicationUrl
              ? {
                  href: project.applicationUrl,
                  label: "Application Link",
                  Icon: ExternalLink,
                }
              : null,
          ].filter(
            (
              link,
            ): link is {
              href: string;
              label: string;
              Icon: typeof Github;
            } => Boolean(link),
          );

          return (
            <article className="project-card" key={project.title}>
              <div
                className="project-media"
                style={{ "--media-accent": project.tone } as React.CSSProperties}
              >
                {featuredImage ? (
                  <img alt={featuredImage.alt} src={featuredImage.src} />
                ) : (
                  <div className="project-media-fallback">
                    <span>{project.visualLabel}</span>
                    <strong>{project.title}</strong>
                  </div>
                )}
                {project.images.length > 1 ? (
                  <div className="project-thumbs" aria-label={`${project.images.length} project images`}>
                    {project.images.slice(0, 3).map((image) => (
                      <img alt="" key={image.src} src={image.src} />
                    ))}
                    {project.images.length > 3 ? (
                      <span>+{project.images.length - 3}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="project-card-top">
                <div>
                  <span className="project-type">{project.type}</span>
                  <h3>{project.title}</h3>
                </div>
              </div>
              <p>{project.summary}</p>
              <div className="metric-row">
                <Sparkles size={15} />
                <strong>{project.metric}</strong>
              </div>
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {projectLinks.length ? (
                <div className="project-actions">
                  {projectLinks.map(({ href, label, Icon }) => (
                    <a href={href} key={label} target="_blank" rel="noreferrer">
                      <Icon size={14} />
                      {label}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

type SummaryBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    };

function parseMarkdownSummary(text: string) {
  const blocks: SummaryBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length) {
      blocks.push({ type: "paragraph", text: paragraphLines.join("\n") });
      paragraphLines = [];
    }
  }

  function flushList() {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  }

  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);

    if (bullet) {
      flushParagraph();
      listItems.push(bullet[1]);
      return;
    }

    flushList();
    paragraphLines.push(line);
  });

  flushParagraph();
  flushList();

  return blocks;
}

function MarkdownSummary({ text }: { text: string }) {
  return (
    <div className="work-summary">
      {parseMarkdownSummary(text).map((block, index) => {
        if (block.type === "list") {
          return (
            <ul key={`list-${index}`}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return <p key={`paragraph-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}

function ResumePdfViewer({ zoom }: { zoom: number }) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [viewerWidth, setViewerWidth] = useState(0);
  const [pdfState, setPdfState] = useState<{
    document: PdfDocumentProxy;
    pageCount: number;
  } | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const viewerElement = viewerRef.current;

    if (!viewerElement) {
      return;
    }

    const updateViewerWidth = () => {
      setViewerWidth(viewerElement.clientWidth);
    };

    updateViewerWidth();

    const resizeObserver = new ResizeObserver(updateViewerWidth);
    resizeObserver.observe(viewerElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PdfLoadingTask | null = null;

    async function loadResumePdf() {
      try {
        const pdfjs = (await import("pdfjs-dist")) as unknown as PdfJsApi;
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        loadingTask = pdfjs.getDocument({ url: resumePdfUrl });
        const document = await loadingTask.promise;

        if (cancelled) {
          void document.destroy?.();
          return;
        }

        setPdfState({ document, pageCount: document.numPages });
      } catch {
        if (!cancelled) {
          setHasError(true);
        }
      }
    }

    loadResumePdf();

    return () => {
      cancelled = true;
      void loadingTask?.destroy?.();
    };
  }, []);

  return (
    <div className="resume-pdf-viewer" ref={viewerRef}>
      {hasError ? (
        <div className="resume-pdf-state">
          <span>Resume PDF could not be displayed.</span>
          <a href={resumePdfUrl} target="_blank" rel="noreferrer">
            Open PDF
          </a>
        </div>
      ) : pdfState ? (
        <div className="resume-page-stack">
          {Array.from({ length: pdfState.pageCount }, (_, index) => (
            <ResumePdfPage
              document={pdfState.document}
              key={index + 1}
              pageNumber={index + 1}
              viewerWidth={viewerWidth}
              zoom={zoom}
            />
          ))}
        </div>
      ) : (
        <div className="resume-pdf-state">
          <span>Loading PDF</span>
        </div>
      )}
    </div>
  );
}

function ResumePdfPage({
  document,
  pageNumber,
  viewerWidth,
  zoom,
}: {
  document: PdfDocumentProxy;
  pageNumber: number;
  viewerWidth: number;
  zoom: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || viewerWidth <= 0) {
      return;
    }

    const targetCanvas = canvas;
    let cancelled = false;
    let renderTask: PdfRenderTask | null = null;

    async function renderPage() {
      try {
        setIsRendered(false);
        setHasError(false);

        const page = await document.getPage(pageNumber);

        if (cancelled) {
          return;
        }

        const baseViewport = page.getViewport({ scale: 1 });
        const targetWidth = Math.max((viewerWidth - 36) * zoom, 220);
        const viewport = page.getViewport({ scale: targetWidth / baseViewport.width });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const context = targetCanvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas context unavailable.");
        }

        targetCanvas.width = Math.floor(viewport.width * pixelRatio);
        targetCanvas.height = Math.floor(viewport.height * pixelRatio);
        targetCanvas.style.width = `${viewport.width}px`;
        targetCanvas.style.height = `${viewport.height}px`;

        renderTask = page.render({
          canvasContext: context,
          transform:
            pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
          viewport,
        });

        await renderTask.promise;

        if (!cancelled) {
          setIsRendered(true);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;

      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // Rendering may already be complete.
        }
      }
    };
  }, [document, pageNumber, viewerWidth, zoom]);

  return (
    <div className={`resume-page ${isRendered ? "is-rendered" : ""}`}>
      {hasError ? (
        <span>Page {pageNumber} could not render.</span>
      ) : (
        <canvas aria-label={`Resume page ${pageNumber}`} ref={canvasRef} role="img" />
      )}
    </div>
  );
}

function WorkExperienceWindow() {
  return (
    <div className="work-layout">
      <div className="work-head">
        <p className="eyebrow">What I've been up to</p>
        <h2>Career Timeline</h2>
      </div>

      <div className="timeline">
        {workExperiences.map((item) => (
          <article className="timeline-item" key={`${item.period}-${item.org}`}>
            <div className="timeline-dot" />
            <div>
              <span>
                {item.period === "May 2026 - Present" ? (
                  <>
                    May 2026 - <b>Present</b>
                  </>
                ) : (
                  item.period
                )}
              </span>
              <h3>
                {item.role} <small>@ {item.org}</small>
              </h3>
              <small className="work-focus">{item.focus}</small>
              <MarkdownSummary text={item.summary} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ResumeWindow() {
  const [resumeZoom, setResumeZoom] = useState(resumeDefaultZoom);
  const zoomPercent = Math.round(resumeZoom * 100);

  function updateResumeZoom(delta: number) {
    setResumeZoom((current) =>
      Math.min(resumeMaxZoom, Math.max(resumeMinZoom, Number((current + delta).toFixed(2)))),
    );
  }

  return (
    <div className="resume-layout resume-pdf-layout">
      <div className="resume-toolbar">
        <div className="resume-file-label">
          <FileText size={17} />
          <span>{resumePdfFilename}</span>
        </div>
        <div className="resume-toolbar-actions">
          <div className="resume-zoom-controls" aria-label="Resume zoom controls">
            <button
              aria-label="Zoom resume out"
              disabled={resumeZoom <= resumeMinZoom}
              onClick={() => updateResumeZoom(-resumeZoomStep)}
              title="Zoom out"
              type="button"
            >
              <ZoomOut size={15} />
            </button>
            <span>{zoomPercent}%</span>
            <button
              aria-label="Zoom resume in"
              disabled={resumeZoom >= resumeMaxZoom}
              onClick={() => updateResumeZoom(resumeZoomStep)}
              title="Zoom in"
              type="button"
            >
              <ZoomIn size={15} />
            </button>
          </div>
          <a
            className="resume-download"
            download={resumePdfFilename}
            href={resumePdfUrl}
          >
            <Download size={16} />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      <div className="resume-viewer-shell">
        <ResumePdfViewer zoom={resumeZoom} />
      </div>
    </div>
  );
}

function ContactWindow() {
  return (
    <div className="contact-layout">
      <div>
        <p className="eyebrow">Based in Singapore</p>
        <h2>Open to data science, GenAI, and research/product conversations.</h2>
        <p>
          
        </p>
      </div>

      <div className="link-stack">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <a href={link.href} key={link.label} target="_blank" rel="noreferrer">
              <Icon size={18} />
              <span className="link-copy">
                <strong>{link.label}</strong>
                <span>{link.display}</span>
              </span>
              <ExternalLink size={14} />
            </a>
          );
        })}
      </div>
    </div>
  );
}
