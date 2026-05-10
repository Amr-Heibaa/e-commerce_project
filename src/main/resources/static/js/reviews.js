/* reviews.js — Developer 4 */

async function loadReviews(productId) {
    const list = document.getElementById('reviews-list');
    if (!list) return;
    try {
        const reviews = await api.get(`/reviews/product/${productId}`);
        if (!reviews.length) {
            list.innerHTML = `
                <div class="glass-card rounded-3xl p-8 text-center">
                    <p class="text-gray-400">No reviews yet. Be the first!</p>
                </div>`;
            return;
        }
        list.innerHTML = reviews.map(r => `
            <div class="glass-card rounded-3xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="gold-text text-xs uppercase tracking-[0.25em] mb-1">${r.username}</p>
                        <div class="flex gap-1">
                            ${[1,2,3,4,5].map(i =>
            `<span style="color:${i <= r.rating ? '#F5C842' : '#444'};font-size:1rem">★</span>`
        ).join('')}
                        </div>
                    </div>
                    <p class="text-gray-400 text-sm">${formatOrderDate(r.createdAt)}</p>
                </div>
                <p class="text-gray-300">${r.comment || ''}</p>
                ${api.isLoggedIn() && api.getUser()?.userId === r.userId ? `
                    <button onclick="deleteReview(${r.id})"
                            class="mt-4 text-sm text-red-400 hover:text-red-300">
                        Delete Review
                    </button>` : ''}
            </div>
        `).join('');
    } catch(e) {
        list.innerHTML = `<p class="text-red-300">${e.message}</p>`;
    }
}

function initRatingStars() {
    const container = document.getElementById('rating-stars');
    if (!container) return;
    let selected = 0;
    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        star.style.cssText = 'font-size:1.8rem;cursor:pointer;color:#444;transition:color .15s';
        star.dataset.val = i;
        star.onmouseenter = () => highlightStars(i);
        star.onmouseleave = () => highlightStars(selected);
        star.onclick = () => {
            selected = i;
            document.getElementById('rating-value').value = i;
            highlightStars(i);
        };
        container.appendChild(star);
    }
    function highlightStars(n) {
        container.querySelectorAll('span').forEach((s, idx) => {
            s.style.color = idx < n ? '#F5C842' : '#444';
        });
    }
}

async function submitReview() {
    if (!api.isLoggedIn()) { window.location.href = '/login.html'; return; }
    const rating  = +document.getElementById('rating-value').value;
    const comment = document.getElementById('review-comment').value.trim();
    const pid     = new URLSearchParams(window.location.search).get('id');
    if (!rating) { alert('Please select a rating'); return; }
    const btn = document.getElementById('submit-review-btn');
    btn.disabled = true;
    try {
        await api.post('/reviews', { productId: +pid, rating, comment });
        alert('Review submitted!');
        closeReviewModal();
        loadReviews(pid);
    } catch(e) { alert(e.message); }
    btn.disabled = false;
}

async function deleteReview(id) {
    if (!confirm('Delete this review?')) return;
    try {
        await api.delete(`/reviews/${id}`);
        const pid = new URLSearchParams(window.location.search).get('id');
        loadReviews(pid);
    } catch(e) { alert(e.message); }
}

function closeReviewModal() {
    document.getElementById('review-modal')?.classList.remove('show');
}