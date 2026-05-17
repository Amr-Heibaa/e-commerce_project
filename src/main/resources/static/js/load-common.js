// load-common.js – loads shared navbar & footer, sets up drawers and auth
(async function loadCommon() {
    const path = window.location.pathname;
    const isActive = (href) =>
        path.includes(href) ||
        (href === '/index.html' && (path === '/' || path.endsWith('index.html')));

    // Load navbar HTML
    try {
        const resp = await fetch('/components/navbar.html');
        const html = await resp.text();
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const frag = document.createDocumentFragment();
        while (temp.firstChild) frag.appendChild(temp.firstChild);
        document.body.insertBefore(frag, document.body.firstChild);

        async function loadSidebarCategories() {
            const submenu = document.getElementById('fragranceSubmenu');
            if (!submenu) return;

            try {
                const categories = await api.get('/categories');

                submenu.innerHTML = categories
                    .filter(c => c.active !== false)
                    .map(c => `
                <a href="/products.html?category=${encodeURIComponent(c.name)}"
                   class="side-sublink">
                    ${c.name}
                </a>
            `)
                    .join('');

            } catch (e) {
                console.error('Failed to load sidebar categories:', e);
            }
        }

        loadSidebarCategories();

        // Highlight active desktop link
        document.querySelectorAll('#desktopNav a').forEach(link => {
            if (isActive(link.getAttribute('href'))) {
                link.classList.add('nav-active');
            }
        });
    } catch (e) {
        console.error('Failed to load navbar:', e);
    }

    // Load footer
    try {
        const footResp = await fetch('/components/footer.html');
        const footHtml = await footResp.text();
        const footDiv = document.createElement('div');
        footDiv.innerHTML = footHtml;
        document.body.appendChild(footDiv.firstElementChild);
    } catch (e) {
        console.error('Failed to load footer:', e);
    }

    // Sidebar & cart toggle functions
    const DESKTOP = window.matchMedia('(min-width: 1024px)');

    window.openSideMenu = () => {
        document.getElementById('sideMenu')?.classList.add('open');

        if (!DESKTOP.matches) {
            document.getElementById('sideMenuOverlay')?.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        document.body.classList.add('sidebar-open');
    };

    window.closeSideMenu = () => {
        document.getElementById('sideMenu')?.classList.remove('open');
        document.getElementById('sideMenuOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
        document.body.classList.remove('sidebar-open');
    };

    window.toggleFragranceMenu = () => {
        document.getElementById('fragranceSubmenu')?.classList.toggle('open');
        document.getElementById('fragranceChevron')?.classList.toggle('open');
    };



    // Adapt on resize
    DESKTOP.addEventListener('change', e => {
        if (e.matches) {
            openSideMenu();
        } else {
            closeSideMenu();
        }
    });

    window.openCartDrawer = async () => {
        const drawer = document.getElementById('cartDrawer');
        const overlay = document.getElementById('cartDrawerOverlay');
        if (!drawer) return;
        drawer.classList.add('open');
        overlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
        await refreshCartDrawer();
    };

    window.closeCartDrawer = () => {
        document.getElementById('cartDrawer')?.classList.remove('open');
        document.getElementById('cartDrawerOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
    };

    document.getElementById('sideMenuOverlay')?.addEventListener('click', closeSideMenu);
    document.getElementById('cartDrawerOverlay')?.addEventListener('click', closeCartDrawer);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeSideMenu();
            closeCartDrawer();
        }
    });

    // ---- AUTH RENDERING ----
    function renderAllAuth() {
        const user = api.getUser();
        const navAuth = document.getElementById('navAuthLinks');
        const sideAuth = document.getElementById('sideMenuAuth');
        const legacyAuth = document.getElementById('authLinks');

        if (user) {
            const html = `
                <span class="text-gray-300 text-sm hidden md:inline-block truncate max-w-[120px]">${user.fullName || user.email}</span>
                ${api.isAdmin() ? '<a href="/admin-dashboard.html" class="gold-text text-xs uppercase tracking-widest">Admin</a>' : ''}
                <button onclick="api.logout()" class="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Logout</button>`;

            if (navAuth) navAuth.innerHTML = html;

            if (sideAuth) sideAuth.innerHTML = `
                <p class="text-gray-400 mb-3">Hi, ${user.fullName || user.email}</p>
                ${api.isAdmin() ? '<a href="/admin-dashboard.html" class="gold-text text-sm block mb-2">Admin Dashboard</a>' : ''}
                <button onclick="api.logout()" class="text-gray-500 hover:text-white text-sm">Logout</button>`;

            if (legacyAuth) legacyAuth.innerHTML = html;
        } else {
            const html = `
                <a href="/login.html" class="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Login</a>
                <a href="/register.html" class="gold-text text-xs uppercase tracking-widest hover:opacity-70">Register</a>`;

            if (navAuth) navAuth.innerHTML = html;

            if (sideAuth) sideAuth.innerHTML = `
                <a href="/login.html" class="block text-gray-400 hover:text-white mb-2">Login</a>
                <a href="/register.html" class="gold-text block">Create Account →</a>`;

            if (legacyAuth) legacyAuth.innerHTML = html;
        }
    }

    // Cart badge and drawer logic
    window.updateCartBadge = async () => {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;

        if (!api.isLoggedIn()) {
            badge.style.display = 'none';
            return;
        }

        try {
            const cart = await api.get('/cart');
            const items = cart?.items || cart?.cartItems || [];
            const count = items.reduce((s, i) => s + (i.quantity || 1), 0);
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        } catch {
            badge.style.display = 'none';
        }
    };

    window.refreshCartDrawer = async () => {
        const body = document.getElementById('cartDrawerBody');
        const footer = document.getElementById('cartDrawerFooter');
        if (!body) return;

        if (!api.isLoggedIn()) {
            body.innerHTML = `<div class="flex flex-col items-center justify-center h-full gap-4 py-16">
                <div style="font-size:3rem">🛍️</div><p class="text-gray-400">Sign in to view your cart</p>
                <a href="/login.html" class="gold-btn rounded-xl px-6 py-2 text-sm">Login</a></div>`;
            if (footer) footer.style.display = 'none';
            return;
        }

        body.innerHTML = `<div class="flex justify-center py-12"><div class="spinner"></div></div>`;

        try {
            const cart = await api.get('/cart');
            const items = cart?.items || cart?.cartItems || [];
            const total = cart?.totalAmount ?? cart?.total ?? items.reduce((s, i) => s + (i.price || i.unitPrice || 0) * (i.quantity || 1), 0);

            if (items.length === 0) {
                body.innerHTML = `<div class="flex flex-col items-center justify-center h-full py-16">
                    <div style="font-size:3rem">🛒</div><p class="text-gray-400">Your cart is empty.</p>
                    <a href="/products.html" onclick="closeCartDrawer()" class="gold-btn rounded-xl px-6 py-2 text-sm">Shop Collection</a></div>`;
                if (footer) footer.style.display = 'none';
                return;
            }

            body.innerHTML = items.map(item => {
                const id = item.id || item.cartItemId;
                const name = item.productName || item.name || 'Perfume';
                const size = item.size || item.variantSize || '';
                const price = Number(item.price || item.unitPrice || 0);
                const qty = item.quantity || 1;
                const img = item.imageUrl || item.productImage || item.product?.images?.[0]?.imageUrl || '/images/products/default-perfume.png';

                return `<div class="flex gap-4 py-4 border-b border-yellow-500/10">
                    <img src="${img}" class="w-20 h-24 object-cover rounded-xl" onerror="this.src='/images/products/default-perfume.png'"/>
                    <div class="flex-1">
                        <p class="text-xs tracking-widest text-yellow-600">${size}</p>
                        <p class="font-serif">${name}</p>
                        <p class="text-gray-400 text-sm">$${price.toFixed(2)} each</p>
                        <div class="flex items-center gap-0 mt-2">
<button onclick="drawerUpdateQty(${id}, ${qty-1}, ${item.variantId || item.productVariantId || 0})" class="qty-btn">−</button>
                            <span class="w-10 text-center">${qty}</span>
<button onclick="drawerUpdateQty(${id}, ${qty+1}, ${item.variantId || item.productVariantId || 0})" class="qty-btn">+</button>
                        </div>
                    </div>
                    <div class="flex flex-col items-end justify-between">
                        <p class="text-lg gold-text font-semibold">$${(price * qty).toFixed(2)}</p>
                        <button onclick="drawerRemoveItem(${id})" class="text-red-400 text-sm">Remove</button>
                    </div>
                </div>`;
            }).join('');

            if (footer) {
                footer.style.display = 'block';
                document.getElementById('cartDrawerTotal').textContent = `$${Number(total).toFixed(2)}`;
            }

            updateCartBadge();
        } catch (e) {
            body.innerHTML = `<p class="text-red-400 p-4">${e.message}</p>`;
        }
    };

window.drawerUpdateQty = async (id, qty, variantId) => {
    if (qty < 1) { window.drawerRemoveItem(id); return; }
    // Build the payload – only add variantId if it's > 0
    const payload = { quantity: qty };
    if (variantId) payload.variantId = variantId;
    await api.put(`/cart/items/${id}`, payload);
    await refreshCartDrawer();
};

    window.drawerRemoveItem = async (id) => {
        await api.delete(`/cart/items/${id}`);
        await refreshCartDrawer();
        updateCartBadge();
    };

    // Initial render
    renderAllAuth();
    updateCartBadge();

    // Legacy support
    window.renderAuthLinks = renderAllAuth;
})();