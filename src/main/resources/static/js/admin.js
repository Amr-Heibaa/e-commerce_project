function requireAdminPage() {
    if (!api.isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }

    if (!api.isAdmin()) {
        window.location.href = '/index.html';
    }
}

function adminMoney(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function normalizeList(response) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.content)) return response.content;
    if (Array.isArray(response.data)) return response.data;
    return [];
}

function showAdminMessage(id, message, type = 'success') {
    const box = document.getElementById(id);
    if (!box) return;

    const successClass = 'mb-6 rounded-xl px-4 py-3 text-sm bg-green-500/20 border border-green-400/40 text-green-200';
    const errorClass = 'mb-6 rounded-xl px-4 py-3 text-sm bg-red-500/20 border border-red-400/40 text-red-200';

    box.textContent = message;
    box.className = type === 'success' ? successClass : errorClass;
}

async function loadAdminDashboard() {
    try {
        const [productsRes, categoriesRes] = await Promise.allSettled([
            api.get('/products'),
            api.get('/categories')
        ]);

        const products = productsRes.status === 'fulfilled' ? normalizeList(productsRes.value) : [];
        const categories = categoriesRes.status === 'fulfilled' ? normalizeList(categoriesRes.value) : [];

        document.getElementById('productCount').textContent = products.length;
        document.getElementById('categoryCount').textContent = categories.length;

        try {
            const orders = normalizeList(await api.get('/admin/orders'));
            document.getElementById('orderCount').textContent = orders.length;
        } catch {
            document.getElementById('orderCount').textContent = '—';
        }

        try {
            const refunds = normalizeList(await api.get('/admin/refunds'));
            document.getElementById('refundCount').textContent = refunds.length;
        } catch {
            document.getElementById('refundCount').textContent = '—';
        }

    } catch (error) {
        console.error(error);
    }
}

/* =========================
   Categories
========================= */

