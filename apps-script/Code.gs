/* =========================================================
   Hearth Roastery — 납품 문의 접수 (Google Apps Script)

   홈페이지의 납품 문의 폼이 이 웹 앱으로 전송되면
   1) 입력값과 스팸 여부를 검사하고
   2) 이 스프레드시트의 '문의' 탭에 한 줄 추가한 뒤
   3) 스크립트 소유 계정 메일로 알림을 보냅니다.

   처음 한 번: 편집기에서 setup 함수를 실행해 권한을 허용하세요.
   (문의 탭과 '1년 지난 문의 자동 삭제' 트리거를 만듭니다.)
   ========================================================= */

var CONFIG = {
  SHEET_NAME: '문의',
  HEADERS: ['접수일시', '상호명', '담당자', '연락처', '이메일', '업종', '월 예상 사용량', '문의 내용', '처리 상태'],
  RETENTION_DAYS: 365,          // 동의 문구의 '문의 처리 후 1년 보관'과 맞춤
  MIN_FILL_SECONDS: 3,          // 폼을 연 뒤 이보다 빨리 보내면 자동 프로그램으로 판단
  SAME_PHONE_COOLDOWN_SEC: 60,  // 같은 연락처로 연속 전송 차단
  MAX_PER_MINUTE: 20,           // 전체 접수 상한 (분당)
  TYPES: ['카페', '사무실', '음식점·베이커리', '기타'],
  VOLUMES: ['', '5kg 미만', '5~20kg', '20~50kg', '50kg 이상', '잘 모르겠음'],
  MAX_LEN: { company: 100, name: 50, phone: 20, email: 100, message: 2000 }
};

/* ---------- 웹 앱 진입점 ---------- */

function doPost(e) {
  ensureTrigger_();
  var p = (e && e.parameter) || {};

  // 숨은 함정 칸이 채워졌거나 너무 빨리 전송됐으면 저장하지 않되, 봇에게는 성공처럼 응답합니다.
  if (isBot_(p)) return json_({ ok: true });

  var check = validate_(p);
  if (!check.ok) return json_({ ok: false, error: check.error });
  var data = check.data;

  if (isRateLimited_(data.phone)) return json_({ ok: false, error: 'rate_limited' });

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var sheet = getSheet_();
    sheet.appendRow([
      new Date(), data.company, data.name, data.phone, data.email,
      data.type, data.volume, data.message, '신규'
    ].map(safeCell_));
  } catch (err) {
    console.error('시트 저장 실패: ' + err);
    return json_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }

  // 메일이 실패해도 문의는 이미 저장됐으므로 성공으로 응답합니다.
  try {
    notify_(data);
  } catch (err) {
    console.error('알림 메일 실패: ' + err);
  }
  return json_({ ok: true });
}

// 브라우저에서 웹 앱 주소를 열었을 때 작동 여부만 보여 줍니다 (데이터는 노출하지 않음).
function doGet() {
  ensureTrigger_();
  getSheet_();
  return json_({ ok: true, service: 'hearth-roastery-inquiry' });
}

/* ---------- 준비: 문의 탭과 자동 삭제 트리거 ---------- */

// 웹 앱 주소를 처음 열 때(doGet)나 첫 문의 때 자동으로 실행되므로 따로 실행하지 않아도 됩니다.
// 편집기에서 직접 실행해도 됩니다.
function setup() {
  getSheet_();
  installTrigger_();
  console.log('준비 완료: 문의 탭과 매일 새벽 4시 자동 삭제 트리거를 만들었습니다. 알림 메일: ' + notifyAddress_());
}

function ensureTrigger_() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('PURGE_TRIGGER') === 'on') return;
  try {
    installTrigger_();
    props.setProperty('PURGE_TRIGGER', 'on');
  } catch (err) {
    console.error('자동 삭제 트리거 설치 실패: ' + err);
  }
}

function installTrigger_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'purgeOldInquiries') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('purgeOldInquiries').timeBased().everyDays(1).atHour(4).create();
}

/* ---------- 보관 기간 지난 문의 삭제 (매일 트리거) ---------- */

