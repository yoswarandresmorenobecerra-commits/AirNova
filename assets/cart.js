(function () {
  function qsa(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function getCartSections() {
    return qsa(document, '[data-cart-section]');
  }

  function updateCartCount(cart) {
    qsa(document, '[data-cart-count]').forEach(function (el) {
      el.textContent = cart.item_count;
      el.hidden = cart.item_count === 0;
    });
  }

  function refreshCartSections() {
    return fetch('/cart.js')
      .then(function (response) {
        return response.json();
      })
      .then(function (cart) {
        updateCartCount(cart);

        return Promise.all(
          getCartSections().map(function (container) {
            var sectionId = container.dataset.cartSection;
            return fetch(window.location.pathname + '?section_id=' + sectionId)
              .then(function (response) {
                return response.text();
              })
              .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var replacement = doc.querySelector('[data-cart-section="' + sectionId + '"]');
                if (replacement) {
                  container.innerHTML = replacement.innerHTML;
                  bindCartSection(container);
                }
              });
          })
        );
      });
  }

  function changeLine(line, quantity) {
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity })
    }).then(refreshCartSections);
  }

  function addVariant(variantId) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
    }).then(refreshCartSections);
  }

  function bindCartSection(container) {
    qsa(container, '[data-cart-qty-decrease]').forEach(function (button) {
      button.addEventListener('click', function () {
        var line = parseInt(button.dataset.line, 10);
        var input = container.querySelector('[data-cart-qty-input][data-line="' + line + '"]');
        var quantity = Math.max(0, parseInt(input.value, 10) - 1);
        changeLine(line, quantity);
      });
    });

    qsa(container, '[data-cart-qty-increase]').forEach(function (button) {
      button.addEventListener('click', function () {
        var line = parseInt(button.dataset.line, 10);
        var input = container.querySelector('[data-cart-qty-input][data-line="' + line + '"]');
        var quantity = parseInt(input.value, 10) + 1;
        changeLine(line, quantity);
      });
    });

    qsa(container, '[data-cart-qty-input]').forEach(function (input) {
      input.addEventListener('change', function () {
        var line = parseInt(input.dataset.line, 10);
        var quantity = Math.max(0, parseInt(input.value, 10) || 0);
        changeLine(line, quantity);
      });
    });

    qsa(container, '[data-cart-remove]').forEach(function (button) {
      button.addEventListener('click', function () {
        changeLine(parseInt(button.dataset.line, 10), 0);
      });
    });

    qsa(container, '[data-cart-suggestion-add]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (button.disabled) return;
        addVariant(button.dataset.variantId);
      });
    });
  }

  function openDrawer() {
    var drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-drawer-open');
  }

  function closeDrawer() {
    var drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-drawer-open');
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-cart-drawer-open]')) {
      event.preventDefault();
      openDrawer();
    }
    if (event.target.closest('[data-cart-drawer-close]')) {
      event.preventDefault();
      closeDrawer();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeDrawer();
  });

  document.addEventListener('DOMContentLoaded', function () {
    getCartSections().forEach(bindCartSection);
  });
})();
