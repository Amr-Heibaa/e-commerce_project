/* =========================================================
   admin.js  —  Perfume Store Admin Panel
   ========================================================= */

/* ─── Auth Guard ─────────────────────────────────────────── */
function requireAdminPage() {
    if (!api.isLoggedIn()) { window.location.href = '/login.html'; return; }
    if (!api.isAdmin())    { window.location.href = '/index.html'; }
}

/* ─── Utilities ──────────────────────────────────────────── */
function adminMoney(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function normalizeList(response) {
    if (!response) return [];
    if (Array.isArray(response))         return response;
    if (Array.isArray(response.content)) return response.content;
    if (Array.isArray(response.data))    return response.data;
    return [];
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

/* ─── Toast Notifications ────────────────────────────────── */
(function createToastContainer() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _mountToast);
    } else {
        _mountToast();
    }
    function _mountToast() {
        if (document.getElementById('adminToastStack')) return;
        const el = document.createElement('div');
        el.id = 'adminToastStack';
        el.style.cssText = `
            position:fixed; bottom:28px; right:28px; z-index:9999;
            display:flex; flex-direction:column; gap:10px; pointer-events:none;
        `;
        document.body.appendChild(el);
    }
})();

function showToast(message, type = 'success') {
    const stack = document.getElementById('adminToastStack');
    if (!stack) return;

    const colors = {
        success: { bg: 'rgba(21,128,61,0.18)', border: 'rgba(74,222,128,0.35)', text: '#86efac', icon: '✓' },
        error:   { bg: 'rgba(153,27,27,0.18)', border: 'rgba(248,113,113,0.35)', text: '#fca5a5', icon: '✕' },
        info:    { bg: 'rgba(202,138,4,0.15)',  border: 'rgba(234,179,8,0.35)',  text: '#fde68a', icon: 'ℹ' },
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.style.cssText = `
        display:flex; align-items:center; gap:10px;
        background:${c.bg}; border:1px solid ${c.border}; color:${c.text};
        padding:12px 18px; border-radius:14px; font-size:13px;
        backdrop-filter:blur(12px); pointer-events:auto;
        box-shadow:0 8px 32px rgba(0,0,0,0.4);
        transform:translateX(120%); transition:transform .35s cubic-bezier(.22,1,.36,1);
        max-width:320px; min-width:200px; line-height:1.4;
    `;
    toast.innerHTML = `<span style="font-size:16px;flex-shrink:0">${c.icon}</span><span>${escapeHtml(message)}</span>`;
    stack.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    });

    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3800);
}

/* Legacy banner (kept for any direct callers in HTML) */
function showAdminMessage(id, message, type = 'success') {
    showToast(message, type);
    const box = document.getElementById(id);
    if (!box) return;
    const successClass = 'mb-6 rounded-xl px-4 py-3 text-sm bg-green-500/20 border border-green-400/40 text-green-200';
    const errorClass   = 'mb-6 rounded-xl px-4 py-3 text-sm bg-red-500/20 border border-red-400/40 text-red-200';
    box.textContent = message;
    box.className   = type === 'success' ? successClass : errorClass;
    setTimeout(() => { box.className = 'hidden'; }, 4000);
}

