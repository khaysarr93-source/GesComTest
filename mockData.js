// Données de démonstration initiales pour THE FOX GESCOM (Sénégal)

const DEFAULT_WAREHOUSES = [
  { id: 'wh-1', code: 'DEP-DKR', name: 'Entrepôt Central Dakar', address: 'Zone Industrielle, Km 4 Centenaire', isDefault: true },
  { id: 'wh-2', code: 'MAG-PLT', name: 'Boutique Plateau', address: 'Avenue Pompidou, Dakar Plateau', isDefault: false },
  { id: 'wh-3', code: 'DEP-THS', name: 'Dépôt Régional Thiès', address: 'Quartier Dixième, Thiès', isDefault: false }
];

const DEFAULT_PRODUCTS = [
  { id: 'prod-1', name: 'Ordinateur Portable HP ProBook 450', category: 'Informatique', price: 450000, costPrice: 380000, stock: 15, stockReserved: 2, minStock: 5 },
  { id: 'prod-2', name: 'Imprimante LaserJet Canon LBP6030', category: 'Informatique', price: 135000, costPrice: 105000, stock: 4, stockReserved: 0, minStock: 6 }, // Stock bas
  { id: 'prod-3', name: 'Routeur Wi-Fi Cisco Industrial 4G', category: 'Réseaux', price: 95000, costPrice: 72000, stock: 22, stockReserved: 1, minStock: 5 },
  { id: 'prod-4', name: 'Bureau Direction Modulaire Bois', category: 'Mobilier', price: 320000, costPrice: 240000, stock: 6, stockReserved: 0, minStock: 2 },
  { id: 'prod-5', name: 'Chaise Ergonomique Pivotante Mesh', category: 'Mobilier', price: 85000, costPrice: 60000, stock: 0, stockReserved: 0, minStock: 5 }, // Rupture
  { id: 'prod-6', name: 'Onduleur APC Back-UPS 1400VA', category: 'Réseaux', price: 150000, costPrice: 115000, stock: 12, stockReserved: 0, minStock: 4 },
  { id: 'prod-7', name: 'Papier A4 Double A 80g (Carton de 5 rames)', category: 'Fournitures', price: 18000, costPrice: 13500, stock: 45, stockReserved: 5, minStock: 10 },
  { id: 'prod-8', name: 'Disque Dur Externe WD Elements 2To', category: 'Informatique', price: 55000, costPrice: 42000, stock: 18, stockReserved: 0, minStock: 5 }
];

const DEFAULT_CLIENTS = [
  { id: 'cli-1', name: 'Société Dakaroise de Commerce (SDC)', email: 'contact@sdc.sn', phone: '+221 77 654 32 10', city: 'Dakar', address: 'Avenue Cheikh Anta Diop, Fann' },
  { id: 'cli-2', name: 'Baobab Technologies', email: 'info@baobabtech.sn', phone: '+221 78 123 45 67', city: 'Thiès', address: 'Quartier Escale, Avenue Léopold S. Senghor' },
  { id: 'cli-3', name: 'GIE Ndar Multimédia', email: 'ndarmulti@gmail.com', phone: '+221 76 987 65 43', city: 'Saint-Louis', address: 'Île de Saint-Louis, Rue de France' },
  { id: 'cli-4', name: 'Mbour Pêche Exportation', email: 'mbourpeche@orange.sn', phone: '+221 70 555 44 33', city: 'Mbour', address: 'Zone Portuaire' },
  { id: 'cli-5', name: 'Touba Agro-Alimentaire', email: 'contact@touba-agro.sn', phone: '+221 77 888 99 00', city: 'Touba', address: 'Grande Corniche' }
];

// Devis Clients de Démonstration
const DEFAULT_QUOTES = [
  {
    id: 'D-2026-0001',
    clientId: 'cli-3',
    date: '2026-07-05T10:00:00Z',
    items: [
      { productId: 'prod-4', quantity: 1, price: 320000 },
      { productId: 'prod-6', quantity: 2, price: 150000 }
    ],
    discount: 10000,
    tvaRate: 18,
    status: 'Envoyé'
  },
  {
    id: 'D-2026-0002',
    clientId: 'cli-1',
    date: '2026-07-08T09:00:00Z',
    items: [
      { productId: 'prod-1', quantity: 3, price: 450000 }
    ],
    discount: 50000,
    tvaRate: 18,
    status: 'Brouillon'
  }
];

