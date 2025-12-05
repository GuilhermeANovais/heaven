// src/pages/ProductsPage.tsx
import { Box, Typography, Button, IconButton, Snackbar, Alert, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <--- React Query
import api from '../api';
import { ProductModal } from '../components/ProductModal';

// Interface
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
} | null;

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);

  // 1. FETCHING COM REACT QUERY
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get<Product[]>('/products');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });

  // 2. MUTATION: DELETAR PRODUTO
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSnackbar({ open: true, message: 'Produto deletado com sucesso!', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Erro ao deletar produto.', severity: 'error' });
    }
  });

  const handleOpenModal = (product: Product | null) => {
    setProductToEdit(product);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setProductToEdit(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  // Colunas
  const columns = useMemo((): GridColDef[] => [
    { field: 'name', headerName: 'Nome', width: 200 },
    { 
      field: 'price', 
      headerName: 'Preço', 
      width: 130, 
      type: 'number',
      valueFormatter: (value) => {
        if (value == null) return '';
        // Proteção: Converter para Number() caso venha string do backend
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
      }
    },
    { field: 'description', headerName: 'Descrição', flex: 1 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <Box>
            <IconButton 
              onClick={() => handleOpenModal(params.row)}
              color="primary"
            >
              <Pencil size={18} strokeWidth={1.5} />
            </IconButton>
            
            <IconButton 
              onClick={() => handleDelete(params.row.id)} 
              color="error"
            >
              <Trash2 size={18} strokeWidth={1.5} />
            </IconButton>
          </Box>
        );
      },
    },
  ], []);

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          Produtos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={20} strokeWidth={1.5} />}
          onClick={() => handleOpenModal(null)}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Novo Produto
        </Button>
      </Box>

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
          rows={products}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 20]}
          sx={{ border: 'none' }}
        />
      </Paper>

      <ProductModal
        open={openModal}
        handleClose={handleCloseModal}
        // Ao salvar, invalidamos o cache para recarregar a lista automaticamente
        onSave={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
        productToEdit={productToEdit}
        setSnackbar={setSnackbar}
      />

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
