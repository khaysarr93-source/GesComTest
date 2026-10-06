// Application FOX GESCOM - Logique Métier & Routage (Version 5 : Paramétrage intégral, Préfixes & Devise)

// State global de l'application
let state = {
  products: [],
  clients: [],
  orders: [],
  quotes: [],
  suppliers: [],
  purchaseOrders: [],
  receptions: [],
  deliveryNotes: [],
  companyInfo: {}
};

// Panier d'achat en cours (Clients)
let cart = [];

// Panier d'approvisionnement en cours (Fournisseurs)
let poCart = [];

// Panier d'articles pour Bon de Livraison manuel
let deliveryCart = [];

// Variable temporaire pour stocker le logo Base64 pendant l'édition
let uploadedLogoBase64 = "";

// Instance active du graphique Chart.js
let salesChartInstance = null;

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  // Mettre à jour l'horloge en premier pour éviter tout blocage ou retard
  updateCurrentDate();
  setInterval(updateCurrentDate, 1000);

  try {
    initLocalStorage();
    if (typeof initSupabase === 'function') initSupabase();
    setupNavigation();
    setupEventHandlers();
    
    // Appliquer le logo de la barre latérale sur base de la config chargée
    renderSidebarLogo();
    
    // Onglet par défaut (Dashboard)
    renderDashboard();
    
    // Activer Lucide Icons
    lucide.createIcons();
  } catch (error) {
    console.error("Erreur d'initialisation FOX GESCOM:", error);
  }
});

// 1. Initialisation des données locales et synchronisation
function initLocalStorage() {
  if (!localStorage.getItem('fox_products')) {
    localStorage.setItem('fox_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem('fox_clients')) {
    localStorage.setItem('fox_clients', JSON.stringify(DEFAULT_CLIENTS));
  }
  if (!localStorage.getItem('fox_orders')) {
    localStorage.setItem('fox_orders', JSON.stringify(DEFAULT_ORDERS));
  }
  if (!localStorage.getItem('fox_company_info')) {
    localStorage.setItem('fox_company_info', JSON.stringify(COMPANY_INFO));
  }
  if (!localStorage.getItem('fox_quotes')) {
    localStorage.setItem('fox_quotes', JSON.stringify(DEFAULT_QUOTES));
  }
  if (!localStorage.getItem('fox_suppliers')) {
    localStorage.setItem('fox_suppliers', JSON.stringify(DEFAULT_SUPPLIERS));
  }
  if (!localStorage.getItem('fox_purchase_orders')) {
    localStorage.setItem('fox_purchase_orders', JSON.stringify(DEFAULT_PURCHASE_ORDERS));
  }
  if (!localStorage.getItem('fox_receptions')) {
    localStorage.setItem('fox_receptions', JSON.stringify(DEFAULT_RECEPTIONS));
  }
  if (!localStorage.getItem('fox_delivery_notes')) {
    localStorage.setItem('fox_delivery_notes', JSON.stringify(DEFAULT_DELIVERY_NOTES));
  }

  // Charger dans l'état en mémoire
  state.products = JSON.parse(localStorage.getItem('fox_products'));
  state.clients = JSON.parse(localStorage.getItem('fox_clients'));
  state.orders = JSON.parse(localStorage.getItem('fox_orders'));
  state.companyInfo = JSON.parse(localStorage.getItem('fox_company_info'));
  state.quotes = JSON.parse(localStorage.getItem('fox_quotes'));
  state.suppliers = JSON.parse(localStorage.getItem('fox_suppliers'));
  state.purchaseOrders = JSON.parse(localStorage.getItem('fox_purchase_orders'));
  state.receptions = JSON.parse(localStorage.getItem('fox_receptions'));
  state.deliveryNotes = JSON.parse(localStorage.getItem('fox_delivery_notes'));

  // Rétrocompatibilité pour les nouvelles clés si écrasé par ancienne version
  if (state.companyInfo.isVatSubject === undefined) state.companyInfo.isVatSubject = true;
  if (state.companyInfo.logo === undefined) state.companyInfo.logo = "";
  if (state.companyInfo.currency === undefined) state.companyInfo.currency = "FCFA";
  if (state.companyInfo.prefixInvoice === undefined) state.companyInfo.prefixInvoice = "F";
  if (state.companyInfo.prefixQuote === undefined) state.companyInfo.prefixQuote = "D";
  if (state.companyInfo.prefixDelivery === undefined) state.companyInfo.prefixDelivery = "BL";
  if (state.companyInfo.prefixPO === undefined) state.companyInfo.prefixPO = "CF";
  if (state.companyInfo.prefixReception === undefined) state.companyInfo.prefixReception = "BR";

  // Rétrocompatibilité pour les règlements/paiements sur factures
  if (state.orders) {
    state.orders.forEach(o => {
      if (o.payments === undefined) o.payments = [];
      if (o.paidAmount === undefined) {
        if (o.status === 'Payée') {
          const items = o.items || [];
          const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
          const discount = o.discount || 0;
          const tvaRate = o.tvaRate !== undefined ? o.tvaRate : 18;
          const totalTtc = (subtotal - discount) * (1 + tvaRate/100);
          o.paidAmount = totalTtc;
        } else {
          o.paidAmount = 0;
        }
      }
    });
  }
}

// Sauvegarde dans le LocalStorage par entité
function saveState(key) {
  if (key === 'products' || key === 'all') {
    localStorage.setItem('fox_products', JSON.stringify(state.products));
    if (typeof pushEntityToSupabase === 'function') pushEntityToSupabase('products', state.products);
  }
  if (key === 'clients' || key === 'all') {
    localStorage.setItem('fox_clients', JSON.stringify(state.clients));
    if (typeof pushEntityToSupabase === 'function') pushEntityToSupabase('clients', state.clients);
  }
  if (key === 'orders' || key === 'all') {
    localStorage.setItem('fox_orders', JSON.stringify(state.orders));
    if (typeof pushEntityToSupabase === 'function') pushEntityToSupabase('orders', state.orders);
  }
  if (key === 'companyInfo' || key === 'all') {
    localStorage.setItem('fox_company_info', JSON.stringify(state.companyInfo));
    if (typeof pushEntityToSupabase === 'function') pushEntityToSupabase('companyInfo', state.companyInfo);
  }
  if (key === 'quotes' || key === 'all') {
    localStorage.setItem('fox_quotes', JSON.stringify(state.quotes));
    if (typeof pushEntityToSupabase === 'function') pushEntityToSupabase('quotes', state.quotes);
  }
  if (key === 'suppliers' || key === 'all') {
    localStorage.setItem('fox_suppliers', JSON.stringify(state.suppliers));
    if (typeof pushEntityToSupabase === 'function') pushEntityToSupabase('suppliers', state.suppliers);
  }
  if (key === 'purchaseOrders' || key === 'all') {
    localStorage.setItem('fox_purchase_orders', JSON.stringify(state.purchaseOrders));
    if (typeof pushEntityToSupabase === 'function') pushEntityToSupabase('purchaseOrders', state.purchaseOrders);
  }
  if (key === 'receptions' || key === 'all') {
    localStorage.setItem('fox_receptions', JSON.stringify(state.receptions));
    if (typeof pushEntityToSupabase === 'function') pushEntityToSupabase('receptions', state.receptions);
  }
  if (key === 'deliveryNotes' || key === 'all') {
    localStorage.setItem('fox_delivery_notes', JSON.stringify(state.deliveryNotes));
    if (typeof pushEntityToSupabase === 'function') pushEntityToSupabase('deliveryNotes', state.deliveryNotes);
  }
}

// 2. Gestion de la Navigation SPA
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === tabId) {
          section.classList.add('active');
        }
      });
      
      updateHeaderTitle(tabId, pageTitle, pageSubtitle);
      triggerTabRender(tabId);
    });
  });

  // Gestion de tous les sous-onglets (Inventaire ET Facturation/Devis)
  const subTabBtns = document.querySelectorAll('.sub-tab-btn');
  const subTabContents = document.querySelectorAll('.sub-tab-content');
  
  subTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const subtabId = btn.getAttribute('data-subtab');
      const parentSection = btn.closest('.tab-content');
      
      // Enlever l'état actif uniquement sur les sous-onglets de ce même onglet parent
      parentSection.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      parentSection.querySelectorAll('.sub-tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === `sub-tab-${subtabId}`) {
          content.classList.add('active');
        }
      });
      
      triggerSubTabRender(subtabId);
    });
  });

  // Bouton Nouvelle Vente rapide
  document.getElementById('header-new-sale-btn').addEventListener('click', () => {
    const newSaleTab = document.querySelector('.nav-item[data-tab="new-order"]');
    if (newSaleTab) newSaleTab.click();
  });
}

function updateHeaderTitle(tabId, titleEl, subtitleEl) {
  const compName = state.companyInfo.name || "FOX GESCOM";
  switch(tabId) {
    case 'dashboard':
      titleEl.textContent = 'Tableau de bord';
      subtitleEl.textContent = `Aperçu global de l'activité commerciale - ${compName}`;
      break;
    case 'products':
      titleEl.textContent = 'Produits & Stocks';
      subtitleEl.textContent = 'Gérez votre catalogue de marchandises et suivez les niveaux de stock';
      break;
    case 'clients':
      titleEl.textContent = 'Gestion des Clients';
      subtitleEl.textContent = 'Consultez et éditez les informations de vos clients';
      break;
    case 'billing':
      titleEl.textContent = 'Ventes & Propositions';
      subtitleEl.textContent = 'Consultez les factures définitives et suivez les devis commerciaux';
      break;
    case 'inventory':
      titleEl.textContent = 'Gestion Logistique & Inventaire';
      subtitleEl.textContent = 'Flux marchandises : fournisseurs, réceptions, et bons de livraison';
      break;
    case 'settings':
      titleEl.textContent = 'Configurations Système';
      subtitleEl.textContent = "Définissez les coordonnées, la devise, les préfixes et le logo de vos documents";
      break;
    case 'new-order':
      titleEl.textContent = 'Nouveau Document';
      subtitleEl.textContent = 'Saisissez les lignes de votre panier pour créer une facture ou un devis';
      break;
  }
}

function triggerTabRender(tabId) {
  switch(tabId) {
    case 'dashboard': renderDashboard(); break;
    case 'products': renderProducts(); break;
    case 'clients': renderClients(); break;
    case 'billing':
      const activeBillingSubtab = document.querySelector('#billing .sub-tab-btn.active').getAttribute('data-subtab');
      triggerSubTabRender(activeBillingSubtab);
      break;
    case 'inventory':
      const activeInventorySubtab = document.querySelector('#inventory .sub-tab-btn.active').getAttribute('data-subtab');
      triggerSubTabRender(activeInventorySubtab);
      break;
    case 'settings': renderSettings(); break;
    case 'new-order': renderNewOrder(); break;
  }
  lucide.createIcons();
}

function triggerSubTabRender(subtabId) {
  switch(subtabId) {
    case 'invoices': renderOrders(); break;
    case 'quotes-list': renderQuotes(); break;
    case 'suppliers': renderSuppliers(); break;
    case 'purchase-orders': renderPurchaseOrders(); break;
    case 'receptions': renderReceptions(); break;
    case 'deliveries': renderDeliveries(); break;
  }
  lucide.createIcons();
}

// 3. Formatage et Date
function formatFCFA(amount) {
  const val = parseFloat(amount) || 0;
  const currencySymbol = state.companyInfo.currency || "FCFA";
  return new Intl.NumberFormat('fr-FR').format(val) + ' ' + currencySymbol;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function updateCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = new Date().toLocaleDateString('fr-FR', options);
  const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  document.getElementById('current-date-display').textContent = formattedDate;
  document.getElementById('current-time-display').textContent = timeStr;
}

// Rendu réactif du logo d'entreprise dans la barre latérale gauche
function renderSidebarLogo() {
  const container = document.getElementById('sidebar-logo-container');
  const nameText = document.getElementById('sidebar-company-name-text');
  
  const compName = state.companyInfo.name || "FOX GESCOM";
  nameText.textContent = compName;
  document.title = `${compName} - Gestion Commerciale`;
  
  if (state.companyInfo.logo) {
    container.innerHTML = `<img src="${state.companyInfo.logo}" class="logo-image" alt="Logo">`;
  } else {
    // Logo par défaut
    container.innerHTML = `
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
    `;
  }
}

// 4. Notifications Toast
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'check-circle';
  if (type === 'warning') icon = 'alert-triangle';
  if (type === 'danger') icon = 'x-circle';
  if (type === 'info') icon = 'info';

  toast.innerHTML = `
    <div class="toast-content">
      <i data-lucide="${icon}"></i>
      <span class="toast-message">${message}</span>
    </div>
    <button class="btn-close" style="padding: 0;"><i data-lucide="x" style="width: 14px; height: 14px;"></i></button>
  `;
  container.appendChild(toast);
  lucide.createIcons();
  
  toast.querySelector('.btn-close').addEventListener('click', () => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  });

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', () => toast.remove());
    }
  }, 4000);
}


// ==========================================
// TABLEAU DE BORD (DASHBOARD)
// ==========================================
function renderDashboard() {
  const activeOrders = (state.orders || []).filter(o => o.status !== 'Annulée');
  
  let totalSales = 0;
  let totalReceived = 0;
  let totalOutstanding = 0;
  let totalMargin = 0;

  activeOrders.forEach(order => {
    const items = order.items || [];
    const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const discount = order.discount || 0;
    const netHt = subtotal - discount;
    const tvaRate = order.tvaRate !== undefined ? order.tvaRate : 18;
    const tva = netHt * (tvaRate / 100);
    const totalTtc = netHt + tva;
    
    totalSales += totalTtc;

    // Règlements et Créances
    const paid = order.paidAmount || 0;
    totalReceived += paid;
    totalOutstanding += Math.max(0, totalTtc - paid);

    // Marge brute HT = Net HT - Coût d'achat estimé
    let orderCost = 0;
    items.forEach(item => {
      const prod = state.products.find(p => p.id === item.productId);
      const costPrice = prod ? (prod.costPrice !== undefined ? prod.costPrice : (prod.price * 0.7)) : 0;
      orderCost += costPrice * (item.quantity || 0);
    });
    totalMargin += (netHt - orderCost);
  });

  const ordersCount = state.orders.length;
  const avgBasket = activeOrders.length > 0 ? Math.round(totalSales / activeOrders.length) : 0;
  const criticalStockCount = state.products.filter(p => p.stock <= p.minStock).length;

  document.getElementById('kpi-total-sales').textContent = formatFCFA(totalSales);
  document.getElementById('kpi-orders-count').textContent = ordersCount;
  document.getElementById('kpi-average-basket').textContent = formatFCFA(avgBasket);
  
  // Nouveaux KPIs
  document.getElementById('kpi-total-received').textContent = formatFCFA(totalReceived);
  document.getElementById('kpi-total-outstanding').textContent = formatFCFA(totalOutstanding);
  document.getElementById('kpi-total-margin').textContent = formatFCFA(totalMargin);
  
  const stockKpiEl = document.getElementById('kpi-critical-stock');
  stockKpiEl.textContent = criticalStockCount;
  if (criticalStockCount > 0) {
    stockKpiEl.classList.add('pulse-badge');
    document.getElementById('stock-kpi-footer-label').innerHTML = `<span style="color: var(--danger); font-weight:700;">Action requise:</span> stocks bas/rupture`;
  } else {
    stockKpiEl.classList.remove('pulse-badge');
    document.getElementById('stock-kpi-footer-label').textContent = 'Stocks corrects';
  }

  // Activités Récentes
  const recentActivitiesContainer = document.getElementById('dashboard-recent-activities');
  recentActivitiesContainer.innerHTML = '';
  
  const allEvents = [];
  state.orders.forEach(o => allEvents.push({ ...o, type: 'facture' }));
  state.quotes.forEach(q => allEvents.push({ ...q, type: 'devis' }));
  
  const sortedEvents = allEvents.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  
  if (sortedEvents.length === 0) {
    recentActivitiesContainer.innerHTML = `<div class="empty-cart-msg">Aucune activité récente.</div>`;
  } else {
    sortedEvents.forEach(evt => {
      const client = state.clients.find(c => c.id === evt.clientId) || { name: 'Client Inconnu' };
      const items = evt.items || [];
      const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
      const discount = evt.discount || 0;
      const tvaRate = evt.tvaRate !== undefined ? evt.tvaRate : 18;
      const totalTtc = (subtotal - discount) * (1 + tvaRate/100);
      
      let statusClass = 'badge-success';
      if (evt.status === 'En attente' || evt.status === 'Envoyé') statusClass = 'badge-warning';
      if (evt.status === 'Annulée' || evt.status === 'Refusé') statusClass = 'badge-danger';
      if (evt.status === 'Brouillon') statusClass = 'badge-info';

      const activityItem = document.createElement('div');
      activityItem.className = 'activity-item';
      activityItem.innerHTML = `
        <div class="activity-info">
          <div class="activity-icon" style="background-color: ${evt.type === 'devis' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 107, 0, 0.1)'}; color: ${evt.type === 'devis' ? 'var(--warning)' : 'var(--fox-orange)'};">
            <i data-lucide="${evt.type === 'devis' ? 'file-text' : 'file-check'}"></i>
          </div>
          <div class="activity-details">
            <h4>${client.name}</h4>
            <p>${evt.type === 'devis' ? 'Devis' : 'Facture'} ${evt.id} • ${formatDate(evt.date)}</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="badge ${statusClass}">${evt.status}</span>
          <span class="activity-amount">${formatFCFA(totalTtc)}</span>
        </div>
      `;
      recentActivitiesContainer.appendChild(activityItem);
    });
  }

  renderSalesChart();
  
  // NOUVEAU : Analytiques avancées (Top produits & Catégories)
  // 1. Calcul du Top 5 des produits les plus vendus
  const productStats = {};
  activeOrders.forEach(order => {
    const items = order.items || [];
    items.forEach(item => {
      if (!productStats[item.productId]) {
        productStats[item.productId] = { qty: 0, revenue: 0 };
      }
      productStats[item.productId].qty += (item.quantity || 0);
      productStats[item.productId].revenue += (item.quantity || 0) * (item.price || 0);
    });
  });

  const topProducts = Object.keys(productStats).map(prodId => {
    const prod = state.products.find(p => p.id === prodId) || { name: 'Produit Supprimé', category: 'N/A' };
    return {
      id: prodId,
      name: prod.name,
      category: prod.category,
      qty: productStats[prodId].qty,
      revenue: productStats[prodId].revenue
    };
  }).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const topProductsBody = document.getElementById('dashboard-top-products-body');
  if (topProductsBody) {
    topProductsBody.innerHTML = '';
    if (topProducts.length === 0) {
      topProductsBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--fox-muted); padding: 30px;">Aucune vente enregistrée.</td></tr>`;
    } else {
      topProducts.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 600;">${p.name}</td>
          <td><span class="badge badge-info">${p.category}</span></td>
          <td style="text-align: center; font-weight: 700; color: var(--fox-orange);">${p.qty}</td>
          <td style="text-align: right; font-weight: 700; color: var(--success);">${formatFCFA(p.revenue)}</td>
        `;
        topProductsBody.appendChild(tr);
      });
    }
  }

  // 2. Calcul de la répartition par catégorie
  const categoryStats = {};
  let totalActiveRevenue = 0;
  activeOrders.forEach(order => {
    const items = order.items || [];
    items.forEach(item => {
      const prod = state.products.find(p => p.id === item.productId);
      const cat = prod ? prod.category : 'Autre';
      const itemRev = (item.quantity || 0) * (item.price || 0);
      
      if (!categoryStats[cat]) categoryStats[cat] = 0;
      categoryStats[cat] += itemRev;
      totalActiveRevenue += itemRev;
    });
  });

  const categoriesBreakdownContainer = document.getElementById('dashboard-categories-breakdown');
  if (categoriesBreakdownContainer) {
    categoriesBreakdownContainer.innerHTML = '';
    
    const sortedCategories = Object.keys(categoryStats).map(catName => ({
      name: catName,
      revenue: categoryStats[catName],
      percentage: totalActiveRevenue > 0 ? Math.round((categoryStats[catName] / totalActiveRevenue) * 100) : 0
    })).sort((a, b) => b.revenue - a.revenue);

    if (sortedCategories.length === 0) {
      categoriesBreakdownContainer.innerHTML = `<div class="empty-cart-msg">Aucune vente à analyser.</div>`;
    } else {
      sortedCategories.forEach(cat => {
        const div = document.createElement('div');
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 6px;">
            <span>${cat.name}</span>
            <span style="color: var(--fox-muted);">${formatFCFA(cat.revenue)} (${cat.percentage}%)</span>
          </div>
          <div style="width: 100%; height: 8px; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden;">
            <div style="width: ${cat.percentage}%; height: 100%; background: linear-gradient(90deg, var(--fox-orange), #ff9800); border-radius: 4px;"></div>
          </div>
        `;
        categoriesBreakdownContainer.appendChild(div);
      });
    }
  }
}

