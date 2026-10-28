/* =========================================================
   Hearth Roastery — 공통 스크립트
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 사이트 설정: 여기만 바꾸면 전체에 반영됩니다 ---------- */
  var SITE = {
    name: "Hearth Roastery",
    shipPromise: "48시간",

    // 네이버 스마트스토어 주소 (비어 있으면 "연결 전" 안내가 뜹니다)
    storeUrl: "",
    subscribeUrl: "",

    // 구글 시트 > 파일 > 공유 > 웹에 게시 > CSV 주소 (비어 있으면 beans-data.js 사용)
    beansSheetCsv: "",

    // B2B 문의 접수 주소: Apps Script 웹 앱 주소(.../exec). 비어 있으면 전송하지 않습니다
    // 배포 방법은 저장소의 apps-script/배포방법.md 참고
    formEndpoint: "https://script.google.com/macros/s/AKfycbx5gQueXi7wwCQXVI9oed9KSH8PO5eEYaYA_NPdA6HjYWIfmnixi1tVistwU97ydMPWqw/exec",

    // 정기구독 가격 (예시)
    subscription: { prices: { 200: 16000, 500: 36000 }, discount: 0.1 },

    // 사업자 정보 (전자상거래법상 표시 항목)
    biz: {
      company: "[상호]",
      ceo: "[대표자]",
      regNo: "[사업자등록번호]",
      mailOrderNo: "[통신판매업 신고번호]",
      address: "[사업장 주소]",
      phone: "[대표 전화]",
      email: "[이메일]"
    }
  };
  window.SITE = SITE;

  document.documentElement.classList.add("js");

  var NAV = [
    ["index.html", "홈"],
    ["beans.html", "원두"],
    ["subscribe.html", "정기구독"],
    ["story.html", "로스팅 이야기"],
    ["b2b.html", "납품 문의"]
  ];

  var FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.4 2.2c.6 3.3 4.6 5.7 4.6 10.6a5 5 0 0 1-10 0c0-2.3 1-4 2.4-5.2.1 1.7.9 2.8 2.1 3.3-.6-2.8-.1-5.9.9-8.7z"/></svg>';

  /* ---------- 유틸 ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function won(n) { return "₩" + Number(n || 0).toLocaleString("ko-KR"); }
  function currentPage() {
    var p = location.pathname.split("/").pop();
    return p || "index.html";
  }
  function shade(hex, pct) {
    var n = parseInt(hex.replace("#", ""), 16);
    var r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var t = pct < 0 ? 0 : 255, p = Math.abs(pct) / 100;
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  var toastTimer;
  function toast(msg) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  /* ---------- 원두 봉투 그림 ---------- */
  var pouchSeq = 0;
  var ROAST_EN = { "라이트": "LIGHT", "라이트미디엄": "LIGHT MEDIUM", "미디엄": "MEDIUM", "미디엄다크": "MEDIUM DARK", "다크": "DARK" };

  function pouch(bean, opts) {
    opts = opts || {};
    if (bean.image && !opts.forceSvg) {
      return '<img class="pouch-img" src="' + esc(bean.image) + '" alt="' + esc(bean.name) + '">';
    }
    var c = bean.color || "#6b4f3a";
    var id = "pg" + (++pouchSeq);
    var label = String(opts.label || bean.label || bean.name || "").toUpperCase();
    var sub = opts.sub || ((ROAST_EN[bean.roast] || bean.roast || "") + " · 200G");
    var fs = Math.min(15, 96 / (label.length * 0.66));
    return (
      '<svg class="pouch" viewBox="0 0 200 260" role="img" aria-label="' + esc(bean.name) + ' 원두 봉투">' +
        '<defs><linearGradient id="' + id + '" x1="0" x2="1">' +
          '<stop offset="0" stop-color="' + shade(c, -14) + '"/>' +
          '<stop offset=".45" stop-color="' + shade(c, 10) + '"/>' +
          '<stop offset="1" stop-color="' + shade(c, -24) + '"/>' +
        "</linearGradient></defs>" +
        '<path d="M32 30 H168 L176 234 Q176 248 162 248 H38 Q24 248 24 234 Z" fill="url(#' + id + ')"/>' +
        '<rect x="30" y="14" width="140" height="22" rx="3" fill="' + shade(c, -30) + '"/>' +
        '<path d="M34 25 H166" stroke="rgba(255,255,255,.18)" stroke-dasharray="3 3"/>' +
        '<circle cx="100" cy="66" r="7" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.6"/>' +
        '<circle cx="100" cy="66" r="2" fill="rgba(255,255,255,.45)"/>' +
        '<rect x="48" y="106" width="104" height="96" rx="6" fill="#fbfaf7"/>' +
        '<path d="M100 120c.4 1.8 2.5 3 2.5 5.6a2.5 2.5 0 0 1-5 0c0-1.2.5-2 1.2-2.6 0 .9.5 1.4 1 1.7-.2-1.5 0-3.1.3-4.7z" fill="#b4532a"/>' +
        '<text x="100" y="142" text-anchor="middle" font-size="6.5" font-weight="600" letter-spacing="2.2" fill="#86868b">' + esc(SITE.name.toUpperCase()) + "</text>" +
        '<text x="100" y="168" text-anchor="middle" font-size="' + fs.toFixed(1) + '" font-weight="700" letter-spacing=".5" fill="#1d1d1f">' + esc(label) + "</text>" +
        '<text x="100" y="188" text-anchor="middle" font-size="6.5" letter-spacing="1.2" fill="#86868b">' + esc(sub) + "</text>" +
      "</svg>"
    );
  }

  /* ---------- 분쇄도 아이콘 ---------- */
  var GRIND_R = { drip: 4, espresso: 1.4, moka: 2.5, cold: 6 };
  function grindIcon(kind) {
    var out = '<svg viewBox="0 0 64 64" aria-hidden="true">';
    if (kind === "whole") {
      [[20, 24, -30], [42, 22, 25], [32, 44, 5]].forEach(function (b) {
        out += '<g transform="translate(' + b[0] + " " + b[1] + ") rotate(" + b[2] + ')">' +
          '<ellipse rx="9" ry="12" fill="#5b3a29"/>' +
          '<path d="M0 -10 C 4 -4, -4 4, 0 10" stroke="#2b1a12" stroke-width="1.6" fill="none"/></g>';
      });
    } else {
      var r = GRIND_R[kind], s = r * 2.55, i = 0;
      for (var y = 32 - 26; y <= 58; y += s) {
        for (var x = 32 - 26; x <= 58; x += s) {
          var dx = x - 32, dy = y - 32;
          if (dx * dx + dy * dy > 26 * 26) continue;
          var j = Math.sin(++i * 12.9898) * 0.35 * r;
          out += '<circle cx="' + (x + j).toFixed(1) + '" cy="' + (y - j).toFixed(1) + '" r="' + r + '" fill="' + (i % 3 ? "#6b4532" : "#4e3022") + '"/>';
        }
      }
    }
    return out + "</svg>";
  }

  /* ---------- 상단 메뉴와 하단 ---------- */
  function renderHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    var page = currentPage();
    var links = NAV.map(function (n) {
      return '<li><a href="' + n[0] + '"' + (n[0] === page ? ' aria-current="page"' : "") + ">" + n[1] + "</a></li>";
    }).join("");
    host.outerHTML =
      '<header class="gnav"><nav class="gnav-inner" aria-label="주 메뉴">' +
        '<a class="gnav-logo" href="index.html">' + FLAME + esc(SITE.name) + "</a>" +
        '<ul class="gnav-links" id="gnav-links">' + links + "</ul>" +
        '<a class="gnav-cta" href="#" data-store="main">스마트스토어 ↗</a>' +
        '<button class="gnav-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="gnav-links"><span></span><span></span></button>' +
      "</nav></header>";

    var nav = document.querySelector(".gnav");
    var btn = nav.querySelector(".gnav-toggle");
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
  }

  function renderFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    var b = SITE.biz;
    host.outerHTML =
      '<footer class="gfooter"><div class="container wide">' +
        '<p class="footer-note">모든 원두는 주문을 받은 뒤 로스팅하여 ' + esc(SITE.shipPromise) + ' 이내에 발송합니다. 결제와 배송은 네이버 스마트스토어에서 진행됩니다.</p>' +
        '<div class="footer-cols">' +
          '<div><h4>쇼핑</h4><ul><li><a href="beans.html">원두</a></li><li><a href="subscribe.html">정기구독</a></li><li><a href="#" data-store="main">스마트스토어</a></li></ul></div>' +
          '<div><h4>브랜드</h4><ul><li><a href="story.html">로스팅 이야기</a></li></ul></div>' +
          '<div><h4>비즈니스</h4><ul><li><a href="b2b.html">카페·사무실 납품</a></li><li><a href="b2b.html#inquiry">견적 문의</a></li></ul></div>' +
          '<div><h4>고객 지원</h4><ul><li><a href="privacy.html">개인정보처리방침</a></li><li>' + esc(b.email) + "</li></ul></div>" +
        "</div>" +
        '<p class="footer-biz">상호 ' + esc(b.company) + " · 대표 " + esc(b.ceo) + " · 사업자등록번호 " + esc(b.regNo) +
          " · 통신판매업 신고 " + esc(b.mailOrderNo) + "<br>" + esc(b.address) + " · " + esc(b.phone) + "</p>" +
        '<div class="footer-bottom"><span>Copyright © ' + new Date().getFullYear() + " " + esc(SITE.name) + '. All rights reserved.</span><a href="privacy.html">개인정보처리방침</a></div>' +
      "</div></footer>";
  }

  /* ---------- 스마트스토어 링크 ---------- */
  var beanIndex = {};
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-store]");
    if (!a) return;
    var key = a.getAttribute("data-store");
    var url = key === "main" ? SITE.storeUrl
      : key === "subscribe" ? (SITE.subscribeUrl || SITE.storeUrl)
      : ((beanIndex[key] && beanIndex[key].storeUrl) || SITE.storeUrl);
    if (!url) {
      e.preventDefault();
      toast("스마트스토어 링크가 아직 연결되지 않았습니다.");
      return;
    }
    a.setAttribute("href", url);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  });

  /* ---------- 스크롤 등장 효과 ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }) : null;

  function observeReveal(root) {
    (root || document).querySelectorAll(".reveal:not(.in)").forEach(function (el) {
      if (io) io.observe(el); else el.classList.add("in");
    });
  }

  /* ---------- 원두 데이터 ---------- */
  var SHEET_COLUMNS = {
    "아이디": "id", "이름": "name", "영문명": "label", "유형": "type", "산지": "origin",
    "가공": "process", "고도": "altitude", "산지이야기": "story", "로스팅": "roast", "컵노트": "notes", "산미": "acidity", "바디": "body",
    "가격": "price", "추천추출": "recipe", "색상": "color", "스토어링크": "storeUrl",
    "사진URL": "image", "대표": "featured", "노출여부": "visible"
  };

  function parseCSV(text) {
    var rows = [], row = [], cell = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') q = false;
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (ch !== "\r") cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  function truthy(v) {
    if (typeof v === "boolean") return v;
    return /^(y|yes|true|o|1|예|노출)$/i.test(String(v).trim());
  }

  function normalize(b) {
    var notes = Array.isArray(b.notes) ? b.notes : String(b.notes || "").split(",");
    return {
      id: String(b.id || b.name || "").trim(),
      name: b.name || "",
      label: b.label || "",
      type: /blend|블렌드/i.test(b.type) ? "blend" : "single",
      origin: b.origin || "", process: b.process || "", roast: b.roast || "",
      altitude: b.altitude || "", story: b.story || "",
      notes: notes.map(function (n) { return String(n).trim(); }).filter(Boolean),
      acidity: Math.max(0, Math.min(5, Number(b.acidity) || 0)),
      body: Math.max(0, Math.min(5, Number(b.body) || 0)),
      price: Number(String(b.price).replace(/[^\d]/g, "")) || 0,
      recipe: b.recipe || "", color: /^#[0-9a-f]{6}$/i.test(b.color) ? b.color : "#6b4f3a",
      storeUrl: /^https:\/\//.test(b.storeUrl || "") ? b.storeUrl : "",
      image: /^https:\/\//.test(b.image || "") ? b.image : "",
      featured: b.featured === undefined ? false : truthy(b.featured),
      visible: b.visible === undefined || b.visible === "" ? true : truthy(b.visible)
    };
  }

  function loadBeans() {
    var fallback = function () { return (window.BEANS_DEFAULT || []).map(normalize); };
    var p = !SITE.beansSheetCsv ? Promise.resolve(fallback()) :
      fetch(SITE.beansSheetCsv).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }).then(function (text) {
        var rows = parseCSV(text);
        var head = rows.shift().map(function (h) { return SHEET_COLUMNS[h.trim()] || h.trim(); });
        var list = rows.filter(function (r) { return r.join("").trim(); }).map(function (r) {
          var o = {};
          head.forEach(function (h, i) { o[h] = r[i]; });
          return normalize(o);
        });
        if (!list.length) throw new Error("빈 시트");
        return list;
      }).catch(function (err) {
        console.warn("원두 시트를 읽지 못해 기본 데이터를 사용합니다:", err);
        return fallback();
      });
    return p.then(function (list) {
      list = list.filter(function (b) { return b.visible && b.id; });
      beanIndex = {};
      list.forEach(function (b) { beanIndex[b.id] = b; });
      return list;
    });
  }

  function meter(label, value) {
    var bars = "";
    for (var i = 1; i <= 5; i++) bars += "<i" + (i <= value ? ' class="on"' : "") + "></i>";
    return '<div class="meter"><span>' + label + '</span><span class="meter-bar" role="img" aria-label="' + label + " 5단계 중 " + value + '">' + bars + "</span></div>";
  }
  function typeLabel(b) { return b.type === "blend" ? "블렌드" : "싱글 오리진"; }

  /* ---------- 홈 ---------- */
  function initHome() {
    document.querySelectorAll("[data-grind]").forEach(function (el) {
      el.innerHTML = grindIcon(el.getAttribute("data-grind"));
    });
    loadBeans().then(function (beans) {
      var featured = beans.filter(function (b) { return b.featured; });
      if (featured.length < 2) featured = featured.concat(beans.filter(function (b) { return !b.featured; })).slice(0, 2);
      featured = featured.slice(0, 2);

      var heroSet = [beans[2], featured[0], featured[1]].filter(Boolean);
      var hero = document.getElementById("hero-visual");
      if (hero) hero.innerHTML = heroSet.map(function (b) { return pouch(b, { forceSvg: true }); }).join("");

      var promo = document.getElementById("promo-visual");
      if (promo && beans.length) {
        promo.innerHTML =
          pouch(beans[0], { forceSvg: true, label: "SUBSCRIPTION", sub: "EVERY 2 WEEKS" }) +
          pouch(beans[1] || beans[0], { forceSvg: true, label: "ROASTER'S PICK", sub: "FRESHLY ROASTED" });
      }

      var grid = document.getElementById("featured");
      if (grid) {
        grid.innerHTML = featured.map(function (b, i) {
          return '<article class="tile ' + (i === 1 ? "dark" : "") + ' reveal">' +
            '<p class="bean-tag">' + typeLabel(b) + " · " + esc(b.roast) + "</p>" +
            '<h3 class="tile-title">' + esc(b.name) + "</h3>" +
            '<p class="lead-sm">' + esc(b.notes.join(", ")) + "</p>" +
            '<div class="cta-row"><a class="btn btn-primary" href="#" data-store="' + esc(b.id) + '">구매하기 ↗</a>' +
            '<a class="link" href="beans.html#' + encodeURIComponent(b.id) + '">자세히 보기</a></div>' +
            '<div class="tile-visual">' + pouch(b) + "</div></article>";
        }).join("");
        observeReveal(grid);
      }
    });
  }

  /* ---------- 원두 목록 ---------- */
  function initBeans() {
    var grid = document.getElementById("bean-grid");
    var dialog = document.getElementById("bean-dialog");
    var content = document.getElementById("bean-dialog-content");
    var sortSel = document.getElementById("bean-sort");
    var chips = document.querySelectorAll("[data-filter]");
    var state = { type: "all", sort: "rec" };
    var beans = [];

    function render() {
      var list = beans.filter(function (b) { return state.type === "all" || b.type === state.type; });
      if (state.sort === "acid") list = list.slice().sort(function (a, b) { return b.acidity - a.acidity; });
      if (state.sort === "body") list = list.slice().sort(function (a, b) { return b.body - a.body; });
      if (state.sort === "price") list = list.slice().sort(function (a, b) { return a.price - b.price; });

      grid.innerHTML = list.length ? list.map(function (b) {
        return '<button type="button" class="bean-card reveal" data-bean="' + esc(b.id) + '">' +
          '<div class="bean-card-visual">' + pouch(b) + "</div>" +
          '<span class="bean-tag">' + typeLabel(b) + " · " + esc(b.roast) + "</span>" +
          '<span class="bean-name">' + esc(b.name) + "</span>" +
          '<span class="bean-notes">' + esc(b.notes.join(", ")) + "</span>" +
          '<span class="bean-meters">' + meter("산미", b.acidity) + meter("바디", b.body) + "</span>" +
          '<span class="bean-foot"><strong>' + won(b.price) + '</strong><span>자세히 보기 ›</span></span>' +
        "</button>";
      }).join("") : '<p class="empty">조건에 맞는 원두가 없습니다.</p>';
      observeReveal(grid);
    }

    function open(id) {
      var b = beanIndex[id];
      if (!b) return;
      content.innerHTML =
        '<div class="dialog-body">' +
          '<div class="dialog-visual">' + pouch(b) + "</div>" +
          '<div class="dialog-info">' +
            '<p class="bean-tag">' + typeLabel(b) + " · " + esc(b.roast) + "</p>" +
            '<h2 class="h3" id="bean-dialog-title" style="margin-top:6px">' + esc(b.name) + "</h2>" +
            '<p class="lead-sm">' + esc(b.notes.join(", ")) + "</p>" +
            '<div class="bean-meters" style="max-width:260px">' + meter("산미", b.acidity) + meter("바디", b.body) + "</div>" +
            '<dl class="spec">' +
              "<dt>산지</dt><dd>" + esc(b.origin) + "</dd>" +
              (b.altitude ? "<dt>재배 고도</dt><dd>" + esc(b.altitude) + "</dd>" : "") +
              "<dt>가공 방식</dt><dd>" + esc(b.process) + "</dd>" +
              "<dt>로스팅</dt><dd>" + esc(b.roast) + "</dd>" +
              "<dt>추천 추출</dt><dd>" + esc(b.recipe) + "</dd>" +
              "<dt>용량</dt><dd>200g</dd>" +
            "</dl>" +
            (b.story ? '<p class="bean-story">' + esc(b.story) + "</p>" : "") +
            '<p class="small muted">분쇄도는 주문할 때 홀빈, 핸드드립, 에스프레소, 모카포트, 콜드브루 중에서 고를 수 있습니다.</p>' +
            '<div class="dialog-buy"><span class="price-lg">' + won(b.price) + "<small>200g</small></span>" +
              '<a class="btn btn-primary" href="#" data-store="' + esc(b.id) + '">네이버페이로 구매하기 ↗</a></div>' +
            '<p class="fresh">주문 후 로스팅 · ' + esc(SITE.shipPromise) + " 이내 발송</p>" +
            '<p class="small" style="margin-top:10px"><a class="link" href="subscribe.html">정기구독으로 ' + Math.round(SITE.subscription.discount * 100) + '% 할인받기</a></p>' +
          "</div>" +
        "</div>";
      if (!dialog.open) dialog.showModal();
      if (location.hash.slice(1) !== id) history.replaceState(null, "", "#" + encodeURIComponent(id));
    }

    function openFromHash() {
      var id = decodeURIComponent(location.hash.slice(1));
      if (id && beanIndex[id]) open(id);
    }

    grid.addEventListener("click", function (e) {
      var card = e.target.closest("[data-bean]");
      if (card) open(card.getAttribute("data-bean"));
    });
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        state.type = c.getAttribute("data-filter");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        render();
      });
    });
    sortSel.addEventListener("change", function () { state.sort = sortSel.value; render(); });

    dialog.querySelector(".dialog-close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", function () {
      history.replaceState(null, "", location.pathname + location.search);
    });
    window.addEventListener("hashchange", openFromHash);

    loadBeans().then(function (list) {
      beans = list;
      render();
      openFromHash();
    });
  }

  /* ---------- 정기구독 ---------- */
  function initSubscribe() {
    var state = { freq: "2w", size: "200", bean: "pick" };
    var visual = document.getElementById("sub-visual");
    var priceEl = document.getElementById("sub-price");
    var noteEl = document.getElementById("sub-note");
    var LABEL = { pick: ["ROASTER'S PICK", "#8a5a3b"], fixed: ["HEARTH BLEND", "#4e3022"] };

    function update() {
      var cfg = SITE.subscription;
      var base = cfg.prices[state.size];
      var price = Math.round(base * (1 - cfg.discount) / 100) * 100;
      priceEl.textContent = won(price);
      noteEl.textContent = "배송 1회당 · 정가 " + won(base) + "에서 " + Math.round(cfg.discount * 100) + "% 할인 · " +
        (state.freq === "2w" ? "2주마다" : "4주마다") + " 배송";
      var l = LABEL[state.bean];
      visual.innerHTML = pouch({ name: "정기구독 원두", color: l[1] }, {
        forceSvg: true, label: l[0], sub: (state.freq === "2w" ? "EVERY 2 WEEKS" : "EVERY 4 WEEKS") + " · " + state.size + "G"
      });
      visual.classList.toggle("size-500", state.size === "500");
    }

    document.querySelectorAll("[data-opt]").forEach(function (group) {
      var key = group.getAttribute("data-opt");
      var opts = group.querySelectorAll(".seg");
      opts.forEach(function (o) {
        o.addEventListener("click", function () {
          state[key] = o.getAttribute("data-value");
          opts.forEach(function (x) { x.setAttribute("aria-checked", String(x === o)); });
          update();
        });
      });
    });
    update();
  }

  /* ---------- 납품 문의 ---------- */
  function initB2B() {
    var form = document.getElementById("inquiry-form");
    var status = document.getElementById("form-status");
    var btn = form.querySelector("button[type=submit]");
    var started = document.getElementById("f-started");
    var ERRORS = {
      missing: "필수 항목을 모두 입력해 주세요.",
      consent: "개인정보 수집에 동의해 주세요.",
      phone: "연락처를 다시 확인해 주세요. 숫자 9~12자리여야 합니다.",
      email: "이메일 주소 형식을 다시 확인해 주세요.",
      type: "업종을 선택해 주세요.",
      rate_limited: "방금 같은 연락처로 문의가 접수되었습니다. 1분 뒤에 다시 시도해 주세요."
    };
    // 폼을 연 시각: 너무 빨리 전송되는 자동 프로그램을 걸러냅니다
    function stamp() { started.value = String(Date.now()); }
    stamp();

    function show(kind, msg) {
      status.className = "form-status show " + kind;
      status.textContent = msg;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (!SITE.formEndpoint) {
        show("info", "아직 문의 접수 주소가 연결되지 않아 전송되지 않았습니다. " + SITE.biz.email + "로 연락해 주세요.");
        return;
      }
      btn.disabled = true;
      btn.textContent = "보내는 중…";
      // Apps Script가 e.parameter로 바로 읽을 수 있도록 urlencoded로 보냅니다
      var ctrl = "AbortController" in window ? new AbortController() : null;
      var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 20000);
      fetch(SITE.formEndpoint, {
        method: "POST",
        body: new URLSearchParams(new FormData(form)),
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function (res) {
          if (res && res.ok) {
            form.reset();
            stamp();
            show("ok", "문의가 접수되었습니다. 확인 후 남겨 주신 연락처로 연락드리겠습니다.");
          } else {
            show("err", ERRORS[res && res.error] || "전송하지 못했습니다. 잠시 뒤 다시 시도하시거나 " + SITE.biz.email + "로 연락해 주세요.");
          }
        })
        .catch(function () {
          show("err", "전송하지 못했습니다. 잠시 뒤 다시 시도하시거나 " + SITE.biz.email + "로 연락해 주세요.");
        })
        .then(function () { clearTimeout(timer); })
        .then(function () {
          btn.disabled = false;
          btn.textContent = "문의 보내기";
        });
    });
  }

  /* ---------- 시작 ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    var page = document.body.getAttribute("data-page");
    if (page === "home") initHome();
    if (page === "beans") initBeans();
    if (page === "subscribe") initSubscribe();
    if (page === "b2b") initB2B();
    observeReveal();
  });
})();
