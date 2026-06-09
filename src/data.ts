/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Service, Project, AMCPackage, RFQ, Vendor } from "./types";

export const taglines = [
  "One Platform. Every Business Solution.",
  "Connecting Businesses, Creating Growth.",
  "From Idea to Execution.",
  "Your Complete Business Ecosystem.",
  "Where Businesses Find Solutions."
];

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Premium Mono-PERC Solar PV Panel (550W)",
    category: "Solar",
    price: 14500,
    unit: "per panel",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&auto=format&fit=crop&q=60",
    description: "High-efficiency monocrystalline PERC solar cells with superior low-light performance. Certified for heavy wind load of 2400 Pascals.",
    features: ["550 Watts output", "21.3% efficiency rate", "25-Year performance warranty", "PID free technology"],
    stock: 250
  },
  {
    id: "p2",
    name: "Smart 4K IP Dome Surveillance Camera",
    category: "CCTV",
    price: 4800,
    unit: "per unit",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&auto=format&fit=crop&q=60",
    description: "Intelligent IP security camera with hardware-accelerated AI motion tracking, night vision, and tamper alarms.",
    features: ["4K Ultra HD Resolution", "IR Night Vision up to 40M", "Weatherproof IP67 rated", "Built-in microphone & PoE support"],
    stock: 120
  },
  {
    id: "p3",
    name: "Commercial Gas Manifold with Automatic Changeover",
    category: "Gas",
    price: 65000,
    unit: "per system",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=60",
    description: "Heavy-duty commercial gas cylinder manifold with smart electronics to automatically loop from reserve cylinder banks during pressure drops.",
    features: ["Supports up to 8 cylinders", "Automatic pressure override trigger", "Integrated gas leak sensors", "Mild steel powder-coated layout"],
    stock: 15
  },
  {
    id: "p4",
    name: "3-Phase 10kVA Hybrid Solar Inverter",
    category: "Solar",
    price: 85000,
    unit: "per unit",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1620052581237-5d36667be337?w=400&auto=format&fit=crop&q=60",
    description: "Advanced grid-tied solar inverter with battery backup capabilities. Connects with lithium battery packs for seamless power storage.",
    features: ["Dual MPPT Trackers", "Touchscreen local console", "Overload & short-circuit cutoff protection", "IoT-enabled mobile app surveillance"],
    stock: 30
  },
  {
    id: "p5",
    name: "Heavy Duty Armor Shielded Copper Pipe",
    category: "Industrial",
    price: 1200,
    unit: "per meter",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=400&auto=format&fit=crop&q=60",
    description: "Seamless phosphorus-deoxidized copper pipe specialized for commercial LPG line installations and liquid refrigeration lines.",
    features: ["Thick-walled 1.2mm structure", "High durability pressure limit up to 150 bar", "Anti-corrosion sleeve", "Meets ASTM-B280 standards"],
    stock: 1500
  },
  {
    id: "p6",
    name: "Addressable Fire Alarm Control Panel (16 Zone)",
    category: "Fire Safety",
    price: 18500,
    unit: "per console",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?w=400&auto=format&fit=crop&q=60",
    description: "Central monitoring console designed to interface with smoke detectors, heat sensors, and siren strobe systems across large floor plans.",
    features: ["16 Independent Loop Zones", "LCD display console", "Battery backup up to 24 hours", "Supports up to 128 devices"],
    stock: 45
  },
  {
    id: "p7",
    name: "Industrial Main Panel DB Board (100A)",
    category: "Electrical",
    price: 32000,
    unit: "per unit",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1517420712360-bab8a57e3f22?w=400&auto=format&fit=crop&q=60",
    description: "Fully wired electrical distribution board equipped with Siemens MCBs, RCCBs, and auto-phase changers.",
    features: ["Heavy duty CRCA steel cabinet", "Integrated energy usage reporting", "Dust & moisture IP54 ingress protection", "Busbar support up to 500V"],
    stock: 20
  }
];

