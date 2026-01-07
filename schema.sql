-- Supabase 테이블 생성 SQL
-- Supabase Dashboard > SQL Editor에서 실행하세요

CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    menu_a TEXT[] NOT NULL DEFAULT '{}',
    menu_b TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS(Row Level Security) 활성화
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- 읽기만 허용 (anon key로 SELECT 가능)
CREATE POLICY "Public read access" ON menus
    FOR SELECT USING (true);

-- 쓰기는 정책 없음 = anon key로 불가
-- 대시보드에서는 service_role을 사용하므로 RLS 우회됨
