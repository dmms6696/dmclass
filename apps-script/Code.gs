const KIOSK_SPREADSHEET_ID = '18slLM4XjMQ1p5cBs9etWSWZ5BtKWk_Zap13yZ_85ftk';
const POINT_SPREADSHEET_ID = '1I3sSPK4IKvlG_0IbMKriqavUOIhAVMkPo3r55SWWwcE';
const TIMEZONE = 'Asia/Seoul';
const LOCALE = 'ko_KR';
const CACHE_SECONDS = 45;

const SHEETS = {
  dday: '디데이',
  notices: '오늘의알림',
  events: '학사일정',
  students: 'Students',
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('학급 키오스크')
    .addItem('시트 초기 구성', 'setupKioskSpreadsheet')
    .addToUi();
}

function setupKioskSpreadsheet() {
  const spreadsheet = SpreadsheetApp.openById(KIOSK_SPREADSHEET_ID);
  spreadsheet.setSpreadsheetTimeZone(TIMEZONE);
  spreadsheet.setSpreadsheetLocale(LOCALE);

  const ddaySheet = ensureDdaySheet_(spreadsheet);
  const noticeSheet = ensureSheet_(spreadsheet, SHEETS.notices);
  const eventSheet = ensureSheet_(spreadsheet, SHEETS.events);

  configureDdaySheet_(ddaySheet);
  configureNoticeSheet_(noticeSheet);
  configureEventSheet_(eventSheet);

  SpreadsheetApp.getUi().alert('학급 키오스크 시트 초기 구성이 완료되었습니다.');
}

function doGet(e) {
  const callback = e && e.parameter ? String(e.parameter.callback || '') : '';
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('kiosk-api-v1');
    const payload = cached ? JSON.parse(cached) : buildKioskPayload_();

    if (!cached) {
      cache.put('kiosk-api-v1', JSON.stringify(payload), CACHE_SECONDS);
    }

    return createResponse_(payload, callback);
  } catch (error) {
    return createResponse_(
      { ok: false, message: '정보를 불러오지 못했어요. Apps Script 권한과 시트 이름을 확인해 주세요.' },
      callback,
    );
  }
}

function buildKioskPayload_() {
  const today = getTodayKey_();
  const kioskSpreadsheet = SpreadsheetApp.openById(KIOSK_SPREADSHEET_ID);
  const pointSpreadsheet = SpreadsheetApp.openById(POINT_SPREADSHEET_ID);

  return {
    ok: true,
    generatedAt: formatNowIso_(),
    timezone: TIMEZONE,
    dday: readDday_(kioskSpreadsheet, today),
    notices: readNotices_(kioskSpreadsheet, today),
    academicEvents: readAcademicEvents_(kioskSpreadsheet),
    pointRanking: readPointRanking_(pointSpreadsheet),
  };
}

function ensureDdaySheet_(spreadsheet) {
  const existingDday = spreadsheet.getSheetByName(SHEETS.dday);
  if (existingDday) {
    return existingDday;
  }

  const firstSheet = spreadsheet.getSheetByName('시트1');
  if (firstSheet && isSheetEmpty_(firstSheet)) {
    firstSheet.setName(SHEETS.dday);
    return firstSheet;
  }

  return spreadsheet.insertSheet(SHEETS.dday);
}

function ensureSheet_(spreadsheet, name) {
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function isSheetEmpty_(sheet) {
  return sheet.getLastRow() <= 1 && sheet.getLastColumn() <= 1 && String(sheet.getRange(1, 1).getValue()).trim() === '';
}

function configureDdaySheet_(sheet) {
  configureSheet_(sheet, ['사용', '제목', '목표일', '아이콘', '메모', '우선순위']);
  sheet.setColumnWidths(1, 1, 80);
  sheet.setColumnWidths(2, 1, 160);
  sheet.setColumnWidths(3, 1, 120);
  sheet.setColumnWidths(4, 1, 90);
  sheet.setColumnWidths(5, 1, 220);
  sheet.setColumnWidths(6, 1, 100);
  sheet.getRange('A2:A').setDataValidation(yesNoRule_());
  sheet.getRange('C2:C').setNumberFormat('yyyy-mm-dd');
  insertSampleRows_(sheet, [
    ['Y', '중간고사', new Date('2026-10-15T00:00:00+09:00'), '📝', '힘내서 준비해요!', 1],
  ]);
}

function configureNoticeSheet_(sheet) {
  configureSheet_(sheet, ['사용', '시작일', '종료일', '내용', '중요', '정렬순서']);
  sheet.setColumnWidths(1, 1, 80);
  sheet.setColumnWidths(2, 2, 120);
  sheet.setColumnWidths(4, 1, 320);
  sheet.setColumnWidths(5, 1, 80);
  sheet.setColumnWidths(6, 1, 100);
  sheet.getRange('A2:A').setDataValidation(yesNoRule_());
  sheet.getRange('E2:E').setDataValidation(yesNoRule_());
  sheet.getRange('B2:C').setNumberFormat('yyyy-mm-dd');
  insertSampleRows_(sheet, [
    ['Y', new Date('2026-08-24T00:00:00+09:00'), new Date('2026-08-24T00:00:00+09:00'), '체육복을 준비하세요.', 'N', 1],
    ['Y', new Date('2026-08-24T00:00:00+09:00'), new Date('2026-08-26T00:00:00+09:00'), '독서 활동지를 제출하세요.', 'Y', 2],
  ]);
}

function configureEventSheet_(sheet) {
  configureSheet_(sheet, ['날짜', '일정명', '구분', '상세내용', '정렬순서']);
  sheet.setColumnWidths(1, 1, 120);
  sheet.setColumnWidths(2, 1, 180);
  sheet.setColumnWidths(3, 1, 110);
  sheet.setColumnWidths(4, 1, 240);
  sheet.setColumnWidths(5, 1, 100);
  sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('C2:C').setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['시험', '행사', '방학', '학교생활', '기타'], true)
      .setAllowInvalid(false)
      .build(),
  );
  insertSampleRows_(sheet, [
    [new Date('2026-08-24T00:00:00+09:00'), '2학기 개학식', '행사', '정상 등교', 1],
    [new Date('2026-10-15T00:00:00+09:00'), '중간고사', '시험', '1일차', 1],
  ]);
}

