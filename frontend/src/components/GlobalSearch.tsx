// src/components/GlobalSearch.tsx
import { useState, useEffect, useRef } from 'react';
import { 
  Box, InputBase, Paper, Typography, List, ListItem, 
  ListItemText, ListItemIcon, CircularProgress, Divider, alpha 
} from '@mui/material';
import { Search, User, Package, Receipt, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Interfaces dos resultados
interface SearchResults {
  clients: { id: number; name: string; phone: string }[];
  orders: { id: number; client: { name: string } | null; total: number; status: string }[];
  products: { id: number; name: string; price: number }[];
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Efeito de Debounce (Espera o usuário parar de digitar)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults(null);
      }
    }, 500); // 500ms de atraso

    return () => clearTimeout(timer);
  }, [query]);

  // Fecha os resultados se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async () => {
    setLoading(true);
    setShowResults(true);
    try {
      const response = await api.get(`/search?q=${query}`);
      setResults(response.data);
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setShowResults(false);
    setQuery(''); // Limpa a busca
  };

  const hasResults = results && (results.clients.length > 0 || results.orders.length > 0 || results.products.length > 0);

  return (
    <Box 
      ref={searchRef}
      sx={{ 
        position: 'relative', 
        borderRadius: 2,
        backgroundColor: alpha('#000', 0.05), // Cinza bem claro
        '&:hover': { backgroundColor: alpha('#000', 0.08) },
        marginRight: 2,
        marginLeft: 0,
        width: '100%',
        maxWidth: 400,
        display: { xs: 'none', sm: 'block' } // Esconde em mobile muito pequeno
      }}
    >
      {/* Input da Barra */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mr: 1 }}>
          {loading ? <CircularProgress size={20} /> : <Search size={20} />}
        </Box>
        <InputBase
          placeholder="Buscar cliente, pedido, produto..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length === 0) setShowResults(false);
          }}
          onFocus={() => { if (query.length >= 2) setShowResults(true); }}
          sx={{ width: '100%', fontSize: '0.9rem' }}
        />
        {query && (
          <Box 
            sx={{ cursor: 'pointer', color: 'text.secondary', display: 'flex' }} 
            onClick={() => { setQuery(''); setShowResults(false); }}
          >
            <X size={16} />
          </Box>
        )}
      </Box>

      {/* Dropdown de Resultados */}
      {showResults && (results || loading) && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            mt: 1,
            maxHeight: 400,
            overflowY: 'auto',
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}
        >
          {!loading && !hasResults && query.length >= 2 && (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              Nenhum resultado encontrado para "{query}".
            </Box>
          )}

          {/* Clientes */}
          {results?.clients && results.clients.length > 0 && (
            <>
              <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold', bgcolor: '#f9fafb', color: 'text.secondary' }}>
                CLIENTES
              </Typography>
              <List dense disablePadding>
                {results.clients.map(client => (
                  <ListItem key={client.id} button onClick={() => handleNavigate('/clients')}>
                    <ListItemIcon sx={{ minWidth: 36 }}><User size={18} /></ListItemIcon>
                    <ListItemText 
                      primary={client.name} 
                      secondary={client.phone || 'Sem telefone'} 
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Pedidos */}
          {results?.orders && results.orders.length > 0 && (
            <>
              <Divider />
              <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold', bgcolor: '#f9fafb', color: 'text.secondary' }}>
                PEDIDOS
              </Typography>
              <List dense disablePadding>
                {results.orders.map(order => (
                  <ListItem key={order.id} button onClick={() => handleNavigate('/orders')}>
                    <ListItemIcon sx={{ minWidth: 36 }}><Receipt size={18} /></ListItemIcon>
                    <ListItemText 
                      primary={`Pedido #${order.id} - ${order.client?.name || 'Balcão'}`} 
                      secondary={`${order.status} • R$ ${order.total.toFixed(2)}`} 
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Produtos */}
          {results?.products && results.products.length > 0 && (
            <>
              <Divider />
              <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold', bgcolor: '#f9fafb', color: 'text.secondary' }}>
                PRODUTOS
              </Typography>
              <List dense disablePadding>
                {results.products.map(product => (
                  <ListItem key={product.id} button onClick={() => handleNavigate('/products')}>
                    <ListItemIcon sx={{ minWidth: 36 }}><Package size={18} /></ListItemIcon>
                    <ListItemText 
                      primary={product.name} 
                      secondary={`R$ ${product.price.toFixed(2)}`} 
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}