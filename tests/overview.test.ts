import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const source = readFileSync('apps-script/Code.gs', 'utf8');
function api() {
  const context = createContext({ SpreadsheetApp: { ValueType: { IMAGE: 'IMAGE' } } });
  runInContext(source, context);
  return context;
}
function sheet(values: unknown[][], formulas = values.map(row => row.map(() => ''))) {
  return { getLastRow: () => values.length, getLastColumn: () => values[0].length,
    getRange: (row: number | string, _col?: number, count?: number) => ({
      getValues: () => typeof row === 'string' ? values : values.slice(row - 1, row - 1 + (count ?? 1)),
      getFormulas: () => formulas,
    }) };
}
describe('overview sheet readers', () => {
  it('keeps weekday order and empty weekdays; excludes unfilled periods', () => {
    const spreadsheet = { getSheetByName: () => sheet([
      ['교시', '금', '월', '화', '수', '목'], [1, '체육', '국어', '', '수학', '과학'], [2, '', '', '', '', ''],
    ]) };
    expect(api().readBasicTimetable_(spreadsheet)).toEqual([{ period: '1', subjects: ['국어', '', '수학', '과학', '체육'] }]);
  });
  it('tolerates missing tabs', () => {
    const spreadsheet = { getSheetByName: () => null };
    expect(api().readBasicTimetable_(spreadsheet)).toEqual([]);
    expect(api().readMealImage_(spreadsheet)).toBeNull();
  });
  it('reads a cell image and title', () => {
    const spreadsheet = { getSheetByName: () => sheet([['제목', '이미지'], ['10월 식단표', { valueType: 'IMAGE', getContentUrl: () => 'https://example.com/menu.png' }]]) };
    expect(api().readMealImage_(spreadsheet)).toEqual({ url: 'https://example.com/menu.png', title: '10월 식단표' });
  });
  it('reads IMAGE formula and direct URL, rejecting other schemes', () => {
    const context = api();
    expect(context.readMealImage_({ getSheetByName: () => sheet([['10월 식단표', '']], [['', '=IMAGE("https://example.com/menu.png", 4, 400, 500)']]) })).toEqual({ url: 'https://example.com/menu.png', title: '10월 식단표' });
    expect(context.readMealImage_({ getSheetByName: () => sheet([['https://example.com/menu.png']]) }).url).toBe('https://example.com/menu.png');
    expect(context.readMealImage_({ getSheetByName: () => sheet([['javascript:alert(1)']]) })).toBeNull();
  });
});
