# Google Apps Script 설치 안내

1. Apps Script 새 프로젝트를 만듭니다.
2. `Code.gs` 내용을 Apps Script 편집기의 `Code.gs`에 붙여 넣습니다.
3. 프로젝트 설정에서 `appsscript.json` 표시를 켠 뒤, 이 폴더의 `appsscript.json` 내용으로 바꿉니다.
4. `setupKioskSpreadsheet()` 함수를 선택하고 실행합니다.
5. 권한 승인 화면에서 본인 계정으로 승인합니다.
6. 배포 > 새 배포 > 웹 앱을 선택합니다.
7. 실행 사용자는 `나`, 액세스 권한은 학교 정책에 맞게 `모든 사용자` 또는 `링크가 있는 모든 사용자`로 설정합니다.
8. 배포 후 `/exec`로 끝나는 웹앱 URL을 복사해 프런트엔드의 `VITE_KIOSK_API_URL` 값으로 사용합니다.

포인트 순위 응답에는 `number`, `name`, `active`, `total_points`, `rank`를 바탕으로 만든 `rank`, `displayName`, `totalPoints`만 포함됩니다. `password_code`와 아바타 관련 열은 API 응답에 넣지 않습니다.
