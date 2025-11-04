/* cookie-consent.js - GDPR + CCPA banner for gopulsar.app */
(function(){
  const GA_ID = 'G-S5NY9DEBZS'; // 🔁 Replace with your real Google Analytics ID
  const KEY = 'pulsar_cookie_consent_v1';

  const defaultConsent = {
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
    ccpaOptOut: false
  };

  function getConsent(){
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
  }
  function saveConsent(c){ localStorage.setItem(KEY, JSON.stringify(c)); applyConsent(c); }

  function applyConsent(c){
    if(c.statistics && !window._gaInit){
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', GA_ID, 'auto');
      ga('set', 'anonymizeIp', true);
      ga('send', 'pageview');
      window._gaInit = true;
    }
  }

  function showBanner(){
    if(document.getElementById('cc-banner')) return;
    const html = `
      <style>
        .cc-banner{position:fixed;bottom:20px;left:20px;right:20px;z-index:9999;
          background:#0b1220;color:#fff;padding:18px;border-radius:10px;
          font-family:system-ui,Roboto,sans-serif;display:flex;flex-wrap:wrap;gap:10px;
          align-items:center;box-shadow:0 4px 20px rgba(0,0,0,.4);}
        .cc-banner p{flex:1;margin:0;font-size:14px;}
        .cc-banner button{border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-weight:600;}
        .cc-accept{background:#06f;color:#fff;}
        .cc-reject,.cc-manage{background:#222;color:#eee;}
        .cc-link{color:#9dd;text-decoration:underline;cursor:pointer;}
        .cc-modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:10000;}
        .cc-modal-inner{background:#fff;color:#111;border-radius:8px;padding:20px;max-width:400px;width:90%;font-size:14px;}
        .cc-modal label{display:flex;justify-content:space-between;margin:8px 0;}
      </style>
      <div class="cc-banner" id="cc-banner">
        <p>We use cookies to improve your experience, analyze traffic, and show personalized content.
        <a href="/privacy_policy.html" class="cc-link" target="_blank">Privacy Policy</a></p>
        <div style="display:flex;gap:8px;">
          <button class="cc-accept">Accept all</button>
          <button class="cc-reject">Reject non-essential</button>
          <button class="cc-manage">Manage</button>
        </div>
      </div>
      <div class="cc-modal" id="cc-modal">
        <div class="cc-modal-inner">
          <h3>Cookie preferences</h3>
          <form id="cc-form">
            <label>Necessary<input type="checkbox" checked disabled></label>
            <label>Preferences<input type="checkbox" name="preferences"></label>
            <label>Statistics<input type="checkbox" name="statistics"></label>
            <label>Marketing<input type="checkbox" name="marketing"></label>
          </form>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">
            <button id="cc-save" class="cc-accept">Save</button>
            <button id="cc-close" class="cc-reject">Close</button>
          </div>
          <p style="font-size:12px;margin-top:10px;">California residents can
            <span id="cc-ccpa" class="cc-link">opt out of sale of personal information</span>.</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const banner = document.getElementById('cc-banner');
    const modal = document.getElementById('cc-modal');
    const form = document.getElementById('cc-form');
    document.querySelector('.cc-accept').onclick = ()=>{ saveConsent({necessary:true,preferences:true,statistics:true,marketing:true,ccpaOptOut:false}); banner.remove(); };
    document.querySelector('.cc-reject').onclick = ()=>{ saveConsent({necessary:true,preferences:false,statistics:false,marketing:false,ccpaOptOut:false}); banner.remove(); };
    document.querySelector('.cc-manage').onclick = ()=>{ modal.style.display='flex'; };
    document.getElementById('cc-close').onclick = ()=>{ modal.style.display='none'; };
    document.getElementById('cc-save').onclick = ()=>{
      const c = { necessary:true,
        preferences: form.preferences.checked,
        statistics: form.statistics.checked,
        marketing: form.marketing.checked,
        ccpaOptOut: false };
      saveConsent(c);
      modal.style.display='none';
      banner.remove();
    };
    document.getElementById('cc-ccpa').onclick = ()=>{
      const c = getConsent() || defaultConsent;
      c.ccpaOptOut = true;
      saveConsent(c);
      alert('You have opted out of sale of personal information (CCPA).');
    };
  }

  const stored = getConsent();
  if(!stored){ showBanner(); } else { applyConsent(stored); }
})();
