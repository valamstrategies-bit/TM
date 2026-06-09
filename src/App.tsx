/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  Search,
  Building2,
  Users2,
  Cpu,
  TrendingUp,
  Coins,
  Briefcase,
  ShieldCheck,
  FileSpreadsheet,
  Star,
  CheckCircle,
  Phone,
  Mail,
  Plus,
  MapPin,
  User,
  Clock,
  ArrowRight,
  DollarSign,
  Calculator,
  FileText,
  Check,
  ChevronRight,
  Sparkles,
  Wrench,
  Settings2,
  Tag,
  Package,
  Code,
  AlertCircle,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  Play,
  CheckSquare,
  Target,
  ChevronDown
} from "lucide-react";
import {
  taglines,
  mockProducts,
  mockServices,
  mockProjects,
  mockAMCPackages,
  mockVendors,
  initialRFQs,
  mockBids
} from "./data";
import { Product, Service, Project, AMCPackage, RFQ, Vendor, Bid } from "./types";
import {
  startGoogleOAuthFlow,
  fetchGoogleUserProfile,
  createGoogleSpreadsheet,
  appendSpreadsheetRows,
  writeSpreadsheetRows,
  readSpreadsheetRows,
  queryGmailInbox,
  sendGmailEmail,
  TheervuEmail
} from "./workspace";

