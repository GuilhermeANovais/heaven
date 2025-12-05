// src/pages/KanbanPage.tsx
import { Box, Typography, Paper, Chip, IconButton, Alert, Snackbar } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <--- React Query
import api from '../api';
import { OrderSummary } from '../types/entities';
import { Eye } from 'lucide-react';
import { OrderDetailsModal } from '../components/OrderDetailsModal';

// Mapeamento de Status para Títulos das Colunas
const COLUMNS = {
  PENDENTE: { title: 'A Fazer 📋', color: '#f5f5f5', border: '#d1d5db' },
  EM_PREPARO: { title: 'No Forno 🔥', color: '#fff7ed', border: '#fdba74' },
  PRONTO: { title: 'Pronto / Embalagem 🎁', color: '#f0fdf4', border: '#86efac' },
  CONCLUÍDO: { title: 'Entregue ✅', color: '#eff6ff', border: '#93c5fd' },
  // SINAL_PAGO removido do fluxo visual padrão, mas existente nos dados
};

const COLUMN_ORDER = ['PENDENTE', 'EM_PREPARO', 'PRONTO', 'CONCLUÍDO'];

export function KanbanPage() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // 1. BUSCAR PEDIDOS (Cache partilhado com a lista de Orders!)
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get<OrderSummary[]>('/orders');
      return response.data;
    },
    // Atualiza a cada 30 segundos para ver novos pedidos que chegaram
    refetchInterval: 30000, 
  });

  // 2. AGRUPAR PEDIDOS POR COLUNA (Derivado do cache)
  const columns = useMemo(() => {
    const cols: Record<string, OrderSummary[]> = {
      PENDENTE: [], EM_PREPARO: [], PRONTO: [], CONCLUÍDO: []
    };

    orders.forEach(order => {
      // Só adiciona se o status existir nas colunas visíveis
      if (cols[order.status]) {
        cols[order.status].push(order);
      }
    });

    return cols;
  }, [orders]);

  // 3. MUTATION COM OPTIMISTIC UPDATE
  const moveCardMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: number; newStatus: string }) => {
      await api.patch(`/orders/${id}`, { status: newStatus });
    },
    // --- A MAGIA ACONTECE AQUI ---
    onMutate: async ({ id, newStatus }) => {
      // a) Cancelar queries de saída para não sobrescreverem o nosso update otimista
      await queryClient.cancelQueries({ queryKey: ['orders'] });

      // b) Guardar o estado anterior (snapshot) caso dê erro
      const previousOrders = queryClient.getQueryData<OrderSummary[]>(['orders']);

      // c) Atualizar o cache localmente de forma manual
      if (previousOrders) {
        queryClient.setQueryData<OrderSummary[]>(['orders'], (old) => {
          if (!old) return [];
          return old.map(order => 
            order.id === id ? { ...order, status: newStatus } : order
          );
        });
      }

      // Retornar contexto para caso de erro
      return { previousOrders };
    },
    onError: (_err, _newTodo, context) => {
      // Se der erro, reverte para o snapshot
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
      setSnackbarMessage('Erro ao mover pedido. Tente novamente.');
    },
    onSettled: () => {
      // No final (sucesso ou erro), sincroniza com o servidor para garantir consistência
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Dispara a mutação (o React Query cuida da UI instantaneamente via onMutate)
    moveCardMutation.mutate({
      id: Number(draggableId),
      newStatus: destination.droppableId
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
        Quadro de Produção
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          overflowX: 'auto', 
          pb: 2, 
          flexGrow: 1 
        }}>
          {COLUMN_ORDER.map(columnId => {
            // Usa as colunas calculadas via useMemo
            const columnData = COLUMNS[columnId as keyof typeof COLUMNS];
            const ordersInColumn = columns[columnId] || [];

            return (
              <Box 
                key={columnId}
                sx={{ 
                  minWidth: 280, 
                  width: 320,
                  display: 'flex', 
                  flexDirection: 'column' 
                }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, mb: 2, 
                    backgroundColor: columnData.color, 
                    borderTop: `4px solid ${columnData.border}`,
                    fontWeight: 'bold',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  {columnData.title}
                  <Chip label={ordersInColumn.length} size="small" sx={{ bgcolor: 'white', fontWeight: 'bold' }} />
                </Paper>

                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        flexGrow: 1,
                        backgroundColor: snapshot.isDraggingOver ? '#f3f4f6' : 'transparent',
                        borderRadius: 2,
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      {ordersInColumn.map((order, index) => (
                        <Draggable key={order.id} draggableId={String(order.id)} index={index}>
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              elevation={snapshot.isDragging ? 4 : 0}
                              sx={{
                                p: 2, mb: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                backgroundColor: 'white',
                                transition: 'transform 0.2s',
                                ...provided.draggableProps.style
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  #{order.id} - {order.client?.name || 'Balcão'}
                                </Typography>
                                <IconButton size="small" onClick={() => setSelectedOrderId(order.id)}>
                                  <Eye size={16} />
                                </IconButton>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {/* Number() para segurança com Decimals */}
                                {order.items.length} Itens • R$ {Number(order.total).toFixed(2)}
                              </Typography>

                              {order.deliveryDate && (
                                <Chip 
                                  label={new Date(order.deliveryDate).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'})} 
                                  size="small" 
                                  color={new Date(order.deliveryDate) < new Date() ? "error" : "default"}
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            );
          })}
        </Box>
      </DragDropContext>

      <OrderDetailsModal
        open={selectedOrderId !== null}
        handleClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
      />

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSnackbarMessage(null)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
