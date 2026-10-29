/* ============================================================
   LUXCEL · 主交互脚本
   语言偏好：优先 localStorage 持久化（真实浏览器跨页保持），
   禁用时（隐私模式/受限环境）自动降级为内存态；
   不使用 history / clipboard 等受限 API。
   ============================================================ */
(function () {
  "use strict";

  var dict = window.LUXCEL_I18N || { zh: {}, en: {} };
  var LANG_KEY_DEFAULT = "zh";
  var LS_KEY = "luxcel-lang";
  var currentLang = LANG_KEY_DEFAULT;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 读取持久化语言偏好，受限环境静默降级 */
  function readStoredLang() {
    try {
      var v = window.localStorage.getItem(LS_KEY);
      return v && dict[v] ? v : null;
    } catch (err) {
      return null;
    }
  }
  function storeLang(lang) {
    try {
      window.localStorage.setItem(LS_KEY, lang);
    } catch (err) {
      /* 忽略：降级为内存态 */
    }
  }

  var stored = readStoredLang();
  if (stored && currentLang !== stored) {
    currentLang = stored;
  }

  /* ---------- 语言切换 ---------- */
  function t(key) {
    var table = dict[currentLang] || dict.zh;
    return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : (dict.zh[key] || key);
  }

  function applyLanguage(lang) {
    currentLang = dict[lang] ? lang : LANG_KEY_DEFAULT;
    storeLang(currentLang);
    document.documentElement.setAttribute("lang", currentLang === "en" ? "en" : "zh-CN");

    var nodes = document.querySelectorAll("[data-i18n]");
    Array.prototype.forEach.call(nodes, function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key);
    });

    var placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    Array.prototype.forEach.call(placeholders, function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      el.setAttribute("placeholder", t(key));
    });

    var ariaNodes = document.querySelectorAll("[data-i18n-aria]");
    Array.prototype.forEach.call(ariaNodes, function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (!key) return;
      el.setAttribute("aria-label", t(key));
    });

    var altNodes = document.querySelectorAll("[data-i18n-alt]");
    Array.prototype.forEach.call(altNodes, function (el) {
      var key = el.getAttribute("data-i18n-alt");
      if (!key) return;
      el.setAttribute("alt", t(key));
    });

    /* 语言按钮激活态 */
    var buttons = document.querySelectorAll("[data-lang]");
    Array.prototype.forEach.call(buttons, function (btn) {
      if (btn.getAttribute("data-lang") === currentLang) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-pressed", "false");
      }
    });

    /* 重新执行本地化标记 */
    syncLocalizedState();
  }

  function syncLocalizedState() {
    /* 需要依据当前语言再计算的文案（如页面标题） */
    var title = document.querySelector("title");
    if (!title) return;
    var pageKey = document.body.getAttribute("data-page");
    if (pageKey && dict[currentLang] && dict[currentLang][pageKey]) {
      title.textContent = dict[currentLang][pageKey];
    }
  }

  function bindLangButtons() {
    var buttons = document.querySelectorAll("[data-lang]");
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        applyLanguage(btn.getAttribute("data-lang"));
      });
    });
  }

  /* ---------- 移动端菜单 ---------- */
  function bindMobileMenu() {
    var toggle = document.getElementById("navToggle");
    var panel = document.getElementById("mobileMenu");
    var header = document.getElementById("siteHeader");
    if (!toggle || !panel) return;

    function setOpen(open) {
      panel.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? t("nav.close") : t("nav.menu"));
      document.body.classList.toggle("menu-locked", open);
      /* 切换按钮图标（菜单 / 关闭） */
      var use = toggle.querySelector("[data-icon-switch] use");
      if (use) use.setAttribute("href", open ? "#i-close" : "#i-menu");
    }

    toggle.addEventListener("click", function () {
      var open = !panel.classList.contains("is-open");
      setOpen(open);
      if (open) {
        var first = panel.querySelector("a");
        if (first) first.focus();
      }
    });

    /* 点击链接后关闭 */
    Array.prototype.forEach.call(panel.querySelectorAll("a"), function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    /* Esc 关闭并回到按钮 */
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && panel.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    /* 头部滚动状态 */
    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------- 当前导航高亮 ---------- */
  function bindNavHighlight() {
    var currentPath = (window.location.pathname || "/").split("/").pop() || "index.html";
    var links = document.querySelectorAll(".main-nav a[href], .mobile-menu a[href]");
    Array.prototype.forEach.call(links, function (a) {
      var href = a.getAttribute("href") || "";
      var file = href.split("/").pop() || "index.html";
      if (file === currentPath) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------- 滚动显现（reduced-motion 时跳过） ---------- */
  function bindReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add("is-visible"); });
      return;
    }

    /* 兜底：元素已进入视口即显示（覆盖快速滚动/锚点跳转错过 IO 回调的情况） */
    function revealInView(el) {
      var r = el.getBoundingClientRect();
      return r.top < window.innerHeight - 32 && r.bottom > 0;
    }
    Array.prototype.forEach.call(els, function (el) {
      if (revealInView(el)) el.classList.add("is-visible");
    });

    var io = new IntersectionObserver(
      function (entries) {
        Array.prototype.forEach.call(entries, function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });

    /* 滚动兜底：任何时刻只要元素进入视口就显示，避免瞬时滚动漏触发 */
    var ticking = false;
    function onScrollCheck() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        Array.prototype.forEach.call(els, function (el) {
          if (el.classList.contains("is-visible")) return;
          if (revealInView(el)) {
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        });
      });
    }
    window.addEventListener("scroll", onScrollCheck, { passive: true });
  }

  /* ---------- 联系表单（演示，无后端） ---------- */
  function bindContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var status = document.getElementById("formStatus");
    var submitBtn = document.getElementById("formSubmit");

    function setInvalid(input, invalid) {
      var group = input.closest(".form-group");
      if (!group) return;
      group.classList.toggle("is-invalid", invalid);
    }

    function validate() {
      var ok = true;
      Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (input) {
        var valid = input.value.trim().length > 0;
        if (input.type === "email") {
          valid = valid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        }
        setInvalid(input, !valid);
        if (!valid) ok = false;
      });
      return ok;
    }

    /* 输入即清除错误态 */
    Array.prototype.forEach.call(form.querySelectorAll("input, textarea"), function (input) {
      input.addEventListener("input", function () { setInvalid(input, false); });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (status) {
        status.className = "form-status";
        status.textContent = "";
      }
      if (!validate()) {
        if (status) {
          status.className = "form-status is-error";
          status.textContent = t("contact.form.fail");
          status.setAttribute("role", "alert");
        }
        var firstInvalid = form.querySelector(".is-invalid input, .is-invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /* 演示提交：loading -> success（期间禁用按钮防重复提交） */
      if (submitBtn) {
        submitBtn.classList.add("is-loading");
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.disabled = true;
        var label = submitBtn.querySelector("span[data-submit-label]");
        if (label) label.textContent = t("contact.form.sending");
      }

      window.setTimeout(function () {
        if (submitBtn) {
          submitBtn.classList.remove("is-loading");
          submitBtn.removeAttribute("aria-busy");
          submitBtn.disabled = false;
          var lbl = submitBtn.querySelector("span[data-submit-label]");
          if (lbl) lbl.textContent = t("contact.form.submit");
        }
        if (status) {
          status.className = "form-status is-success";
          status.textContent = t("contact.form.success");
          status.setAttribute("role", "status");
        }
        form.reset();
      }, 900);
    });
  }

  /* ---------- 目录按钮（产品页锚点） ---------- */
  function bindAnchors() {
    var links = document.querySelectorAll('a[href^="#"]');
    Array.prototype.forEach.call(links, function (a) {
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      a.addEventListener("click", function (ev) {
        var target = document.getElementById(id);
        if (!target) return;
        ev.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        /* 键盘辅助：更新焦点 */
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    bindLangButtons();
    bindMobileMenu();
    bindNavHighlight();
    bindReveal();
    bindContactForm();
    bindAnchors();
    /* 应用存储的语言偏好（无存储时回到默认中文） */
    applyLanguage(currentLang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();