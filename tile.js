(function () {
  'use strict';

  var DEFAULT_TILE = { ft: { l: 12, w: 12 }, m: { l: 30, w: 30 } };
  var DEFAULT_BOX_COVERAGE = { ft: 15, m: 1.4 };

  var els = {
    form: document.getElementById('calcForm'),
    length: document.getElementById('length'),
    width: document.getElementById('width'),
    extra: document.getElementById('extra'),
    tileL: document.getElementById('tileL'),
    tileW: document.getElementById('tileW'),
    waste: document.getElementById('waste'),
    boxCoverage: document.getElementById('boxCoverage'),
    price: document.getElementById('price'),

    resultBoxes: document.getElementById('resultBoxes'),
    resultBoxesLabel: document.getElementById('resultBoxesLabel'),
    resultTiles: document.getElementById('resultTiles'),
    resultArea: document.getElementById('resultArea'),
    resultAreaUnit: document.getElementById('resultAreaUnit'),
    breakRoomArea: document.getElementById('breakRoomArea'),
    breakExtraRow: document.getElementById('breakExtraRow'),
    breakExtra: document.getElementById('breakExtra'),
    breakWaste: document.getElementById('breakWaste'),
    breakTileArea: document.getElementById('breakTileArea'),
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
  function tileLabel(unit) { return unit === 'ft' ? 'in' : 'cm'; }
  function round1(n) { return Math.round(n * 10) / 10; }
  function round2(n) { return Math.round(n * 100) / 100; }

  function onUnitChange() {
    var unit = currentUnit();
    document.querySelectorAll('[data-unit]').forEach(function (s) { s.textContent = unit; });
    document.querySelectorAll('[data-area-unit]').forEach(function (s) { s.textContent = areaLabel(unit); });
    document.querySelectorAll('[data-tile-unit]').forEach(function (s) { s.textContent = tileLabel(unit); });
    var covEl = document.querySelector('[data-coverage-unit]');
    if (covEl) covEl.textContent = areaLabel(unit) + ' / box';
    els.tileL.value = DEFAULT_TILE[unit].l;
    els.tileW.value = DEFAULT_TILE[unit].w;
    els.boxCoverage.value = DEFAULT_BOX_COVERAGE[unit];
    calculate();
  }

  function calculate() {
    var unit = currentUnit();
    var length = num(els.length);
    var width = num(els.width);
    var extra = num(els.extra);
    var tileL = num(els.tileL, DEFAULT_TILE[unit].l);
    var tileW = num(els.tileW, DEFAULT_TILE[unit].w);
    var wastePct = parseFloat(els.waste.value) || 0;
    var boxCoverage = num(els.boxCoverage, DEFAULT_BOX_COVERAGE[unit]) || DEFAULT_BOX_COVERAGE[unit];
    var price = num(els.price);

    var roomArea = length * width;
    var totalArea = roomArea + extra;
    var wasteArea = totalArea * (wastePct / 100);
    var areaWithWaste = totalArea + wasteArea;

    var tileAreaEach = unit === 'ft' ? (tileL * tileW) / 144 : (tileL * tileW) / 10000;
    var tilesNeeded = tileAreaEach > 0 ? Math.ceil(areaWithWaste / tileAreaEach) : 0;
    var boxesNeeded = boxCoverage > 0 ? Math.ceil(areaWithWaste / boxCoverage) : 0;
    if (totalArea === 0) { tilesNeeded = 0; boxesNeeded = 0; }

    els.resultBoxes.textContent = boxesNeeded;
    els.resultBoxesLabel.textContent = boxesNeeded === 1 ? 'box' : 'boxes';
    els.resultTiles.textContent = tilesNeeded;
    els.resultArea.textContent = round1(areaWithWaste);
    els.resultAreaUnit.textContent = areaLabel(unit);

    els.breakRoomArea.textContent = round1(roomArea) + ' ' + areaLabel(unit);

    if (extra > 0) {
      els.breakExtraRow.hidden = false;
      els.breakExtra.textContent = round1(extra) + ' ' + areaLabel(unit);
    } else {
      els.breakExtraRow.hidden = true;
    }

    els.breakWaste.textContent = round1(wasteArea) + ' ' + areaLabel(unit);
    els.breakTileArea.textContent = round2(tileAreaEach) + ' ' + areaLabel(unit);

    if (price > 0) {
      els.breakCostRow.hidden = false;
      els.breakCost.textContent = '$' + (boxesNeeded * price).toFixed(2);
    } else {
      els.breakCostRow.hidden = true;
    }
  }

  function buildReferenceTable() {
    var rooms = [
      { name: 'Small bathroom (6 × 8 ft)', l: 6, w: 8 },
      { name: 'Standard bathroom (8 × 10 ft)', l: 8, w: 10 },
      { name: 'Kitchen (10 × 12 ft)', l: 10, w: 12 },
      { name: 'Standard bedroom (12 × 12 ft)', l: 12, w: 12 },
      { name: 'Living room (14 × 16 ft)', l: 14, w: 16 }
    ];
    var wastePct = 10, tileAreaEach = 1, boxCoverage = 15;
    var tbody = document.getElementById('refTable');
    var rows = rooms.map(function (r) {
      var area = r.l * r.w;
      var withWaste = area * (1 + wastePct / 100);
      var tiles = Math.ceil(withWaste / tileAreaEach);
      var boxes = Math.ceil(withWaste / boxCoverage);
      return '<tr><td>' + r.name + '</td><td>' + Math.round(area) + ' sq ft</td>' +
        '<td>' + tiles + '</td><td>' + boxes + '</td></tr>';
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

  calculate();
  buildReferenceTable();
  initTheme();
  initAdblockNotice();
  initBannerScale();
})();
