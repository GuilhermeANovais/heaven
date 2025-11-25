import { Box, Typography, Button, IconButton, Paper, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FileDown, TrendingUp, TrendingDown, Minus } from 'lucide-react'; // Ícones
import { useEffect, useState } from 'react';
import api from '../api';

interface MonthlyReport {
  id: number;
  month: number;
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  createdAt: string;
}

export function ReportsHistoryPage() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = async (id: number, month: number, year: number) => {
    try {
      const response = await api.get(`/reports/${id}/download`, {
        responseType: 'blob', // Importante para arquivos
      });

      // Cria o link temporário para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Relatorio_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      alert("Erro ao baixar o relatório.");
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'period', 
      headerName: 'Período', 
      width: 150,
      valueGetter: (_value, row) => {
        // Formata o mês (ex: 1 -> Janeiro)
        const date = new Date(row.year, row.month - 1);
        return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      },
      renderCell: (params) => (
        <Typography sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'totalRevenue', 
      headerName: 'Faturamento', 
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#16a34a' }}>
          <TrendingUp size={16} />
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value)}
        </Box>
      )
    },
    { 
      field: 'totalExpenses', 
      headerName: 'Despesas', 
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#dc2626' }}>
          <TrendingDown size={16} />
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value)}
        </Box>
      )
    },
    { 
      field: 'netProfit', 
      headerName: 'Lucro Líquido', 
      width: 150,
      renderCell: (params) => {
        const isPositive = params.value >= 0;
        return (
          <Chip 
            label={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value)}
            color={isPositive ? 'success' : 'error'}
            variant="outlined"
            size="small"
            icon={isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            sx={{ fontWeight: 'bold' }}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Relatório',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDown size={18} />}
          onClick={() => handleDownload(params.row.id, params.row.month, params.row.year)}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Baixar PDF
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          Histórico Financeiro
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Relatórios mensais gerados automaticamente
        </Typography>
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
          rows={reports}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 20]}
          sx={{ border: 'none' }}
          localeText={{ noRowsLabel: 'Nenhum fechamento mensal encontrado.' }}
        />
      </Paper>
    </Box>
  );
}