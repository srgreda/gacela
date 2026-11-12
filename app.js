/* ============================================================
   GACELA — Lógica de Interfaz Demo (Catálogo, Carrito, Croquis y WhatsApp)
   ============================================================ */

'use strict';

// Configuración de WhatsApp (cambia el prefijo de país si corresponde)
const WHATSAPP_COUNTRY_CODE = '591';
const WHATSAPP_NUMBER = '67992051';

const FREE_SHIPPING_THRESHOLD = 90;
const PROMO_CODE = 'GACELA10';
const PROMO_DISCOUNT_RATE = 0.1;
const CART_STORAGE_KEY = 'gacela_demo_cart_v1';

// 5 Prendas de Ejemplo — Catálogo GACELA Drop 01
const PRODUCTS = [
  {
    id: 'gacela-01',
    name: 'Polo Boxy Fit "Eclipse"',
    category: 'Parte Superior',
    price: 38.0,
    tag: 'NUEVO DROP',
    stock: 'En stock',
    fabric: 'Algodón Pima 280 GSM · Negro Mate',
    fit: 'Boxy Fit / Hombros caídos',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'assets/images/garment-1-boxy-tee.jpg',
    description:
      'Polo de silueta cuadrada y cuello rib grueso confeccionado en algodón peinado de 280 GSM. Diseñado para una caída estructurada y minimalista.'
  },
  {
    id: 'gacela-02',
    name: 'Hoodie Oversize "Obsidiana"',
    category: 'Hoodies',
    price: 72.0,
    tag: 'BEST SELLER',
    stock: 'Últimas unidades',
    fabric: 'Franela Reactiva 420 GSM · Sin cordones',
    fit: 'Oversize Drop Shoulder',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'assets/images/garment-2-hoodie.jpg',
    description:
      'Polerón pesado con capucha doble estructurada sin cordones, puños acanalados de alta densidad y bolsillo canguro oculto en negro profundo.'
  },
  {
    id: 'gacela-03',
    name: 'Pantalón Baggy Cargo "Noche"',
    category: 'Parte Inferior',
    price: 68.0,
    tag: 'LIMITADO',
    stock: 'En stock',
    fabric: 'Drill Pesado 100% Algodón · Mate',
    fit: 'Baggy Wide-Leg / Pinzas en rodilla',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'assets/images/garment-3-baggy-cargo.jpg',
    description:
      'Pantalón urbano de pierna ancha con pinzas articuladas en rodilla y bolsillos cargo ocultos de perfil limpio para mantener la línea monocroma.'
  },
  {
    id: 'gacela-04',
    name: 'Chaqueta Bomber "Gacela V1"',
    category: 'Outerwear',
    price: 95.0,
    tag: 'CAPSULE',
    stock: 'Edición Limitada',
    fabric: 'Nylon Técnico Repelente · Cierre Metálico',
    fit: 'Cropped Estructurado',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'assets/images/garment-4-bomber.jpg',
    description:
      'Chaqueta bomber corta de acabado técnico mate con cierre metálico negro, bolsillos laterales con solapa y forro interior respirable.'
  },
  {
    id: 'gacela-05',
    name: 'Zero Sleeve "Sombra"',
    category: 'Parte Superior',
    price: 34.0,
    tag: 'DROP 01',
    stock: 'En stock',
    fabric: 'Jersey Peinado 260 GSM · Acid Wash',
    fit: 'Relaxed Boxy Sin Mangas',
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'assets/images/garment-5-zero-sleeve.jpg',
    description:
      'Prenda sin mangas de sisas amplias y lavado ácido carbón oscuro. Ideal para layering urbano sobre mangas largas o uso individual.'
  }
];

// Estado de la aplicación
const state = {
  activeCategory: 'all',
  searchQuery: '',
  sortOrder: 'featured',
  selectedSizes: Object.fromEntries(PRODUCTS.map((p) => [p.id, 'M'])),
  cart: loadCartFromStorage(),
  promoApplied: false,
  mapZoom: 1,
  routeVisible: true
};