export default function App() {
  // Brand Header states
  const [activeTaglineIdx, setActiveTaglineIdx] = useState(0);
  const [showTaglinePrompt, setShowTaglinePrompt] = useState(false);

  // Core suite toggle: "client" vs "vendor"
  const [userRole, setUserRole] = useState<"client" | "vendor">("client");

  // Client Hub navigation
  const [clientTab, setClientTab] = useState<"marketplace" | "marketing-estimator" | "sop-builder" | "post-rfq" | "workspace-sync">("marketplace");

  // Google Workspace States
  const [googleToken, setGoogleToken] = useState<string | null>(() => localStorage.getItem("google_access_token"));
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googleSpreadsheetId, setGoogleSpreadsheetId] = useState<string>("");
  const [googleSpreadsheetUrl, setGoogleSpreadsheetUrl] = useState<string>("");
  const [sheetsSyncMessage, setSheetsSyncMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [gmailMessages, setGmailMessages] = useState<TheervuEmail[]>([]);
  const [gmailSearchQuery, setGmailSearchQuery] = useState<string>("Theervu");
  const [gmailLoading, setGmailLoading] = useState<boolean>(false);
  const [gmailStatus, setGmailStatus] = useState<{ text: string; error: boolean } | null>(null);
  
  // Send email form states
  const [emailTo, setEmailTo] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("Theervu Maiyam Business Opportunity");
  const [emailBody, setEmailBody] = useState<string>("<p>Hello,</p><p>We are pleased to share details regarding our registered RFQs. Please check the platform for matching tenders.</p>");

  // Listen for Google OAuth callback message
  useEffect(() => {
    const handleOAuthMsg = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }
      
      if (event.data?.type === "GOOGLE_OAUTH_SUCCESS") {
        const token = event.data.accessToken;
        setGoogleToken(token);
        localStorage.setItem("google_access_token", token);
        
        try {
          const profile = await fetchGoogleUserProfile(token);
          setGoogleEmail(profile.email);
        } catch (e) {
          console.error("Error fetching user profile after auth:", e);
        }
      } else if (event.data?.type === "GOOGLE_OAUTH_FAILURE") {
        console.error("Google OAuth failed:", event.data.error);
        alert(`Google Authentication Failed: ${event.data.error}`);
      }
    };
    
    window.addEventListener("message", handleOAuthMsg);
    return () => window.removeEventListener("message", handleOAuthMsg);
  }, []);

  // Fetch profile when token loaded from localStorage
  useEffect(() => {
    if (googleToken) {
      fetchGoogleUserProfile(googleToken)
        .then((profile) => setGoogleEmail(profile.email))
        .catch(() => {
          setGoogleToken(null);
          localStorage.removeItem("google_access_token");
        });
    }
  }, [googleToken]);


  // Marketplace states
  const [marketFilter, setMarketFilter] = useState<"all" | "products" | "services" | "projects" | "amc">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Modal State for Enquiries/Details
  const [activeModalItem, setActiveModalItem] = useState<{
    type: "product" | "service" | "project" | "amc";
    data: any;
  } | null>(null);
  
  // Enquiry form submission state
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryFormData, setEnquiryFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
    customQuantity: 1,
    siteAccess: "Normal",
    timeline: "Aesthetic ASAP"
  });

  // Client RFQs State (dynamic so users see instant feedback)
  const [rfqs, setRfqs] = useState<RFQ[]>(initialRFQs);
  const [bids, setBids] = useState<Bid[]>(mockBids);
  
  // Custom RFQ Creation Form
  const [newRfq, setNewRfq] = useState({
    title: "",
    type: "Project" as "Project" | "Service" | "Product" | "AMC",
    category: "LPG Pipeline Installation",
    description: "",
    budget: 150000,
    timeline: "15 Days",
    location: "Chennai, TN",
    contactName: "",
    organization: ""
  });
  const [rfqSuccess, setRfqSuccess] = useState(false);
  const [simulatedBiddingRfqId, setSimulatedBiddingRfqId] = useState<string | null>(null);
  const [activeBidProcess, setActiveBidProcess] = useState<string[]>([]);
  const [selectedRfqToView, setSelectedRfqToView] = useState<RFQ | null>(null);

  // Chosen/Awarded Bid state
  const [awardedBidId, setAwardedBidId] = useState<string | null>(null);
  const [chattingBidder, setChattingBidder] = useState<Bid | null>(null);
  const [chats, setChats] = useState<{ sender: "user" | "vendor"; text: string; time: string }[]>([
    { sender: "vendor", text: "Hello! We reviewed your pipeline requirement. Can you provide raw dimensions of your kitchen layouts?", time: "11:30 AM" }
  ]);
  const [newChatText, setNewChatText] = useState("");

  // Vendor Portal State
  const [vendorProfile, setVendorProfile] = useState({
    name: "Apex Tech & Creative Digital",
    city: "Trichy",
    specialties: ["Meta Ads", "CRM Software", "Review Systems"],
    verified: true,
    yearEstablished: 2021,
    projectsCompleted: 64,
    pricingTier: "Standard" as "Budget" | "Standard" | "Premium"
  });
  const [vendorRegistered, setVendorRegistered] = useState(true);
  const [vendorActionSuccess, setVendorActionSuccess] = useState("");
  const [activeLeadToBid, setActiveLeadToBid] = useState<RFQ | null>(null);
  const [customBidPrice, setCustomBidPrice] = useState(100000);
  const [customBidProposal, setCustomBidProposal] = useState("");
  const [customBidTime, setCustomBidTime] = useState(7);

  // Marketing Calculator / ROI Estimator State
  const [metaBudget, setMetaBudget] = useState(15000);
  const [googleBudget, setGoogleBudget] = useState(20000);
  const [whatsappVolume, setWhatsappVolume] = useState(10000);
  const [reviewManagement, setReviewManagement] = useState(true);

  // SOP Builder State
  const [sopSector, setSopSector] = useState<"lpg" | "solar" | "cctv" | "compliance">("lpg");
  const [sopDrafts, setSopDrafts] = useState<boolean[]>(new Array(6).fill(false));

  // Cycle Taglines automatically every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTaglineIdx((prev) => (prev + 1) % taglines.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // RFQ Live Bid Simulation engine
  useEffect(() => {
    if (simulatedBiddingRfqId) {
      // Simulate real-time bids dropping in one by one
      const rfqToSimulate = rfqs.find(r => r.id === simulatedBiddingRfqId);
      if (!rfqToSimulate) return;

      const bidTimers: NodeJS.Timeout[] = [];
      const dummyBidders = [
        { name: "SmartShield Surveillance & Fire", text: "We submitted an optimized technical proposal. Ready to install fire certified kits.", delay: 4000, baseAmount: 0.92 },
        { name: "Kovai Power Systems", text: "Comprehensive design proposal matching your budget perfectly. High efficiency guaranteed.", delay: 8000, baseAmount: 0.97 },
        { name: "Dindigul Gas & Utility Engineers", text: "Approved engineering team ready. We will coordinate local NOC permissions.", delay: 12000, baseAmount: 1.05 }
      ];

      dummyBidders.forEach((bidder, idx) => {
        const timer = setTimeout(() => {
          // create deep bid copy
          const newBid: Bid = {
            id: `sim_bid_${Date.now()}_${idx}`,
            rfqId: simulatedBiddingRfqId,
            vendorName: bidder.name,
            bidAmount: Math.round(rfqToSimulate.budget * bidder.baseAmount),
            estimatedDays: rfqToSimulate.type === "Project" ? 20 - idx * 3 : 5,
            proposalText: bidder.text,
            rating: 4.5 + (idx * 0.2),
            guarantee: "5 Years engineering warranty including AMC coverage"
          };

          setBids(prev => [...prev, newBid]);
          setRfqs(prev => prev.map(r => r.id === simulatedBiddingRfqId ? { ...r, bidsCount: r.bidsCount + 1 } : r));
          
          // Trigger notification popup/status updates
          setActiveBidProcess(prev => [...prev, `${bidder.name} placed a bid of ₹${newBid.bidAmount.toLocaleString()}`]);
          setTimeout(() => {
            setActiveBidProcess(p => p.filter(item => !item.includes(bidder.name)));
          }, 4000);

        }, bidder.delay);
        bidTimers.push(timer);
      });

      return () => {
        bidTimers.forEach(t => clearTimeout(t));
      };
    }
  }, [simulatedBiddingRfqId]);

  // Handle Client Query search filter
  const filteredCatalog = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    // Combine everything into a unified array with type indicators
    const items: Array<{ type: "product" | "service" | "project" | "amc"; core: any }> = [];
    
    if (marketFilter === "all" || marketFilter === "products") {
      mockProducts.forEach(p => items.push({ type: "product", core: p }));
    }
    if (marketFilter === "all" || marketFilter === "services") {
      mockServices.forEach(s => items.push({ type: "service", core: s }));
    }
    if (marketFilter === "all" || marketFilter === "projects") {
      mockProjects.forEach(pr => items.push({ type: "project", core: pr }));
    }
    if (marketFilter === "all" || marketFilter === "amc") {
      mockAMCPackages.forEach(amc => items.push({ type: "amc", core: amc }));
    }

    return items.filter(item => {
      const matchSearch = 
        item.core.name.toLowerCase().includes(query) ||
        (item.core.description && item.core.description.toLowerCase().includes(query)) ||
        (item.core.category && item.core.category.toLowerCase().includes(query));
        
      const matchCategory = selectedCategory === "All Categories" || 
        (item.core.category && item.core.category === selectedCategory) ||
        (item.type === "amc" && selectedCategory === "Asset Protection (AMC)") ||
        (item.type === "project" && selectedCategory === "Project Setup");

      return matchSearch && matchCategory;
    });
  }, [marketFilter, searchQuery, selectedCategory]);

  // Compute stats for metadata ticker
  const stats = {
    totalVendors: 1842,
    activeRFQs: rfqs.filter(r => r.status === "Open").length,
    securedProjectsValue: "₹4.8 Crores",
    criticalDeliveries: "98.7%"
  };

  // SOP template generation depending on selection
  const activeSopTemplate = useMemo(() => {
    switch (sopSector) {
      case "lpg":
        return {
          title: "LPG Commercial Pipeline Installation SOP",
          code: "TM-SOP-LPG-09",
          steps: [
            { label: "Site Inspection & Pressure Plotting", desc: "Map exact structural wall crossings, define manifold room ventilation specs, determine proximity triggers." },
            { label: "Brazing & Fitting Validation", desc: "Utilize seamless phosphorus-deoxidized copper tubes. Execute silver brazing exceeding 650°C." },
            { label: "Dry Nitrogen Decay Testing", desc: "Fill entire structural pipeline with industrial Nitrogen at 1.5x working pressure for 24 hours. Ensure zero drops." },
            { label: "Gas Leak Alarm Positioning", desc: "Deploy digital butane/methane sensor nodes at 30cm off base floors. Link with standard solenoid check valves." },
            { label: "Compliance & Safety Certification", desc: "Output layout designs, inspection test logs, and deliver regulatory green-flag to the kitchen manager." }
          ]
        };
      case "solar":
        return {
          title: "Rooftop Solar EPC Standard Workflow",
          code: "TM-SOP-PV-23",
          steps: [
            { label: "Horizon & Shadow Assessment", desc: "Use 3D mapping software to optimize solar yield. Ensure zero panels are obstructed between 9 AM to 4 PM." },
            { label: "Hot-Dip Galvanized Rigging", desc: "Drill secure non-penetrating rooftop structure mounts, rated to sustain monsoon winds up to 150 km/h." },
            { label: "DC Integration & String Connection", desc: "Group panels into strings matching high-efficiency Maximum Power Point Tracker (MPPT) voltage grids." },
            { label: "Earth Grid Grounding & AC Cabling", desc: "Install 3 separate copper earth pits (AC DB, DC DB, and Lightning Arrestor). Link with high-conduction wires." },
            { label: "CEIG & Net Metering Liaisons", desc: "Lodge grid connectivity papers with state utility board, host inspectors, and commission smart two-way meter." }
          ]
        };
      case "cctv":
        return {
          title: "Industrial Site Surveillance Deployment",
          code: "TM-SOP-SEC-14",
          steps: [
            { label: "Blindspot Audit & Camera Placement", desc: "Identify high-risk access gates, storage facilities, and corridors. Map precise focal ranges." },
            { label: "Structured Cat6 / Fiber Backhaul", desc: "Run shielded core Cat6 cables wrapped in UV-resistant conduits. Avoid parallel high-voltage arrays." },
            { label: "Network Configuration & Bandwidth Sizing", desc: "Create private camera VLANs. Limit H.265 compression bitrate to maintain 4K streams at 15fps safely." },
            { label: "NVR Raid Pool setup", desc: "Configure high-throughput hard drives to run in RAID 5 to maintain zero system downtime on component failures." },
            { label: "External Smart App Linkages", desc: "Securely tunnel remote web dashboards. Setup automated WhatsApp warnings for deep-night motion triggers." }
          ]
        };
      case "compliance":
        return {
          title: "GST, Taxes & Corporate Audit Routine",
          code: "TM-SOP-FIN-01",
          steps: [
            { label: "GSTR-1 Monthly Sales Declaration", desc: "Collate and upload all B2B and B2C sales invoices. Reconcile with digital e-way bills by 11th of each month." },
            { label: "GSTR-2B Input Tax Credit Matching", desc: "Download automated purchasing ledgers. Flag vendors who have not field matching GSTR-1 to prevent cash leaks." },
            { label: "GSTR-3B Computation & Settlement", desc: "Offset gross tax liabilities with matched eligible input tax credits. Deposit net liabilities by 20th." },
            { label: "Quarterly Board Ledger Reconciliations", desc: "Verify banking feed entries against internal Zoho/Tally bookkeeping files. Log physical asset valuations." },
            { label: "Annual MCA filings and Form ITR-6", desc: "Liaise with the registered Chartered Accountant to sign auditing papers and register current annual filings with MCA gates." }
          ]
        };
    }
  }, [sopSector]);

  // Marketing Calculator formula fields
  const calculatedMarketingOutput = useMemo(() => {
    const totalBudget = metaBudget + googleBudget;
    
    // Estimated CPM and CPC rates (realistic B2B / B2C blended rates in India)
    const metaClicks = Math.floor((metaBudget * 0.85) / 14); // ₹14 avg CPC
    const googleClicks = Math.floor((googleBudget * 0.9) / 28); // ₹28 avg Google search CPC
    const whatsappB2BLeads = Math.floor(whatsappVolume * 0.05); // 5% reply rate
    
    const metaImp = Math.floor(metaBudget * 60); // 60 impressions per Rupee
    const googleImp = Math.floor(googleBudget * 35); // 35 impressions per Rupee
    
    const combinedImpressions = metaImp + googleImp;
    const combinedClicks = metaClicks + googleClicks;
    
    // Avg conversion to high quality qualified lead (8% on clicks)
    const webLeads = Math.floor(combinedClicks * 0.09);
    const totalQualifiedLeads = webLeads + Math.floor(whatsappB2BLeads * 0.3);
    
    // Avg sales closure rate (15% for platform checked leads)
    const projectedDeals = Math.floor(totalQualifiedLeads * 0.16);
    // Avg ticket size for platform services (₹45,000 blended product/service/project)
    const averageOrderValue = 45000;
    const estimatedNewRevenue = projectedDeals * averageOrderValue;
    const returnOnInvestment = totalBudget > 0 ? (estimatedNewRevenue / totalBudget).toFixed(1) : "0.0";

    return {
      impressions: combinedImpressions,
      clicks: combinedClicks,
      leads: totalQualifiedLeads,
      deals: projectedDeals,
      revenue: estimatedNewRevenue,
      roi: returnOnInvestment,
      cpl: totalQualifiedLeads > 0 ? Math.round(totalBudget / totalQualifiedLeads) : 0
    };
  }, [metaBudget, googleBudget, whatsappVolume]);

  const handlePostRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRfq.title || !newRfq.contactName) {
      alert("Please fill in the project title and contact name.");
      return;
    }

    const createdRfq: RFQ = {
      id: `rfq_${Date.now()}`,
      title: newRfq.title,
      type: newRfq.type,
      category: newRfq.category,
      description: newRfq.description || `Custom project requirement for ${newRfq.category}`,
      budget: Number(newRfq.budget),
      timeline: newRfq.timeline,
      location: newRfq.location,
      contactName: newRfq.contactName,
      organization: newRfq.organization || "Independent Entity",
      status: "Open",
      timestamp: new Date().toISOString(),
      bidsCount: 0
    };

    // Prepend to active RFQ pool
    setRfqs(prev => [createdRfq, ...prev]);
    setRfqSuccess(true);
    setSimulatedBiddingRfqId(createdRfq.id);
    setSelectedRfqToView(createdRfq);

    // reset fields
    setNewRfq({
      title: "",
      type: "Project",
      category: "LPG Pipeline Installation",
      description: "",
      budget: 200000,
      timeline: "15 Days",
      location: "Chennai, TN",
      contactName: "",
      organization: ""
    });

    // switch to show the requirement details
    setClientTab("post-rfq");
  };

  const handleApplyVendorProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setVendorRegistered(true);
    setVendorActionSuccess("Vendor registration updated successfully! You are now live on the index.");
    setTimeout(() => setVendorActionSuccess(""), 4000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    
    const userMsg = {
      sender: "user" as const,
      text: newChatText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChats(prev => [...prev, userMsg]);
    setNewChatText("");

    // Simulate vendor immediate clever reply
    setTimeout(() => {
      const vendorMsg = {
        sender: "vendor" as const,
        text: `Understood! Let us lock in these specs. We will submit a revised contract proposal. The 1.5% platform commission will be locked under Theervu Escrow.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => [...prev, vendorMsg]);
    }, 2000);
  };

  const handleSearchCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-slate-950 overflow-x-hidden">
      
      {/* EDITORIAL TOP STRIP */}
      <div className="h-2 bg-slate-900 w-full"></div>

      {/* TOP META-TICKER COUPLING */}
      <div className="bg-white border-b-2 border-slate-900 text-xs py-2.5 px-4 sticky top-0 z-40 shadow-sm text-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-2 text-slate-700">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-600 animate-ping"></span>
            <span className="font-serif font-black italic tracking-tight text-slate-900">GAZETTE STREAM:</span>
            <span className="text-amber-800 font-semibold font-mono">{stats.totalVendors}+ Verified Vendors</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-800 font-semibold font-mono">{stats.activeRFQs} Active Solicitations</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-sans">Ecosystem Volume: <span className="font-mono font-bold text-slate-900">{stats.securedProjectsValue}</span></span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="hidden lg:flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>SLA Target: 24h Response Routine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[9px] text-amber-900 font-bold tracking-wider font-mono uppercase">B2B + B2C Connect</span>
              <span className="text-slate-700 text-[11px] font-mono font-medium">User: {localStorage.getItem("tm_email") || "valamstrategies@gmail.com"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BRAND HEADER & TAGLINE DOCK */}
      <header className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="bg-[#fafbf9] border-2 border-slate-900 p-6 md:p-8 shadow-sm relative overflow-hidden rounded-md">
          <div className="absolute top-0 right-0 p-3 bg-slate-900 text-white font-bold tracking-widest text-[9px] uppercase font-mono">
            TAMIL: தீர்வு மையம்
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-amber-50 border border-slate-300 text-amber-900 rounded">
                  <Layers className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none text-slate-900 flex items-baseline gap-2">
                    THEERVU MAIYAM
                    <span className="font-serif italic font-light ml-1 text-amber-800 text-lg md:text-2xl whitespace-nowrap">
                      தீர்வு மையம்
                    </span>
                  </h1>
                  <p className="text-xs uppercase tracking-widest mt-1.5 font-semibold text-amber-800 font-serif italic">One Platform. Every Business Solution.</p>
                </div>
              </div>
              
              {/* Dynamic Tagline Showcase layout */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-700 font-serif">
                <span className="text-amber-800 font-bold uppercase tracking-wider text-[10px]">Ecosystem Vision:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeTaglineIdx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="bg-stone-100 text-slate-900 border border-stone-300 px-3 py-1 rounded italic font-medium inline-block shadow-sm"
                  >
                     &ldquo;{taglines[activeTaglineIdx]}&rdquo;
                  </motion.span>
                </AnimatePresence>
                <button 
                  onClick={() => setActiveTaglineIdx((prev) => (prev + 1) % taglines.length)}
                  className="p-1 hover:bg-stone-200 rounded text-slate-500 hover:text-amber-800 transition" 
                  title="Switch slogan"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                </button>
              </div>
            </div>

            {/* SUITE DOCK ROTATOR */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <div className="bg-stone-200 p-1 rounded border border-slate-300 flex justify-between w-full md:w-64">
                <button
                  type="button"
                  id="client-role-tab"
                  onClick={() => setUserRole("client")}
                  className={`flex-1 py-1.5 px-3 text-xs uppercase font-bold tracking-wider rounded transition-all ${
                    userRole === "client"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-stone-300"
                  }`}
                >
                  Client Suite
                </button>
                <button
                  type="button"
                  id="vendor-role-tab"
                  onClick={() => setUserRole("vendor")}
                  className={`flex-1 py-1.5 px-3 text-xs uppercase font-bold tracking-wider rounded transition-all ${
                    userRole === "vendor"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-stone-300"
                  }`}
                >
                  Vendor Hub
                </button>
              </div>
              <p className="text-[11px] text-right font-serif italic text-slate-600">
                {userRole === "client" 
                  ? "Explore directory, launch campaigns & post projects" 
                  : "Submit bids, receive targeted leads & map services"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ACTIVE BIDS STREAM ALERTS (Framer Motion popup notifier) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {activeBidProcess.map((alertText, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="p-3 bg-indigo-950 border border-amber-500/40 text-xs rounded-xl shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-100 font-medium select-none">{alertText}</span>
          </motion.div>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-20">
        
        {/* ==================================== */}
        {/*           CLIENT INTERFACES          */}
        {/* ==================================== */}
        {userRole === "client" && (
          <div>
            {/* SUB HEADER TABS FOR CLIENT SUITE */}
            <div className="flex flex-wrap items-center justify-between border-b-2 border-slate-900 pb-3 mb-6 gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setClientTab("marketplace")}
                  className={`px-4 py-2 text-xs uppercase font-bold tracking-wider border-2 transition-all duration-200 flex items-center gap-2 rounded ${
                    clientTab === "marketplace"
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:text-slate-950"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Connect Marketplace
                </button>
                <button
                  type="button"
                  onClick={() => setClientTab("marketing-estimator")}
                  className={`px-4 py-2 text-xs uppercase font-bold tracking-wider border-2 transition-all duration-200 flex items-center gap-2 rounded ${
                    clientTab === "marketing-estimator"
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:text-slate-950"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Growth Marketing Desk
                </button>
                <button
                  type="button"
                  onClick={() => setClientTab("sop-builder")}
                  className={`px-4 py-2 text-xs uppercase font-bold tracking-wider border-2 transition-all duration-200 flex items-center gap-2 rounded ${
                    clientTab === "sop-builder"
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:text-slate-950"
                  }`}
                >
                  <Settings2 className="w-4 h-4 text-amber-700" />
                  SOP Workflows Builder
                </button>
                <button
                  type="button"
                  onClick={() => setClientTab("post-rfq")}
                  className={`px-4 py-2 text-xs uppercase font-bold tracking-wider border-2 transition-all duration-200 flex items-center gap-2 rounded ${
                    clientTab === "post-rfq"
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:text-slate-950"
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-700" />
                  RFQ Consult Desk
                  {rfqs.length > initialRFQs.length && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setClientTab("workspace-sync")}
                  className={`px-4 py-2 text-xs uppercase font-bold tracking-wider border-2 transition-all duration-200 flex items-center gap-2 rounded ${
                    clientTab === "workspace-sync"
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:text-slate-950"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-850" />
                  Google Workspace Sync
                </button>
              </div>

              <div className="flex items-center gap-2 bg-white border-2 border-slate-900 px-3 py-1.5 rounded text-xs text-slate-800 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span className="font-serif italic font-bold">Theervu Escrow Guarantee:</span>
                <span className="font-bold text-slate-900">Decentralized Quality System</span>
              </div>
            </div>

            {/* TAB CONTAINER 1: CONNECT MARKETPLACE */}
            {clientTab === "marketplace" && (
              <div>
                
                {/* ADVANCED SECTORS DIRECTORY SLIDER */}
                <div className="bg-white rounded border-2 border-slate-900 p-6 mb-8 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-700" />
                        Theervu Connect Catalog
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Browse premium enterprise products, commercial contractors, business compliance & AMC protection plans under one roof.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => setMarketFilter("all")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${
                          marketFilter === "all" ? "bg-slate-900 text-white" : "bg-stone-100 border border-stone-300 text-slate-700 hover:bg-stone-200"
                        }`}
                      >
                        All Ecosystem
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarketFilter("products")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${
                          marketFilter === "products" ? "bg-slate-900 text-white" : "bg-stone-100 border border-stone-300 text-slate-700 hover:bg-stone-200"
                        }`}
                      >
                        Product Sales
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarketFilter("services")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${
                          marketFilter === "services" ? "bg-slate-900 text-white" : "bg-stone-100 border border-stone-300 text-slate-700 hover:bg-stone-200"
                        }`}
                      >
                        Services
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarketFilter("projects")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${
                          marketFilter === "projects" ? "bg-slate-900 text-white" : "bg-stone-100 border border-stone-300 text-slate-700 hover:bg-stone-200"
                        }`}
                      >
                        Epic Projects
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarketFilter("amc")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${
                          marketFilter === "amc" ? "bg-slate-900 text-white" : "bg-stone-100 border border-stone-300 text-slate-700 hover:bg-stone-200"
                        }`}
                      >
                        AMC Safeguard
                      </button>
                    </div>
                  </div>

                  {/* Search and Category Quick Pill filtering */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search products or services (try LPG, solar, Meta ads, camera)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-50 border border-slate-300 rounded py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap shrink-0 ml-2">Quick categories:</span>
                      {[
                        "All Categories", "Solar", "CCTV", "Gas", "Industrial", "Finance & Tax", "Marketing", "Business Services", "Project Setup", "Asset Protection (AMC)"
                      ].map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearchCategorySelect(cat)}
                          className={`px-3 py-1 text-xs rounded border shrink-0 transition ${
                            selectedCategory === cat 
                              ? "bg-amber-100 text-amber-900 border-2 border-amber-800 font-bold" 
                              : "bg-white text-slate-700 border border-slate-200 hover:text-slate-950 hover:border-slate-800"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* THE UNIFIED GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCatalog.length > 0 ? (
                    filteredCatalog.map((item, idx) => {
                      const badgeColors = {
                        product: "bg-emerald-50 text-emerald-900 border-emerald-300",
                        service: "bg-stone-100 text-stone-900 border-stone-300",
                        project: "bg-amber-50 text-amber-900 border-amber-300",
                        amc: "bg-sky-50 text-sky-900 border-sky-300",
                      };

                      return (
                        <div
                          key={`${item.type}_${item.core.id}`}
                          className="bg-white border-2 border-slate-900 rounded p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between group h-full relative overflow-hidden"
                        >
                          <div>
                            {/* Card Image header for products, visual indicator for others */}
                            {item.type === "product" && item.core.image && (
                              <div className="w-full h-36 rounded overflow-hidden mb-4 relative bg-stone-100 border border-stone-200">
                                <img
                                  src={item.core.image}
                                  alt={item.core.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-95 group-hover:opacity-100"
                                />
                                <div className="absolute top-2 right-2 bg-slate-900 text-white px-2.5 py-0.5 rounded text-[9px] font-mono border border-slate-700">
                                  In stock: {item.core.stock}
                                </div>
                              </div>
                            )}

                            {item.type !== "product" && (
                              <div className="w-full h-24 rounded bg-stone-100 border border-stone-200 mb-4 p-4 flex justify-between items-start">
                                <div className="p-2.5 bg-white rounded text-slate-850 border border-stone-300 shadow-sm">
                                  {item.type === "service" && <Briefcase className="w-5 h-5 text-slate-900" />}
                                  {item.type === "project" && <Wrench className="w-5 h-5 text-amber-700" />}
                                  {item.type === "amc" && <ShieldCheck className="w-5 h-5 text-slate-900" />}
                                </div>
                                <span className="text-[10px] text-slate-700 font-mono tracking-wider bg-white px-2 py-0.5 rounded border border-stone-200">
                                  {item.type === "service" ? item.core.pricing : item.type === "project" ? "TURNKEY CONTRACT" : `${item.core.frequency}`}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between items-center mb-2.5">
                              <span className={`text-[10px] uppercase tracking-wider font-bold border px-2 py-0.5 rounded ${badgeColors[item.type]}`}>
                                {item.type} • {item.core.category || item.core.industry || "General"}
                              </span>
                              {item.core.rating && (
                                <div className="flex items-center gap-1 text-xs text-amber-700 font-bold font-mono">
                                  <Star className="w-3.5 h-3.5 fill-amber-600 stroke-amber-700 text-amber-600" />
                                  <span>{item.core.rating}</span>
                                </div>
                              )}
                            </div>

                            <h3 className="text-sm md:text-base font-serif font-black tracking-tight text-slate-900 group-hover:text-amber-850 transition duration-150 line-clamp-1 mb-2">
                              {item.core.name}
                            </h3>

                            <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                              {item.core.description}
                            </p>

                            {/* Additional granular details for list */}
                            {item.type === "product" && (
                              <div className="text-xs text-slate-900 font-black font-mono py-1 rounded">
                                Retail: ₹{item.core.price.toLocaleString()} <span className="text-slate-500 font-normal text-[10px] font-sans">{item.core.unit}</span>
                              </div>
                            )}
                            
                            {item.type === "service" && item.core.deliverables && (
                              <div className="text-[11px] text-slate-700 bg-stone-100 p-2.5 rounded border border-stone-200">
                                <p className="font-bold text-slate-900 mb-1">Key Deliverable:</p>
                                <p className="line-clamp-1 italic text-slate-600">• {item.core.deliverables[0]}</p>
                              </div>
                            )}

                            {item.type === "project" && (
                              <div className="text-xs text-slate-700 font-mono bg-stone-100 p-2 rounded border border-stone-200">
                                <span className="text-[9px] text-slate-500 block uppercase font-sans font-bold">Standard Value Scope:</span>
                                {item.core.averageScope}
                              </div>
                            )}

                            {item.type === "amc" && (
                              <div className="text-xs text-slate-900 font-bold font-mono">
                                Coverage Cost: ₹{item.core.pricePerYear.toLocaleString()} / year
                              </div>
                            )}
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500">Code: TM-{item.type.substring(0, 2).toUpperCase()}-{item.core.id}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEnquirySuccess(false);
                                setEnquiryFormData({
                                  ...enquiryFormData,
                                  notes: `Interested in purchasing/booking: ${item.core.name}. Please provide delivery estimates and matching contractor details.`
                                });
                                setActiveModalItem({ type: item.type, data: item.core });
                              }}
                              className="text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-amber-700 hover:text-white text-white px-3.5 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer"
                            >
                              Connect
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center py-12 bg-white border-2 border-slate-900 rounded p-8">
                      <AlertCircle className="w-12 h-12 text-amber-700 mx-auto mb-3" />
                      <h4 className="font-bold text-slate-900 mb-1">No ecosystem solutions match your filters</h4>
                      <p className="text-xs text-slate-600">Try checking spelling, selecting &ldquo;All Ecosystem&rdquo;, or typing a different keyword.</p>
                      <button 
                        onClick={() => { setMarketFilter("all"); setSearchQuery(""); setSelectedCategory("All Categories"); }}
                        className="mt-4 px-4 py-2 bg-slate-900 hover:bg-amber-800 text-xs font-bold uppercase text-white rounded"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* THEERVU PLATFORM ADVANTAGES BENTO */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 border-2 border-slate-900 rounded shadow-sm">
                    <div className="w-10 h-10 rounded bg-stone-100 text-slate-850 flex items-center justify-center mb-4 border border-stone-200">
                      <ShieldCheck className="w-5 h-5 text-amber-800" />
                    </div>
                    <h4 className="font-serif font-black text-slate-900 text-sm mb-2">Escrow Protected Payments</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Funds for large LPG pipelines, solar installations, or IT developments are kept safely under our escrow system. Payouts are triggered to vendors only after milestone sign-offs.
                    </p>
                  </div>

                  <div className="bg-white p-6 border-2 border-slate-900 rounded shadow-sm">
                    <div className="w-10 h-10 rounded bg-stone-100 text-stone-900 flex items-center justify-center mb-4 border border-stone-200">
                      <Building2 className="w-5 h-5 text-amber-800" />
                    </div>
                    <h4 className="font-serif font-black text-slate-900 text-sm mb-2">Quality & SOP Guard</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Our platform ensures every registered vendor operates under official Standard Operating Procedures (SOPs). We conduct surprise physical inspections on critical works.
                    </p>
                  </div>

                  <div className="bg-white p-6 border-2 border-slate-900 rounded shadow-sm">
                    <div className="w-10 h-10 rounded bg-stone-100 text-stone-900 flex items-center justify-center mb-4 border border-stone-200">
                      <Users2 className="w-5 h-5 text-amber-800" />
                    </div>
                    <h4 className="font-serif font-black text-slate-900 text-sm mb-2">Dual Support Liaison</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Every transaction includes a dedicated Theervu Advisor who assists the buyer and tracks construction milestones with the vendor. No communication breakdowns.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTAINER 2: MARKETING ROI ESTIMATOR */}
            {clientTab === "marketing-estimator" && (
              <div className="bg-white border-2 border-slate-900 rounded p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-stone-100 text-slate-900 rounded border border-slate-350 shadow-sm">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-slate-900">Theervu Digital Campaign ROI Estimator</h2>
                    <p className="text-xs text-slate-600 mt-0.5 font-serif italic">Simulate actual customer acquisition metrics across Meta, Google Search, and WhatsApp Marketing workflows.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Inputs sliders Card */}
                  <div className="lg:col-span-5 bg-[#fafbf9] p-6 rounded border border-stone-300 flex flex-col gap-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1 border-b border-stone-200 pb-2">Configure Ad Spend</h3>
                    
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5">
                        <span>Meta Channels (Instagram/Facebook Ads)</span>
                        <span className="text-amber-800 font-mono">₹{metaBudget.toLocaleString()} / mo</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="100000"
                        step="5000"
                        value={metaBudget}
                        onChange={(e) => setMetaBudget(Number(e.target.value))}
                        className="w-full accent-slate-900 cursor-pointer h-1.5 bg-stone-200 rounded outline-none"
                      />
                      <span className="text-[10px] text-slate-600 font-serif italic block mt-1">Good for CCTV installations, rooftop solar deals, and general retail leads.</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5">
                        <span>Google Search & Local Maps Ads</span>
                        <span className="text-amber-800 font-mono">₹{googleBudget.toLocaleString()} / mo</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="100000"
                        step="5000"
                        value={googleBudget}
                        onChange={(e) => setGoogleBudget(Number(e.target.value))}
                        className="w-full accent-slate-900 cursor-pointer h-1.5 bg-stone-200 rounded outline-none"
                      />
                      <span className="text-[10px] text-slate-600 font-serif italic block mt-1">Highly optimized for incoming pipeline projects, emergency AMCs and high-intent local buyers.</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5">
                        <span>WhatsApp Automation Volume</span>
                        <span className="text-amber-800 font-mono">{whatsappVolume.toLocaleString()} contacts</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={whatsappVolume}
                        onChange={(e) => setWhatsappVolume(Number(e.target.value))}
                        className="w-full accent-slate-900 cursor-pointer h-1.5 bg-stone-200 rounded outline-none"
                      />
                      <span className="text-[10px] text-slate-600 font-serif italic block mt-1">Automated notification broadcasts to local contractor database or regional trade units.</span>
                    </div>

                    <div className="pt-2 bg-white p-3.5 rounded border border-stone-200 flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-xs font-bold text-slate-850 block">Review SEO Booster package</span>
                        <span className="text-[10px] text-slate-500">Generates 5-star Google reviews via automated WhatsApp feedback</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={reviewManagement}
                        onChange={(e) => setReviewManagement(e.target.checked)}
                        className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 bg-stone-50 border-stone-300 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Scientific outputs dashboard */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-stone-100 border border-stone-200 rounded p-6 shadow-xs">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-amber-850 mb-1 font-mono">PROGNOSED ECOSYSTEM REACH</p>
                      <h3 className="text-lg font-serif font-black text-slate-900 mb-4">Calculated Business Reach Profile</h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded border border-stone-200 shadow-sm">
                          <span className="text-[10px] text-slate-600 block mb-0.5">Ad Impressions</span>
                          <span className="text-lg font-black text-slate-900 font-mono">
                            {calculatedMarketingOutput.impressions.toLocaleString()}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded border border-stone-200 shadow-sm">
                          <span className="text-[10px] text-slate-600 block mb-0.5">High Intent Clicks</span>
                          <span className="text-lg font-black text-slate-900 font-mono">
                            {calculatedMarketingOutput.clicks.toLocaleString()}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded border border-stone-200 shadow-sm">
                          <span className="text-[10px] text-slate-600 block mb-0.5">Qualified Leads</span>
                          <span className="text-lg font-black text-amber-900 font-mono">
                            {calculatedMarketingOutput.leads}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded border border-stone-200 shadow-sm">
                          <span className="text-[10px] text-slate-600 block mb-0.5">Sales Conversions</span>
                          <span className="text-lg font-black text-slate-900 font-mono">
                            {calculatedMarketingOutput.deals}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="bg-white p-4 border-2 border-slate-900 rounded text-center shadow-sm">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Total Digital Budget</span>
                        <span className="text-xl font-black text-slate-900 font-mono">₹{(metaBudget + googleBudget).toLocaleString()}</span>
                        <span className="text-[9px] text-slate-500 block mt-1">Recurrent monthly billing cycle</span>
                      </div>

                      <div className="bg-white p-4 border-2 border-slate-900 rounded text-center shadow-sm">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Estimated Cost / Lead</span>
                        <span className="text-xl font-black text-amber-800 font-mono">₹{calculatedMarketingOutput.cpl}</span>
                        <span className="text-[9px] text-slate-500 block mt-1">Highly competitive regional range</span>
                      </div>

                      <div className="bg-white p-4 border-2 border-slate-900 rounded text-center shadow-sm">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Expected ROI Factor</span>
                        <span className="text-xl font-black text-slate-900 font-mono">{calculatedMarketingOutput.roi}x</span>
                        <span className="text-[9px] text-slate-500 block mt-1">Ecosystem sales revenue multiple</span>
                      </div>

                    </div>

                    <div className="bg-[#fafbf9] p-5 rounded border border-stone-300 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-amber-800" />
                        Included in Theervu Digital Campaign Management
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                          Ad design setups (4 high-intent creatives)
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                          Google Map search keyword indexing setup
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                          Dedicated tracking pixel setup & active loop
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                          Monthly lead audit & contractor matching support
                        </li>
                      </ul>
                      <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <span className="text-[10px] italic text-slate-500 font-serif">*Values computed based on local regional cost and CPC click matrices.</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEnquirySuccess(false);
                            setEnquiryFormData({
                              ...enquiryFormData,
                              notes: `Requested Growth Marketing Package Consultation. Meta Campaign Budget Target: ₹${metaBudget}/mo, Google Target: ₹${googleBudget}/mo.`
                            });
                            setActiveModalItem({
                              type: "service",
                              data: {
                                name: "Full Growth Marketing Strategy Session",
                                category: "Marketing",
                                description: `Unified Meta and Google Ads management including optimized ROI setups of ${calculatedMarketingOutput.roi}x forecasting.`,
                                pricing: `Custom strategy based on ₹${(metaBudget + googleBudget).toLocaleString()} target spend.`
                              }
                            });
                          }}
                          className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-amber-850 transition cursor-pointer shadow-sm"
                        >
                          Book Campaign Launch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTAINER 3: SOP AUTOMATION WORKFLOWS BUILDER */}
            {clientTab === "sop-builder" && (
              <div className="bg-white border-2 border-slate-900 rounded p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b-2 border-slate-900 pb-5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif font-black text-slate-900 flex items-center gap-2">
                      <Settings2 className="w-6 h-6 text-amber-850" />
                      Theervu Ecosystem SOP Builder
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 font-serif italic">
                      Choose an industry sector. Our platform automatically maps standard, legally compliant procedural milestones.
                    </p>
                  </div>

                  <div className="flex bg-stone-200 p-1 rounded border border-slate-300">
                    <button
                      type="button"
                      onClick={() => { setSopSector("lpg"); setSopDrafts(new Array(6).fill(false)); }}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${
                        sopSector === "lpg" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      LPG Pipeline
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSopSector("solar"); setSopDrafts(new Array(6).fill(false)); }}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${
                        sopSector === "solar" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      Solar PV Systems
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSopSector("cctv"); setSopDrafts(new Array(6).fill(false)); }}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${
                        sopSector === "cctv" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      CCTV Grids
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSopSector("compliance"); setSopDrafts(new Array(6).fill(false)); }}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${
                        sopSector === "compliance" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      Accounting & Tax
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Steps mapping visualization column */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-stone-100 py-2.5 px-4 rounded border border-stone-200 shadow-sm">
                      <span className="text-xs text-slate-700 font-mono">Current SOP Blueprint: <span className="text-amber-900 font-bold">{activeSopTemplate.code}</span></span>
                      <span className="text-[9px] bg-slate-950 text-white px-2 py-0.5 rounded font-mono uppercase tracking-widest">STANDARD COMPLIANCE LOCK</span>
                    </div>

                    <div className="space-y-3">
                      {activeSopTemplate.steps.map((step, idx) => (
                        <div
                          key={idx}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const updated = [...sopDrafts];
                            updated[idx] = !updated[idx];
                            setSopDrafts(updated);
                          }}
                          className={`p-4 rounded border transition-all cursor-pointer select-none text-left ${
                            sopDrafts[idx]
                              ? "bg-amber-50/55 border-2 border-slate-900 shadow-sm"
                              : "bg-white border border-stone-200 hover:border-slate-800"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                              sopDrafts[idx] ? "bg-slate-900 text-white" : "bg-stone-100 border border-stone-300 text-slate-600"
                            }`}>
                              0{idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{step.label}</h4>
                                {sopDrafts[idx] && <span className="text-[9px] bg-emerald-50 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Activated Milestone</span>}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SOP export block */}
                  <div className="lg:col-span-5 bg-[#fafbf9] p-6 rounded border border-stone-300 flex flex-col justify-between shadow-xs">
                    <div>
                      <span className="inline-block bg-slate-900 text-white px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest mb-3">
                        Theervu Maiyam verified blueprint
                      </span>
                      <h3 className="text-lg font-serif font-black text-slate-900 mb-2">{activeSopTemplate.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4 font-serif">
                        All vendors claiming job orders in this category on Theervu platform are bound to execute tasks strictly adhering to this blueprint. This standard avoids substandard brazing, poor network buffer configurations, or incorrect tax classification issues.
                      </p>

                      <div className="bg-stone-100 p-4 rounded border border-stone-200 space-y-3 mb-4 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Contractor Requirements:</h4>
                        <div className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle className="w-4 h-4 text-amber-850 shrink-0 mt-0.5" />
                          <span className="font-serif">Strict material auditing logs verified by supervisor prior to mounting.</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle className="w-4 h-4 text-amber-850 shrink-0 mt-0.5" />
                          <span className="font-serif">Mandatory upload of physical pressure decay chart or digital config files.</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle className="w-4 h-4 text-amber-850 shrink-0 mt-0.5" />
                          <span className="font-serif">Commissioning of safety release mechanisms with timestamped records.</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-200 gap-2 flex flex-col">
                      <button
                        type="button"
                        onClick={() => {
                          const logMsg = `SUCCESS: Exported professional PDF of ${activeSopTemplate.code} to storage logs.`;
                          setActiveBidProcess((prev) => [...prev, logMsg]);
                        }}
                        className="w-full bg-stone-100 border border-slate-400 hover:bg-stone-200 text-slate-800 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF Blueprint SOP
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setClientTab("post-rfq");
                          setNewRfq(prev => ({
                            ...prev,
                            category: sopSector === "lpg" ? "LPG Pipeline Installation" : sopSector === "solar" ? "Solar Power Installation" : sopSector === "cctv" ? "CCTV Installation" : "Company Registration",
                            description: `Project installation request fully configured adhering to Standard Operating Procedure validation protocol template ${activeSopTemplate.code}.`
                          }));
                        }}
                        className="w-full bg-slate-900 text-white font-bold uppercase tracking-wider py-2.5 rounded hover:bg-amber-850 transition cursor-pointer"
                      >
                        Launch Tenders matching this SOP
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTAINER 4: CLIENT REQUESTS / BID CONSULTING (RFQ SYSTEM) */}
            {clientTab === "post-rfq" && (
              <div className="space-y-8">
                
                {/* DOCK COLUMN FOR POSTING AND VIEWING ACTIVATION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Create RFP Form Card */}
                  <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="w-5 h-5 text-amber-500" />
                      <h3 className="text-base font-bold text-white">Create Customized RFQ / Solution Requirement</h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-6">
                      Instantly broadcast your specific product scope, AMC, or projects to verified vendors. We coordinate the matching bids and escrow contracts.
                    </p>

                    {rfqSuccess && (
                      <div className="bg-emerald-950/60 border border-emerald-500/30 p-3.5 rounded-xl mb-6 text-xs text-emerald-300 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <div>
                          <p className="font-bold">Solicitation Submitted Successfully!</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            The platform is broadcasting this to matched contractors in Tamil Nadu. We simulate incoming response bids within 10-15 seconds.
                          </p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handlePostRfq} className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name / Requirement Title</label>
                        <input
                          type="text"
                          placeholder="e.g., install 20 smart CCTV cameras for commercial warehouse"
                          value={newRfq.title}
                          onChange={(e) => setNewRfq({ ...newRfq, title: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Category Type</label>
                          <select
                            value={newRfq.type}
                            onChange={(e) => setNewRfq({ ...newRfq, type: e.target.value as any })}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                          >
                            <option value="Project">Turnkey Project</option>
                            <option value="Service">Professional Service</option>
                            <option value="Product">Bulk Product Buy</option>
                            <option value="AMC">Annual Maintenance (AMC)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Target Sector</label>
                          <select
                            value={newRfq.category}
                            onChange={(e) => setNewRfq({ ...newRfq, category: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                          >
                            <option value="LPG Pipeline Installation">LPG Pipeline Works</option>
                            <option value="Solar Power Installation">Solar PV Power Setup</option>
                            <option value="CCTV Installation">CCTV Surveillance Grid</option>
                            <option value="Company Registration">Registration & Taxation</option>
                            <option value="Digital Growth Campaign">Marketing & Meta Leadgen</option>
                            <option value="Electrical DB Panel Wiring">Electrical Board wiring</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Target Budget (INR)</label>
                          <input
                            type="number"
                            value={newRfq.budget}
                            onChange={(e) => setNewRfq({ ...newRfq, budget: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Required Timeline</label>
                          <input
                            type="text"
                            placeholder="e.g. 15 Days, Immediate"
                            value={newRfq.timeline}
                            onChange={(e) => setNewRfq({ ...newRfq, timeline: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Requirement Specifications (Brief description)</label>
                        <textarea
                          rows={3}
                          placeholder="List any specifications: dimensions, certifications of materials, brand preferences..."
                          value={newRfq.description}
                          onChange={(e) => setNewRfq({ ...newRfq, description: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30 resize-none"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Person Name</label>
                          <input
                            type="text"
                            placeholder="e.g., M. Ramachandran"
                            value={newRfq.contactName}
                            onChange={(e) => setNewRfq({ ...newRfq, contactName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization</label>
                          <input
                            type="text"
                            placeholder="e.g., Ramachandra Textiles"
                            value={newRfq.organization}
                            onChange={(e) => setNewRfq({ ...newRfq, organization: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-4 bg-amber-500 text-slate-950 py-2.5 rounded-xl font-bold hover:bg-amber-400 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Broadcast Tender Solstices
                      </button>
                    </form>
                  </div>

                  {/* Solicitations Dashboard List */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Client Tender Postings</h3>
                        <span className="text-xs text-slate-400 font-mono">Real-time update</span>
                      </div>

                      <div className="space-y-4">
                        {rfqs.map(r => {
                          const isActiveSimulation = simulatedBiddingRfqId === r.id;
                          return (
                            <div
                              key={r.id}
                              className={`p-4 rounded-2xl border transition-all ${
                                selectedRfqToView?.id === r.id
                                  ? "bg-slate-950 border-amber-500/50 shadow-lg shadow-amber-500/5"
                                  : "bg-slate-950/40 border-slate-850 hover:border-slate-800"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] uppercase font-bold text-amber-400 px-1.5 py-0.2 bg-amber-500/10 rounded border border-amber-500/20 font-mono">
                                      {r.type}
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-mono">{r.location}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-100 text-sm mt-1">{r.title}</h4>
                                </div>
                                <span className="text-xs text-slate-300 font-mono font-bold shrink-0">
                                  ₹{r.budget.toLocaleString()}
                                </span>
                              </div>

                              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                                {r.description}
                              </p>

                              <div className="flex justify-between items-center text-xs pt-2.5 border-t border-slate-900">
                                <div className="text-slate-500 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-500" />
                                  <span>{r.contactName} • {r.organization}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isActiveSimulation && (
                                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold uppercase animate-pulse">
                                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                      Live bidding...
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedRfqToView(r);
                                      setAwardedBidId(null);
                                      setChattingBidder(null);
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2 py-1 rounded text-[11px] transition flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Bids ({r.bidsCount})
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tender Bids Detail Workspace inside Client Lobby */}
                    {selectedRfqToView && (
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative">
                        <div className="absolute top-4 right-4 text-xs font-mono text-slate-500">
                          ID: {selectedRfqToView.id}
                        </div>
                        
                        <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-2">BIDS EVALUATION DESK</h4>
                        <h3 className="text-base font-bold text-white mb-4">Competitors bidding for &ldquo;{selectedRfqToView.title}&rdquo;</h3>

                        {bids.filter(b => b.rfqId === selectedRfqToView.id).length === 0 ? (
                          <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-850 p-6">
                            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
                            <h4 className="text-xs font-semibold text-slate-200">Waiting for Verified Contractors to place quotations...</h4>
                            <p className="text-[11px] text-slate-500 mt-1">Our matching mechanism has shared details with five qualified operators. Simulated bids drop dynamically.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {bids.filter(b => b.rfqId === selectedRfqToView.id).map(bidObj => {
                              const isAwarded = awardedBidId === bidObj.id;
                              return (
                                <div
                                  key={bidObj.id}
                                  className={`p-4 rounded-2xl border transition-all ${
                                    isAwarded 
                                      ? "bg-slate-950 border-emerald-500/50 shadow-inner" 
                                      : "bg-slate-950/60 border-slate-850"
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-2 mb-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-indigo-300 text-sm">{bidObj.vendorName}</h4>
                                        <div className="flex items-center gap-0.5 text-xs text-amber-400 font-semibold">
                                          <Star className="w-3 h-3 fill-amber-400" />
                                          <span>{bidObj.rating}</span>
                                        </div>
                                      </div>
                                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">SLA response tier • Standard certified</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-sm font-extrabold text-white block">₹{bidObj.bidAmount.toLocaleString()}</span>
                                      <span className="text-[10px] text-emerald-400 font-semibold font-mono block">Delivery: {bidObj.estimatedDays} Days</span>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/40 p-2.5 rounded-lg border border-slate-900 mb-3">
                                    &ldquo;{bidObj.proposalText}&rdquo;
                                  </p>

                                  <div className="flex flex-wrap items-center justify-between text-xs pt-2.5 border-t border-slate-900 gap-2">
                                    <span className="text-[10px] text-slate-400 font-mono">Guarantee check: <span className="text-teal-400 font-semibold">{bidObj.guarantee}</span></span>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setChattingBidder(bidObj);
                                          setChats([
                                            { sender: "vendor", text: `Greetings! Dindigul Gas & Utility Engineers team is ready. We reviewed your drawings. Do you require copper manifold looping or structural MS manifolds?`, time: "11:30 AM" }
                                          ]);
                                        }}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs transition flex items-center gap-1 cursor-pointer"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                                        Negotiate
                                      </button>
                                      {isAwarded ? (
                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded text-[11px] font-bold tracking-wider flex items-center gap-1 animate-pulse">
                                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                                          CONTRACT AWARDED
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setAwardedBidId(bidObj.id);
                                            alert(`Escrow contract draft formulated! Project & budget (₹${bidObj.bidAmount.toLocaleString()}) locked in escrow. Theervu Maiyam is supervising mobilization of ${bidObj.vendorName}.`);
                                          }}
                                          className="bg-amber-500 text-slate-950 font-bold px-3.5 py-1 rounded text-[11px] hover:bg-amber-400 transition cursor-pointer"
                                        >
                                          Accept & Lock Escrow
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Integrated Negotiate/Chat drawer */}
                        {chattingBidder && (
                          <div className="mt-6 pt-6 border-t border-slate-800 bg-slate-950 p-4 rounded-2xl border border-slate-850">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Chat with Contractor: {chattingBidder.vendorName}
                              </h4>
                              <button
                                onClick={() => setChattingBidder(null)}
                                className="text-xs text-slate-500 hover:text-slate-300"
                              >
                                Minimize Chat
                              </button>
                            </div>

                            <div className="h-44 overflow-y-auto bg-slate-900/60 rounded-xl p-3 space-y-3 mb-3 text-xs flex flex-col justify-end border border-slate-900">
                              {chats.map((ch, cIdx) => (
                                <div
                                  key={cIdx}
                                  className={`max-w-[80%] rounded-xl p-2.5 ${
                                    ch.sender === "user"
                                      ? "bg-amber-500 text-slate-950 font-medium self-end"
                                      : "bg-slate-800 text-slate-200 self-start border border-slate-750"
                                  }`}
                                >
                                  <p>{ch.text}</p>
                                  <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">{ch.time}</span>
                                </div>
                              ))}
                            </div>

                            <form onSubmit={handleSendChat} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Type negotiation instructions, ask for copper certifications..."
                                value={newChatText}
                                onChange={(e) => setNewChatText(e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40"
                              />
                              <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                Send
                                <Play className="w-3 h-3 fill-white text-white" />
                              </button>
                            </form>
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

            {clientTab === "workspace-sync" && (
              <div className="bg-white border-2 border-slate-900 rounded p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b-2 border-slate-900 pb-5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif font-black text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-850" />
                      Google Workspace Sync & Liaison
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 font-serif italic">
                      Directly sync marketplace RFQs with Google Sheets and dispatch/monitor supplier communication via official Gmail APIs.
                    </p>
                  </div>
                  
                  {googleToken && (
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleToken(null);
                        setGoogleEmail(null);
                        localStorage.removeItem("google_access_token");
                      }}
                      className="bg-stone-105 hover:bg-stone-200 text-stone-800 border-2 border-slate-900 py-1.5 px-3 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      Disconnect Google Account
                    </button>
                  )}
                </div>

                {!googleToken ? (
                  <div className="text-center py-12 bg-stone-50 border-2 border-slate-900 rounded p-6 shadow-sm max-w-xl mx-auto my-4">
                    <div className="w-16 h-16 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <FileSpreadsheet className="w-8 h-8 text-emerald-850" />
                    </div>
                    <h3 className="text-lg font-serif font-black text-slate-900 mb-2">Connect Your Google Workspace Account</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                      Link your Google account to authorize Google Sheets generation and real-time Gmail dispatch operations. Your login tokens are kept completely securely in-memory.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
                          if (!clientId) {
                            alert("VITE_GOOGLE_CLIENT_ID environment variable is missing. Please declare it in your AI Studio secrets environment variables panel.");
                            return;
                          }
                          startGoogleOAuthFlow(clientId);
                        }}
                        className="font-bold text-xs uppercase tracking-wider border-2 border-slate-900 bg-white hover:bg-stone-100 px-5 py-3 rounded shadow-sm flex items-center gap-3 cursor-pointer max-w-xs transition"
                      >
                        <svg className="w-4 h-4" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                        <span className="text-slate-900">Sign in with Google</span>
                      </button>

                      {!(import.meta as any).env.VITE_GOOGLE_CLIENT_ID && (
                        <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded text-left text-xs text-amber-900 max-w-sm">
                          <p className="font-bold mb-1 font-serif">🔧 Sandbox Project Configuration:</p>
                          <p className="leading-relaxed">
                            To enable the Google Google Workspace OAuth handshake in this sandbox, please define your <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[10.5px]">VITE_GOOGLE_CLIENT_ID</code> inside your environment secrets.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Logged in Profile Banner */}
                    <div className="bg-stone-50 border-2 border-slate-900 p-4 rounded flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Active Connection:</span>
                        <span className="text-xs font-mono bg-white border border-slate-400 px-2.5 py-0.5 rounded text-amber-900 font-bold">{googleEmail || "Verified Google Session"}</span>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-white font-mono px-3 py-1 rounded uppercase tracking-widest font-bold">Authenticated</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Google Sheets Synchronization */}
                      <div className="space-y-6">
                        <div className="bg-stone-50 p-6 rounded border-2 border-slate-900 shadow-sm">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-3 border-b-2 border-slate-900 pb-2.5">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-850" />
                            Google Sheets Integration
                          </h3>
                          <p className="text-xs text-slate-600 mb-5 font-serif leading-relaxed h-10">
                            Maintain persistent data copies of your RFQs. Export the live app records to Google Sheets or read them directly back into the live catalog feed.
                          </p>

                          {/* Target Spreadsheet Input */}
                          <div className="mb-5">
                            <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">SPREADSHEET ID (FOR RE-SYNCING/READING)</label>
                            <input
                              type="text"
                              value={googleSpreadsheetId}
                              onChange={(e) => setGoogleSpreadsheetId(e.target.value)}
                              placeholder="e.g. 1a2b3c4d5e..."
                              className="w-full bg-white border-2 border-slate-900 rounded px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                            />
                            {googleSpreadsheetUrl && (
                              <a
                                href={googleSpreadsheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-slate-900 font-serif font-black underline block mt-2 hover:text-amber-850 transition duration-150"
                              >
                                🔗 View Created Spreadsheet tab on Google Sheets
                              </a>
                            )}
                          </div>

                          {sheetsSyncMessage && (
                            <div className={`p-3 rounded text-xs mb-5 font-mono ${sheetsSyncMessage.error ? "bg-amber-50 text-amber-900 border-2 border-amber-300" : "bg-emerald-50 text-emerald-900 border-2 border-emerald-300"}`}>
                              {sheetsSyncMessage.text}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={async () => {
                                setSheetsSyncMessage(null);
                                try {
                                  setSheetsSyncMessage({ text: "Creating spreadsheet on Google Drive...", error: false });
                                  const sheetData = await createGoogleSpreadsheet(googleToken, "Theervu Maiyam Marketplace RFQs");
                                  setGoogleSpreadsheetId(sheetData.spreadsheetId);
                                  setGoogleSpreadsheetUrl(sheetData.spreadsheetUrl);

                                  // Post headers
                                  const headers = [["RFQ ID", "Title", "Type", "Category", "Budget (INR)", "Timeline", "Location", "Bids Count", "Status"]];
                                  await writeSpreadsheetRows(googleToken, sheetData.spreadsheetId, "Sheet1!A1", headers);

                                  // Post current RFQs
                                  const rfqRows = rfqs.map((r) => [
                                    r.id,
                                    r.title,
                                    r.type,
                                    r.category,
                                    r.budget,
                                    r.timeline,
                                    r.location,
                                    r.bidsCount,
                                    r.status
                                  ]);
                                  await appendSpreadsheetRows(googleToken, sheetData.spreadsheetId, "Sheet1!A2", rfqRows);

                                  setSheetsSyncMessage({ text: "Successfully created spreadsheet and fully exported active RFQ tables!", error: false });
                                } catch (e: any) {
                                  console.error("Sheets export failed:", e);
                                  setSheetsSyncMessage({ text: `Sheets creation failed: ${e.message}`, error: true });
                                }
                              }}
                              className="bg-slate-900 text-white font-bold uppercase tracking-wider py-3 px-4 rounded text-xs hover:bg-amber-850 transition cursor-pointer"
                            >
                              Create & Export Sheet
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                setSheetsSyncMessage(null);
                                if (!googleSpreadsheetId) {
                                  setSheetsSyncMessage({ text: "Please enter a Spreadsheet ID or create a new sheet first.", error: true });
                                  return;
                                }

                                try {
                                  setSheetsSyncMessage({ text: "Reading Spreadsheet data...", error: false });
                                  const values = await readSpreadsheetRows(googleToken, googleSpreadsheetId, "Sheet1!A2:I");
                                  
                                  if (values.length === 0) {
                                    setSheetsSyncMessage({ text: "No rows found in the designated sheet tab range.", error: true });
                                    return;
                                  }

                                  // Map sheet rows back to RFQs
                                  const importedRfqs: RFQ[] = values.map((row, index) => ({
                                    id: row[0] || `imported_${Date.now()}_${index}`,
                                    title: row[1] || "Untitled Sheet Task",
                                    type: (row[2] || "Project") as any,
                                    category: row[3] || "General Works",
                                    description: `Spreadsheet synchronized task row. Imported from Google Sheet ID ${googleSpreadsheetId}.`,
                                    budget: Number(row[4]) || 50000,
                                    timeline: row[5] || "Variable",
                                    location: row[6] || "Regional",
                                    bidsCount: Number(row[7]) || 0,
                                    status: (row[8] || "Open") as any,
                                    timestamp: new Date().toISOString(),
                                    contactName: "Sheet Importer",
                                    organization: "Sheets API Module"
                                  }));

                                  setRfqs((prev) => {
                                    const existingIds = new Set(prev.map((r) => r.id));
                                    const filteredImported = importedRfqs.filter((r) => !existingIds.has(r.id));
                                    return [...prev, ...filteredImported];
                                  });

                                  setSheetsSyncMessage({ text: `Successfully processed and imported ${importedRfqs.length} workspace entries into active RFQs!`, error: false });
                                } catch (e: any) {
                                  console.error("Sheets import failed:", e);
                                  setSheetsSyncMessage({ text: `Sheets read failed: ${e.message}`, error: true });
                                }
                              }}
                              className="bg-[#fafbf9] border-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider py-3 px-4 rounded text-xs hover:bg-stone-100 transition cursor-pointer"
                            >
                              Sync & Import rows
                            </button>
                          </div>
                        </div>

                        {/* Instruction card */}
                        <div className="bg-stone-50 p-4 rounded border-2 border-dashed border-slate-900 text-slate-700 text-xs text-left leading-relaxed">
                          <h4 className="font-bold text-slate-900 mb-1 font-serif">💡 Continuous Workflow Automation:</h4>
                          <p>
                            Changes made to the generated Google Sheet can be fetched back dynamically into this marketplace. Perfect for coordinating procurement operations across distributed teams!
                          </p>
                        </div>
                      </div>

                      {/* Right: Gmail Liaison */}
                      <div className="space-y-6">
                        <div className="bg-stone-50 p-6 rounded border-2 border-slate-900 shadow-sm">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-3 border-b-2 border-slate-900 pb-2.5">
                            <Mail className="w-5 h-5 text-amber-850" />
                            Gmail Communication Liaison
                          </h3>
                          <p className="text-xs text-slate-600 mb-5 font-serif leading-relaxed h-10">
                            Compose and dispatch email tenders or contract notifications directly from your official Gmail account, and scan for inbound correspondence easily.
                          </p>

                          {/* Tabs for Mailroom */}
                          <div className="grid grid-cols-2 gap-2 mb-4 bg-stone-200/60 p-1 rounded">
                            <button
                              type="button"
                              onClick={() => {
                                setGmailMessages([]);
                                setGmailStatus(null);
                              }}
                              className={`text-[10px] font-bold uppercase tracking-wider py-1.5 text-center rounded transition cursor-pointer ${gmailMessages.length === 0 && !gmailLoading ? "bg-slate-900 text-white" : "text-slate-700 hover:text-slate-900"}`}
                            >
                              Dispatch Campaign
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                setGmailLoading(true);
                                setGmailStatus(null);
                                try {
                                  const msgs = await queryGmailInbox(googleToken, gmailSearchQuery);
                                  setGmailMessages(msgs);
                                } catch (e: any) {
                                  setGmailStatus({ text: `Failed to fetch messages: ${e.message}`, error: true });
                                } finally {
                                  setGmailLoading(false);
                                }
                              }}
                              className={`text-[10px] font-bold uppercase tracking-wider py-1.5 text-center rounded transition cursor-pointer ${gmailMessages.length > 0 || gmailLoading ? "bg-slate-900 text-white" : "text-slate-700 hover:text-slate-900"}`}
                            >
                              Scan Correspondence
                            </button>
                          </div>

                          {gmailStatus && (
                            <div className={`p-2.5 rounded text-xs mb-4 font-mono ${gmailStatus.error ? "bg-amber-50 text-amber-900 border-2 border-amber-300" : "bg-emerald-50 text-emerald-950 border-2 border-emerald-300"}`}>
                              {gmailStatus.text}
                            </div>
                          )}

                          {gmailMessages.length === 0 && !gmailLoading ? (
                            /* Send Email Form */
                            <div className="space-y-4 text-left">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-800 uppercase tracking-widest mb-1.5">Recipient Address (to)</label>
                                <input
                                  type="email"
                                  value={emailTo}
                                  onChange={(e) => setEmailTo(e.target.value)}
                                  placeholder="e.g. buyer@example.com, vendor@example.com"
                                  className="w-full bg-white border-2 border-slate-900 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-slate-800 uppercase tracking-widest mb-1.5">Subject Line</label>
                                <input
                                  type="text"
                                  value={emailSubject}
                                  onChange={(e) => setEmailSubject(e.target.value)}
                                  placeholder="Email Subject"
                                  className="w-full bg-white border-2 border-slate-900 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-slate-800 uppercase tracking-widest mb-1.5">HTML Content Body</label>
                                <textarea
                                  rows={4}
                                  value={emailBody}
                                  onChange={(e) => setEmailBody(e.target.value)}
                                  className="w-full bg-white border-2 border-slate-900 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={async () => {
                                  setGmailStatus(null);
                                  if (!emailTo) {
                                    setGmailStatus({ text: "Recipient email cannot be empty.", error: true });
                                    return;
                                  }

                                  const userConf = window.confirm(`Confirm: Send email via Gmail API to ${emailTo} from your connected mail address?`);
                                  if (!userConf) return;

                                  try {
                                    setGmailStatus({ text: "Sending secure Gmail dispatch...", error: false });
                                    await sendGmailEmail(googleToken, emailTo, emailSubject, emailBody);
                                    setGmailStatus({ text: "Email dispatched successfully via secure Gmail workflow!", error: false });
                                    setEmailTo("");
                                  } catch (e: any) {
                                    console.error("Gmail send failed:", e);
                                    setGmailStatus({ text: `Dispatch failed: ${e.message}`, error: true });
                                  }
                                }}
                                className="w-full bg-slate-900 text-white font-bold uppercase tracking-wider py-3 rounded text-xs hover:bg-amber-850 transition cursor-pointer"
                              >
                                Send Email Dispatch via Gmail
                              </button>
                            </div>
                          ) : (
                            /* Inbox Scan View */
                            <div className="space-y-4 text-left animate-fade-in">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={gmailSearchQuery}
                                  onChange={(e) => setGmailSearchQuery(e.target.value)}
                                  placeholder="Search keyword, e.g. Theervu"
                                  className="flex-1 bg-white border-2 border-slate-900 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setGmailLoading(true);
                                    setGmailStatus(null);
                                    try {
                                      const msgs = await queryGmailInbox(googleToken, gmailSearchQuery);
                                      setGmailMessages(msgs);
                                    } catch (e: any) {
                                      setGmailStatus({ text: `Failed to fetch messages: ${e.message}`, error: true });
                                    } finally {
                                      setGmailLoading(false);
                                    }
                                  }}
                                  className="bg-slate-900 text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-2 border-slate-900 hover:bg-amber-850 transition"
                                >
                                  Search
                                </button>
                              </div>

                              {gmailLoading ? (
                                <div className="text-center py-8 text-xs text-slate-500 font-serif italic">
                                  Parsing inbox messages from Gmail server...
                                </div>
                              ) : (
                                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                                  {gmailMessages.map((msg) => (
                                    <div key={msg.id} className="bg-white border-2 border-slate-900 p-3 rounded text-left shadow-xs transition duration-150 hover:-translate-y-0.5">
                                      <div className="flex justify-between items-start gap-2 mb-1.5">
                                        <span className="text-[10px] uppercase font-bold text-slate-900 block truncate max-w-[150px] font-mono">{msg.sender}</span>
                                        <span className="text-[9px] text-slate-500 font-bold shrink-0">{msg.date}</span>
                                      </div>
                                      <h4 className="text-xs font-serif font-black text-slate-900 mb-1">{msg.subject}</h4>
                                      <p className="text-[10.5px] text-slate-600 line-clamp-2 leading-relaxed font-serif italic bg-stone-50 p-2.5 rounded border border-stone-200">{msg.snippet}</p>
                                    </div>
                                  ))}
                                  {gmailMessages.length === 0 && (
                                    <p className="text-center py-8 text-xs text-slate-500 font-serif italic">
                                      No emails found matching &ldquo;{gmailSearchQuery}&rdquo;.
                                    </p>
                                  )}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setGmailMessages([]);
                                  setGmailStatus(null);
                                }}
                                className="w-full bg-stone-100 hover:bg-stone-200 text-slate-800 border-2 border-slate-900 py-2 rounded text-xs uppercase font-bold tracking-wider transition cursor-pointer"
                              >
                                ← Return to Dispatch Form
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ==================================== */}
        {/*           VENDOR INTERFACES          */}
        {/* ==================================== */}
        {userRole === "vendor" && (
          <div className="space-y-8">
            
            {/* VENDOR QUICK METRICS PANEL */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 text-left">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">TOTAL PORTFOLIO INQUIRIES</span>
                <span className="text-xl font-bold font-mono text-white">48 Matches</span>
                <span className="text-[10px] text-emerald-400 block mt-1">● Based on specialties filters</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 text-left">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">CONTRACTS COMMITTED</span>
                <span className="text-xl font-bold font-mono text-white">12 Projects</span>
                <span className="text-[10px] text-slate-400 block mt-1">₹8.4 Lakhs Escrow Lock</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 text-left">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">VERIFICATION STATUS</span>
                <div className="flex items-center gap-1 mt-1 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>THEERVU LEVEL-I</span>
                </div>
                <span className="text-[10px] text-slate-500 block">SOP operations audit passed</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 text-left">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">REVENUE / SAVINGS TRACKER</span>
                <span className="text-xl font-bold font-mono text-white">₹32,400</span>
                <span className="text-[10px] text-amber-300 block mt-1">Avg 1.5% commission fee</span>
              </div>
            </div>

            {/* TWO COLUMN VENDOR PORTAL SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Profile Config panel */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-white">Operational Service Profile Configuration</h3>
                </div>

                {vendorActionSuccess && (
                  <div className="bg-emerald-950/60 border border-emerald-500/30 p-3 rounded-xl mb-4 text-xs text-emerald-300">
                    {vendorActionSuccess}
                  </div>
                )}

                <form onSubmit={handleApplyVendorProfile} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Enterprise Name</label>
                    <input
                      type="text"
                      value={vendorProfile.name}
                      onChange={(e) => setVendorProfile({ ...vendorProfile, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Operating HQ City</label>
                      <input
                        type="text"
                        value={vendorProfile.city}
                        onChange={(e) => setVendorProfile({ ...vendorProfile, city: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Pricing Strategy Tier</label>
                      <select
                        value={vendorProfile.pricingTier}
                        onChange={(e) => setVendorProfile({ ...vendorProfile, pricingTier: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                      >
                        <option value="Budget">Budget Champion</option>
                        <option value="Standard">Standard Premium</option>
                        <option value="Premium">Elite Enterprise Group</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category Specialties</label>
                    <p className="text-[10px] text-slate-500 mb-1.5 font-mono">Separate multi-specialties by comma</p>
                    <input
                      type="text"
                      value={vendorProfile.specialties.join(", ")}
                      onChange={(e) => setVendorProfile({ ...vendorProfile, specialties: e.target.value.split(",").map(i => i.trim()) })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                    />
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300 font-sans mb-1 uppercase tracking-wider text-[10px]">THEERVU REVENUE AND FEE MATRIX:</p>
                    <p>• Lead discovery fee: <span className="text-white">₹0 (Completely Free)</span></p>
                    <p>• Success Project Commission: <span className="text-amber-400">1.5%</span></p>
                    <p>• Escrow support charge: <span className="text-white">Included</span></p>
                    <p>• Marketing assistance premium: <span className="text-white">Optional add-on</span></p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Apply Operational Updates
                  </button>
                </form>
              </div>

              {/* Solicitations Matching List for Bidding Panel */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Matched High-Intent Customer Requirements</h3>
                      <p className="text-[11px] text-slate-400">Claims instant project tenders based on your selected target sectors.</p>
                    </div>
                    <span className="text-xs text-sky-400 font-mono">Live matching</span>
                  </div>

                  <div className="space-y-4">
                    {rfqs.map(rfqObj => (
                      <div
                        key={rfqObj.id}
                        className="p-4 bg-slate-950 rounded-2xl border border-slate-850 hover:border-slate-800 transition-all text-left"
                      >
                        <div className="flex justify-between items-start gap-3 mb-2.5">
                          <div>
                            <span className="text-[10px] font-mono bg-indigo-950 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded uppercase">
                              {rfqObj.category}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-1">Requested by: {rfqObj.contactName} ({rfqObj.location})</span>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-white block">Budget limit:</span>
                            <span className="text-sm font-bold text-amber-400 font-mono">₹{rfqObj.budget.toLocaleString()}</span>
                          </div>
                        </div>

                        <h4 className="font-bold text-slate-200 text-xs mb-2">Requirement: &ldquo;{rfqObj.title}&rdquo;</h4>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{rfqObj.description}</p>
                        
                        <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                          <span className="text-[11px] text-slate-500 font-mono">Active competitive bids: {rfqObj.bidsCount}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveLeadToBid(rfqObj);
                              setCustomBidPrice(Math.round(rfqObj.budget * 0.95));
                              setCustomBidProposal(`Greeting ${rfqObj.contactName}! ${vendorProfile.name} is a premier localized specialist. In compliance with TM standard SOP parameters, we offer fully certified pipeline designs.`);
                              setCustomBidTime(10);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition"
                          >
                            Craft Bid Proposal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submitting simulated Bid Workspace */}
                {activeLeadToBid && (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">FORMULATING CONTRACT PROPOSAL</h4>
                    <h3 className="text-base font-bold text-white mb-2">Bidding on Lead: <span className="text-indigo-300">&ldquo;{activeLeadToBid.title}&rdquo;</span></h3>
                    <p className="text-xs text-slate-400 mb-6 font-mono">Tender original budget: ₹{activeLeadToBid.budget.toLocaleString()}</p>

                    <div className="space-y-4">
                      
                      {/* Price input logic with Slider linking */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                          <span>Your Competitive Bid Price (INR)</span>
                          <span className="text-amber-400 font-mono">₹{customBidPrice.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min={Math.round(activeLeadToBid.budget * 0.7)}
                          max={Math.round(activeLeadToBid.budget * 1.2)}
                          step="5000"
                          value={customBidPrice}
                          onChange={(e) => setCustomBidPrice(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg outline-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>Aggressive: ₹{Math.round(activeLeadToBid.budget * 0.7).toLocaleString()}</span>
                          <span>Conservative: ₹{Math.round(activeLeadToBid.budget * 1.2).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Interactive breakdown of Platform Commission */}
                      <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-850 grid grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 text-[10px] block">YOUR TOTAL QUOTE:</span>
                          <span className="text-white font-bold">₹{customBidPrice.toLocaleString()}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[10px] block">1.5% THEERVU COMMISSION:</span>
                          <span className="text-red-400 font-bold">- ₹{Math.round(customBidPrice * 0.015).toLocaleString()}</span>
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                          <span className="text-slate-500 text-[10px] block font-sans font-semibold text-amber-500">YOUR NET PAYOUT:</span>
                          <span className="text-emerald-400 font-extrabold text-sm">₹{Math.round(customBidPrice * 0.985).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery SLA Guarantee (Days)</label>
                          <input
                            type="number"
                            value={customBidTime}
                            onChange={(e) => setCustomBidTime(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Standard Warranty Period</label>
                          <select className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30">
                            <option>1 Year Complete AMC & Site Service</option>
                            <option>3 Years Complete AMC & Site Service</option>
                            <option>5 Years Comprehensive engineering warranty</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Proposal Letter Custom copy</label>
                        <textarea
                          rows={3}
                          value={customBidProposal}
                          onChange={(e) => setCustomBidProposal(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/30 resize-none"
                        ></textarea>
                      </div>

                      <div className="pt-2 flex justify-end gap-3.5">
                        <button
                          type="button"
                          onClick={() => setActiveLeadToBid(null)}
                          className="bg-transparent hover:bg-slate-800 text-slate-300 font-semibold px-4 py-2 rounded-lg text-xs transition"
                        >
                          Discard Draft
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const customBid: Bid = {
                              id: `custom_${Date.now()}`,
                              rfqId: activeLeadToBid.id,
                              vendorName: vendorProfile.name,
                              bidAmount: customBidPrice,
                              estimatedDays: customBidTime,
                              proposalText: customBidProposal,
                              rating: 4.8,
                              guarantee: "1 Year Standard AMC backed by Escrow"
                            };

                            setBids(prev => [...prev, customBid]);
                            setRfqs(prev => prev.map(r => r.id === activeLeadToBid.id ? { ...r, bidsCount: r.bidsCount + 1 } : r));
                            setVendorActionSuccess(`Proposal submitted successfully to ${activeLeadToBid.contactName}! The buyer has been notified instantly with SMS alert triggers.`);
                            setActiveLeadToBid(null);
                            setTimeout(() => {
                              setVendorActionSuccess("");
                            }, 5000);
                          }}
                          className="bg-amber-500 text-slate-950 font-extrabold px-5 py-2 rounded-lg text-xs hover:bg-amber-400 transition cursor-pointer"
                        >
                          Submit Sealed Quotation
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* DETAILED ENQUIRY OR SPECIFICATIONS MODAL */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl text-left"
            >
              <button
                type="button"
                onClick={() => { setActiveModalItem(null); setEnquirySuccess(false); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 text-xs font-mono font-bold tracking-wider"
              >
                ✕ CLOSE
              </button>

              {enquirySuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Enquiry Routed Successfully!</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Theervu matching engine has transmitted this requirement directly to our verified, highest-rated regional contractors for {activeModalItem.data.name}. You will receive bids on your Consult Desk within minutes.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => { setActiveModalItem(null); setEnquirySuccess(false); }}
                    className="mt-6 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-xl text-xs font-bold transition"
                  >
                    Return to Ecosystem Directory
                  </button>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold font-mono">
                    {activeModalItem.type} specification details
                  </span>

                  <h3 className="text-lg font-bold text-white mt-3 mb-1">{activeModalItem.data.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{activeModalItem.data.description}</p>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5 mb-6">
                    {activeModalItem.type === "product" && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Total single purchase price:</span>
                        <span className="text-amber-400 font-bold font-mono text-base">₹{activeModalItem.data.price.toLocaleString()} {activeModalItem.data.unit}</span>
                      </div>
                    )}
                    
                    {activeModalItem.type === "service" && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Blended Service Pricing:</span>
                        <span className="text-amber-400 font-bold font-mono text-base">{activeModalItem.data.pricing}</span>
                      </div>
                    )}

                    {activeModalItem.type === "project" && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Typical Scope Investment:</span>
                        <span className="text-indigo-400 font-bold font-mono">{activeModalItem.data.averageScope}</span>
                      </div>
                    )}

                    {activeModalItem.type === "product" && activeModalItem.data.features && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">Granular Product Specifications:</h4>
                        <ul className="text-xs text-slate-400 space-y-1">
                          {activeModalItem.data.features.map((feature: string, fIdx: number) => (
                            <li key={fIdx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeModalItem.type === "service" && activeModalItem.data.deliverables && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">Guaranteed Deliverables Scope:</h4>
                        <ul className="text-xs text-slate-400 space-y-1">
                          {activeModalItem.data.deliverables.map((del: string, dIdx: number) => (
                            <li key={dIdx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              <span>{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeModalItem.type === "project" && activeModalItem.data.keyPhases && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">Standard Pipeline Installation Phases:</h4>
                        <ol className="text-xs text-slate-400 space-y-1.5">
                          {activeModalItem.data.keyPhases.map((phase: string, pIdx: number) => (
                            <li key={pIdx} className="flex items-start gap-1.5">
                              <span className="bg-slate-800 text-amber-500 font-mono w-4 h-4 rounded text-[10px] flex items-center justify-center shrink-0">
                                {pIdx + 1}
                              </span>
                              <span>{phase}</span>
                            </li>
                          ))}
                        </ol>
                        <div className="mt-3.5 pt-3.5 border-t border-slate-900 text-xs italic text-slate-300">
                          <span className="font-bold text-amber-500 block">Recent execution reference:</span>
                          {activeModalItem.data.recentExecution}
                        </div>
                      </div>
                    )}

                    {activeModalItem.type === "amc" && activeModalItem.data.coveredItems && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">SLA Maintenance coverage metrics:</h4>
                        <ul className="text-xs text-slate-400 space-y-1">
                          {activeModalItem.data.coveredItems.map((item: string, iIdx: number) => (
                            <li key={iIdx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-teal-400 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Dynamic request form embedded */}
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Request Quotation & Connect Contractors</h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      
                      // Prepend new RFQ to Client list automatically
                      const parsedBudget = activeModalItem.type === "product" 
                        ? activeModalItem.data.price * enquiryFormData.customQuantity 
                        : activeModalItem.type === "amc"
                        ? activeModalItem.data.pricePerYear
                        : 200000;

                      const createdRfqObj: RFQ = {
                        id: `rfq_auto_${Date.now()}`,
                        title: `Quotation check for ${activeModalItem.data.name}`,
                        type: activeModalItem.type === "product" ? "Product" : activeModalItem.type === "amc" ? "AMC" : "Service",
                        category: activeModalItem.data.category || activeModalItem.data.name,
                        description: enquiryFormData.notes,
                        budget: parsedBudget,
                        timeline: enquiryFormData.timeline,
                        location: "Coimbatore, TN",
                        contactName: enquiryFormData.name || "M/S Valam Systems",
                        organization: "Valam Enterprises",
                        status: "Open",
                        timestamp: new Date().toISOString(),
                        bidsCount: 0
                      };

                      setRfqs(prev => [createdRfqObj, ...prev]);
                      setSimulatedBiddingRfqId(createdRfqObj.id);

                      setEnquirySuccess(true);
                    }}
                    className="space-y-3.5 text-left"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-0.5">Your Name</label>
                        <input
                          type="text"
                          required
                          value={enquiryFormData.name}
                          onChange={(e) => setEnquiryFormData({ ...enquiryFormData, name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200"
                          placeholder="M. Ramachandran"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-0.5">Phone Contact</label>
                        <input
                          type="tel"
                          required
                          value={enquiryFormData.phone}
                          onChange={(e) => setEnquiryFormData({ ...enquiryFormData, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-0.5">Workspace Site Access</label>
                        <select
                          value={enquiryFormData.siteAccess}
                          onChange={(e) => setEnquiryFormData({ ...enquiryFormData, siteAccess: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200"
                        >
                          <option>Normal Access Office</option>
                          <option>Industrial Safety Zone</option>
                          <option>Commercial Kitchen Restricted</option>
                          <option>Residential Area</option>
                        </select>
                      </div>

                      {activeModalItem.type === "product" ? (
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Required Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={enquiryFormData.customQuantity}
                            onChange={(e) => setEnquiryFormData({ ...enquiryFormData, customQuantity: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Deliverable Deadline</label>
                          <input
                            type="text"
                            value={enquiryFormData.timeline}
                            onChange={(e) => setEnquiryFormData({ ...enquiryFormData, timeline: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">Additional customization remarks</label>
                      <textarea
                        rows={2}
                        value={enquiryFormData.notes}
                        onChange={(e) => setEnquiryFormData({ ...enquiryFormData, notes: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-200 resize-none font-sans"
                      />
                    </div>

                    <div className="pt-3 flex justify-end gap-3.5">
                      <button
                        type="button"
                        onClick={() => { setActiveModalItem(null); setEnquirySuccess(false); }}
                        className="bg-transparent text-slate-400 hover:text-slate-200 text-xs py-2 px-4 rounded-lg font-semibold transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-amber-400 transition flex items-center gap-1 cursor-pointer"
                      >
                        Request Quote & Match
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-950/80 border-t border-slate-900 py-12 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 group">
            <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-500">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-white block">THEERVU MAIYAM</span>
              <span className="text-[10px] text-slate-500">தீர்வு மையம் • Unified Business Operating Platform</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[11px]">
            <a href="#marketplace" onClick={() => { setUserRole("client"); setClientTab("marketplace"); }} className="hover:text-amber-400 transition">Connect Marketplace</a>
            <a href="#leads" onClick={() => { setUserRole("client"); setClientTab("post-rfq"); }} className="hover:text-amber-400 transition">Client Lobby & RFQs</a>
            <a href="#marketing" onClick={() => { setUserRole("client"); setClientTab("marketing-estimator"); }} className="hover:text-amber-400 transition">Growth Services</a>
            <a href="#sop" onClick={() => { setUserRole("client"); setClientTab("sop-builder"); }} className="hover:text-amber-400 transition">Regulatory SOPs</a>
            <a href="#vendor" onClick={() => setUserRole("vendor")} className="hover:text-amber-400 transition">Vendor Onboarding portal</a>
          </div>

          <div className="text-right">
            <span className="block text-slate-500">© 2026 Theervu Maiyam Platform. All rights reserved.</span>
            <span className="block text-[10px] text-indigo-400 mt-0.5">India&apos;s Centralized Business Marketplace & Quality Escrow Controller.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
