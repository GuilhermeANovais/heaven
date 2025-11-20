// src/components/EditOrderModal.tsx
import { Modal, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import api from '../api';
import { OrderSummary } from '../types/entities';

interface EditOrderFormInputs {
  clientId: string | number; // Pode ser vazio
  deliveryDate: string;
  observations: string;
}

interface EditOrderModalProps {
  open: boolean;
  handleClose: () => void;
  onSave: () => void;
  order: OrderSummary | null;
  setSnackbar: any;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export function EditOrderModal({ open, handleClose, onSave, order, setSnackbar }: EditOrderModalProps) {
  const { register, handleSubmit, setValue, reset } = useForm<EditOrderFormInputs>();
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Carrega clientes e preenche formulário
  useEffect(() => {
    if (open && order) {
      // 1. Busca Clientes
      setLoadingClients(true);
      api.get('/clients').then(res => {
        setClients(res.data);
      }).finally(() => setLoadingClients(false));

      // 2. Preenche campos
      setValue('clientId', order.client?.id || '');
      setValue('observations', (order as any).observations || ''); // Cast as any se a interface não tiver obs ainda
      
      if (order.deliveryDate) {
        // Formata para o input datetime-local (YYYY-MM-DDTHH:mm)
        const date = new Date(order.deliveryDate).toISOString().slice(0, 16);
        setValue('deliveryDate', date);
      } else {
        setValue('deliveryDate', '');
      }
    }
  }, [open, order, setValue]);

  const onSubmit: SubmitHandler<EditOrderFormInputs> = async (data) => {
    if (!order) return;

    const updateData = {
      clientId: data.clientId ? Number(data.clientId) : null, // Envia null para remover cliente
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString() : null,
      observations: data.observations,
    };

    try {
      await api.patch(`/orders/${order.id}`, updateData);
      setSnackbar({ open: true, message: 'Pedido atualizado com sucesso!', severity: 'success' });
      onSave(); // Recarrega a tabela
      handleClose();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      setSnackbar({ open: true, message: 'Erro ao atualizar pedido.', severity: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          Editar Pedido #{order?.id}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Cliente</InputLabel>
            <Select
              label="Cliente"
              native
              defaultValue=""
              disabled={loadingClients}
              {...register("clientId")}
            >
              <option value="">Sem Cliente (Interno)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            fullWidth
            label="Data de Entrega"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            {...register("deliveryDate")}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Observações"
            multiline
            rows={3}
            {...register("observations")}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Salvar Alterações
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}