// ============================================================
// UTILIDADES
// ============================================================
function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function buildWhatsAppUrl(message) {
  const fullPhone = `${WHATSAPP_COUNTRY_CODE}${WHATSAPP_NUMBER}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
  } catch {
    // Ignorar errores de almacenamiento si el navegador restringe localStorage
  }
}

function showToast(text) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

function waIconSvg() {
  return `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  `;
}

// ============================================================
// RENDERIZADO DEL CATÁLOGO
// ============================================================
function getFilteredProducts() {
  const query = state.searchQuery.trim().toLowerCase();

  let list = PRODUCTS.filter((product) => {
    const matchesCategory =
      state.activeCategory === 'all' || product.category === state.activeCategory;
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.fabric.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (state.sortOrder === 'price-asc') {
    list = [...list].sort((a, b) => a.price - b.price);
  } else if (state.sortOrder === 'price-desc') {
    list = [...list].sort((a, b) => b.price - a.price);
  }

  return list;
}

function renderCatalog() {
  const grid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyCatalogState');
  const countEl = document.getElementById('catalogResultCount');
  if (!grid || !emptyState || !countEl) return;

  const filtered = getFilteredProducts();
  countEl.textContent = `Mostrando ${filtered.length} de ${PRODUCTS.length} prendas`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  const cardsHtml = filtered
    .map((product) => {
      const selectedSize = state.selectedSizes[product.id] || 'M';
      const sizeButtons = product.sizes
        .map(
          (size) => `
            <button
              type="button"
              class="size-btn ${size === selectedSize ? 'active' : ''}"
              data-action="select-size"
              data-product-id="${product.id}"
              data-size="${size}"
              aria-pressed="${size === selectedSize}"
            >
              ${size}
            </button>
          `
        )
        .join('');

      const waMessage = `Hola GACELA, quiero consultar disponibilidad de "${product.name}" en talla ${selectedSize} (${formatMoney(product.price)}).`;

      return `
        <article class="product-card" data-product-id="${product.id}">
          <div class="product-media">
            <span class="product-tag">${product.tag}</span>
            <button
              type="button"
              class="quickview-trigger"
              data-action="quick-view"
              data-product-id="${product.id}"
            >
              Vista rápida
            </button>
            <img
              src="${product.image}"
              alt="${product.name} — ${product.fabric}"
              class="product-img"
              loading="lazy"
              data-action="quick-view"
              data-product-id="${product.id}"
              style="cursor: pointer;"
            />
          </div>

          <div class="product-body">
            <div class="product-meta-top">
              <span class="product-category">${product.category}</span>
              <span class="product-stock">${product.stock}</span>
            </div>

            <h3 class="product-title">${product.name}</h3>
            <p class="product-spec">${product.fabric}</p>

            <div class="product-price-row">
              <span class="product-price">${formatMoney(product.price)}</span>
            </div>

            <div class="size-row" role="group" aria-label="Tallas para ${product.name}">
              <span class="size-label">Talla:</span>
              ${sizeButtons}
            </div>

            <div class="product-actions">
              <button
                type="button"
                class="btn btn-primary btn-card-add"
                data-action="add-to-cart"
                data-product-id="${product.id}"
              >
                Agregar al Carrito
              </button>
              <a
                href="${buildWhatsAppUrl(waMessage)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-card-wa"
                title="Consultar prenda por WhatsApp ${WHATSAPP_NUMBER}"
                aria-label="Consultar ${product.name} por WhatsApp"
              >
                ${waIconSvg()}
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  // Tarjeta editorial complementaria cuando se muestran todas las 5 prendas
  const editorialCardHtml =
    filtered.length === PRODUCTS.length
      ? `
        <aside class="editorial-promo-card">
          <div>
            <span class="editorial-promo-code">SERVICIO PERSONALIZADO</span>
            <h3 class="editorial-promo-title">¿DUDAS CON TU TALLA O COMBINACIÓN?</h3>
            <p class="editorial-promo-text">
              Nuestro equipo te asesora en vivo sobre calce boxy fit, medidas reales y envíos
              inmediatos por WhatsApp.
            </p>
          </div>
          <div class="editorial-promo-actions">
            <a
              href="${buildWhatsAppUrl('Hola GACELA, necesito asesoría para elegir mi talla.')}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary btn-full"
            >
              ${waIconSvg()}
              <span>Asesoría WhatsApp · ${WHATSAPP_NUMBER}</span>
            </a>
            <button type="button" class="btn btn-outline btn-full" id="inlineSizeGuideBtn">
              Ver Tabla de Medidas
            </button>
          </div>
        </aside>
      `
      : '';

  grid.innerHTML = cardsHtml + editorialCardHtml;

  const inlineGuideBtn = document.getElementById('inlineSizeGuideBtn');
  if (inlineGuideBtn) {
    inlineGuideBtn.addEventListener('click', openSizeGuideModal);
  }
}

