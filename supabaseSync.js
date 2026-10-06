// ==============================================================================
// FOX GESCOM - SUPABASE CLIENT & CLOUD SYNC MODULE
// ==============================================================================

const SUPABASE_STORAGE_KEY = 'fox_supabase_config';

// Configuration locale Supabase
let supabaseConfig = {
  url: '',
  anonKey: '',
  syncEnabled: false
};

let supabaseClient = null;
let isSyncing = false;

// Initialiser la configuration depuis le localStorage
function initSupabase() {
  try {
    const saved = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (saved) {
      supabaseConfig = { ...supabaseConfig, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Erreur chargement config Supabase:', e);
  }

  createSupabaseClientInstance();
  updateCloudStatusBadge();
}

// Instancier le client Supabase officiel si les credentials sont renseignés
function createSupabaseClientInstance() {
  if (supabaseConfig.url && supabaseConfig.anonKey && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
      console.log('✅ Client Supabase initialisé');
      return true;
    } catch (e) {
      console.error('Erreur instanciation Supabase:', e);
      supabaseClient = null;
      return false;
    }
  }
  supabaseClient = null;
  return false;
}

// Sauvegarder la configuration Supabase
function saveSupabaseConfig(url, anonKey, syncEnabled) {
  supabaseConfig.url = (url || '').trim();
  supabaseConfig.anonKey = (anonKey || '').trim();
  supabaseConfig.syncEnabled = !!syncEnabled;

  localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(supabaseConfig));
  const initialized = createSupabaseClientInstance();
  updateCloudStatusBadge();

  if (initialized && supabaseConfig.syncEnabled) {
    pullAllFromSupabase();
  }
}

// Mettre à jour l'indicateur visuel dans l'en-tête
function updateCloudStatusBadge() {
  const badge = document.getElementById('cloud-sync-badge');
  const text = document.getElementById('cloud-sync-text');
  if (!badge || !text) return;

  if (supabaseClient && supabaseConfig.syncEnabled) {
    badge.style.display = 'inline-flex';
    badge.className = 'date-badge cloud-online';
    badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    badge.style.color = 'var(--success)';
    text.textContent = 'Supabase Connecté';
    badge.title = 'Synchronisation Supabase Cloud active';
  } else if (supabaseConfig.url) {
    badge.style.display = 'inline-flex';
    badge.className = 'date-badge cloud-offline';
    badge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    badge.style.color = 'var(--warning)';
    text.textContent = 'Supabase Pause';
    badge.title = 'Synchronisation désactivée';
  } else {
    badge.style.display = 'inline-flex';
    badge.className = 'date-badge cloud-offline';
    badge.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    badge.style.color = 'var(--fox-muted)';
    text.textContent = 'Mode Local';
    badge.title = 'Aucun projet Supabase configuré (Stockage local)';
  }
  if (window.lucide) lucide.createIcons();
}

// Test de connexion à Supabase
async function testSupabaseConnection(url, key) {
  if (!window.supabase) {
    throw new Error('La bibliothèque Supabase JS n\'a pas pu être chargée.');
  }
  const testClient = window.supabase.createClient(url, key);
  const { data, error } = await testClient.from('company_info').select('id').limit(1);
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return true;
}