/* ─── Confirm Modal ──────────────────────────────────────── */
function adminConfirm(message) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed; inset:0; background:rgba(0,0,0,.75);
            backdrop-filter:blur(6px); z-index:10000;
            display:flex; align-items:center; justify-content:center;
            opacity:0; transition:opacity .2s ease;
        `;
        overlay.innerHTML = `
            <div style="
                background:#0f0f0f; border:1px solid rgba(202,138,4,.35);
                border-radius:20px; padding:32px 36px; max-width:420px; width:90%;
                box-shadow:0 24px 64px rgba(0,0,0,.7);
                transform:scale(.95); transition:transform .25s cubic-bezier(.22,1,.36,1);
            ">
                <p style="font-family:serif; font-size:1.15rem; color:#fff; margin-bottom:10px;">Confirm Action</p>
                <p style="color:#9ca3af; font-size:.9rem; margin-bottom:28px; line-height:1.5;">${escapeHtml(message)}</p>
                <div style="display:flex; gap:12px; justify-content:flex-end;">
                    <button id="confirmCancel" style="
                        padding:10px 22px; border-radius:12px; border:1px solid rgba(202,138,4,.4);
                        background:transparent; color:#ca8a04; cursor:pointer; font-size:.85rem; transition:background .2s;
                    ">Cancel</button>
                    <button id="confirmOk" style="
                        padding:10px 22px; border-radius:12px; border:none;
                        background:linear-gradient(135deg,#ca8a04,#a16207); color:#000;
                        cursor:pointer; font-size:.85rem; font-weight:600; transition:opacity .2s;
                    ">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('div').style.transform = 'scale(1)';
        });
        const close = val => {
            overlay.style.opacity = '0';
            overlay.querySelector('div').style.transform = 'scale(.95)';
            setTimeout(() => { overlay.remove(); resolve(val); }, 220);
        };
        overlay.querySelector('#confirmOk').addEventListener('click',     () => close(true));
        overlay.querySelector('#confirmCancel').addEventListener('click',  () => close(false));
        overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
    });
}

/* ─── Skeleton Loader ────────────────────────────────────── */
function skeletonRows(count = 3, cols = 1) {
    return Array.from({ length: count }, () => `
        <div class="border border-yellow-500/10 rounded-2xl p-5 animate-pulse">
            <div style="height:12px;width:80px;background:rgba(202,138,4,.12);border-radius:6px;margin-bottom:10px;"></div>
            <div style="height:18px;width:55%;background:rgba(255,255,255,.06);border-radius:6px;margin-bottom:8px;"></div>
            <div style="height:13px;width:70%;background:rgba(255,255,255,.04);border-radius:6px;"></div>
        </div>
    `).join('');
}

/* ─── Animated Counter ───────────────────────────────────── */
function animateCount(el, target) {
    if (!el) return;
    const num = parseInt(target, 10);
    if (isNaN(num)) { el.textContent = target; return; }
    const duration = 800, step = 16;
    const steps = duration / step;
    let current = 0, frame = 0;
    const timer = setInterval(() => {
        frame++;
        current = Math.round(num * (frame / steps));
        el.textContent = current;
        if (frame >= steps) { el.textContent = num; clearInterval(timer); }
    }, step);
}

