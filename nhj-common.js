/**
 * Natural Harmony Journey — 공통 모듈
 * 1. 헤더 / 푸터 자동 주입 (data-nhj-header / data-nhj-footer)
 * 2. 장바구니 상태 관리 (localStorage 기반)
 * 3. 장바구니 팝업 인라인 렌더링
 */

/* =========================================================
   0. 현재 페이지 파악
========================================================= */
const NHJ_PAGE = (() => {
  const p = location.pathname.split('/').pop() || 'indexnewmain.html';
  if (p.includes('test'))     return 'test';
  if (p.includes('purchase') && !p.includes('page') && !p.includes('flow')) return 'purchase';
  return 'other';
})();

/* =========================================================
   1. 공통 헤더 HTML
========================================================= */
function _navLink(href, label, pageKey) {
  const active = NHJ_PAGE === pageKey;
  const base = 'font-headline-md text-sm tracking-wider uppercase transition-colors duration-300';
  const cls  = active
    ? `${base} text-[#4a6545] border-b-2 border-[#4a6545] pb-1 font-semibold`
    : `${base} text-[#4a6545]/70 hover:text-[#4a6545]`;
  return `<a class="${cls}" href="${href}">${label}</a>`;
}

function _renderHeader() {
  const el = document.querySelector('[data-nhj-header]');
  if (!el) return;

  el.outerHTML = `
<header id="nhj-header" class="bg-white/40 backdrop-blur-md sticky top-0 z-50 border-b border-[#4a6545]/10 w-full">
  <nav class="flex justify-between items-center px-8 md:px-12 py-6 w-full max-w-[1440px] mx-auto">
    <a class="text-2xl font-bold text-[#4a6545] font-headline-xl" href="indexnewmain.html">Natural Harmony Journey</a>
    <div class="hidden md:flex items-center space-x-8">
      ${_navLink('indexnewtest5.html',   'TEST',     'test')}
      ${_navLink('indexpurchasemain.html','PURCHASE', 'purchase')}
    </div>
    <div class="flex items-center space-x-6 text-[#4a6545]">
      <a href="indexjoin.html" class="hover:opacity-70 transition-opacity" aria-label="회원가입/로그인">
        <span class="material-symbols-outlined">person</span>
      </a>
      <button class="hover:opacity-70 transition-opacity relative" id="nhj-cart-btn" onclick="NHJCart.openPopup()" aria-label="장바구니">
        <span class="material-symbols-outlined">shopping_cart</span>
        <span id="nhj-cart-count"
          class="absolute -top-2 -right-2 bg-[#4a6545] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          0
        </span>
      </button>
    </div>
  </nav>
</header>`;
}

/* =========================================================
   2. 공통 푸터 HTML
========================================================= */
function _renderFooter() {
  const el = document.querySelector('[data-nhj-footer]');
  if (!el) return;

  el.outerHTML = `
<footer class="bg-[#fbf9f8] border-t border-[#4a6545]/10 mt-20">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-24 max-w-[1440px] mx-auto">
    <div class="flex flex-col gap-6">
      <div class="text-xl font-bold text-[#4a6545]">Natural Harmony Journey</div>
      <p class="text-[#4a6545]/70 text-sm">보태니컬 순수 미학.</p>
    </div>
    <div class="flex flex-col gap-4">
      <h5 class="font-headline-md text-sm uppercase tracking-widest text-[#4a6545]">쇼핑</h5>
      <ul class="flex flex-col gap-2 text-sm text-[#4a6545]/60">
        <li><a class="hover:text-[#4a6545] transition-all" href="indexpurchasemain.html">전체 상품</a></li>
        <li><a class="hover:text-[#4a6545] transition-all" href="#">식물 관리법</a></li>
        <li><a class="hover:text-[#4a6545] transition-all" href="#">회사 소개</a></li>
      </ul>
    </div>
    <div class="flex flex-col gap-4">
      <h5 class="font-headline-md text-sm uppercase tracking-widest text-[#4a6545]">고객 지원</h5>
      <ul class="flex flex-col gap-2 text-sm text-[#4a6545]/60">
        <li><a class="hover:text-[#4a6545] transition-all" href="#">배송 및 반품</a></li>
        <li><a class="hover:text-[#4a6545] transition-all" href="#">개인정보 처리방침</a></li>
        <li><a class="hover:text-[#4a6545] transition-all" href="#">문의하기</a></li>
      </ul>
    </div>
    <div class="flex flex-col gap-6">
      <h5 class="font-headline-md text-sm uppercase tracking-widest text-[#4a6545]">뉴스레터</h5>
      <div class="relative">
        <input class="w-full bg-transparent border-b border-[#4a6545]/20 py-2 text-sm
                      focus:outline-none focus:border-[#4a6545] transition-colors"
               placeholder="이메일 주소를 입력하세요" type="email" id="nhj-newsletter-input"/>
        <button class="absolute right-0 bottom-0 text-[#4a6545]" onclick="NHJNewsletter.submit()">
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>
  <div class="max-w-[1440px] mx-auto px-12 py-8 border-t border-[#4a6545]/5
              flex justify-between items-center text-[#4a6545]/40 text-xs">
    <p>© 2026 Natural Harmony Journey. All rights reserved.</p>
  </div>
</footer>`;
}