export const mockServices: Service[] = [
  {
    id: "s1",
    name: "Corporate Accounting & GST Filing",
    category: "Finance & Tax",
    pricing: "₹4,500 / month",
    duration: "Ongoing Monthly Support",
    description: "End-to-end accounting, weekly bookkeeping, monthly GST reconciliation (GSTR-1, GSTR-3B), and quarterly filings.",
    deliverables: [
      "Dedicated professional accountant",
      "Monthly trials and balance sheets",
      "GST credit matching & tax ledger updates",
      "Direct phone and chat support for audits"
    ],
    icon: "Calculator"
  },
  {
    id: "s2",
    name: "Company Incorporation & Startup Registrations",
    category: "Finance & Tax",
    pricing: "₹8,000 one-time",
    duration: "10 - 15 working days",
    description: "Incorporate as Pvt Ltd, LLP, or Proprietorship. Package includes digital signatures, DIN allocation, name approvals, MOA, AOA drafting, and PAN/TAN creation.",
    deliverables: [
      "Company Registration Certificate (COI)",
      "DIN (Director Identification Numbers) for 2 directors",
      "Complete MOA & AOA documentation",
      "Free MSME Udyam and Startup India guidance"
    ],
    icon: "FileText"
  },
  {
    id: "s3",
    name: "Meta & Google Ads Complete Customer Acquisition",
    category: "Marketing",
    pricing: "₹18,000 / month + Ad Spend",
    duration: "Minimum 3-month contract",
    description: "High-ROI paid advertisement campaigns across Facebook, Instagram, and Google Search designed to generate high-quality inquiries for B2B/B2C vendors.",
    deliverables: [
      "Conversion tracking setup & tag manager installation",
      "Ad creatives design (4 banners + 2 videos per month)",
      "A/B split testing of target audiences",
      "Bi-weekly performance review & competitor reports"
    ],
    icon: "TrendingUp"
  },
  {
    id: "s4",
    name: "Review & Reputation Marketing Automator",
    category: "Marketing",
    pricing: "₹6,000 / month",
    duration: "Monthly subscription",
    description: "Generate 5-star Google business reviews automatically from your customers through customized WhatsApp blasts and custom QR counters.",
    deliverables: [
      "Custom branded dynamic review collection link",
      "Smart routing: Negative reviews redirected to internal form",
      "SMS & WhatsApp integration for past customer database",
      "Google My Business local SEO audit"
    ],
    icon: "Star"
  },
  {
    id: "s5",
    name: "Business SOP Automation & Workflow Engineering",
    category: "Business Services",
    pricing: "₹25,000 one-time",
    duration: "20 - 30 working days",
    description: "Translate your manual operational processes into digital, automated workflows using cloud systems, reducing reliance on paper and manual reminders.",
    deliverables: [
      "Visual step-by-step Standard Operating Procedures (SOPs)",
      "Workflow mapping with Slack, WhatsApp, or email alarms",
      "Digital checklist templates for field technicians",
      "2-hour comprehensive team workshop run-through"
    ],
    icon: "Settings2"
  },
  {
    id: "s6",
    name: "Enterprise Custom ERP & CRM Development",
    category: "Tech Solutions",
    pricing: "Custom Quotation",
    duration: "45 - 90 working days",
    description: "Tailor-made web portals for customer tracking, purchase order processing, vendor payments, and inventory monitoring built on serverless architectures.",
    deliverables: [
      "Native React Web & Administrative Super-dashboard",
      "Integrated secure PostgreSQL databases",
      "Automated e-invoices & thermal billing linkages",
      "6-month zero-downtime maintenance SLA support"
    ],
    icon: "Code"
  },
  {
    id: "s7",
    name: "Corporate Income Tax Filing & Audit Assistance",
    category: "Finance & Tax",
    pricing: "₹12,000 / year",
    duration: "Annual filing cycle",
    description: "Preparation of annual financial books, filing of form ITR-6 for corporate bodies, tax planning strategies to maximize depreciation and offset business losses.",
    deliverables: [
      "Tax liability computation statement",
      "Asset depreciation schedules calculation",
      "Tax Audit reports signature assistance from Chartered Accountant",
      "Response preparation for statutory tax notices"
    ],
    icon: "Briefcase"
  }
];

