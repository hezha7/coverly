(function () {
  'use strict';

  var DEFAULT_THICKNESS = { ft: 4, m: 10 };

  var BAG_SIZES = {
    ft: [
      { label: '40 lb bags', vol: 0.30 },
      { label: '60 lb bags', vol: 0.45 },
      { label: '80 lb bags', vol: 0.60 }
    ],
    m: [
      { label: '25 kg bags', vol: 0.0116 },
      { label: '30 kg bags', vol: 0.014 }
    ]
  };

  var els = {
    form: document.getElementById('calcForm'),
    length: document.getElementById('length'),
    width: document.getElementById('width'),
    thickness: document.getElementById('thickness'),
    bagSize: document.getElementById('bagSize'),
    price: document.getElementById('price'),

    resultBags: document.getElementById('resultBags'),
    resultBagsLabel: document.getElementById('resultBagsLabel'),
    resultArea: document.getElementById('resultArea'),
    resultAreaUnit: document.getElementById('resultAreaUnit'),
    resultThickness: document.getElementById('resultThickness'),
    resultThicknessUnit: document.getElementById('resultThicknessUnit'),
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
  function thicknessLabel(unit) { return unit === 'ft' ? 'in' : 'cm'; }
  function round1(n) { return Math.round(n * 10) / 10; }
  function round2(n) { return Math.round(n * 100) / 100; }

  function populateBagSizes(unit) {
    var sel = els.bagSize;
    sel.innerHTML = '';
    BAG_SIZES[unit].forEach(function (b, i) {
      var opt = document.createElement('option');
      opt.value = b.vol;
      opt.textContent = b.label;
      if (unit === 'ft' && b.vol === 0.60) opt.selected = true;
      if (unit === 'm' && i === 0) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function onUnitChange() {
    var unit = currentUnit();
    document.querySelectorAll('[data-unit]').forEach(function (s) { s.textContent = unit; });
    document.querySelectorAll('[data-depth-unit]').forEach(function (s) { s.textContent = thicknessLabel(unit); });
    els.thickness.value = DEFAULT_THICKNESS[unit];
    populateBagSizes(unit);
    calculate();
  }

  function calculate() {
    var unit = currentUnit();
    var length = num(els.length);
    var width = num(els.width);
    var thickness = num(els.thickness, DEFAULT_THICKNESS[unit]);
    var price = num(els.price);

    var area = length * width;
    var volume, cubicYards;

    if (unit === 'ft') {
      var thicknessFt = thickness / 12;
      volume = area * thicknessFt;
      cubicYards = volume / 27;
    } else {
      var thicknessM = thickness / 100;
      volume = area * thicknessM;
    }

    var bagOpt = els.bagSize.options[els.bagSize.selectedIndex];
    var bagYield = bagOpt ? parseFloat(bagOpt.value) : (unit === 'ft' ? 0.60 : 0.0116);
    var bagsNeeded = bagYield > 0 ? Math.ceil(volume / bagYield) : 0;
    if (area === 0) bagsNeeded = 0;

    els.resultBags.textContent = bagsNeeded;
    els.resultBagsLabel.textContent = bagsNeeded === 1 ? 'bag' : 'bags';
    els.resultArea.textContent = round1(area);
    els.resultAreaUnit.textContent = areaLabel(unit);
    els.resultThickness.textContent = thickness;
    els.resultThicknessUnit.textContent = thicknessLabel(unit);

    els.breakArea.textContent = round1(area) + ' ' + areaLabel(unit);

    if (unit === 'ft') {
      els.breakVolume.textContent = round1(volume) + ' cu ft';
      els.breakYardsRow.hidden = false;
      els.breakYards.textContent = round2(cubicYards) + ' yd³';
    } else {
      els.breakVolume.textContent = round2(volume) + ' cu m';
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
    var slabs = [
      { name: 'Small patio (8 × 8 ft)', l: 8, w: 8 },
      { name: 'Standard patio (10 × 10 ft)', l: 10, w: 10 },
      { name: 'Shed pad (12 × 10 ft)', l: 12, w: 10 },
      { name: 'Walkway (20 × 3 ft)', l: 20, w: 3 },
      { name: 'Single-car pad (12 × 20 ft)', l: 12, w: 20 }
    ];
    var thicknessIn = 4, bagYield = 0.60;
    var tbody = document.getElementById('refTable');
    var rows = slabs.map(function (s) {
      var area = s.l * s.w;
      var volume = area * (thicknessIn / 12);
      var bags = Math.ceil(volume / bagYield);
      return '<tr><td>' + s.name + '</td><td>' + Math.round(area) + ' sq ft</td>' +
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
})();
