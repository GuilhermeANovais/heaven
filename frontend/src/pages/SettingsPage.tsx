import { 
  Box, Typography, Paper, Button, Divider, Alert, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  CircularProgress
} from '@mui/material';
import { Trash2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import api from '../api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [targetAction, setTargetAction] = useState<'orders' | 'expenses' | null>(null);

  // Mutation genérica para limpeza
  const clearDataMutation = useMutation({
    mutationFn: async (type: 'orders' | 'expenses') => {
      // Chama o endpoint correspondente
      const endpoint = type === 'orders' ? '/orders/delete-all' : '/expenses/delete-all';
      await api.delete(endpoint);
    },
    onSuccess: () => {
      // Atualiza caches e fecha dialog
      if (targetAction === 'orders') queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (targetAction === 'expenses') queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      handleCloseDialog();
      alert('Dados limpos com sucesso!');
    },
    onError: () => {
      alert('Erro ao limpar dados. Tente novamente.');
      handleCloseDialog();
    }
  });

  const handleOpenDialog = (action: 'orders' | 'expenses') => {
    setTargetAction(action);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTargetAction(null);
  };

  const handleConfirm = () => {
    if (targetAction) {
      clearDataMutation.mutate(targetAction);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', pt: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Configurações
      </Typography>

      <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, color: '#d32f2f' }}>
          <ShieldAlert size={32} />
          <Typography variant="h6" fontWeight="bold">
            Zona de Perigo
          </Typography>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 4 }}>
          As ações abaixo são irreversíveis. Tenha certeza absoluta antes de prosseguir.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Limpar Pedidos */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Limpar todos os Pedidos</Typography>
              <Typography variant="body2" color="text.secondary">
                Apaga permanentemente todo o histórico de pedidos e itens vendidos.
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<Trash2 size={18} />}
              onClick={() => handleOpenDialog('orders')}
            >
              Limpar Pedidos
            </Button>
          </Box>

          <Divider />

          {/* Limpar Despesas */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Limpar todas as Despesas</Typography>
              <Typography variant="body2" color="text.secondary">
                Apaga permanentemente todo o registro de saídas e custos.
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<Trash2 size={18} />}
              onClick={() => handleOpenDialog('expenses')}
            >
              Limpar Despesas
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Dialog de Confirmação */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldAlert size={24} />
          Confirmação de Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza absoluta que deseja apagar <b>TODOS</b> os {targetAction === 'orders' ? 'pedidos' : 'registros de despesas'}?
            <br /><br />
            Esta ação não pode ser desfeita e os dados serão perdidos para sempre.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            color="error" 
            variant="contained" 
            autoFocus
            disabled={clearDataMutation.isPending}
          >
            {clearDataMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Sim, Apagar Tudo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
