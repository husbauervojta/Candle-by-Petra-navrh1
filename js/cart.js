const CART_KEY = 'cbp_cart';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQ49FIUR2aNAAjN6x4lO3FoG4y6bpsrhjhnLqIILUz9cXpsLjQIEIM8gGNVphtNZ4c/exec';

window.stock = {};

function loadStock(cb) {
  fetch(APPS_SCRIPT_URL)
    .then(r => r.json())
    .then(data => { window.stock = data; if (cb) cb(data); })
    .catch(() => { if (cb) cb({}); });
}

(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = '#cart-step-3{display:none;flex-direction:column;align-items:center;justify-content:center;padding:2.5rem;text-align:center;flex:1}.order-success{display:flex;flex-direction:column;align-items:center;gap:1.1rem}.order-success h3{font-family:"Cormorant Garamond",Georgia,serif;font-size:1.8rem;font-weight:400;color:#1a1a18}.order-success p{color:#7a7a72;font-size:.9rem;line-height:1.6}.cart-max-note{font-size:.78rem;color:#a08060;margin-top:.25rem;line-height:1.4}.cart-max-note a{color:#c9a96e;text-decoration:underline}.cart-how{margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid #e8e2d9}.cart-how-title{font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;color:#7a7a72;margin-bottom:.7rem}.cart-how-step{display:flex;align-items:flex-start;gap:.6rem;margin-bottom:.45rem;font-size:.78rem;color:#7a7a72;line-height:1.45}.cart-how-num{width:17px;height:17px;background:#c9a96e;color:#fff;border-radius:50%;font-size:.6rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}';
  document.head.appendChild(s);
})();

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function addToCartFromCard(btn) {
  const card = btn.closest('.product-card');
  const name  = card.dataset.name;
  const price = parseFloat(card.dataset.price);

  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  const inCart = existing ? existing.qty : 0;
  if (window.stock[name] !== undefined && inCart >= window.stock[name]) return;

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  saveCart(cart);
  openCart();
}

function removeFromCart(name) {
  saveCart(getCart().filter(i => i.name !== name));
}

function updateQty(name, delta) {
  const cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;
  if (delta > 0 && window.stock[name] !== undefined && item.qty >= window.stock[name]) return;
  item.qty += delta;
  if (item.qty <= 0) {
    saveCart(cart.filter(i => i.name !== name));
  } else {
    saveCart(cart);
  }
}

function getTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCart() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });

  const list = document.getElementById('cart-items');
  if (!list) return;

  const contactHref = window.location.pathname.includes('/pages/') ? '../contact/contact.html' : 'pages/contact/contact.html';

  if (cart.length === 0) {
    list.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
  } else {
    list.innerHTML = cart.map(item => {
      const atMax = window.stock[item.name] !== undefined && item.qty >= window.stock[item.name];
      const maxNote = atMax
        ? `<p class="cart-max-note">This is the maximum available quantity. For a larger order, please <a href="${contactHref}">contact us</a>.</p>`
        : '';
      return `
      <div class="cart-item">
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty('${item.name}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.name}', 1)">+</button>
          <button class="cart-remove" onclick="removeFromCart('${item.name}')">&times;</button>
        </div>
        ${maxNote}
      </div>`;
    }).join('');
  }

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = '$' + getTotal().toFixed(2);
}

function openCart() {
  const step3 = document.getElementById('cart-step-3');
  if (step3) step3.style.display = 'none';
  document.getElementById('cart-overlay').classList.add('active');
  document.getElementById('cart-drawer').classList.add('active');
  document.body.style.overflow = 'hidden';
  showCartStep();
  renderCart();
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('active');
  document.getElementById('cart-drawer').classList.remove('active');
  document.body.style.overflow = '';
  showCartStep();
}

function showCartStep() {
  const step1 = document.getElementById('cart-step-1');
  const step2 = document.getElementById('cart-step-2');
  if (step1) step1.style.display = 'flex';
  if (step2) step2.style.display = 'none';
}

