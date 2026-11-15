# 일회용품 발자국 QR 설문

## 구성
- `index.html` : 청중 폰 화면 (입력 → 제출 완료 대기 → 공개 후 내 결과)
- `screen.html` : 발표용 큰 화면 (QR, 실시간 합계, 결과 공개 버튼, 예시 데이터 백업)
- `calc.js` : 계산식과 수치 (임시값. 근거 자료로 교체하는 곳)
- `firebase-config.js` : Firebase 설정 붙여넣는 곳
- `db.js` : 저장소 (Firebase / 로컬 테스트 모드 자동 전환)

## 지금 바로 테스트 (Firebase 없이)
`screen.html`과 `index.html`을 같은 브라우저의 탭 두 개로 열면 로컬 테스트 모드로 실시간 연동됩니다.
(파일을 더블클릭해서 열어도 되지만, QR/모바일 테스트는 배포 후에 하세요.)

## Firebase 설정 (약 10분)
1. https://console.firebase.google.com 에서 프로젝트 만들기 (애널리틱스는 꺼도 됨)
2. 빌드 → Realtime Database → 데이터베이스 만들기 (테스트 모드로 시작)
3. 프로젝트 설정 → 내 앱 → 웹 앱(`</>`) 추가 → 나온 `firebaseConfig` 값을 `firebase-config.js`에 붙여넣기
4. Realtime Database → 규칙 탭에 아래를 붙여넣고 게시:

```json
{
  "rules": {
    "responses": {
      ".read": true,
      "$id": {
        ".write": "!data.exists()",
        ".validate": "newData.hasChildren(['cups','containers','bags','straws','ts'])",
        "cups":       { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 50" },
        "containers": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 50" },
        "bags":       { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 50" },
        "straws":     { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 50" }
      }
    },
    "state": { ".read": true, ".write": true }
  }
}
```

> 한계: `state/revealed`(결과 공개 스위치)는 누구나 쓸 수 있는 상태입니다. 수업 발표 정도면 충분하지만, 장난으로 누르는 사람이 걱정되면 Firebase Authentication으로 발표자만 쓰게 바꿀 수 있어요.

## 배포 (GitHub Pages)
1. GitHub에 저장소를 만들고 이 폴더의 파일을 올리기
2. Settings → Pages → Branch: main / root → 저장
3. 나온 주소 `https://<아이디>.github.io/<저장소>/screen.html` 을 발표 노트북에서 열면
   화면 오른쪽 위에 `index.html`로 가는 QR이 자동으로 표시됩니다.

## 발표 전 체크리스트
- [ ] 폰 2~3대로 동시에 제출 → 큰 화면 합계가 바로 올라가는지
- [ ] "결과 공개 ▶" 누르면 폰에 내 결과가 뜨는지
- [ ] 테스트 응답 지우기: 큰 화면의 "전체 초기화"
- [ ] 발표 강의실에서 와이파이/데이터로 QR 접속되는지
- [ ] 실패 대비: "예시 데이터(백업)" 버튼으로 가짜 30명 데이터 확인
- [ ] `calc.js`의 임시값을 근거 수치로 교체하고 `PLACEHOLDER = false`로 변경