// Commandes Clients (Sales Orders) - Le pivot central du Gescom
const DEFAULT_SALES_ORDERS = [
  {
    id: 'CC-2026-0001',
    quoteId: 'D-2026-0001',
    clientId: 'cli-3',
    warehouseId: 'wh-1',
    date: '2026-07-06T10:00:00Z',
    invoicingPolicy: 'delivery', // 'delivery' ou 'order'
    deliveryStatus: 'partial',  // 'no', 'partial', 'full'
    invoiceStatus: 'no',        // 'no', 'partial', 'full'
    status: 'En cours',         // 'Brouillon', 'Confirmée', 'En cours', 'Terminée', 'Annulée'
    items: [
      { productId: 'prod-4', quantity: 1, deliveredQty: 0, invoicedQty: 0, price: 320000 },
      { productId: 'prod-6', quantity: 2, deliveredQty: 2, invoicedQty: 0, price: 150000 }
    ],
    discount: 10000,
    tvaRate: 18
  },
  {
    id: 'CC-2026-0002',
    quoteId: null,
    clientId: 'cli-1',
    warehouseId: 'wh-1',
    date: '2026-07-07T14:30:00Z',
    invoicingPolicy: 'order',
    deliveryStatus: 'no',
    invoiceStatus: 'full',
    status: 'Confirmée',
    items: [
      { productId: 'prod-1', quantity: 2, deliveredQty: 0, invoicedQty: 2, price: 450000 },
      { productId: 'prod-7', quantity: 5, deliveredQty: 0, invoicedQty: 5, price: 18000 }
    ],
    discount: 0,
    tvaRate: 18
  }
];

// Factures Ventes Clients (Invoices)
const DEFAULT_ORDERS = [
  {
    id: 'F-2026-0001',
    orderId: 'CC-2026-0002',
    deliveryId: 'BL-2026-0001',
    clientId: 'cli-1',
    date: '2026-06-15T10:30:00Z',
    items: [
      { productId: 'prod-1', quantity: 2, price: 450000 },
      { productId: 'prod-3', quantity: 1, price: 95000 }
    ],
    discount: 25000,
    tvaRate: 18,
    status: 'Payée',
    paidAmount: 1144600
  },
  {
    id: 'F-2026-0002',
    orderId: '',
    deliveryId: 'BL-2026-0002',
    clientId: 'cli-2',
    date: '2026-06-28T14:15:00Z',
    items: [
      { productId: 'prod-2', quantity: 1, price: 135000 },
      { productId: 'prod-7', quantity: 5, price: 18000 }
    ],
    discount: 0,
    tvaRate: 18,
    status: 'Payée',
    paidAmount: 265500
  },
  {
    id: 'F-2026-0003',
    orderId: '',
    deliveryId: 'BL-2026-0003',
    clientId: 'cli-3',
    date: '2026-07-02T09:45:00Z',
    items: [
      { productId: 'prod-5', quantity: 2, price: 85000 }
    ],
    discount: 5000,
    tvaRate: 18,
    status: 'En attente',
    paidAmount: 0
  },
  {
    id: 'F-2026-0004',
    orderId: '',
    deliveryId: '',
    clientId: 'cli-4',
    date: '2026-07-06T16:00:00Z',
    items: [
      { productId: 'prod-1', quantity: 1, price: 450000 },
      { productId: 'prod-6', quantity: 2, price: 150000 }
    ],
    discount: 15000,
    tvaRate: 18,
    status: 'Annulée',
    paidAmount: 0
  },
  {
    id: 'F-2026-0005',
    orderId: '',
    deliveryId: 'BL-2026-0004',
    clientId: 'cli-5',
    date: '2026-07-07T11:20:00Z',
    items: [
      { productId: 'prod-8', quantity: 4, price: 55000 },
      { productId: 'prod-7', quantity: 2, price: 18000 }
    ],
    discount: 0,
    tvaRate: 18,
    status: 'Payée',
    paidAmount: 302080
  }
];

