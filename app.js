// Supabase 클라이언트 초기화
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 현재 표시 중인 날짜
let currentDate = new Date();

// DOM 요소
const menuContainer = document.getElementById('menuContainer');
const currentDateEl = document.getElementById('currentDate');
const prevBtn = document.getElementById('prevDay');
const nextBtn = document.getElementById('nextDay');

// 날짜 포맷팅
function formatDate(date) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${year}.${month}.${day} (${dayOfWeek})`;
}

// DB용 날짜 포맷 (YYYY-MM-DD)
function toDBDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 주말 체크
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

// 메뉴 카드 생성
function createMenuCard(type, items) {
    const typeLabel = type === 'A' ? 'A 메뉴' : 'B 메뉴';
    const typeClass = type === 'A' ? 'menu-a' : 'menu-b';

    return `
        <div class="menu-card ${typeClass}">
            <div class="menu-header">
                <span class="menu-badge">${typeLabel}</span>
            </div>
            <div class="menu-items">
                ${items.map(item => `<div class="menu-item">${item}</div>`).join('')}
            </div>
        </div>
    `;
}

// 메뉴 불러오기
async function loadMenu() {
    const dateStr = toDBDate(currentDate);
    currentDateEl.textContent = formatDate(currentDate);

    // 주말 체크
    if (isWeekend(currentDate)) {
        menuContainer.innerHTML = `
            <div class="weekend">
                <div class="weekend-icon">🌴</div>
                <p>주말에는 식사가 제공되지 않습니다</p>
            </div>
        `;
        return;
    }

    menuContainer.innerHTML = '<div class="loading">메뉴를 불러오는 중...</div>';

    try {
        const { data, error } = await supabaseClient
            .from('menus')
            .select('*')
            .eq('date', dateStr)
            .single();

        if (error || !data) {
            menuContainer.innerHTML = `
                <div class="no-menu">
                    <div class="no-menu-icon">🍽️</div>
                    <p>등록된 메뉴가 없습니다</p>
                </div>
            `;
            return;
        }

        let html = '';

        // A 메뉴
        if (data.menu_a && data.menu_a.length > 0) {
            html += createMenuCard('A', data.menu_a);
        }

        // B 메뉴
        if (data.menu_b && data.menu_b.length > 0) {
            html += createMenuCard('B', data.menu_b);
        }

        if (html === '') {
            menuContainer.innerHTML = `
                <div class="no-menu">
                    <div class="no-menu-icon">🍽️</div>
                    <p>등록된 메뉴가 없습니다</p>
                </div>
            `;
        } else {
            menuContainer.innerHTML = html;
        }

    } catch (err) {
        console.error('메뉴 로드 실패:', err);
        menuContainer.innerHTML = `
            <div class="no-menu">
                <div class="no-menu-icon">⚠️</div>
                <p>메뉴를 불러올 수 없습니다</p>
            </div>
        `;
    }
}

// 날짜 이동
function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    loadMenu();
}

// 이벤트 리스너
prevBtn.addEventListener('click', () => changeDate(-1));
nextBtn.addEventListener('click', () => changeDate(1));

// 초기 로드
loadMenu();
