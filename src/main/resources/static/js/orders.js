async function loadMyOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    try {
        const orders = await api.get('/orders/my');
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
            PROCESSING: 'bg-blue-500/20 text-blue-300',
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
                    ${(order.items || []).map(item => `
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-300">${item.productName} × ${item.quantity}</span>
                            <span class="gold-text">$${Number(item.price).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <p class="text-right font-semibold mt-4 text-lg gold-text">
                    Total: $${Number(order.totalAmount || order.total).toFixed(2)}
                </p>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}