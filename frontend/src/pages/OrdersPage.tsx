// src/pages/OrdersPage.tsx
import {
  Box, Typography, Button, Select, MenuItem,
  SelectChangeEvent, Snackbar, Alert, IconButton, Paper
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Plus, Eye, Trash2, Pencil, Printer, ChefHat } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <--- Importações Novas
import api from '../api';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { OrderSummary } from '../types/entities';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
} | null;

interface OrderWithDelivery extends OrderSummary {
  deliveryDate?: string | null;
}

export function OrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // <--- Necessário para atualizar a lista após ações
  const [snackbar, setSnackbar] = useState<SnackbarState>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<OrderWithDelivery | null>(null);

  // --- 1. FETCHING COM REACT QUERY ---
  // Substitui useEffect, useState(orders) e useState(loading)
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'], // Chave única para o cache
    queryFn: async () => {
      const response = await api.get<OrderWithDelivery[]>('/orders');
      return response.data;
    },
    // Opcional: Recarregar a cada 30 segundos automaticamente
    refetchInterval: 30000, 
  });

  // --- 2. MUTATION: ATUALIZAR STATUS ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: number; newStatus: string }) => {
      await api.patch(`/orders/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      // Magia: invalida o cache 'orders' e força um refetch automático
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({ open: true, message: 'Status atualizado com sucesso!', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Erro ao atualizar status.', severity: 'error' });
    }
  });

  // --- 3. MUTATION: DELETAR PEDIDO ---
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({ open: true, message: 'Pedido deletado com sucesso!', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Erro ao deletar pedido.', severity: 'error' });
    }
  });

  // Handlers simplificados (agora chamam .mutate)
  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, newStatus });
  };

  const handleDeleteOrder = (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este pedido? Esta ação não pode ser desfeita.')) {
      deleteOrderMutation.mutate(id);
    }
  };

  // --- Função de Impressão (Mantida igual, pois é uma ação direta sem side-effect no cache) ---
  const handlePrint = async (id: number, type: 'receipt' | 'kitchen') => {
    try {
      const response = await api.get(`/orders/${id}/pdf?type=${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
        setTimeout(() => {
            document.body.removeChild(iframe);
            window.URL.revokeObjectURL(url);
        }, 60000); 
      };
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      setSnackbar({ open: true, message: 'Erro ao gerar impressão.', severity: 'error' });
    }
  };

  const handleViewDetails = (id: number) => setSelectedOrderId(id);
  const handleEditOrder = (order: OrderWithDelivery) => {
    setOrderToEdit(order);
    setEditModalOpen(true);
  };
  const handleCloseSnackbar = () => setSnackbar(null);
  const handleNewOrder = () => navigate('/orders/new');

  // Colunas
  const columns = useMemo((): GridColDef<OrderWithDelivery>[] => [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'clientName',
      headerName: 'Cliente',
      width: 180,
      valueGetter: (_value, row) => row.client?.name || 'Pedido Interno',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'CONCLUÍDO') color = 'success';
        if (params.value === 'CANCELADO') color = 'error';
        return <Typography color={color} variant="body2" fontWeight="medium">{params.value}</Typography>;
      }
    },
    {
      field: 'deliveryDate',
      headerName: 'Entrega',
      width: 160,
      valueGetter: (value, row) => value || row.deliveryDate,
      valueFormatter: (value) => {
        if (!value) return '—';
        return new Date(value).toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
      },
    },
    {
      field: 'total',
      headerName: 'Total',
      type: 'number',
      width: 110,
      valueFormatter: (value) => {
        if (value == null) return ''; 
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      },
    },
    {
      field: 'itemCount',
      headerName: 'Itens',
      type: 'number',
      width: 80,
      valueGetter: (_value, row) => row.items?.length || 0,
    },
    {
      field: 'createdAt',
      headerName: 'Criado em',
      width: 160,
      valueFormatter: (value) => {
        if (value == null) return '';
        return new Date(value).toLocaleString('pt-BR');
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 280,
      sortable: false,
      renderCell: (params) => {
        const statusValue = ['PENDENTE', 'CONCLUÍDO', 'CANCELADO', 'SINAL PAGO'].includes(params.row.status) ? params.row.status : 'PENDENTE';
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
             <IconButton
              color="primary"
              size="small"
              onClick={() => handlePrint(params.row.id, 'receipt')}
              title="Cupom (80mm)"
            >
              <Printer size={18} strokeWidth={1.5} />
            </IconButton>

            <IconButton
              size="small"
              sx={{ color: '#e65100' }}
              onClick={() => handlePrint(params.row.id, 'kitchen')}
              title="Pedido Completo (A4 - Cozinha)"
            >
              <ChefHat size={18} strokeWidth={1.5} />
            </IconButton>

            <IconButton
              color="default"
              size="small"
              onClick={() => handleViewDetails(params.row.id)}
            >
              <Eye size={18} strokeWidth={1.5} />
            </IconButton>

            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEditOrder(params.row)}
            >
              <Pencil size={18} strokeWidth={1.5} />
            </IconButton>

            <Select
              value={statusValue}
              onChange={(e: SelectChangeEvent) => handleStatusChange(params.row.id, e.target.value)}
              size="small"
              sx={{ height: 30, fontSize: '0.8rem', width: 90 }}
            >
              <MenuItem value="PENDENTE">Pend.</MenuItem>
              <MenuItem value="CONCLUÍDO">Conc.</MenuItem>
              <MenuItem value="CANCELADO">Canc.</MenuItem>
            </Select>

            <IconButton
              color="error"
              size="small"
              onClick={() => handleDeleteOrder(params.row.id)}
            >
              <Trash2 size={18} strokeWidth={1.5} />
            </IconButton>
          </Box>
        );
      },
    },
  ], []); // Dependências vazias pois as funções agora são estáveis (mutate)

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          Pedidos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={20} strokeWidth={1.5} />}
          onClick={handleNewOrder}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Novo Pedido
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
          rows={orders}
          columns={columns}
          loading={isLoading} // React Query gere isto para nós
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 20]}
          sx={{ border: 'none' }}
        />
      </Paper>

      <OrderDetailsModal
        open={selectedOrderId !== null}
        handleClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
      />

      <EditOrderModal 
        open={editModalOpen}
        handleClose={() => setEditModalOpen(false)}
        // Atualiza a lista ao salvar (invalida cache)
        onSave={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
        order={orderToEdit}
        setSnackbar={setSnackbar}
      />

      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