// ============================================================
// CARRITO DE COMPRAS
// ============================================================
function addToCart(productId, sizeOverride) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const size = sizeOverride || state.selectedSizes[productId] || 'M';
  const existing = state.cart.find((item) => item.id === productId && item.size === size);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      quantity: 1
    });
  }

  saveCartToStorage();
  renderCart();
  showToast(`Agregado: ${product.name} (${size})`);
  openCartDrawer();
}

function updateCartQuantity(index, delta) {
  const item = state.cart[index];
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart.splice(index, 1);
  }

  saveCartToStorage();
  renderCart();
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  saveCartToStorage();
  renderCart();
}

function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = state.promoApplied ? subtotal * PROMO_DISCOUNT_RATE : 0;
  const total = Math.max(0, subtotal - discount);
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, discount, total, totalCount };
}

function renderCart() {
  const badge = document.getElementById('cartCountBadge');
  const drawerCount = document.getElementById('cartDrawerCount');
  const itemsContainer = document.getElementById('cartItemsContainer');
  const footer = document.getElementById('cartFooter');
  const shippingText = document.getElementById('shippingProgressText');
  const shippingBar = document.getElementById('shippingProgressBar');
  const subtotalEl = document.getElementById('cartSubtotalValue');
  const discountRow = document.getElementById('cartDiscountRow');
  const discountEl = document.getElementById('cartDiscountValue');
  const totalEl = document.getElementById('cartTotalValue');

  if (!itemsContainer || !footer) return;

  const { subtotal, discount, total, totalCount } = calculateCartTotals();

  if (badge) badge.textContent = String(totalCount);
  if (drawerCount) drawerCount.textContent = String(totalCount);

  // Barra de envío gratis
  const progressPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  if (shippingBar) shippingBar.style.width = `${progressPct}%`;
  if (shippingText) {
    if (subtotal === 0) {
      shippingText.textContent = `Agrega ${formatMoney(FREE_SHIPPING_THRESHOLD)} para obtener envío gratis`;
    } else if (subtotal < FREE_SHIPPING_THRESHOLD) {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      shippingText.textContent = `Te faltan ${formatMoney(remaining)} para envío gratis`;
    } else {
      shippingText.textContent = '¡Envío gratis desbloqueado en tu pedido!';
    }
  }

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <p>Tu carrito está vacío por ahora. Explora nuestras 5 prendas del Drop 01.</p>
        <button type="button" class="btn btn-outline" id="emptyCartExploreBtn">
          Explorar Catálogo
        </button>
      </div>
    `;
    footer.hidden = true;

    const exploreBtn = document.getElementById('emptyCartExploreBtn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        closeAllPanels();
        document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
    return;
  }

  footer.hidden = false;

  itemsContainer.innerHTML = state.cart
    .map(
      (item, index) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-info">
            <div>
              <div class="cart-item-top">
                <span class="cart-item-title">${item.name}</span>
                <button
                  type="button"
                  class="cart-item-remove"
                  data-cart-action="remove"
                  data-index="${index}"
                >
                  Quitar
                </button>
              </div>
              <p class="cart-item-meta">Talla: <strong>${item.size}</strong></p>
            </div>

            <div class="cart-item-bottom">
              <div class="qty-control">
                <button
                  type="button"
                  class="qty-btn"
                  data-cart-action="dec"
                  data-index="${index}"
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span class="qty-value">${item.quantity}</span>
                <button
                  type="button"
                  class="qty-btn"
                  data-cart-action="inc"
                  data-index="${index}"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
              <span class="cart-item-price">${formatMoney(item.price * item.quantity)}</span>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
  if (discountRow && discountEl) {
    discountRow.hidden = !state.promoApplied;
    discountEl.textContent = `-${formatMoney(discount)}`;
  }
  if (totalEl) totalEl.textContent = formatMoney(total);
}

// ============================================================
// DRAWERS Y MODALES
// ============================================================
function closeAllPanels() {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const quickViewModal = document.getElementById('quickViewModal');
  const infoModal = document.getElementById('infoModal');

  cartDrawer?.classList.remove('is-open');
  cartDrawer?.setAttribute('aria-hidden', 'true');
  if (cartBackdrop) cartBackdrop.hidden = true;

  mobileDrawer?.classList.remove('is-open');
  mobileDrawer?.setAttribute('aria-hidden', 'true');
  if (mobileBackdrop) mobileBackdrop.hidden = true;
  mobileToggle?.setAttribute('aria-expanded', 'false');

  if (modalBackdrop) modalBackdrop.hidden = true;
  if (quickViewModal) quickViewModal.hidden = true;
  if (infoModal) infoModal.hidden = true;

  document.body.classList.remove('no-scroll');
}

function openCartDrawer() {
  closeAllPanels();
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (!drawer || !backdrop) return;

  backdrop.hidden = false;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

function openMobileNav() {
  closeAllPanels();
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const toggle = document.getElementById('mobileMenuToggle');
  if (!drawer || !backdrop) return;

  backdrop.hidden = false;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  toggle?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');
}

function openQuickViewModal(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('modalBackdrop');
  const body = document.getElementById('quickViewBody');
  if (!product || !modal || !backdrop || !body) return;

  closeAllPanels();
  let activeSize = state.selectedSizes[product.id] || 'M';

  const renderQuickViewContent = () => {
    const sizeBtns = product.sizes
      .map(
        (size) => `
          <button
            type="button"
            class="size-btn ${size === activeSize ? 'active' : ''}"
            data-qv-size="${size}"
          >
            ${size}
          </button>
        `
      )
      .join('');

    const waMsg = `Hola GACELA, me interesa "${product.name}" en talla ${activeSize} (${formatMoney(product.price)}).`;

    body.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="quickview-img" />
      <div>
        <span class="section-kicker">${product.category} · ${product.tag}</span>
        <h2 class="qv-title" id="qvTitle">${product.name}</h2>
        <p class="qv-price">${formatMoney(product.price)}</p>
        <p class="qv-desc">${product.description}</p>

        <div class="qv-specs">
          <div><strong>Material:</strong> ${product.fabric}</div>
          <div><strong>Calce:</strong> ${product.fit}</div>
          <div><strong>Disponibilidad:</strong> ${product.stock}</div>
        </div>

        <div class="size-row">
          <span class="size-label">Talla:</span>
          ${sizeBtns}
        </div>

        <div class="qv-actions">
          <button type="button" class="btn btn-primary btn-full" id="qvAddToCartBtn">
            Agregar al Carrito — ${formatMoney(product.price)}
          </button>
          <a
            href="${buildWhatsAppUrl(waMsg)}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline btn-full"
          >
            ${waIconSvg()}
            <span>Consultar por WhatsApp (${WHATSAPP_NUMBER})</span>
          </a>
        </div>
      </div>
    `;

    body.querySelectorAll('[data-qv-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeSize = btn.getAttribute('data-qv-size');
        state.selectedSizes[product.id] = activeSize;
        renderCatalog();
        renderQuickViewContent();
      });
    });

    document.getElementById('qvAddToCartBtn')?.addEventListener('click', () => {
      addToCart(product.id, activeSize);
    });
  };

  renderQuickViewContent();
  backdrop.hidden = false;
  modal.hidden = false;
  document.body.classList.add('no-scroll');
}