function renderSalesChart() {
  const ctx = document.getElementById('salesChart').getContext('2d');
  if (salesChartInstance) salesChartInstance.destroy();

  const monthlyData = { 'Jan': 0, 'Fév': 0, 'Mar': 0, 'Avr': 0, 'Mai': 0, 'Juin': 0, 'Juil': 0, 'Aoû': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Déc': 0 };
  const monthsFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  state.orders.forEach(order => {
    if (order.status === 'Annulée') return;
    const orderDate = new Date(order.date);
    if (orderDate.getFullYear() === 2026) {
      const monthName = monthsFr[orderDate.getMonth()];
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      monthlyData[monthName] += (subtotal - order.discount) * (1 + order.tvaRate/100);
    }
  });

  salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(monthlyData),
      datasets: [{
        label: `Ventes (${state.companyInfo.currency || 'FCFA'})`,
        data: Object.values(monthlyData),
        borderColor: '#ff6b00',
        backgroundColor: 'rgba(255, 107, 0, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#ff6b00',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#8b8b9c' } },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: {
            color: '#8b8b9c',
            callback: value => value >= 1000000 ? (value/1000000).toFixed(1) + 'M' : value >= 1000 ? (value/1000).toFixed(0) + 'k' : value
          }
        }
      }
    }
  });
}


// ==========================================
// CATALOGUE PRODUITS
// ==========================================
function renderProducts() {
  const tableBody = document.getElementById('products-table-body');
  const searchVal = document.getElementById('product-search').value.toLowerCase();
  const categoryFilter = document.getElementById('product-filter-category').value;
  const stockFilter = document.getElementById('product-filter-stock').value;
  
  tableBody.innerHTML = '';
  
  const categories = [...new Set(state.products.map(p => p.category))];
  const catSelect = document.getElementById('product-filter-category');
  const currentCat = catSelect.value;
  catSelect.innerHTML = '<option value="all">Toutes les catégories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    if (cat === currentCat) opt.selected = true;
    catSelect.appendChild(opt);
  });

  const filtered = state.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.id.toLowerCase().includes(searchVal);
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    let matchesStock = true;
    if (stockFilter === 'in') matchesStock = p.stock > p.minStock;
    else if (stockFilter === 'low') matchesStock = p.stock > 0 && p.stock <= p.minStock;
    else if (stockFilter === 'out') matchesStock = p.stock === 0;
    return matchesSearch && matchesCategory && matchesStock;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--fox-muted); padding: 30px;">Aucun produit trouvé.</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    let statusClass = 'badge-success';
    let statusText = 'En stock';
    if (p.stock === 0) { statusClass = 'badge-danger'; statusText = 'Rupture'; }
    else if (p.stock <= p.minStock) { statusClass = 'badge-warning'; statusText = 'Stock bas'; }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: 700; color: var(--fox-orange);">${p.id}</td>
      <td style="font-weight: 600;">${p.name}</td>
      <td><span class="badge badge-info">${p.category}</span></td>
      <td style="font-family: var(--font-title); font-weight: 700;">${formatFCFA(p.price)}</td>
      <td style="font-weight: 600;">${p.stock}</td>
      <td style="color: var(--fox-muted);">${p.minStock}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-table-action" onclick="openEditProductModal('${p.id}')" title="Modifier"><i data-lucide="edit-3"></i></button>
          <button class="btn-table-action delete-action" onclick="deleteProduct('${p.id}')" title="Supprimer"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}


// ==========================================
// CLIENTS
// ==========================================
function renderClients() {
  const tableBody = document.getElementById('clients-table-body');
  const searchVal = document.getElementById('client-search').value.toLowerCase();
  const cityFilter = document.getElementById('client-filter-city').value;
  
  tableBody.innerHTML = '';
  
  const cities = [...new Set(state.clients.map(c => c.city))];
  const citySelect = document.getElementById('client-filter-city');
  const currentCity = citySelect.value;
  citySelect.innerHTML = '<option value="all">Toutes les villes</option>';
  cities.forEach(city => {
    const opt = document.createElement('option');
    opt.value = city; opt.textContent = city;
    if (city === currentCity) opt.selected = true;
    citySelect.appendChild(opt);
  });

  const filtered = state.clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchVal) || c.email.toLowerCase().includes(searchVal) || c.city.toLowerCase().includes(searchVal);
    const matchesCity = cityFilter === 'all' || c.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--fox-muted); padding: 30px;">Aucun client trouvé.</td></tr>`;
    return;
  }

  filtered.forEach(c => {
    const clientOrders = state.orders.filter(o => o.clientId === c.id && o.status !== 'Annulée');
    const orderCount = clientOrders.length;
    let totalPurchased = 0;
    clientOrders.forEach(o => {
      const subtotal = o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalPurchased += (subtotal - o.discount) * (1 + o.tvaRate/100);
    });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${c.name}</td>
      <td style="color: var(--fox-muted);">${c.email}</td>
      <td>${c.phone}</td>
      <td><span class="badge badge-info">${c.city}</span></td>
      <td style="font-size:12px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.address}</td>
      <td style="text-align: center; font-weight: bold;">${orderCount}</td>
      <td style="font-family: var(--font-title); font-weight: 700; color: var(--success);">${formatFCFA(totalPurchased)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-table-action" onclick="viewClientCRM('${c.id}')" title="Visualiser"><i data-lucide="eye"></i></button>
          <button class="btn-table-action" onclick="openEditClientModal('${c.id}')" title="Modifier"><i data-lucide="edit-3"></i></button>
          <button class="btn-table-action delete-action" onclick="deleteClient('${c.id}')" title="Supprimer"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}


// ==========================================
// DEVIS CLIENTS
// ==========================================
function renderQuotes() {
  const tableBody = document.getElementById('quotes-table-body');
  if (!tableBody) return;
  
  const searchVal = document.getElementById('quote-search') ? document.getElementById('quote-search').value.toLowerCase() : '';
  const statusFilter = document.getElementById('quote-filter-status') ? document.getElementById('quote-filter-status').value : 'all';
  
  tableBody.innerHTML = '';

  const quotesList = state.quotes || [];
  const filtered = quotesList.filter(q => {
    const client = state.clients.find(c => c.id === q.clientId) || { name: 'Client Inconnu' };
    const qId = q.id || '';
    return qId.toLowerCase().includes(searchVal) || client.name.toLowerCase().includes(searchVal);
  }).filter(q => {
    return statusFilter === 'all' || q.status === statusFilter;
  }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--fox-muted); padding: 30px;">Aucun devis trouvé.</td></tr>`;
    return;
  }

  filtered.forEach(q => {
    const client = state.clients.find(c => c.id === q.clientId) || { name: 'Client Inconnu' };
    const items = q.items || [];
    const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const tvaRate = q.tvaRate !== undefined ? q.tvaRate : 18;
    const discount = q.discount || 0;
    const totalTtc = (subtotal - discount) * (1 + tvaRate/100);
    const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    let statusClass = 'badge-info';
    if (q.status === 'Envoyé') statusClass = 'badge-warning';
    else if (q.status === 'Accepté') statusClass = 'badge-success';
    else if (q.status === 'Refusé') statusClass = 'badge-danger';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: 700; color: var(--fox-orange);">${q.id || ''}</td>
      <td>${q.date ? formatDate(q.date) : ''}</td>
      <td style="font-weight: 600;">${client.name}</td>
      <td>${itemsCount} article(s)</td>
      <td>${formatFCFA(discount)}</td>
      <td>${formatFCFA((subtotal - discount) * (tvaRate / 100))}</td>
      <td style="font-family: var(--font-title); font-weight: 700; color: white;">${formatFCFA(totalTtc)}</td>
      <td><span class="badge ${statusClass}">${q.status || ''}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-table-action" onclick="viewDocument('quote', '${q.id}')" title="Visualiser"><i data-lucide="eye"></i></button>
          <button class="btn-table-action" onclick="convertQuoteToInvoice('${q.id}')" title="Convertir en Facture" ${q.status === 'Accepté' ? 'disabled' : ''}><i data-lucide="shuffle"></i></button>
          <button class="btn-table-action delete-action" onclick="deleteQuote('${q.id}')" title="Supprimer"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}


// ==========================================
// VENTES / FACTURES
// ==========================================
function renderOrders() {
  const tableBody = document.getElementById('orders-table-body');
  if (!tableBody) return;
  
  const searchVal = document.getElementById('order-search') ? document.getElementById('order-search').value.toLowerCase() : '';
  const statusFilter = document.getElementById('order-filter-status') ? document.getElementById('order-filter-status').value : 'all';
  
  tableBody.innerHTML = '';
  
  const ordersList = state.orders || [];
  const filtered = ordersList.filter(o => {
    const client = state.clients.find(c => c.id === o.clientId) || { name: 'Client Inconnu' };
    const oId = o.id || '';
    return oId.toLowerCase().includes(searchVal) || client.name.toLowerCase().includes(searchVal);
  }).filter(o => {
    return statusFilter === 'all' || o.status === statusFilter;
  }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--fox-muted); padding: 30px;">Aucune facture trouvée.</td></tr>`;
    return;
  }

  filtered.forEach(o => {
    const client = state.clients.find(c => c.id === o.clientId) || { name: 'Client Inconnu' };
    const items = o.items || [];
    const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const tvaRate = o.tvaRate !== undefined ? o.tvaRate : 18;
    const discount = o.discount || 0;
    const totalTtc = (subtotal - discount) * (1 + tvaRate/100);
    const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    let statusClass = 'badge-success';
    if (o.status === 'En attente') statusClass = 'badge-warning';
    else if (o.status === 'Partiellement Payée') statusClass = 'badge-info';
    else if (o.status === 'Annulée') statusClass = 'badge-danger';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: 700; color: var(--fox-orange);">${o.id || ''}</td>
      <td>${o.date ? formatDate(o.date) : ''}</td>
      <td style="font-weight: 600;">${client.name}</td>
      <td>${itemsCount} article(s)</td>
      <td>${formatFCFA(discount)}</td>
      <td>${formatFCFA((subtotal - discount) * (tvaRate / 100))}</td>
      <td style="font-family: var(--font-title); font-weight: 700; color: white;">${formatFCFA(totalTtc)}</td>
      <td><span class="badge ${statusClass}">${o.status || ''}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-table-action" onclick="viewDocument('invoice', '${o.id}')" title="Afficher la Facture"><i data-lucide="eye"></i></button>
          <button class="btn-table-action" onclick="openAddDeliveryModal('${o.id}')" title="Créer Bon de Livraison (BL)" ${o.status === 'Annulée' ? 'disabled' : ''}><i data-lucide="truck"></i></button>
          <button class="btn-table-action delete-action" onclick="cancelOrder('${o.id}')" title="Annuler" ${o.status === 'Annulée' ? 'disabled' : ''}><i data-lucide="x-circle"></i></button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}


// ==========================================
// UNIFIED SALES / QUOTES CREATOR
// ==========================================
function renderNewOrder() {
  const clientSelect = document.getElementById('order-client-select');
  clientSelect.innerHTML = '<option value="" disabled selected>-- Sélectionnez un client --</option>';
  [...state.clients].sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = `${c.name} (${c.city})`;
    clientSelect.appendChild(opt);
  });

  const orderCatSelect = document.getElementById('order-product-category');
  const categories = [...new Set(state.products.map(p => p.category))];
  orderCatSelect.innerHTML = '<option value="all">Toutes</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    orderCatSelect.appendChild(opt);
  });

  // Gérer la TVA par défaut selon les paramètres de l'entreprise
  const vatCheckbox = document.getElementById('order-vat-applied-checkbox');
  vatCheckbox.checked = state.companyInfo.isVatSubject;
  
  // Mettre à jour l'étiquette de la TVA
  const vatLabel = vatCheckbox.parentNode.querySelector('span');
  vatLabel.textContent = `Appliquer la TVA (${state.companyInfo.tvaRate}%)`;

  const typeSelect = document.getElementById('order-type-select');
  const summaryTitle = document.getElementById('summary-document-type-title');
  const statusSelect = document.getElementById('order-status-select');
  
  typeSelect.addEventListener('change', () => {
    if (typeSelect.value === 'Devis') {
      summaryTitle.textContent = 'Détails du Devis';
      statusSelect.innerHTML = `
        <option value="Brouillon">Brouillon</option>
        <option value="Envoyé" selected>Envoyé au client</option>
      `;
    } else {
      summaryTitle.textContent = 'Détails de la Facture';
      statusSelect.innerHTML = `
        <option value="Payée" selected>Payée</option>
        <option value="En attente">En attente de paiement</option>
      `;
    }
  });
  
  typeSelect.dispatchEvent(new Event('change'));

  // Vider le champ d'autocomplétion
  document.getElementById('order-product-autocomplete').value = '';
  document.getElementById('autocomplete-suggestions-box').style.display = 'none';

  renderOrderProductPicker();
  renderCart();
}

