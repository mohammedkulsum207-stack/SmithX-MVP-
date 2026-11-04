/* SM1THX Profile Extras — lightweight MVP features.
   Data stays in this browser, per signed-in account. */
(function () {
  'use strict';
  if (typeof smxCurrentUser !== 'function' || !smxCurrentUser()) return;

  var user = smxCurrentUser();
  var key = 'smithx_profile_extras_v1';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };
  function readAll() {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function readUser() {
    var all = readAll();
    return all[user.email] || { addresses: [], wishlist: [], notifications: { orders: true, offers: false, account: true } };
  }
  function saveUser(data) {
    var all = readAll();
    all[user.email] = data;
    localStorage.setItem(key, JSON.stringify(all));
  }
  function toast(message) {
    var el = $('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* Add a new tab without changing the existing profile workflows. */
  var tabs = document.querySelector('.profile-tabs');
  var body = document.querySelector('.profile-body .container');
  if (!tabs || !body) return;
  var moreTab = document.createElement('button');
  moreTab.className = 'profile-tab';
  moreTab.type = 'button';
  moreTab.setAttribute('role', 'tab');
  moreTab.setAttribute('aria-selected', 'false');
  moreTab.dataset.panel = 'extras';
  moreTab.textContent = 'Personal';
  tabs.appendChild(moreTab);

  var panel = document.createElement('section');
  panel.className = 'panel smx-extra-panel';
  panel.id = 'panel-extras';
  panel.setAttribute('role', 'tabpanel');
  panel.hidden = true;
  panel.innerHTML = [
    '<div class="smx-extra-grid">',
      '<section class="card smx-extra-card">',
        '<div class="smx-extra-heading"><div><span class="smx-extra-kicker">YOUR ACCOUNT</span><h2>Delivery addresses</h2></div><span class="smx-extra-icon">⌖</span></div>',
        '<p class="smx-extra-copy">Save addresses for faster demo checkouts.</p>',
        '<form id="smxAddressForm" class="smx-extra-form">',
          '<input class="input" id="smxAddressLabel" maxlength="30" placeholder="Label (e.g. Home)" required>',
          '<input class="input" id="smxAddressName" maxlength="70" placeholder="Recipient full name" required>',
          '<input class="input" id="smxAddressPhone" type="tel" maxlength="24" placeholder="Phone number" required>',
          '<input class="input" id="smxAddressLine" maxlength="140" placeholder="Street, building, estate" required>',
          '<div class="smx-extra-two"><input class="input" id="smxAddressTown" maxlength="60" placeholder="Town / city" required><input class="input" id="smxAddressCounty" maxlength="60" placeholder="County"></div>',
          '<button class="btn btn-primary" type="submit">Save address</button>',
        '</form>',
        '<div id="smxAddressList" class="smx-extra-list"></div>',
      '</section>',
      '<section class="card smx-extra-card">',
        '<div class="smx-extra-heading"><div><span class="smx-extra-kicker">YOUR SHOPPING</span><h2>Wishlist</h2></div><span class="smx-extra-icon">♡</span></div>',
        '<p class="smx-extra-copy">Tap the heart on any marketplace product to save it here.</p>',
        '<div id="smxWishlist" class="smx-wishlist"></div>',
        '<a class="btn btn-outline" href="index.html#market">Explore marketplace</a>',
      '</section>',
      '<section class="card smx-extra-card">',
        '<div class="smx-extra-heading"><div><span class="smx-extra-kicker">SMX CREDIT</span><h2>Wallet overview</h2></div><span class="smx-extra-icon">◈</span></div>',
        '<div class="smx-wallet-balance"><span>Available demo balance</span><strong id="smxWalletBalance">SMX 0</strong><small>1 SMX = KES 1 · Demo only</small></div>',
        '<div id="smxWalletHistory" class="smx-extra-list"></div>',
        '<a class="btn btn-primary" href="wallet.html">Open SMX Wallet</a>',
      '</section>',
      '<section class="card smx-extra-card">',
        '<div class="smx-extra-heading"><div><span class="smx-extra-kicker">PREFERENCES</span><h2>Notifications</h2></div><span class="smx-extra-icon">♧</span></div>',
        '<p class="smx-extra-copy">Choose which updates you want this demo account to show.</p>',
        '<div class="smx-pref-row"><div><strong>Order updates</strong><small>Order status and delivery progress</small></div><input type="checkbox" id="smxNotifyOrders"></div>',
        '<div class="smx-pref-row"><div><strong>Offers and news</strong><small>Promotions and marketplace announcements</small></div><input type="checkbox" id="smxNotifyOffers"></div>',
        '<div class="smx-pref-row"><div><strong>Account notices</strong><small>Profile and security-related messages</small></div><input type="checkbox" id="smxNotifyAccount"></div>',
        '<p class="smx-extra-note">These preferences are saved on this device. No email or SMS is sent by the MVP.</p>',
      '</section>',
      '<section class="card smx-extra-card smx-notification-center">',
        '<div class="smx-extra-heading"><div><span class="smx-extra-kicker">YOUR ACTIVITY</span><h2>Notification centre</h2></div><span class="smx-extra-icon">♧</span></div>',
        '<div class="smx-notification-toolbar"><span id="smxUnreadCount">0 unread</span><button type="button" class="smx-text-button" id="smxMarkAllRead">Mark all as read</button></div>',
        '<div id="smxNotificationList" class="smx-notification-list"></div>',
        '<p class="smx-extra-note">Updates are generated from activity saved in this browser. Push notifications, email and SMS are not connected in this MVP.</p>',
      '</section>',
      '<section class="card smx-extra-card smx-completion-card">',
        '<div class="smx-extra-heading"><div><span class="smx-extra-kicker">GET MORE FROM SMITHX</span><h2>Complete your profile</h2></div><span class="smx-extra-icon">✦</span></div>',
        '<div class="smx-completion-summary"><strong id="smxCompletionPercent">0%</strong><span id="smxCompletionLabel">Profile setup</span></div>',
        '<div class="smx-progress-track"><span id="smxCompletionBar"></span></div>',
        '<div id="smxCompletionTasks" class="smx-completion-tasks"></div>',
        '<p class="smx-extra-note">A more complete profile helps make shopping and checkout smoother.</p>',
      '</section>',
      '<section class="card smx-extra-card smx-verification-card">',
        '<div class="smx-extra-heading"><div><span class="smx-extra-kicker">ACCOUNT STATUS</span><h2>Verification & security</h2></div><span class="smx-extra-icon">✓</span></div>',
        '<div class="smx-status-line"><span>Email address</span><strong class="smx-status-pending">Not verified</strong></div>',
        '<div class="smx-status-line"><span>Phone number</span><strong class="smx-status-pending">Not verified</strong></div>',
        '<p class="smx-extra-note">Verification is displayed as unavailable in this MVP. No verification badge is issued until a real email or SMS confirmation flow is connected.</p>',
        '<a class="btn btn-outline" href="#settings" id="smxSecuritySettings">Review account settings</a>',
      '</section>',
    '</div>'
  ].join('');
  body.appendChild(panel);

  function openExtras() {
    tabs.querySelectorAll('.profile-tab').forEach(function (tab) {
      tab.setAttribute('aria-selected', String(tab === moreTab));
    });
    document.querySelectorAll('.profile-body .panel').forEach(function (item) {
      item.hidden = item !== panel;
    });
    history.replaceState(null, '', '#extras');
    renderAll();
  }
  moreTab.addEventListener('click', openExtras);
  tabs.querySelectorAll('.profile-tab').forEach(function (tab) {
    if (tab === moreTab) return;
    tab.addEventListener('click', function () {
      tabs.querySelectorAll('.profile-tab').forEach(function (t) {
        t.setAttribute('aria-selected', String(t === tab));
      });
      document.querySelectorAll('.profile-body .panel').forEach(function (item) {
        item.hidden = item.id !== 'panel-' + tab.dataset.panel;
      });
      history.replaceState(null, '', '#' + tab.dataset.panel);
    });
  });
  var initialHash = location.hash.replace('#', '');
  if (initialHash === 'extras') openExtras();

  /* Avatar upload is intentionally local-only and size-limited. */
  var avatar = $('avatar');
  function restoreAvatar() {
    var latest = smxCurrentUser();
    if (!avatar || !latest || !latest.avatarData) return;
    avatar.textContent = '';
    var image = document.createElement('img');
    image.src = latest.avatarData;
    image.alt = 'Your profile photo';
    avatar.appendChild(image);
  }
  if (avatar) {
    var photoWrap = document.createElement('div');
    photoWrap.className = 'smx-avatar-tools';
    photoWrap.innerHTML = '<label class="smx-photo-button" for="smxAvatarFile">Change photo</label><input id="smxAvatarFile" type="file" accept="image/png,image/jpeg,image/webp" hidden>';
    avatar.insertAdjacentElement('afterend', photoWrap);
    restoreAvatar();
    $('smxAvatarFile').addEventListener('change', function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 1024 * 1024) {
        toast('Choose a JPG, PNG or WebP photo under 1 MB.');
        event.target.value = '';
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var latest = smxCurrentUser();
        smxUpdateUser(latest.email, { avatarData: String(reader.result) });
        restoreAvatar();
        toast('Profile photo saved on this device.');
      };
      reader.readAsDataURL(file);
    });
    if ($('detailsForm')) $('detailsForm').addEventListener('submit', function () {
      window.setTimeout(restoreAvatar, 0);
    });
  }

  function renderAddresses() {
    var data = readUser();
    var list = $('smxAddressList');
    if (!data.addresses.length) {
      list.innerHTML = '<div class="smx-empty">No saved addresses yet.</div>';
      return;
    }
    list.innerHTML = data.addresses.map(function (a, i) {
      return '<article class="smx-address-item"><div><strong>' + esc(a.label) + '</strong><p>' + esc(a.name) + ' · ' + esc(a.phone) + '</p><small>' + esc(a.line) + ', ' + esc(a.town) + (a.county ? ', ' + esc(a.county) : '') + '</small></div><button type="button" class="smx-text-button" data-remove-address="' + i + '">Remove</button></article>';
    }).join('');
  }
  $('smxAddressForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var data = readUser();
    data.addresses.push({
      label: $('smxAddressLabel').value.trim(),
      name: $('smxAddressName').value.trim(),
      phone: $('smxAddressPhone').value.trim(),
      line: $('smxAddressLine').value.trim(),
      town: $('smxAddressTown').value.trim(),
      county: $('smxAddressCounty').value.trim()
    });
    saveUser(data);
    event.target.reset();
    renderAddresses();
    toast('Delivery address saved.');
  });
  $('smxAddressList').addEventListener('click', function (event) {
    var button = event.target.closest('[data-remove-address]');
    if (!button) return;
    var data = readUser();
    data.addresses.splice(Number(button.dataset.removeAddress), 1);
    saveUser(data);
    renderAddresses();
    toast('Address removed.');
  });

  function wishlistIds() { return readUser().wishlist || []; }
  function toggleWishlist(productId) {
    var data = readUser();
    var id = String(productId);
    var index = data.wishlist.indexOf(id);
    if (index >= 0) data.wishlist.splice(index, 1);
    else data.wishlist.push(id);
    saveUser(data);
    renderWishlist();
    toast(index >= 0 ? 'Removed from wishlist.' : 'Added to wishlist.');
  }
  window.smxToggleProfileWishlist = toggleWishlist;
  function renderWishlist() {
    var ids = wishlistIds();
    if (!ids.length) {
      $('smxWishlist').innerHTML = '<div class="smx-empty">Your wishlist is empty. Save products using the ♡ button in the marketplace.</div>';
      return;
    }
    var products = typeof getAllProducts === 'function' ? getAllProducts() : [];
    var html = ids.map(function (id) {
      var product = products.find(function (p) { return String(p.id) === id; });
      if (!product) return '';
      return '<article class="smx-wishlist-item">' +
        (product.image ? '<img src="' + esc(product.image) + '" alt="">' : '') +
        '<div><strong>' + esc(product.name) + '</strong><small>' + esc(typeof formatKES === 'function' ? formatKES(product.price) : 'KES ' + product.price) + '</small></div>' +
        '<button type="button" class="smx-text-button" data-remove-wish="' + esc(id) + '">Remove</button></article>';
    }).join('');
    $('smxWishlist').innerHTML = html || '<div class="smx-empty">Saved products are no longer available.</div>';
  }
  $('smxWishlist').addEventListener('click', function (event) {
    var button = event.target.closest('[data-remove-wish]');
    if (button) toggleWishlist(button.dataset.removeWish);
  });

  /* Add a wishlist heart to marketplace product cards as they render. */
  function addWishlistButtons() {
    var grid = $('productsGrid');
    if (!grid) return;
    grid.querySelectorAll('.product-card').forEach(function (card) {
      if (card.querySelector('.smx-wishlist-heart')) return;
      var button = document.createElement('button');
      var imageButton = card.querySelector('.product-image-button');
      var productId = imageButton && imageButton.getAttribute('onclick');
      var match = productId && productId.match(/openProductModal\('([^']+)'\)/);
      if (!match) return;
      var id = match[1];
      button.type = 'button';
      button.className = 'smx-wishlist-heart';
      button.textContent = wishlistIds().indexOf(String(id)) >= 0 ? '♥' : '♡';
      button.setAttribute('aria-label', 'Save product to wishlist');
      button.title = 'Save to wishlist';
      button.addEventListener('click', function () {
        toggleWishlist(id);
        button.textContent = wishlistIds().indexOf(String(id)) >= 0 ? '♥' : '♡';
      });
      card.appendChild(button);
    });
  }
  var grid = $('productsGrid');
  if (grid && window.MutationObserver) {
    new MutationObserver(addWishlistButtons).observe(grid, { childList: true, subtree: true });
    addWishlistButtons();
  }

  function renderWallet() {
    if (typeof smxWalletBalance !== 'function' || typeof smxWalletEntries !== 'function') {
      $('smxWalletBalance').textContent = 'Unavailable';
      $('smxWalletHistory').innerHTML = '<div class="smx-empty">Open the wallet page to review demo credit.</div>';
      return;
    }
    var audit = smxWalletAudit(user.email);
    $('smxWalletBalance').textContent = audit.ok ? 'SMX ' + Number(audit.balance).toLocaleString('en-KE') : 'Paused';
    var entries = smxWalletEntries(user.email).slice().reverse().slice(0, 5);
    $('smxWalletHistory').innerHTML = entries.length ? entries.map(function (entry) {
      var sign = entry.type === 'spend' || entry.type === 'withdraw' ? '−' : '+';
      return '<div class="smx-wallet-row"><div><strong>' + esc((entry.type || 'Activity').replace(/^./, function (c) { return c.toUpperCase(); })) + '</strong><small>' + esc(new Date(entry.at).toLocaleDateString()) + '</small></div><strong>' + sign + 'SMX ' + Number(entry.amount).toLocaleString('en-KE') + '</strong></div>';
    }).join('') : '<div class="smx-empty">No wallet activity yet.</div>';
  }

  function renderPreferences() {
    var prefs = readUser().notifications || {};
    $('smxNotifyOrders').checked = prefs.orders !== false;
    $('smxNotifyOffers').checked = prefs.offers === true;
    $('smxNotifyAccount').checked = prefs.account !== false;
  }
  ['Orders', 'Offers', 'Account'].forEach(function (name) {
    $('smxNotify' + name).addEventListener('change', function (event) {
      var data = readUser();
      data.notifications = data.notifications || {};
      data.notifications[name.toLowerCase()] = event.target.checked;
      saveUser(data);
      toast('Notification preferences saved.');
    });
  });
  $('smxSecuritySettings').addEventListener('click', function () {
    var settings = $('panel-settings');
    if (!settings) return;
    tabs.querySelectorAll('.profile-tab').forEach(function (tab) {
      tab.setAttribute('aria-selected', String(tab.dataset.panel === 'settings'));
    });
    document.querySelectorAll('.profile-body .panel').forEach(function (item) {
      item.hidden = item !== settings;
    });
    history.replaceState(null, '', '#settings');
  });

  function notificationItems() {
    var orders = smxRead(SMX_AUTH.orders, []);
    orders = Array.isArray(orders) ? orders : [];
    var items = orders.slice().sort(function (a, b) {
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    }).map(function (order) {
      var status = String(order.status || 'Pending');
      var orderId = String(order.orderId || 'Order');
      return {
        id: 'order-' + orderId + '-' + status.toLowerCase(),
        title: 'Order ' + status,
        detail: orderId + ' · ' + ((order.items && order.items[0] && order.items[0].name) || 'Your purchase'),
        date: order.updatedAt || order.createdAt || '',
        type: 'order'
      };
    });
    items.push({
      id: 'account-welcome-' + String(user.id || user.email),
      title: 'Welcome to SM1THX',
      detail: 'Your account is ready. Add your delivery details to make checkout easier.',
      date: user.createdAt || '',
      type: 'account'
    });
    return items;
  }

  function renderNotificationCentre() {
    var data = readUser();
    var readIds = Array.isArray(data.readNotifications) ? data.readNotifications : [];
    var items = notificationItems();
    var unread = items.filter(function (item) { return readIds.indexOf(item.id) < 0; }).length;
    $('smxUnreadCount').textContent = unread + ' unread';
    $('smxNotificationList').innerHTML = items.length ? items.map(function (item) {
      var isRead = readIds.indexOf(item.id) >= 0;
      return '<article class="smx-notification-item' + (isRead ? ' is-read' : '') + '">' +
        '<span class="smx-notification-dot" aria-hidden="true"></span>' +
        '<div class="smx-notification-content"><strong>' + esc(item.title) + '</strong><p>' + esc(item.detail) + '</p><small>' + (item.date ? esc(new Date(item.date).toLocaleDateString('en-KE')) : 'Account update') + '</small></div>' +
        (isRead ? '<span class="smx-read-label">Read</span>' : '<button type="button" class="smx-text-button" data-read-notice="' + esc(item.id) + '">Mark read</button>') +
      '</article>';
    }).join('') : '<div class="smx-empty">You are all caught up.</div>';
  }

  function renderProfileCompletion() {
    var latest = smxCurrentUser() || user;
    var data = readUser();
    var tasks = [
      { label: 'Add a profile photo', done: !!latest.avatarData, target: 'photo' },
      { label: 'Add your phone number', done: !!String(latest.phone || '').trim(), target: 'settings' },
      { label: 'Add your town or city', done: !!String(latest.location || '').trim(), target: 'settings' },
      { label: 'Save a delivery address', done: !!(data.addresses && data.addresses.length), target: 'extras' }
    ];
    var completed = tasks.filter(function (task) { return task.done; }).length;
    var percent = Math.round(completed / tasks.length * 100);
    $('smxCompletionPercent').textContent = percent + '%';
    $('smxCompletionLabel').textContent = completed + ' of ' + tasks.length + ' completed';
    $('smxCompletionBar').style.width = percent + '%';
    $('smxCompletionTasks').innerHTML = tasks.map(function (task) {
      return '<div class="smx-completion-task' + (task.done ? ' is-done' : '') + '">' +
        '<span class="smx-task-check">' + (task.done ? '✓' : '○') + '</span><span>' + esc(task.label) + '</span>' +
        (task.done ? '<small>Done</small>' : '<button type="button" class="smx-text-button" data-complete-action="' + task.target + '">' + (task.target === 'photo' ? 'Use photo button' : task.target === 'settings' ? 'Add now' : 'Open Personal') + '</button>') +
      '</div>';
    }).join('');
  }

  $('smxNotificationList').addEventListener('click', function (event) {
    var button = event.target.closest('[data-read-notice]');
    if (!button) return;
    var data = readUser();
    data.readNotifications = Array.isArray(data.readNotifications) ? data.readNotifications : [];
    if (data.readNotifications.indexOf(button.dataset.readNotice) < 0) data.readNotifications.push(button.dataset.readNotice);
    saveUser(data);
    renderNotificationCentre();
  });
  $('smxMarkAllRead').addEventListener('click', function () {
    var data = readUser();
    data.readNotifications = notificationItems().map(function (item) { return item.id; });
    saveUser(data);
    renderNotificationCentre();
    toast('All notifications marked as read.');
  });
  $('smxCompletionTasks').addEventListener('click', function (event) {
    var button = event.target.closest('[data-complete-action]');
    if (!button) return;
    var action = button.dataset.completeAction;
    if (action === 'settings') {
      var settingsTab = tabs.querySelector('[data-panel="settings"]');
      if (settingsTab) settingsTab.click();
    } else if (action === 'extras') {
      openExtras();
      $('smxAddressLabel').focus();
    } else {
      toast('Use Change photo beside your profile picture.');
    }
  });

  function renderAll() {
    renderAddresses();
    renderWishlist();
    renderWallet();
    renderPreferences();
    renderNotificationCentre();
    renderProfileCompletion();
    renderProfileCompletion();
  }
  renderAll();
  window.addEventListener('storage', function () {
    user = smxCurrentUser() || user;
    renderAll();
  });
})();