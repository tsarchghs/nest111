import { createClient } from '@supabase/supabase-js';

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const workspaceSeeds = [
  {
    slug: 'gambit-llc',
    name: 'Gambit LLC',
    industry: 'Hospitality SaaS',
    currencyCode: 'USD',
    timezone: 'Europe/Warsaw',
    branding: {
      brandName: 'Gambit LLC',
      brandTagline: 'Operate every branch with precision.',
      primaryColor: '#a3be8c',
      accentColor: '#81a1c1',
      surfaceColor: '#2e3440',
      loginTitle: 'Every branch. Every table. One gambit ahead.',
      loginMessage:
        'Gambit unifies owner controls, ERP, administration, and POS inside one branded workspace.',
      heroPattern: 'nordic',
    },
    business: {
      legalName: 'Gambit LLC',
      tradingName: 'Gambit',
      email: 'finance@gambit.local',
      phone: '+48 22 100 9999',
      taxRate: 0.08,
      invoicePrefix: 'GAM',
      posServiceCharge: 0.1,
      address: 'Marszalkowska 10, Warsaw',
      locale: 'en-US',
    },
    branches: [
      {
        code: 'HQ',
        name: 'Downtown Flagship',
        managerName: 'Naomi Kerr',
        city: 'Warsaw',
        status: 'active',
        phone: '+48 22 100 1000',
      },
      {
        code: 'OLD',
        name: 'Old Town Cafe',
        managerName: 'Lucas Ford',
        city: 'Warsaw',
        status: 'active',
        phone: '+48 22 100 2000',
      },
    ],
    bankAccounts: [
      {
        bankName: 'Santander',
        accountName: 'Operating Account',
        accountNumberLast4: '4488',
        currencyCode: 'USD',
        status: 'active',
        iban: 'PL10109010140000071219812874',
        swiftCode: 'WBKPPLPP',
      },
      {
        bankName: 'Wise',
        accountName: 'Growth Reserve',
        accountNumberLast4: '9032',
        currencyCode: 'USD',
        status: 'active',
        iban: 'GB12CLRB04066212345678',
        swiftCode: 'TRWIGB2L',
      },
    ],
    categories: [
      { name: 'Coffee', description: 'Signature espresso and brewed coffee', sortOrder: 1 },
      { name: 'Kitchen', description: 'Brunch and all-day plates', sortOrder: 2 },
      { name: 'Pastry', description: 'Fresh pastry and dessert cabinet', sortOrder: 3 },
    ],
    products: [
      {
        categoryName: 'Coffee',
        name: 'Gambit Espresso',
        sku: 'GAM-ESP-01',
        description: 'Short, bold, and built for the morning rush.',
        price: 3.9,
        costPrice: 1.2,
        stockQuantity: 180,
        reorderLevel: 45,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        categoryName: 'Coffee',
        name: 'Nordic Flat White',
        sku: 'GAM-FW-01',
        description: 'Creamy milk texture over double-origin espresso.',
        price: 5.2,
        costPrice: 1.8,
        stockQuantity: 140,
        reorderLevel: 35,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/6802983/pexels-photo-6802983.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        categoryName: 'Kitchen',
        name: 'Operations Breakfast',
        sku: 'GAM-BRK-01',
        description: 'Eggs, roasted tomato, sourdough, and citrus greens.',
        price: 13.5,
        costPrice: 4.7,
        stockQuantity: 48,
        reorderLevel: 14,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        categoryName: 'Pastry',
        name: 'Glass Case Croissant',
        sku: 'GAM-CRS-01',
        description: 'Layered butter croissant finished with sea salt.',
        price: 4.4,
        costPrice: 1.1,
        stockQuantity: 72,
        reorderLevel: 18,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/2135677/pexels-photo-2135677.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ],
    tables: [
      { tableNumber: 'G-01', capacity: 2, status: 'available', currentGuests: 0, zone: 'Window', displayOrder: 1 },
      { tableNumber: 'G-02', capacity: 4, status: 'occupied', currentGuests: 3, zone: 'Main Floor', displayOrder: 2 },
      { tableNumber: 'G-03', capacity: 4, status: 'available', currentGuests: 0, zone: 'Main Floor', displayOrder: 3 },
      { tableNumber: 'G-04', capacity: 6, status: 'reserved', currentGuests: 0, zone: 'Terrace', displayOrder: 4 },
    ],
    invoices: [
      {
        invoiceNumber: 'GAM-2026-0001',
        customerName: 'Acme Hospitality',
        customerEmail: 'ops@acme.local',
        status: 'paid',
        dueDateOffsetDays: -12,
        notes: 'Launch-week pantry refill',
        items: [{ sku: 'GAM-ESP-01', quantity: 24 }, { sku: 'GAM-CRS-01', quantity: 18 }],
      },
      {
        invoiceNumber: 'GAM-2026-0002',
        customerName: 'North Quarter Studio',
        customerEmail: 'finance@nqs.local',
        status: 'sent',
        dueDateOffsetDays: 7,
        notes: 'Catering and coffee service retainer',
        items: [{ sku: 'GAM-FW-01', quantity: 12 }, { sku: 'GAM-BRK-01', quantity: 10 }],
      },
    ],
    users: [
      { email: 'owner@nexus.local', password: 'Passw0rd!', fullName: 'Avery Stone', role: 'owner' },
      { email: 'erp@nexus.local', password: 'Passw0rd!', fullName: 'Jordan Price', role: 'erp' },
      { email: 'admin@nexus.local', password: 'Passw0rd!', fullName: 'Morgan Hale', role: 'admin' },
      { email: 'pos@nexus.local', password: 'Passw0rd!', fullName: 'Riley Brooks', role: 'pos' },
    ],
  },
  {
    slug: 'northwind-bistro',
    name: 'Northwind Bistro Group',
    industry: 'Restaurant Group',
    currencyCode: 'USD',
    timezone: 'America/New_York',
    branding: {
      brandName: 'Northwind Bistro',
      brandTagline: 'Warm dining rooms, sharp operating rhythm.',
      primaryColor: '#d97706',
      accentColor: '#fb7185',
      surfaceColor: '#3b2218',
      loginTitle: 'Run service with heat, polish, and zero chaos.',
      loginMessage:
        'Northwind uses the same platform core with a completely different brand feel, from login to owner studio.',
      heroPattern: 'aurora',
    },
    business: {
      legalName: 'Northwind Bistro Group Inc.',
      tradingName: 'Northwind Bistro',
      email: 'finance@northwind.local',
      phone: '+1 212 555 1800',
      taxRate: 0.0875,
      invoicePrefix: 'NWB',
      posServiceCharge: 0.12,
      address: '18 Hudson Street, New York, NY',
      locale: 'en-US',
    },
    branches: [
      {
        code: 'SOHO',
        name: 'SoHo Dining Room',
        managerName: 'Helena Park',
        city: 'New York',
        status: 'active',
        phone: '+1 212 555 1810',
      },
      {
        code: 'BK',
        name: 'Brooklyn Garden',
        managerName: 'Marco Bell',
        city: 'Brooklyn',
        status: 'active',
        phone: '+1 212 555 1820',
      },
    ],
    bankAccounts: [
      {
        bankName: 'Chase',
        accountName: 'Restaurant Ops',
        accountNumberLast4: '6712',
        currencyCode: 'USD',
        status: 'active',
        iban: 'US00CHASE00006712',
        swiftCode: 'CHASUS33',
      },
    ],
    categories: [
      { name: 'Dinner', description: 'Main dining plates and signature dishes', sortOrder: 1 },
      { name: 'Wine', description: 'Bottle and glass pours', sortOrder: 2 },
      { name: 'Dessert', description: 'Dessert menu and after-dinner sweets', sortOrder: 3 },
    ],
    products: [
      {
        categoryName: 'Dinner',
        name: 'Braised Short Rib',
        sku: 'NWB-DIN-01',
        description: 'Red wine jus, root vegetables, and whipped potato.',
        price: 28,
        costPrice: 11.4,
        stockQuantity: 52,
        reorderLevel: 14,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        categoryName: 'Wine',
        name: 'House Orange Wine',
        sku: 'NWB-WIN-01',
        description: 'By-the-glass pour with stone fruit and tea notes.',
        price: 14,
        costPrice: 4.6,
        stockQuantity: 86,
        reorderLevel: 20,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/2912108/pexels-photo-2912108.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        categoryName: 'Dessert',
        name: 'Burnt Honey Tart',
        sku: 'NWB-DES-01',
        description: 'Dark honey custard, sea salt, and citrus cream.',
        price: 11,
        costPrice: 3.3,
        stockQuantity: 34,
        reorderLevel: 10,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ],
    tables: [
      { tableNumber: 'NW-01', capacity: 2, status: 'available', currentGuests: 0, zone: 'Bar Rail', displayOrder: 1 },
      { tableNumber: 'NW-02', capacity: 4, status: 'occupied', currentGuests: 4, zone: 'Main Room', displayOrder: 2 },
      { tableNumber: 'NW-03', capacity: 6, status: 'available', currentGuests: 0, zone: 'Garden', displayOrder: 3 },
    ],
    invoices: [
      {
        invoiceNumber: 'NWB-2026-0001',
        customerName: 'Eventive Studios',
        customerEmail: 'books@eventive.local',
        status: 'paid',
        dueDateOffsetDays: -4,
        notes: 'Private dining buyout deposit',
        items: [{ sku: 'NWB-DIN-01', quantity: 8 }, { sku: 'NWB-WIN-01', quantity: 16 }],
      },
    ],
    users: [
      { email: 'owner@northwind.local', password: 'Passw0rd!', fullName: 'Helena Park', role: 'owner' },
      { email: 'erp@northwind.local', password: 'Passw0rd!', fullName: 'Samir Lowe', role: 'erp' },
      { email: 'admin@northwind.local', password: 'Passw0rd!', fullName: 'Daria Bell', role: 'admin' },
      { email: 'pos@northwind.local', password: 'Passw0rd!', fullName: 'Owen Hart', role: 'pos' },
    ],
  },
  {
    slug: 'harbor-roasters',
    name: 'Harbor Roasters Co.',
    industry: 'Specialty Coffee',
    currencyCode: 'USD',
    timezone: 'America/Los_Angeles',
    branding: {
      brandName: 'Harbor Roasters',
      brandTagline: 'Coastal energy with a production-grade back office.',
      primaryColor: '#0f766e',
      accentColor: '#f59e0b',
      surfaceColor: '#12343b',
      loginTitle: 'See how one SaaS stack bends to a different brand.',
      loginMessage:
        'Harbor keeps the same owner, ERP, admin, and POS flows while shifting the visual identity toward a faster coastal coffee brand.',
      heroPattern: 'grid',
    },
    business: {
      legalName: 'Harbor Roasters Co.',
      tradingName: 'Harbor Roasters',
      email: 'hello@harbor.local',
      phone: '+1 415 555 2600',
      taxRate: 0.0925,
      invoicePrefix: 'HBR',
      posServiceCharge: 0.09,
      address: '88 Mission Pier, San Francisco, CA',
      locale: 'en-US',
    },
    branches: [
      {
        code: 'PIER',
        name: 'Pier Lab',
        managerName: 'Mina Shah',
        city: 'San Francisco',
        status: 'active',
        phone: '+1 415 555 2610',
      },
      {
        code: 'MAR',
        name: 'Marina Bar',
        managerName: 'Theo Grant',
        city: 'San Francisco',
        status: 'active',
        phone: '+1 415 555 2620',
      },
    ],
    bankAccounts: [
      {
        bankName: 'Wells Fargo',
        accountName: 'Retail Beans',
        accountNumberLast4: '1844',
        currencyCode: 'USD',
        status: 'active',
        iban: 'US00WF00001844',
        swiftCode: 'WFBIUS6S',
      },
    ],
    categories: [
      { name: 'Brew Bar', description: 'Filter, espresso, and cold line', sortOrder: 1 },
      { name: 'Retail', description: 'Beans, filters, and gear', sortOrder: 2 },
      { name: 'Bakery', description: 'Grab-and-go pastry case', sortOrder: 3 },
    ],
    products: [
      {
        categoryName: 'Brew Bar',
        name: 'Pier Pour Over',
        sku: 'HBR-BRW-01',
        description: 'Washed single-origin with citrus finish.',
        price: 6.5,
        costPrice: 2.1,
        stockQuantity: 96,
        reorderLevel: 28,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/4109743/pexels-photo-4109743.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        categoryName: 'Retail',
        name: 'House Beans 1kg',
        sku: 'HBR-RTL-01',
        description: 'Mainline espresso blend for wholesale and home.',
        price: 24,
        costPrice: 10.5,
        stockQuantity: 62,
        reorderLevel: 18,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        categoryName: 'Bakery',
        name: 'Sea Salt Cookie',
        sku: 'HBR-BKY-01',
        description: 'Dark chocolate cookie with smoked sea salt.',
        price: 4.8,
        costPrice: 1.4,
        stockQuantity: 70,
        reorderLevel: 20,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ],
    tables: [
      { tableNumber: 'HB-01', capacity: 2, status: 'available', currentGuests: 0, zone: 'Brew Bar', displayOrder: 1 },
      { tableNumber: 'HB-02', capacity: 2, status: 'available', currentGuests: 0, zone: 'Window', displayOrder: 2 },
      { tableNumber: 'HB-03', capacity: 4, status: 'occupied', currentGuests: 2, zone: 'Patio', displayOrder: 3 },
    ],
    invoices: [
      {
        invoiceNumber: 'HBR-2026-0001',
        customerName: 'Dockside Agency',
        customerEmail: 'payables@dockside.local',
        status: 'sent',
        dueDateOffsetDays: 9,
        notes: 'Monthly wholesale beans agreement',
        items: [{ sku: 'HBR-RTL-01', quantity: 14 }, { sku: 'HBR-BRW-01', quantity: 20 }],
      },
    ],
    users: [
      { email: 'owner@harbor.local', password: 'Passw0rd!', fullName: 'Mina Shah', role: 'owner' },
      { email: 'erp@harbor.local', password: 'Passw0rd!', fullName: 'Theo Grant', role: 'erp' },
      { email: 'admin@harbor.local', password: 'Passw0rd!', fullName: 'Lena Frost', role: 'admin' },
      { email: 'pos@harbor.local', password: 'Passw0rd!', fullName: 'Piper Wynn', role: 'pos' },
    ],
  },
  {
    slug: 'aster-lounge',
    name: 'Aster Lounge Holdings',
    industry: 'Hotel Lounge',
    currencyCode: 'EUR',
    timezone: 'Europe/Paris',
    branding: {
      brandName: 'Aster Lounge',
      brandTagline: 'Luxury service on top of the same operating core.',
      primaryColor: '#3b82f6',
      accentColor: '#f4c95d',
      surfaceColor: '#1f2937',
      loginTitle: 'Premium hospitality, same product foundation.',
      loginMessage:
        'Aster proves the platform can flex into a polished lounge brand without changing the ERP, administration, or POS behaviors underneath.',
      heroPattern: 'monolith',
    },
    business: {
      legalName: 'Aster Lounge Holdings SARL',
      tradingName: 'Aster Lounge',
      email: 'finance@aster.local',
      phone: '+33 1 88 55 3300',
      taxRate: 0.1,
      invoicePrefix: 'AST',
      posServiceCharge: 0.13,
      address: '14 Rue Royale, Paris',
      locale: 'fr-FR',
    },
    branches: [
      {
        code: 'PAR',
        name: 'Paris Lobby Lounge',
        managerName: 'Seline Laurent',
        city: 'Paris',
        status: 'active',
        phone: '+33 1 88 55 3310',
      },
      {
        code: 'NCE',
        name: 'Nice Terrace Lounge',
        managerName: 'Armand Voss',
        city: 'Nice',
        status: 'active',
        phone: '+33 1 88 55 3320',
      },
    ],
    bankAccounts: [
      {
        bankName: 'BNP Paribas',
        accountName: 'Hospitality Operations',
        accountNumberLast4: '2084',
        currencyCode: 'EUR',
        status: 'active',
        iban: 'FR7630006000011234567890189',
        swiftCode: 'BNPAFRPP',
      },
    ],
    categories: [
      { name: 'Cocktails', description: 'Signature and classic cocktail program', sortOrder: 1 },
      { name: 'Small Plates', description: 'Lounge bites and premium snacks', sortOrder: 2 },
      { name: 'Wine Cellar', description: 'Curated reserve pours', sortOrder: 3 },
    ],
    products: [
      {
        categoryName: 'Cocktails',
        name: 'Blue Hour Martini',
        sku: 'AST-CKT-01',
        description: 'Gin, dry vermouth, citrus oil, and floral saline.',
        price: 18,
        costPrice: 5.8,
        stockQuantity: 90,
        reorderLevel: 22,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/5379706/pexels-photo-5379706.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        categoryName: 'Small Plates',
        name: 'Royal Truffle Fries',
        sku: 'AST-PLT-01',
        description: 'Thin-cut fries, parmesan, herbs, and truffle glaze.',
        price: 13,
        costPrice: 3.9,
        stockQuantity: 58,
        reorderLevel: 18,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        categoryName: 'Wine Cellar',
        name: 'Reserve Champagne Glass',
        sku: 'AST-WIN-01',
        description: 'Prestige cuvee by the glass for lounge service.',
        price: 24,
        costPrice: 8.2,
        stockQuantity: 44,
        reorderLevel: 12,
        status: 'active',
        imageUrl:
          'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ],
    tables: [
      { tableNumber: 'AS-01', capacity: 2, status: 'available', currentGuests: 0, zone: 'Lobby', displayOrder: 1 },
      { tableNumber: 'AS-02', capacity: 4, status: 'occupied', currentGuests: 2, zone: 'Grand Salon', displayOrder: 2 },
      { tableNumber: 'AS-03', capacity: 6, status: 'available', currentGuests: 0, zone: 'Terrace', displayOrder: 3 },
    ],
    invoices: [
      {
        invoiceNumber: 'AST-2026-0001',
        customerName: 'Maison Delacroix',
        customerEmail: 'events@delacroix.local',
        status: 'overdue',
        dueDateOffsetDays: -2,
        notes: 'Private lounge reservation and cellar package',
        items: [{ sku: 'AST-WIN-01', quantity: 10 }, { sku: 'AST-PLT-01', quantity: 14 }],
      },
    ],
    users: [
      { email: 'owner@aster.local', password: 'Passw0rd!', fullName: 'Seline Laurent', role: 'owner' },
      { email: 'erp@aster.local', password: 'Passw0rd!', fullName: 'Armand Voss', role: 'erp' },
      { email: 'admin@aster.local', password: 'Passw0rd!', fullName: 'Camille Artois', role: 'admin' },
      { email: 'pos@aster.local', password: 'Passw0rd!', fullName: 'Julien Marek', role: 'pos' },
    ],
  },
];

const roleOrder = ['owner', 'erp', 'admin', 'pos'];

const listUsers = async () => {
  const allUsers = [];
  let page = 1;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    allUsers.push(...data.users);

    if (data.users.length < 200) {
      return allUsers;
    }

    page += 1;
  }
};

const existingUsers = await listUsers();

function addDays(days) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

async function ensureWorkspace(seed) {
  const payload = {
    name: seed.name,
    slug: seed.slug,
    industry: seed.industry,
    primary_color: seed.branding.primaryColor,
    accent_color: seed.branding.accentColor,
    surface_color: seed.branding.surfaceColor,
    brand_name: seed.branding.brandName,
    brand_tagline: seed.branding.brandTagline,
    login_title: seed.branding.loginTitle,
    login_message: seed.branding.loginMessage,
    hero_pattern: seed.branding.heroPattern,
    currency_code: seed.currencyCode,
    timezone: seed.timezone,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('workspaces')
    .upsert(payload, { onConflict: 'slug' })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to upsert workspace ${seed.slug}: ${error?.message ?? 'unknown error'}`);
  }

  return data;
}

async function ensureBusinessSettings(workspace, seed) {
  const payload = {
    workspace_id: workspace.id,
    legal_name: seed.business.legalName,
    trading_name: seed.business.tradingName,
    email: seed.business.email,
    phone: seed.business.phone,
    tax_rate: seed.business.taxRate,
    invoice_prefix: seed.business.invoicePrefix,
    pos_service_charge: seed.business.posServiceCharge,
    address: seed.business.address,
    locale: seed.business.locale,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('business_settings')
    .upsert(payload, { onConflict: 'workspace_id' });

  if (error) {
    throw new Error(`Failed to upsert business settings for ${seed.slug}: ${error.message}`);
  }
}

async function ensureBranches(workspace, seed) {
  const branchPayload = seed.branches.map((branch) => ({
    workspace_id: workspace.id,
    code: branch.code,
    name: branch.name,
    manager_name: branch.managerName,
    city: branch.city,
    status: branch.status,
    phone: branch.phone,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('branches')
    .upsert(branchPayload, { onConflict: 'workspace_id,code' });

  if (error) {
    throw new Error(`Failed to upsert branches for ${seed.slug}: ${error.message}`);
  }

  const { data, error: fetchError } = await supabase
    .from('branches')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('code', { ascending: true });

  if (fetchError) {
    throw new Error(`Failed to fetch branches for ${seed.slug}: ${fetchError.message}`);
  }

  return data ?? [];
}

async function ensureBankAccounts(workspace, branch, seed) {
  for (const account of seed.bankAccounts) {
    const { data: existing, error: selectError } = await supabase
      .from('bank_accounts')
      .select('id')
      .eq('workspace_id', workspace.id)
      .eq('bank_name', account.bankName)
      .eq('account_name', account.accountName)
      .limit(1);

    if (selectError) {
      throw new Error(`Failed to check bank account for ${seed.slug}: ${selectError.message}`);
    }

    const payload = {
      workspace_id: workspace.id,
      branch_id: branch.id,
      bank_name: account.bankName,
      account_name: account.accountName,
      account_number_last4: account.accountNumberLast4,
      currency_code: account.currencyCode,
      status: account.status,
      iban: account.iban,
      swift_code: account.swiftCode,
      updated_at: new Date().toISOString(),
    };

    if (existing?.length) {
      const { error } = await supabase
        .from('bank_accounts')
        .update(payload)
        .eq('id', existing[0].id);

      if (error) {
        throw new Error(`Failed to update bank account for ${seed.slug}: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('bank_accounts').insert(payload);
      if (error) {
        throw new Error(`Failed to insert bank account for ${seed.slug}: ${error.message}`);
      }
    }
  }
}

async function ensureCategories(workspace, seed) {
  const map = new Map();

  for (const category of seed.categories) {
    const payload = {
      workspace_id: workspace.id,
      name: category.name,
      description: category.description,
      sort_order: category.sortOrder,
      active: true,
      updated_at: new Date().toISOString(),
    };

    const { data: existing, error: selectError } = await supabase
      .from('categories')
      .select('id')
      .eq('workspace_id', workspace.id)
      .eq('name', category.name)
      .limit(1);

    if (selectError) {
      throw new Error(`Failed to check category ${category.name}: ${selectError.message}`);
    }

    if (existing?.length) {
      const { error } = await supabase.from('categories').update(payload).eq('id', existing[0].id);
      if (error) {
        throw new Error(`Failed to update category ${category.name}: ${error.message}`);
      }
      map.set(category.name, existing[0].id);
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert(payload)
        .select('id')
        .single();

      if (error || !data) {
        throw new Error(`Failed to insert category ${category.name}: ${error?.message ?? 'unknown error'}`);
      }
      map.set(category.name, data.id);
    }
  }

  return map;
}

async function ensureProducts(workspace, seed, categoryIds) {
  const map = new Map();

  for (const product of seed.products) {
    const payload = {
      workspace_id: workspace.id,
      category_id: categoryIds.get(product.categoryName),
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: product.price,
      cost_price: product.costPrice,
      stock_quantity: product.stockQuantity,
      reorder_level: product.reorderLevel,
      status: product.status,
      image_url: product.imageUrl,
      active: true,
      updated_at: new Date().toISOString(),
    };

    const { data: existing, error: selectError } = await supabase
      .from('products')
      .select('id')
      .eq('workspace_id', workspace.id)
      .eq('sku', product.sku)
      .limit(1);

    if (selectError) {
      throw new Error(`Failed to check product ${product.sku}: ${selectError.message}`);
    }

    if (existing?.length) {
      const { error } = await supabase.from('products').update(payload).eq('id', existing[0].id);
      if (error) {
        throw new Error(`Failed to update product ${product.sku}: ${error.message}`);
      }
      map.set(product.sku, { id: existing[0].id, ...payload });
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select('id')
        .single();

      if (error || !data) {
        throw new Error(`Failed to insert product ${product.sku}: ${error?.message ?? 'unknown error'}`);
      }
      map.set(product.sku, { id: data.id, ...payload });
    }
  }

  return map;
}

async function ensureTables(workspace, branch, seed) {
  for (const table of seed.tables) {
    const payload = {
      workspace_id: workspace.id,
      branch_id: branch.id,
      table_number: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      current_guests: table.currentGuests,
      zone: table.zone,
      display_order: table.displayOrder,
      updated_at: new Date().toISOString(),
    };

    const { data: existing, error: selectError } = await supabase
      .from('tables')
      .select('id')
      .eq('table_number', table.tableNumber)
      .limit(1);

    if (selectError) {
      throw new Error(`Failed to check table ${table.tableNumber}: ${selectError.message}`);
    }

    if (existing?.length) {
      const { error } = await supabase.from('tables').update(payload).eq('id', existing[0].id);
      if (error) {
        throw new Error(`Failed to update table ${table.tableNumber}: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('tables').insert(payload);
      if (error) {
        throw new Error(`Failed to insert table ${table.tableNumber}: ${error.message}`);
      }
    }
  }
}

async function ensureInvoices(workspace, branch, seed, productsBySku) {
  for (const invoice of seed.invoices) {
    const subtotal = invoice.items.reduce((sum, item) => {
      const product = productsBySku.get(item.sku);
      return sum + Number(product.price) * Number(item.quantity);
    }, 0);
    const taxAmount = subtotal * seed.business.taxRate;
    const totalAmount = subtotal + taxAmount;

    const payload = {
      workspace_id: workspace.id,
      branch_id: branch.id,
      invoice_number: invoice.invoiceNumber,
      customer_name: invoice.customerName,
      customer_email: invoice.customerEmail,
      status: invoice.status,
      due_date: addDays(invoice.dueDateOffsetDays),
      notes: invoice.notes,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      updated_at: new Date().toISOString(),
    };

    const { data: existing, error: selectError } = await supabase
      .from('sales_invoices')
      .select('id')
      .eq('invoice_number', invoice.invoiceNumber)
      .limit(1);

    if (selectError) {
      throw new Error(`Failed to check invoice ${invoice.invoiceNumber}: ${selectError.message}`);
    }

    let invoiceId = existing?.[0]?.id;
    if (invoiceId) {
      const { error } = await supabase.from('sales_invoices').update(payload).eq('id', invoiceId);
      if (error) {
        throw new Error(`Failed to update invoice ${invoice.invoiceNumber}: ${error.message}`);
      }
    } else {
      const { data, error } = await supabase
        .from('sales_invoices')
        .insert(payload)
        .select('id')
        .single();

      if (error || !data) {
        throw new Error(`Failed to insert invoice ${invoice.invoiceNumber}: ${error?.message ?? 'unknown error'}`);
      }
      invoiceId = data.id;
    }

    const { error: deleteError } = await supabase
      .from('sales_invoice_items')
      .delete()
      .eq('invoice_id', invoiceId);

    if (deleteError) {
      throw new Error(`Failed to reset invoice items for ${invoice.invoiceNumber}: ${deleteError.message}`);
    }

    const invoiceItems = invoice.items.map((item) => {
      const product = productsBySku.get(item.sku);
      return {
        invoice_id: invoiceId,
        product_id: product.id,
        description: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        line_total: Number(product.price) * Number(item.quantity),
      };
    });

    const { error: itemError } = await supabase.from('sales_invoice_items').insert(invoiceItems);
    if (itemError) {
      throw new Error(`Failed to seed invoice items for ${invoice.invoiceNumber}: ${itemError.message}`);
    }
  }
}

async function ensureUser(userSeed, workspaceId, branchId) {
  const existing = existingUsers.find((entry) => entry.email === userSeed.email);
  const { data: created, error: createError } = existing
    ? { data: { user: existing }, error: null }
    : await supabase.auth.admin.createUser({
        email: userSeed.email,
        password: userSeed.password,
        email_confirm: true,
        user_metadata: {
          full_name: userSeed.fullName,
        },
      });

  if (createError && !createError.message.toLowerCase().includes('already been registered')) {
    throw createError;
  }

  const userId = created?.user?.id;
  if (!userId) {
    throw new Error(`Unable to resolve user id for ${userSeed.email}`);
  }

  if (!existing) {
    existingUsers.push(created.user);
  }

  const { error: profileError } = await supabase.from('user_profiles').upsert(
    {
      id: userId,
      email: userSeed.email,
      full_name: userSeed.fullName,
    },
    { onConflict: 'id' },
  );

  if (profileError) {
    throw profileError;
  }

  const { error: membershipError } = await supabase
    .from('workspace_memberships')
    .upsert(
      {
        workspace_id: workspaceId,
        user_id: userId,
        branch_id: branchId,
        role: userSeed.role,
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'workspace_id,user_id' },
    );

  if (membershipError) {
    throw membershipError;
  }
}

for (const seed of workspaceSeeds) {
  const workspace = await ensureWorkspace(seed);
  await ensureBusinessSettings(workspace, seed);
  const branches = await ensureBranches(workspace, seed);
  const primaryBranch = branches[0];

  if (!primaryBranch) {
    throw new Error(`Workspace ${seed.slug} requires at least one branch`);
  }

  await ensureBankAccounts(workspace, primaryBranch, seed);
  const categoryIds = await ensureCategories(workspace, seed);
  const productsBySku = await ensureProducts(workspace, seed, categoryIds);
  await ensureTables(workspace, primaryBranch, seed);
  await ensureInvoices(workspace, primaryBranch, seed, productsBySku);

  const sortedUsers = [...seed.users].sort(
    (left, right) => roleOrder.indexOf(left.role) - roleOrder.indexOf(right.role),
  );

  for (const user of sortedUsers) {
    await ensureUser(user, workspace.id, primaryBranch.id);
  }
}

console.log('Seeded multi-brand SaaS demo data for:');
for (const seed of workspaceSeeds) {
  console.log(`- ${seed.branding.brandName} (${seed.slug})`);
}
