// src/pages/ProductsPage.tsx
import { Box, Typography, Button, IconButton, Snackbar, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import api from '../api';
import { ProductModal } from '../components/ProductModal';

// Interface
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

// Tipo para o estado do snackbar
type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
} | null;

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  
  // Crie o estado para o Snackbar
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);

  // Funções do Modal
  const handleOpenModal = (product: Product | null) => {
    setProductToEdit(product);
    setOpenModal(true); // <-- CORRIGIDO
  };

  const handleCloseModal = () => {
    setOpenModal(false); // <-- CORRIGIDO
    setProductToEdit(null);
  };

  // Função para buscar os dados
  async function fetchProducts() {
    setLoading(true); // Garante que o loading seja reativado em re-fetches
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setSnackbar({ open: true, message: 'Erro ao buscar produtos.', severity: 'error' });
    } finally {
      setLoading(false); // 3. Pare o loading quando terminar
    }
  }

  // Função de deletar
  async function handleDelete(id: number) {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts(); // Recarrega a tabela
        // Mostre sucesso
        setSnackbar({ open: true, message: 'Produto deletado com sucesso!', severity: 'success' });
      } catch (error) {
        console.error("Erro ao deletar produto:", error);
        // Mostre erro
        setSnackbar({ open: true, message: 'Erro ao deletar produto.', severity: 'error' });
      }
    }
  }

  // Crie a função de fechar o snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  // Definição das Colunas
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nome', width: 200 },
    { field: 'price', headerName: 'Preço', width: 130, type: 'number' },
    { field: 'description', headerName: 'Descrição', flex: 1 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <Box>
            {/* Botão de Editar */}
            <IconButton 
              onClick={() => handleOpenModal(params.row)}
              color="primary"
            >
              <Edit />
            </IconButton>
            {/* Botão de Deletar */}
            <IconButton 
              onClick={() => handleDelete(params.row.id)} 
              color="error"
            >
              <Delete />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  // useEffect
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* --- CABEÇALHO DA PÁGINA --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Produtos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenModal(null)}
        >
          Novo Produto
        </Button>
      </Box>

      {/* --- TABELA DE DADOS --- */}
      <Box sx={{ height: 400, width: '100%', backgroundColor: 'white' }}>
        <DataGrid
          rows={products}
          columns={columns}
          pageSizeOptions={[5, 10]}
          loading={loading} // 4. Passe o estado de loading para a DataGrid
        />
      </Box>

      {/* --- MODAL --- */}
      <ProductModal
        open={openModal}
        handleClose={handleCloseModal}
        onSave={fetchProducts}
        productToEdit={productToEdit}
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