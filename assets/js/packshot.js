/* =====================================================================
   SATYANAND AYURVEDA — pack illustrations
   ---------------------------------------------------------------------
   Draws a branded product pack (bottle, jar, pouch …) as SVG from the
   catalogue entry, so the shop looks finished before real photography
   exists. Each drawing is turned into a Blob URL once and reused, so a
   page with hundreds of cards costs no network requests and no extra
   DOM — the browser treats every pack as an ordinary <img>.

   When a product has an `image` path in catalog.js, that photo is used
   instead and none of this runs for it.
   ===================================================================== */
(function () {
  'use strict';

  var TONES = {
    forest: { label: '#054A29', ink: '#FBF8EE', sub: 'rgba(251,248,238,.72)', accent: '#E0C879', cap: '#E0C879' },
    leaf:   { label: '#7AC74F', ink: '#054A29', sub: 'rgba(5,74,41,.72)',     accent: '#054A29', cap: '#054A29' },
    sprout: { label: '#A1CF6B', ink: '#054A29', sub: 'rgba(5,74,41,.72)',     accent: '#054A29', cap: '#054A29' },
    meadow: { label: '#D5D887', ink: '#054A29', sub: 'rgba(5,74,41,.72)',     accent: '#054A29', cap: '#054A29' },
    gold:   { label: '#E0C879', ink: '#054A29', sub: 'rgba(5,74,41,.72)',     accent: '#054A29', cap: '#054A29' }
  };

  var WHITE_PLASTIC = '#F7F4EA';
  var AMBER = '#6A3812';
  var KRAFT = '#CFA96F';
  var SERIF = "Georgia,'Times New Roman',serif";
  var SANS = "'Segoe UI',Arial,Helvetica,sans-serif";

  var cache = new Map();

  /* ---------- small helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var f = function (c) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt))); };
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function stop(o, c, a) { return '<stop offset="' + o + '" stop-color="' + c + '" stop-opacity="' + a + '"/>'; }
  function rect(x, y, w, h, rx, fill, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  function ridges(x0, x1, y0, y1, step, color) {
    var d = '';
    for (var x = x0; x <= x1; x += step) d += 'M' + x + ' ' + y0 + 'V' + y1;
    return '<path d="' + d + '" stroke="' + color + '" stroke-width="2"/>';
  }

  /* Cylinder lighting shared by every round container. */
  var DEFS =
    '<linearGradient id="cyl" x1="0" x2="1">' +
      stop(0, '#000', .30) + stop(.1, '#000', .08) + stop(.25, '#fff', .28) + stop(.4, '#fff', .05) +
      stop(.72, '#000', .03) + stop(.9, '#000', .15) + stop(1, '#000', .32) +
    '</linearGradient>' +
    '<linearGradient id="metal" x1="0" x2="1">' +
      stop(0, '#7E6121', 1) + stop(.22, '#E9D79A', 1) + stop(.45, '#C9A94F', 1) + stop(.8, '#9E7F31', 1) + stop(1, '#6F5418', 1) +
    '</linearGradient>' +
    '<radialGradient id="shadow" cx=".5" cy=".5" r=".5">' +
      stop(0, '#052814', .30) + stop(1, '#052814', 0) +
    '</radialGradient>';

  /* A leaf pointing along +x, 70 long. */
  function leaf(x, y, rot, scale, fill) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + scale + ')">' +
      '<path d="M0 0C18-17 50-19 72 0C50 19 18 17 0 0Z" fill="' + fill + '"/>' +
      '<path d="M5 0H64" stroke="#054A29" stroke-opacity=".25" stroke-width="1.6" fill="none"/>' +
      '</g>';
  }

  /* Brand line, divider, product name (auto-fitted) and form. */
  function labelText(p, t, x, y, w, h, maxFs) {
    var cx = x + w / 2;
    var lines = String(p.short || p.name).split('|');
    var longest = Math.max.apply(null, lines.map(function (l) { return l.length; }));
    var fs = Math.min(maxFs || 26, (w - 22) / (longest * 0.6));
    fs = Math.round(fs * 10) / 10;
    var lh = fs * 1.06;
    var compact = h < 90;
    var top = y + (compact ? 20 : 34);
    var bottom = y + h - (compact ? 8 : 26);
    var first = top + (bottom - top - lh * lines.length) / 2 + fs * 0.8;

    var out = '';
    out += '<text x="' + cx + '" y="' + (y + (compact ? 13 : 17)) + '" text-anchor="middle" font-family="' + SANS +
      '" font-size="8.5" font-weight="700" letter-spacing="2.6" fill="' + t.sub + '">SATYANAND</text>';
    if (!compact) {
      var dy = y + 25;
      out += '<path d="M' + (cx - 26) + ' ' + dy + 'H' + (cx - 7) + 'M' + (cx + 7) + ' ' + dy + 'H' + (cx + 26) +
        '" stroke="' + t.accent + '" stroke-opacity=".7" stroke-width="1"/>' +
        '<path d="M' + cx + ' ' + (dy - 4) + 'L' + (cx + 4) + ' ' + dy + 'L' + cx + ' ' + (dy + 4) + 'L' + (cx - 4) + ' ' + dy + 'Z" fill="' + t.accent + '"/>';
    }
    lines.forEach(function (l, i) {
      out += '<text x="' + cx + '" y="' + (first + i * lh).toFixed(1) + '" text-anchor="middle" font-family="' + SERIF +
        '" font-weight="700" font-size="' + fs + '" fill="' + t.ink + '">' + esc(l) + '</text>';
    });
    if (!compact) {
      out += '<text x="' + cx + '" y="' + (y + h - 11) + '" text-anchor="middle" font-family="' + SANS +
        '" font-size="8" font-weight="600" letter-spacing="1.8" fill="' + t.sub + '">' + esc(String(p.form || '').toUpperCase()) + '</text>';
    }
    return out;
  }

  /* Thin accent rules at the top and bottom of a wrap-around label. */
  function labelRules(x, y, w, h, t) {
    return rect(x, y + 5, w, 1.4, 0, t.accent, ' opacity=".55"') + rect(x, y + h - 6.4, w, 1.4, 0, t.accent, ' opacity=".55"');
  }

  /* ---------- the shapes (all sit on a baseline at y = 350) ---------- */
  var SHAPES = {
    bottle: function (p, t) {
      var capFill = t.cap;
      return '' +
        rect(144, 84, 112, 52, 10, capFill) + ridges(152, 248, 92, 128, 8, 'rgba(0,0,0,.12)') +
        rect(144, 84, 112, 52, 10, 'url(#cyl)') +
        rect(150, 132, 100, 16, 3, shade(WHITE_PLASTIC, -.06)) +
        rect(124, 144, 152, 206, 24, WHITE_PLASTIC) +
        rect(124, 188, 152, 130, 0, t.label) + labelRules(124, 188, 152, 130, t) +
        labelText(p, t, 124, 188, 152, 130, 27) +
        rect(124, 144, 152, 206, 24, 'url(#cyl)') +
        rect(146, 156, 9, 182, 4.5, '#fff', ' opacity=".28"');
    },

    jar: function (p, t) {
      var glass = p.tone === 'forest' ? AMBER : WHITE_PLASTIC;
      return '' +
        rect(108, 122, 184, 50, 10, 'url(#metal)') + ridges(116, 284, 128, 166, 7, 'rgba(0,0,0,.10)') +
        rect(112, 166, 176, 12, 3, shade('#9E7F31', -.2)) +
        rect(100, 174, 200, 176, 28, glass) +
        rect(100, 206, 200, 116, 0, t.label) + labelRules(100, 206, 200, 116, t) +
        labelText(p, t, 100, 206, 200, 116, 28) +
        rect(100, 174, 200, 176, 28, 'url(#cyl)') +
        rect(122, 186, 10, 150, 5, '#fff', ' opacity=".26"');
    },

    tall: function (p, t) {
      return '' +
        rect(174, 46, 52, 48, 7, t.cap) + ridges(180, 220, 52, 88, 6, 'rgba(0,0,0,.12)') +
        rect(174, 46, 52, 48, 7, 'url(#cyl)') +
        rect(182, 92, 36, 28, 0, AMBER) +
        '<path d="M146 178C146 140 182 130 182 118H218C218 130 254 140 254 178Z" fill="' + AMBER + '"/>' +
        rect(146, 160, 108, 190, 16, AMBER) +
        '<path d="M146 178C146 140 182 130 182 118H218C218 130 254 140 254 178V334Q254 350 238 350H162Q146 350 146 334Z" fill="url(#cyl)"/>' +
        rect(146, 196, 108, 124, 0, t.label) + labelRules(146, 196, 108, 124, t) +
        labelText(p, t, 146, 196, 108, 124, 22) +
        rect(146, 196, 108, 124, 0, 'url(#cyl)', ' opacity=".7"') +
        rect(160, 150, 7, 186, 3.5, '#fff', ' opacity=".22"');
    },

    dropper: function (p, t) {
      return '' +
        rect(186, 60, 28, 64, 14, '#123D25') + rect(186, 60, 28, 64, 14, 'url(#cyl)') +
        rect(172, 118, 56, 40, 6, 'url(#metal)') + ridges(178, 222, 124, 152, 5, 'rgba(0,0,0,.14)') +
        rect(184, 156, 32, 14, 0, AMBER) +
        rect(146, 166, 108, 184, 22, AMBER) +
        rect(146, 206, 108, 114, 0, t.label) + labelRules(146, 206, 108, 114, t) +
        labelText(p, t, 146, 206, 108, 114, 20) +
        rect(146, 166, 108, 184, 22, 'url(#cyl)') +
        rect(160, 178, 7, 158, 3.5, '#fff', ' opacity=".22"');
    },

    pouch: function (p, t) {
      var dark = shade(KRAFT, -.14);
      var serr = 'M118 110';
      for (var x = 118; x < 282; x += 8) serr += 'L' + (x + 4) + ' 104L' + (x + 8) + ' 110';
      return '' +
        '<path d="M118 108H282L288 336Q288 350 274 350H126Q112 350 112 336Z" fill="' + KRAFT + '"/>' +
        '<path d="' + serr + 'V132H118Z" fill="' + dark + '"/>' +
        ridges(122, 278, 114, 130, 6, 'rgba(0,0,0,.08)') +
        '<path d="M120 146H280" stroke="rgba(0,0,0,.16)" stroke-width="2.5"/>' +
        '<path d="M118 138l7 4-7 4Z" fill="rgba(0,0,0,.2)"/>' +
        rect(132, 170, 136, 148, 12, t.label) +
        labelText(p, t, 132, 170, 136, 148, 26) +
        '<path d="M112 336Q200 322 288 336" stroke="rgba(0,0,0,.12)" stroke-width="2" fill="none"/>' +
        '<path d="M118 108H282L288 336Q288 350 274 350H126Q112 350 112 336Z" fill="url(#cyl)" opacity=".55"/>';
    },

    tube: function (p, t) {
      var body = t.label;
      return '' +
        rect(138, 58, 124, 22, 3, shade(body, -.12)) +
        '<path d="M142 62H258M142 68H258M142 74H258" stroke="rgba(0,0,0,.12)" stroke-width="1.5"/>' +
        '<path d="M138 80H262L244 292H156Z" fill="' + body + '"/>' +
        labelText(p, t, 150, 104, 100, 168, 24) +
        '<path d="M138 80H262L244 292H156Z" fill="url(#cyl)"/>' +
        '<path d="M156 292H244L236 306H164Z" fill="' + shade(body, -.2) + '"/>' +
        rect(162, 304, 76, 46, 8, t.cap) + ridges(168, 232, 310, 344, 6, 'rgba(0,0,0,.12)') +
        rect(162, 304, 76, 46, 8, 'url(#cyl)');
    },

    box: function (p, t) {
      var front = t.label;
      return '' +
        '<path d="M116 118L150 94H304L270 118Z" fill="' + shade(front, .25) + '"/>' +
        '<path d="M270 118L304 94V326L270 350Z" fill="' + shade(front, -.22) + '"/>' +
        rect(116, 118, 154, 232, 0, front) +
        rect(116, 146, 154, 2, 0, t.accent, ' opacity=".6"') +
        rect(116, 322, 154, 2, 0, t.accent, ' opacity=".6"') +
        leaf(182, 176, -150, .34, t.accent) + leaf(204, 176, -30, .34, t.accent) +
        labelText(p, t, 116, 170, 154, 150, 26) +
        '<path d="M116 118H270V350H116Z" fill="url(#cyl)" opacity=".35"/>';
    },

    tin: function (p, t) {
      var body = t.label;
      return '' +
        '<ellipse cx="200" cy="338" rx="110" ry="16" fill="' + shade(body, -.25) + '"/>' +
        rect(90, 250, 220, 88, 0, body) +
        labelText(p, t, 90, 266, 220, 72, 20) +
        rect(90, 250, 220, 88, 0, 'url(#cyl)') +
        rect(86, 218, 228, 40, 0, 'url(#metal)') +
        '<ellipse cx="200" cy="258" rx="114" ry="14" fill="' + shade('#9E7F31', -.25) + '"/>' +
        rect(86, 218, 228, 36, 0, 'url(#metal)') +
        '<ellipse cx="200" cy="218" rx="114" ry="28" fill="url(#metal)"/>' +
        '<ellipse cx="200" cy="218" rx="96" ry="21" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/>' +
        '<text x="200" y="224" text-anchor="middle" font-family="' + SERIF + '" font-weight="700" font-size="17" fill="#3E2E08" opacity=".75">Satyanand</text>';
    }
  };

  function svgFor(p, opts) {
    var t = TONES[p.tone] || TONES.forest;
    var draw = SHAPES[p.shape] || SHAPES.bottle;
    var h = hash(p.id);
    var jitter = function (n, span) { return ((h >> n) & 15) / 15 * span - span / 2; };
    var leafA = p.tone === 'sprout' || p.tone === 'leaf' ? '#7AC74F' : '#A1CF6B';
    var leafB = p.tone === 'forest' ? '#7AC74F' : '#5FAF3A';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">' +
      '<defs>' + DEFS + '</defs>' +
      (opts && opts.bare ? '' : '<circle cx="200" cy="212" r="152" fill="#fff" opacity=".5"/>') +
      leaf(126, 318, -148 + jitter(0, 24), 1.05, leafA) +
      leaf(118, 300, -118 + jitter(4, 20), .8, leafB) +
      leaf(276, 312, -38 + jitter(8, 24), 1.1, leafB) +
      '<ellipse cx="200" cy="352" rx="118" ry="14" fill="url(#shadow)"/>' +
      draw(p, t) +
      '</svg>';
  }

  /** Image URL for a product: its real photo if set, otherwise the drawn pack. */
  function url(p, opts) {
    if (p.image) return p.image;
    var key = p.id + (opts && opts.bare ? ':bare' : '');
    var hit = cache.get(key);
    if (hit) return hit;
    var svg = svgFor(p, opts);
    var out;
    try {
      out = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    } catch (e) {
      out = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    cache.set(key, out);
    return out;
  }

  window.SatyanandPackshot = { url: url, svg: svgFor };
})();