/* =========================================================
   3. 장바구니 상태 관리
========================================================= */
const NHJCart = (() => {
  const KEY = 'nhj_cart';

  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function _save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    _updateBadge();
  }

  function count() {
    return _load().reduce((s, i) => s + i.qty, 0);
  }

  function _updateBadge() {
    const n = count();
    document.querySelectorAll('#nhj-cart-count').forEach(el => {
      el.textContent = n;
      el.style.display = n > 0 ? 'flex' : 'flex'; // always show
    });
  }

  function addItem(product) {
    // product: { id, name, price, priceNum, img, size }
    const items = _load();
    const existing = items.find(i => i.id === product.id && i.size === product.size);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    _save(items);
    openPopup();
  }

  function removeItem(id, size) {
    const items = _load().filter(i => !(i.id === id && i.size === size));
    _save(items);
    _renderPopupBody();
  }

  function changeQty(id, size, delta) {
    const items = _load();
    const item = items.find(i => i.id === id && i.size === size);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
      _save(items);
      _renderPopupBody();
    }
  }

  /* ---- 팝업 ---- */
  function openPopup() {
    let overlay = document.getElementById('nhj-cart-overlay');
    if (!overlay) { _createPopupDOM(); overlay = document.getElementById('nhj-cart-overlay'); }
    _renderPopupBody();
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      document.getElementById('nhj-cart-panel').style.transform = 'translateX(0)';
    });
  }

  function closePopup() {
    const panel   = document.getElementById('nhj-cart-panel');
    const overlay = document.getElementById('nhj-cart-overlay');
    if (!panel) return;
    panel.style.transform = 'translateX(100%)';
    panel.addEventListener('transitionend', function h() {
      overlay.style.display = 'none';
      panel.removeEventListener('transitionend', h);
    });
    document.body.style.overflow = '';
  }

  function _createPopupDOM() {
    const div = document.createElement('div');
    div.innerHTML = `
<div id="nhj-cart-overlay"
  role="dialog" aria-modal="true" aria-label="장바구니"
  style="display:none;position:fixed;inset:0;z-index:500;
         background:rgba(27,28,28,0.45);backdrop-filter:blur(4px);
         align-items:flex-start;justify-content:flex-end;"
  onclick="if(event.target===this) NHJCart.closePopup()">
  <div id="nhj-cart-panel"
    style="width:100%;max-width:400px;height:100vh;background:#fff;
           display:flex;flex-direction:column;
           box-shadow:-8px 0 40px rgba(74,101,69,0.15);
           transform:translateX(100%);
           transition:transform 0.32s cubic-bezier(0.4,0,0.2,1);">
    <!-- 헤더 -->
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:20px 24px 18px;border-bottom:1px solid #c3c8bd;
                background:#fff;position:sticky;top:0;z-index:1;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="material-symbols-outlined"
          style="color:#4a6545;font-size:22px;font-variation-settings:'FILL' 1,'wght' 400;">shopping_cart</span>
        <span style="font-size:17px;font-weight:700;color:#1b1c1c;letter-spacing:-0.02em;">장바구니</span>
      </div>
      <button onclick="NHJCart.closePopup()"
        style="display:flex;align-items:center;gap:4px;
               background:none;border:none;cursor:pointer;
               color:#73796f;font-family:'Pretendard',sans-serif;
               font-size:13px;font-weight:500;padding:6px 10px;border-radius:0.5rem;
               transition:background 0.18s,color 0.18s;"
        onmouseover="this.style.background='#dbe5d8';this.style.color='#4a6545'"
        onmouseout="this.style.background='none';this.style.color='#73796f'">
        <span class="material-symbols-outlined" style="font-size:18px;">arrow_back</span>
        뒤로가기
      </button>
    </div>
    <!-- 바디 -->
    <div id="nhj-cart-body" style="flex:1;overflow-y:auto;padding:0 24px;"></div>
    <!-- 푸터 -->
    <div id="nhj-cart-footer"
      style="padding:16px 24px;border-top:1px solid #c3c8bd;background:#fff;"></div>
  </div>
</div>`;
    document.body.appendChild(div.firstElementChild);
  }

  function _renderPopupBody() {
    const body   = document.getElementById('nhj-cart-body');
    const footer = document.getElementById('nhj-cart-footer');
    if (!body) return;

    const items = _load();

    if (items.length === 0) {
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;
                    justify-content:center;height:100%;padding:40px 0;text-align:center;">
          <div style="width:88px;height:88px;background:#dbe5d8;border-radius:50%;
                      display:flex;align-items:center;justify-content:center;margin-bottom:22px;">
            <span class="material-symbols-outlined"
              style="font-size:44px;color:#4a6545;font-variation-settings:'FILL' 0,'wght' 200;">shopping_cart</span>
          </div>
          <p style="font-size:16px;font-weight:700;color:#1b1c1c;margin-bottom:8px;">
            담긴 상품이 없어요</p>
          <p style="font-size:13px;color:#73796f;line-height:1.7;">
            관심있는 상품을 장바구니에 담아보세요.<br/>편리하게 한 번에 주문할 수 있어요.</p>
          <button onclick="NHJCart.closePopup()"
            style="margin-top:28px;display:inline-flex;align-items:center;gap:6px;
                   padding:12px 24px;background:#4a6545;color:#fff;border:none;
                   border-radius:0.5rem;font-family:'Pretendard',sans-serif;
                   font-size:14px;font-weight:600;cursor:pointer;">
            <span class="material-symbols-outlined" style="font-size:18px;">storefront</span>
            쇼핑 계속하기
          </button>
        </div>`;
      footer.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-size:13px;
                    color:#73796f;margin-bottom:12px;">
          <span>합계</span><span style="font-weight:700;color:#1b1c1c;">0원</span>
        </div>
        <button disabled style="width:100%;padding:14px;background:#c3c8bd;color:#73796f;
          border:none;border-radius:0.5rem;font-family:'Pretendard',sans-serif;
          font-size:15px;font-weight:600;cursor:not-allowed;">구매하기</button>`;
      return;
    }

    // 아이템 목록
    const total = items.reduce((s, i) => s + i.priceNum * i.qty, 0);
    body.innerHTML = `
      <div style="padding:16px 0;">
        ${items.map(item => `
        <div style="display:flex;gap:12px;padding:16px 0;border-bottom:1px solid #efeded;align-items:flex-start;">
          <img src="${item.img}" alt="${item.name}"
            style="width:72px;height:88px;object-fit:cover;border-radius:0.5rem;flex-shrink:0;background:#f5f3f3;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:15px;font-weight:700;color:#1b1c1c;margin-bottom:2px;
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</p>
            <p style="font-size:12px;color:#73796f;margin-bottom:8px;">${item.size}</p>
            <p style="font-size:14px;font-weight:700;color:#4a6545;">
              ${(item.priceNum * item.qty).toLocaleString()}원</p>
            <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
              <button onclick="NHJCart.changeQty(${item.id},'${item.size}',-1)"
                style="width:28px;height:28px;border:1.5px solid #c3c8bd;border-radius:0.25rem;
                       background:none;cursor:pointer;font-size:16px;color:#1b1c1c;
                       display:flex;align-items:center;justify-content:center;">−</button>
              <span style="font-size:14px;font-weight:600;min-width:20px;text-align:center;">${item.qty}</span>
              <button onclick="NHJCart.changeQty(${item.id},'${item.size}',1)"
                style="width:28px;height:28px;border:1.5px solid #c3c8bd;border-radius:0.25rem;
                       background:none;cursor:pointer;font-size:16px;color:#1b1c1c;
                       display:flex;align-items:center;justify-content:center;">+</button>
              <button onclick="NHJCart.removeItem(${item.id},'${item.size}')"
                style="margin-left:auto;background:none;border:none;cursor:pointer;
                       color:#73796f;display:flex;align-items:center;"
                title="삭제">
                <span class="material-symbols-outlined" style="font-size:18px;">close</span>
              </button>
            </div>
          </div>
        </div>`).join('')}
      </div>`;

    footer.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:14px;
                  color:#73796f;margin-bottom:6px;">
        <span>상품 합계</span>
        <span style="color:#1b1c1c;">${total.toLocaleString()}원</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:14px;
                  color:#73796f;margin-bottom:14px;">
        <span>배송비</span>
        <span style="color:#1b1c1c;">${total >= 100000 ? '무료' : '3,000원'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:16px;
                  font-weight:700;color:#1b1c1c;margin-bottom:16px;
                  padding-top:12px;border-top:1px solid #efeded;">
        <span>최종 결제금액</span>
        <span style="color:#4a6545;">${(total >= 100000 ? total : total + 3000).toLocaleString()}원</span>
      </div>
      <a href="purchase-flow.html"
        style="display:flex;align-items:center;justify-content:center;
               width:100%;padding:14px;background:#4a6545;color:#fff;
               border:none;border-radius:0.5rem;font-family:'Pretendard',sans-serif;
               font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;">
        구매하기
      </a>`;
  }

  return { count, addItem, removeItem, changeQty, openPopup, closePopup, _updateBadge };
})();

/* =========================================================
   4. 뉴스레터 더미
========================================================= */
const NHJNewsletter = {
  submit() {
    const inp = document.getElementById('nhj-newsletter-input');
    if (!inp || !inp.value.includes('@')) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    alert('구독해주셔서 감사합니다!');
    inp.value = '';
  }
};

/* =========================================================
   5. 초기화
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  _renderHeader();
  _renderFooter();
  // 배지 초기 업데이트
  requestAnimationFrame(() => NHJCart._updateBadge());
  // storage 이벤트로 다른 탭 동기화
  window.addEventListener('storage', () => NHJCart._updateBadge());
});