function configureSheet_(sheet, headers) {
  if (sheet.getLastRow() === 0 || String(sheet.getRange(1, 1).getValue()).trim() === '') {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#f1e8ff')
    .setHorizontalAlignment('center');
  if (!sheet.getFilter()) {
    sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), headers.length).createFilter();
  }
}

function insertSampleRows_(sheet, rows) {
  if (sheet.getLastRow() > 1) {
    return;
  }
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange(2, 1, rows.length, rows[0].length).setBackground('#fffaf0');
  sheet.getRange(2, 1, rows.length, rows[0].length).setNote('예시 데이터입니다. 필요에 맞게 수정하거나 삭제해도 됩니다.');
}

function yesNoRule_() {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(['Y', 'N'], true)
    .setAllowInvalid(false)
    .build();
}

function readDday_(spreadsheet, today) {
  const sheet = spreadsheet.getSheetByName(SHEETS.dday);
  if (!sheet) {
    return null;
  }

  const rows = rowsWithHeader_(sheet, 1);
  const candidates = rows.map(function (row) {
    const targetDate = dateKey_(row['목표일']);
    if (!isYes_(row['사용']) || !row['제목'] || !targetDate) {
      return null;
    }
    return {
      title: String(row['제목']).trim(),
      targetDate: targetDate,
      label: ddayLabel_(today, targetDate),
      icon: String(row['아이콘'] || '⭐').trim(),
      memo: String(row['메모'] || '').trim(),
      priority: toNumber_(row['우선순위'], 999),
    };
  }).filter(Boolean);

  candidates.sort(function (a, b) {
    return a.priority - b.priority || Math.abs(daysBetween_(today, a.targetDate)) - Math.abs(daysBetween_(today, b.targetDate));
  });

  if (candidates.length === 0) {
    return null;
  }

  const selected = candidates[0];
  return {
    title: selected.title,
    targetDate: selected.targetDate,
    label: selected.label,
    icon: selected.icon,
    memo: selected.memo,
  };
}

function readNotices_(spreadsheet, today) {
  const sheet = spreadsheet.getSheetByName(SHEETS.notices);
  if (!sheet) {
    return [];
  }

  return rowsWithHeader_(sheet, 1).map(function (row) {
    const start = dateKey_(row['시작일']);
    const end = dateKey_(row['종료일']) || start;
    if (!isYes_(row['사용']) || !start || !end || !row['내용']) {
      return null;
    }
    if (today < start || today > end) {
      return null;
    }
    return {
      message: String(row['내용']).trim(),
      important: isYes_(row['중요']),
      order: toNumber_(row['정렬순서'], 999),
    };
  }).filter(Boolean).sort(function (a, b) {
    return Number(b.important) - Number(a.important) || a.order - b.order || a.message.localeCompare(b.message);
  }).slice(0, 20);
}

function readAcademicEvents_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(SHEETS.events);
  if (!sheet) {
    return [];
  }

  return rowsWithHeader_(sheet, 1).map(function (row) {
    const date = dateKey_(row['날짜']);
    if (!date || !row['일정명']) {
      return null;
    }
    return {
      date: date,
      title: String(row['일정명']).trim(),
      category: String(row['구분'] || '기타').trim(),
      details: String(row['상세내용'] || '').trim(),
      order: toNumber_(row['정렬순서'], 999),
    };
  }).filter(Boolean).sort(function (a, b) {
    return a.date.localeCompare(b.date) || a.order - b.order || a.title.localeCompare(b.title);
  });
}