function renderOrderProductPicker() {
  const container = document.getElementById('product-picker-container');
  const searchVal = document.getElementById('order-product-search').value.toLowerCase();
  const categoryFilter = document.getElementById('order-product-category').value;
  
  container.innerHTML = '';
  
  const filtered = state.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.id.toLowerCase().includes(searchVal);
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--fox-muted); padding:20px;">Aucun produit.</div>`;
    return;
  }

  filtered.forEach(p => {
    const pickerCard = document.createElement('div');
    pickerCard.className = 'product-picker-card';
    
    let stockText = `En stock: ${p.stock}`;
    let isDisabled = false;
    let cardStyle = '';
    
    if (p.stock === 0) {
      stockText = 'Rupture de stock';
      isDisabled = true;
      cardStyle = 'opacity: 0.5; border-color: rgba(244, 63, 94, 0.2); cursor: not-allowed;';
    } else if (p.stock <= p.minStock) {
      stockText = `Stock bas: ${p.stock}`;
    }

    pickerCard.style = cardStyle;
    pickerCard.innerHTML = `
      <span class="product-picker-name" title="${p.name}">${p.name}</span>
      <span class="product-picker-price">${formatFCFA(p.price)}</span>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
        <span class="product-picker-stock" style="color: ${p.stock === 0 ? 'var(--danger)' : p.stock <= p.minStock ? 'var(--warning)' : 'var(--fox-muted)'}">${stockText}</span>
        <button class="btn btn-primary btn-icon" style="padding:4px 8px; font-size:11px; border-radius:4px;" onclick="addToCart('${p.id}')" ${isDisabled ? 'disabled' : ''}>
          <i data-lucide="plus" style="width:12px; height:12px;"></i>
        </button>
      </div>
    `;
    container.appendChild(pickerCard);
  });
  lucide.createIcons();
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  container.innerHTML = '';
  
  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart-msg">Le panier est vide. Saisissez un nom de produit ou choisissez dans le catalogue ci-dessous.</div>`;
    updateOrderSummary(0);
    return;
  }

  let totalHt = 0;
  cart.forEach(item => {
    const product = state.products.find(p => p.id === item.productId);
    const itemTotal = product.price * item.quantity;
    totalHt += itemTotal;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-price">${formatFCFA(product.price)}</div>
      </div>
      <div>${product.category}</div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="updateCartQty('${item.productId}', -1)">-</button>
        <span class="qty-val">${item.quantity}</span>
        <button class="qty-btn" onclick="updateCartQty('${item.productId}', 1)">+</button>
      </div>
      <div class="cart-item-total">${formatFCFA(itemTotal)}</div>
      <button class="btn-table-action delete-action" onclick="removeFromCart('${item.productId}')" style="width:28px; height:28px;"><i data-lucide="trash-2"></i></button>
    `;
    container.appendChild(row);
  });

  updateOrderSummary(totalHt);
  lucide.createIcons();
}

function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  if (product.stock === 0) {
    showToast(`Produit en rupture de stock.`, 'danger');
    return;
  }

  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    if (existing.quantity >= product.stock) {
      showToast(`Stock maximal atteint (${product.stock} unités max).`, 'warning');
      return;
    }
    existing.quantity++;
  } else {
    cart.push({ productId: productId, quantity: 1 });
  }
  showToast(`${product.name} ajouté au panier !`, 'success');
  renderCart();
  renderOrderProductPicker();
}

function updateCartQty(productId, change) {
  const product = state.products.find(p => p.id === productId);
  const item = cart.find(i => i.productId === productId);
  if (!item) return;

  const newQty = item.quantity + change;
  if (newQty <= 0) { removeFromCart(productId); return; }
  if (newQty > product.stock) { showToast(`Stock insuffisant (${product.stock} disponibles).`, 'warning'); return; }

  item.quantity = newQty;
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.productId !== productId);
  renderCart();
  renderOrderProductPicker();
}

function clearCart() {
  cart = [];
  renderCart();
  renderOrderProductPicker();
}

function updateOrderSummary(subtotalHt) {
  const discountInput = document.getElementById('order-discount-input');
  let discount = parseFloat(discountInput.value) || 0;
  if (discount < 0) discount = 0;
  if (discount > subtotalHt) { discount = subtotalHt; discountInput.value = subtotalHt; }

  const netHt = subtotalHt - discount;
  
  // Gestion de la TVA optionnelle à la volée
  const vatCheckbox = document.getElementById('order-vat-applied-checkbox');
  const isVatApplied = vatCheckbox ? vatCheckbox.checked : state.companyInfo.isVatSubject;
  
  const vatRate = isVatApplied ? state.companyInfo.tvaRate : 0;
  const tva = netHt * (vatRate / 100);
  const totalTtc = netHt + tva;

  // Cacher ou afficher la ligne de TVA dans le panier
  const tvaRow = document.getElementById('order-summary-tva-row');
  const tvaDisplay = document.getElementById('order-summary-tva');
  
  if (tvaRow) {
    if (vatRate === 0) {
      tvaRow.style.color = 'var(--fox-muted)';
      tvaDisplay.textContent = 'Exonéré (0%)';
    } else {
      tvaRow.style.color = '';
      tvaDisplay.textContent = formatFCFA(tva);
    }
  }

  document.getElementById('order-summary-subtotal').textContent = formatFCFA(subtotalHt);
  document.getElementById('order-summary-discount').textContent = `-${formatFCFA(discount)}`;
  document.getElementById('order-summary-net-ht').textContent = formatFCFA(netHt);
  document.getElementById('order-summary-total').textContent = formatFCFA(totalTtc);
}

// Validation unifiée commande / devis
function validateAndProcessOrder() {
  const clientId = document.getElementById('order-client-select').value;
  const type = document.getElementById('order-type-select').value;
  const discount = parseFloat(document.getElementById('order-discount-input').value) || 0;
  const status = document.getElementById('order-status-select').value;
  
  // Taux de TVA à la volée
  const vatCheckbox = document.getElementById('order-vat-applied-checkbox');
  const isVatApplied = vatCheckbox ? vatCheckbox.checked : state.companyInfo.isVatSubject;
  const finalVatRate = isVatApplied ? state.companyInfo.tvaRate : 0;

  if (!clientId) { showToast('Veuillez sélectionner un client.', 'warning'); return; }
  if (cart.length === 0) { showToast('Le panier est vide.', 'warning'); return; }

  const currentYear = new Date().getFullYear();

  if (type === 'Devis') {
    const prefix = state.companyInfo.prefixQuote || 'D';
    const yearQuotes = state.quotes.filter(q => q.id.startsWith(`${prefix}-${currentYear}`));
    const nextNum = yearQuotes.length > 0 ? Math.max(...yearQuotes.map(q => parseInt(q.id.split('-')[2]) || 0)) + 1 : 1;
    const quoteId = `${prefix}-${currentYear}-${String(nextNum).padStart(4, '0')}`;

    const newQuote = {
      id: quoteId,
      clientId: clientId,
      date: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: state.products.find(p => p.id === item.productId).price
      })),
      discount: discount,
      tvaRate: finalVatRate,
      status: status
    };

    state.quotes.push(newQuote);
    saveState('quotes');

    cart = [];
    document.getElementById('order-discount-input').value = '';
    document.getElementById('order-client-select').value = '';

    showToast(`Devis ${quoteId} créé avec succès.`, 'success');
    
    // Rediriger vers l'onglet unifié et son sous-onglet devis
    const billingTab = document.querySelector('.nav-item[data-tab="billing"]');
    if (billingTab) {
      billingTab.click();
      const subQuoteBtn = document.querySelector('.sub-tab-btn[data-subtab="quotes-list"]');
      if (subQuoteBtn) subQuoteBtn.click();
    }
    
    // Réinitialiser les filtres de recherche et de statut pour que le nouveau devis apparaisse
    const quoteSearch = document.getElementById('quote-search');
    if (quoteSearch) quoteSearch.value = '';
    const quoteFilterStatus = document.getElementById('quote-filter-status');
    if (quoteFilterStatus) quoteFilterStatus.value = 'all';
    
    // Re-rendre la table des devis
    renderQuotes();
    
    viewDocument('quote', quoteId);

  } else {
    let stockOk = true;
    cart.forEach(item => {
      const prod = state.products.find(p => p.id === item.productId);
      if (prod.stock < item.quantity) stockOk = false;
    });

    if (!stockOk) { showToast('Certains articles n\'ont plus de stock suffisant.', 'danger'); return; }

    cart.forEach(item => {
      const prod = state.products.find(p => p.id === item.productId);
      prod.stock -= item.quantity;
    });

    const prefixInv = state.companyInfo.prefixInvoice || 'F';
    const yearOrders = state.orders.filter(o => o.id.startsWith(`${prefixInv}-${currentYear}`));
    const nextNum = yearOrders.length > 0 ? Math.max(...yearOrders.map(o => parseInt(o.id.split('-')[2]) || 0)) + 1 : 1;
    const invoiceId = `${prefixInv}-${currentYear}-${String(nextNum).padStart(4, '0')}`;

    const newOrder = {
      id: invoiceId,
      clientId: clientId,
      date: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: state.products.find(p => p.id === item.productId).price
      })),
      discount: discount,
      tvaRate: finalVatRate,
      status: status
    };

    state.orders.push(newOrder);

    const prefixDel = state.companyInfo.prefixDelivery || 'BL';
    const yearDeliveries = state.deliveryNotes.filter(d => d.id.startsWith(`${prefixDel}-${currentYear}`));
    const blNum = yearDeliveries.length > 0 ? Math.max(...yearDeliveries.map(d => parseInt(d.id.split('-')[2]) || 0)) + 1 : 1;
    const blId = `${prefixDel}-${currentYear}-${String(blNum).padStart(4, '0')}`;

    state.deliveryNotes.push({
      id: blId,
      orderId: invoiceId,
      clientId: clientId,
      date: new Date().toISOString(),
      status: 'En préparation'
    });

    saveState('products');
    saveState('orders');
    saveState('deliveryNotes');

    cart = [];
    document.getElementById('order-discount-input').value = '';
    document.getElementById('order-client-select').value = '';

    showToast(`Vente enregistrée. Facture ${invoiceId} et Bon de Livraison ${blId} créés.`, 'success');
    
    // Rediriger vers l'onglet unifié et son sous-onglet factures
    const billingTab = document.querySelector('.nav-item[data-tab="billing"]');
    if (billingTab) {
      billingTab.click();
      const subInvoiceBtn = document.querySelector('.sub-tab-btn[data-subtab="invoices"]');
      if (subInvoiceBtn) subInvoiceBtn.click();
    }
    
    // Réinitialiser les filtres pour que la nouvelle facture apparaisse
    const orderSearch = document.getElementById('order-search');
    if (orderSearch) orderSearch.value = '';
    const orderFilterStatus = document.getElementById('order-filter-status');
    if (orderFilterStatus) orderFilterStatus.value = 'all';
    
    // Re-rendre la table des factures
    renderOrders();
    
    viewDocument('invoice', invoiceId);
  }
}


// ==========================================
// CONVERSION DEVIS ➔ FACTURE (Génère Facture + BL)
// ==========================================
function convertQuoteToInvoice(quoteId) {
  const quote = state.quotes.find(q => q.id === quoteId);
  if (!quote) return;

  if (quote.status === 'Accepté') {
    showToast('Ce devis est déjà converti en facture.', 'info');
    return;
  }

  let stockError = false;
  let itemsMissing = [];
  quote.items.forEach(item => {
    const prod = state.products.find(p => p.id === item.productId);
    if (!prod || prod.stock < item.quantity) {
      stockError = true;
      itemsMissing.push(prod ? prod.name : 'Produit inconnu');
    }
  });

  if (stockError) {
    alert(`Stock insuffisant pour la conversion du devis : \n- ${itemsMissing.join('\n- ')}`);
    showToast('Stock insuffisant.', 'danger');
    return;
  }

  // Déduire les stocks
  quote.items.forEach(item => {
    const prod = state.products.find(p => p.id === item.productId);
    prod.stock -= item.quantity;
  });
  quote.status = 'Accepté';

  const currentYear = new Date().getFullYear();
  
  const prefixInv = state.companyInfo.prefixInvoice || 'F';
  const yearOrders = state.orders.filter(o => o.id.startsWith(`${prefixInv}-${currentYear}`));
  const nextNum = yearOrders.length > 0 ? Math.max(...yearOrders.map(o => parseInt(o.id.split('-')[2]) || 0)) + 1 : 1;
  const invoiceId = `${prefixInv}-${currentYear}-${String(nextNum).padStart(4, '0')}`;

  const newOrder = {
    id: invoiceId,
    clientId: quote.clientId,
    date: new Date().toISOString(),
    items: quote.items.map(item => ({ ...item })),
    discount: quote.discount,
    tvaRate: quote.tvaRate,
    status: 'Payée'
  };

  state.orders.push(newOrder);

  const prefixDel = state.companyInfo.prefixDelivery || 'BL';
  const yearDeliveries = state.deliveryNotes.filter(d => d.id.startsWith(`${prefixDel}-${currentYear}`));
  const blNum = yearDeliveries.length > 0 ? Math.max(...yearDeliveries.map(d => parseInt(d.id.split('-')[2]) || 0)) + 1 : 1;
  const blId = `${prefixDel}-${currentYear}-${String(blNum).padStart(4, '0')}`;

  state.deliveryNotes.push({
    id: blId,
    orderId: invoiceId,
    clientId: quote.clientId,
    date: new Date().toISOString(),
    status: 'En préparation'
  });

  saveState('products');
  saveState('quotes');
  saveState('orders');
  saveState('deliveryNotes');

  showToast(`Devis converti. Facture ${invoiceId} et Bon de Livraison ${blId} générés !`, 'success');
  document.getElementById('modal-invoice').classList.remove('active');
  
  // Rediriger vers factures
  const billingTab = document.querySelector('.nav-item[data-tab="billing"]');
  if (billingTab) {
    billingTab.click();
    const subInvoiceBtn = document.querySelector('.sub-tab-btn[data-subtab="invoices"]');
    if (subInvoiceBtn) subInvoiceBtn.click();
  }
  viewDocument('invoice', invoiceId);
}

function cancelOrder(orderId) {
  if (!confirm(`Êtes-vous sûr de vouloir annuler la facture ${orderId} ? Les stocks des articles seront réintégrés.`)) return;
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;
  
  // Réintégrer les stocks
  order.items.forEach(item => {
    const prod = state.products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock += item.quantity;
    }
  });
  
  order.status = 'Annulée';
  
  // Annuler également le bon de livraison associé
  const bl = state.deliveryNotes.find(d => d.orderId === orderId);
  if (bl) {
    bl.status = 'Annulée';
  }
  
  saveState('products');
  saveState('orders');
  saveState('deliveryNotes');
  
  showToast(`Facture ${orderId} annulée et stocks réintégrés.`, 'warning');
  
  renderOrders();
  renderDashboard();
}

function deleteQuote(quoteId) {
  if (!confirm(`Supprimer définitivement le devis ${quoteId} ?`)) return;
  state.quotes = state.quotes.filter(q => q.id !== quoteId);
  saveState('quotes');
  showToast(`Devis ${quoteId} supprimé.`, 'warning');
  renderQuotes();
  renderDashboard();
}

function openAddPaymentModal(invoiceId) {
  const o = state.orders.find(ord => ord.id === invoiceId);
  if (!o) return;

  const items = o.items || [];
  const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const discount = o.discount || 0;
  const tvaRate = o.tvaRate !== undefined ? o.tvaRate : 18;
  const totalTtc = (subtotal - discount) * (1 + tvaRate/100);
  const paidAmount = o.paidAmount || 0;
  const balance = totalTtc - paidAmount;

  document.getElementById('payment-invoice-id').value = invoiceId;
  document.getElementById('payment-invoice-label').textContent = invoiceId;
  document.getElementById('payment-invoice-balance').textContent = formatFCFA(balance);
  
  const amountInput = document.getElementById('payment-amount');
  amountInput.value = Math.round(balance);
  amountInput.max = Math.round(balance);

  // Date du jour par défaut
  document.getElementById('payment-date').value = new Date().toISOString().split('T')[0];

  document.getElementById('modal-add-payment').classList.add('active');
  lucide.createIcons();
}

function savePayment(e) {
  e.preventDefault();
  const invoiceId = document.getElementById('payment-invoice-id').value;
  const amountStr = document.getElementById('payment-amount').value;
  const method = document.getElementById('payment-method').value;
  const date = document.getElementById('payment-date').value;

  const o = state.orders.find(ord => ord.id === invoiceId);
  if (!o) return;

  const items = o.items || [];
  const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const discount = o.discount || 0;
  const tvaRate = o.tvaRate !== undefined ? o.tvaRate : 18;
  const totalTtc = (subtotal - discount) * (1 + tvaRate/100);
  const paidAmountBefore = o.paidAmount || 0;
  const balanceBefore = totalTtc - paidAmountBefore;

  const inputAmount = parseFloat(amountStr) || 0;

  if (inputAmount <= 0) {
    showToast("Le montant du versement doit être supérieur à 0.", "danger");
    return;
  }
  if (inputAmount > balanceBefore + 1) { // tolérance marge arrondi
    showToast(`Le montant dépasse le solde restant de ${formatFCFA(balanceBefore)}.`, "warning");
    return;
  }

  // Ajouter au journal
  if (!o.payments) o.payments = [];
  o.payments.push({
    date: date,
    method: method,
    amount: inputAmount
  });

  // Mettre à jour paidAmount et le statut
  o.paidAmount = (o.paidAmount || 0) + inputAmount;
  
  if (o.paidAmount >= totalTtc - 1) { // tolérance arrondi
    o.status = 'Payée';
  } else {
    o.status = 'Partiellement Payée';
  }

  saveState('orders');
  showToast(`Règlement de ${formatFCFA(inputAmount)} enregistré pour la facture ${invoiceId}.`, "success");

  // Fermer le modal de règlement
  document.getElementById('modal-add-payment').classList.remove('active');
  
  // Re-visualiser le document mis à jour
  viewDocument('invoice', invoiceId);

  // Mettre à jour le dashboard et la liste
  renderOrders();
  renderDashboard();
}

// ==========================================


// ==========================================
// SOUS-ONGLET : FOURNISSEURS
// ==========================================
function renderSuppliers() {
  const tableBody = document.getElementById('suppliers-table-body');
  const searchVal = document.getElementById('supplier-search').value.toLowerCase();
  
  tableBody.innerHTML = '';
  const filtered = state.suppliers.filter(s => s.name.toLowerCase().includes(searchVal) || s.specialty.toLowerCase().includes(searchVal));

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--fox-muted); padding: 30px;">Aucun fournisseur répertorié.</td></tr>`;
    return;
  }

  filtered.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: 700; color: var(--fox-orange);">${s.id}</td>
      <td style="font-weight: 600;">${s.name}</td>
      <td><span class="badge badge-info">${s.specialty}</span></td>
      <td style="color: var(--fox-muted);">${s.email}</td>
      <td>${s.phone}</td>
      <td>${s.city}</td>
      <td style="font-size: 12px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.address}</td>
      <td>
        <div class="table-actions">
          <button class="btn-table-action" onclick="openEditSupplierModal('${s.id}')" title="Modifier"><i data-lucide="edit-3"></i></button>
          <button class="btn-table-action delete-action" onclick="deleteSupplier('${s.id}')" title="Supprimer"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function openAddSupplierModal() {
  document.getElementById('modal-supplier-title').textContent = 'Nouveau Fournisseur';
  document.getElementById('supplier-id-field').value = '';
  document.getElementById('form-supplier').reset();
  document.getElementById('modal-supplier').classList.add('active');
}

function openEditSupplierModal(supplierId) {
  const s = state.suppliers.find(sup => sup.id === supplierId);
  if (!s) return;

  document.getElementById('modal-supplier-title').textContent = 'Modifier le Fournisseur';
  document.getElementById('supplier-id-field').value = s.id;
  document.getElementById('supplier-name').value = s.name;
  document.getElementById('supplier-specialty').value = s.specialty;
  document.getElementById('supplier-email').value = s.email;
  document.getElementById('supplier-phone').value = s.phone;
  document.getElementById('supplier-city').value = s.city;
  document.getElementById('supplier-address').value = s.address;

  document.getElementById('modal-supplier').classList.add('active');
}

function saveSupplier(e) {
  e.preventDefault();
  const idField = document.getElementById('supplier-id-field').value;
  const name = document.getElementById('supplier-name').value.trim();
  const specialty = document.getElementById('supplier-specialty').value.trim();
  const email = document.getElementById('supplier-email').value.trim();
  const phone = document.getElementById('supplier-phone').value.trim();
  const city = document.getElementById('supplier-city').value.trim();
  const address = document.getElementById('supplier-address').value.trim();

  let newId = '';
  if (idField) {
    const s = state.suppliers.find(sup => sup.id === idField);
    if (s) {
      s.name = name; s.specialty = specialty; s.email = email; s.phone = phone; s.city = city; s.address = address;
      showToast('Fournisseur mis à jour.', 'success');
    }
  } else {
    const nextNum = state.suppliers.length > 0 ? Math.max(...state.suppliers.map(s => parseInt(s.id.split('-')[1]) || 0)) + 1 : 1;
    newId = `fourn-${nextNum}`;
    state.suppliers.push({ id: newId, name, specialty, email, phone, city, address });
    showToast('Nouveau fournisseur enregistré.', 'success');
  }

  saveState('suppliers');
  document.getElementById('modal-supplier').classList.remove('active');
  
  const poModal = document.getElementById('modal-po');
  if (poModal && poModal.classList.contains('active')) {
    const supSelect = document.getElementById('po-supplier-select');
    supSelect.innerHTML = '<option value="" disabled selected>-- Sélectionnez le fournisseur --</option>';
    state.suppliers.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id; opt.textContent = s.name;
      supSelect.appendChild(opt);
    });
    if (newId) {
      supSelect.value = newId;
    }
  } else {
    renderSuppliers();
  }
}

