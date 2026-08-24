(function () {
  'use strict';

  var DOOR_SIZE = { ft: 21, m: 1.9 };
  var WINDOW_SIZE = { ft: 15, m: 1.4 };

  var SHEET_SIZES = {
    ft: [
      { label: '4 × 8 ft (32 sq ft)', area: 32 },
      { label: '4 × 10 ft (40 sq ft)', area: 40 },
      { label: '4 × 12 ft (48 sq ft)', area: 48 }
    ],
    m: [
      { label: '1.2 × 2.4 m (2.88 sq m)', area: 2.88 },
      { label: '1.2 × 3.0 m (3.6 sq m)', area: 3.6 }
    ]
  };

  var els = {
    form: document.getElementById('calcForm'),
    length: document.getElementById('length'),
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    doors: document.getElementById('doors'),
    windows: document.getElementById('windows'),
    sheetSize: document.getElementById('sheetSize'),
    includeCeiling: document.getElementById('includeCeiling'),
    waste: document.getElementById('waste'),
    price: document.getElementById('price'),

    resultSheets: document.getElementById('resultSheets'),
    resultSheetsLabel: document.getElementById('resultSheetsLabel'),
    resultArea: document.getElementById('resultArea'),
    resultAreaUnit: document.getElementById('resultAreaUnit'),
    breakWalls: document.getElementById('breakWalls'),
    breakCeilingRow: document.getElementById('breakCeilingRow'),
    breakCeiling: document.getElementById('breakCeiling'),
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

  function populateSheetSizes(unit) {
    var sel = els.sheetSize;
    sel.innerHTML = '';
    SHEET_SIZES[unit].forEach(function (s, i) {
      var opt = document.createElement('option');
      opt.value = s.area;
      opt.textContent = s.label;
      if (i === 0) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function onUnitChange() {
    var unit = currentUnit();
    document.querySelectorAll('[data-unit]').forEach(function (s) { s.textContent = unit; });
    populateSheetSizes(unit);
    calculate();
  }

  function calculate() {
    var unit = currentUnit();
    var length = num(els.length);
    var width = num(els.width);
    var height = num(els.height);
    var doors = num(els.doors);
    var windows = num(els.windows);
    var wastePct = parseFloat(els.waste.value) || 0;
    var price = num(els.price);

    var perimeter = 2 * (length + width);
    var wallArea = perimeter * height;
    var openings = doors * DOOR_SIZE[unit] + windows * WINDOW_SIZE[unit];
    var netWallArea = Math.max(0, wallArea - openings);
    var ceilingArea = els.includeCeiling.checked ? length * width : 0;
    var totalArea = netWallArea + ceilingArea;
    var wasteArea = totalArea * (wastePct / 100);
    var areaWithWaste = totalArea + wasteArea;

    var sheetOpt = els.sheetSize.options[els.sheetSize.selectedIndex];
    var sheetArea = sheetOpt ? parseFloat(sheetOpt.value) : (unit === 'ft' ? 32 : 2.88);
    var sheetsNeeded = sheetArea > 0 ? Math.ceil(areaWithWaste / sheetArea) : 0;
    if (totalArea === 0) sheetsNeeded = 0;

    els.resultSheets.textContent = sheetsNeeded;
    els.resultSheetsLabel.textContent = sheetsNeeded === 1 ? 'sheet' : 'sheets';
    els.resultArea.textContent = round1(areaWithWaste);
    els.resultAreaUnit.textContent = areaLabel(unit);

    els.breakWalls.textContent = round1(netWallArea) + ' ' + areaLabel(unit);
    els.breakOpenings.textContent = round1(openings) + ' ' + areaLabel(unit);
    els.breakWaste.textContent = round1(wasteArea) + ' ' + areaLabel(unit);

    if (els.includeCeiling.checked) {
      els.breakCeilingRow.hidden = false;
      els.breakCeiling.textContent = round1(ceilingArea) + ' ' + areaLabel(unit);
    } else {
      els.breakCeilingRow.hidden = true;
    }

    if (price > 0) {
      els.breakCostRow.hidden = false;
      els.breakCost.textContent = '$' + (sheetsNeeded * price).toFixed(2);
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
    var height = 8, wastePct = 10, sheetArea = 32;
    var openings = 1 * DOOR_SIZE.ft + 1 * WINDOW_SIZE.ft;
    var tbody = document.getElementById('refTable');
    var rows = rooms.map(function (r) {
      var wallArea = 2 * (r.l + r.w) * height;
      var net = Math.max(0, wallArea - openings);
      var withWaste = net * (1 + wastePct / 100);
      var sheets = Math.ceil(withWaste / sheetArea);
      return '<tr><td>' + r.name + '</td><td>' + Math.round(net) + ' sq ft</td>' +
        '<td>' + Math.round(withWaste) + ' sq ft</td><td>' + sheets + '</td></tr>';
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

  populateSheetSizes(currentUnit());
  calculate();
  buildReferenceTable();
  initTheme();
  initAdblockNotice();
  initBannerScale();
})();
