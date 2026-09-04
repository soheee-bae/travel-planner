-- Phase 10: mocks/fixtures/*.ts의 Zod 스키마와 1:1로 대응하는 실 스키마.
-- 이 파일들은 실제 Supabase 프로젝트에 적용해본 적이 없다 — 검토·리뷰 후 신중히 적용할 것.

create extension if not exists "pgcrypto"; -- gen_random_uuid()

create type place_category as enum ('관광', '맛집', '카페', '쇼핑', '액티비티', '기타');
create type place_priority as enum ('필수', '가능하면', '시간되면');

create type transport_type as enum ('비행기', 'KTX', '버스', '렌터카', '페리');

create type expense_category as enum (
  '식비', '숙소', '교통', '관광·입장', '쇼핑', '항공', '통신', '액티비티', '기타'
);
create type payment_method as enum ('현금', '카드', '선불');
