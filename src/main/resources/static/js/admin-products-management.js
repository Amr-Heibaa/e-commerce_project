/* admin-products-management.js
   Product images, variants, and inventory handling
   Loaded after admin.js, so it overrides only adminProductRow().
*/

function adminProductRow(product) {
    const image =
        product.primaryImage?.imageUrl ||
        product.images?.find(i => i.isPrimary)?.imageUrl ||
        product.images?.[0]?.imageUrl ||
        '/images/products/default-perfume.png';

    const safeProduct = JSON.stringify(product).replace(/'/g, "&#39;");

    return `
    <div class="border border-yellow-500/20 rounded-2xl p-5 hover:border-yellow-500/40 transition-colors">

        <div class="flex flex-col md:flex-row gap-5">
            <img src="${escapeHtml(image)}"
                 class="w-full md:w-32 h-36 object-cover rounded-xl"
                 onerror="this.src='/images/products/default-perfume.png'" />

            <div class="flex-1">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <p class="gold-text text-xs uppercase tracking-[0.25em]">
                        ${escapeHtml(product.fragranceFamily || 'N/A')}
                    </p>
                    ${statusBadge(product.active ? 'Active' : 'Inactive')}
                </div>

                <h3 class="text-lg font-serif">${escapeHtml(product.name)}</h3>
                <p class="text-gray-400 text-sm mt-1">${escapeHtml(product.description || 'No description')}</p>

                <div class="flex flex-wrap gap-2 mt-3">
                    <span class="rounded-full border border-yellow-500/20 px-3 py-1 text-xs text-gray-300">
                        Cat. #${escapeHtml(String(product.categoryId || 'N/A'))}
                    </span>
                    <span class="rounded-full border border-yellow-500/20 px-3 py-1 text-xs gold-text">
                        ${(product.variants || []).length} variant(s)
                    </span>
                    <span class="rounded-full border border-yellow-500/20 px-3 py-1 text-xs text-gray-300">
                        ${(product.images || []).length} image(s)
                    </span>
                </div>
            </div>

            <div class="flex md:flex-col gap-3">
                <button onclick='editAdminProduct(${safeProduct})'
                        class="outline-gold rounded-xl px-4 py-2 text-sm">
                    Edit
                </button>

                <button onclick="addProductImage(${product.id})"
                        class="outline-gold rounded-xl px-4 py-2 text-sm">
                    Add Image
                </button>

                <button onclick="addVariant(${product.id})"
                        class="outline-gold rounded-xl px-4 py-2 text-sm">
                    Add Variant
                </button>

                <button onclick="deleteAdminProduct(${product.id})"
                        class="rounded-xl px-4 py-2 text-sm border border-red-400/40 text-red-300">
                    Delete
                </button>
            </div>
        </div>

        ${renderProductImages(product)}
        ${renderProductVariants(product)}
    </div>`;
}

function renderProductImages(product) {
    if (!product.images || product.images.length === 0) {
        return `<p class="text-gray-500 text-sm mt-5">No images yet.</p>`;
    }

    return `
    <div class="mt-5 pt-5 border-t border-yellow-500/10">
        <p class="text-xs uppercase tracking-widest text-gray-500 mb-3">Images</p>

        <div class="flex flex-wrap gap-4">
            ${product.images.map(img => `
                <div>
                    <img src="${escapeHtml(img.imageUrl)}"
                         class="w-24 h-24 rounded-xl object-cover border border-yellow-500/20"
                         onerror="this.src='/images/products/default-perfume.png'" />

                    <div class="flex gap-2 mt-2">
                        ${
        img.isPrimary
            ? `<span class="text-xs text-green-300">Primary</span>`
            : `<button onclick="setPrimaryImage(${product.id}, ${img.id})"
                                           class="text-xs gold-text">Set Primary</button>`
    }

                        <button onclick="deleteProductImage(${product.id}, ${img.id})"
                                class="text-xs text-red-300">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>`;
}

function renderProductVariants(product) {

    const activeVariants = (product.variants || [])
        .filter(variant => variant.active !== false);

    if (!activeVariants.length) {
        return `
            <div class="text-gray-500 text-sm italic py-2">
                No active variants
            </div>
        `;
    }

    return activeVariants.map(variant => `
        <div class="variant-row flex items-center justify-between border border-gray-700 rounded-xl p-3 mb-2">

            <div>
                <div class="font-medium text-white">
                    ${variant.size}
                </div>

                <div class="text-sm text-gray-400">
                    $${Number(variant.price).toFixed(2)}
                </div>

                <div class="text-xs ${variant.stockQuantity > 0 ? 'text-green-400' : 'text-red-400'}">
                    Stock: ${variant.stockQuantity}
                </div>
            </div>

            <button
                onclick="deleteVariant(${variant.id}, ${product.id})"
                class="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg transition"
            >
                Delete Variant
            </button>

        </div>
    `).join('');
}
async function addProductImage(productId) {

    const input =
        document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {

        const file = input.files[0];

        if (!file) return;

        try {

            // STEP 1 — Upload file
            const formData = new FormData();

            formData.append('file', file);

            const uploaded =
                await api.upload(
                    '/admin/products/upload',
                    formData
                );

            // STEP 2 — Save image entity
            await api.post(
                `/admin/products/${productId}/images`,
                {
                    imageUrl: uploaded.fileUrl,
                    altText: file.name,
                    displayOrder: 0
                }
            );

            showToast(
                'Image uploaded successfully.',
                'success'
            );

            await loadAdminProducts();

        } catch (e) {

            showToast(e.message, 'error');
        }
    };

    input.click();
}

async function setPrimaryImage(productId, imageId) {
    try {
        await api.patch(`/admin/products/${productId}/images/${imageId}/primary`);
        showToast('Primary image updated.', 'success');
        await loadAdminProducts();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function deleteProductImage(productId, imageId) {
    const confirmed = await adminConfirm('Delete this image?');
    if (!confirmed) return;

    try {
        await api.delete(`/admin/products/${productId}/images/${imageId}`);
        showToast('Image deleted.', 'success');
        await loadAdminProducts();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

function openVariantModal(productId) {
    return new Promise(resolve => {
        const overlay = document.getElementById('variantModal');
        const form = document.getElementById('variantModalForm');
        const cancelButton = document.getElementById('variantCancel');

        if (!overlay || !form || !cancelButton) {
            resolve(null);
            return;
        }

        form.reset();
        form.productId.value = productId;

        const close = value => {
            cancelButton.removeEventListener('click', handleCancel);
            overlay.removeEventListener('click', handleOverlayClick);
            form.removeEventListener('submit', handleSubmit);
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
                resolve(value);
            }, 220);
        };

        requestAnimationFrame(() => {
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            form.size.focus();
        });

        const handleCancel = () => close(null);
        const handleOverlayClick = event => {
            if (event.target === overlay) close(null);
        };

        const handleSubmit = event => {
            event.preventDefault();

            const size = form.size.value.trim();
            const price = Number(form.price.value);
            const stockQuantity = Number(form.stockQuantity.value);

            if (!size) {
                showToast('Variant size is required.', 'error');
                return;
            }

            if (!Number.isFinite(price) || price <= 0) {
                showToast('Variant price must be greater than 0.', 'error');
                return;
            }

            if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
                showToast('Stock must be 0 or more.', 'error');
                return;
            }

            close({ productId, size, price, stockQuantity });
        };

        cancelButton.addEventListener('click', handleCancel);
        overlay.addEventListener('click', handleOverlayClick);
        form.addEventListener('submit', handleSubmit);
    });
}

async function addVariant(productId) {
    const variant = await openVariantModal(productId);
    if (!variant) return;

    try {
        await api.post('/admin/variants', variant);

        showToast('Variant added successfully.', 'success');
        await loadAdminProducts();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function editVariant(variantId, productId, oldSize, oldPrice, oldStock) {
    const size = prompt('Size:', oldSize);
    if (!size) return;

    const price = prompt('Price:', oldPrice);
    if (!price) return;

    const stockQuantity = prompt('Stock quantity:', oldStock);
    if (stockQuantity === null) return;

    try {
        await api.put(`/admin/variants/${variantId}`, {
            productId,
            size,
            price: Number(price),
            stockQuantity: Number(stockQuantity)
        });

        showToast('Variant updated successfully.', 'success');
        await loadAdminProducts();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function deleteVariant(variantId, productId) {

    const confirmed = confirm(
        'Are you sure you want to delete this variant?'
    );

    if (!confirmed) return;

    try {

        console.log('Deleting variant:', variantId);

        await api.delete(`/admin/variants/${variantId}`);

        showToast('Variant deleted.', 'success');
        await loadAdminProducts();

    } catch (error) {

        console.error('Delete variant failed:', error);

        showToast(
            error.message || 'Failed to delete variant',
            'error'
        );
    }
}

async function updateVariantStock(variantId, currentStock) {
    const quantityChange = prompt(
        `Current stock: ${currentStock}\nEnter quantity change, e.g. 5 or -2:`
    );

    if (quantityChange === null) return;

    const reason = prompt(
        'Reason: Purchase, Restock, Return, Manual, Order_Cancelled, Damaged',
        'Manual'
    );

    if (!reason) return;

    try {
        await api.patch(`/admin/variants/${variantId}/stock`, {
            quantityChange: Number(quantityChange),
            reason
        });

        showToast('Stock updated successfully.', 'success');
        await loadAdminProducts();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function viewInventoryLogs(variantId) {
    try {
        const logs = await api.get(`/admin/variants/${variantId}/stock/logs`);

        if (!logs || logs.length === 0) {
            alert('No inventory logs yet.');
            return;
        }

        alert(
            logs.map(log =>
                `${log.reason} | ${log.quantityChange} | ${log.createdAt || ''}`
            ).join('\n')
        );
    } catch (e) {
        showToast(e.message, 'error');
    }
}
