let allProducts = [];

function renderAuthLinks() {
    const container = document.getElementById('authLinks');
    if (!container) return;

    const user = api.getUser();

    if (user) {
        container.innerHTML = `
      <span class="text-gray-300 mr-4">Hi, ${user.fullName || user.email}</span>
      ${api.isAdmin() ? `<a href="/admin-dashboard.html" class="gold-text mr-4">Admin</a>` : ''}
      <button onclick="api.logout()" class="gold-text">Logout</button>
    `;
    } else {
        container.innerHTML = `
      <a href="/login.html" class="hover:text-yellow-400 mr-4">Login</a>
      <a href="/register.html" class="gold-text">Register</a>
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
    const image = getPrimaryImage(product);
    const variant = getFirstVariant(product);

    return `
    <div class="glass-card rounded-3xl overflow-hidden group">
      <div class="h-72 bg-[#111] overflow-hidden">
        <img 
          src="${image}" 
          alt="${product.name}" 
          class="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
      </div>

      <div class="p-5">
        <p class="gold-text text-xs uppercase tracking-[0.25em] mb-2">
          ${product.fragranceFamily || 'Luxury'}
        </p>

        <h3 class="text-xl font-serif mb-2">${product.name}</h3>

        <p class="text-gray-400 text-sm line-clamp-2 mb-4">
          ${product.description || ''}
        </p>

        <div class="flex justify-between items-center mb-4">
          <span class="text-lg gold-text font-semibold">
            ${variant ? formatPrice(variant.price) : 'N/A'}
          </span>

          <span class="text-xs text-gray-400">
            ${variant ? variant.size : ''}
          </span>
        </div>

        <a 
          href="/product-details.html?id=${product.id}" 
          class="gold-btn block text-center rounded-xl py-3"
        >
          View Details
        </a>
      </div>
    </div>
  `;
}

async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    try {
        const response = await api.get('/products');
        const products = response.content || response;
        const activeProducts = products.filter(p => p.active !== false).slice(0, 4);

        container.innerHTML = activeProducts.map(productCard).join('');
    } catch (error) {
        container.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    try {
        allProducts = await api.get('/products');
        allProducts = allProducts.filter(p => p.active !== false);

        populateFamilyFilter(allProducts);
        renderProducts(allProducts);
    } catch (error) {
        grid.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `<p class="text-gray-400">No perfumes found.</p>`;
        return;
    }

    grid.innerHTML = products.map(productCard).join('');
}

function populateFamilyFilter(products) {
    const select = document.getElementById('familyFilter');
    if (!select) return;

    const families = [...new Set(products.map(p => p.fragranceFamily).filter(Boolean))];

    select.innerHTML = `
    <option value="">All Families</option>
    ${families.map(family => `<option value="${family}">${family}</option>`).join('')}
  `;
}

function filterProducts() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const family = document.getElementById('familyFilter')?.value || '';

    const filtered = allProducts.filter(product => {
        const matchesSearch =
            product.name?.toLowerCase().includes(search) ||
            product.description?.toLowerCase().includes(search);

        const matchesFamily = !family || product.fragranceFamily === family;

        return matchesSearch && matchesFamily;
    });

    renderProducts(filtered);
}

async function loadProductDetails() {
    const container = document.getElementById('productDetails');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        container.innerHTML = `<p class="text-red-300">Product ID is missing.</p>`;
        return;
    }

    try {
        const product = await api.get(`/products/${id}`);
        const image = getPrimaryImage(product);
        const variants = product.variants || [];

        container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div class="glass-card rounded-3xl p-6">
          <img 
            src="${image}" 
            alt="${product.name}" 
            class="w-full rounded-2xl object-cover max-h-[620px]"
          />

          <div class="grid grid-cols-4 gap-4 mt-4">
            ${(product.images || []).map(img => `
              <img 
                src="${img.imageUrl}" 
                alt="${img.altText || product.name}" 
                class="rounded-xl h-24 w-full object-cover border border-yellow-500/20"
              />
            `).join('')}
          </div>
        </div>

        <div class="pt-4">
          <p class="gold-text uppercase tracking-[0.3em] text-sm mb-4">
            ${product.fragranceFamily || 'Luxury Perfume'}
          </p>

          <h1 class="text-5xl font-serif mb-6">${product.name}</h1>

          <p class="text-gray-300 leading-8 mb-8">
            ${product.description || 'No description available.'}
          </p>

          <div class="glass-card rounded-3xl p-6 mb-8">
            <h2 class="text-xl font-serif mb-4 gold-text">Choose Size</h2>

            <div id="variantOptions" class="space-y-3">
              ${variants.map((variant, index) => `
                <label class="flex justify-between items-center border border-yellow-500/20 rounded-xl p-4 cursor-pointer hover:bg-yellow-500/10">
                  <div>
                    <input 
                      type="radio" 
                      name="variantId" 
                      value="${variant.id}" 
                      ${index === 0 ? 'checked' : ''}
                      class="mr-3"
                    />
                    <span>${variant.size}</span>
                  </div>

                  <div class="text-right">
                    <div class="gold-text font-semibold">${formatPrice(variant.price)}</div>
                    <div class="text-xs ${variant.stockQuantity > 0 ? 'text-green-400' : 'text-red-400'}">
                      ${variant.stockQuantity > 0 ? `${variant.stockQuantity} in stock` : 'Out of stock'}
                    </div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="flex gap-4 items-center mb-8">
            <input 
              id="quantityInput" 
              type="number" 
              min="1" 
              value="1" 
              class="input-luxury rounded-xl px-4 py-3 w-24"
            />

            <button onclick="addSelectedVariantToCart()" class="gold-btn rounded-xl px-8 py-3">
              Add To Cart
            </button>
          </div>

          <a href="/products.html" class="text-gray-400 hover:text-yellow-400">
            ← Back to collection
          </a>
        </div>
      </div>
    `;
    } catch (error) {
        container.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}

async function addSelectedVariantToCart() {
    if (!api.isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }

    const variantInput = document.querySelector('input[name="variantId"]:checked');
    const quantityInput = document.getElementById('quantityInput');

    if (!variantInput) {
        alert('Please choose a size first.');
        return;
    }

    const payload = {
        variantId: Number(variantInput.value),
        quantity: Number(quantityInput.value || 1)
    };

    try {
        await api.post('/cart/items', payload);
        alert('Product added to cart.');
    } catch (error) {
        alert(error.message);
    }
}