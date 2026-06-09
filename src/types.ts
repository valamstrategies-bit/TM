/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: "Solar" | "CCTV" | "Gas" | "Electrical" | "Fire Safety" | "Industrial";
  price: number;
  unit: string;
  rating: number;
  image: string;
  description: string;
  features: string[];
  stock: number;
}

export interface Service {
  id: string;
  name: string;
  category: "Finance & Tax" | "Marketing" | "Tech Solutions" | "Business Services";
  pricing: string;
  duration: string;
  description: string;
  deliverables: string[];
  icon: string;
}

export interface Project {
  id: string;
  name: string;
  industry: "Solar" | "Energy" | "Security" | "Civil" | "Utility" | "Automation";
  averageScope: string;
  duration: string;
  description: string;
  keyPhases: string[];
  recentExecution: string;
}

export interface AMCPackage {
  id: string;
  name: string;
  targetType: string;
  pricePerYear: number;
  frequency: string;
  description: string;
  coveredItems: string[];
}

export interface RFQ {
  id: string;
  title: string;
  type: "Service" | "Project" | "Product" | "AMC";
  category: string;
  description: string;
  budget: number;
  timeline: string;
  location: string;
  contactName: string;
  organization: string;
  status: "Draft" | "Open" | "Evaluating" | "Awarded";
  timestamp: string;
  bidsCount: number;
}

export interface Vendor {
  id: string;
  name: string;
  city: string;
  rating: number;
  verified: boolean;
  specialties: string[];
  yearEstablished: number;
  projectsCompleted: number;
  pricingTier: "Budget" | "Standard" | "Premium";
}

export interface Bid {
  id: string;
  rfqId: string;
  vendorName: string;
  bidAmount: number;
  estimatedDays: number;
  proposalText: string;
  rating: number;
  guarantee: string;
}
