(function () {
  'use strict';

  var DEFAULT_DEPTH = { ft: 3, m: 7.5 };

  var BAG_SIZES = {
    ft: [
      { label: '1 cu ft bags', vol: 1 },
      { label: '2 cu ft bags', vol: 2 },
      { label: '3 cu ft bags', vol: 3 }
    ],
    m: [
      { label: '50 L bags', vol: 50 },
      { label: '80 L bags', vol: 80 }
    ]
  };

  var els = {
    form: document.getElementById('calcForm'),
    length: document.getElementById('length'),
    width: document.getElementById('width'),
    depth: document.getElementById('depth'),
    extra: document.getElementById('extra'),
    bagSize: document.getElementById('bagSize'),
    price: document.getElementById('price'),

    resultBags: document.getElementById('resultBags'),
    resultBagsLabel: document.getElementById('resultBagsLabel'),
    resultArea: document.getElementById('resultArea'),
    resultAreaUnit: document.getElementById('resultAreaUnit'),
    resultDepth: document.getElementById('resultDepth'),
    resultDepthUnit: document.getElementById('resultDepthUnit'),
    breakArea: document.getElementById('breakArea'),
    breakVolume: document.getElementById('breakVolume'),
    breakYardsRow: document.getElementById('breakYardsRow'),
    breakYards: document.getElementById('breakYards'),
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
  function depthLabel(unit) { return unit === 'ft' ? 'in' : 'cm'; }
  function volLabel(unit) { return unit === 'ft' ? 'cu ft' : 'cu m'; }
  function round1(n) { return Math.round(n * 10) / 10; }

  function populateBagSizes(unit) {
    var sel = els.bagSize;
    sel.innerHTML = '';
    BAG_SIZES[unit].forEach(function (b) {
      var opt = document.createElement('option');
      opt.value = b.vol;
      opt.textContent = b.label;
      if (unit === 'ft' && b.vol === 2) opt.selected = true;
      if (unit === 'm' && b.vol === 50) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function onUnitChange() {
    var unit = currentUnit();
    document.querySelectorAll('[data-unit]').forEach(function (s) { s.textContent = unit; });
    document.querySelectorAll('[data-area-unit]').forEach(function (s) { s.textContent = areaLabel(unit); });
    document.querySelectorAll('[data-depth-unit]').forEach(function (s) { s.textContent = depthLabel(unit); });
    els.depth.value = DEFAULT_DEPTH[unit];
    populateBagSizes(unit);
    calculate();
  }

  function calculate() {
    var unit = currentUnit();
    var length = num(els.length);
    var width = num(els.width);
    var depth = num(els.depth, DEFAULT_DEPTH[unit]);
    var extra = num(els.extra);
    var price = num(els.price);

    var area = length * width + extra;
    var volume, cubicYards;

    if (unit === 'ft') {
      var depthFt = depth / 12;
      volume = area * depthFt;
      cubicYards = volume / 27;
    } else {
      var depthM = depth / 100;
      var volumeM3 = area * depthM;
      volume = volumeM3 * 1000;
    }

    var bagOpt = els.bagSize.options[els.bagSize.selectedIndex];
    var bagVol = bagOpt ? parseFloat(bagOpt.value) : (unit === 'ft' ? 2 : 50);
    var bagsNeeded = bagVol > 0 ? Math.ceil(volume / bagVol) : 0;
    if (area === 0) bagsNeeded = 0;

    els.resultBags.textContent = bagsNeeded;
    els.resultBagsLabel.textContent = bagsNeeded === 1 ? 'bag' : 'bags';
    els.resultArea.textContent = round1(area);
    els.resultAreaUnit.textContent = areaLabel(unit);
    els.resultDepth.textContent = depth;
    els.resultDepthUnit.textContent = depthLabel(unit);

    els.breakArea.textContent = round1(area) + ' ' + areaLabel(unit);

    if (unit === 'ft') {
      els.breakVolume.textContent = round1(volume) + ' cu ft';
      els.breakYardsRow.hidden = false;
      els.breakYards.textContent = round1(cubicYards) + ' yd³';
    } else {
      els.breakVolume.textContent = round1(volume / 1000) + ' cu m';
      els.breakYardsRow.hidden = true;
    }

    if (price > 0) {
      els.breakCostRow.hidden = false;
      els.breakCost.textContent = '$' + (bagsNeeded * price).toFixed(2);
    } else {
      els.breakCostRow.hidden = true;
    }
  }

  function buildReferenceTable() {
    var beds = [
      { name: 'Small bed (5 × 5 ft)', l: 5, w: 5 },
      { name: 'Standard bed (10 × 10 ft)', l: 10, w: 10 },
      { name: 'Border bed (20 × 3 ft)', l: 20, w: 3 },
      { name: 'Large bed (15 × 15 ft)', l: 15, w: 15 },
      { name: 'Whole yard border (50 × 4 ft)', l: 50, w: 4 }
    ];
    var depthIn = 3, bagCuFt = 2;
    var tbody = document.getElementById('refTable');
    var rows = beds.map(function (b) {
      var area = b.l * b.w;
      var volume = area * (depthIn / 12);
      var bags = Math.ceil(volume / bagCuFt);
      return '<tr><td>' + b.name + '</td><td>' + Math.round(area) + ' sq ft</td>' +
        '<td>' + round1(volume) + ' cu ft</td><td>' + bags + '</td></tr>';
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

  populateBagSizes(currentUnit());
  calculate();
  buildReferenceTable();
  initTheme();
  initAdblockNotice();
  initBannerScale();
  initToolsMenu();
})();
