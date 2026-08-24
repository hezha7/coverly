(function () {
  'use strict';

  var DOOR_SIZE = { ft: 21, m: 1.9 };
  var WINDOW_SIZE = { ft: 15, m: 1.4 };
  var DEFAULT_COVERAGE = { ft: 30, m: 2.5 };

  var els = {
    form: document.getElementById('calcForm'),
    length: document.getElementById('length'),
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    doors: document.getElementById('doors'),
    windows: document.getElementById('windows'),
    repeat: document.getElementById('repeat'),
    coverage: document.getElementById('coverage'),
    price: document.getElementById('price'),

    resultRolls: document.getElementById('resultRolls'),
    resultRollsLabel: document.getElementById('resultRollsLabel'),
    resultArea: document.getElementById('resultArea'),
    resultAreaUnit: document.getElementById('resultAreaUnit'),
    breakWalls: document.getElementById('breakWalls'),
    breakOpenings: document.getElementById('breakOpenings'),
    breakWaste: document.getElementById('breakWaste'),
    breakCostRow: document.getElementById('breakCostRow'),
    breakCost: document.getElementById('breakCost')
  };

  function currentUnit() {
    var checked = els.form.querySelector('input[name="units"]:checked');
    return checked ? checked.value : 'ft';
  }

  function num(el, fallback) {
    var v = parseFloat(el.value);
    return isNaN(v) || v < 0 ? (fallback || 0) : v;
  }

  function areaLabel(unit) { return unit === 'ft' ? 'sq ft' : 'sq m'; }
  function round1(n) { return Math.round(n * 10) / 10; }

  function onUnitChange() {
    var unit = currentUnit();
    document.querySelectorAll('[data-unit]').forEach(function (s) { s.textContent = unit; });
    var covEl = document.querySelector('[data-coverage-unit]');
    if (covEl) covEl.textContent = areaLabel(unit) + ' / roll';
    els.coverage.value = DEFAULT_COVERAGE[unit];
    calculate();
  }

  function calculate() {
    var unit = currentUnit();
    var length = num(els.length);
    var width = num(els.width);
    var height = num(els.height);
    var doors = num(els.doors);
    var windows = num(els.windows);
    var wastePct = parseFloat(els.repeat.value) || 0;
    var coverage = num(els.coverage, DEFAULT_COVERAGE[unit]) || DEFAULT_COVERAGE[unit];
    var price = num(els.price);

    var perimeter = 2 * (length + width);
    var wallArea = perimeter * height;
    var openings = doors * DOOR_SIZE[unit] + windows * WINDOW_SIZE[unit];
    var netWallArea = Math.max(0, wallArea - openings);
    var wasteAmount = netWallArea * (wastePct / 100);
    var areaWithWaste = netWallArea + wasteAmount;

    var rollsNeeded = coverage > 0 ? Math.ceil(areaWithWaste / coverage) : 0;
    if (netWallArea === 0) rollsNeeded = 0;

    els.resultRolls.textContent = rollsNeeded;
    els.resultRollsLabel.textContent = rollsNeeded === 1 ? 'roll' : 'rolls';
    els.resultArea.textContent = round1(areaWithWaste);
    els.resultAreaUnit.textContent = areaLabel(unit);

    els.breakWalls.textContent = round1(netWallArea) + ' ' + areaLabel(unit);
    els.breakOpenings.textContent = round1(openings) + ' ' + areaLabel(unit);
    els.breakWaste.textContent = round1(wasteAmount) + ' ' + areaLabel(unit);

    if (price > 0) {
      els.breakCostRow.hidden = false;
      els.breakCost.textContent = '$' + (rollsNeeded * price).toFixed(2);
    } else {
      els.breakCostRow.hidden = true;
    }
  }

  function buildReferenceTable() {
    var rooms = [
      { name: 'Small bedroom (10 × 10 ft)', l: 10, w: 10 },
      { name: 'Standard bedroom (12 × 12 ft)', l: 12, w: 12 },
      { name: 'Living room (12 × 15 ft)', l: 12, w: 15 },
      { name: 'Large living room (14 × 16 ft)', l: 14, w: 16 },
      { name: 'Master bedroom (16 × 18 ft)', l: 16, w: 18 }
    ];
    var height = 8, wastePct = 15, coverage = 30;
    var openings = 1 * DOOR_SIZE.ft + 1 * WINDOW_SIZE.ft;
    var tbody = document.getElementById('refTable');
    var rows = rooms.map(function (r) {
      var wallArea = 2 * (r.l + r.w) * height;
      var net = Math.max(0, wallArea - openings);
      var withWaste = net * (1 + wastePct / 100);
      var rolls = Math.ceil(withWaste / coverage);
      return '<tr><td>' + r.name + '</td><td>' + Math.round(net) + ' sq ft</td>' +
        '<td>' + Math.round(withWaste) + ' sq ft</td><td>' + rolls + '</td></tr>';
    });
    tbody.innerHTML = rows.join('');
  }

  function initTheme() {
    var toggle = document.getElementById('themeToggle');
    var stored = null;
    try { stored = localStorage.getItem('materially-theme'); } catch (e) {}
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
    toggle.addEventListener('click', function () {
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var current = document.documentElement.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('materially-theme', next); } catch (e) {}
    });
  }

  function initToolsMenu() {
    var menu = document.querySelector('.tools-menu');
    if (!menu) return;
    document.addEventListener('click', function (e) {
      if (menu.hasAttribute('open') && !menu.contains(e.target)) {
        menu.removeAttribute('open');
      }
    });
  }

  function initAdblockNotice() {
    var banner = document.getElementById('adblockBanner');
    var dismiss = document.getElementById('adblockDismiss');
    var dismissed = false;
    try { dismissed = localStorage.getItem('materially-adblock-dismissed') === '1'; } catch (e) {}
    if (dismissed) return;

    var bait = document.createElement('div');
    bait.className = 'adsbox ad-banner ad-placement adsbygoogle';
    bait.style.cssText = 'position:absolute; left:-9999px; top:-9999px; width:2px; height:2px;';
    document.body.appendChild(bait);

    setTimeout(function () {
      var blocked = !bait.offsetParent || bait.offsetHeight === 0 || getComputedStyle(bait).display === 'none';
      bait.parentNode.removeChild(bait);
      if (blocked) banner.hidden = false;
    }, 400);

    dismiss.addEventListener('click', function () {
      banner.hidden = true;
      try { localStorage.setItem('materially-adblock-dismissed', '1'); } catch (e) {}
    });
  }

  function initBannerScale() {
    var wrap = document.getElementById('banner728Wrap');
    var banner = document.getElementById('banner728');
    if (!wrap || !banner) return;

    function resize() {
      var scale = Math.min(1, wrap.clientWidth / 728);
      banner.style.transform = 'scale(' + scale + ')';
      wrap.style.height = Math.round(90 * scale) + 'px';
    }

    resize();
    window.addEventListener('resize', resize);
  }

  els.form.addEventListener('input', function (e) {
    if (e.target.name === 'units') { onUnitChange(); return; }
    calculate();
  });
  els.form.addEventListener('change', calculate);

  calculate();
  buildReferenceTable();
  initTheme();
  initAdblockNotice();
  initBannerScale();
  initToolsMenu();
})();
