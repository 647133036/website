document.addEventListener('DOMContentLoaded', function () {
  // Mobile drawer
  var drawer = document.getElementById('drawer');
  var toggle = document.getElementById('nav-toggle');
  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }
  if (toggle) toggle.addEventListener('click', openDrawer);
  if (drawer) {
    drawer.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', closeDrawer);
    });
    drawer.querySelectorAll('.drawer-nav a, .drawer-cta a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  // FAQ accordion (single open)
  document.querySelectorAll('[data-faq]').forEach(function (list) {
    var items = list.querySelectorAll('[data-faq-item]');
    items.forEach(function (item) {
      var q = item.querySelector('[data-faq-toggle]');
      var a = item.querySelector('[data-faq-answer]');
      q.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        items.forEach(function (other) {
          other.classList.remove('open');
          other.querySelector('[data-faq-answer]').style.maxHeight = null;
          other.querySelector('[data-faq-toggle]').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
          q.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });

  // Product filter + sort
  var grid = document.getElementById('product-grid');
  var chips = document.querySelectorAll('.filter-chips .chip');
  var sortSelect = document.getElementById('shop-sort');
  var cards = grid ? Array.from(grid.querySelectorAll('.product-card')) : [];

  function applyFilter(type) {
    cards.forEach(function (card) {
      var show = type === 'all' || card.dataset.type === type;
      card.style.display = show ? '' : 'none';
    });
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      applyFilter(chip.dataset.filter);
    });
  });

  function applySort(value) {
    var sorted = cards.slice().sort(function (a, b) {
      var pa = parseFloat(a.dataset.price) || 0;
      var pb = parseFloat(b.dataset.price) || 0;
      if (value === 'price-ascending') return pa - pb;
      if (value === 'price-descending') return pb - pa;
      return 0;
    });
    sorted.forEach(function (card) { grid.appendChild(card); });
  }
  if (sortSelect) sortSelect.addEventListener('change', function () { applySort(sortSelect.value); });

  // Cart count (AJAX add-to-cart)
  var countEls = document.querySelectorAll('[data-cart-count]');
  function updateCount(delta) {
    var current = 0;
    countEls.forEach(function (el) { current = parseInt(el.textContent, 10) || 0; });
    current += delta;
    countEls.forEach(function (el) { el.textContent = String(current); });
  }
  document.querySelectorAll('.add-cart').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var form = btn.closest('form');
      if (form) {
        e.preventDefault();
        var variantId = form.querySelector('input[name="id"]').value;
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: 1 })
        })
          .then(function (r) { return r.json(); })
          .then(function () { updateCount(1); })
          .catch(function () { form.submit(); });
      } else {
        updateCount(1);
      }
    });
  });
});
