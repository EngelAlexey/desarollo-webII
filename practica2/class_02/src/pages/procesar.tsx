import { useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { useMemo, useState } from 'react';
import { inferTypes } from '../utils/inferTypes';
import type { ColType } from '../utils/inferTypes';
import { buildProvinceSexStats, statsToCSV } from '../utils/stats';

export default function Procesar() {
  const location = useLocation();
  const contenido: any[] = location.state?.contenido ?? [];

  // 1) Cabeceras y filas
  const headers: string[] = (contenido[0] ?? []).map((h: any, i: number) => (h ?? `campo_${i + 1}`).toString());
  const rowsRaw: any[][] = contenido.slice(1);
  const cols = headers.length;

  // 2) Tabla (hasta 200 filas) para react-data-table-component
  const columns = headers.map((name) => ({
    name,
    selector: (row: any) => row[name],
    sortable: true,
  }));

  const data = rowsRaw.slice(0, 200).map((row: any[]) => {
    const o: any = {};
    headers.forEach((h, i) => (o[h] = row[i]));
    return o;
  });

  // 3) Tipos inferidos (escaneo completo)
  const types: ColType[] = useMemo(() => inferTypes(rowsRaw, cols), [rowsRaw, cols]);

  // 4) Estadística Provincia/Sexo
  // Intento de autoselección por nombre de columna
  const guessProv = Math.max(0, headers.findIndex(h => /prov/i.test(h)));
  const guessSex  = Math.max(0, headers.findIndex(h => /(sexo|gender|sex)/i.test(h)));

  const [provIdx, setProvIdx] = useState<number>(guessProv >= 0 ? guessProv : 0);
  const [sexIdx, setSexIdx]   = useState<number>(guessSex  >= 0 ? guessSex  : 1);

  const stats = useMemo(() => buildProvinceSexStats(rowsRaw, provIdx, sexIdx), [rowsRaw, provIdx, sexIdx]);

  const download = () => {
    const csv = statsToCSV(stats);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'estadistica_provincia_sexo.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const customStyle = {
    rows: { style: { minHeight: '50px' } },
    headCells: { style: { padding: '8px', fontSize: '14px' } },
    cells: { style: { padding: '8px', fontSize: '14px' } },
  };

  // Muestra tipos como una fila aparte
  const tiposFila = (
    <table className="table table-striped table-sm">
      <thead><tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
      <tbody><tr>{types.map((t, i) => <td key={i}><code>{t}</code></td>)}</tr></tbody>
    </table>
  );

  return (
    <div className="container mt-3">
      <h4>Contenido del archivo</h4>

      <h5 className="mt-3">Estructura de datos (tipos por columna)</h5>
      {tiposFila}

      <h5 className="mt-3">Tabla (hasta 200 filas)</h5>
      <DataTable columns={columns as any} data={data} pagination customStyles={customStyle as any} />

      <hr className="my-4"/>

      <h4>Estadística: % por provincia distribuido por sexo</h4>
      <div className="row g-2 mb-2">
        <div className="col-sm-6">
          <label className="form-label">Columna Provincia</label>
          <select className="form-select" value={provIdx} onChange={e=>setProvIdx(Number(e.target.value))}>
            {headers.map((h,i)=><option key={i} value={i}>{i+1}. {h}</option>)}
          </select>
        </div>
        <div className="col-sm-6">
          <label className="form-label">Columna Sexo</label>
          <select className="form-select" value={sexIdx} onChange={e=>setSexIdx(Number(e.target.value))}>
            {headers.map((h,i)=><option key={i} value={i}>{i+1}. {h}</option>)}
          </select>
        </div>
      </div>

      <button className="btn btn-success mb-2" onClick={download}>Descargar CSV</button>

      <div className="table-responsive">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th>Provincia</th>
              {stats.sexes.map(s => <th key={s}>{s} (n)</th>)}
              {stats.sexes.map(s => <th key={s+'_pct'}>{s} (%)</th>)}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.table.map((row:any) => (
              <tr key={row.provincia}>
                <td>{row.provincia}</td>
                {stats.sexes.map(s => <td key={s}>{row[s]?.n ?? 0}</td>)}
                {stats.sexes.map(s => <td key={s+'_p'}>{(row[s]?.pct ?? 0).toFixed(1)}%</td>)}
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