export const mockProjects: Project[] = [
  {
    id: "proj1",
    name: "Commercial Gas Pipeline System Installation",
    industry: "Utility",
    averageScope: "₹1,50,000 - ₹5,00,000",
    duration: "10 - 20 days",
    description: "End-to-end design and installation of commercial LPG bullet or multi-cylinder pipeline manifolds. Ideal for hotel kitchens, industrial units, and laboratories.",
    keyPhases: [
      "Site survey, load plotting & manifold CAD diagram approval",
      "Seamless copper pipe routing with high-frequency silver brazing",
      "Pressure testing at 1.5x working pressure with nitrogen dry hold",
      "Gas leak detection system calibration & safety certification"
    ],
    recentExecution: "Installed 12-cylinder automatic changeover manifold for Grand Regency Hotel kitchen."
  },
  {
    id: "proj2",
    name: "Rooftop Solar Plant Setup (10kW - 100kW)",
    industry: "Solar",
    averageScope: "₹3,50,000 - ₹28,00,000",
    duration: "15 - 35 days",
    description: "Turnkey installation of grid-connected or hybrid rooftop solar panels for commercial factories, educational institutes, and independent residences.",
    keyPhases: [
      "Shadow mapping & structural roof feasibility reports",
      "Hot-dip galvanized structure installation with non-penetrating anchors",
      "Panel placement, distribution DB connection with earth pits",
      "Net-metering application submission with government utility"
    ],
    recentExecution: "Commissioned 50kW on-grid solar project for Aruna Agro Industries campus."
  },
  {
    id: "proj3",
    name: "Multi-Store Smart CCTV Network Grid",
    industry: "Security",
    averageScope: "₹80,000 - ₹3,00,000",
    duration: "5 - 12 days",
    description: "Design and deployment of networked surveillance grids. Supports AI-triggered zone violations, cloud recording backups, and multi-location monitoring.",
    keyPhases: [
      "Camera angle optimization mapping on floor boundaries",
      "Optical fiber backhaul routing with PoE smart switch setup",
      "Server configuration with dynamic IP streaming configuration",
      "Command center dashboard training for security personnel"
    ],
    recentExecution: "Linked 64 IP cameras across 5 major distribution hubs to a single master command center."
  },
  {
    id: "proj4",
    name: "Industrial Electrical Wiring & Plant Substations",
    industry: "Automation",
    averageScope: "₹5,00,000 - ₹25,00,000",
    duration: "30 - 60 days",
    description: "Comprehensive power distribution wiring, machine power drop drops, busbar routing, subpanel designs, and earth grid configurations for warehouses & factories.",
    keyPhases: [
      "Total current loading analysis & cable thickness ratings",
      "Main panel DB build, mounting, and MCB cascade arrangement",
      "Heavy load earth pit testing under 1-ohm resistance test",
      "Safety audits, insulation resistance readings compilation"
    ],
    recentExecution: "Wired an entire 40,000 sq ft carton manufacturing unit from the substations."
  },
  {
    id: "proj5",
    name: "Commercial Fire Sprinkler & Safety System",
    industry: "Civil",
    averageScope: "₹2,50,000 - ₹12,00,000",
    duration: "15 - 30 days",
    description: "Design and deployment of active safety measures. Complete installations of high-pressure wet hydrants, smoke detectors, alarm lines, and automatic sprinkler loops.",
    keyPhases: [
      "Blueprints approval in compliance with National Building Code (NBC)",
      "Mild steel distribution layout hanging via heavy ring hangers",
      "Electric pressure jockey pumps linking to local water buffer tanks",
      "Simulated heat sensor trigger & pattern sprinkler flow testing"
    ],
    recentExecution: "Completed NBC-compliant sprinkler installation for Apex IT tower wings."
  }
];