function openInfoModal(title, htmlContent) {
  const modal = document.getElementById('infoModal');
  const backdrop = document.getElementById('modalBackdrop');
  const body = document.getElementById('infoModalBody');
  if (!modal || !backdrop || !body) return;

  closeAllPanels();

  body.innerHTML = `
    <span class="section-kicker">GACELA STORE</span>
    <h2 class="qv-title" id="infoModalTitle">${title}</h2>
    ${htmlContent}
  `;

  backdrop.hidden = false;
  modal.hidden = false;
  document.body.classList.add('no-scroll');
}

function openSizeGuideModal() {
  openInfoModal(
    'Guía de Tallas Boxy & Oversize',
    `
      <p class="qv-desc">
        Nuestras siluetas presentan caída amplia contemporánea. Medidas referenciales en centímetros (cm):
      </p>
      <table class="size-table">
        <thead>
          <tr>
            <th>Talla</th>
            <th>Pecho (cm)</th>
            <th>Largo Sup. (cm)</th>
            <th>Cintura Cargo (cm)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>S</td><td>56</td><td>68</td><td>74 – 78</td></tr>
          <tr><td>M</td><td>59</td><td>71</td><td>80 – 84</td></tr>
          <tr><td>L</td><td>62</td><td>74</td><td>86 – 90</td></tr>
          <tr><td>XL</td><td>65</td><td>77</td><td>92 – 96</td></tr>
        </tbody>
      </table>
      <a
        href="${buildWhatsAppUrl('Hola GACELA, quisiera ayuda para elegir mi talla exacta.')}"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-primary btn-full"
      >
        ${waIconSvg()}
        <span>Consultar talla por WhatsApp · ${WHATSAPP_NUMBER}</span>
      </a>
    `
  );
}

