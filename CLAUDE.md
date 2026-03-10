# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ninewatt(나인와트) 회사 공식 홈페이지. Next.js 16 (App Router) + TailwindCSS 4 + TypeScript 기반.

## Commands

- `pnpm dev` — 개발 서버 실행 (http://localhost:3000)
- `pnpm build` — 프로덕션 빌드
- `pnpm start` — 프로덕션 서버 실행
- `pnpm lint` — ESLint 실행
- **패키지 매니저**: pnpm

## Architecture

- **App Router**: `src/app/` 디렉토리 사용. `layout.tsx`(루트 레이아웃), `page.tsx`(페이지), `globals.css`(글로벌 스타일)
- **Components**: `src/components/` — 공통 컴포넌트 (Header, Footer 등)
- **Path alias**: `@/*` → `./src/*`
- **Language**: 한국어 홈페이지 (`<html lang="ko">`)
- **Styling**: TailwindCSS 4 (PostCSS 플러그인 방식, `@import "tailwindcss"`)
- **Fonts**: Geist Sans / Geist Mono (next/font/google)
