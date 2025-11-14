// src/pages/OrdersPage.tsx
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom'; // 1. Importe useNavigate

// ... (Interfaces OrderItem, OrderUser, Order) ...
interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}
interface OrderUser {
  name: string | null;
  email: string;
}
interface Order {
  id: number;
  createdAt: string;
  status: string;
  total: number;
  user: OrderUser;
  items: OrderItem[];
}


// ... (Definição das Colunas) ...
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'userName',
    headerName: 'Cliente',
    width: 200,
    valueGetter: (params) => params.row.user?.name || params.row.user.email,
  },
  { field: 'status', headerName: 'Status', width: 130 },
  {
    field: 'total',
    headerName: 'Total',
    type: 'number',
    width: 120,
    valueFormatter: (params) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(params.value);
    },
  },
  {
    field: 'itemCount',
    headerName: 'Itens',
    type: 'number',
    width: 90,
    valueGetter: (params) => params.row.items.length,
  },
  {
    field: 'createdAt',
    headerName: 'Data',
    width: 180,
    valueFormatter: (params) => {
      return new Date(params.value).toLocaleString('pt-BR');
    },
  },
];


export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 2. Chame o hook

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // 3. Atualize a função do botão
  const handleNewOrder = () => {
    navigate('/orders/new'); // Navega para a nova página
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* --- CABEÇALHO DA PÁGINA --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Pedidos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleNewOrder} // O onClick agora navega
        >
          Novo Pedido
        </Button>
      </Box>

      {/* --- TABELA DE DADOS --- */}
      <Box sx={{ height: 500, width: '100%', backgroundColor: 'white' }}>
        <DataGrid
          rows={orders}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 20]}
        />
      </Box>
    </Box>
  );
}