function deleteSupplier(supplierId) {
  const inPOs = state.purchaseOrders.some(p => p.supplierId === supplierId);
  if (inPOs) {
    showToast('Impossible de supprimer: commandes fournisseurs associées.', 'danger');
    return;
  }
  if (!confirm('Supprimer ce fournisseur ?')) return;
  state.suppliers = state.suppliers.filter(s => s.id !== supplierId);
  saveState('suppliers');
  showToast('Fournisseur supprimé.', 'warning');
  renderSuppliers();
}


// ==========================================
// SOUS-ONGLET : COMMANDES FOURNISSEURS
// ==========================================
function renderPurchaseOrders() {
  const tableBody = document.getElementById('po-table-body');
  const searchVal = document.getElementById('po-search').value.toLowerCase();
  
  tableBody.innerHTML = '';
  const filtered = state.purchaseOrders.filter(po => {
    const sup = state.suppliers.find(s => s.id === po.supplierId) || { name: 'Fournisseur inconnu' };
    return po.id.toLowerCase().includes(searchVal) || sup.name.toLowerCase().includes(searchVal);
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--fox-muted); padding: 30px;">Aucune commande fournisseur.</td></tr>`;
    return;
  }

  filtered.forEach(po => {
    const sup = state.suppliers.find(s => s.id === po.supplierId) || { name: 'Fournisseur inconnu' };
    const itemsCount = po.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = po.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

    let statusClass = 'badge-info';
    if (po.status === 'Commandé') statusClass = 'badge-warning';
    else if (po.status === 'Reçu') statusClass = 'badge-success';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: 700; color: var(--fox-orange);">${po.id}</td>
      <td>${formatDate(po.date)}</td>
      <td style="font-weight: 600;">${sup.name}</td>
      <td style="text-align: center;">${itemsCount}</td>
      <td style="font-family: var(--font-title); font-weight: 700;">${formatFCFA(totalCost)}</td>
      <td><span class="badge ${statusClass}">${po.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-table-action" onclick="viewDocument('po', '${po.id}')" title="Afficher"><i data-lucide="eye"></i></button>
          <button class="btn-table-action" onclick="receivePurchaseOrder('${po.id}')" title="Réceptionner le stock" ${po.status !== 'Commandé' ? 'disabled' : ''}><i data-lucide="package-plus"></i></button>
          <button class="btn-table-action delete-action" onclick="deletePO('${po.id}')" title="Supprimer/Annuler" ${po.status === 'Reçu' ? 'disabled' : ''}><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function openAddPOModal(preselectedSupplierId = null) {
  const supSelect = document.getElementById('po-supplier-select');
  supSelect.innerHTML = '<option value="" disabled selected>-- Sélectionnez le fournisseur --</option>';
  state.suppliers.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id; opt.textContent = s.name;
    if (preselectedSupplierId && s.id === preselectedSupplierId) opt.selected = true;
    supSelect.appendChild(opt);
  });

  const prodSelect = document.getElementById('po-product-select');
  prodSelect.innerHTML = '<option value="" disabled selected>-- Choisir un produit --</option>';
  state.products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = `${p.name} (Stock: ${p.stock})`;
    prodSelect.appendChild(opt);
  });

  document.getElementById('po-qty-input').value = '1';
  document.getElementById('po-cost-input').value = '';

  poCart = [];
  renderPOMoadlTable();
  document.getElementById('modal-po').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function handlePOProductChange() {
  const prodId = document.getElementById('po-product-select').value;
  const prod = state.products.find(p => p.id === prodId);
  if (prod) {
    const costInput = document.getElementById('po-cost-input');
    const qtyInput = document.getElementById('po-qty-input');
    // Suggérer prix d'achat enregistré ou 75% du prix de vente
    const suggestedCost = prod.costPrice || Math.round(prod.price * 0.75) || '';
    costInput.value = suggestedCost;
    if (!qtyInput.value || parseInt(qtyInput.value) <= 0) {
      qtyInput.value = '1';
    }
  }
}

function renderPOMoadlTable() {
  const tableBody = document.getElementById('po-items-table-body');
  tableBody.innerHTML = '';
  let poTotal = 0;

  poCart.forEach((item, index) => {
    const prod = state.products.find(p => p.id === item.productId);
    const total = item.quantity * item.costPrice;
    poTotal += total;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding: 8px;">${prod.name}</td>
      <td style="padding: 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; text-align: right;">${formatFCFA(item.costPrice)}</td>
      <td style="padding: 8px; text-align: right; font-weight:700;">${formatFCFA(total)}</td>
      <td style="padding: 8px; text-align: center;">
        <button type="button" class="btn-table-action delete-action" onclick="removePOItem(${index})" style="width:24px; height:24px;"><i data-lucide="trash-2" style="width:10px; height:10px;"></i></button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  document.getElementById('po-modal-total').textContent = formatFCFA(poTotal);
  lucide.createIcons();
}

function addPOItemToCart() {
  const prodId = document.getElementById('po-product-select').value;
  const qty = parseInt(document.getElementById('po-qty-input').value) || 0;
  const cost = parseFloat(document.getElementById('po-cost-input').value) || 0;

  if (!prodId || qty <= 0 || cost <= 0) {
    showToast("Veuillez sélectionner un produit, une quantité et un prix d'achat valide.", "warning");
    return;
  }

  const existing = poCart.find(i => i.productId === prodId);
  if (existing) {
    existing.quantity += qty;
  } else {
    poCart.push({ productId: prodId, quantity: qty, costPrice: cost });
  }

  document.getElementById('po-qty-input').value = '1';
  document.getElementById('po-cost-input').value = '';
  document.getElementById('po-product-select').value = '';

  renderPOMoadlTable();
}

function removePOItem(index) {
  poCart.splice(index, 1);
  renderPOMoadlTable();
}

function savePO(e) {
  e.preventDefault();
  const supplierId = document.getElementById('po-supplier-select').value;
  
  if (!supplierId) { showToast('Veuillez sélectionner un fournisseur.', 'warning'); return; }
  if (poCart.length === 0) { showToast('La commande ne contient aucun article.', 'warning'); return; }

  const currentYear = new Date().getFullYear();
  const prefixPO = state.companyInfo.prefixPO || 'CF';
  const yearPOs = state.purchaseOrders.filter(p => p.id.startsWith(`${prefixPO}-${currentYear}`));
  const nextNum = yearPOs.length > 0 ? Math.max(...yearPOs.map(p => parseInt(p.id.split('-')[2]) || 0)) + 1 : 1;
  const poId = `${prefixPO}-${currentYear}-${String(nextNum).padStart(4, '0')}`;

  const newPO = {
    id: poId,
    supplierId: supplierId,
    date: new Date().toISOString(),
    items: [...poCart],
    status: 'Commandé'
  };

  state.purchaseOrders.push(newPO);
  saveState('purchaseOrders');

  document.getElementById('modal-po').classList.remove('active');
  showToast(`Commande Fournisseur ${poId} enregistrée.`, 'success');
  renderPurchaseOrders();

  // Ouvrir automatiquement le document Bon de Commande pour visualiser / imprimer
  viewDocument('po', poId);
}

// Supprime ou annule PO
function deletePO(poId) {
  if (!confirm(`Annuler la commande fournisseur ${poId} ?`)) return;
  state.purchaseOrders = state.purchaseOrders.filter(p => p.id !== poId);
  saveState('purchaseOrders');
  showToast('Commande fournisseur annulée.', 'warning');
  renderPurchaseOrders();
}


// ==========================================
// RÉCEPTION DE COMMANDE FOURNISSEUR
// ==========================================
function receivePurchaseOrder(poId) {
  const po = state.purchaseOrders.find(p => p.id === poId);
  if (!po) return;
  if (po.status === 'Reçu') return;

  if (!confirm(`Confirmer la réception de la commande ${poId} ? Les stocks physiques vont être augmentés.`)) return;

  po.status = 'Reçu';

  const currentYear = new Date().getFullYear();
  const prefixRec = state.companyInfo.prefixReception || 'BR';
  const yearReceptions = state.receptions.filter(r => r.id.startsWith(`${prefixRec}-${currentYear}`));
  const nextNum = yearReceptions.length > 0 ? Math.max(...yearReceptions.map(r => parseInt(r.id.split('-')[2]) || 0)) + 1 : 1;
  const receptionId = `${prefixRec}-${currentYear}-${String(nextNum).padStart(4, '0')}`;

  const newReception = {
    id: receptionId,
    purchaseOrderId: po.id,
    supplierId: po.supplierId,
    date: new Date().toISOString(),
    items: po.items.map(item => ({ ...item }))
  };

  state.receptions.push(newReception);

  po.items.forEach(item => {
    const product = state.products.find(p => p.id === item.productId);
    if (product) product.stock += item.quantity;
  });

  saveState('products');
  saveState('purchaseOrders');
  saveState('receptions');

  showToast(`Réception ${receptionId} validée. Stocks mis à jour.`, 'success');
  document.getElementById('modal-invoice').classList.remove('active');
  
  const activeSubtab = document.querySelector('#inventory .sub-tab-btn.active').getAttribute('data-subtab');
  if (activeSubtab === 'purchase-orders') renderPurchaseOrders();
  else if (activeSubtab === 'receptions') renderReceptions();
}

function renderReceptions() {
  const tableBody = document.getElementById('receptions-table-body');
  const searchVal = document.getElementById('reception-search').value.toLowerCase();
  
  tableBody.innerHTML = '';
  const filtered = state.receptions.filter(r => {
    const sup = state.suppliers.find(s => s.id === r.supplierId) || { name: 'Fournisseur inconnu' };
    return r.id.toLowerCase().includes(searchVal) || r.purchaseOrderId.toLowerCase().includes(searchVal) || sup.name.toLowerCase().includes(searchVal);
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--fox-muted); padding: 30px;">Aucun bon de réception.</td></tr>`;
    return;
  }

  filtered.forEach(r => {
    const sup = state.suppliers.find(s => s.id === r.supplierId) || { name: 'Fournisseur inconnu' };
    const itemsCount = r.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalVal = r.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: 700; color: var(--fox-orange);">${r.id}</td>
      <td>${formatDate(r.date)}</td>
      <td style="font-weight: 600;">${sup.name}</td>
      <td style="font-family: monospace; font-weight: 700; color: var(--fox-muted);">${r.purchaseOrderId}</td>
      <td style="text-align: center;">${itemsCount}</td>
      <td style="font-family: var(--font-title); font-weight: 700;">${formatFCFA(totalVal)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-table-action" onclick="viewDocument('reception', '${r.id}')" title="Afficher"><i data-lucide="eye"></i></button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}


// ==========================================
// BONS DE LIVRAISON CLIENTS
// ==========================================
function renderDeliveries() {
  const tableBody = document.getElementById('deliveries-table-body');
  const searchVal = document.getElementById('delivery-search').value.toLowerCase();
  const statusFilter = document.getElementById('delivery-filter-status').value;
  
  tableBody.innerHTML = '';
  const filtered = state.deliveryNotes.filter(d => {
    const client = state.clients.find(c => c.id === d.clientId) || { name: 'Client Inconnu' };
    const matchesSearch = d.id.toLowerCase().includes(searchVal) || (d.orderId && d.orderId.toLowerCase().includes(searchVal)) || client.name.toLowerCase().includes(searchVal);
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--fox-muted); padding: 30px;">Aucun bon de livraison trouvé.</td></tr>`;
    return;
  }

  filtered.forEach(d => {
    const client = state.clients.find(c => c.id === d.clientId) || { name: 'Client Inconnu' };
    const destCity = d.city || client.city || 'N/A';
    const invoiceRef = (d.orderId && d.orderId !== 'LIVRAISON-DIRECTE') ? d.orderId : '<span style="font-style: italic; color: var(--fox-muted);">Directe</span>';

    let statusClass = 'badge-warning';
    if (d.status === 'En transit' || d.status === 'En cours') statusClass = 'badge-info';
    else if (d.status === 'Livré') statusClass = 'badge-success';
    else if (d.status === 'Annulée') statusClass = 'badge-danger';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: 700; color: var(--fox-orange);">${d.id}</td>
      <td>${formatDate(d.date)}</td>
      <td style="font-weight: 600;">${client.name}</td>
      <td style="font-family: monospace; font-weight: 700; color: var(--fox-muted);">${invoiceRef}</td>
      <td>${destCity}</td>
      <td><span class="badge ${statusClass}">${d.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-table-action" onclick="viewDocument('delivery', '${d.id}')" title="Afficher"><i data-lucide="eye"></i></button>
          <button class="btn-table-action" onclick="shipDelivery('${d.id}')" title="Expédier" ${d.status !== 'En préparation' ? 'disabled' : ''}><i data-lucide="send"></i></button>
          <button class="btn-table-action" onclick="completeDelivery('${d.id}')" title="Marquer Livré" ${d.status !== 'En transit' && d.status !== 'En cours' ? 'disabled' : ''}><i data-lucide="check"></i></button>
          <button class="btn-table-action delete-action" onclick="deleteDelivery('${d.id}')" title="Supprimer"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function openAddDeliveryModal(orderId = null) {
  // Remplir la liste des factures
  const invoiceSelect = document.getElementById('delivery-invoice-select');
  invoiceSelect.innerHTML = '<option value="">-- Sans facture (Livraison directe) --</option>';
  state.orders.filter(o => o.status !== 'Annulée').forEach(o => {
    const c = state.clients.find(cli => cli.id === o.clientId) || { name: 'Client Inconnu' };
    const opt = document.createElement('option');
    opt.value = o.id;
    opt.textContent = `${o.id} - ${c.name} (${formatDate(o.date)})`;
    invoiceSelect.appendChild(opt);
  });

  // Remplir la liste des clients
  const clientSelect = document.getElementById('delivery-client-select');
  clientSelect.innerHTML = '<option value="" disabled selected>-- Sélectionnez le client --</option>';
  state.clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.city})`;
    clientSelect.appendChild(opt);
  });

  // Remplir la liste des produits
  const prodSelect = document.getElementById('delivery-product-select');
  prodSelect.innerHTML = '<option value="" disabled selected>-- Choisir un produit --</option>';
  state.products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (Stock: ${p.stock})`;
    prodSelect.appendChild(opt);
  });

  // Réinitialiser les champs
  document.getElementById('delivery-date-input').value = new Date().toISOString().split('T')[0];
  document.getElementById('delivery-status-select').value = 'En préparation';
  document.getElementById('delivery-carrier-input').value = '';
  document.getElementById('delivery-carrier-phone-input').value = '';
  document.getElementById('delivery-notes-input').value = '';
  document.getElementById('delivery-qty-input').value = '1';

  deliveryCart = [];

  // Si pré-rempli avec une facture
  if (orderId) {
    invoiceSelect.value = orderId;
    handleDeliveryInvoiceChange();
  } else {
    document.getElementById('delivery-city-input').value = '';
    document.getElementById('delivery-address-input').value = '';
    renderDeliveryModalTable();
  }

  document.getElementById('modal-delivery').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function handleDeliveryInvoiceChange() {
  const invId = document.getElementById('delivery-invoice-select').value;
  if (!invId) {
    renderDeliveryModalTable();
    return;
  }

  const order = state.orders.find(o => o.id === invId);
  if (!order) return;

  const clientSelect = document.getElementById('delivery-client-select');
  if (order.clientId) {
    clientSelect.value = order.clientId;
  }

  const client = state.clients.find(c => c.id === order.clientId);
  if (client) {
    document.getElementById('delivery-city-input').value = client.city || '';
    document.getElementById('delivery-address-input').value = client.address || '';
    document.getElementById('delivery-carrier-phone-input').value = client.phone || '';
  }

  // Pré-charger les articles de la facture dans le BL
  deliveryCart = (order.items || []).map(item => ({
    productId: item.productId,
    quantity: item.quantity || 1
  }));

  renderDeliveryModalTable();
}

function handleDeliveryClientChange() {
  const cliId = document.getElementById('delivery-client-select').value;
  const client = state.clients.find(c => c.id === cliId);
  if (client) {
    if (!document.getElementById('delivery-city-input').value) {
      document.getElementById('delivery-city-input').value = client.city || '';
    }
    if (!document.getElementById('delivery-address-input').value) {
      document.getElementById('delivery-address-input').value = client.address || '';
    }
    if (!document.getElementById('delivery-carrier-phone-input').value) {
      document.getElementById('delivery-carrier-phone-input').value = client.phone || '';
    }
  }
}

function renderDeliveryModalTable() {
  const tableBody = document.getElementById('delivery-items-table-body');
  const counterEl = document.getElementById('delivery-items-counter');
  tableBody.innerHTML = '';

  const totalQty = deliveryCart.reduce((sum, item) => sum + item.quantity, 0);
  if (counterEl) {
    counterEl.textContent = `${deliveryCart.length} article(s) (${totalQty} u.)`;
  }

  if (deliveryCart.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--fox-muted); padding: 20px;">Aucun article dans ce bon de livraison.</td></tr>`;
    return;
  }

  deliveryCart.forEach((item, index) => {
    const prod = state.products.find(p => p.id === item.productId) || { name: 'Produit Inconnu' };
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding: 8px;"><strong>${prod.name}</strong></td>
      <td style="padding: 8px; text-align: center;">
        <input type="number" min="1" value="${item.quantity}" onchange="updateDeliveryItemQty(${index}, this.value)" style="width: 70px; text-align: center; background: rgba(255,255,255,0.06); border: 1px solid var(--card-border); color: white; border-radius: 4px; padding: 4px;">
      </td>
      <td style="padding: 8px; text-align: center;">
        <button type="button" class="btn-table-action delete-action" onclick="removeDeliveryItem(${index})" style="width:24px; height:24px;"><i data-lucide="trash-2" style="width:11px; height:11px;"></i></button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

function updateDeliveryItemQty(index, newQty) {
  const qty = parseInt(newQty) || 1;
  if (deliveryCart[index]) {
    deliveryCart[index].quantity = Math.max(1, qty);
    renderDeliveryModalTable();
  }
}

function addDeliveryItemToCart() {
  const prodId = document.getElementById('delivery-product-select').value;
  const qty = parseInt(document.getElementById('delivery-qty-input').value) || 0;

  if (!prodId || qty <= 0) {
    showToast("Veuillez choisir un produit et une quantité valide.", "warning");
    return;
  }

  const existing = deliveryCart.find(i => i.productId === prodId);
  if (existing) {
    existing.quantity += qty;
  } else {
    deliveryCart.push({ productId: prodId, quantity: qty });
  }

  document.getElementById('delivery-product-select').value = '';
  document.getElementById('delivery-qty-input').value = '1';
  renderDeliveryModalTable();
}

function removeDeliveryItem(index) {
  deliveryCart.splice(index, 1);
  renderDeliveryModalTable();
}

function saveDelivery(e) {
  e.preventDefault();
  const clientId = document.getElementById('delivery-client-select').value;
  const invoiceId = document.getElementById('delivery-invoice-select').value || '';
  const dateInput = document.getElementById('delivery-date-input').value;
  const status = document.getElementById('delivery-status-select').value || 'En préparation';
  const city = document.getElementById('delivery-city-input').value.trim();
  const address = document.getElementById('delivery-address-input').value.trim();
  const carrier = document.getElementById('delivery-carrier-input').value.trim();
  const carrierPhone = document.getElementById('delivery-carrier-phone-input').value.trim();
  const notes = document.getElementById('delivery-notes-input').value.trim();

  if (!clientId) {
    showToast("Veuillez sélectionner le client destinataire.", "warning");
    return;
  }

  if (deliveryCart.length === 0) {
    showToast("Veuillez ajouter au moins un article à livrer.", "warning");
    return;
  }

  const currentYear = new Date().getFullYear();
  const prefixDel = state.companyInfo.prefixDelivery || 'BL';
  const yearDeliveries = state.deliveryNotes.filter(d => d.id.startsWith(`${prefixDel}-${currentYear}`));
  const blNum = yearDeliveries.length > 0 ? Math.max(...yearDeliveries.map(d => parseInt(d.id.split('-')[2]) || 0)) + 1 : 1;
  const blId = `${prefixDel}-${currentYear}-${String(blNum).padStart(4, '0')}`;

  const newBL = {
    id: blId,
    orderId: invoiceId || 'LIVRAISON-DIRECTE',
    clientId: clientId,
    date: dateInput ? new Date(dateInput).toISOString() : new Date().toISOString(),
    status: status,
    items: [...deliveryCart],
    city: city,
    address: address,
    carrier: carrier,
    carrierPhone: carrierPhone,
    notes: notes
  };

  state.deliveryNotes.push(newBL);
  saveState('deliveryNotes');

  document.getElementById('modal-delivery').classList.remove('active');
  showToast(`Bon de Livraison ${blId} généré avec succès.`, 'success');
  renderDeliveries();

  // Ouvrir automatiquement la prévisualisation du document
  viewDocument('delivery', blId);
}

function deleteDelivery(blId) {
  if (!confirm(`Supprimer définitivement le Bon de Livraison ${blId} ?`)) return;
  state.deliveryNotes = state.deliveryNotes.filter(d => d.id !== blId);
  saveState('deliveryNotes');
  showToast(`Bon de Livraison ${blId} supprimé.`, 'warning');
  renderDeliveries();
}

function shipDelivery(blId) {
  const bl = state.deliveryNotes.find(d => d.id === blId);
  if (!bl) return;
  bl.status = 'En transit';
  saveState('deliveryNotes');
  showToast(`Bon de Livraison ${blId} expédié.`, 'info');
  renderDeliveries();
}

function completeDelivery(blId) {
  const bl = state.deliveryNotes.find(d => d.id === blId);
  if (!bl) return;
  bl.status = 'Livré';
  saveState('deliveryNotes');
  showToast(`Bon de Livraison ${blId} marqué comme livré.`, 'success');
  renderDeliveries();
}


// ==========================================
// CONFIGURATION DE L'ENTREPRISE (SETTINGS)
// ==========================================
function renderSettings() {
  const info = state.companyInfo;
  
  // Remplir les champs du formulaire
  document.getElementById('settings-company-name').value = info.name || "";
  document.getElementById('settings-company-slogan').value = info.slogan || "";
  document.getElementById('settings-company-phone').value = info.phone || "";
  document.getElementById('settings-company-email').value = info.email || "";
  document.getElementById('settings-company-website').value = info.website || "";
  document.getElementById('settings-company-city').value = info.city || "";
  document.getElementById('settings-company-address').value = info.address || "";
  document.getElementById('settings-company-ninea').value = info.ninea || "";
  document.getElementById('settings-company-rc').value = info.rc || "";
  
  // NOUVEAUX CHAMPS DE FORMATS
  document.getElementById('settings-company-currency').value = info.currency || "FCFA";
  document.getElementById('settings-prefix-invoice').value = info.prefixInvoice || "F";
  document.getElementById('settings-prefix-quote').value = info.prefixQuote || "D";
  document.getElementById('settings-prefix-delivery').value = info.prefixDelivery || "BL";
  document.getElementById('settings-prefix-po').value = info.prefixPO || "CF";
  document.getElementById('settings-prefix-reception').value = info.prefixReception || "BR";

  // TVA Configurations
  const vatCheckbox = document.getElementById('settings-company-vat-subject');
  const vatRateInput = document.getElementById('settings-company-vat-rate');
  const vatRateGroup = document.getElementById('settings-vat-rate-group');
  
  vatCheckbox.checked = info.isVatSubject;
  vatRateInput.value = info.tvaRate || 0;
  
  // Gérer l'affichage initial du taux de TVA
  if (vatCheckbox.checked) {
    vatRateGroup.style.display = 'block';
    vatRateInput.required = true;
  } else {
    vatRateGroup.style.display = 'none';
    vatRateInput.required = false;
  }
  
  // Écouteur pour masquer le taux de TVA si non assujetti
  vatCheckbox.onchange = () => {
    if (vatCheckbox.checked) {
      vatRateGroup.style.display = 'block';
      vatRateInput.required = true;
      vatRateInput.value = 18;
    } else {
      vatRateGroup.style.display = 'none';
      vatRateInput.required = false;
      vatRateInput.value = 0;
    }
  };

  // Rendu de l'image de prévisualisation du logo
  uploadedLogoBase64 = info.logo || "";
  renderLogoPreview();

  // Remplir les champs de configuration Supabase Cloud
  if (typeof supabaseConfig !== 'undefined') {
    const urlInput = document.getElementById('supabase-project-url');
    const keyInput = document.getElementById('supabase-anon-key');
    const syncCheckbox = document.getElementById('supabase-sync-enabled');

    if (urlInput) urlInput.value = supabaseConfig.url || '';
    if (keyInput) keyInput.value = supabaseConfig.anonKey || '';
    if (syncCheckbox) syncCheckbox.checked = !!supabaseConfig.syncEnabled;
  }
}

function renderLogoPreview() {
  const previewBox = document.getElementById('settings-logo-preview');
  const deleteBtn = document.getElementById('btn-delete-logo');
  
  if (uploadedLogoBase64) {
    previewBox.innerHTML = `<img src="${uploadedLogoBase64}" alt="Aperçu logo">`;
    deleteBtn.style.display = 'inline-flex';
  } else {
    previewBox.innerHTML = `<i data-lucide="image" style="width: 28px; height: 28px;"></i>`;
    deleteBtn.style.display = 'none';
    lucide.createIcons();
  }
}

function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 500 * 1024) {
    showToast("L'image est trop lourde. Veuillez choisir une image de moins de 500 Ko.", "danger");
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedLogoBase64 = event.target.result;
    renderLogoPreview();
    showToast("Logo téléversé temporairement. N'oubliez pas de sauvegarder !", "info");
  };
  reader.readAsDataURL(file);
}

function deleteUploadedLogo() {
  uploadedLogoBase64 = "";
  document.getElementById('settings-logo-input').value = ""; // Vider le file input
  renderLogoPreview();
  showToast("Logo retiré. Enregistrez pour valider.", "warning");
}

function saveSettings(e) {
  e.preventDefault();
  
  const vatSubject = document.getElementById('settings-company-vat-subject').checked;
  const vatRate = parseFloat(document.getElementById('settings-company-vat-rate').value) || 0;

  state.companyInfo = {
    name: document.getElementById('settings-company-name').value.trim(),
    slogan: document.getElementById('settings-company-slogan').value.trim(),
    phone: document.getElementById('settings-company-phone').value.trim(),
    email: document.getElementById('settings-company-email').value.trim(),
    website: document.getElementById('settings-company-website').value.trim(),
    city: document.getElementById('settings-company-city').value.trim(),
    address: document.getElementById('settings-company-address').value.trim(),
    ninea: document.getElementById('settings-company-ninea').value.trim(),
    rc: document.getElementById('settings-company-rc').value.trim(),
    isVatSubject: vatSubject,
    tvaRate: vatSubject ? vatRate : 0,
    logo: uploadedLogoBase64,
    
    // Nouveaux formats & préfixes
    currency: document.getElementById('settings-company-currency').value.trim(),
    prefixInvoice: document.getElementById('settings-prefix-invoice').value.trim(),
    prefixQuote: document.getElementById('settings-prefix-quote').value.trim(),
    prefixDelivery: document.getElementById('settings-prefix-delivery').value.trim(),
    prefixPO: document.getElementById('settings-prefix-po').value.trim(),
    prefixReception: document.getElementById('settings-prefix-reception').value.trim()
  };

  saveState('companyInfo');
  
  // Mettre à jour réactivement l'en-tête de la barre latérale gauche
  renderSidebarLogo();
  
  // Mettre à jour l'affichage de l'évolution monétaire
  renderDashboard();
  
  showToast("Configurations de l'entreprise enregistrées avec succès.", "success");
}


// ==========================================
// AFFICHAGE DES DOCUMENTS & IMPRESSION & PDF
// ==========================================
function generateDocumentHtml(type, docId) {
  const comp = state.companyInfo || { name: 'FOX GESCOM', slogan: '', address: '', city: '', phone: '', email: '', ninea: '', rc: '', currency: 'FCFA' };
  
  if (type === 'invoice' || type === 'quote') {
    const doc = type === 'invoice' ? state.orders.find(o => o.id === docId) : state.quotes.find(q => q.id === docId);
    if (!doc) return '';

    const client = state.clients.find(c => c.id === doc.clientId) || { name: 'Client Inconnu', email: 'N/A', phone: 'N/A', city: 'N/A', address: 'N/A' };
    
    let rowsHtml = '';
    let subtotalHt = 0;
    const items = doc.items || [];
    items.forEach((item, index) => {
      const product = state.products.find(p => p.id === item.productId) || { name: 'Produit Inconnu' };
      const itemPrice = item.price !== undefined ? item.price : (product.price || 0);
      const itemQty = item.quantity || 0;
      const rowTotal = itemPrice * itemQty;
      subtotalHt += rowTotal;
      rowsHtml += `
        <tr>
          <td style="text-align: center; width: 40px;">${index + 1}</td>
          <td><strong>${product.name || 'Produit Inconnu'}</strong></td>
          <td style="text-align: right;">${formatFCFA(itemPrice)}</td>
          <td style="text-align: center;">${itemQty}</td>
          <td style="text-align: right; font-weight: 700;">${formatFCFA(rowTotal)}</td>
        </tr>
      `;
    });

    const discount = doc.discount || 0;
    const netHt = subtotalHt - discount;
    const finalVatRate = doc.tvaRate !== undefined ? doc.tvaRate : 18;
    const tva = netHt * (finalVatRate / 100);
    const totalTtc = netHt + tva;
    
    let statusClass = 'badge-success';
    if (doc.status === 'En attente' || doc.status === 'Envoyé') statusClass = 'badge-warning';
    else if (doc.status === 'Partiellement Payée') statusClass = 'badge-info';
    else if (doc.status === 'Annulée' || doc.status === 'Refusé') statusClass = 'badge-danger';
    else if (doc.status === 'Brouillon') statusClass = 'badge-info';

    // Rendu conditionnel du logo dans l'en-tête du document
    let logoHtml = `<span class="invoice-brand">${comp.name}</span>`;
    if (comp.logo) {
      logoHtml = `<img src="${comp.logo}" class="invoice-logo-img" alt="${comp.name}">`;
    }

    // Ligne de calcul de TVA conditionnelle
    let vatRowHtml = '';
    let vatMentionHtml = 'Facture payable par Wave, Orange Money, virement ou chèque.';
    
    if (finalVatRate === 0) {
      vatRowHtml = `
        <div class="invoice-fin-row">
          <span>TVA (Exonéré 0%) :</span>
          <span>0 ${comp.currency || 'FCFA'}</span>
        </div>
      `;
      vatMentionHtml = `<span style="color:var(--danger); font-weight:700; text-transform:uppercase; font-size:11px;">TVA non applicable (Exonéré de taxes)</span><br>` + vatMentionHtml;
    } else {
      vatRowHtml = `
        <div class="invoice-fin-row">
          <span>TVA (${finalVatRate}%) :</span>
          <span>${formatFCFA(tva)}</span>
        </div>
      `;
    }

    // Gestion des Règlements
    let paymentsBlockHtml = '';
    let financialsExtendedHtml = '';
    if (type === 'invoice') {
      const paidAmount = doc.paidAmount || 0;
      const balance = totalTtc - paidAmount;
      const payments = doc.payments || [];

      financialsExtendedHtml = `
        <div class="invoice-fin-row" style="color: var(--success); font-weight: 600;">
          <span>Déjà payé :</span>
          <span>${formatFCFA(paidAmount)}</span>
        </div>
        <div class="invoice-fin-row" style="color: ${balance > 0 ? 'var(--fox-orange)' : 'var(--fox-muted)'}; font-weight: 700;">
          <span>Reste à payer :</span>
          <span>${formatFCFA(balance)}</span>
        </div>
      `;

      if (payments.length > 0) {
        let paymentRows = '';
        payments.forEach(p => {
          paymentRows += `
            <tr style="font-size:11px; border-bottom: 1px solid #eee;">
              <td style="padding: 6px 0;">Le ${formatDate(p.date).split(' à ')[0]}</td>
              <td style="padding: 6px 0; font-weight:600;">${p.method}</td>
              <td style="padding: 6px 0; text-align:right; font-weight:700;">${formatFCFA(p.amount)}</td>
            </tr>
          `;
        });

        paymentsBlockHtml = `
          <div style="margin-top: 20px; border-top: 1px solid #e2e2e8; padding-top: 15px;">
            <p style="font-size:12px; font-weight:700; color:var(--fox-dark-accent); margin-bottom:8px; display:flex; align-items:center; gap:4px;">
              <i data-lucide="receipt" style="width:14px; height:14px; color:var(--fox-orange);"></i> Journal des règlements encaissés
            </p>
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:11px;">
              <thead>
                <tr style="color:#62626e; border-bottom: 1px solid #e2e2e8;">
                  <th style="padding-bottom:4px; font-weight:600;">Date</th>
                  <th style="padding-bottom:4px; font-weight:600;">Moyen</th>
                  <th style="padding-bottom:4px; font-weight:600; text-align:right;">Montant</th>
                </tr>
              </thead>
              <tbody>
                ${paymentRows}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    return `
      <div class="invoice-header">
        <div class="invoice-logo-title">
          ${logoHtml}
          <span style="font-size:11px; font-weight:600; color:#ff6b00; text-transform:uppercase;">${comp.slogan}</span>
          <div class="invoice-company-details" style="margin-top:10px;">
            <p>${comp.address}</p>
            <p>${comp.city}</p>
            <p>Tél: ${comp.phone} | Email: ${comp.email}</p>
            <p style="margin-top:5px; font-weight:700; font-size:10px; color:#333;">NINEA: ${comp.ninea} | RC: ${comp.rc}</p>
          </div>
        </div>
        <div class="invoice-title-meta">
          <h2>${type === 'invoice' ? 'FACTURE' : 'DEVIS'}</h2>
          <span class="invoice-id">N° ${doc.id}</span>
          <span class="invoice-date">Émission: ${formatDate(doc.date)}</span>
          <div style="margin-top: 15px;">
            <span class="badge ${statusClass}" style="font-size:12px; padding:6px 12px;">Statut : ${doc.status}</span>
          </div>
        </div>
      </div>

      <div class="invoice-bill-to">
        <div>
          <div class="bill-section-title">Émetteur</div>
          <div class="bill-client-info">
            <h4>${comp.name}</h4>
            <p>${comp.city}</p>
          </div>
        </div>
        <div>
          <div class="bill-section-title">Facturé à</div>
          <div class="bill-client-info">
            <h4>${client.name}</h4>
            <p>${client.address}</p>
            <p>${client.city}, Sénégal</p>
            <p>Tél: ${client.phone} | Email: ${client.email}</p>
          </div>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th style="width:40px; text-align:center;">#</th>
            <th style="text-align:left;">Désignation</th>
            <th style="text-align:right;">Prix Unitaire</th>
            <th style="text-align:center; width:80px;">Qté</th>
            <th style="text-align:right; width:140px;">Total HT</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div class="invoice-summary-block">
        <div class="invoice-notes">
          <p><strong>Conditions & Mentions :</strong></p>
          <p>${type === 'invoice' ? vatMentionHtml : 'Ce devis est valable pendant 30 jours à compter de sa date d\'émission.'}</p>
          <p style="margin-top:15px; font-style:italic;">Merci de votre confiance !</p>
          ${paymentsBlockHtml}
        </div>
        <div class="invoice-financials">
          <div class="invoice-fin-row"><span>Sous-Total HT :</span><span>${formatFCFA(subtotalHt)}</span></div>
          <div class="invoice-fin-row"><span>Remise :</span><span>-${formatFCFA(doc.discount)}</span></div>
          <div class="invoice-fin-row" style="font-weight:700; color:#111;"><span>Net HT :</span><span>${formatFCFA(netHt)}</span></div>
          ${vatRowHtml}
          <div class="invoice-fin-row total"><span>Net à Payer (TTC) :</span><span style="font-size:20px; font-weight:800;">${formatFCFA(totalTtc)}</span></div>
          ${financialsExtendedHtml}
        </div>
      </div>
    `;

  } else if (type === 'po') {
    const po = state.purchaseOrders.find(p => p.id === docId);
    if (!po) return '';
    const supplier = state.suppliers.find(s => s.id === po.supplierId) || { name: 'Fournisseur Inconnu', city: 'N/A', phone: 'N/A', email: 'N/A', address: 'N/A' };
    
    let rowsHtml = '';
    let totalHt = 0;
    const items = po.items || [];
    items.forEach((item, index) => {
      const product = state.products.find(p => p.id === item.productId) || { name: 'Produit Inconnu' };
      const itemCost = item.costPrice || 0;
      const itemQty = item.quantity || 0;
      const rowTotal = itemCost * itemQty;
      totalHt += rowTotal;
      rowsHtml += `
        <tr>
          <td style="text-align: center; width: 40px;">${index + 1}</td>
          <td><strong>${product.name || 'Produit Inconnu'}</strong></td>
          <td style="text-align: right;">${formatFCFA(itemCost)}</td>
          <td style="text-align: center;">${itemQty}</td>
          <td style="text-align: right; font-weight: 700;">${formatFCFA(rowTotal)}</td>
        </tr>
      `;
    });

    let logoHtml = `<span class="invoice-brand">${comp.name}</span>`;
    if (comp.logo) {
      logoHtml = `<img src="${comp.logo}" class="invoice-logo-img" alt="${comp.name}">`;
    }

    return `
      <div class="invoice-header">
        <div class="invoice-logo-title">
          ${logoHtml}
          <span style="font-size:11px; font-weight:600; color:#ff6b00; text-transform:uppercase;">GESTION DES APPROVISIONNEMENTS</span>
          <div class="invoice-company-details" style="margin-top:10px;">
            <p>${comp.address}</p>
            <p>${comp.city}</p>
            <p>Tél: ${comp.phone}</p>
          </div>
        </div>
        <div class="invoice-title-meta">
          <h2>BON DE COMMANDE</h2>
          <span class="invoice-id">N° ${po.id}</span>
          <span class="invoice-date">Émission: ${formatDate(po.date)}</span>
          <div style="margin-top: 15px;">
            <span class="badge badge-info" style="font-size:12px; padding:6px 12px;">Statut : ${po.status}</span>
          </div>
        </div>
      </div>

      <div class="invoice-bill-to">
        <div>
          <div class="bill-section-title">Destinataire (Livrer à)</div>
          <div class="bill-client-info">
            <h4>${comp.name}</h4>
            <p>${comp.address}</p>
            <p>${comp.city}</p>
          </div>
        </div>
        <div>
          <div class="bill-section-title">Fournisseur</div>
          <div class="bill-client-info">
            <h4>${supplier.name}</h4>
            <p>${supplier.address}</p>
            <p>${supplier.city}</p>
            <p>Tél: ${supplier.phone} | Email: ${supplier.email}</p>
          </div>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th style="width:40px; text-align:center;">#</th>
            <th style="text-align:left;">Désignation</th>
            <th style="text-align:right;">P.U Achat HT</th>
            <th style="text-align:center; width:80px;">Qté</th>
            <th style="text-align:right; width:140px;">Total HT</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div class="invoice-summary-block">
        <div class="invoice-notes">
          <p><strong>Note logistique:</strong></p>
          <p>Bon de commande à livrer dans les meilleurs délais aux entrepôts de la société.</p>
        </div>
        <div class="invoice-financials">
          <div class="invoice-fin-row total" style="border-top:none;">
            <span>Total Commande HT :</span>
            <span style="font-size:20px; font-weight:800;">${formatFCFA(totalHt)}</span>
          </div>
        </div>
      </div>
    `;

  } else if (type === 'reception') {
    const reception = state.receptions.find(r => r.id === docId);
    if (!reception) return '';
    const supplier = state.suppliers.find(s => s.id === reception.supplierId) || { name: 'Fournisseur Inconnu', city: 'N/A' };
    
    let rowsHtml = '';
    let totalVal = 0;
    const items = reception.items || [];
    items.forEach((item, index) => {
      const product = state.products.find(p => p.id === item.productId) || { name: 'Produit Inconnu' };
      const itemCost = item.costPrice || 0;
      const itemQty = item.quantity || 0;
      const rowTotal = itemCost * itemQty;
      totalVal += rowTotal;
      rowsHtml += `
        <tr>
          <td style="text-align: center; width: 40px;">${index + 1}</td>
          <td><strong>${product.name || 'Produit Inconnu'}</strong></td>
          <td style="text-align: center;">${itemQty}</td>
          <td style="text-align: right;">${formatFCFA(itemCost)}</td>
          <td style="text-align: right; font-weight: 700;">${formatFCFA(rowTotal)}</td>
        </tr>
      `;
    });

    let logoHtml = `<span class="invoice-brand">${comp.name}</span>`;
    if (comp.logo) {
      logoHtml = `<img src="${comp.logo}" class="invoice-logo-img" alt="${comp.name}">`;
    }

    return `
      <div class="invoice-header">
        <div class="invoice-logo-title">
          ${logoHtml}
          <span style="font-size:11px; font-weight:600; color:#ff6b00; text-transform:uppercase;">RÉCEPTION DE MARCHANDISES</span>
          <div class="invoice-company-details" style="margin-top:10px;">
            <p>${comp.address}</p>
            <p>${comp.city}</p>
          </div>
        </div>
        <div class="invoice-title-meta">
          <h2>BON DE RÉCEPTION</h2>
          <span class="invoice-id">N° ${reception.id}</span>
          <span class="invoice-date">Date Réception: ${formatDate(reception.date)}</span>
          <p style="margin-top:8px; font-size:11px; color:#62626e;">Réf Commande: ${reception.purchaseOrderId}</p>
        </div>
      </div>

      <div class="invoice-bill-to">
        <div>
          <div class="bill-section-title">Réceptionné par</div>
          <div class="bill-client-info">
            <h4>${comp.name}</h4>
            <p>${comp.city}</p>
          </div>
        </div>
        <div>
          <div class="bill-section-title">Fournisseur Expéditeur</div>
          <div class="bill-client-info">
            <h4>${supplier.name}</h4>
            <p>${supplier.city}</p>
          </div>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th style="width:40px; text-align:center;">#</th>
            <th style="text-align:left;">Désignation</th>
            <th style="text-align:center; width:100px;">Qté Livrée</th>
            <th style="text-align:right;">P.U Achat HT</th>
            <th style="text-align:right; width:140px;">Valeur Totale</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div class="invoice-summary-block">
        <div class="invoice-notes">
          <p><strong>Note de contrôle:</strong></p>
          <p>Marchandises contrôlées conformes quantitativement et qualitativement en entrepôt.</p>
        </div>
        <div class="invoice-financials">
          <div class="invoice-fin-row total" style="border-top:none;">
            <span>Valeur Total Réceptionnée :</span>
            <span style="font-size:20px; font-weight:800;">${formatFCFA(totalVal)}</span>
          </div>
        </div>
      </div>
    `;

  } else if (type === 'delivery') {
    const bl = state.deliveryNotes.find(d => d.id === docId);
    if (!bl) return '';
    const client = state.clients.find(c => c.id === bl.clientId) || { name: 'Client Inconnu', address: 'N/A', city: 'N/A', phone: 'N/A' };
    const invoice = state.orders.find(o => o.id === bl.orderId) || { items: [] };

    let rowsHtml = '';
    const items = (bl.items && bl.items.length > 0) ? bl.items : (invoice.items || []);
    let totalDeliveredQty = 0;

    items.forEach((item, index) => {
      const product = state.products.find(p => p.id === item.productId) || { name: item.name || 'Produit Inconnu', category: 'N/A' };
      const itemQty = item.quantity || 0;
      totalDeliveredQty += itemQty;
      rowsHtml += `
        <tr>
          <td style="text-align: center; width: 40px;">${index + 1}</td>
          <td><strong>${product.name || 'Produit Inconnu'}</strong></td>
          <td style="text-align: center; font-weight:700; font-size:14px;">${itemQty} u.</td>
          <td>${product.category || 'N/A'}</td>
        </tr>
      `;
    });

    let statusClass = 'badge-warning';
    if (bl.status === 'En transit' || bl.status === 'En cours') statusClass = 'badge-info';
    else if (bl.status === 'Livré') statusClass = 'badge-success';
    else if (bl.status === 'Annulée') statusClass = 'badge-danger';

    let logoHtml = `<span class="invoice-brand">${comp.name}</span>`;
    if (comp.logo) {
      logoHtml = `<img src="${comp.logo}" class="invoice-logo-img" alt="${comp.name}">`;
    }

    const destAddress = bl.address || client.address || 'N/A';
    const destCity = bl.city || client.city || 'N/A';
    const destPhone = bl.carrierPhone || client.phone || 'N/A';
    const carrierName = bl.carrier || 'Flotte interne / Transporteur désigné';
    const invRefText = (bl.orderId && bl.orderId !== 'LIVRAISON-DIRECTE') ? `Facture Vente associée: <strong>${bl.orderId}</strong>` : `Mode: <em>Livraison Directe</em>`;

    return `
      <div class="invoice-header">
        <div class="invoice-logo-title">
          ${logoHtml}
          <span style="font-size:11px; font-weight:600; color:#ff6b00; text-transform:uppercase;">BON DE LIVRAISON CLIENT</span>
          <div class="invoice-company-details" style="margin-top:10px;">
            <p>${comp.address}</p>
            <p>${comp.city}</p>
            <p>Tél: ${comp.phone}</p>
          </div>
        </div>
        <div class="invoice-title-meta">
          <h2>BON DE LIVRAISON</h2>
          <span class="invoice-id">N° ${bl.id}</span>
          <span class="invoice-date">Date Génération: ${formatDate(bl.date)}</span>
          <p style="margin-top:5px; font-size:11px; color:#62626e;">${invRefText}</p>
          <div style="margin-top: 10px;">
            <span class="badge ${statusClass}" style="font-size:11px; padding:4px 10px;">Statut : ${bl.status}</span>
          </div>
        </div>
      </div>

      <div class="invoice-bill-to">
        <div>
          <div class="bill-section-title">Expéditeur</div>
          <div class="bill-client-info">
            <h4>${comp.name}</h4>
            <p>${comp.address}</p>
            <p>${comp.city}</p>
            <p>Tél: ${comp.phone}</p>
          </div>
        </div>
        <div>
          <div class="bill-section-title">Adresse Destinataire (Livraison)</div>
          <div class="bill-client-info">
            <h4>${client.name}</h4>
            <p><strong>${destAddress}</strong></p>
            <p><strong>${destCity}</strong></p>
            <p>Contact Livraison / Client : <strong>${destPhone}</strong></p>
            <p style="margin-top: 4px; font-size: 11px; color: #62626e;">Transporteur : <strong>${carrierName}</strong></p>
          </div>
        </div>
      </div>

      ${bl.notes ? `
        <div style="margin: 15px 0; padding: 10px 14px; background: rgba(255, 107, 0, 0.05); border-left: 3px solid #ff6b00; border-radius: 4px; font-size: 12px; color: #333;">
          <strong>Instructions / Remarques :</strong> ${bl.notes}
        </div>
      ` : ''}

      <table class="invoice-table">
        <thead>
          <tr>
            <th style="width:40px; text-align:center;">#</th>
            <th style="text-align:left;">Désignation des Articles</th>
            <th style="text-align:center; width:140px;">Quantité Livrée</th>
            <th style="text-align:left;">Catégorie</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div class="invoice-summary-block" style="grid-template-columns:1fr; margin-top:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:#fafafa; border:1px solid #e2e2e8; padding:10px 16px; border-radius:4px; font-size:13px;">
          <span>Total Quantité Colis / Articles :</span>
          <span style="font-size:16px; font-weight:800; color:var(--fox-orange);">${totalDeliveredQty} unités</span>
        </div>
      </div>

      <div class="invoice-summary-block" style="grid-template-columns:1fr; margin-top:20px;">
        <div style="border: 1px dashed #ccc; padding:15px; border-radius:4px; display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:11px; text-align:center; height:100px; align-items:flex-end;">
          <div>
            <p><strong>VISA CHAUFFEUR / TRANSPORTEUR</strong></p>
            <p style="margin-top:40px; color:#aaa;">Date & Signature</p>
          </div>
          <div>
            <p><strong>ACCUSÉ DE RÉCEPTION CLIENT</strong></p>
            <p style="margin-top:40px; color:#aaa;">Nom, Date & Signature</p>
          </div>
        </div>
      </div>
    `;
  }
  return '';
}

function viewDocument(type, docId) {
  const html = generateDocumentHtml(type, docId);
  if (!html) return;

  document.getElementById('invoice-details-card').innerHTML = html;

  const modalTitle = document.getElementById('modal-invoice-viewer-title');
  if (type === 'invoice') modalTitle.textContent = 'Aperçu Facture Vente';
  else if (type === 'quote') modalTitle.textContent = 'Aperçu Devis Pro';
  else if (type === 'po') modalTitle.textContent = 'Aperçu Commande Fournisseur';
  else if (type === 'reception') modalTitle.textContent = 'Aperçu Bon de Réception';
  else if (type === 'delivery') modalTitle.textContent = 'Aperçu Bon de Livraison Client';

  const actionsContainer = document.getElementById('invoice-special-actions-container');
  actionsContainer.innerHTML = '';

  if (type === 'invoice') {
    const o = state.orders.find(ord => ord.id === docId);
    if (o && o.status !== 'Payée' && o.status !== 'Annulée') {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.style.padding = '6px 12px';
      btn.style.fontSize = '13px';
      btn.style.background = 'linear-gradient(135deg, var(--success) 0%, #10b981 100%)';
      btn.style.borderColor = '#10b981';
      btn.innerHTML = `<i data-lucide="dollar-sign" style="width:14px; height:14px; margin-right:4px;"></i> Enregistrer Règlement`;
      btn.onclick = () => openAddPaymentModal(docId);
      actionsContainer.appendChild(btn);
    }
    if (o && o.status !== 'Annulée') {
      const btnBL = document.createElement('button');
      btnBL.className = 'btn btn-secondary';
      btnBL.style.padding = '6px 12px';
      btnBL.style.fontSize = '13px';
      btnBL.innerHTML = `<i data-lucide="truck" style="width:14px; height:14px; margin-right:4px;"></i> Bon de Livraison`;
      btnBL.onclick = () => {
        document.getElementById('modal-invoice').classList.remove('active');
        openAddDeliveryModal(docId);
      };
      actionsContainer.appendChild(btnBL);
    }
  } else if (type === 'quote') {
    const q = state.quotes.find(quote => quote.id === docId);
    if (q && q.status !== 'Accepté') {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.style.padding = '6px 12px';
      btn.style.fontSize = '13px';
      btn.innerHTML = `<i data-lucide="check-circle" style="width:14px; height:14px; margin-right:4px;"></i> Accepter et Facturer`;
      btn.onclick = () => convertQuoteToInvoice(docId);
      actionsContainer.appendChild(btn);
    }
  } else if (type === 'po') {
    const po = state.purchaseOrders.find(p => p.id === docId);
    if (po && po.status === 'Commandé') {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.style.padding = '6px 12px';
      btn.style.fontSize = '13px';
      btn.innerHTML = `<i data-lucide="package-plus" style="width:14px; height:14px; margin-right:4px;"></i> Réceptionner Articles`;
      btn.onclick = () => receivePurchaseOrder(docId);
      actionsContainer.appendChild(btn);
    }
  } else if (type === 'delivery') {
    const bl = state.deliveryNotes.find(d => d.id === docId);
    if (bl) {
      if (bl.status === 'En préparation') {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.style.padding = '6px 12px';
        btn.style.fontSize = '13px';
        btn.innerHTML = `<i data-lucide="send" style="width:14px; height:14px; margin-right:4px;"></i> Expédier (Transit)`;
        btn.onclick = () => { shipDelivery(docId); viewDocument('delivery', docId); };
        actionsContainer.appendChild(btn);
      } else if (bl.status === 'En transit') {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.style.padding = '6px 12px';
        btn.style.fontSize = '13px';
        btn.innerHTML = `<i data-lucide="check" style="width:14px; height:14px; margin-right:4px;"></i> Marquer comme Livré`;
        btn.onclick = () => { completeDelivery(docId); viewDocument('delivery', docId); };
        actionsContainer.appendChild(btn);
      }
    }
  }

  // Stocker les infos d'impression/téléchargement sur le bouton PDF
  const downloadBtn = document.getElementById('btn-download-pdf');
  downloadBtn.setAttribute('data-doc-type', type);
  downloadBtn.setAttribute('data-doc-id', docId);

  const printBtn = document.getElementById('btn-print-invoice');
  printBtn.setAttribute('data-print-type', type);
  printBtn.setAttribute('data-print-id', docId);

  document.getElementById('modal-invoice').classList.add('active');
  lucide.createIcons();
}

// Téléchargement direct en PDF avec html2pdf.js
function downloadActiveDocument() {
  const type = document.getElementById('btn-download-pdf').getAttribute('data-doc-type');
  const docId = document.getElementById('btn-download-pdf').getAttribute('data-doc-id');
  if (!type || !docId) return;

  const element = document.getElementById('invoice-details-card');
  
  let labelType = 'Document';
  if (type === 'invoice') labelType = 'Facture';
  else if (type === 'quote') labelType = 'Devis';
  else if (type === 'po') labelType = 'Bon_Commande_Achat';
  else if (type === 'reception') labelType = 'Bon_Reception';
  else if (type === 'delivery') labelType = 'Bon_Livraison';

  if (typeof html2pdf === 'undefined') {
    showToast("Le module PDF externe est inaccessible. Utilisation de l'impression système pour sauvegarder en PDF...", "warning");
    setTimeout(() => {
      printActiveDocument();
    }, 1500);
    return;
  }

  const opt = {
    margin:       10,
    filename:     `${labelType}_${docId}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  showToast("Génération du fichier PDF en cours...", "info");
  
  html2pdf().set(opt).from(element).save()
    .then(() => {
      showToast("Fichier PDF téléchargé avec succès !", "success");
    })
    .catch(err => {
      console.error(err);
      showToast("Erreur lors de la génération PDF, redirection vers l'impression système...", "warning");
      setTimeout(() => {
        printActiveDocument();
      }, 1000);
    });
}

function printActiveDocument() {
  const type = document.getElementById('btn-print-invoice').getAttribute('data-print-type');
  const docId = document.getElementById('btn-print-invoice').getAttribute('data-print-id');
  if (!type || !docId) return;

  const html = generateDocumentHtml(type, docId);
  document.getElementById('print-section').innerHTML = html;
  
  window.print();
}


// ==========================================
// FORMULAIRES DE CRÉATION DE PRODUITS / CLIENTS (CRUD)
// ==========================================
function openAddProductModal() {
  document.getElementById('modal-product-title').textContent = 'Nouveau Produit';
  document.getElementById('product-id-field').value = '';
  document.getElementById('form-product').reset();
  document.getElementById('modal-product').classList.add('active');
}

function openEditProductModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  document.getElementById('modal-product-title').textContent = 'Modifier le Produit';
  document.getElementById('product-id-field').value = product.id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-stock').value = product.stock;
  document.getElementById('product-min-stock').value = product.minStock;
  document.getElementById('modal-product').classList.add('active');
}

function saveProduct(e) {
  e.preventDefault();
  const idField = document.getElementById('product-id-field').value;
  const name = document.getElementById('product-name').value.trim();
  const category = document.getElementById('product-category').value.trim();
  const price = parseFloat(document.getElementById('product-price').value) || 0;
  const stock = parseInt(document.getElementById('product-stock').value) || 0;
  const minStock = parseInt(document.getElementById('product-min-stock').value) || 0;

  if (idField) {
    const product = state.products.find(p => p.id === idField);
    if (product) {
      product.name = name; product.category = category; product.price = price; product.stock = stock; product.minStock = minStock;
      showToast('Produit mis à jour.', 'success');
    }
  } else {
    const nextNum = state.products.length > 0 ? Math.max(...state.products.map(p => parseInt(p.id.split('-')[1]) || 0)) + 1 : 1;
    const newId = `prod-${nextNum}`;
    state.products.push({ id: newId, name, category, price, stock, minStock });
    showToast('Produit enregistré.', 'success');
  }
  saveState('products');
  document.getElementById('modal-product').classList.remove('active');
  renderProducts();
}

function deleteProduct(productId) {
  const inOrders = state.orders.some(o => o.items.some(i => i.productId === productId)) || state.quotes.some(q => q.items.some(i => i.productId === productId));
  if (inOrders) {
    if (!confirm('Ce produit fait déjà partie de devis/factures. La suppression est risquée pour l\'historique. Voulez-vous continuer ?')) return;
  } else {
    if (!confirm('Supprimer ce produit ?')) return;
  }
  state.products = state.products.filter(p => p.id !== productId);
  saveState('products');
  showToast('Produit supprimé.', 'warning');
  renderProducts();
}

function openAddClientModal() {
  document.getElementById('modal-client-title').textContent = 'Nouveau Client';
  document.getElementById('client-id-field').value = '';
  document.getElementById('form-client').reset();
  document.getElementById('modal-client').classList.add('active');
}

function openEditClientModal(clientId) {
  const client = state.clients.find(c => c.id === clientId);
  if (!client) return;
  document.getElementById('modal-client-title').textContent = 'Modifier Client';
  document.getElementById('client-id-field').value = client.id;
  document.getElementById('client-name').value = client.name;
  document.getElementById('client-email').value = client.email;
  document.getElementById('client-phone').value = client.phone;
  document.getElementById('client-city').value = client.city;
  document.getElementById('client-address').value = client.address;
  document.getElementById('modal-client').classList.add('active');
}

function saveClient(e) {
  e.preventDefault();
  const idField = document.getElementById('client-id-field').value;
  const name = document.getElementById('client-name').value.trim();
  const email = document.getElementById('client-email').value.trim();
  const phone = document.getElementById('client-phone').value.trim();
  const city = document.getElementById('client-city').value.trim();
  const address = document.getElementById('client-address').value.trim();

  let newId = '';
  if (idField) {
    const client = state.clients.find(c => c.id === idField);
    if (client) {
      client.name = name; client.email = email; client.phone = phone; client.city = city; client.address = address;
      showToast('Client mis à jour.', 'success');
    }
  } else {
    const nextNum = state.clients.length > 0 ? Math.max(...state.clients.map(c => parseInt(c.id.split('-')[1]) || 0)) + 1 : 1;
    newId = `cli-${nextNum}`;
    state.clients.push({ id: newId, name, email, phone, city, address });
    showToast('Client créé.', 'success');
  }
  saveState('clients');
  document.getElementById('modal-client').classList.remove('active');
  
  const activeTab = document.querySelector('.nav-item.active').getAttribute('data-tab');
  if (activeTab === 'clients') {
    renderClients();
  } else if (activeTab === 'new-order') {
    renderNewOrder();
    if (newId) {
      document.getElementById('order-client-select').value = newId;
    }
  }
}

function deleteClient(clientId) {
  const inOrders = state.orders.some(o => o.clientId === clientId) || state.quotes.some(q => q.clientId === clientId);
  if (inOrders) { showToast('Impossible: le client possède des transactions.', 'danger'); return; }
  if (!confirm('Supprimer ce client ?')) return;
  state.clients = state.clients.filter(c => c.id !== clientId);
  saveState('clients');
  showToast('Client supprimé.', 'warning');
  renderClients();
}

function viewClientCRM(clientId) {
  const client = state.clients.find(c => c.id === clientId);
  if (!client) return;

  document.getElementById('crm-client-name').textContent = client.name;
  document.getElementById('crm-client-email').textContent = client.email || 'N/A';
  document.getElementById('crm-client-phone').textContent = client.phone || 'N/A';
  document.getElementById('crm-client-city').textContent = client.city || 'N/A';
  document.getElementById('crm-client-address').textContent = client.address || 'N/A';

  // Populer factures
  const clientOrders = (state.orders || []).filter(o => o.clientId === clientId);
  const invoicesBody = document.getElementById('crm-client-invoices-body');
  invoicesBody.innerHTML = '';
  
  if (clientOrders.length === 0) {
    invoicesBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--fox-muted); padding: 15px;">Aucune facture enregistrée.</td></tr>`;
  } else {
    clientOrders.forEach(o => {
      const items = o.items || [];
      const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
      const discount = o.discount || 0;
      const tvaRate = o.tvaRate !== undefined ? o.tvaRate : 18;
      const totalTtc = (subtotal - discount) * (1 + tvaRate/100);
      
      let statusClass = 'badge-success';
      if (o.status === 'En attente') statusClass = 'badge-warning';
      else if (o.status === 'Annulée') statusClass = 'badge-danger';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: monospace; font-weight: 700; color: var(--fox-orange);">${o.id}</td>
        <td>${o.date ? formatDate(o.date).split(' à ')[0] : ''}</td>
        <td style="text-align: right; font-weight: 700;">${formatFCFA(totalTtc)}</td>
        <td><span class="badge ${statusClass}">${o.status}</span></td>
        <td style="text-align: center;">
          <button class="btn-table-action" onclick="openCRMDocument('invoice', '${o.id}')" title="Afficher la Facture" style="width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; padding:0; border:none; background:transparent;"><i data-lucide="eye" style="width:12px; height:12px;"></i></button>
        </td>
      `;
      invoicesBody.appendChild(tr);
    });
  }

  // Populer devis
  const clientQuotes = (state.quotes || []).filter(q => q.clientId === clientId);
  const quotesBody = document.getElementById('crm-client-quotes-body');
  quotesBody.innerHTML = '';
  
  if (clientQuotes.length === 0) {
    quotesBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--fox-muted); padding: 15px;">Aucun devis enregistré.</td></tr>`;
  } else {
    clientQuotes.forEach(q => {
      const items = q.items || [];
      const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
      const discount = q.discount || 0;
      const tvaRate = q.tvaRate !== undefined ? q.tvaRate : 18;
      const totalTtc = (subtotal - discount) * (1 + tvaRate/100);
      
      let statusClass = 'badge-info';
      if (q.status === 'Envoyé') statusClass = 'badge-warning';
      else if (q.status === 'Accepté') statusClass = 'badge-success';
      else if (q.status === 'Refusé') statusClass = 'badge-danger';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: monospace; font-weight: 700; color: var(--fox-orange);">${q.id}</td>
        <td>${q.date ? formatDate(q.date).split(' à ')[0] : ''}</td>
        <td style="text-align: right; font-weight: 700;">${formatFCFA(totalTtc)}</td>
        <td><span class="badge ${statusClass}">${q.status}</span></td>
        <td style="text-align: center;">
          <button class="btn-table-action" onclick="openCRMDocument('quote', '${q.id}')" title="Afficher le Devis" style="width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; padding:0; border:none; background:transparent;"><i data-lucide="eye" style="width:12px; height:12px;"></i></button>
        </td>
      `;
      quotesBody.appendChild(tr);
    });
  }

  document.getElementById('modal-client-details').classList.add('active');
  lucide.createIcons();
}

function openCRMDocument(type, docId) {
  document.getElementById('modal-client-details').classList.remove('active');
  viewDocument(type, docId);
}

// ==========================================
// SAISIE PRÉDICTIVE (AUTOCOMPLÉTION DES PRODUITS)
// ==========================================
function handleAutocompleteInput(e) {
  const query = e.target.value.toLowerCase().trim();
  const suggestionsBox = document.getElementById('autocomplete-suggestions-box');
  
  if (!query) {
    suggestionsBox.style.display = 'none';
    return;
  }

  // Filtrer les produits par nom, code (id) ou catégorie
  const matches = state.products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.id.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    suggestionsBox.innerHTML = '<div style="padding: 12px; color: var(--fox-muted); font-size:12px; text-align:center;">Aucun produit trouvé</div>';
    suggestionsBox.style.display = 'block';
    return;
  }

  // Afficher les 8 premiers résultats correspondants
  suggestionsBox.innerHTML = '';
  matches.slice(0, 8).forEach(p => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    
    let stockLabel = `Stock: ${p.stock}`;
    let styleStock = '';
    if (p.stock === 0) {
      stockLabel = 'Rupture';
      styleStock = 'color: var(--danger); font-weight:700;';
    } else if (p.stock <= p.minStock) {
      stockLabel = `Stock bas: ${p.stock}`;
      styleStock = 'color: var(--warning);';
    }

    div.innerHTML = `
      <div class="item-details">
        <span class="item-name">${p.name}</span>
        <span class="item-meta" style="${styleStock}">Code: ${p.id} | ${stockLabel}</span>
      </div>
      <span class="item-price">${formatFCFA(p.price)}</span>
    `;
    
    // Au clic sur la suggestion : ajouter au panier, vider le champ et masquer
    div.onclick = () => {
      addToCart(p.id);
      e.target.value = '';
      suggestionsBox.style.display = 'none';
      e.target.focus();
    };
    
    suggestionsBox.appendChild(div);
  });
  suggestionsBox.style.display = 'block';
}


// ==========================================
// CONFIGURATION DES ECOUTEURS D'EVENEMENTS
// ==========================================
function setupEventHandlers() {
  // Fermeture des modaux
  document.getElementById('modal-product-close').addEventListener('click', () => document.getElementById('modal-product').classList.remove('active'));
  document.getElementById('btn-cancel-product').addEventListener('click', () => document.getElementById('modal-product').classList.remove('active'));
  document.getElementById('modal-client-close').addEventListener('click', () => document.getElementById('modal-client').classList.remove('active'));
  document.getElementById('btn-cancel-client').addEventListener('click', () => document.getElementById('modal-client').classList.remove('active'));
  document.getElementById('modal-invoice-close').addEventListener('click', () => document.getElementById('modal-invoice').classList.remove('active'));
  
  // Fermeture des nouveaux modaux
  document.getElementById('modal-supplier-close').addEventListener('click', () => document.getElementById('modal-supplier').classList.remove('active'));
  document.getElementById('btn-cancel-supplier').addEventListener('click', () => document.getElementById('modal-supplier').classList.remove('active'));
  document.getElementById('modal-po-close').addEventListener('click', () => document.getElementById('modal-po').classList.remove('active'));
  document.getElementById('btn-cancel-po').addEventListener('click', () => document.getElementById('modal-po').classList.remove('active'));
  document.getElementById('modal-client-details-close').addEventListener('click', () => document.getElementById('modal-client-details').classList.remove('active'));
  document.getElementById('modal-add-payment-close').addEventListener('click', () => document.getElementById('modal-add-payment').classList.remove('active'));
  document.getElementById('btn-cancel-payment').addEventListener('click', () => document.getElementById('modal-add-payment').classList.remove('active'));

  // Fermeture et gestion modal Bon de Livraison
  const modalDelivery = document.getElementById('modal-delivery');
  const btnCloseDelivery = document.getElementById('modal-delivery-close');
  const btnCancelDelivery = document.getElementById('btn-cancel-delivery');
  if (btnCloseDelivery) btnCloseDelivery.addEventListener('click', () => modalDelivery.classList.remove('active'));
  if (btnCancelDelivery) btnCancelDelivery.addEventListener('click', () => modalDelivery.classList.remove('active'));

  // Soumission formulaires CRUD et Paramètres
  document.getElementById('form-product').addEventListener('submit', saveProduct);
  document.getElementById('form-client').addEventListener('submit', saveClient);
  document.getElementById('form-supplier').addEventListener('submit', saveSupplier);
  document.getElementById('form-po').addEventListener('submit', savePO);
  document.getElementById('form-settings').addEventListener('submit', saveSettings);
  document.getElementById('form-payment').addEventListener('submit', savePayment);
  
  const formDelivery = document.getElementById('form-delivery');
  if (formDelivery) formDelivery.addEventListener('submit', saveDelivery);

  // Recherche & filtres produits
  document.getElementById('product-search').addEventListener('input', renderProducts);
  document.getElementById('product-filter-category').addEventListener('change', renderProducts);
  document.getElementById('product-filter-stock').addEventListener('change', renderProducts);
  document.getElementById('btn-add-product').addEventListener('click', openAddProductModal);

  // Recherche & filtres clients
  document.getElementById('client-search').addEventListener('input', renderClients);
  document.getElementById('client-filter-city').addEventListener('change', renderClients);
  document.getElementById('btn-add-client').addEventListener('click', openAddClientModal);

  // Recherche & filtres Devis / Factures (Onglet billing)
  document.getElementById('quote-search').addEventListener('input', renderQuotes);
  document.getElementById('quote-filter-status').addEventListener('change', renderQuotes);
  document.getElementById('order-search').addEventListener('input', renderOrders);
  document.getElementById('order-filter-status').addEventListener('change', renderOrders);

  // Recherche & filtres sous-onglets d'inventaire
  document.getElementById('supplier-search').addEventListener('input', renderSuppliers);
  document.getElementById('po-search').addEventListener('input', renderPurchaseOrders);
  document.getElementById('reception-search').addEventListener('input', renderReceptions);
  document.getElementById('delivery-search').addEventListener('input', renderDeliveries);
  document.getElementById('delivery-filter-status').addEventListener('change', renderDeliveries);

  document.getElementById('btn-add-supplier').addEventListener('click', openAddSupplierModal);
  document.getElementById('btn-add-supplier-fast').addEventListener('click', openAddSupplierModal);
  document.getElementById('btn-add-po').addEventListener('click', openAddPOModal);

  const btnAddDelivery = document.getElementById('btn-add-delivery');
  if (btnAddDelivery) btnAddDelivery.addEventListener('click', () => openAddDeliveryModal());

  // Création PO dans le modal
  document.getElementById('btn-add-po-item').addEventListener('click', addPOItemToCart);
  const poProductSelect = document.getElementById('po-product-select');
  if (poProductSelect) poProductSelect.addEventListener('change', handlePOProductChange);

  // Création Bon de Livraison dans le modal
  const btnAddDeliveryItem = document.getElementById('btn-add-delivery-item');
  if (btnAddDeliveryItem) btnAddDeliveryItem.addEventListener('click', addDeliveryItemToCart);

  const deliveryInvoiceSelect = document.getElementById('delivery-invoice-select');
  if (deliveryInvoiceSelect) deliveryInvoiceSelect.addEventListener('change', handleDeliveryInvoiceChange);

  const deliveryClientSelect = document.getElementById('delivery-client-select');
  if (deliveryClientSelect) deliveryClientSelect.addEventListener('change', handleDeliveryClientChange);

  // Panier ventes
  document.getElementById('order-product-search').addEventListener('input', renderOrderProductPicker);
  document.getElementById('order-product-category').addEventListener('change', renderOrderProductPicker);
  document.getElementById('btn-clear-cart').addEventListener('click', clearCart);
  document.getElementById('btn-validate-order').addEventListener('click', validateAndProcessOrder);
  document.getElementById('btn-add-client-fast').addEventListener('click', openAddClientModal);

  // Écouteur pour la saisie prédictive d'autocomplétion produit
  const autocompleteInput = document.getElementById('order-product-autocomplete');
  autocompleteInput.addEventListener('input', handleAutocompleteInput);

  // Fermer la boîte d'autocomplétion en cas de clic en dehors
  document.addEventListener('click', (e) => {
    const box = document.getElementById('autocomplete-suggestions-box');
    if (box && e.target !== autocompleteInput && !box.contains(e.target)) {
      box.style.display = 'none';
    }
  });

  // Écouteur pour la TVA à la volée dans le panier
  const vatCheckbox = document.getElementById('order-vat-applied-checkbox');
  if (vatCheckbox) {
    vatCheckbox.addEventListener('change', () => {
      let subtotalHt = 0;
      cart.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        subtotalHt += (product.price * item.quantity);
      });
      updateOrderSummary(subtotalHt);
    });
  }

  document.getElementById('order-discount-input').addEventListener('input', () => {
    let subtotalHt = 0;
    cart.forEach(item => {
      const product = state.products.find(p => p.id === item.productId);
      subtotalHt += (product.price * item.quantity);
    });
    updateOrderSummary(subtotalHt);
  });

  // Uploader & Supprimer Logo dans les Paramètres
  document.getElementById('settings-logo-input').addEventListener('change', handleLogoUpload);
  document.getElementById('btn-delete-logo').addEventListener('click', deleteUploadedLogo);

  // Impression & PDF
  document.getElementById('btn-print-invoice').addEventListener('click', printActiveDocument);
  document.getElementById('btn-download-pdf').addEventListener('click', downloadActiveDocument);

  // SUPABASE CLOUD CONFIGURATION & SYNC
  const supabaseForm = document.getElementById('form-supabase-config');
  if (supabaseForm) {
    supabaseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = document.getElementById('supabase-project-url').value;
      const key = document.getElementById('supabase-anon-key').value;
      const sync = document.getElementById('supabase-sync-enabled').checked;
      
      saveSupabaseConfig(url, key, sync);
      showToast('Configuration Supabase enregistrée !', 'success');
    });
  }

  const btnTestSupabase = document.getElementById('btn-test-supabase');
  if (btnTestSupabase) {
    btnTestSupabase.addEventListener('click', async () => {
      const url = document.getElementById('supabase-project-url').value.trim();
      const key = document.getElementById('supabase-anon-key').value.trim();
      if (!url || !key) {
        showToast('Veuillez renseigner l\'URL et la clé Anon de Supabase.', 'warning');
        return;
      }
      try {
        btnTestSupabase.disabled = true;
        btnTestSupabase.innerHTML = '<i data-lucide="loader"></i> Test en cours...';
        if (window.lucide) lucide.createIcons();

        await testSupabaseConnection(url, key);
        showToast('Connexion à Supabase établie avec succès !', 'success');
      } catch (err) {
        console.error(err);
        showToast('Échec connexion Supabase: ' + err.message, 'danger');
      } finally {
        btnTestSupabase.disabled = false;
        btnTestSupabase.innerHTML = '<i data-lucide="activity"></i> Tester la connexion';
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  const btnPushSupabase = document.getElementById('btn-push-supabase');
  if (btnPushSupabase) {
    btnPushSupabase.addEventListener('click', () => {
      if (confirm('Voulez-vous téléverser toutes vos données locales actuelles vers Supabase ? Les données distantes existantes seront mises à jour.')) {
        pushAllToSupabase();
      }
    });
  }

  const btnPullSupabase = document.getElementById('btn-pull-supabase');
  if (btnPullSupabase) {
    btnPullSupabase.addEventListener('click', () => {
      if (confirm('Voulez-vous charger toutes les données de Supabase et remplacer les données locales ?')) {
        pullAllFromSupabase();
      }
    });
  }

  const cloudBadge = document.getElementById('cloud-sync-badge');
  if (cloudBadge) {
    cloudBadge.addEventListener('click', () => {
      const settingsNav = document.querySelector('.nav-item[data-tab="settings"]');
      if (settingsNav) settingsNav.click();
    });
  }
}

// ==============================================================================
// MOTEUR DE CONNEXION ET SYNCHRONISATION SUPABASE CLOUD (DIRECT EMBED)
// ==============================================================================
const SUPABASE_STORAGE_KEY = 'fox_supabase_config';

let supabaseConfig = {
  url: 'https://hlfbhsghnfsvqqjeinlw.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZmJoc2dobmZzdnFxamVpbmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMTkyMjMsImV4cCI6MjEwNjg5NTIyM30.MCddKAthtRw4ip5Nv8xIqFgWAw6SPlchOLkM9jIKf-U',
  syncEnabled: true
};

let supabaseClient = null;
let isSyncing = false;

function initSupabase() {
  try {
    const saved = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (saved) {
      supabaseConfig = { ...supabaseConfig, ...JSON.parse(saved) };
    } else {
      localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(supabaseConfig));
    }
  } catch (e) {
    console.warn('Erreur chargement config Supabase:', e);
  }

  createSupabaseClientInstance();
  updateCloudStatusBadge();
}

function createSupabaseClientInstance() {
  if (supabaseConfig.url && supabaseConfig.anonKey && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
      console.log('✅ Client Supabase Cloud initialisé avec succès');
      return true;
    } catch (e) {
      console.error('Erreur instanciation Supabase:', e);
      supabaseClient = null;
      return false;
    }
  }
  return false;
}

function saveSupabaseConfig(url, anonKey, syncEnabled) {
  supabaseConfig.url = (url || '').trim();
  supabaseConfig.anonKey = (anonKey || '').trim();
  supabaseConfig.syncEnabled = !!syncEnabled;

  localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(supabaseConfig));
  createSupabaseClientInstance();
  updateCloudStatusBadge();

  if (supabaseClient && supabaseConfig.syncEnabled) {
    pullAllFromSupabase();
  }
}

function updateCloudStatusBadge() {
  const badge = document.getElementById('cloud-sync-badge');
  const text = document.getElementById('cloud-sync-text');
  if (!badge || !text) return;

  if (supabaseClient && supabaseConfig.syncEnabled) {
    badge.style.display = 'inline-flex';
    badge.className = 'date-badge cloud-online';
    badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    badge.style.color = '#10b981';
    text.textContent = 'Supabase Connecté';
    badge.title = 'Synchronisation Supabase Cloud active';
  } else if (supabaseConfig.url) {
    badge.style.display = 'inline-flex';
    badge.className = 'date-badge cloud-offline';
    badge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    badge.style.color = 'var(--warning)';
    text.textContent = 'Supabase Pause';
  } else {
    badge.style.display = 'inline-flex';
    badge.className = 'date-badge cloud-offline';
    badge.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    badge.style.color = 'var(--fox-muted)';
    text.textContent = 'Mode Local';
  }
  if (window.lucide) lucide.createIcons();
}

async function testSupabaseConnection(url, key) {
  if (!window.supabase) {
    throw new Error("Bibliothèque Supabase JS non disponible. Vérifiez votre connexion Internet.");
  }
  const client = window.supabase.createClient(url, key);
  const { data, error } = await client.from('company_info').select('id').limit(1);
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return true;
}

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
    console.warn(`Erreur sync Supabase (${entityName}):`, err);
  }
}

async function pushAllToSupabase() {
  if (!supabaseClient) {
    showToast("Veuillez d'abord connecter votre projet Supabase.", "warning");
    return;
  }

  try {
    showToast("Migration des données locales vers Supabase en cours...", "info");

    await pushEntityToSupabase('companyInfo', state.companyInfo);
    await pushEntityToSupabase('products', state.products);
    await pushEntityToSupabase('clients', state.clients);
    await pushEntityToSupabase('suppliers', state.suppliers);
    await pushEntityToSupabase('orders', state.orders);
    await pushEntityToSupabase('quotes', state.quotes);
    await pushEntityToSupabase('purchaseOrders', state.purchaseOrders);
    await pushEntityToSupabase('receptions', state.receptions);
    await pushEntityToSupabase('deliveryNotes', state.deliveryNotes);

    showToast("Toutes vos données locales ont été migrées vers Supabase avec succès !", "success");
    updateCloudStatusBadge();
  } catch (err) {
    console.error("Erreur Push All:", err);
    showToast("Erreur lors de la migration: " + err.message, "danger");
  }
}

async function pullAllFromSupabase() {
  if (!supabaseClient || isSyncing) return;
  isSyncing = true;

  try {
    showToast("Synchronisation avec Supabase Cloud en cours...", "info");

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

    const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'dashboard';
    triggerTabRender(activeTab);

    showToast("Données synchronisées avec Supabase Cloud !", "success");
    updateCloudStatusBadge();
  } catch (err) {
    console.error("Erreur Pull Supabase:", err);
    showToast("Erreur de synchronisation Supabase: " + err.message, "danger");
  } finally {
    isSyncing = false;
  }
}

