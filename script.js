(function () {
  'use strict';

  var DOOR_SIZE = { ft: 21, m: 1.9 };
  var WINDOW_SIZE = { ft: 15, m: 1.4 };
  var DEFAULT_COVERAGE = { ft: 350, m: 10 };

  var CAN_SIZES = {
    ft: [
      { label: 'Quart cans (0.25 gal)', vol: 0.25 },
      { label: 'Gallon cans', vol: 1 },
      { label: '5-Gallon buckets', vol: 5 }
    ],
    m: [
      { label: '1 L cans', vol: 1 },
      { label: '2.5 L cans', vol: 2.5 },
      { label: '4 L cans', vol: 4 },
      { label: '5 L cans', vol: 5 },
      { label: '10 L cans', vol: 10 }
    ]
  };

  var els = {
    form: document.getElementById('calcForm'),
    length: document.getElementById('length'),
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    doors: document.getElementById('doors'),
    windows: document.getElementById('windows'),
    coats: document.getElementById('coats'),
    includeCeiling: document.getElementById('includeCeiling'),
    coverage: document.getElementById('coverage'),
    canSize: document.getElementById('canSize'),
    price: document.getElementById('price'),

    resultCans: document.getElementById('resultCans'),
    resultCansLabel: document.getElementById('resultCansLabel'),
    resultCoats: document.getElementById('resultCoats'),
    resultArea: document.getElementById('resultArea'),
    resultAreaUnit: document.getElementById('resultAreaUnit'),
    breakVolume: document.getElementById('breakVolume'),
    breakWalls: document.getElementById('breakWalls'),
    breakCeilingRow: document.getElementById('breakCeilingRow'),
    breakCeiling: document.getElementById('breakCeiling'),
    breakOpenings: document.getElementById('breakOpenings'),
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

  function areaLabel(unit) {
    return unit === 'ft' ? 'sq ft' : 'sq m';
  }

  function volLabel(unit) {
    return unit === 'ft' ? 'gal' : 'L';
  }

  function populateCanSizes(unit) {
    var sel = els.canSize;
    sel.innerHTML = '';
    CAN_SIZES[unit].forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.vol;
      opt.textContent = c.label;
      if (unit === 'ft' && c.vol === 1) opt.selected = true;
      if (unit === 'm' && c.vol === 4) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function onUnitChange() {
    var unit = currentUnit();
    document.querySelectorAll('[data-unit]').forEach(function (s) { s.textContent = unit; });
    var covEl = document.querySelector('[data-coverage-unit]');
    if (covEl) covEl.textContent = unit === 'ft' ? 'sq ft / gallon' : 'sq m / liter';
    els.coverage.value = DEFAULT_COVERAGE[unit];
    populateCanSizes(unit);
    calculate();
  }

  function calculate() {
    var unit = currentUnit();
    var length = num(els.length);
    var width = num(els.width);
    var height = num(els.height);
    var doors = num(els.doors);
    var windows = num(els.windows);
    var coats = parseInt(els.coats.value, 10) || 1;
    var coverage = num(els.coverage, DEFAULT_COVERAGE[unit]) || DEFAULT_COVERAGE[unit];
    var price = num(els.price);

    var perimeter = 2 * (length + width);
    var wallArea = perimeter * height;
    var openings = doors * DOOR_SIZE[unit] + windows * WINDOW_SIZE[unit];
    var netWallArea = Math.max(0, wallArea - openings);
    var ceilingArea = els.includeCeiling.checked ? length * width : 0;
    var areaPerCoat = netWallArea + ceilingArea;
    var totalPaintArea = areaPerCoat * coats;

    var volumeNeeded = coverage > 0 ? totalPaintArea / coverage : 0;

    var canOpt = els.canSize.options[els.canSize.selectedIndex];
    var canVol = canOpt ? parseFloat(canOpt.value) : 1;
    var canLabel = canOpt ? canOpt.textContent : 'cans';
    var cansNeeded = canVol > 0 ? Math.ceil(volumeNeeded / canVol) : 0;
    if (totalPaintArea === 0) cansNeeded = 0;

    els.resultCans.textContent = cansNeeded;
    els.resultCansLabel.textContent = canLabel;
    els.resultCoats.textContent = coats;
    els.resultArea.textContent = round1(areaPerCoat);
    els.resultAreaUnit.textContent = areaLabel(unit);

    els.breakVolume.textContent = round1(volumeNeeded) + ' ' + volLabel(unit);
    els.breakWalls.textContent = round1(netWallArea) + ' ' + areaLabel(unit);
    els.breakOpenings.textContent = round1(openings) + ' ' + areaLabel(unit);

    if (els.includeCeiling.checked) {
      els.breakCeilingRow.hidden = false;
      els.breakCeiling.textContent = round1(ceilingArea) + ' ' + areaLabel(unit);
    } else {
      els.breakCeilingRow.hidden = true;
    }

    if (price > 0) {
      els.breakCostRow.hidden = false;
      els.breakCost.textContent = '$' + (cansNeeded * price).toFixed(2);
    } else {
      els.breakCostRow.hidden = true;
    }
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function buildReferenceTable() {
    var rooms = [
      { name: 'Small bedroom (10 × 10 ft)', l: 10, w: 10 },
      { name: 'Standard bedroom (12 × 12 ft)', l: 12, w: 12 },
      { name: 'Living room (12 × 15 ft)', l: 12, w: 15 },
      { name: 'Large living room (14 × 16 ft)', l: 14, w: 16 },
      { name: 'Master bedroom (16 × 18 ft)', l: 16, w: 18 }
    ];
    var height = 8, coats = 2, coverage = 350;
    var openings = 1 * DOOR_SIZE.ft + 1 * WINDOW_SIZE.ft;
    var tbody = document.getElementById('refTable');
    var rows = rooms.map(function (r) {
      var wallArea = 2 * (r.l + r.w) * height;
      var net = Math.max(0, wallArea - openings);
      var paintNeeded = (net * coats) / coverage;
      var cans = Math.ceil(paintNeeded);
      return '<tr><td>' + r.name + '</td><td>' + Math.round(net) + ' sq ft</td>' +
        '<td>' + round1(paintNeeded) + ' gal</td><td>' + cans + '</td></tr>';
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

  populateCanSizes(currentUnit());
  calculate();
  buildReferenceTable();
  initTheme();
  initAdblockNotice();
  initBannerScale();
})();
