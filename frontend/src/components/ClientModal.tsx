import { 
  Modal, Box, Typography, TextField, Button, Divider, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip 
} from '@mui/material';
import { useState, useEffect } from 'react';
import api from '../api';
import { useForm, SubmitHandler } from 'react-hook-form';

// Interfaces
interface ClientFormInputs {
  name: string;
  phone: string;
  address: string;
  birthday: string;
  notes: string; // Adicionamos notes aqui também
}

interface Client {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  birthday?: string;
  notes?: string;
}

// Interface para o Histórico que vem do backend
interface ClientWithOrders extends Client {
  orders: {
    id: number;
    createdAt: string;
    total: number;
    status: string;
    items: {
      product: { name: string };
      quantity: number;
    }[];
  }[];
}

type SnackbarSetter = (state: {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
} | null) => void;

interface ClientModalProps {
  open: boolean;
  handleClose: () => void;
  onSave: () => void;
  clientToEdit: Client | null;
  setSnackbar: SnackbarSetter;
  onSuccess?: (newClient: Client) => void;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600 }, // Um pouco mais largo para caber a tabela
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

export function ClientModal({ open, handleClose, onSave, clientToEdit, setSnackbar, onSuccess }: ClientModalProps) {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ClientFormInputs>();
  const [history, setHistory] = useState<ClientWithOrders | null>(null);

  // Efeito para preencher o formulário e buscar histórico
  useEffect(() => {
    if (open && clientToEdit) {
      // 1. Preenche o formulário imediatamente
      setValue('name', clientToEdit.name);
      setValue('phone', clientToEdit.phone || '');
      setValue('address', clientToEdit.address || '');
      setValue('notes', clientToEdit.notes || '');
      if (clientToEdit.birthday) {
        const date = new Date(clientToEdit.birthday).toISOString().split('T')[0];
        setValue('birthday', date);
      }

      // 2. Busca o histórico completo do backend (com orders)
      api.get<ClientWithOrders>(`/clients/${clientToEdit.id}`)
        .then(res => setHistory(res.data))
        .catch(err => console.error("Erro ao buscar histórico:", err));

    } else {
      // Modo Criar: Limpa tudo
      reset({ name: '', phone: '', address: '', birthday: '', notes: '' });
      setHistory(null);
    }
  }, [clientToEdit, open, setValue, reset]);

  const onSubmit: SubmitHandler<ClientFormInputs> = async (data) => {
    const clientData = {
      name: data.name,
      phone: data.phone?.trim() || undefined,
      address: data.address?.trim() || undefined,
      birthday: data.birthday ? new Date(data.birthday).toISOString() : undefined,
      notes: data.notes?.trim() || undefined,
    };

    try {
      let response;
      if (clientToEdit) {
        response = await api.patch(`/clients/${clientToEdit.id}`, clientData);
      } else {
        response = await api.post('/clients', clientData);
      }
      
      onSave();
      if (onSuccess && response.data) onSuccess(response.data);

      handleClose();
      setSnackbar({ open: true, message: 'Cliente salvo com sucesso!', severity: 'success' });
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      setSnackbar({ open: true, message: 'Erro ao salvar cliente.', severity: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" color="primary" gutterBottom>
          {clientToEdit ? `Editar: ${clientToEdit.name}` : 'Novo Cliente'}
        </Typography>

        {/* FORMULÁRIO */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            margin="dense" label="Nome Completo" fullWidth required
            {...register("name", { required: "Nome é obrigatório" })}
            error={!!errors.name} helperText={errors.name?.message}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              margin="dense" label="Telefone" fullWidth
              {...register("phone")}
            />
            <TextField
              margin="dense" label="Aniversário" type="date" fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("birthday")}
            />
          </Box>

          <TextField
            margin="dense" label="Endereço" fullWidth
            {...register("address")}
          />

          <TextField
            margin="dense" label="Preferências / Notas" fullWidth multiline rows={2}
            placeholder="Ex: Gosta de bolo menos doce; Alérgico a amendoim..."
            {...register("notes")}
          />

          <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
            Salvar Dados
          </Button>
        </Box>

        {/* HISTÓRICO DE PEDIDOS (Só aparece se estiver editando e tiver histórico) */}
        {clientToEdit && history && history.orders.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Histórico de Pedidos ({history.orders.length})
            </Typography>
            
            <TableContainer component={Paper} sx={{ maxHeight: 200, bgcolor: '#f9f9f9' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Data</b></TableCell>
                    <TableCell><b>Resumo</b></TableCell>
                    <TableCell><b>Total</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                      </TableCell>
                      <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status} 
                          size="small" 
                          color={order.status === 'CONCLUÍDO' ? 'success' : order.status === 'CANCELADO' ? 'error' : 'warning'} 
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
        
        {clientToEdit && history && history.orders.length === 0 && (
           <Typography variant="body2" sx={{ mt: 3, fontStyle: 'italic', color: 'gray' }}>
             Este cliente ainda não realizou nenhum pedido.
           </Typography>
        )}
      </Box>
    </Modal>
  );
}