export const mockAMCPackages: AMCPackage[] = [
  {
    id: "amc1",
    name: "Commercial Kitchen Gas Pipeline AMC",
    targetType: "Hotels, Cafes, Bakeries",
    pricePerYear: 18000,
    frequency: "Semiannual visits (2 per year)",
    description: "Proactive leak diagnosis, pressure test verify, seal renewal, and safety compliance re-certifications to prevent restaurant closures.",
    coveredItems: [
      "Nitrogen decay hold test during off-hours",
      "Replacement of high-pressure rubber ring gas washers",
      "Leak sensor testing with butane test aerosols",
      "Solenoid valve shutdown circuit test"
    ]
  },
  {
    id: "amc2",
    name: "Corporate CCTV Smart Maintenance Contract",
    targetType: "Offices, Retail, Warehouses",
    pricePerYear: 12000,
    frequency: "Quarterly visits (4 per year)",
    description: "Prevent downtime on surveillance. We clean sensors, check recording buffers, rewrite storage routines, and recalibrate angles.",
    coveredItems: [
      "Focal clean-ups & angle tweaking on active nodes",
      "NVR storage sector audits & cooling fan clean-up",
      "Wiring terminal inspection & tension testing",
      "Central software updates & network throughput checks"
    ]
  },
  {
    id: "amc3",
    name: "Commercial Solar Power AMC & Diagnostic Plan",
    targetType: "Industrial Solar Rooftops",
    pricePerYear: 35000,
    frequency: "Quarterly monitoring + SOS response",
    description: "Keep solar yields high. Includes periodic chemical washings, thermal scanning of PV cells, and inverter diagnostics.",
    coveredItems: [
      "Cell temperature thermal image scans for micro-cracks",
      "Inverter DC-AC curve diagnostic logs output",
      "Array structuring fasteners tensioning",
      "24-Hour emergency breakdown call assistance"
    ]
  },
  {
    id: "amc4",
    name: "Industrial Electrical DB Panel Maintenance",
    targetType: "Manufacturing Sites, Workshops",
    pricePerYear: 28000,
    frequency: "Three visits per year",
    description: "Thermographic imaging of bus bars, tightening phase nodes, cleaning copper dust, and residual current breaker trippings.",
    coveredItems: [
      "Thermal scans of main contacts for high resistance",
      "Contact cleaner spray down for carbonized connectors",
      "MCCB & RCCB operation speed verification",
      "Harmonic distortion feedback reports"
    ]
  }
];

export const mockVendors: Vendor[] = [
  {
    id: "v1",
    name: "Kovai Power Systems",
    city: "Coimbatore",
    rating: 4.8,
    verified: true,
    specialties: ["Solar Rooftops", "Electrical Panels", "Solar Products"],
    yearEstablished: 2012,
    projectsCompleted: 148,
    pricingTier: "Standard"
  },
  {
    id: "v2",
    name: "Dindigul Gas & Utility Engineers",
    city: "Dindigul",
    rating: 4.9,
    verified: true,
    specialties: ["LPG Pipelines", "Gas Piping", "Industrial Gas Manifolds"],
    yearEstablished: 2015,
    projectsCompleted: 88,
    pricingTier: "Premium"
  },
  {
    id: "v3",
    name: "SmartShield Surveillance & Fire",
    city: "Chennai",
    rating: 4.7,
    verified: true,
    specialties: ["CCTV Installation", "Fire Alarms", "Surveillance"],
    yearEstablished: 2018,
    projectsCompleted: 210,
    pricingTier: "Budget"
  },
  {
    id: "v4",
    name: "TaxSutra Financial Advisors Ltd",
    city: "Madurai",
    rating: 4.9,
    verified: true,
    specialties: ["GST Filing", "Company Registration", "Legal SOPs"],
    yearEstablished: 2010,
    projectsCompleted: 450,
    pricingTier: "Standard"
  },
  {
    id: "v5",
    name: "Apex Tech & Creative Digital",
    city: "Trichy",
    rating: 4.6,
    verified: true,
    specialties: ["Meta Ads", "CRM Software", "Review Systems"],
    yearEstablished: 2021,
    projectsCompleted: 64,
    pricingTier: "Standard"
  }
];

