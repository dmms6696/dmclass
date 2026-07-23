# 우리 반 한눈에

세로형 아이패드를 교실 화이트보드에 고정해 사용하는 학급 키오스크 PWA입니다. 디데이, 오늘의 알림, 학사 일정, 포인트 순위만 보여 주며 Google Sheets 전체를 공개하지 않고 Apps Script 웹앱이 필요한 데이터만 반환합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

로컬에서 실제 시트 데이터를 보려면 `.env.example`을 참고해 `.env`를 만들고 아래 값을 넣습니다.

```env
VITE_KIOSK_API_URL=https://script.google.com/macros/s/배포ID/exec
```

## Google Apps Script 설치

1. [Google Apps Script](https://script.google.com/)에서 새 프로젝트를 만듭니다.
2. `apps-script/Code.gs` 내용을 `Code.gs`에 붙여 넣습니다.
3. 프로젝트 설정에서 `appsscript.json` 표시를 켠 뒤 `apps-script/appsscript.json` 내용으로 교체합니다.
4. 함수 목록에서 `setupKioskSpreadsheet()`를 선택하고 실행합니다.
5. 권한 승인 화면이 나오면 본인 계정으로 승인합니다.
6. 키오스크 정보용 스프레드시트에 `디데이`, `오늘의알림`, `학사일정` 탭과 예시 데이터가 만들어졌는지 확인합니다.
7. 이후 시트 상단 메뉴의 `학급 키오스크 → 시트 초기 구성`으로 다시 실행할 수 있습니다.

## Apps Script 웹앱 배포

1. Apps Script에서 `배포 → 새 배포`를 누릅니다.
2. 유형은 `웹 앱`을 선택합니다.
3. 실행 사용자는 `나`로 설정합니다.
4. 접근 권한은 학교 계정 정책에 맞게 설정합니다. GitHub Pages에서 불러와야 하므로 보통 `모든 사용자` 또는 `링크가 있는 모든 사용자`가 필요합니다.
5. 배포를 누르고 `/exec`로 끝나는 웹앱 URL을 복사합니다.
6. 브라우저에서 URL을 열었을 때 `{ "ok": true ... }` 형태의 JSON이 나오면 정상입니다.

## GitHub Pages 배포

1. GitHub 저장소 `dmms6696/dmclass`에 이 프로젝트를 올립니다.
2. 저장소 `Settings → Secrets and variables → Actions → Variables`에서 `VITE_KIOSK_API_URL`을 만들고 Apps Script 웹앱 URL을 넣습니다. Secret으로 넣어도 워크플로에서 읽을 수 있습니다.
3. `Settings → Pages`에서 Source를 `GitHub Actions`로 선택합니다.
4. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 `npm ci`, `npm run lint`, `npm test`, `npm run build`를 실행하고 `dist`를 Pages에 배포합니다.

## 아이패드 PWA 설치

1. 아이패드 Safari에서 GitHub Pages 주소를 엽니다.
2. 공유 버튼을 누르고 `홈 화면에 추가`를 선택합니다.
3. 홈 화면의 `학급 키오스크` 아이콘으로 실행합니다.
4. 설정 앱에서 `손쉬운 사용 → 사용법 유도`를 켭니다.
5. 앱 실행 후 전원 버튼 또는 홈 버튼을 세 번 눌러 사용법 유도를 시작합니다.
6. 수업 중 화면이 꺼지지 않도록 `디스플레이 및 밝기 → 자동 잠금`을 끄거나 길게 설정합니다.

## 시트 수정이 반영되지 않을 때

- Apps Script 웹앱 URL이 `VITE_KIOSK_API_URL`에 정확히 들어갔는지 확인합니다.
- 웹앱을 수정했다면 `새 배포` 또는 기존 배포의 새 버전을 만들었는지 확인합니다.
- 시트의 `사용` 값이 `Y`인지 확인합니다.
- 날짜 셀이 실제 날짜 형식인지 확인합니다.
- 앱은 1분마다 새 데이터를 가져오며 Apps Script 응답은 약 45초 동안 캐시됩니다.

## 보안 주의

- Google Sheets 전체를 웹에 게시하지 마세요.
- 포인트 시트를 공개 공유하지 마세요.
- 서비스 계정 JSON, Google 인증 토큰, API 키를 저장소에 넣지 마세요.
- `password_code`는 Apps Script 응답에 포함되지 않습니다.
- 학생 이름은 기본값으로 가운데 글자가 `○`로 가려집니다. 전체 이름이 필요할 때만 `apps-script/Code.gs` 상단의 `STUDENT_NAME_MODE`를 `FULL`로 바꾸세요.

## 주요 파일

- `src/`: React, TypeScript PWA 화면
- `public/manifest.webmanifest`: PWA 설치 설정
- `public/sw.js`: 앱 셸 오프라인 캐시
- `apps-script/`: Google Apps Script API와 시트 초기 구성
- `.github/workflows/deploy.yml`: GitHub Pages 자동 배포
