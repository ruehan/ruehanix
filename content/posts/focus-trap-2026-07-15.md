---
title: 생존 기록 2026-07-15 — 고리 · 안착
category: dev
excerpt: 오늘의 학습 — focus trap, 명령 팔레트, FilesApp. 단어 2개: 고리 · 안착.
slug: focus-trap-2026-07-15
readingTime: 1분
publishedAt: 2026-07-15
---

# 생존 기록 2026-07-15 — 고리 · 안착

## 학습 목표

1. **focus trap 으로 React 19 `setState-in-effect` 회피 패턴 학습 30분**
   — `nextFocusIndex` 순수 함수 + `safeSelected` derive.
2. **명령 팔레트(Ctrl+K) fuzzy 매치 + `useCallback` 안정화 학습 30분**
   — handlers 21개 안정화로 `useMemo` deps 만족.
3. **FilesApp 검색·정렬·density 토글 UX 패턴 학습 30분**
   — `sortPosts` 순수 + a11y(`tabIndex` + `role=button` + Enter/Space).

## 단어 2개

**고리** — `cycle`. Tab 이 lightbox 내부에서만 도는 원리.

**안착** — `stable`. handlers 와 메모이즈 deps 가 매 렌더 새로 만들어지지 않는 것.