function purgeOldInquiries() {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return;
  var cutoff = new Date(Date.now() - CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000);
  var dates = sheet.getRange(2, 1, last - 1, 1).getValues();
  var removed = 0;
  // 아래에서 위로 지워야 줄 번호가 밀리지 않습니다.
  for (var i = dates.length - 1; i >= 0; i--) {
    var d = dates[i][0];
    if (d instanceof Date && d < cutoff) {
      sheet.deleteRow(i + 2);
      removed++;
    }
  }
  if (removed) console.log('보관 기간이 지난 문의 ' + removed + '건을 삭제했습니다.');
}

/* ---------- 검사 ---------- */

function isBot_(p) {
  if (p.website) return true;                       // 사람에게는 보이지 않는 칸
  var started = Number(p._t);
  if (!started) return true;                        // 폼을 거치지 않은 전송
  var elapsed = (Date.now() - started) / 1000;
  return elapsed < CONFIG.MIN_FILL_SECONDS || elapsed > 60 * 60 * 24;
}

function validate_(p) {
  var d = {
    company: clean_(p.company, CONFIG.MAX_LEN.company),
    name: clean_(p.name, CONFIG.MAX_LEN.name),
    phone: clean_(p.phone, CONFIG.MAX_LEN.phone),
    email: clean_(p.email, CONFIG.MAX_LEN.email),
    type: clean_(p.type, 30),
    volume: clean_(p.volume, 30),
    message: clean_(p.message, CONFIG.MAX_LEN.message, true)
  };
  if (!d.company || !d.name || !d.phone || !d.type) return { ok: false, error: 'missing' };
  if (p.consent !== 'on') return { ok: false, error: 'consent' };
  var digits = d.phone.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 12) return { ok: false, error: 'phone' };
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return { ok: false, error: 'email' };
  if (CONFIG.TYPES.indexOf(d.type) < 0) return { ok: false, error: 'type' };
  if (CONFIG.VOLUMES.indexOf(d.volume) < 0) d.volume = '';
  return { ok: true, data: d };
}

function isRateLimited_(phone) {
  var cache = CacheService.getScriptCache();
  var phoneKey = 'phone:' + phone.replace(/\D/g, '');
  if (cache.get(phoneKey)) return true;
  var minuteKey = 'count:' + Math.floor(Date.now() / 60000);
  var count = Number(cache.get(minuteKey) || 0);
  if (count >= CONFIG.MAX_PER_MINUTE) return true;
  cache.put(minuteKey, String(count + 1), 120);
  cache.put(phoneKey, '1', CONFIG.SAME_PHONE_COOLDOWN_SEC);
  return false;
}

/* ---------- 도우미 ---------- */

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow(CONFIG.HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setFontWeight('bold');
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
  }
  return sheet;
}

function notify_(d) {
  var to = notifyAddress_();
  if (!to) return;
  var url = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  var body = [
    '홈페이지로 새 납품 문의가 들어왔습니다.',
    '',
    '상호명: ' + d.company,
    '담당자: ' + d.name,
    '연락처: ' + d.phone,
    '이메일: ' + (d.email || '-'),
    '업종: ' + d.type,
    '월 예상 사용량: ' + (d.volume || '-'),
    '',
    '문의 내용:',
    d.message || '-',
    '',
    '전체 문의 보기: ' + url
  ].join('\n');
  var mail = {
    to: to,
    subject: '[납품 문의] ' + d.company + ' · ' + d.name,
    body: body,
    name: 'Hearth Roastery 홈페이지'
  };
  if (d.email) mail.replyTo = d.email;   // 메일에서 바로 '답장'하면 문의자에게 갑니다
  MailApp.sendEmail(mail);
}

// 기본은 스크립트 소유 계정. 다른 주소로 받으려면 프로젝트 설정 > 스크립트 속성에 NOTIFY_EMAIL을 추가하세요.
function notifyAddress_() {
  var custom = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  return custom || Session.getEffectiveUser().getEmail();
}

function clean_(v, max, multiline) {
  var s = String(v == null ? '' : v);
  s = multiline ? s.replace(/\r\n?/g, '\n') : s.replace(/\s+/g, ' ');
  return s.trim().slice(0, max);
}

// 시트가 입력값을 수식으로 실행하지 않도록 =, +, -, @ 로 시작하는 값 앞에 ' 를 붙입니다.
function safeCell_(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
