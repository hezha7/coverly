(function () {
  'use strict';

  var DEFAULT_COVERAGE = { ft: 20, m: 1.9 };

  var els = {
    form: document.getElementById('calcForm'),
    length: document.getElementById('length'),
    width: document.getElementById('width'),
    extra: document.getElementById('extra'),
    waste: document.getElementById('waste'),
    coverage: document.getElementById('coverage'),
    extraBox: document.getElementById('extraBox'),
    price: document.getElementById('price'),

    resultBoxes: document.getElementById('resultBoxes'),
    resultBoxesLabel: document.getElementById('resultBoxesLabel'),
    resultArea: document.getElementById('resultArea'),
    resultAreaUnit: document.getElementById('resultAreaUnit'),
    breakRoomArea: document.getElementById('breakRoomArea'),
    breakExtraRow: document.getElementById('breakExtraRow'),
    breakExtra: document.getElementById('breakExtra'),
    breakWaste: document.getElementById('breakWaste'),
    breakRepairRow: document.getElementById('breakRepairRow'),
    breakRepair: document.getElementById('breakRepair'),
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

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function onUnitChange() {
    var unit = currentUnit();
    document.querySelectorAll('[data-unit]').forEach(function (s) { s.textContent = unit; });
    document.querySelectorAll('[data-area-unit]').forEach(function (s) { s.textContent = areaLabel(unit); });
    var covEl = document.querySelector('[data-coverage-unit]');
    if (covEl) covEl.textContent = areaLabel(unit) + ' / box';
    els.coverage.value = DEFAULT_COVERAGE[unit];
    calculate();
  }

  function calculate() {
    var unit = currentUnit();
    var length = num(els.length);
    var width = num(els.width);
    var extra = num(els.extra);
    var wastePct = parseFloat(els.waste.value) || 0;
    var coverage = num(els.coverage, DEFAULT_COVERAGE[unit]) || DEFAULT_COVERAGE[unit];
    var price = num(els.price);

    var roomArea = length * width;
    var totalArea = roomArea + extra;
    var wasteArea = totalArea * (wastePct / 100);
    var areaWithWaste = totalArea + wasteArea;

    var boxesNeeded = coverage > 0 ? Math.ceil(areaWithWaste / coverage) : 0;
    if (totalArea === 0) boxesNeeded = 0;
    var repairBox = boxesNeeded > 0 && els.extraBox.checked ? 1 : 0;
    var totalBoxes = boxesNeeded + repairBox;

    els.resultBoxes.textContent = totalBoxes;
    els.resultBoxesLabel.textContent = totalBoxes === 1 ? 'box' : 'boxes';
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

    if (repairBox > 0) {
      els.breakRepairRow.hidden = false;
      els.breakRepair.textContent = '1 box';
    } else {
      els.breakRepairRow.hidden = true;
    }

    if (price > 0) {
      els.breakCostRow.hidden = false;
      els.breakCost.textContent = '$' + (totalBoxes * price).toFixed(2);
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
    var wastePct = 10, coverage = 20;
    var tbody = document.getElementById('refTable');
    var rows = rooms.map(function (r) {
      var area = r.l * r.w;
      var withWaste = area * (1 + wastePct / 100);
      var boxes = Math.ceil(withWaste / coverage) + 1;
      return '<tr><td>' + r.name + '</td><td>' + Math.round(area) + ' sq ft</td>' +
        '<td>' + Math.round(withWaste) + ' sq ft</td><td>' + boxes + '</td></tr>';
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
