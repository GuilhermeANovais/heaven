// src/pages/ClientsPage.tsx
import { Box, Typography, Button, IconButton, Snackbar, Alert, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <--- Importações React Query
import api from '../api';
import { ClientModal } from '../components/ClientModal';

// Interface para o Cliente
interface Client {
  id: number;
  name: string;
  phone?: string;
  address?: string;
}

// Tipo para o estado do snackbar
type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
} | null;

export function ClientsPage() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);

  // 1. FETCHING COM REACT QUERY
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await api.get<Client[]>('/clients');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  // 2. MUTATION: DELETAR CLIENTE
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/clients/${id}`);
    },
    onSuccess: () => {
      // Invalida o cache para atualizar a lista automaticamente
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setSnackbar({ open: true, message: 'Cliente deletado com sucesso!', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Erro ao deletar cliente.', severity: 'error' });
    }
  });

  // Funções do Modal
  const handleOpenModal = (client: Client | null) => {
    setClientToEdit(client);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setClientToEdit(null);
  };

  // Função de deletar
  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este cliente?")) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  // Definição das Colunas
  const columns = useMemo((): GridColDef[] => [
    { field: 'name', headerName: 'Nome', width: 250 },
    { field: 'phone', headerName: 'Telefone', width: 150 },
    { field: 'address', headerName: 'Endereço', flex: 1 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <Box>
            <IconButton onClick={() => handleOpenModal(params.row)} color="primary">
              <Pencil size={18} strokeWidth={1.5} />
            </IconButton>
            
            <IconButton onClick={() => handleDelete(params.row.id)} color="error">
              <Trash2 size={18} strokeWidth={1.5} />
            </IconButton>
          </Box>
        );
      },
    },
  ], []);

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* --- CABEÇALHO DA PÁGINA --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          Clientes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={20} strokeWidth={1.5} />}
          onClick={() => handleOpenModal(null)}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Novo Cliente
        </Button>
      </Box>

      {/* --- TABELA DE DADOS --- */}
      <Paper 
        elevation={0} 
        sx={{ 
          height: 500, 
          width: '100%', 
          backgroundColor: 'white', 
          border: '1px solid #e0e0e0', 
          borderRadius: 2 
        }}
      >
        <DataGrid
          rows={clients}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 20]}
          sx={{ border: 'none' }}
        />
      </Paper>

      {/* --- MODAL --- */}
      <ClientModal
        open={openModal}
        handleClose={handleCloseModal}
        // Ao salvar, invalida a query 'clients' para recarregar a lista
        onSave={() => queryClient.invalidateQueries({ queryKey: ['clients'] })}
        clientToEdit={clientToEdit}
        setSnackbar={setSnackbar}
      />

      {/* --- SNACKBAR --- */}
      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
