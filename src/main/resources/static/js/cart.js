let currentCart = null;

function requireCartAuth() {
    if (!api.isLoggedIn()) {
        window.location.href = '/login.html';
    }
}

function money(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function getCartItems(cart) {
    if (!cart) return [];
    return cart.items || cart.cartItems || [];
}

function getItemName(item) {
    return item.productName || item.name || item.product?.name || 'Perfume';
}

function getItemVariant(item) {
    return item.size || item.variantSize || item.productVariant?.size || '';
}

function getItemPrice(item) {
    return item.price || item.unitPrice || item.productVariant?.price || 0;
}

function getItemQuantity(item) {
    return item.quantity || 1;
}

function getItemImage(item) {
    return item.imageUrl || item.productImage || item.product?.images?.[0]?.imageUrl || '/images/products/default-perfume.png';
}

function getItemId(item) {
    return item.id || item.cartItemId;
}

function getCartTotal(cart) {
    if (!cart) return 0;

    if (cart.totalAmount !== undefined) return cart.totalAmount;
    if (cart.total !== undefined) return cart.total;
    if (cart.subtotal !== undefined) return cart.subtotal;

    return getCartItems(cart).reduce((sum, item) => {
        return sum + Number(getItemPrice(item)) * Number(getItemQuantity(item));
    }, 0);
}

async function loadCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    try {
        currentCart = await api.get('/cart');
        const items = getCartItems(currentCart);

        if (items.length === 0) {
            container.innerHTML = `
        <div class="glass-card rounded-3xl p-8 text-center">
          <h2 class="text-2xl font-serif gold-text mb-3">Your cart is empty</h2>
          <p class="text-gray-400 mb-6">Discover your next signature scent.</p>
          <a href="/products.html" class="gold-btn inline-block rounded-xl px-8 py-3">Shop Perfumes</a>
        </div>
      `;

            updateCartTotals(0);
            return;
        }

        container.innerHTML = items.map(cartItemTemplate).join('');
        updateCartTotals(getCartTotal(currentCart));
    } catch (error) {
        container.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}

function cartItemTemplate(item) {
    const id = getItemId(item);
    const price = Number(getItemPrice(item));
    const quantity = Number(getItemQuantity(item));

    return `
    <div class="glass-card rounded-3xl p-5 flex flex-col md:flex-row gap-5">
      <img
        src="${getItemImage(item)}"
        alt="${getItemName(item)}"
        class="w-full md:w-36 h-40 object-cover rounded-2xl"
      />

      <div class="flex-1">
        <p class="gold-text text-xs uppercase tracking-[0.25em] mb-2">${getItemVariant(item)}</p>
        <h3 class="text-2xl font-serif mb-2">${getItemName(item)}</h3>
        <p class="text-gray-400 mb-4">Unit Price: ${money(price)}</p>

        <div class="flex items-center gap-3">
          <button onclick="updateCartItem(${id}, ${quantity - 1})" class="outline-gold rounded-lg px-3 py-2">−</button>
          <span class="w-10 text-center">${quantity}</span>
          <button onclick="updateCartItem(${id}, ${quantity + 1})" class="outline-gold rounded-lg px-3 py-2">+</button>
        </div>
      </div>

      <div class="flex md:flex-col justify-between items-end">
        <p class="text-xl gold-text font-semibold">${money(price * quantity)}</p>
        <button onclick="removeCartItem(${id})" class="text-red-300 hover:text-red-400 text-sm">
          Remove
        </button>
      </div>
    </div>
  `;
}

function updateCartTotals(total) {
    const subtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');

    if (subtotal) subtotal.textContent = money(total);
    if (cartTotal) cartTotal.textContent = money(total);
}

async function updateCartItem(itemId, quantity) {
    if (quantity < 1) {
        await removeCartItem(itemId);
        return;
    }

    try {
        await api.put(`/cart/items/${itemId}`, { quantity });
        await loadCart();
    } catch (error) {
        alert(error.message);
    }
}

async function removeCartItem(itemId) {
    try {
        await api.delete(`/cart/items/${itemId}`);
        await loadCart();
    } catch (error) {
        alert(error.message);
    }
}

async function loadCheckoutSummary() {
    const container = document.getElementById('checkoutSummary');
    if (!container) return;

    try {
        currentCart = await api.get('/cart');
        const items = getCartItems(currentCart);

        if (items.length === 0) {
            window.location.href = '/cart.html';
            return;
        }

        container.innerHTML = items.map(item => `
      <div class="flex justify-between gap-4 text-sm">
        <div>
          <p class="text-white">${getItemName(item)}</p>
          <p class="text-gray-400">${getItemVariant(item)} × ${getItemQuantity(item)}</p>
        </div>
        <p class="gold-text">${money(Number(getItemPrice(item)) * Number(getItemQuantity(item)))}</p>
      </div>
    `).join('');

        document.getElementById('checkoutTotal').textContent = money(getCartTotal(currentCart));
    } catch (error) {
        container.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}

async function placeOrder(event) {
    event.preventDefault();

    const form = event.target;
    const message = document.getElementById('checkoutMessage');

    const addressPayload = {
        fullName: form.fullName.value.trim(),
        phone: form.phone.value.trim(),
        addressLine1: form.addressLine1.value.trim(),
        addressLine2: form.addressLine2.value.trim(),
        city: form.city.value.trim(),
        state: form.state.value.trim(),
        postalCode: form.postalCode.value.trim(),
        country: form.country.value.trim(),
        isDefault: true
    };

    try {
        const savedAddress = await api.post('/addresses', addressPayload);

        const checkoutPayload = {
            addressId: savedAddress.id,
            paymentMethod: form.paymentMethod.value,
            notes: ""
        };

        await api.post('/orders/checkout', checkoutPayload);

        message.textContent = 'Order placed successfully.';
        message.className = 'mb-6 rounded-xl px-4 py-3 text-sm bg-green-500/20 border border-green-400/40 text-green-200';

        setTimeout(() => {
            window.location.href = '/my-orders.html';
        }, 900);

    } catch (error) {
        message.textContent = error.message;
        message.className = 'mb-6 rounded-xl px-4 py-3 text-sm bg-red-500/20 border border-red-400/40 text-red-200';
    }

}