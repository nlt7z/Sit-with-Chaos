import type { RepairOrderData, MerchantQuote, ProductRecData } from "./chatStore";

export const defaultRepairOrder: RepairOrderData = {
  faultProblem: "TOTO toilet · sewer odor",
  parts: [
    { label: "Flange", kind: "photo" },
    { label: "Ring", kind: "photo" },
    { label: "Bolts", kind: "photo" },
    { label: "Demo", kind: "video" },
  ],
  plan: "Replace wax ring + flange seal",
  planPrice: "$35",
  planNote: "final on-site inspection",
  time: "Today, 2:00–4:00 PM",
  address: "820 W Ridge Ln, Apt 4B",
};

export const merchantQuotes: MerchantQuote[] = [
  {
    id: "m1",
    name: "Citrus Home Services",
    photoLabel: "CHS",
    rating: 5.0,
    reviews: "12.8k reviews",
    category: "Home Repair",
    badges: [
      { text: "90-day warranty", tone: "orange" },
      { text: "No hidden fees", tone: "gray" },
      { text: "Fix or refund", tone: "orange" },
    ],
    priceLow: 24,
    priceHigh: 108,
  },
  {
    id: "m2",
    name: "ServiceMaster Pro",
    photoLabel: "SMP",
    rating: 4.9,
    reviews: "9.2k reviews",
    category: "Home Repair",
    badges: [
      { text: "#2 SF Home Repair", tone: "orange" },
      { text: "Price match", tone: "red" },
      { text: "No hidden fees", tone: "gray" },
    ],
    priceLow: 32,
    priceHigh: 120,
  },
  {
    id: "m3",
    name: "QuickFix Appliance",
    photoLabel: "QFA",
    rating: 4.8,
    reviews: "6.4k reviews",
    category: "Home Repair",
    badges: [
      { text: "Online estimate", tone: "orange" },
      { text: "Fix or refund", tone: "orange" },
      { text: "Price match", tone: "red" },
    ],
    priceLow: 28,
    priceHigh: 95,
  },
  {
    id: "m4",
    name: "Bay Plumbing & Repair",
    photoLabel: "BPR",
    rating: 4.9,
    reviews: "7.1k reviews",
    category: "Plumbing",
    badges: [
      { text: "90-day warranty", tone: "orange" },
      { text: "No hidden fees", tone: "gray" },
    ],
    priceLow: 30,
    priceHigh: 110,
  },
  {
    id: "m5",
    name: "ProFix Home Services",
    photoLabel: "PFH",
    rating: 4.8,
    reviews: "5.8k reviews",
    category: "Home Repair",
    badges: [
      { text: "Fix or refund", tone: "orange" },
      { text: "Price match", tone: "red" },
    ],
    priceLow: 35,
    priceHigh: 130,
  },
  {
    id: "m6",
    name: "PipePros Plumbing",
    photoLabel: "PPP",
    rating: 4.9,
    reviews: "8.3k reviews",
    category: "Plumbing",
    badges: [
      { text: "Online estimate", tone: "orange" },
      { text: "No hidden fees", tone: "gray" },
    ],
    priceLow: 22,
    priceHigh: 100,
  },
];

// Extended detail data for each merchant (for the detail screen)
export type MerchantDetail = {
  tagline: string;
  description: string;
  specialties: string[];
  yearsInService: number;
  jobsDone: number;
  responseTime: string;
  pricingRows: { label: string; value: string }[];
  coverageArea: string;
  reviews: { name: string; initials: string; date: string; rating: number; text: string }[];
};