// Avoirs Clients (Refunds / Notes de Crédit)
const DEFAULT_REFUNDS = [
  {
    id: 'AV-2026-0001',
    invoiceId: 'F-2026-0001',
    clientId: 'cli-1',
    date: '2026-06-20T11:00:00Z',
    reason: 'Retour article endommagé lors du transport',
    restock: true, // Réintégré en stock physique
    warehouseId: 'wh-1',
    items: [
      { productId: 'prod-3', quantity: 1, price: 95000 }
    ],
    discount: 0,
    tvaRate: 18,
    status: 'Validé'
  }
];

// Fournisseurs de Démonstration (Sénégal)
const DEFAULT_SUPPLIERS = [
  { id: 'fourn-1', name: 'Sénégal Bureau & Mobilier', email: 'commercial@senbureau.sn', phone: '+221 33 865 12 34', city: 'Dakar', address: 'Zone Industrielle, Km 4 Boulevard du Centenaire', specialty: 'Mobilier de bureau' },
  { id: 'fourn-2', name: 'Africa Tech Distribution (ATD)', email: 'orders@africatech.sn', phone: '+221 77 400 90 90', city: 'Dakar', address: 'Rue de la Faisanderie, Mermoz', specialty: 'Matériel Informatique & Réseaux' },
  { id: 'fourn-3', name: 'Ndar Fournitures SARL', email: 'contact@ndarfournitures.sn', phone: '+221 33 961 44 22', city: 'Saint-Louis', address: 'Quartier Léona', specialty: 'Consommables & Papier' }
];

// Commandes Fournisseurs de Démonstration
const DEFAULT_PURCHASE_ORDERS = [
  {
    id: 'CF-2026-0001',
    supplierId: 'fourn-2',
    date: '2026-06-10T08:30:00Z',
    warehouseId: 'wh-1',
    items: [
      { productId: 'prod-1', quantity: 5, costPrice: 380000 },
      { productId: 'prod-3', quantity: 10, costPrice: 75000 }
    ],
    status: 'Reçu'
  },
  {
    id: 'CF-2026-0002',
    supplierId: 'fourn-1',
    date: '2026-07-01T11:00:00Z',
    warehouseId: 'wh-1',
    items: [
      { productId: 'prod-5', quantity: 15, costPrice: 60000 }
    ],
    status: 'Commandé'
  },
  {
    id: 'CF-2026-0003',
    supplierId: 'fourn-3',
    date: '2026-07-08T15:00:00Z',
    warehouseId: 'wh-1',
    items: [
      { productId: 'prod-7', quantity: 50, costPrice: 14000 }
    ],
    status: 'Brouillon'
  }
];

// Historique des Réceptions (Entrées de stock valorisées)
const DEFAULT_RECEPTIONS = [
  {
    id: 'BR-2026-0001',
    purchaseOrderId: 'CF-2026-0001',
    supplierId: 'fourn-2',
    warehouseId: 'wh-1',
    date: '2026-06-14T14:00:00Z',
    items: [
      { productId: 'prod-1', quantity: 5, costPrice: 380000 },
      { productId: 'prod-3', quantity: 10, costPrice: 75000 }
    ]
  }
];

