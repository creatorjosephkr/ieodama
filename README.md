# 이어담아 (ieodama)

여러 장의 이미지를 세로로 깔끔하게 이어 붙여 하나의 이미지로 저장하는 크로스 플랫폼 데스크톱 앱입니다.  
오픈마켓·쇼핑몰 상세설명 페이지처럼 세로로 긴 이미지를 손쉽게 제작할 때 유용합니다.

---

## 주요 기능

- **다양한 이미지 추가 방식**: 슬롯 클릭 다중 선택, 미리보기/슬롯 드래그 앤 드롭, 특정 슬롯 위치 끼워넣기, `Shift + 드롭` 또는 더블클릭으로 개별 교체
- **폭넓은 포맷 지원**: JPG, PNG, GIF, WebP, BMP, TIFF, HEIC/HEIF, AVIF, SVG 입력 지원
- **EXIF 회전 자동 보정**: 스마트폰 세로 사진 등의 EXIF Orientation 정보를 반영해 미리보기와 동일한 방향으로 결합
- **직관적인 순서 변경 및 관리**: 드래그 핸들 이동, 키보드 `↑`/`↓` 순서 변경, `Delete`/`Backspace` 또는 삭제 버튼 제거, 전체 초기화
- **실시간 미리보기**: 확대/축소, `100%`, `가로 Fit`, `세로 Fit`, 마우스 드래그 패닝, 미리보기·슬롯 선택 연동 및 자동 스크롤
- **유연한 내보내기**: 출력 가로 너비(px) 지정, 예상 결과 해상도 실시간 확인, JPG(품질 1–100) / PNG(투명 배경 유지) 저장
- **개발자 후원 안내**: 상단 헤더의 후원 아이콘 버튼 클릭 시 카카오뱅크 QR / PayPal 후원 안내 모달 제공
- **크로스 플랫폼**: macOS (Apple Silicon / Intel) 및 Windows (x64) 지원

---

## 설치 방법