/* ─── Status Badge Helper ────────────────────────────────── */
function statusBadge(status) {
    const map = {
        PENDING:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        SHIPPED:   'bg-purple-500/20 text-purple-300 border-purple-500/30',
        DELIVERED: 'bg-green-500/20  text-green-300  border-green-500/30',
        CANCELLED: 'bg-red-500/20    text-red-300    border-red-500/30',
        APPROVED:  'bg-green-500/20  text-green-300  border-green-500/30',
        REJECTED:  'bg-red-500/20    text-red-300    border-red-500/30',
    };
    const cls = map[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    return `<span class="inline-block rounded-full px-3 py-1 text-xs border ${cls}">${escapeHtml(status)}</span>`;
}

/* =========================================================
   DASHBOARD
   ========================================================= */
async function loadAdminDashboard() {
    const ids = ['productCount','categoryCount','orderCount','refundCount'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '…'; });

    try {
        const [productsRes, categoriesRes] = await Promise.allSettled([
            api.get('/products'),
            api.get('/categories')
        ]);
        const products   = productsRes.status   === 'fulfilled' ? normalizeList(productsRes.value)   : [];
        const categories = categoriesRes.status === 'fulfilled' ? normalizeList(categoriesRes.value) : [];

        animateCount(document.getElementById('productCount'),  products.length);
        animateCount(document.getElementById('categoryCount'), categories.length);

        try {
            const orders = normalizeList(await api.get('/admin/orders'));
            animateCount(document.getElementById('orderCount'), orders.length);

            // Revenue summary
            const totalRevenue = orders
                .filter(o => o.status === 'PAID' || o.status === 'DELIVERED')
                .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
            const revenueEl = document.getElementById('revenueCount');
            if (revenueEl) revenueEl.textContent = adminMoney(totalRevenue);
        } catch {
            const el = document.getElementById('orderCount');
            if (el) el.textContent = '—';
        }

        try {
            const refunds = normalizeList(await api.get('/admin/refunds'));
            animateCount(document.getElementById('refundCount'), refunds.length);
        } catch {
            const el = document.getElementById('refundCount');
            if (el) el.textContent = '—';
        }

    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

/* =========================================================
   CATEGORIES
   ========================================================= */
async function loadCategories() {
    const container = document.getElementById('categoriesTable');
    if (!container) return;
    container.innerHTML = skeletonRows(3);

    try {
        const [categoriesResponse, productsResponse] = await Promise.all([
            api.get('/categories'),
            api.get('/products')
        ]);
        const categories = normalizeList(categoriesResponse);
        const products = normalizeList(productsResponse);

        if (categories.length === 0) {
            container.innerHTML = _emptyState('No categories yet. Add your first one using the form.');
            return;
        }
        container.innerHTML = categories.map((category, index) => {
            const categoryProducts = products.filter(product => product.categoryId === category.id);
            return categoryRow(category, categoryProducts, index + 1);
        }).join('');
    } catch (error) {
        container.innerHTML = _errorState(error.message);
    }
}

function categoryRow(category, products = [], displayNumber = category.id) {
    const safeCategory = JSON.stringify(category).replace(/'/g, "&#39;");
    return `
    <div class="admin-category-card">
        <div class="admin-category-summary">
            <div class="admin-category-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.5">
                    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
                </svg>
            </div>
            <div class="admin-category-main">
                <p class="gold-text text-xs uppercase tracking-[0.25em] mb-1">Category #${escapeHtml(String(displayNumber))}</p>
                <h3 class="text-lg font-serif">${escapeHtml(category.name)}</h3>
                <p class="text-gray-400 text-sm mt-1">${escapeHtml(category.description || 'No description')}</p>
                <p class="admin-category-count">${products.length} product${products.length !== 1 ? 's' : ''}</p>
                <div class="admin-category-products">
                    ${products.length
                        ? products.map(product => `
                            <a href="/product-details.html?id=${product.id}" class="admin-category-product-pill">
                                ${escapeHtml(product.name)}
                            </a>
                        `).join('')
                        : '<span class="admin-category-empty">No linked products</span>'}
                </div>
            </div>
        </div>
        <div class="admin-category-actions">
            <button onclick='editCategory(${safeCategory})' class="outline-gold rounded-xl px-4 py-2 text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
            </button>
            <button onclick="deleteCategory(${category.id})"
                    class="rounded-xl px-4 py-2 text-sm border border-red-400/40 text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
                Delete
            </button>
        </div>
    </div>`;
}

async function saveCategory(event) {
    event.preventDefault();
    const form = event.target;
    const id   = form.categoryId.value;
    const btn  = form.querySelector('button[type="submit"]');

    const payload = {
        name:        form.name.value.trim(),
        description: form.description.value.trim()
    };

    if (!payload.name) { showToast('Category name is required.', 'error'); return; }

    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
        if (id) {
            await api.put(`/admin/categories/${id}`, payload);
            showToast('Category updated successfully.', 'success');
        } else {
            await api.post('/admin/categories', payload);
            showToast('Category created successfully.', 'success');
        }
        resetCategoryForm();
        await loadCategories();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Category';
    }
}

function editCategory(category) {
    const form = document.querySelector('form');
    if (!form) return;
    form.categoryId.value  = category.id;
    form.name.value        = category.name || '';
    form.description.value = category.description || '';

    document.getElementById('categoryFormTitle').textContent = 'Edit Category';

    // Highlight form
    form.closest('.glass-card')?.classList.add('ring-1', 'ring-yellow-500/40');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetCategoryForm() {
    const form = document.querySelector('form');
    if (!form) return;
    form.reset();
    form.categoryId.value = '';
    document.getElementById('categoryFormTitle').textContent = 'Add Category';
    form.closest('.glass-card')?.classList.remove('ring-1', 'ring-yellow-500/40');
}

async function deleteCategory(id) {
    const confirmed = await adminConfirm('Are you sure you want to delete this category? This action cannot be undone.');
    if (!confirmed) return;

    try {
        await api.delete(`/admin/categories/${id}`);
        showToast('Category deleted.', 'success');
        await loadCategories();
    } catch (error) {
        const msg = error?.response?.data?.message
            || error?.data?.message
            || error?.message
            || 'Failed to delete category. It may have linked products.';
        showToast(msg, 'error');
        console.error('Delete category error:', error);
    }
}

/* =========================================================
   PRODUCTS
   ========================================================= */
async function loadProductFormData() {
    const select = document.getElementById('productCategorySelect');
    if (!select) return;

    try {
        const categories = normalizeList(await api.get('/categories'));
        select.innerHTML = `<option value="">Select Category</option>`
            + categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    } catch {
        select.innerHTML = `<option value="">Failed to load categories</option>`;
    }
}

async function loadAdminProducts() {
    const container = document.getElementById('adminProductsTable');
    if (!container) return;
    container.innerHTML = skeletonRows(3);

    try {
        const products = normalizeList(await api.get('/products'));

        if (products.length === 0) {
            container.innerHTML = _emptyState('No products yet. Add your first product using the form.');
            return;
        }
        container.innerHTML = products.map(adminProductRow).join('');
    } catch (error) {
        container.innerHTML = _errorState(error.message);
    }
}

function adminProductRow(product) {
    const image      = product.primaryImage?.imageUrl || product.images?.[0]?.imageUrl || '/images/products/default-perfume.png';
    const safeProduct = JSON.stringify(product).replace(/'/g, "&#39;");

    return `
    <div class="border border-yellow-500/20 rounded-2xl p-5 flex flex-col md:flex-row gap-5 hover:border-yellow-500/40 transition-colors">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}"
             class="w-full md:w-28 h-32 object-cover rounded-xl flex-shrink-0"
             onerror="this.src='/images/products/default-perfume.png'" />
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
                <p class="gold-text text-xs uppercase tracking-[0.25em]">${escapeHtml(product.fragranceFamily || 'N/A')}</p>
                ${statusBadge(product.active ? 'Active' : 'Inactive').replace('Active', product.active ? 'Active' : 'Inactive')}
            </div>
            <h3 class="text-lg font-serif truncate">${escapeHtml(product.name)}</h3>
            <p class="text-gray-400 text-sm mt-1 line-clamp-2">${escapeHtml(product.description || 'No description')}</p>
            <div class="flex flex-wrap gap-2 mt-3">
                <span class="rounded-full border border-yellow-500/20 px-3 py-1 text-xs text-gray-300">
                    Cat. #${escapeHtml(String(product.categoryId || 'N/A'))}
                </span>
                ${product.price ? `<span class="rounded-full border border-yellow-500/20 px-3 py-1 text-xs gold-text">${adminMoney(product.price)}</span>` : ''}
                ${product.stock != null ? `<span class="rounded-full border border-yellow-500/20 px-3 py-1 text-xs text-gray-300">Stock: ${product.stock}</span>` : ''}
            </div>
        </div>
        <div class="flex md:flex-col gap-3 flex-shrink-0">
            <button onclick='editAdminProduct(${safeProduct})' class="outline-gold rounded-xl px-4 py-2 text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
            </button>
            <button onclick="deleteAdminProduct(${product.id})"
                    class="rounded-xl px-4 py-2 text-sm border border-red-400/40 text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
                Delete
            </button>
        </div>
    </div>`;
}

async function saveAdminProduct(event) {
    event.preventDefault();
    const form = event.target;
    const id   = form.productId.value;
    const btn  = form.querySelector('button[type="submit"]');

    const payload = {
        name:            form.name.value.trim(),
        description:     form.description.value.trim(),
        active:          form.active.checked,
        fragranceFamily: form.fragranceFamily.value,
        categoryId:      Number(form.categoryId.value)
    };

    if (!payload.name)            { showToast('Product name is required.', 'error'); return; }
    if (!payload.fragranceFamily) { showToast('Please select a fragrance family.', 'error'); return; }
    if (!payload.categoryId)      { showToast('Please select a category.', 'error'); return; }

    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
        if (id) {
            await api.put(`/admin/products/${id}`, payload);
            showToast('Product updated successfully.', 'success');
        } else {
            await api.post('/admin/products', payload);
            showToast('Product created successfully.', 'success');
        }
        resetProductForm();
        await loadAdminProducts();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Product';
    }
}

function editAdminProduct(product) {
    const form = document.querySelector('form');
    if (!form) return;
    form.productId.value        = product.id;
    form.name.value             = product.name || '';
    form.description.value      = product.description || '';
    form.fragranceFamily.value  = product.fragranceFamily || '';
    form.categoryId.value       = product.categoryId || '';
    form.active.checked         = product.active !== false;

    document.getElementById('productFormTitle').textContent = 'Edit Product';
    form.closest('.glass-card')?.classList.add('ring-1', 'ring-yellow-500/40');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetProductForm() {
    const form = document.querySelector('form');
    if (!form) return;
    form.reset();
    form.productId.value = '';
    form.active.checked  = true;
    document.getElementById('productFormTitle').textContent = 'Add Product';
    form.closest('.glass-card')?.classList.remove('ring-1', 'ring-yellow-500/40');
}

async function deleteAdminProduct(id) {
    const confirmed = await adminConfirm('Delete this product? This action cannot be undone.');
    if (!confirmed) return;

    try {
        await api.delete(`/admin/products/${id}`);
        showToast('Product deleted.', 'success');
        await loadAdminProducts();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

/* =========================================================
   ORDERS
   ========================================================= */
async function loadAdminOrders() {
    const container = document.getElementById('adminOrdersTable');
    if (!container) return;
    container.innerHTML = skeletonRows(4);

    try {
        const statusFilter = document.getElementById('orderStatusFilter')?.value || '';
        let orders = normalizeList(await api.get('/admin/orders'));

        if (statusFilter) {
            orders = orders.filter(o => (o.status || '') === statusFilter);
        }

        // Sort: newest first (by id desc as fallback)
        orders.sort((a, b) => (b.id || 0) - (a.id || 0));

        if (orders.length === 0) {
            container.innerHTML = _emptyState('No orders found' + (statusFilter ? ` with status "${statusFilter}"` : '') + '.');
            return;
        }
        container.innerHTML = orders.map(adminOrderRow).join('');
    } catch (error) {
        container.innerHTML = _errorState(error.message);
    }
}

function resolveCustomerName(order) {
    // Try every common shape Spring Boot APIs return
    const u = order.user || order.customer || {};

    // 1. Flat top-level fields (what this API actually returns)
    if (order.userFullName)  return order.userFullName;
    if (order.userName || order.customerName) return order.userName || order.customerName;

    // 2. Nested user object fullName
    if (u.fullName)   return u.fullName;

    // 2. firstName + lastName on the nested object
    const first = u.firstName || u.first_name || '';
    const last  = u.lastName  || u.last_name  || '';
    if (first || last) return `${first} ${last}`.trim();

    // 3. firstName + lastName flat on the order itself
    const oFirst = order.firstName || order.first_name || '';
    const oLast  = order.lastName  || order.last_name  || '';
    if (oFirst || oLast) return `${oFirst} ${oLast}`.trim();

    // 4. Fall back to email username portion
    const email = u.email || order.userEmail || order.email || '';
    if (email) return email.split('@')[0];

    return 'Unknown Customer';
}

function adminOrderRow(order) {
    const status   = order.status || 'PENDING';
    const total    = order.totalAmount || order.total || 0;
    const itemCount = (order.items || order.orderItems || []).length;
    const customerName = resolveCustomerName(order);
    const customerEmail = (order.user || order.customer || {}).email || order.userEmail || order.email || '';

    return `
    <div class="border border-yellow-500/20 rounded-2xl p-5 hover:border-yellow-500/40 transition-colors">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style="background:rgba(202,138,4,.12);border:1px solid rgba(202,138,4,.2);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="1.5" style="color:#ca8a04;">
                        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                </div>
                <div>
                    <p class="gold-text text-xs uppercase tracking-[0.25em] mb-1">Order #${escapeHtml(String(order.id))}</p>
                    <h3 class="text-lg font-serif">
                        ${escapeHtml(customerName)}
                    </h3>
                    <p class="text-gray-400 text-sm mt-1">
                        ${escapeHtml(customerEmail)}
                        ${order.createdAt ? `<span class="ml-2 text-gray-500">· ${formatDate(order.createdAt)}</span>` : ''}
                    </p>
                </div>
            </div>
            
            
            <div class="flex flex-wrap items-center gap-3">

    ${total ? `
        <span class="text-xl font-serif gold-text">
            ${adminMoney(total)}
        </span>
    ` : ''}

    ${itemCount ? `
        <span class="text-xs text-gray-400">
            ${itemCount} item${itemCount !== 1 ? 's' : ''}
        </span>
    ` : ''}

    ${statusBadge(status)}

    ${
        order.payment?.paymentMethod ||
        order.paymentMethod
            ? `
            <span class="rounded-full px-3 py-1 text-xs border border-yellow-500/30 text-yellow-300">
                ${
                (order.payment?.paymentMethod || order.paymentMethod)
                    .replaceAll('_', ' ')
            }
            </span>
        `
            : ''
    }

    ${
        order.payment?.status ||
        order.paymentStatus
            ? `
            <span class="rounded-full px-3 py-1 text-xs border border-blue-500/30 text-blue-300">
                Payment:
                ${
                order.payment?.status ||
                order.paymentStatus
            }
            </span>
        `
            : ''
    }

</div>
        </div>

        <div class="mt-4 pt-4 border-t border-yellow-500/10 flex flex-wrap gap-2">
            ${['PENDING','SHIPPED','DELIVERED','CANCELLED'].map(s => `
                <button onclick="updateOrderStatus(${order.id}, '${s}')"
                        class="rounded-xl px-3 py-1.5 text-xs transition-colors ${status === s
                            ? 'bg-yellow-500/20 border border-yellow-500/40 gold-text cursor-default'
                            : 'border border-yellow-500/20 text-gray-400 hover:border-yellow-500/40 hover:text-white'
                        }"
                        ${status === s ? 'disabled' : ''}>
                    ${s}
                </button>
            `).join('')}
        </div>
    </div>`;
}

async function updateOrderStatus(orderId, status) {
    try {
        await api.patch(`/admin/orders/${orderId}/status`, { status });
        showToast(`Order #${orderId} marked as ${status}.`, 'success');
        await loadAdminOrders();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

/* =========================================================
   USERS
   ========================================================= */
async function loadAdminUsers() {
    const container = document.getElementById('adminUsersTable');
    if (!container) return;
    container.innerHTML = skeletonRows(4);

    try {
        const users = normalizeList(await api.get('/admin/users'));

        if (users.length === 0) {
            container.innerHTML = _emptyState('No users found.');
            return;
        }

        // Sort: admins first, then alphabetically
        users.sort((a, b) => {
            const aAdmin = (a.roles || []).includes('ADMIN');
            const bAdmin = (b.roles || []).includes('ADMIN');
            if (aAdmin !== bAdmin) return aAdmin ? -1 : 1;
            return (a.fullName || '').localeCompare(b.fullName || '');
        });

        container.innerHTML = users.map(adminUserRow).join('');
    } catch (error) {
        container.innerHTML = _errorState(error.message);
    }
}

function adminUserRow(user) {
    const userId   = user.id || user.userId;
    const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    const roles    = user.roles || [];
    const enabled  = user.enabled !== false;
    const initials = fullName.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();

    return `
    <div class="border border-yellow-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-yellow-500/40 transition-colors">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-serif text-lg"
                 style="background:rgba(202,138,4,.15);border:1px solid rgba(202,138,4,.3);color:#ca8a04;">
                ${escapeHtml(initials)}
            </div>
            <div>
                <p class="gold-text text-xs uppercase tracking-[0.25em] mb-1">User #${escapeHtml(String(userId))}</p>
                <h3 class="text-lg font-serif">${escapeHtml(fullName)}</h3>
                <p class="text-gray-400 text-sm">${escapeHtml(user.email || '')}</p>
                <div class="flex flex-wrap gap-2 mt-2">
                    ${roles.map(role => `
                        <span class="rounded-full border border-yellow-500/20 px-3 py-1 text-xs gold-text">${escapeHtml(role)}</span>
                    `).join('')}
                    <span class="rounded-full px-3 py-1 text-xs border ${enabled
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'}">
                        ${enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
            </div>
        </div>
        <div class="flex flex-wrap gap-3 flex-shrink-0">
            <button onclick="toggleUserStatus(${userId}, ${enabled})"
                    class="outline-gold rounded-xl px-4 py-2 text-sm">
                ${enabled ? 'Disable' : 'Enable'}
            </button>
            <button onclick="deleteAdminUser(${userId})"
                    class="rounded-xl px-4 py-2 text-sm border border-red-400/40 text-red-300 hover:bg-red-500/10 transition-colors">
                Delete
            </button>
        </div>
    </div>`;
}

async function toggleUserStatus(userId, currentlyEnabled) {
    const action = currentlyEnabled ? 'disable' : 'enable';
    const confirmed = await adminConfirm(`${currentlyEnabled ? 'Disable' : 'Enable'} this user?`);
    if (!confirmed) return;

    try {
        await api.patch(`/admin/users/${userId}/${action}`, {});
        showToast(`User ${currentlyEnabled ? 'disabled' : 'enabled'}.`, 'success');
        await loadAdminUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteAdminUser(userId) {
    const confirmed = await adminConfirm('Permanently delete this user? This cannot be undone.');
    if (!confirmed) return;

    try {
        await api.delete(`/admin/users/${userId}`);
        showToast('User deleted.', 'success');
        await loadAdminUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

/* =========================================================
   REFUNDS
   ========================================================= */
async function loadAdminRefunds() {
    const container = document.getElementById('adminRefundsTable');
    if (!container) return;
    container.innerHTML = skeletonRows(3);

    try {
        const refunds = normalizeList(await api.get('/admin/refunds'));

        if (refunds.length === 0) {
            container.innerHTML = _emptyState('No refund requests at this time.');
            return;
        }

        // Sort: PENDING first
        refunds.sort((a, b) => {
            const aP = (a.status || 'PENDING') === 'PENDING' ? 0 : 1;
            const bP = (b.status || 'PENDING') === 'PENDING' ? 0 : 1;
            return aP - bP;
        });

        container.innerHTML = refunds.map(adminRefundRow).join('');
    } catch (error) {
        container.innerHTML = _errorState(error.message);
    }
}

function adminRefundRow(refund) {
    const id     = refund.id || refund.refundId;
    const status = refund.status || refund.refundStatus || 'PENDING';
    const orderId = refund.orderId || refund.order?.id || 'N/A';

    return `
    <div class="border border-yellow-500/20 rounded-2xl p-5 hover:border-yellow-500/40 transition-colors">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style="background:rgba(202,138,4,.12);border:1px solid rgba(202,138,4,.2);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="1.5" style="color:#ca8a04;">
                        <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                    </svg>
                </div>
                <div>
                    <p class="gold-text text-xs uppercase tracking-[0.25em] mb-1">Refund #${escapeHtml(String(id))}</p>
                    <h3 class="text-lg font-serif">Order #${escapeHtml(String(orderId))}</h3>
                    ${refund.user?.email || refund.userEmail
                        ? `<p class="text-gray-400 text-sm">${escapeHtml(refund.user?.email || refund.userEmail)}</p>`
                        : ''}
                    <p class="text-gray-300 text-sm mt-2 leading-relaxed max-w-lg">${escapeHtml(refund.reason || 'No reason provided')}</p>
                    ${refund.amount ? `<p class="gold-text text-sm mt-1">${adminMoney(refund.amount)}</p>` : ''}
                    ${refund.createdAt ? `<p class="text-gray-500 text-xs mt-1">${formatDate(refund.createdAt)}</p>` : ''}
                </div>
            </div>
            ${statusBadge(status)}
        </div>

        <div class="flex flex-wrap gap-3 pt-4 border-t border-yellow-500/10">
            <button onclick="updateRefundStatus(${id}, 'APPROVED')"
                    class="rounded-xl px-4 py-2 text-sm transition-colors ${status === 'APPROVED'
                        ? 'bg-green-500/20 border border-green-400/40 text-green-300 cursor-default'
                        : 'outline-gold'}"
                    ${status === 'APPROVED' ? 'disabled' : ''}>
                ✓ Approve
            </button>
            <button onclick="updateRefundStatus(${id}, 'REJECTED')"
                    class="rounded-xl px-4 py-2 text-sm border transition-colors ${status === 'REJECTED'
                        ? 'bg-red-500/20 border-red-400/40 text-red-300 cursor-default'
                        : 'border-red-400/40 text-red-300 hover:bg-red-500/10'}"
                    ${status === 'REJECTED' ? 'disabled' : ''}>
                ✕ Reject
            </button>
            ${status !== 'PENDING' ? `
            <button onclick="updateRefundStatus(${id}, 'PENDING')"
                    class="rounded-xl px-4 py-2 text-sm border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 transition-colors">
                ↩ Mark Pending
            </button>` : ''}
        </div>
    </div>`;
}

async function updateRefundStatus(refundId, status) {
    if (status === 'APPROVED' || status === 'REJECTED') {
        const confirmed = await adminConfirm(`${status === 'APPROVED' ? 'Approve' : 'Reject'} this refund request?`);
        if (!confirmed) return;
    }

    try {
        await api.patch(`/admin/refunds/${refundId}/status`, { status });
        showToast(`Refund marked as ${status}.`, status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'error' : 'info');
        await loadAdminRefunds();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

/* =========================================================
   SHARED EMPTY / ERROR STATES
   ========================================================= */
function _emptyState(message) {
    return `
    <div class="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center"
             style="background:rgba(202,138,4,.08);border:1px solid rgba(202,138,4,.15);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.2" style="color:#ca8a04; opacity:.6;">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z"/>
            </svg>
        </div>
        <p class="text-gray-400 text-sm max-w-xs">${escapeHtml(message)}</p>
    </div>`;
}

function _errorState(message) {
    return `
    <div class="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-400/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.5" class="text-red-400">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        </div>
        <p class="text-red-300 text-sm">Error: ${escapeHtml(message)}</p>
        <button onclick="location.reload()" class="text-xs text-gray-500 hover:text-gray-300 underline">Try reloading</button>
    </div>`;



}