function showCheckoutStep() {
  const cart = getCart();
  if (cart.length === 0) return;

  const step1 = document.getElementById('cart-step-1');
  const step2 = document.getElementById('cart-step-2');
  if (step1) step1.style.display = 'none';
  if (step2) {
    const summary = document.getElementById('checkout-summary');
    if (summary) {
      summary.innerHTML = cart.map(i =>
        `<div class="checkout-summary-row">
          <span>${i.name} × ${i.qty}</span>
          <span>$${(i.price * i.qty).toFixed(2)}</span>
        </div>`
      ).join('') +
      `<div class="checkout-summary-total">
        <span>Total</span>
        <span>$${getTotal().toFixed(2)}</span>
      </div>`;
    }
    step2.style.display = 'flex';
  }
}

function refreshSoldOutUI() {
  document.querySelectorAll('.product-card').forEach(function(card) {
    const name = card.dataset.name;
    if (window.stock[name] === undefined) return;
    const btn = card.querySelector('.btn-pill');
    if (!btn) return;
    if (window.stock[name] === 0) {
      btn.textContent = 'Sold out for now';
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }
  });
  if (typeof updateSoldOutUI === 'function' && typeof getCurrentCandle === 'function') {
    updateSoldOutUI(getCurrentCandle());
  }
}

function showSuccessStep(firstName) {
  let step3 = document.getElementById('cart-step-3');
  if (!step3) {
    step3 = document.createElement('div');
    step3.id = 'cart-step-3';
    document.getElementById('cart-drawer').appendChild(step3);
  }
  step3.innerHTML = `
    <div class="order-success">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
      <h3>Order confirmed!</h3>
      <p>Thank you, ${firstName}.<br>Check your email — payment details and order summary are on their way.</p>
      <button class="checkout-submit" onclick="closeCart()" style="margin-top:.5rem">Done</button>
    </div>`;
  document.getElementById('cart-step-1').style.display = 'none';
  document.getElementById('cart-step-2').style.display = 'none';
  step3.style.display = 'flex';
}

function submitOrder(e) {
  e.preventDefault();
  const form = document.getElementById('checkout-form');
  const submitBtn = form.querySelector('[type="submit"]');
  const firstName = form.querySelector('[name="first-name"]').value;
  const lastName  = form.querySelector('[name="last-name"]').value;
  const email     = form.querySelector('[name="email"]').value;
  const phone     = form.querySelector('[name="phone"]').value;
  const address   = form.querySelector('[name="address"]').value;

  const cart = getCart();
  const total = '$' + getTotal().toFixed(2);

  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      firstName, lastName, email, phone, address,
      items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      total
    })
  })
  .then(() => {
    cart.forEach(i => {
      if (window.stock[i.name] !== undefined) {
        window.stock[i.name] = Math.max(0, window.stock[i.name] - i.qty);
      }
    });
    saveCart([]);
    refreshSoldOutUI();
    showSuccessStep(firstName);
  })
  .catch(() => {
    submitBtn.textContent = 'Place Order';
    submitBtn.disabled = false;
    alert('Connection error. Please try again.');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  const form = document.getElementById('checkout-form');
  if (form) form.addEventListener('submit', submitOrder);

  const footer = document.querySelector('.cart-footer');
  if (footer) {
    const how = document.createElement('div');
    how.className = 'cart-how';
    how.innerHTML =
      '<p class="cart-how-title">How it works</p>' +
      '<div class="cart-how-step"><span class="cart-how-num">1</span><span>Place your order</span></div>' +
      '<div class="cart-how-step"><span class="cart-how-num">2</span><span>Receive payment instructions by email</span></div>' +
      '<div class="cart-how-step"><span class="cart-how-num">3</span><span>Pay by bank transfer within 5 days</span></div>' +
      '<div class="cart-how-step"><span class="cart-how-num">4</span><span>Shipping confirmation email when your package is on its way</span></div>';
    footer.appendChild(how);
  }
});