// Push d'une entité vers Supabase (sauvegarde asynchrone transparente)
async function pushEntityToSupabase(entityName, data) {
  if (!supabaseClient || !supabaseConfig.syncEnabled) return;

  try {
    switch (entityName) {
      case 'products':
        if (Array.isArray(data)) {
          const payload = data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            cost_price: p.costPrice || 0,
            stock: p.stock,
            min_stock: p.minStock || 5,
            updated_at: new Date().toISOString()
          }));
          await supabaseClient.from('products').upsert(payload);
        }
        break;

      case 'clients':
        if (Array.isArray(data)) {
          const payload = data.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email || '',
            phone: c.phone || '',
            city: c.city || '',
            address: c.address || '',
            updated_at: new Date().toISOString()
          }));
          await supabaseClient.from('clients').upsert(payload);
        }
        break;

      case 'suppliers':
        if (Array.isArray(data)) {
          const payload = data.map(s => ({
            id: s.id,
            name: s.name,
            specialty: s.specialty || '',
            email: s.email || '',
            phone: s.phone || '',
            city: s.city || '',
            address: s.address || '',
            updated_at: new Date().toISOString()
          }));
          await supabaseClient.from('suppliers').upsert(payload);
        }
        break;

      case 'orders':
        if (Array.isArray(data)) {
          const payload = data.map(o => ({
            id: o.id,
            client_id: o.clientId,
            date: o.date,
            status: o.status,
            items: o.items || [],
            discount: o.discount || 0,
            tva_rate: o.tvaRate !== undefined ? o.tvaRate : 18,
            paid_amount: o.paidAmount || 0,
            payments: o.payments || [],
            updated_at: new Date().toISOString()
          }));
          await supabaseClient.from('orders').upsert(payload);
        }
        break;

      case 'quotes':
        if (Array.isArray(data)) {
          const payload = data.map(q => ({
            id: q.id,
            client_id: q.clientId,
            date: q.date,
            status: q.status,
            items: q.items || [],
            discount: q.discount || 0,
            tva_rate: q.tvaRate !== undefined ? q.tvaRate : 18,
            updated_at: new Date().toISOString()
          }));
          await supabaseClient.from('quotes').upsert(payload);
        }
        break;

      case 'purchaseOrders':
        if (Array.isArray(data)) {
          const payload = data.map(po => ({
            id: po.id,
            supplier_id: po.supplierId,
            date: po.date,
            status: po.status,
            items: po.items || [],
            updated_at: new Date().toISOString()
          }));
          await supabaseClient.from('purchase_orders').upsert(payload);
        }
        break;

      case 'receptions':
        if (Array.isArray(data)) {
          const payload = data.map(r => ({
            id: r.id,
            purchase_order_id: r.purchaseOrderId,
            supplier_id: r.supplierId,
            date: r.date,
            items: r.items || []
          }));
          await supabaseClient.from('receptions').upsert(payload);
        }
        break;

      case 'deliveryNotes':
        if (Array.isArray(data)) {
          const payload = data.map(d => ({
            id: d.id,
            order_id: d.orderId,
            client_id: d.clientId,
            date: d.date,
            status: d.status,
            updated_at: new Date().toISOString()
          }));
          await supabaseClient.from('delivery_notes').upsert(payload);
        }
        break;

      case 'companyInfo':
        if (data) {
          const payload = {
            id: 'current',
            name: data.name,
            slogan: data.slogan,
            phone: data.phone,
            email: data.email,
            website: data.website || '',
            city: data.city,
            address: data.address,
            ninea: data.ninea,
            rc: data.rc,
            is_vat_subject: data.isVatSubject !== undefined ? data.isVatSubject : true,
            vat_rate: data.vatRate || 18,
            currency: data.currency || 'FCFA',
            prefix_invoice: data.prefixInvoice || 'F',
            prefix_quote: data.prefixQuote || 'D',
            prefix_delivery: data.prefixDelivery || 'BL',
            prefix_po: data.prefixPO || 'CF',
            prefix_reception: data.prefixReception || 'BR',
            logo: data.logo || '',
            updated_at: new Date().toISOString()
          };
          await supabaseClient.from('company_info').upsert(payload);
        }
        break;
    }
  } catch (err) {
    console.warn(Erreur sync Supabase ():, err);
  }
}