// ============================================================
// CHECKOUT WHATSAPP Y DEMO
// ============================================================
function handleWhatsAppCheckout() {
  if (state.cart.length === 0) return;

  const { subtotal, discount, total } = calculateCartTotals();
  const lines = state.cart.map(
    (item, idx) =>
      `${idx + 1}. ${item.name} (Talla ${item.size}) x${item.quantity} — ${formatMoney(item.price * item.quantity)}`
  );

  const summaryParts = [
    'Hola GACELA! Quiero realizar el siguiente pedido desde su tienda web:',
    '',
    ...lines,
    '',
    `Subtotal: ${formatMoney(subtotal)}`
  ];

  if (state.promoApplied) {
    summaryParts.push(`Descuento (${PROMO_CODE}): -${formatMoney(discount)}`);
  }

  summaryParts.push(`Total estimado: ${formatMoney(total)}`);
  summaryParts.push('Por favor indíquenme los datos de pago y envío. Gracias.');

  window.open(buildWhatsAppUrl(summaryParts.join('\n')), '_blank', 'noopener,noreferrer');
}

function handleDemoCheckout() {
  if (state.cart.length === 0) return;

  const { total, totalCount } = calculateCartTotals();
  const orderCode = `GCL-${Math.floor(100000 + Math.random() * 900000)}`;

  const itemsSnapshot = state.cart
    .map((item) => `<li>${item.quantity}× ${item.name} (Talla ${item.size}) — ${formatMoney(item.price * item.quantity)}</li>`)
    .join('');

  state.cart = [];
  state.promoApplied = false;
  const promoInput = document.getElementById('promoCodeInput');
  const promoFeedback = document.getElementById('promoFeedback');
  if (promoInput) promoInput.value = '';
  if (promoFeedback) promoFeedback.textContent = '';
  saveCartToStorage();
  renderCart();

  openInfoModal(
    'Pedido Demo Confirmado',
    `
      <p class="qv-desc">
        Referencia generada: <strong>#${orderCode}</strong><br />
        Resumen de ${totalCount} prenda(s) por un total de <strong>${formatMoney(total)}</strong>.
      </p>
      <ul style="display:grid;gap:0.4rem;font-size:0.85rem;color:var(--text-secondary);margin-bottom:1.5rem;padding-left:1rem;list-style:disc;">
        ${itemsSnapshot}
      </ul>
      <p class="qv-desc" style="font-size:0.8rem;">
        * Esta es una simulación de demostración web. Para concretar pedidos reales, utiliza nuestro canal directo de WhatsApp.
      </p>
      <button type="button" class="btn btn-primary btn-full" id="closeConfirmDemoBtn">
        Seguir Explorando GACELA
      </button>
    `
  );

  document.getElementById('closeConfirmDemoBtn')?.addEventListener('click', closeAllPanels);
}

