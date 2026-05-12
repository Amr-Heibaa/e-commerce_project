async function loadMyOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    try {

        const response = await api.get('/orders/my');
        const orders = Array.isArray(response) ? response : (response.content || []);

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="glass-card rounded-3xl p-8 text-center">
                    <p class="text-gray-400">No orders yet.</p>
                    <a href="/products.html" class="gold-text mt-3 inline-block">Start Shopping</a>
                </div>
            `;
            return;
        }

        const statusColors = {
            PENDING: 'bg-yellow-500/20 text-yellow-300',
            PAID: 'bg-blue-500/20 text-blue-300',
            SHIPPED: 'bg-purple-500/20 text-purple-300',
            DELIVERED: 'bg-green-500/20 text-green-300',
            CANCELLED: 'bg-red-500/20 text-red-300'
        };

        container.innerHTML = orders.map(order => `
            <div class="glass-card rounded-3xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="gold-text text-xs uppercase tracking-[0.25em] mb-1">
                            Order #${order.id}
                        </p>
                        <p class="text-gray-400 text-sm">
                            ${formatOrderDate(order.createdAt)}
                        </p>
                    </div>

                    <span class="rounded-full px-4 py-2 text-sm ${statusColors[order.status] || 'bg-gray-500/20 text-gray-300'}">
                        ${order.status}
                    </span>
                </div>

                <div class="space-y-2">
                    ${(order.items || order.orderItems || []).map(item => {
            const itemName = item.productName || 'Product';
            const quantity = item.quantity || 1;
            const price = item.subtotal ?? item.unitPrice ?? 0;

            return `
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-300">
                                    ${itemName} × ${quantity}
                                </span>
                                <span class="gold-text">
                                    $${Number(price).toFixed(2)}
                                </span>
                            </div>
                        `;
        }).join('')}
                </div>

                <p class="text-right font-semibold mt-4 text-lg gold-text">
                    Total: $${Number(order.totalAmount || 0).toFixed(2)}
                </p>

                <div class="mt-5 flex justify-end">
                    <button onclick="requestRefund(${order.id})"
                            class="outline-gold rounded-xl px-5 py-2">
                        Request Refund
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}