import { useForm } from 'react-hook-form'
import { usePapaParse } from 'react-papaparse'
import { useNavigate } from 'react-router-dom'
import {
  Container, Paper, Typography, Grid, Card, CardHeader, CardContent,
  Stack, Button, Chip, Tooltip, Divider, FormControl, InputLabel,
  Select, MenuItem, TextField, FormControlLabel, Switch, Alert, Box
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

type DelimiterMode = 'auto' | 'semicolon' | 'comma' | 'pipe' | 'tab' | 'custom'

type FormData = {
  txtArchi: FileList
  hasHeader: boolean
  delimiterMode: DelimiterMode
  delimiterCustom?: string
}

function bytesToString(bytes: number) {
  if (!bytes && bytes !== 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let val = bytes
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++ }
  return `${val.toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2)} ${units[i]}`
}

export default function App() {
  const navigate = useNavigate()
  const { readString } = usePapaParse()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      hasHeader: true,
      delimiterMode: 'semicolon',
      delimiterCustom: ''
    }
  })

  const fileList = watch('txtArchi')
  const file = fileList?.[0]
  const delimiterMode = watch('delimiterMode')

  const computeDelimiter = (): string => {
    switch (delimiterMode) {
      case 'auto': return '' // PapaParse autodetecta si le pasas undefined/''.
      case 'semicolon': return ';'
      case 'comma': return ','
      case 'pipe': return '|'
      case 'tab': return '\t'
      case 'custom': {
        const raw = (watch('delimiterCustom') ?? '').trim()
        return raw ? raw[0] : ';'
      }
      default: return ';'
    }
  }

  // Genera headers por defecto si el archivo no trae
  const buildHeaders = (rows: any[][]) => {
    const cols = rows.reduce((max, r) => Math.max(max, r.length), 0)
    return Array.from({ length: cols }, (_, i) => `col_${i + 1}`)
  }

  // Normaliza filas a un mismo largo
  const normalizeRows = (rows: any[][], cols: number) =>
    rows.map(r => r.length < cols ? [...r, ...Array(cols - r.length).fill('')] : r.slice(0, cols))

  const onSubmit = (data: FormData) => {
    const archivo = data.txtArchi?.[0]
    if (!archivo) return

    const delimiter = computeDelimiter()
    const headerChecked = !!data.hasHeader

    readString(archivo as any, {
      delimiter: delimiter || undefined, // '' => autodetect
      header: false,                     // leemos uniforme; luego tratamos headers
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      complete: (result: any) => {
        const raw: any[][] = result?.data ?? []
        if (!Array.isArray(raw) || raw.length === 0) {
          alert('No se pudo leer contenido del archivo.')
          return
        }

        let headers: string[]
        let rows: any[][]
        if (headerChecked) {
          headers = (raw[0] ?? []).map((h: any) => `${h}`)
          rows = raw.slice(1)
        } else {
          headers = buildHeaders(raw)
          rows = raw
        }

        const cols = headers.length || buildHeaders(rows).length
        if (headers.length === 0) headers = buildHeaders(rows)
        rows = normalizeRows(rows, cols)

        // contenido[0] = headers, resto = filas
        const contenido = [headers, ...rows]

        navigate('/procesar', {
          state: {
            contenido,
            meta: {
              delimiter: delimiter || '(auto)',
              hasHeader: headerChecked,
              fileName: archivo.name,
              fileSize: archivo.size
            }
          }
        })
      },
      error: (err: any) => {
        alert(`Error al leer el archivo: ${err?.message ?? 'desconocido'}`)
      }
    })
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background:
            'linear-gradient(180deg, rgba(255,255,255,.03), transparent), #0f172a',
          border: '1px solid rgba(51,65,85,.6)'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h4" fontWeight={900}>
            Práctica 02 — Procesamiento CSV
          </Typography>
          <Tooltip title="Carga un archivo, elige separador y si tiene encabezado. Luego procesamos y veremos tipos y estadísticas.">
            <InfoOutlinedIcon sx={{ opacity: 0.7 }} />
          </Tooltip>
        </Stack>
        <Typography variant="body2" sx={{ color: 'rgba(226,232,240,.8)', mb: 2 }}>
          Compatible con ; , | tab y separador personalizado. Encabezado opcional.
        </Typography>

        {/* Card: Archivo */}
        <Card
          variant="outlined"
          sx={{ borderRadius: 2, mb: 2, borderColor: 'rgba(51,65,85,.6)' }}
        >
          <CardHeader
            avatar={<InsertDriveFileIcon />}
            title="Archivo"
            subheader="Selecciona tu .csv o .txt"
          />
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button
                component="label"
                variant="contained"
                startIcon={<UploadFileIcon />}
              >
                Elegir archivo
                <input
                  {...register('txtArchi', { required: true })}
                  type="file"
                  accept=".csv,.txt"
                  hidden
                />
              </Button>

              {file ? (
                <Chip
                  color="success"
                  variant="outlined"
                  label={`${file.name} · ${bytesToString(file.size)}`}
                />
              ) : (
                <Chip variant="outlined" label="Ningún archivo seleccionado" />
              )}
            </Stack>
            {errors.txtArchi && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Debes seleccionar un archivo CSV/TXT.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Card: Parámetros de lectura */}
        <Card
          variant="outlined"
          sx={{ borderRadius: 2, mb: 2, borderColor: 'rgba(51,65,85,.6)' }}
        >
          <CardHeader title="Parámetros de lectura" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid>
                <FormControl fullWidth>
                  <InputLabel id="delimiter-label">Separador</InputLabel>
                  <Select
                    labelId="delimiter-label"
                    label="Separador"
                    defaultValue="semicolon"
                    {...register('delimiterMode')}
                  >
                    <MenuItem value="auto">(Autodetectar)</MenuItem>
                    <MenuItem value="semicolon">Punto y coma (;)</MenuItem>
                    <MenuItem value="comma">Coma (,)</MenuItem>
                    <MenuItem value="pipe">Barra vertical (|)</MenuItem>
                    <MenuItem value="tab">Tabulación</MenuItem>
                    <MenuItem value="custom">Personalizado…</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <FormControlLabel
                    control={<Switch defaultChecked {...register('hasHeader')} />}
                    label="¿Tiene encabezado?"
                  />
                </Box>
              </Grid>

              {delimiterMode === 'custom' && (
                <Grid>
                  <TextField
                    label="Separador personalizado"
                    placeholder="Ej.: ¬ | ^"
                    inputProps={{ maxLength: 1 }}
                    helperText="Escribe un solo carácter"
                    {...register('delimiterCustom')}
                    fullWidth
                  />
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label="CSV con ; recomendado" size="small" />
              <Chip label="Autodetecta si no sabes el separador" size="small" />
              <Chip label="Encabezado: primera fila con nombres de columna" size="small" />
            </Stack>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={() => reset()}
          >
            Limpiar
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleSubmit(onSubmit)}
          >
            Procesar
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
