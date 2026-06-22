#!/usr/bin/env bash
# verify.sh — 검증 센서.  위치: ~/.claude/scripts/verify.sh
# 현재 디렉터리의 프로젝트 유형을 자동 감지해 테스트/린트/타입체크를 실행한다.
# 사용법:  bash ~/.claude/scripts/verify.sh [경로]
#   - 모노레포면 각 프로젝트 루트에서 각각 실행한다.
# 종료 코드: 0 = 통과, 1 = 검증 실패, 2 = 검증 대상 없음(HARNESS GAP).

set -uo pipefail
cd "${1:-.}" || exit 2

FAIL=0
RAN=0
note() { printf '  → %s\n' "$1"; }

# ---------- Python ----------
if [ -f pyproject.toml ] || [ -f setup.py ] || [ -f requirements.txt ]; then
  printf '\n[Python]\n'
  RAN=1
  if command -v ruff >/dev/null 2>&1; then
    note "ruff check ."; ruff check . || FAIL=1
  else
    note "ruff 미설치 — 린트 센서 없음 (HARNESS GAP)"
  fi
  if command -v mypy >/dev/null 2>&1 && grep -q "tool.mypy" pyproject.toml 2>/dev/null; then
    note "mypy ."; mypy . || FAIL=1
  fi
  if command -v pytest >/dev/null 2>&1; then
    note "pytest -q"; pytest -q || FAIL=1
  else
    note "pytest 미설치 — 테스트 센서 없음 (HARNESS GAP)"
  fi
fi

# ---------- Node / Frontend ----------
if [ -f package.json ]; then
  printf '\n[Node]\n'
  RAN=1
  PM=npm
  [ -f yarn.lock ] && PM=yarn
  [ -f pnpm-lock.yaml ] && PM=pnpm
  has() { node -e "process.exit(require('./package.json').scripts?.['$1']?0:1)" 2>/dev/null; }
  for s in typecheck lint test; do
    if has "$s"; then
      note "$PM run $s"; $PM run "$s" || FAIL=1
    else
      note "package.json에 '$s' 스크립트 없음"
    fi
  done
fi

if [ "$RAN" -eq 0 ]; then
  echo "검증 대상을 찾지 못함 — 올바른 프로젝트 루트인지, 또는 새 프로젝트라면 검증 도구 세팅이 끝났는지 확인하세요. (HARNESS GAP)"
  exit 2
fi

if [ "$FAIL" -ne 0 ]; then
  printf '\n❌ 검증 실패 — 위 오류를 수정한 뒤 다시 실행하세요.\n'
  exit 1
fi
printf '\n✅ 모든 검증 통과\n'
