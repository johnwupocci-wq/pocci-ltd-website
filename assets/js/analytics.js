/* LUXCEL 站点流量统计（GA4 + Cloudflare Web Analytics）
 * 所有页面通过 <script src="assets/js/analytics.js" defer></script> 引入。
 * ID 填好后自动生效；留空则不加载任何第三方脚本，站点行为不受影响。
 * 维护说明：
 *  - GA4_ID：Google Analytics（分析）后台 → 管理 → 数据流 → 衡量 ID，形如 G-XXXXXXXXXX
 *  - CF_TOKEN：Cloudflare Dashboard → Web Analytics → 添加站点后给出的 Beacon Token
 *  - Google Search Console 验证：采用"HTML 文件"方式，在站点根目录放置
 *    google<验证串>.html 文件（内容为 google-site-verification: google<验证串>.html）
 */
(function () {
  "use strict";

  var GA4_ID = "";    // ← 填入 GA4 衡量 ID，例如 "G-ABCDEF1234"
  var CF_TOKEN = "";  // ← 填入 Cloudflare Web Analytics Token

  // Google Analytics 4 —— 采用官方「Google 代码（gtag.js）」方式，不引入 GTM
  if (GA4_ID && /^[GT]-[A-Z0-9]{6,}$/i.test(GA4_ID)) {
    // 顺序与官方片段一致：先建立 dataLayer / gtag，再异步加载 gtag.js
    window.dataLayer = window.dataLayer || [];
    var gtag = function () { window.dataLayer.push(arguments); };
    window.gtag = window.gtag || gtag;
    gtag("js", new Date());
    gtag("config", GA4_ID, { anonymize_ip: true });

    var ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
    document.head.appendChild(ga);
  }

  // Cloudflare Web Analytics（无 Cookie、免费）
  if (CF_TOKEN && CF_TOKEN.length > 8) {
    var cf = document.createElement("script");
    cf.defer = true;
    cf.src = "https://static.cloudflareinsights.com/beacon.min.js";
    cf.setAttribute("data-cf-beacon", JSON.stringify({ token: CF_TOKEN }));
    document.head.appendChild(cf);
  }
})();
