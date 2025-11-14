// src/pages/NewOrderPage.tsx
import {
  Box, Typography, Grid, Paper, List, ListItem, ListItemText, Button,
  CircularProgress, Divider, IconButton
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Interface para os nossos produtos (do backend)
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

// Interface para o item no carrinho
interface CartItem extends Product {
  quantity: number;
}

export function NewOrderPage() {
  const [products, setProducts] = useState<Product[]>([]); // Lista de produtos disponíveis
  const [cart, setCart] = useState<CartItem[]>([]); // Itens no carrinho
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  // Buscar todos os produtos disponíveis ao carregar a página
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  // --- LÓGICA DO CARRINHO ---

  // 1. Adicionar um produto ao carrinho
  const handleAddToCart = (productToAdd: Product) => {
    setCart((prevCart) => {
      // Verifique se o item já existe no carrinho
      const existingItem = prevCart.find((item) => item.id === productToAdd.id);

      if (existingItem) {
        // Se existir, apenas aumente a quantidade
        return prevCart.map((item) =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Se não existir, adicione-o ao carrinho com quantidade 1
        return [...prevCart, { ...productToAdd, quantity: 1 }];
      }
    });
  };

  // 2. Diminuir a quantidade ou remover
  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);

      if (!existingItem) return prevCart;

      // Se a quantidade for 1, remova o item do carrinho
      if (existingItem.quantity === 1) {
        return prevCart.filter((item) => item.id !== productId);
      }
      
      // Caso contrário, apenas diminua a quantidade
      return prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  // 3. Remover completamente o item (botão da lixeira)
  const handleDeleteItem = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // 4. Calcular o total (useMemo evita recálculos desnecessários)
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  // 5. Finalizar o pedido
  const handleFinishOrder = () => {
    console.log("Pedido a ser enviado:", cart);
    // Próximo passo: Chamar o api.post('/orders', ...)
  };

  // --- JSX ---

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Criar Novo Pedido
      </Typography>
      
      <Grid container spacing={3}>
        {/* Coluna da Esquerda: Lista de Produtos */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: 'white' }}>
            <Typography variant="h6" gutterBottom>Produtos Disponíveis</Typography>
            {loadingProducts ? (
              <CircularProgress />
            ) : (
              <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                {products.map((product) => (
                  <ListItem 
                    key={product.id}
                    divider
                    secondaryAction={
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleAddToCart(product)} // Ação de adicionar
                      >
                        Adicionar
                      </Button>
                    }
                  >
                    <ListItemText 
                      primary={product.name}
                      secondary={`R$ ${product.price.toFixed(2)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Coluna da Direita: Carrinho */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: 'white' }}>
            <Typography variant="h6" gutterBottom>Carrinho</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Lista de Itens no Carrinho */}
            <List sx={{ maxHeight: '40vh', overflow: 'auto' }}>
              {cart.length === 0 ? (
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  O carrinho está vazio.
                </Typography>
              ) : (
                cart.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText 
                      primary={item.name}
                      secondary={`Qtd: ${item.quantity} x R$ ${item.price.toFixed(2)}`}
                    />
                    <IconButton size="small" onClick={() => handleAddToCart(item)}>
                      <Add />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRemoveFromCart(item.id)}>
                      <Remove />
                    </IconButton>
                    <IconButton size="small" edge="end" onClick={() => handleDeleteItem(item.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </ListItem>
                ))
              )}
            </List>

            <Divider sx={{ mt: 2, mb: 2 }} />

            <Typography variant="h5">
              Total: R$ {total.toFixed(2)}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={cart.length === 0} // Habilita se o carrinho tiver itens
              onClick={handleFinishOrder}
            >
              Finalizar Pedido
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}