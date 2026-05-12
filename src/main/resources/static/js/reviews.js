// Safe fallback in case orders.js is not loaded on this page
const formatOrderDate = window.formatOrderDate || (v => v ? new Date(v).toLocaleDateString() : 'N/A');
async function loadReviews(productId) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    try {
        const reviews = await api.get(`/reviews/product/${productId}`);

        if (!reviews || reviews.length === 0) {
            list.innerHTML = `
                <div class="glass-card rounded-3xl p-8 text-center">
                    <p class="text-gray-400">No reviews yet. Be the first!</p>
                </div>
            `;
            return;
        }

        list.innerHTML = reviews.map(review => `
            <div class="glass-card rounded-3xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="gold-text text-xs uppercase tracking-[0.25em] mb-1">
                            ${review.username || 'Customer'}
                        </p>

                        <div class="flex gap-1">
                            ${[1, 2, 3, 4, 5].map(i => `
                                <span style="color:${i <= review.rating ? '#F5C842' : '#444'};font-size:1rem">★</span>
                            `).join('')}
                        </div>
                    </div>

                    <p class="text-gray-400 text-sm">
                        ${formatOrderDate(review.createdAt)}
                    </p>
                </div>

                <p class="text-gray-300">${review.comment || ''}</p>

                ${api.isLoggedIn() && api.getUser()?.userId === review.userId ? `
                    <button onclick="deleteReview(${review.id})"
                            class="mt-4 text-sm text-red-400 hover:text-red-300">
                        Delete Review
                    </button>
                ` : ''}
            </div>
        `).join('');

    } catch (error) {
        list.innerHTML = `<p class="text-red-300">${error.message}</p>`;
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
        container.querySelectorAll('span').forEach((star, index) => {
            star.style.color = index < n ? '#F5C842' : '#444';
        });
    }
}

async function submitReview() {
    if (!api.isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }

    const rating = Number(document.getElementById('rating-value').value);
    const comment = document.getElementById('review-comment').value.trim();
    const productId = new URLSearchParams(window.location.search).get('id');

    if (!rating) {
        alert('Please select a rating');
        return;
    }

    const btn = document.getElementById('submit-review-btn');
    btn.disabled = true;

    try {
        await api.post('/reviews', {
            productId: Number(productId),
            rating,
            comment
        });

        alert('Review submitted.');
        closeReviewModal();
        await loadReviews(productId);

    } catch (error) {
        alert(error.message);
    }

    btn.disabled = false;
}

async function deleteReview(id) {
    if (!confirm('Delete this review?')) return;

    try {
        await api.delete(`/reviews/${id}`);

        const productId = new URLSearchParams(window.location.search).get('id');
        await loadReviews(productId);
    } catch (error) {
        alert(error.message);
    }
}

function closeReviewModal() {
    document.getElementById('review-modal')?.classList.remove('show');

}