// Récupération complète des données du Cloud vers le Local (Pull)
async function pullAllFromSupabase() {
  if (!supabaseClient || !supabaseConfig.syncEnabled || isSyncing) return;
  isSyncing = true;

  try {
    showToast('Synchronisation avec Supabase Cloud en cours...', 'info');

    // 1. Company Info
    const { data: compData } = await supabaseClient.from('company_info').select('*').eq('id', 'current').single();
    if (compData) {
      state.companyInfo = {
        name: compData.name,
        slogan: compData.slogan,
        phone: compData.phone,
        email: compData.email,
        website: compData.website,
        city: compData.city,
        address: compData.address,
        ninea: compData.ninea,
        rc: compData.rc,
        isVatSubject: compData.is_vat_subject,
        vatRate: Number(compData.vat_rate || 18),
        currency: compData.currency || 'FCFA',
        prefixInvoice: compData.prefix_invoice || 'F',
        prefixQuote: compData.prefix_quote || 'D',
        prefixDelivery: compData.prefix_delivery || 'BL',
        prefixPO: compData.prefix_po || 'CF',
        prefixReception: compData.prefix_reception || 'BR',
        logo: compData.logo || ''
      };
      localStorage.setItem('fox_company_info', JSON.stringify(state.companyInfo));
      renderSidebarLogo();
    }

    // 2. Products
    const { data: prodData } = await supabaseClient.from('products').select('*');
    if (prodData && prodData.length > 0) {
      state.products = prodData.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        costPrice: Number(p.cost_price || 0),
        stock: Number(p.stock),
        minStock: Number(p.min_stock || 5)
      }));
      localStorage.setItem('fox_products', JSON.stringify(state.products));
    }

    // 3. Clients
    const { data: cliData } = await supabaseClient.from('clients').select('*');
    if (cliData && cliData.length > 0) {
      state.clients = cliData.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        city: c.city || '',
        address: c.address || ''
      }));
      localStorage.setItem('fox_clients', JSON.stringify(state.clients));
    }

    // 4. Fournisseurs
    const { data: supData } = await supabaseClient.from('suppliers').select('*');
    if (supData && supData.length > 0) {
      state.suppliers = supData.map(s => ({
        id: s.id,
        name: s.name,
        specialty: s.specialty || '',
        email: s.email || '',
        phone: s.phone || '',
        city: s.city || '',
        address: s.address || ''
      }));
      localStorage.setItem('fox_suppliers', JSON.stringify(state.suppliers));
    }

    // 5. Orders (Factures)
    const { data: ordData } = await supabaseClient.from('orders').select('*');
    if (ordData && ordData.length > 0) {
      state.orders = ordData.map(o => ({
        id: o.id,
        clientId: o.client_id,
        date: o.date,
        status: o.status,
        items: o.items || [],
        discount: Number(o.discount || 0),
        tvaRate: Number(o.tva_rate !== undefined ? o.tva_rate : 18),
        paidAmount: Number(o.paid_amount || 0),
        payments: o.payments || []
      }));
      localStorage.setItem('fox_orders', JSON.stringify(state.orders));
    }

    // 6. Quotes (Devis)
    const { data: quoteData } = await supabaseClient.from('quotes').select('*');
    if (quoteData && quoteData.length > 0) {
      state.quotes = quoteData.map(q => ({
        id: q.id,
        clientId: q.client_id,
        date: q.date,
        status: q.status,
        items: q.items || [],
        discount: Number(q.discount || 0),
        tvaRate: Number(q.tva_rate !== undefined ? q.tva_rate : 18)
      }));
      localStorage.setItem('fox_quotes', JSON.stringify(state.quotes));
    }

    // 7. Purchase Orders
    const { data: poData } = await supabaseClient.from('purchase_orders').select('*');
    if (poData && poData.length > 0) {
      state.purchaseOrders = poData.map(po => ({
        id: po.id,
        supplierId: po.supplier_id,
        date: po.date,
        status: po.status,
        items: po.items || []
      }));
      localStorage.setItem('fox_purchase_orders', JSON.stringify(state.purchaseOrders));
    }

    // 8. Receptions
    const { data: recData } = await supabaseClient.from('receptions').select('*');
    if (recData && recData.length > 0) {
      state.receptions = recData.map(r => ({
        id: r.id,
        purchaseOrderId: r.purchase_order_id,
        supplierId: r.supplier_id,
        date: r.date,
        items: r.items || []
      }));
      localStorage.setItem('fox_receptions', JSON.stringify(state.receptions));
    }

    // 9. Delivery Notes
    const { data: blData } = await supabaseClient.from('delivery_notes').select('*');
    if (blData && blData.length > 0) {
      state.deliveryNotes = blData.map(d => ({
        id: d.id,
        orderId: d.order_id,
        clientId: d.client_id,
        date: d.date,
        status: d.status
      }));
      localStorage.setItem('fox_delivery_notes', JSON.stringify(state.deliveryNotes));
    }

    // Rafraîchir l'interface active
    const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'dashboard';
    triggerTabRender(activeTab);

    showToast('Données synchronisées avec Supabase Cloud !', 'success');
  } catch (err) {
    console.error('Erreur Pull Supabase:', err);
    showToast('Erreur de synchronisation Supabase: ' + err.message, 'danger');
  } finally {
    isSyncing = false;
  }
}

// Export de toutes les données locales existantes vers Supabase (Push complet initial)
async function pushAllToSupabase() {
  if (!supabaseClient) {
    showToast('Veuillez d\'abord connecter votre projet Supabase.', 'warning');
    return;
  }

  try {
    showToast('Exportation des données locales vers Supabase...', 'info');

    await pushEntityToSupabase('companyInfo', state.companyInfo);
    await pushEntityToSupabase('products', state.products);
    await pushEntityToSupabase('clients', state.clients);
    await pushEntityToSupabase('suppliers', state.suppliers);
    await pushEntityToSupabase('orders', state.orders);
    await pushEntityToSupabase('quotes', state.quotes);
    await pushEntityToSupabase('purchaseOrders', state.purchaseOrders);
    await pushEntityToSupabase('receptions', state.receptions);
    await pushEntityToSupabase('deliveryNotes', state.deliveryNotes);

    showToast('Toutes vos données locales ont été migrées vers Supabase avec succès !', 'success');
  } catch (err) {
    console.error('Erreur Push All:', err);
    showToast('Erreur lors de la migration: ' + err.message, 'danger');
  }
}