[GitHub Releases](https://github.com/creatorjosephkr/ieodama/releases/latest) 페이지에서 사용 중인 운영체제와 CPU 아키텍처에 맞는 설치파일을 다운로드해 설치하세요.

| 운영체제 | 아키텍처 | 설치파일 |
| --- | --- | --- |
| **macOS** | Apple Silicon (M1/M2/M3/M4 등) | `ieodama-v1.0.0-mac-arm64.dmg` |
| **macOS** | Intel | `ieodama-v1.0.0-mac-x64.dmg` |
| **Windows** | 64-bit (`x64`) | `ieodama-v1.0.0-win-x64-setup.exe` |

### macOS 설치 및 실행 안내

1. 다운로드한 `.dmg` 파일을 더블클릭해 엽니다.
2. `ieodama` 앱 아이콘을 `Applications` 폴더로 드래그해 복사합니다.
3. 앱이 코드 서명되지 않아 첫 실행 시 보안 경고가 나타날 수 있습니다. 아래 방법 중 하나로 실행을 허용할 수 있습니다.
   - Finder의 `응용 프로그램` 폴더에서 `ieodama`를 **우클릭(Control + 클릭) → 열기** 선택
   - **시스템 설정 → 개인정보 보호 및 보안**에서 `확인 없이 열기` 클릭
   - 또는 터미널에서 격리 속성 제거:
     ```bash
     xattr -cr /Applications/ieodama.app
     ```

### Windows 설치 및 실행 안내

1. `ieodama-v1.0.0-win-x64-setup.exe` 파일을 실행합니다.
2. Windows SmartScreen 경고가 표시되면 **추가 정보 → 실행**을 클릭합니다.
3. 설치 마법사의 안내에 따라 설치 경로와 바로가기 옵션을 선택하고 설치를 완료합니다.

---

## 기본 사용 방법

1. **이미지 추가**
   - 오른쪽 패널의 빈 슬롯(`이미지 추가` 또는 `클릭 또는 드래그`)을 클릭해 여러 이미지를 선택합니다.
   - 또는 파일 탐색기/Finder에서 이미지를 왼쪽 미리보기 영역이나 오른쪽 슬롯으로 드래그 앤 드롭합니다.
   - 이미 채워진 슬롯 위에 드롭하면 해당 위치 앞에 끼워 넣어지며, `Shift` 키를 누른 채 드롭하거나 슬롯을 더블클릭하면 해당 슬롯의 이미지를 교체합니다.
2. **순서 변경 및 삭제**
   - 이미지 슬롯 좌측 상단의 이동 핸들을 위아래로 드래그해 순서를 바꿉니다.
   - 슬롯을 클릭해 선택한 상태에서 키보드 `↑` / `↓` 키로 순서를 이동하거나 `Delete` / `Backspace` 키(또는 우측 상단 `×` 버튼)로 삭제할 수 있습니다.
   - 상단의 **새로시작** 버튼을 누르면 모든 이미지를 비우고 처음부터 다시 시작할 수 있습니다.
3. **실시간 미리보기**
   - 왼쪽 미리보기 패널 상단에서 **확대 / 축소 / 100% / 가로 Fit / 세로 Fit**을 전환할 수 있습니다.
   - 이미지가 화면보다 클 때는 마우스로 드래그하여 화면을 이동(패닝)할 수 있으며, 이미지 클릭 시 오른쪽 슬롯과 선택 상태가 연동됩니다.
4. **이미지 내보내기**
   - 상단의 **내보내기** 버튼을 클릭합니다.
   - 원하는 **가로 너비(px)**를 입력하면 결합 후 예상 결과 크기(`가로 × 세로 px`)를 바로 확인할 수 있습니다.
   - 파일 형식(**JPEG** 또는 **PNG**)과 JPEG 품질(1–100)을 선택한 뒤 **내보내기**를 눌러 저장 위치를 지정합니다.
     - JPEG 형식은 최대 65,500px까지 지원하며, 그보다 긴 이미지는 PNG 형식으로 저장해야 합니다.
5. **개발자 후원**
   - 상단 헤더의 **종료** 버튼 왼쪽에 있는 후원 아이콘을 클릭하면 카카오뱅크 QR 코드 및 PayPal 후원 안내 창이 열립니다.

---

## 개발 환경 및 직접 빌드

### 요구사항

- Node.js 20.9 이상 (`sharp` 지원 버전)
- npm

### 의존성 설치 및 개발 실행

```bash
npm install
npm run dev
```

### 정적 검사 및 컴파일

```bash
npm run lint     # oxlint 검사 (src, electron, scripts)
npm run compile  # TypeScript 검사(tsc -b) + Vite 프로덕션 번들링
```

### 설치파일 빌드

타겟 플랫폼별 `@img/sharp-*` 네이티브 바이너리가 `scripts/beforePack.cjs`를 통해 자동으로 준비되며, 빌드 결과물은 `release/` 폴더에 생성됩니다.

```bash
npm run build:mac:arm    # macOS Apple Silicon (arm64) DMG
npm run build:mac:intel  # macOS Intel (x64) DMG
npm run build:mac:all    # macOS arm64 + x64 DMG 모두 빌드
npm run build:win        # Windows x64 NSIS 설치파일 (.exe)
npm run build:all        # macOS (arm64/x64) + Windows (x64) 전체 빌드
```

---

## 프로젝트 구조

```text
ieodama/
├── build/                      # 앱 아이콘 및 DMG 배경 리소스
├── electron/                   # Electron 메인/프리로드 프로세스
│   ├── main.ts                 # 윈도우 생성, 커스텀 프로토콜, IPC 핸들러
│   ├── preload.ts              # Renderer 보안 브릿지
│   └── imageProcessor.ts       # Sharp + HEIC 기반 이미지 결합 엔진
├── scripts/                    # electron-builder 크로스 플랫폼 sharp 패키징 훅
│   ├── sharpPrebuilt.cjs
│   ├── beforePack.cjs
│   └── afterPack.cjs
├── spon/                       # 후원 버튼 아이콘 및 안내 이미지
├── src/
│   ├── components/             # UI 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Preview.tsx
│   │   ├── ImageSlot.tsx
│   │   ├── SlotList.tsx
│   │   ├── ExportDialog.tsx
│   │   └── SponsorDialog.tsx
│   ├── hooks/
│   │   └── useImageList.ts
│   ├── styles/
│   │   └── global.css
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── imageFiles.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tsconfig.electron.json
└── vite.config.ts
```

---

## 라이선스

누구나 자유롭게 무료로 이용할 수 있습니다. 
출처만 남겨주세요. 
Copyright © 2026 CREATOR JOSEPH (creatorjoseph@kakao.com)
