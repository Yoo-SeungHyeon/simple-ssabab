const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentDate = new Date();

const menuContainer = document.getElementById('menuContainer');
const currentDateEl = document.getElementById('currentDate');
const prevBtn = document.getElementById('prevDay');
const nextBtn = document.getElementById('nextDay');

function formatDate(date) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${year}.${month}.${day} (${dayOfWeek})`;
}

function toDBDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function sanitizeItems(items) {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
}

function iconSvg() {
    return `
        <svg class="notice-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M12 7.5v5.2l3.4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
}

function createNotice(title, description) {
    return `
        <section class="notice">
            ${iconSvg()}
            <p class="notice-title">${title}</p>
            <p>${description}</p>
        </section>
    `;
}

function createMenuCard(type, items) {
    const typeClass = type === 'A' ? 'menu-a' : 'menu-b';
    const title = type === 'A' ? 'A 메뉴' : 'B 메뉴';

    return `
        <section class="menu-card ${typeClass}" aria-label="${title}">
            <header class="menu-header">
                <p class="menu-title"><span class="menu-dot" aria-hidden="true"></span>${title}</p>
                <span class="menu-tag">${items.length}개</span>
            </header>
            <ul class="menu-track" role="list">
                ${items.map((item) => `<li class="menu-item">${item}</li>`).join('')}
            </ul>
        </section>
    `;
}

async function loadMenu() {
    const dateStr = toDBDate(currentDate);
    currentDateEl.textContent = formatDate(currentDate);

    if (isWeekend(currentDate)) {
        menuContainer.innerHTML = createNotice('주말에는 식단이 없습니다', '평일 식단을 확인해 주세요.');
        return;
    }

    menuContainer.innerHTML = '<div class="loading">메뉴를 불러오는 중입니다...</div>';

    try {
        const { data, error } = await supabaseClient
            .from('menus')
            .select('*')
            .eq('date', dateStr)
            .single();

        if (error || !data) {
            menuContainer.innerHTML = createNotice('등록된 메뉴가 없어요', '다른 날짜를 선택해 보세요.');
            return;
        }

        const menuA = sanitizeItems(data.menu_a);
        const menuB = sanitizeItems(data.menu_b);

        let html = '';

        if (menuA.length > 0) html += createMenuCard('A', menuA);
        if (menuB.length > 0) html += createMenuCard('B', menuB);

        menuContainer.innerHTML = html || createNotice('등록된 메뉴가 없어요', '다른 날짜를 선택해 보세요.');
    } catch (err) {
        console.error('메뉴 로드 실패:', err);
        menuContainer.innerHTML = createNotice('메뉴를 불러오지 못했어요', '잠시 후 다시 시도해 주세요.');
    }
}

function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    loadMenu();
}

prevBtn.addEventListener('click', () => changeDate(-1));
nextBtn.addEventListener('click', () => changeDate(1));

loadMenu();
