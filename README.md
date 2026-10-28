# Hearth Roastery 홈페이지

주문 후 로스팅하는 원두 로스터리의 브랜드 홈페이지입니다. 결제와 정기구독은 네이버 스마트스토어로 연결합니다.

**사이트:** https://hearth-roastery.vercel.app (Vercel, `main` 브랜치에 푸시하면 자동 배포)

> 브랜드명, 원두 구성, 가격, 사업자 정보는 아직 **예시**입니다. 공개 운영 전에 실제 정보로 바꿔야 합니다.

## 구성

| 경로 | 내용 |
|---|---|
| `hearth-roastery/` | 홈페이지 (정적 HTML/CSS/JS) |
| `sheet-template/` | 원두 목록 구글 시트 양식과 사용법 |
| `plan_coffee_roastery.md` | 기획서 |

## 로컬에서 보기

```bash
python -m http.server 8080 --directory hearth-roastery
```

브라우저에서 http://localhost:8080 을 엽니다.

## 설정

`hearth-roastery/assets/js/main.js`의 `SITE` 한 곳에서 바꿉니다.

- `storeUrl`, `subscribeUrl`: 스마트스토어 주소
- `beansSheetCsv`: 원두 목록 구글 시트 CSV 주소 (`sheet-template/사용법.md` 참고)
- `formEndpoint`: 납품 문의 폼 접수 주소 (Formspree 등)
- `biz`: 사업자 정보

## 사진

로스팅 이야기와 홈의 사진은 [Unsplash](https://unsplash.com/license) 라이선스 사진입니다. 작가는 각 페이지 하단에 표기했습니다. 오픈 전 실사 촬영으로 교체할 예정입니다.
