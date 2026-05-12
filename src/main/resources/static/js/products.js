/* products.js — updated with cart drawer integration */

let allProducts = [];

function renderAuthLinks() {
    const container = document.getElementById('authLinks');
    if (!container) return;
    const user = api.getUser();
    if (user) {
        container.innerHTML = `
            <span class="text-gray-300 mr-3 text-sm hidden md:inline">Hi, ${(user.fullName || user.email || '').split(' ')[0]}</span>
            ${api.isAdmin() ? `<a href="/admin-dashboard.html" class="gold-text mr-3 text-sm">Admin</a>` : ''}
            <button onclick="api.logout()" class="gold-text text-sm">Logout</button>
        `;
    } else {
        container.innerHTML = `
            <a href="/login.html" class="hover:text-yellow-400 mr-3 text-sm">Login</a>
            <a href="/register.html" class="gold-text text-sm">Register</a>
        `;
    }
}

function getPrimaryImage(product) {
    if (!product.images || product.images.length === 0) {
        return '/images/products/default-perfume.png';
    }
    const primary = product.images.find(img => img.isPrimary);
    return primary ? primary.imageUrl : product.images[0].imageUrl;
}

function getFirstVariant(product) {
    if (!product.variants || product.variants.length === 0) return null;
    return product.variants.find(v => v.active) || product.variants[0];
}

function formatPrice(price) {
    return `$${Number(price || 0).toFixed(2)}`;
}

function productCard(product) {
    const image   = getPrimaryImage(product);
    const variant = getFirstVariant(product);
    const escapedName = (product.name || '').replace(/'/g, "&#39;");

    return `
    <div class="glass-card rounded-3xl overflow-hidden group product-card"
         style="transition:transform .3s ease,box-shadow .3s ease;"
         onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 20px 60px rgba(202,138,4,.1)'"
         onmouseout="this.style.transform='';this.style.boxShadow=''">

        <!-- Image -->
        <div class="overflow-hidden" style="height:288px;background:#111;">
            <img src="${image}" alt="${escapedName}"
                 class="w-full h-full object-cover"
                 style="transition:transform .5s ease;"
                 onmouseover="this.style.transform='scale(1.08)'"
                 onmouseout="this.style.transform='scale(1)'"
                 onerror="this.src='/images/products/default-perfume.png'" />
        </div>

        <!-- Info -->
        <div class="p-5">
            <p class="gold-text text-xs uppercase tracking-[0.25em] mb-2">
                ${product.fragranceFamily || 'Luxury'}
            </p>
            <h3 class="text-xl font-serif mb-2 leading-snug">${product.name}</h3>
            <p class="text-gray-500 text-sm mb-4" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                ${product.description || ''}
            </p>

            <div class="flex justify-between items-center mb-4">
                <span class="text-lg gold-text font-semibold">
                    ${variant ? formatPrice(variant.price) : 'N/A'}
                </span>
                <span class="text-xs text-gray-500 border border-yellow-500/20 rounded-full px-3 py-1">
                    ${variant ? variant.size : ''}
                </span>
            </div>

            <div class="flex gap-2">
                <a href="/product-details.html?id=${product.id}"
                   class="gold-btn block text-center rounded-xl py-3 flex-1 text-sm">
                    View Details
                </a>
                ${variant ? `
                <button onclick="quickAddToCart(${product.id}, ${variant.id}, '${escapedName}', '${variant.size}', ${variant.price})"
                        style="width:44px;height:44px;border:1px solid rgba(202,138,4,.3);border-radius:12px;
                               background:transparent;color:#ca8a04;cursor:pointer;display:flex;align-items:center;
                               justify-content:center;flex-shrink:0;transition:background .2s;"
                        onmouseover="this.style.background='rgba(202,138,4,.12)'"
                        onmouseout="this.style.background='transparent'"
                        title="Quick Add to Cart">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                </button>` : ''}
            </div>
        </div>
    </div>`;
}

async function quickAddToCart(productId, variantId, name, size, price) {
    if (!api.isLoggedIn()) { window.location.href = '/login.html'; return; }
    try {
        await api.post('/cart/items', { variantId: Number(variantId), quantity: 1 });
        // Open cart drawer with success state
        if (typeof showAddedToCart === 'function') {
            await showAddedToCart(name, size, price, 1);
        } else if (typeof openCartDrawer === 'function') {
            await openCartDrawer();
        }
        if (typeof updateCartBadge === 'function') updateCartBadge();
    } catch (err) {
        alert(err.message);
    }
}

async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    // Skeleton
    container.innerHTML = Array(4).fill(0).map(() => `
        <div style="background:rgba(255,255,255,.03);border:1px solid rgba(202,138,4,.08);border-radius:24px;overflow:hidden;">
            <div style="height:288px;background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.07) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;"></div>
            <div style="padding:20px;">
                <div style="height:10px;width:50%;background:rgba(202,138,4,.1);border-radius:6px;margin-bottom:10px;animation:shimmer 1.5s infinite;"></div>
                <div style="height:18px;width:80%;background:rgba(255,255,255,.06);border-radius:6px;margin-bottom:16px;animation:shimmer 1.5s infinite;"></div>
                <div style="height:42px;background:rgba(202,138,4,.08);border-radius:12px;animation:shimmer 1.5s infinite;"></div>
            </div>
        </div>`).join('');

    try {
        const response = await api.get('/products');
        const products = (response.content || response).filter(p => p.active !== false).slice(0, 4);
        container.innerHTML = products.length
            ? products.map(productCard).join('')
            : `<p class="text-gray-400 col-span-4 text-center py-8">No products available yet.</p>`;
    } catch (error) {
        container.innerHTML = `<p class="text-red-300 col-span-4">${error.message}</p>`;
    }
}

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    try {
        allProducts = await api.get('/products');
        allProducts = (allProducts.content || allProducts).filter(p => p.active !== false);
        populateFamilyFilter(allProducts);
        renderProducts(allProducts);
    } catch (error) {
        grid.innerHTML = `<p class="text-red-300 col-span-4">${error.message}</p>`;
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (!products.length) {
        grid.innerHTML = `
        <div class="col-span-4 text-center py-16">
            <div style="font-size:2.5rem;margin-bottom:12px;">🔍</div>
            <p class="text-gray-400">No perfumes found matching your search.</p>
        </div>`;
        return;
    }
    grid.innerHTML = products.map(productCard).join('');
    const label = document.getElementById('productCountLabel');
    if (label) label.textContent = `${products.length} product${products.length !== 1 ? 's' : ''} found`;
}

