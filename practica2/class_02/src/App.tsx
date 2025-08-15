import { useForm } from 'react-hook-form';
import { usePapaParse } from 'react-papaparse';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Typography } from '@mui/material';

type FormData = { txtArchi: FileList };

export default function App() {
  const { register, handleSubmit } = useForm<FormData>();
  const { readString } = usePapaParse();
  const navigate = useNavigate();

  const onSubmit = (data: FormData) => {
    const archivo: any = data.txtArchi?.[0];
    if (!archivo) return;

    // Nota: la guía usa delimiter ';' y header false como ejemplo
    readString(archivo, {
      delimiter: ';',
      header: false,
      dynamicTyping: true,
      complete: (result: any) => {
        // Enviamos el contenido al componente /procesar
        navigate('/procesar', { state: { contenido: result.data } });
      },
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Grid container direction="column" spacing={2}>
          <Grid>
            <Typography variant="h5">Lectura de archivos CSV</Typography>
          </Grid>
          <Grid>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register('txtArchi', { required: true })} type="file" className="form-control" />
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-success">Procesar</button>
                <a href="/" className="btn btn-outline-light">Limpiar</a>
              </div>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
