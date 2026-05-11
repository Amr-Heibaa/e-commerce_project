async function loadMyRefunds() {
    const list = document.getElementById('refunds-list');
    if (!list) return;

    try {
        const refunds = await api.get('/refunds/my');

        if (!refunds || refunds.length === 0) {
            list.innerHTML = `
                <div class="glass-card rounded-3xl p-8 text-center">
                    <p class="text-gray-400">No refund requests yet.</p>
                </div>
            `;
            return;
        }

        const statusColors = {
            PENDING: 'bg-yellow-500/20 text-yellow-300',
            APPROVED: 'bg-green-500/20 text-green-300',
            REJECTED: 'bg-red-500/20 text-red-300'
        };

        list.innerHTML = refunds.map(refund => `
            <div class="glass-card rounded-3xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="gold-text text-xs uppercase tracking-[0.25em] mb-1">
                            Order #${refund.orderId}
                        </p>
                        <p class="text-gray-400 text-sm">
                            ${formatOrderDate(refund.createdAt)}
                        </p>
                    </div>

                    <span class="rounded-full px-4 py-2 text-sm ${statusColors[refund.status] || 'bg-gray-500/20 text-gray-300'}">
                        ${refund.status}
                    </span>
                </div>

                <p class="text-gray-300">${refund.reason}</p>

                ${refund.resolvedAt ? `
                    <p class="text-gray-400 text-sm mt-3">
                        Resolved: ${formatOrderDate(refund.resolvedAt)}
                    </p>
                ` : ''}
            </div>
        `).join('');

    } catch (error) {
        list.innerHTML = `<p class="text-red-300">${error.message}</p>`;
    }
}

async function submitRefund() {
    const orderId = document.getElementById('refund-order-id').value.trim();
    const reason = document.getElementById('refund-reason').value.trim();

    if (!orderId || !reason) {
        alert('Please fill all fields');
        return;
    }

    const btn = document.getElementById('submit-refund-btn');
    btn.disabled = true;

    try {
        await api.post('/refunds', {
            orderId: Number(orderId),
            reason
        });

        alert('Refund request submitted.');

        document.getElementById('refund-order-id').value = '';
        document.getElementById('refund-reason').value = '';

        await loadMyRefunds();
    } catch (error) {
        alert(error.message);
    }

    btn.disabled = false;
}