export const initialRFQs: RFQ[] = [
  {
    id: "rfq_1",
    title: "15kW On-Grid Solar System for cold storage factory",
    type: "Project",
    category: "Solar Power Installation",
    description: "Need immediate quotation for hot-dip galvanized mounting and Net Metering permission. Mono-PERC 545W+ modules preferred.",
    budget: 850000,
    timeline: "30 Days",
    location: "Coimbatore, TN",
    contactName: "S. Murugantham",
    organization: "Sri Lakshmi Agro Storage",
    status: "Open",
    timestamp: "2026-06-08T14:22:00Z",
    bidsCount: 2
  },
  {
    id: "rfq_2",
    title: "Commercial gas pipeline setup for 24-burner hotel kitchen",
    type: "Project",
    category: "LPG Pipeline Installation",
    description: "Kitchen pipeline setup. Need 4 copper manifold connection nodes with butane safety alarms.",
    budget: 180000,
    timeline: "15 Days",
    location: "Madurai, TN",
    contactName: "A. Karthik",
    organization: "Hotel Sabareesh Vilas",
    status: "Open",
    timestamp: "2026-06-09T09:15:00Z",
    bidsCount: 1
  },
  {
    id: "rfq_3",
    title: "Pvt Ltd Registration + GST Setup for Logistics Startup",
    type: "Service",
    category: "Company Registration",
    description: "Incorporation guidance. Need registration with digital signatures for 2 directors and instant MSME registration.",
    budget: 12000,
    timeline: "10 Days",
    location: "Chennai, TN",
    contactName: "R. Vaishnavi",
    organization: "FastTrack Logiroutes India LLP",
    status: "Open",
    timestamp: "2026-06-09T10:45:00Z",
    bidsCount: 3
  },
  {
    id: "rfq_4",
    title: "Full Factory Surveillance: 32 IP CCTV Nodes Grid",
    type: "Project",
    category: "CCTV Installation",
    description: "Looking for complete cabling, hardware supply, PoE switches, and NVR hosting with 40-day HDD backups.",
    budget: 250000,
    timeline: "20 Days",
    location: "Salem, TN",
    contactName: "P. Chendur",
    organization: "Chendur Steel Forgings",
    status: "Open",
    timestamp: "2026-06-09T11:00:00Z",
    bidsCount: 0
  }
];

export const mockBids = [
  {
    id: "bid_1",
    rfqId: "rfq_1",
    vendorName: "Kovai Power Systems",
    bidAmount: 820000,
    estimatedDays: 25,
    proposalText: "We offer top-class Tata solar Mono-PERC panels with 25-yr warranties. Full Net Metering approvals and coordination will be handled by our liaison officer.",
    rating: 4.8,
    guarantee: "5 Years comprehensive site service warranty"
  },
  {
    id: "bid_2",
    rfqId: "rfq_1",
    vendorName: "RenewGrid Alternative Tech",
    bidAmount: 795000,
    estimatedDays: 28,
    proposalText: "Low price bid incorporating Waaree 550W panels, Growatt Hybrid Smart inverter with grid safety relays. Certified structural engineer drawings included.",
    rating: 4.5,
    guarantee: "2 Years system-level replacement warranty"
  },
  {
    id: "bid_3",
    rfqId: "rfq_2",
    vendorName: "Dindigul Gas & Utility Engineers",
    bidAmount: 172000,
    estimatedDays: 12,
    proposalText: "Heavy gauge copper manifolds from Tata piping. Included dual mechanical gas solenoids and standard digital leaks warning panels. Ready to start in 36 hours.",
    rating: 4.9,
    guarantee: "10 Years on gas silver brazing joints"
  },
  {
    id: "bid_4",
    rfqId: "rfq_3",
    vendorName: "TaxSutra Financial Advisors Ltd",
    bidAmount: 105000, // wait this is some service fee comparison
    estimatedDays: 7,
    proposalText: "Chartered Accountant led registration with lifetime free expert consultations on tax write-offs for the first year. Turnaround time guarantee.",
    rating: 4.9,
    guarantee: "100% filing outcome success or refund guarantee"
  }
];