// ============================================================
// CROQUIS INTERACTIVO
// ============================================================
function initCroquisMap() {
  const svg = document.getElementById('croquisSvg');
  const activeLabel = document.getElementById('croquisActiveLabel');
  const routePath = document.getElementById('pedestrianRoute');
  const toggleRouteBtn = document.getElementById('toggleRouteBtn');
  const zoomInBtn = document.getElementById('zoomInMapBtn');
  const zoomOutBtn = document.getElementById('zoomOutMapBtn');
  const resetBtn = document.getElementById('resetMapBtn');

  if (!svg) return;

  const pins = document.querySelectorAll('.map-pin');
  const chips = document.querySelectorAll('.legend-chip');

  function focusPin(pinId) {
    pins.forEach((p) => {
      const match = p.getAttribute('data-pin-id') === pinId;
      p.classList.toggle('active', match);
      if (match && activeLabel) {
        activeLabel.textContent = p.getAttribute('data-label') || 'Gacela vip — Calle Colón entre Ingavi y 15 de Abril, Tarija';
      }
    });

    chips.forEach((chip) => {
      chip.classList.toggle('active', chip.getAttribute('data-focus-pin') === pinId);
    });
  }

  pins.forEach((pin) => {
    const id = pin.getAttribute('data-pin-id');
    pin.addEventListener('click', () => focusPin(id));
    pin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        focusPin(id);
      }
    });
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      focusPin(chip.getAttribute('data-focus-pin'));
    });
  });

  function applyZoom() {
    svg.style.transform = `scale(${state.mapZoom})`;
  }

  zoomInBtn?.addEventListener('click', () => {
    state.mapZoom = Math.min(1.55, Number((state.mapZoom + 0.15).toFixed(2)));
    applyZoom();
  });

  zoomOutBtn?.addEventListener('click', () => {
    state.mapZoom = Math.max(1, Number((state.mapZoom - 0.15).toFixed(2)));
    applyZoom();
  });

  resetBtn?.addEventListener('click', () => {
    state.mapZoom = 1;
    applyZoom();
    focusPin('gacela');
  });

  toggleRouteBtn?.addEventListener('click', () => {
    state.routeVisible = !state.routeVisible;
    routePath?.classList.toggle('is-hidden', !state.routeVisible);
    toggleRouteBtn.classList.toggle('active', state.routeVisible);
  });
}

