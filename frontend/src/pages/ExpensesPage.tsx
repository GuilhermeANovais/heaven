// src/pages/ExpensesPage.tsx
import { Box, Typography, Button, IconButton, Snackbar, Alert, Paper, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <--- React Query
import api from '../api';
import { ExpenseModal } from '../components/ExpenseModal';

interface Expense {
  id: number;
  description: string;
  amount: number;
  category?: string;
  date: string;
  user: { name: string };
}

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
} | null;

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);

  // 1. FETCHING COM REACT QUERY
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await api.get<Expense[]>('/expenses');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });

  // 2. MUTATION: DELETAR DESPESA
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setSnackbar({ open: true, message: 'Despesa deletada com sucesso!', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Erro ao deletar despesa.', severity: 'error' });
    }
  });

  const handleOpenModal = (expense: Expense | null) => {
    setExpenseToEdit(expense);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setExpenseToEdit(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar esta despesa?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const columns = useMemo((): GridColDef[] => [
    { 
      field: 'date', 
      headerName: 'Data', 
      width: 120,
      valueFormatter: (value) => new Date(value).toLocaleDateString('pt-BR')
    },
    { field: 'description', headerName: 'Descrição', flex: 1 },
    { 
      field: 'category', 
      headerName: 'Categoria', 
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value || 'Geral'} size="small" variant="outlined" />
      )
    },
    { 
      field: 'amount', 
      headerName: 'Valor', 
      width: 130, 
      type: 'number',
      renderCell: (params) => (
        <Typography fontWeight="bold" color="error.main">
          {/* Adicionei Number() para garantir segurança com Decimals */}
          - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(params.value))}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenModal(params.row)} color="primary">
            <Pencil size={18} strokeWidth={1.5} />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color="error">
            <Trash2 size={18} strokeWidth={1.5} />
          </IconButton>
        </Box>
      ),
    },
  ], []);

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          Despesas
        </Typography>
        <Button
          variant="contained"
          color="error" // Mantive o vermelho para indicar saída
          startIcon={<Plus size={20} strokeWidth={1.5} />}
          onClick={() => handleOpenModal(null)}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Nova Despesa
        </Button>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ height: 500, width: '100%', bgcolor: 'white', border: '1px solid #e0e0e0', borderRadius: 2 }}
      >
        <DataGrid
          rows={expenses}
          columns={columns}
          loading={isLoading}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 20]}
          sx={{ border: 'none' }}
        />
      </Paper>

      <ExpenseModal
        open={openModal}
        handleClose={handleCloseModal}
        // Invalida o cache ao salvar para atualizar a tabela
        onSave={() => queryClient.invalidateQueries({ queryKey: ['expenses'] })}
        expenseToEdit={expenseToEdit}
        setSnackbar={setSnackbar}
      />

      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