function readPointRanking_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(SHEETS.students);
  if (!sheet) {
    return [];
  }

  const headerRow = findStudentHeaderRow_(sheet);
  if (!headerRow) {
    return [];
  }

  const rows = rowsWithHeader_(sheet, headerRow);
  const activeStudents = rows.map(function (row) {
    if (!isYes_(row.active) || !row.name) {
      return null;
    }
    return {
      number: toNumber_(row.number, 9999),
      name: String(row.name).trim(),
      totalPoints: toNumber_(row.total_points, 0),
      rank: toOptionalNumber_(row.rank),
    };
  }).filter(Boolean);

  const hasValidRank = activeStudents.every(function (student) {
    return student.rank !== null && student.rank > 0;
  });

  const ranked = hasValidRank
    ? activeStudents.map(function (student) {
        return {
          rank: student.rank,
          number: student.number,
          name: student.name,
          totalPoints: student.totalPoints,
        };
      }).sort(function (a, b) {
        return a.rank - b.rank || b.totalPoints - a.totalPoints || a.number - b.number;
      })
    : calculateRanks_(activeStudents);

  return ranked.map(function (student) {
    return {
      rank: student.rank,
      displayName: displayStudentName_(student.name),
      totalPoints: student.totalPoints,
    };
  });
}

function calculateRanks_(students) {
  const sorted = students.slice().sort(function (a, b) {
    return b.totalPoints - a.totalPoints || a.number - b.number;
  });
  let previousPoints = null;
  let currentRank = 0;
  return sorted.map(function (student, index) {
    if (previousPoints !== student.totalPoints) {
      currentRank = index + 1;
      previousPoints = student.totalPoints;
    }
    return {
      rank: currentRank,
      number: student.number,
      name: student.name,
      totalPoints: student.totalPoints,
    };
  });
}

function findStudentHeaderRow_(sheet) {
  const maxRows = Math.min(10, sheet.getLastRow());
  const maxColumns = sheet.getLastColumn();
  if (maxRows === 0 || maxColumns === 0) {
    return null;
  }
  const values = sheet.getRange(1, 1, maxRows, maxColumns).getValues();
  for (let rowIndex = 0; rowIndex < values.length; rowIndex += 1) {
    const normalized = values[rowIndex].map(function (cell) {
      return normalizeHeader_(cell);
    });
    if (normalized.indexOf('name') >= 0 && normalized.indexOf('active') >= 0 && normalized.indexOf('total_points') >= 0) {
      return rowIndex + 1;
    }
  }
  return null;
}

function rowsWithHeader_(sheet, headerRow) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow <= headerRow || lastColumn === 0) {
    return [];
  }

  const headers = sheet.getRange(headerRow, 1, 1, lastColumn).getValues()[0].map(normalizeHeader_);
  const values = sheet.getRange(headerRow + 1, 1, lastRow - headerRow, lastColumn).getValues();
  return values.map(function (rowValues) {
    const row = {};
    let hasValue = false;
    headers.forEach(function (header, index) {
      if (!header) {
        return;
      }
      row[header] = rowValues[index];
      if (String(rowValues[index]).trim() !== '') {
        hasValue = true;
      }
    });
    return hasValue ? row : null;
  }).filter(Boolean);
}

function normalizeHeader_(value) {
  return String(value || '').trim().toLowerCase();
}

function isYes_(value) {
  return String(value || '').trim().toUpperCase() === 'Y';
}

function toNumber_(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toOptionalNumber_(value) {
  const number = Number(value);
  return Number.isFinite(number) && String(value).trim() !== '' ? number : null;
}

function dateKey_(value) {
  if (!value) {
    return '';
  }
  if (Object.prototype.toString.call(value) === '[object Date]' && !Number.isNaN(value.getTime())) {
    return Utilities.formatDate(value, TIMEZONE, 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  const match = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (!match) {
    return '';
  }
  return [match[1], pad2_(match[2]), pad2_(match[3])].join('-');
}

function getTodayKey_() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

function formatNowIso_() {
  return Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function daysBetween_(fromKey, toKey) {
  const from = fromKey.split('-').map(Number);
  const to = toKey.split('-').map(Number);
  const fromTime = Date.UTC(from[0], from[1] - 1, from[2]);
  const toTime = Date.UTC(to[0], to[1] - 1, to[2]);
  return Math.round((toTime - fromTime) / 86400000);
}

function ddayLabel_(today, targetDate) {
  const diff = daysBetween_(today, targetDate);
  if (diff === 0) {
    return 'D-DAY';
  }
  return diff > 0 ? 'D-' + diff : 'D+' + Math.abs(diff);
}

function displayStudentName_(name) {
  return String(name || '').trim();
}

function createResponse_(payload, callback) {
  const json = JSON.stringify(payload);
  if (callback) {
    if (!/^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(callback)) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, message: 'callback 이름이 올바르지 않아요.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function pad2_(value) {
  return String(value).padStart(2, '0');
}