// ============================================================
// INICIALIZACIÓN Y EVENTOS
// ============================================================
function initEvents() {
  // Delegación de eventos en el grid del catálogo
  const productGrid = document.getElementById('productGrid');
  productGrid?.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const productId = target.getAttribute('data-product-id');

    if (action === 'select-size') {
      const size = target.getAttribute('data-size');
      if (productId && size) {
        state.selectedSizes[productId] = size;
        renderCatalog();
      }
    } else if (action === 'add-to-cart' && productId) {
      addToCart(productId);
    } else if (action === 'quick-view' && productId) {
      openQuickViewModal(productId);
    }
  });

  // Filtros de categoría
  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      state.activeCategory = pill.getAttribute('data-category') || 'all';
      renderCatalog();
    });
  });

  // Ordenar catálogo
  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    state.sortOrder = e.target.value;
    renderCatalog();
  });

  // Búsqueda
  const searchBtn = document.getElementById('searchToggleBtn');
  const searchPanel = document.getElementById('searchBarPanel');
  const searchInput = document.getElementById('catalogSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  searchBtn?.addEventListener('click', () => {
    if (!searchPanel) return;
    const isHidden = searchPanel.hidden;
    searchPanel.hidden = !isHidden;
    searchBtn.setAttribute('aria-expanded', String(isHidden));
    if (isHidden) {
      searchInput?.focus();
    }
  });

  searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderCatalog();
  });

  clearSearchBtn?.addEventListener('click', () => {
    state.searchQuery = '';
    if (searchInput) searchInput.value = '';
    renderCatalog();
  });

  document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
    state.activeCategory = 'all';
    state.searchQuery = '';
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.filter-pill').forEach((p) => {
      const isAll = p.getAttribute('data-category') === 'all';
      p.classList.toggle('active', isAll);
      p.setAttribute('aria-selected', String(isAll));
    });
    renderCatalog();
  });

  // Carrito Drawer
  document.getElementById('openCartBtn')?.addEventListener('click', openCartDrawer);
  document.getElementById('footerCartBtn')?.addEventListener('click', openCartDrawer);
  document.getElementById('closeCartBtn')?.addEventListener('click', closeAllPanels);
  document.getElementById('cartBackdrop')?.addEventListener('click', closeAllPanels);

  document.getElementById('cartItemsContainer')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-cart-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-cart-action');
    const index = Number(btn.getAttribute('data-index'));
    if (Number.isNaN(index)) return;

    if (action === 'inc') updateCartQuantity(index, 1);
    else if (action === 'dec') updateCartQuantity(index, -1);
    else if (action === 'remove') removeCartItem(index);
  });

  // Código promocional
  document.getElementById('promoCodeForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('promoCodeInput');
    const feedback = document.getElementById('promoFeedback');
    if (!input || !feedback) return;

    const code = input.value.trim().toUpperCase();
    if (code === PROMO_CODE) {
      state.promoApplied = true;
      feedback.textContent = 'Código GACELA10 aplicado (10% de descuento).';
      renderCart();
    } else {
      state.promoApplied = false;
      feedback.textContent = 'Código inválido. Prueba con GACELA10.';
      renderCart();
    }
  });

  document.getElementById('checkoutWhatsAppBtn')?.addEventListener('click', handleWhatsAppCheckout);
  document.getElementById('checkoutDemoBtn')?.addEventListener('click', handleDemoCheckout);

  // Menú móvil
  document.getElementById('mobileMenuToggle')?.addEventListener('click', openMobileNav);
  document.getElementById('closeMobileNavBtn')?.addEventListener('click', closeAllPanels);
  document.getElementById('mobileNavBackdrop')?.addEventListener('click', closeAllPanels);
  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', closeAllPanels);
  });

  // Modales
  document.getElementById('modalBackdrop')?.addEventListener('click', closeAllPanels);
  document.getElementById('closeQuickViewBtn')?.addEventListener('click', closeAllPanels);
  document.getElementById('closeInfoModalBtn')?.addEventListener('click', closeAllPanels);
  document.getElementById('openSizeGuideBtn')?.addEventListener('click', openSizeGuideModal);
  document.getElementById('footerSizeGuideBtn')?.addEventListener('click', openSizeGuideModal);

  // Newsletter demo
  document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    if (emailInput && emailInput.value.trim()) {
      showToast(`Suscripción confirmada para ${emailInput.value.trim()}`);
      emailInput.value = '';
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllPanels();
    }
  });
}

// Arranque
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  renderCart();
  initCroquisMap();
  initEvents();
});
