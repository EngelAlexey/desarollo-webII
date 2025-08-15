const intRe = /^-?\d+$/;
const floatRe = /^-?\d+(?:[.,]\d+)?$/;
const boolRe = /^(true|false|sí|si|no)$/i;
const isoDateRe = /^\d{4}-\d{2}-\d{2}$/;
const dmyRe = /^\d{2}[/-]\d{2}[/-]\d{4}$/;
const mdyRe = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

function isInteger(s: string){ return intRe.test(s); }
function isFloat(s: string){ return floatRe.test(s); }
function isBoolean(s: string){ return boolRe.test(s); }
function isDateLike(s: string){ return isoDateRe.test(s) || dmyRe.test(s) || mdyRe.test(s); }

export type ColType = 'integer' | 'float' | 'boolean' | 'date' | 'string';

export function inferTypes(rows: any[][], cols: number): ColType[] {
  const types: ColType[] = Array(cols).fill('string');
  for (let c = 0; c < cols; c++) {
    let ints=0, floats=0, bools=0, dates=0, strings=0;
    for (const r of rows) {
      const v = (r?.[c] ?? '').toString().trim();
      if (!v) continue;
      if (isInteger(v)) ints++;
      else if (isFloat(v)) floats++;
      else if (isBoolean(v)) bools++;
      else if (isDateLike(v)) dates++;
      else strings++;
    }
    const majority = [
      ['integer', ints],
      ['float', floats],
      ['boolean', bools],
      ['date', dates],
      ['string', strings],
    ].sort((a,b)=> Number(b[1]) - Number(a[1]))[0][0] as ColType;
    types[c] = majority ?? 'string';
  }
  return types;
}