// Bons de Livraison Clients de Démonstration (Sorties de stock)
const DEFAULT_DELIVERY_NOTES = [
  {
    id: 'BL-2026-0001',
    salesOrderId: 'CC-2026-0002',
    orderId: 'F-2026-0001',
    clientId: 'cli-1',
    warehouseId: 'wh-1',
    date: '2026-06-16T09:00:00Z',
    items: [
      { productId: 'prod-1', quantity: 2 },
      { productId: 'prod-3', quantity: 1 }
    ],
    carrier: 'Flotte Interne Dakar',
    status: 'Livré'
  },
  {
    id: 'BL-2026-0002',
    salesOrderId: '',
    orderId: 'F-2026-0002',
    clientId: 'cli-2',
    warehouseId: 'wh-1',
    date: '2026-06-29T10:30:00Z',
    items: [
      { productId: 'prod-2', quantity: 1 },
      { productId: 'prod-7', quantity: 5 }
    ],
    carrier: 'Dakar Express Transport',
    status: 'Livré'
  },
  {
    id: 'BL-2026-0003',
    salesOrderId: 'CC-2026-0001',
    orderId: '',
    clientId: 'cli-3',
    warehouseId: 'wh-1',
    date: '2026-07-03T11:00:00Z',
    items: [
      { productId: 'prod-6', quantity: 2 }
    ],
    carrier: 'Transporteur Thiès',
    status: 'En transit'
  },
  {
    id: 'BL-2026-0004',
    salesOrderId: '',
    orderId: 'F-2026-0005',
    clientId: 'cli-5',
    warehouseId: 'wh-1',
    date: '2026-07-07T15:30:00Z',
    items: [
      { productId: 'prod-8', quantity: 4 },
      { productId: 'prod-7', quantity: 2 }
    ],
    carrier: 'Chauffeur interne',
    status: 'En préparation'
  }
];

// Grand Livre des Mouvements de Stock (Traçabilité complète)
const DEFAULT_STOCK_MOVES = [
  { id: 'SM-2026-0001', date: '2026-06-14T14:00:00Z', productId: 'prod-1', warehouseId: 'wh-1', qty: 5, unitCost: 380000, moveType: 'reception', refDoc: 'BR-2026-0001' },
  { id: 'SM-2026-0002', date: '2026-06-14T14:00:00Z', productId: 'prod-3', warehouseId: 'wh-1', qty: 10, unitCost: 75000, moveType: 'reception', refDoc: 'BR-2026-0001' },
  { id: 'SM-2026-0003', date: '2026-06-16T09:00:00Z', productId: 'prod-1', warehouseId: 'wh-1', qty: -2, unitCost: 380000, moveType: 'delivery', refDoc: 'BL-2026-0001' },
  { id: 'SM-2026-0004', date: '2026-06-20T11:00:00Z', productId: 'prod-3', warehouseId: 'wh-1', qty: 1, unitCost: 72000, moveType: 'refund_return', refDoc: 'AV-2026-0001' }
];

// Journal de Caisse & Trésorerie (Comptabilité légère)
const DEFAULT_CASH_JOURNAL = [
  { id: 'CJ-2026-0001', date: '2026-06-15T11:00:00Z', type: 'in', label: 'Encaissement Facture F-2026-0001', method: 'Wave', refDoc: 'F-2026-0001', partnerId: 'cli-1', amount: 1144600 },
  { id: 'CJ-2026-0002', date: '2026-06-28T15:00:00Z', type: 'in', label: 'Encaissement Facture F-2026-0002', method: 'Orange Money', refDoc: 'F-2026-0002', partnerId: 'cli-2', amount: 265500 },
  { id: 'CJ-2026-0003', date: '2026-07-07T12:00:00Z', type: 'in', label: 'Encaissement Facture F-2026-0005', method: 'Espèces', refDoc: 'F-2026-0005', partnerId: 'cli-5', amount: 302080 }
];

// Configuration de l'entreprise émettrice pour les documents
const COMPANY_INFO = {
  name: 'FOX GESCOM SÉNÉGAL',
  slogan: 'Solutions de Gestion Commerciale, Stocks & Facturation',
  address: 'Immeuble Horizon, Rue 12 x Boulevard de la République',
  city: 'Dakar, Sénégal',
  phone: '+221 33 824 00 00',
  email: 'contact@fox-gescom.sn',
  website: 'www.fox-gescom.sn',
  ninea: '0068429 2G3',
  rc: 'SN-DKR-2026-B-1284',
  tvaRate: 18,
  isVatSubject: true, // Soumis à la TVA au Sénégal
  invoicingPolicy: 'delivery', // 'delivery' (à la livraison) ou 'order' (à la commande)
  logo: "",
  currency: "FCFA",
  prefixQuote: "D",
  prefixSalesOrder: "CC",
  prefixDelivery: "BL",
  prefixInvoice: "F",
  prefixRefund: "AV",
  prefixPO: "CF",
  prefixReception: "BR"
};
