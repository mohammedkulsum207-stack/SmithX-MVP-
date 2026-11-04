/* SM1THX marketplace wishlist controls — demo/localStorage only. */
(function () {
  'use strict';
  var EXTRA_KEY = 'smithx_profile_extras_v1';
  function accountEmail() {
    try {
      var session = JSON.parse(localStorage.getItem('smithx_auth_session_v1') || 'null');
      return session && session.email ? String(session.email).toLowerCase() : '';
    } catch (e) { return ''; }
  }
  function readData(email) {
    try {
      var all = JSON.parse(localStorage.getItem(EXTRA_KEY) || '{}') || {};
      return all[email] || { addresses: [], wishlist: [], notifications: {} };
    } catch (e) { return { addresses: [], wishlist: [], notifications: {} }; }
  }
  function writeData(email, data) {
    var all;
    try { all = JSON.parse(localStorage.getItem(EXTRA_KEY) || '{}') || {}; }
    catch (e) { all = {}; }
    all[email] = data;
    localStorage.setItem(EXTRA_KEY, JSON.stringify(all));
  }
  function install() {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.querySelectorAll('.product-card').forEach(function (card) {
      if (card.querySelector('.smx-wishlist-heart')) return;
      var imageButton = card.querySelector('.product-image-button');
      var call = imageButton && imageButton.getAttribute('onclick');
      var match = call && call.match(/openProductModal\('([^']+)'\)/);
      if (!match) return;
      var id = String(match[1]);
      var email = accountEmail();
      var saved = email ? readData(email).wishlist || [] : [];
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'smx-wishlist-heart';
      button.textContent = saved.indexOf(id) >= 0 ? '♥' : '♡';
      button.title = 'Save to wishlist';
      button.setAttribute('aria-label', 'Save product to wishlist');
      button.addEventListener('click', function () {
        var owner = accountEmail();
        if (!owner) {
          window.location.href = 'login.html?next=index.html';
          return;
        }
        var data = readData(owner);
        data.wishlist = Array.isArray(data.wishlist) ? data.wishlist : [];
        var index = data.wishlist.indexOf(id);
        if (index >= 0) data.wishlist.splice(index, 1);
        else data.wishlist.push(id);
        writeData(owner, data);
        button.textContent = index >= 0 ? '♡' : '♥';
        button.title = index >= 0 ? 'Save to wishlist' : 'Remove from wishlist';
      });
      card.appendChild(button);
    });
  }
  var grid = document.getElementById('productsGrid');
  if (grid && window.MutationObserver) {
    new MutationObserver(install).observe(grid, { childList: true, subtree: true });
    install();
  } else {
    document.addEventListener('DOMContentLoaded', install);
  }
})();