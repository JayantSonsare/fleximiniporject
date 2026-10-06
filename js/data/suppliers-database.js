/**
 * PharmSentinel AI - Certified Pharmaceutical Distributors & Suppliers
 */

const SUPPLIERS_DATABASE = [
  {
    id: "SUP-01",
    name: "Apex Healthcare Logistics",
    contactPerson: "Dr. Rachel Thorne",
    email: "procurement@apexhealthlogistics.com",
    phone: "+1 (800) 555-0199",
    reliabilityScore: 98.4, // %
    avgFulfillmentHours: 6,
    emergencySlaHours: 3,
    coldChainCertified: true,
    gxCompliant: true,
    minOrderValue: 200, // USD
    discountTiers: [
      { minUnits: 50, discountPercent: 5 },
      { minUnits: 150, discountPercent: 12 },
      { minUnits: 500, discountPercent: 18 }
    ],
    supportedCategories: ["Emergency & Critical Care", "Anesthesia & Surgery", "Analgesics & Antipyretics"],
    rating: 4.9,
    status: "Active - Gold Preferred"
  },
  {
    id: "SUP-02",
    name: "BioPharma ColdChain Direct",
    contactPerson: "Marcus Vance",
    email: "orders@biopharmacoldchain.org",
    phone: "+1 (800) 555-0842",
    reliabilityScore: 99.1,
    avgFulfillmentHours: 10,
    emergencySlaHours: 5,
    coldChainCertified: true,
    gxCompliant: true,
    minOrderValue: 500,
    discountTiers: [
      { minUnits: 30, discountPercent: 4 },
      { minUnits: 100, discountPercent: 10 },
      { minUnits: 300, discountPercent: 15 }
    ],
    supportedCategories: ["Endocrinology / Diabetes", "Pulmonology & Respiratory", "Cardiovascular & Hematology"],
    rating: 5.0,
    status: "Active - Cold Chain Leader"
  },
  {
    id: "SUP-03",
    name: "SunMed National Pharmaceuticals",
    contactPerson: "Elena Rostova",
    email: "b2b@sunmedpharma.com",
    phone: "+1 (800) 555-0411",
    reliabilityScore: 94.7,
    avgFulfillmentHours: 18,
    emergencySlaHours: 8,
    coldChainCertified: false,
    gxCompliant: true,
    minOrderValue: 150,
    discountTiers: [
      { minUnits: 100, discountPercent: 8 },
      { minUnits: 250, discountPercent: 15 },
      { minUnits: 1000, discountPercent: 22 }
    ],
    supportedCategories: ["Antibiotics & Infectious Diseases", "Analgesics & Antipyretics", "Renal & Cardiovascular"],
    rating: 4.7,
    status: "Active - High Volume Partner"
  },
  {
    id: "SUP-04",
    name: "Novis Biologics & Specialty Rx",
    contactPerson: "Dr. Julian Croft",
    email: "urgent-orders@novisbiologics.io",
    phone: "+1 (800) 555-0723",
    reliabilityScore: 96.8,
    avgFulfillmentHours: 14,
    emergencySlaHours: 6,
    coldChainCertified: true,
    gxCompliant: true,
    minOrderValue: 400,
    discountTiers: [
      { minUnits: 20, discountPercent: 5 },
      { minUnits: 80, discountPercent: 12 }
    ],
    supportedCategories: ["Antiviral / Specialty", "Cardiovascular & Hematology", "Antibiotics & Infectious Diseases"],
    rating: 4.8,
    status: "Active - Specialty Rx"
  }
];

if (typeof window !== 'undefined') {
  window.SUPPLIERS_DATABASE = SUPPLIERS_DATABASE;
}