function populateFamilyFilter(products) {
    const select = document.getElementById('familyFilter');
    if (!select) return;
    const families = [...new Set(products.map(p => p.fragranceFamily).filter(Boolean))].sort();
    select.innerHTML = `<option value="">All Fragrance Families</option>`
        + families.map(f => `<option value="${f}">${f}</option>`).join('');
}

function filterProducts() {
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const family = document.getElementById('familyFilter')?.value || '';
    const filtered = allProducts.filter(p =>
        (!search || (p.name?.toLowerCase().includes(search) || (p.description || '').toLowerCase().includes(search) || (p.fragranceFamily || '').toLowerCase().includes(search)))
        && (!family || p.fragranceFamily === family)
    );
    renderProducts(filtered);
}

async function loadProductDetails() {
    const container = document.getElementById('productDetails');
    if (!container) return;

    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { container.innerHTML = `<p class="text-red-300">Product ID missing.</p>`; return; }

    try {
        const product  = await api.get(`/products/${id}`);
        const image    = getPrimaryImage(product);
        const variants = product.variants || [];

        container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div class="glass-card rounded-3xl p-6">
                <img src="${image}" alt="${product.name}"
                     class="w-full rounded-2xl object-cover max-h-[580px]"
                     onerror="this.src='/images/products/default-perfume.png'" />
                ${(product.images || []).length > 1 ? `
                <div class="grid grid-cols-4 gap-3 mt-4">
                    ${(product.images || []).map(img => `
                    <img src="${img.imageUrl}" alt="${img.altText || product.name}"
                         class="rounded-xl h-20 w-full object-cover border border-yellow-500/20 cursor-pointer
                                hover:border-yellow-500/60 transition-colors"
                         onclick="document.querySelector('.max-h-\\\\[580px\\\\]').src='${img.imageUrl}'"
                         onerror="this.style.display='none'" />
                    `).join('')}
                </div>` : ''}
            </div>

            <div class="pt-2">
                <p class="gold-text uppercase tracking-[0.35em] text-xs mb-3">${product.fragranceFamily || 'Luxury'}</p>
                <h1 class="text-5xl font-serif mb-5">${product.name}</h1>
                <p class="text-gray-400 leading-8 mb-8">${product.description || ''}</p>

                ${variants.length ? `
                <div class="glass-card rounded-3xl p-6 mb-7">
                    <h2 class="text-lg font-serif gold-text mb-4">Choose Size</h2>
                    <div class="space-y-3">
                        ${variants.map((v, i) => `
                        <label class="flex justify-between items-center border border-yellow-500/20 rounded-xl p-4 cursor-pointer hover:bg-yellow-500/10 transition-colors">
                            <div class="flex items-center gap-3">
                                <input type="radio" name="variantId" value="${v.id}" ${i === 0 ? 'checked' : ''} class="accent-yellow-500" />
                                <span>${v.size}</span>
                            </div>
                            <div class="text-right">
                                <div class="gold-text font-semibold">${formatPrice(v.price)}</div>
                                <div class="text-xs mt-0.5 ${v.stockQuantity > 0 ? 'text-green-400' : 'text-red-400'}">
                                    ${v.stockQuantity > 0 ? `${v.stockQuantity} in stock` : 'Out of stock'}
                                </div>
                            </div>
                        </label>`).join('')}
                    </div>
                </div>` : ''}

                <div class="flex gap-4 items-center mb-6 flex-wrap">
                    <input id="quantityInput" type="number" min="1" value="1"
                           class="input-luxury rounded-xl px-4 py-3 w-24" />
                    <button onclick="addSelectedVariantToCart()" class="gold-btn rounded-xl px-8 py-3 flex-1">
                        Add to Cart
                    </button>
                </div>

                <a href="/products.html" class="text-gray-500 hover:text-yellow-400 transition-colors text-sm">
                    ← Back to collection
                </a>
            </div>
        </div>`;
    } catch (err) {
        container.innerHTML = `<p class="text-red-300">${err.message}</p>`;
    }
}

async function addSelectedVariantToCart() {
    if (!api.isLoggedIn()) { window.location.href = '/login.html'; return; }
    const variantInput = document.querySelector('input[name="variantId"]:checked');
    if (!variantInput) { alert('Please choose a size first.'); return; }

    const btn = document.querySelector('button[onclick="addSelectedVariantToCart()"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Adding…'; }

    try {
        await api.post('/cart/items', {
            variantId: Number(variantInput.value),
            quantity:  Number(document.getElementById('quantityInput')?.value || 1)
        });
        if (typeof showAddedToCart === 'function') await showAddedToCart();
        else if (typeof openCartDrawer === 'function') await openCartDrawer();
        if (typeof updateCartBadge === 'function') updateCartBadge();
    } catch (err) {
        alert(err.message);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Add to Cart'; }

    }
}