export const merchantDetails: Record<string, MerchantDetail> = {
  m1: {
    tagline: "SF's most trusted home repair team",
    description:
      "Citrus Home Services specializes in residential plumbing, toilet repair, and general home maintenance across the Bay Area. All technicians are licensed, background-checked, and carry full liability insurance. We show up on time, itemize every charge, and don't leave until the job is done right.",
    specialties: ["Toilet repair", "Wax ring seal", "Pipe leak", "Faucet replacement"],
    yearsInService: 12,
    jobsDone: 2847,
    responseTime: "< 25 min",
    pricingRows: [
      { label: "Diagnosis", value: "Free" },
      { label: "Labor", value: "$45–$85 / hr" },
      { label: "Parts", value: "Quoted on-site" },
      { label: "Weekend rate", value: "+$20 surcharge" },
      { label: "Warranty", value: "90 days — parts & labor" },
    ],
    coverageArea: "All SF neighborhoods · Daly City · South SF",
    reviews: [
      {
        name: "Laura M.", initials: "LM", date: "May 8",
        rating: 5,
        text: "Super fast response. Fixed the wax ring in under an hour. Price matched the estimate exactly — no surprise charges.",
      },
      {
        name: "James T.", initials: "JT", date: "Apr 30",
        rating: 5,
        text: "Professional and clean. The tech wore shoe covers and cleaned up after himself. Will definitely use again.",
      },
      {
        name: "Sarah K.", initials: "SK", date: "Apr 22",
        rating: 5,
        text: "Diagnosed the issue in minutes. Had everything fixed same day. The 90-day warranty gave me real peace of mind.",
      },
    ],
  },
  m2: {
    tagline: "Rated #2 in SF home repair",
    description:
      "ServiceMaster Pro brings commercial-grade equipment and expertise to every residential job. We're the team behind some of SF's most complex plumbing renovations, now available for same-day repair calls.",
    specialties: ["Plumbing", "Water heater", "Drain clearing", "Emergency repair"],
    yearsInService: 9,
    jobsDone: 1920,
    responseTime: "< 35 min",
    pricingRows: [
      { label: "Diagnosis", value: "Free" },
      { label: "Labor", value: "$50–$90 / hr" },
      { label: "Parts", value: "Quoted on-site" },
      { label: "Price match", value: "Guaranteed" },
    ],
    coverageArea: "SF · Oakland · Berkeley · Richmond",
    reviews: [
      {
        name: "Michael B.", initials: "MB", date: "May 6",
        rating: 5,
        text: "Came within 20 minutes of booking. The price match guarantee saved me $40 compared to the other quote.",
      },
      {
        name: "Diana L.", initials: "DL", date: "Apr 28",
        rating: 5,
        text: "Very professional. Explained every step of the repair and walked me through what to watch for going forward.",
      },
      {
        name: "Ryan P.", initials: "RP", date: "Apr 15",
        rating: 5,
        text: "Had a nasty drain blockage. They cleared it fast and showed me a camera view of the pipe. Top tier.",
      },
    ],
  },
};

// Fall back for unlisted merchant IDs
export function getMerchantDetail(id: string): MerchantDetail {
  return (
    merchantDetails[id] ?? {
      tagline: "Trusted local home repair",
      description:
        "A highly rated local repair team serving the Bay Area. Licensed and insured, with fast response times and transparent pricing.",
      specialties: ["General repair", "Plumbing", "Installation"],
      yearsInService: 7,
      jobsDone: 1200,
      responseTime: "< 40 min",
      pricingRows: [
        { label: "Diagnosis", value: "Free" },
        { label: "Labor", value: "$40–$80 / hr" },
        { label: "Parts", value: "Quoted on-site" },
      ],
      coverageArea: "SF Bay Area",
      reviews: [
        {
          name: "Alex R.", initials: "AR", date: "May 5",
          rating: 5,
          text: "Fast, fair, and professional. Highly recommend.",
        },
        {
          name: "Chris W.", initials: "CW", date: "Apr 26",
          rating: 5,
          text: "Fixed the issue same day. Great communication throughout.",
        },
      ],
    }
  );
}

export const productRec: ProductRecData = {
  title: "Meituan · Worry-Free Toilet Clog Relief · Same-Day Dispatch",
  badges: ["No markup", "Fix or refund"],
  priceWhole: 59,
  priceFrac: ".50",
};