async function loadCategories() {
    const container = document.getElementById('categoriesTable');
    if (!container) return;

    try {
        const response = await api.get('/categories');
        const categories = normalizeList(response);

        if (categories.length === 0) {
            container.innerHTML = `<p class="text-gray-400">No categories found.</p>`;
            return;
        }

        container.innerHTML = categories.map(categoryRow).join('');
    } catch (error) {
        container.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}

function categoryRow(category) {
    return `
    <div class="border border-yellow-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p class="gold-text text-xs uppercase tracking-[0.25em] mb-2">Category #${category.id}</p>
        <h3 class="text-xl font-serif">${category.name}</h3>
        <p class="text-gray-400 text-sm mt-1">${category.description || 'No description'}</p>
      </div>

      <div class="flex gap-3">
        <button onclick='editCategory(${JSON.stringify(category)})' class="outline-gold rounded-xl px-4 py-2">
          Edit
        </button>

        <button onclick="deleteCategory(${category.id})" class="rounded-xl px-4 py-2 border border-red-400/40 text-red-300 hover:bg-red-500/10">
          Delete
        </button>
      </div>
    </div>
  `;
}

async function saveCategory(event) {
    event.preventDefault();

    const form = event.target;
    const id = form.categoryId.value;

    const payload = {
        name: form.name.value.trim(),
        description: form.description.value.trim()
    };

    try {
        if (id) {
            await api.put(`/admin/categories/${id}`, payload);
            showAdminMessage('categoryMessage', 'Category updated successfully.');
        } else {
            await api.post('/admin/categories', payload);
            showAdminMessage('categoryMessage', 'Category created successfully.');
        }

        resetCategoryForm();
        await loadCategories();
    } catch (error) {
        showAdminMessage('categoryMessage', error.message, 'error');
    }
}

function editCategory(category) {
    const form = document.querySelector('form');
    form.categoryId.value = category.id;
    form.name.value = category.name || '';
    form.description.value = category.description || '';

    document.getElementById('categoryFormTitle').textContent = 'Edit Category';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetCategoryForm() {
    const form = document.querySelector('form');
    if (!form) return;

    form.reset();
    form.categoryId.value = '';
    document.getElementById('categoryFormTitle').textContent = 'Add Category';
}

async function deleteCategory(id) {
    const confirmed = confirm('Are you sure you want to delete this category?');
    if (!confirmed) return;

    try {
        await api.delete(`/admin/categories/${id}`);
        showAdminMessage('categoryMessage', 'Category deleted successfully.');
        await loadCategories();
    } catch (error) {
        showAdminMessage('categoryMessage', error.message, 'error');
    }
}


/* =========================
   Products
========================= */

async function loadProductFormData() {
    const select = document.getElementById('productCategorySelect');
    if (!select) return;

    try {
        const categories = normalizeList(await api.get('/categories'));

        select.innerHTML = `
      <option value="">Select Category</option>
      ${categories.map(category => `
        <option value="${category.id}">${category.name}</option>
      `).join('')}
    `;
    } catch (error) {
        select.innerHTML = `<option value="">Failed to load categories</option>`;
    }
}

async function loadAdminProducts() {
    const container = document.getElementById('adminProductsTable');
    if (!container) return;

    try {
        const products = normalizeList(await api.get('/products'));

        if (products.length === 0) {
            container.innerHTML = `<p class="text-gray-400">No products found.</p>`;
            return;
        }

        container.innerHTML = products.map(adminProductRow).join('');
    } catch (error) {
        container.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}

function adminProductRow(product) {
    const image = product.primaryImage?.imageUrl || product.images?.[0]?.imageUrl || '/images/products/default-perfume.png';

    return `
    <div class="border border-yellow-500/20 rounded-2xl p-5 flex flex-col md:flex-row gap-5">
      <img src="${image}" alt="${product.name}" class="w-full md:w-32 h-36 object-cover rounded-xl" />

      <div class="flex-1">
        <p class="gold-text text-xs uppercase tracking-[0.25em] mb-2">
          ${product.fragranceFamily || 'N/A'}
        </p>

        <h3 class="text-xl font-serif">${product.name}</h3>

        <p class="text-gray-400 text-sm mt-1 line-clamp-2">
          ${product.description || 'No description'}
        </p>

        <div class="flex flex-wrap gap-3 mt-3 text-xs">
          <span class="rounded-full border border-yellow-500/20 px-3 py-1">
            Category ID: ${product.categoryId || 'N/A'}
          </span>

          <span class="rounded-full px-3 py-1 ${product.active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}">
            ${product.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div class="flex md:flex-col gap-3">
        <button onclick='editAdminProduct(${JSON.stringify(product)})' class="outline-gold rounded-xl px-4 py-2">
          Edit
        </button>

        <button onclick="deleteAdminProduct(${product.id})" class="rounded-xl px-4 py-2 border border-red-400/40 text-red-300 hover:bg-red-500/10">
          Delete
        </button>
      </div>
    </div>
  `;
}

async function saveAdminProduct(event) {
    event.preventDefault();

    const form = event.target;
    const id = form.productId.value;

    const payload = {
        name: form.name.value.trim(),
        description: form.description.value.trim(),
        active: form.active.checked,
        fragranceFamily: form.fragranceFamily.value,
        categoryId: Number(form.categoryId.value)
    };

    try {
        if (id) {
            await api.put(`/admin/products/${id}`, payload);
            showAdminMessage('productMessage', 'Product updated successfully.');
        } else {
            await api.post('/admin/products', payload);
            showAdminMessage('productMessage', 'Product created successfully.');
        }

        resetProductForm();
        await loadAdminProducts();
    } catch (error) {
        showAdminMessage('productMessage', error.message, 'error');
    }
}

function editAdminProduct(product) {
    const form = document.querySelector('form');

    form.productId.value = product.id;
    form.name.value = product.name || '';
    form.description.value = product.description || '';
    form.fragranceFamily.value = product.fragranceFamily || '';
    form.categoryId.value = product.categoryId || '';
    form.active.checked = product.active !== false;

    document.getElementById('productFormTitle').textContent = 'Edit Product';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetProductForm() {
    const form = document.querySelector('form');
    if (!form) return;

    form.reset();
    form.productId.value = '';
    form.active.checked = true;
    document.getElementById('productFormTitle').textContent = 'Add Product';
}

async function deleteAdminProduct(id) {
    const confirmed = confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
        await api.delete(`/admin/products/${id}`);
        showAdminMessage('productMessage', 'Product deleted successfully.');
        await loadAdminProducts();
    } catch (error) {
        showAdminMessage('productMessage', error.message, 'error');
    }
}