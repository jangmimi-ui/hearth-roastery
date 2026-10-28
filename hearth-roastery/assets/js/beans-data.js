/* =========================================================
   기본 원두 목록 (예시 데이터)
   - 구글 시트 주소(main.js의 SITE.beansSheetCsv)를 넣으면 시트 내용이 대신 쓰입니다.
   - 원두 구성과 가격은 예시입니다. 산지 설명(altitude, story)은
     공개 자료를 바탕으로 한 일반적인 설명이라, 실제로 들여온 생두 정보가 있으면 그걸로 바꾸세요.

   항목 설명
   id        주소에 쓰는 영문 아이디 (예: beans.html#hearth-blend)
   name      원두 이름          label   봉투에 들어갈 영문 이름
   type      'blend' 또는 'single'
   origin    산지               process 가공 방식
   altitude  재배 고도          story   산지 이야기 (상세 화면에 표시)
   roast     로스팅 정도        notes   컵노트 (최대 3개 권장)
   acidity   산미 1~5           body    바디 1~5
   price     200g 가격(원)      recipe  추천 추출
   color     봉투 색상          storeUrl 스마트스토어 상품 주소
   image     사진 주소(있으면 봉투 그림 대신 사진 표시)
   featured  홈에 소개할지      visible  목록에 보일지
   ========================================================= */
window.BEANS_DEFAULT = [
  {
    id: "hearth-blend", name: "하스 블렌드", label: "HEARTH BLEND", type: "blend",
    origin: "브라질, 콜롬비아", process: "내추럴, 워시드", altitude: "", roast: "미디엄다크",
    story: "브라질의 고소함과 단맛에 콜롬비아의 균형감을 더한 하우스 블렌드입니다. 우유와 만나도 맛이 흐려지지 않도록 미디엄다크로 볶았습니다.",
    notes: ["다크초콜릿", "캐러멜", "구운 견과"], acidity: 2, body: 4, price: 16000,
    recipe: "에스프레소, 모카포트, 라테", color: "#4e3022",
    storeUrl: "", image: "", featured: true, visible: true
  },
  {
    id: "ethiopia-yirgacheffe", name: "에티오피아 예가체프", label: "YIRGACHEFFE", type: "single",
    origin: "에티오피아 예가체프", process: "워시드", altitude: "1,700~2,200m", roast: "라이트",
    story: "에티오피아 남부의 고지대 산지로, 소농들이 기르는 토착 품종이 대부분입니다. 서늘한 고지대에서 열매가 천천히 익어 꽃향과 시트러스 산미가 선명합니다. 이 향을 살리려고 밝게 볶았습니다.",
    notes: ["자스민", "레몬", "복숭아"], acidity: 5, body: 2, price: 19000,
    recipe: "핸드드립, 콜드브루", color: "#c7923e",
    storeUrl: "", image: "", featured: true, visible: true
  },
  {
    id: "morning-blend", name: "모닝 블렌드", label: "MORNING BLEND", type: "blend",
    origin: "에티오피아, 콜롬비아", process: "워시드", altitude: "", roast: "미디엄",
    story: "에티오피아의 화사함과 콜롬비아의 단맛을 섞어, 산미가 부담스럽지 않게 만든 블렌드입니다. 아침마다 마시기 편한 균형을 목표로 했습니다.",
    notes: ["밀크초콜릿", "오렌지", "꿀"], acidity: 3, body: 3, price: 15000,
    recipe: "핸드드립, 아메리카노", color: "#8a5a3b",
    storeUrl: "", image: "", featured: false, visible: true
  },
  {
    id: "kenya-nyeri", name: "케냐 니에리", label: "NYERI", type: "single",
    origin: "케냐 니에리", process: "워시드", altitude: "1,600~2,000m", roast: "라이트미디엄",
    story: "케냐 산 남서쪽 비탈의 화산토 지대입니다. 1930년대 케냐 고지대에 맞게 개발된 SL28·SL34 품종을 주로 기르며, 블랙커런트 같은 과일 향과 또렷한 산미로 알려져 있습니다.",
    notes: ["블랙커런트", "자몽", "흑설탕"], acidity: 5, body: 3, price: 21000,
    recipe: "핸드드립", color: "#8c2f39",
    storeUrl: "", image: "", featured: false, visible: true
  },
  {
    id: "colombia-huila", name: "콜롬비아 우일라", label: "HUILA", type: "single",
    origin: "콜롬비아 우일라", process: "워시드", altitude: "1,200~2,000m", roast: "미디엄",
    story: "콜롬비아 남부에 있는, 콜롬비아에서 커피를 가장 많이 생산하는 지역입니다. 대부분 워시드로 가공해 맛이 깨끗하고, 캐러멜 같은 단맛과 밝은 산미가 함께 납니다.",
    notes: ["붉은 사과", "캐러멜", "밀크초콜릿"], acidity: 3, body: 3, price: 17000,
    recipe: "핸드드립, 에스프레소", color: "#a4502c",
    storeUrl: "", image: "", featured: false, visible: true
  },
  {
    id: "guatemala-antigua", name: "과테말라 안티구아", label: "ANTIGUA", type: "single",
    origin: "과테말라 안티구아", process: "워시드", altitude: "1,300~1,900m", roast: "미디엄",
    story: "화산으로 둘러싸인 계곡에 자리한 산지입니다. 수분을 잘 머금는 화산토 덕분에 비가 적은 기후에서도 커피가 잘 자랍니다. '안티구아 커피'는 과테말라의 원산지 명칭으로 등록되어 보호받고 있습니다.",
    notes: ["코코아", "오렌지 껍질", "은은한 스모키"], acidity: 3, body: 4, price: 17000,
    recipe: "핸드드립, 모카포트", color: "#6b4f3a",
    storeUrl: "", image: "", featured: false, visible: true
  },
  {
    id: "brazil-cerrado", name: "브라질 세하도", label: "CERRADO", type: "single",
    origin: "브라질 세하도 미네이루", process: "내추럴", altitude: "800~1,300m", roast: "미디엄다크",
    story: "브라질 미나스제라이스주의 고원 지대로, 브라질 커피 산지 가운데 처음으로 원산지 명칭을 받았습니다. 땅이 평평해 기계로 수확하는 농장이 많고, 내추럴 가공으로 초콜릿과 견과류 같은 고소한 맛이 납니다.",
    notes: ["땅콩", "초콜릿", "흑설탕"], acidity: 1, body: 4, price: 14000,
    recipe: "에스프레소, 라테, 콜드브루", color: "#3f342c",
    storeUrl: "", image: "", featured: false, visible: true
  },
  {
    id: "decaf-colombia", name: "디카페인 콜롬비아", label: "DECAF", type: "single",
    origin: "콜롬비아", process: "슈가케인 디카페인", altitude: "", roast: "미디엄",
    story: "사탕수수를 발효해 얻은 에틸 아세테이트로 카페인을 녹여 내는 방식입니다. 생두를 증기로 불린 뒤 용액에 담그기를 반복해 카페인 대부분(보통 97% 이상)을 빼고, 다시 씻고 말려서 볶습니다.",
    notes: ["캐러멜", "자두", "코코아"], acidity: 2, body: 3, price: 18000,
    recipe: "핸드드립, 라테", color: "#3e4a40",
    storeUrl: "", image: "", featured: false, visible: true
  }
];
