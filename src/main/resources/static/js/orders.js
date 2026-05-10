function requireOrderAuth() {
    if (!api.isLoggedIn()) {
        window.location.href = '/login.html';
    }
}

function orderMoney(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function formatOrderDate(value) {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString();
}

function getOrderItems(order) {
    return order.items || order.orderItems || [];
}

function getOrderTotal(order) {
    return order.totalAmount || order.total || order.grandTotal || 0;
}

function getOrderStatus(order) {
    return order.status || order.orderStatus || 'PENDING';
}

function getPaymentStatus(order) {
    return order.paymentStatus || order.payment?.status || 'PENDING';
}

async function loadMyOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    try {
        const response = await api.get('/orders/my-orders');
        const orders = response.content || response;

        if (!orders || orders.length === 0) {
            container.innerHTML = `
        <div class="glass-card rounded-3xl p-8 text-center">
          <h2 class="text-2xl font-serif gold-text mb-3">No orders yet</h2>
          <p class="text-gray-400 mb-6">Your fragrance journey starts here.</p>
          <a href="/products.html" class="gold-btn inline-block rounded-xl px-8 py-3">Shop Perfumes</a>
        </div>
      `;
            return;
        }

        container.innerHTML = orders.map(orderCard).join('');
    } catch (error) {
        container.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}

function orderCard(order) {
    const items = getOrderItems(order);

    return `
    <div class="glass-card rounded-3xl p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p class="gold-text text-xs uppercase tracking-[0.25em] mb-2">
            Order #${order.id}
          </p>
          <h2 class="text-2xl font-serif">
            ${formatOrderDate(order.createdAt || order.orderDate)}
          </h2>
        </div>

        <div class="flex flex-wrap gap-3 text-sm">
          <span class="rounded-full border border-yellow-500/30 px-4 py-2 gold-text">
            ${getOrderStatus(order)}
          </span>
          <span class="rounded-full border border-yellow-500/30 px-4 py-2 text-gray-300">
            Payment: ${getPaymentStatus(order)}
          </span>
          <span class="rounded-full bg-yellow-500/15 px-4 py-2 gold-text font-semibold">
            ${orderMoney(getOrderTotal(order))}
          </span>
        </div>
      </div>

      <div class="space-y-3">
        ${items.length ? items.map(orderItemRow).join('') : `<p class="text-gray-400">No order items found.</p>`}
      </div>

      <div class="mt-6 flex gap-3">
        <button onclick="requestRefund(${order.id})" class="outline-gold rounded-xl px-5 py-3">
          Request Refund
        </button>
      </div>
    </div>
  `;
}

function orderItemRow(item) {
    const name = item.productName || item.name || item.product?.name || 'Perfume';
    const size = item.size || item.variantSize || item.productVariant?.size || '';
    const quantity = item.quantity || 1;
    const price = item.price || item.unitPrice || 0;

    return `
    <div class="flex justify-between items-center border-t border-yellow-500/10 pt-3">
      <div>
        <p class="text-white">${name}</p>
        <p class="text-gray-400 text-sm">${size} × ${quantity}</p>
      </div>

      <p class="gold-text">${orderMoney(Number(price) * Number(quantity))}</p>
    </div>
  `;
}

async function requestRefund(orderId) {
    const reason = prompt('Please enter the refund reason:');
    if (!reason) return;

    try {
        await api.post('/refunds', {
            orderId,
            reason
        });

        alert('Refund request submitted successfully.');
    } catch (error) {
        alert(error.message);
    }
}