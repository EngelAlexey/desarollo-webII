export type SexKey = string;

export function buildProvinceSexStats(rows: any[][], provIdx: number, sexIdx: number) {
  const counts = new Map<string, Map<SexKey, number>>();
  const sexSet = new Set<SexKey>();

  for (const r of rows) {
    const prov = (r?.[provIdx] ?? '').toString().trim();
    const sex  = (r?.[sexIdx]  ?? '').toString().trim();
    if (!prov || !sex) continue;
    sexSet.add(sex);
    if (!counts.has(prov)) counts.set(prov, new Map());
    const m = counts.get(prov)!;
    m.set(sex, (m.get(sex) ?? 0) + 1);
  }

  const sexes = [...sexSet].sort();
  const table = [...counts.entries()]
    .sort((a,b)=> a[0].localeCompare(b[0]))
    .map(([prov, m]) => {
      const total = [...m.values()].reduce((a,b)=>a+b,0);
      const row: Record<string, any> = { provincia: prov, total };
      for (const s of sexes) {
        const n = m.get(s) ?? 0;
        row[s] = { n, pct: total ? (n*100/total) : 0 };
      }
      return row;
    });

  return { sexes, table };
}

export function statsToCSV(result: ReturnType<typeof buildProvinceSexStats>) {
  const { sexes, table } = result;
  const header = ['Provincia', ...sexes.map(s=>`${s} (n)`), ...sexes.map(s=>`${s} (%)`), 'Total'];
  const lines = [header.join(';')];
  for (const row of table) {
    const ns   = sexes.map(s => row[s]?.n ?? 0);
    const pcts = sexes.map(s => (row[s]?.pct ?? 0).toFixed(1).replace('.', ','));
    lines.push([row.provincia, ...ns, ...pcts, row.total].join(';'));
  }
  return lines.join('\n');
}
