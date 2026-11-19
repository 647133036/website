document.addEventListener('DOMContentLoaded', function () {
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

  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      faqItems.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  var grid = document.getElementById('product-grid');
  var chips = document.querySelectorAll('.filter-chips .chip');
  var sortSelect = document.getElementById('sort');
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
      var pa = parseFloat(a.dataset.price);
      var pb = parseFloat(b.dataset.price);
      if (value === 'price-asc') return pa - pb;
      if (value === 'price-desc') return pb - pa;
      return 0;
    });
    sorted.forEach(function (card) { grid.appendChild(card); });
  }
  if (sortSelect) sortSelect.addEventListener('change', function () { applySort(sortSelect.value); });

  var count = 0;
  var countEls = document.querySelectorAll('[data-cart-count]');
  document.querySelectorAll('.add-cart').forEach(function (btn) {
    btn.addEventListener('click', function () {
      count += 1;
      countEls.forEach(function (el) { el.textContent = String(count); });
    });
  });
});
