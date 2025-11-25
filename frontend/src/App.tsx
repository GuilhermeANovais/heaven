import { 
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, 
  ListItemText, ListItemIcon, CssBaseline, ListItemButton
} from '@mui/material';
// Ícones da Lucide (Estilo Clean UI)
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  CalendarDays, 
  Users, 
  LogOut,
  ChefHat,
  History,
  Wallet,
  FileText,
  KanbanSquare,
  Settings
} from 'lucide-react';
import { Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Componentes
import { ProtectedRoute } from './components/ProtectedRoute';
import { GlobalSearch } from './components/GlobalSearch'; // Barra de Busca Global

// Páginas
import { ProductsPage } from './pages/ProductsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OrdersPage } from './pages/OrdersPage';
import { NewOrderPage } from './pages/NewOrderPage';
import { ClientsPage } from './pages/ClientsPage';
import { OrderCalendarPage } from './pages/OrderCalendarPage';
import { AuditPage } from './pages/AuditPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsHistoryPage } from './pages/ReportsHistoryPage';
import { KanbanPage } from './pages/KanbanPage';
import { SettingsPage } from './pages/SettingsPage';

const drawerWidth = 240;

/**
 * Componente do Layout Principal (Dashboard com menu lateral)
 */
function DashboardLayout() {
  const auth = useAuth();
  const location = useLocation();

  // Verifica se a rota atual corresponde ao link do menu
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Estilos fixos para o modo claro (Clean UI)
  const menuItemStyle = (path: string) => ({
    borderRadius: 2,
    mx: 1, 
    mb: 0.5, 
    // Fundo verde claro se ativo, transparente se inativo
    backgroundColor: isActive(path) ? '#e8f5e9' : 'transparent', 
    // Texto verde escuro se ativo, cinza escuro se inativo
    color: isActive(path) ? '#1B5E20' : '#4b5563', 
    '&:hover': {
      backgroundColor: isActive(path) ? '#c8e6c9' : '#f3f4f6', // Hover suave
    },
  });

  const iconStyle = (path: string) => ({
    // Ícone verde escuro se ativo, cinza claro se inativo
    color: isActive(path) ? '#1B5E20' : '#9ca3af',
    minWidth: 40,
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}> {/* Fundo cinza muito suave para o corpo */}
      <CssBaseline />
      
      {/* Barra Superior */}
      <AppBar
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white', 
          color: '#1a1a1a', 
          boxShadow: 'none', 
          borderBottom: '1px solid #e5e7eb' // Borda sutil em vez de sombra
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          
          {/* 1. Logo e Título */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
            <Box sx={{ 
              bgcolor: '#1B5E20', // Verde Institucional
              color: 'white', 
              p: 0.5, 
              borderRadius: 1, 
              display: 'flex' 
            }}>
              <ChefHat size={24} strokeWidth={1.5} />
            </Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', letterSpacing: '-0.5px', color: '#111827', display: { xs: 'none', md: 'block' } }}>
              Confeitaria Heaven
            </Typography>
          </Box>

          {/* 2. BUSCA GLOBAL (Centralizada) */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', maxWidth: 500 }}>
            <GlobalSearch />
          </Box>

          {/* Espaço vazio para equilibrar o layout à direita (onde estava o dark mode) */}
          <Box sx={{ minWidth: 40 }} />

        </Toolbar>
      </AppBar>

      {/* Menu Lateral (Sidebar) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            borderRight: '1px solid #e5e7eb',
            backgroundColor: 'white'
          },
        }}
      >
        <Toolbar /> {/* Espaçador para não ficar por baixo do AppBar */}
        
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%', pt: 2 }}>
          
          {/* --- LISTA PRINCIPAL (Navegação) --- */}
          <List>
            {/* Dashboard */}
            <ListItem key="Dashboard" disablePadding>
              <ListItemButton component={Link} to="/" sx={menuItemStyle('/')}>
                <ListItemIcon sx={iconStyle('/')}><LayoutDashboard size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 'medium', fontSize: '0.9rem' }} />
              </ListItemButton>
            </ListItem>

            {/* Pedidos */}
            <ListItem key="Pedidos" disablePadding>
              <ListItemButton component={Link} to="/orders" sx={menuItemStyle('/orders')}>
                <ListItemIcon sx={iconStyle('/orders')}><Receipt size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Pedidos" />
              </ListItemButton>
            </ListItem>

            {/* Calendário */}
            <ListItem key="Calendário" disablePadding>
              <ListItemButton component={Link} to="/calendar" sx={menuItemStyle('/calendar')}>
                <ListItemIcon sx={iconStyle('/calendar')}><CalendarDays size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Calendário" />
              </ListItemButton>
            </ListItem>

            {/* Produção (Kanban) */}
            <ListItem key="Produção" disablePadding>
              <ListItemButton component={Link} to="/production" sx={menuItemStyle('/production')}>
                <ListItemIcon sx={iconStyle('/production')}><KanbanSquare size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Produção" />
              </ListItemButton>
            </ListItem>

            {/* Produtos */}
            <ListItem key="Produtos" disablePadding>
              <ListItemButton component={Link} to="/products" sx={menuItemStyle('/products')}>
                <ListItemIcon sx={iconStyle('/products')}><ShoppingBag size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Produtos" />
              </ListItemButton>
            </ListItem>

            {/* Clientes */}
            <ListItem key="Clientes" disablePadding>
              <ListItemButton component={Link} to="/clients" sx={menuItemStyle('/clients')}>
                <ListItemIcon sx={iconStyle('/clients')}><Users size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Clientes" />
              </ListItemButton>
            </ListItem>

            {/* Despesas */}
            <ListItem key="Despesas" disablePadding>
              <ListItemButton component={Link} to="/expenses" sx={menuItemStyle('/expenses')}>
                <ListItemIcon sx={iconStyle('/expenses')}><Wallet size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Despesas" />
              </ListItemButton>
            </ListItem>

            {/* Histórico Financeiro */}
            <ListItem key="Histórico" disablePadding>
              <ListItemButton component={Link} to="/history" sx={menuItemStyle('/history')}>
                <ListItemIcon sx={iconStyle('/history')}><FileText size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Histórico" />
              </ListItemButton>
            </ListItem>

            {/* Auditoria */}
            <ListItem key="Auditoria" disablePadding>
              <ListItemButton component={Link} to="/audit" sx={menuItemStyle('/audit')}>
                <ListItemIcon sx={iconStyle('/audit')}><History size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Auditoria" />
              </ListItemButton>
            </ListItem>
          </List>
          
          {/* --- LISTA INFERIOR (Rodapé do Menu) --- */}
          <List sx={{ marginTop: 'auto', mb: 1 }}>
            
            {/* Configurações */}
            <ListItem key="Configurações" disablePadding>
              <ListItemButton component={Link} to="/settings" sx={menuItemStyle('/settings')}>
                <ListItemIcon sx={iconStyle('/settings')}><Settings size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Configurações" primaryTypographyProps={{ fontWeight: 'medium', fontSize: '0.9rem' }} />
              </ListItemButton>
            </ListItem>

            {/* Sair */}
            <ListItem key="Sair" disablePadding>
              <ListItemButton 
                onClick={() => auth.logout()}
                sx={{ 
                  borderRadius: 2, mx: 1, color: '#d32f2f', // Vermelho para ação de sair
                  '&:hover': { backgroundColor: '#fee2e2' }
                }}
              >
                <ListItemIcon sx={{ color: '#d32f2f', minWidth: 40 }}><LogOut size={20} strokeWidth={1.5} /></ListItemIcon>
                <ListItemText primary="Sair" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'medium' }} />
              </ListItemButton>
            </ListItem>
          </List>

        </Box>
      </Drawer>

      {/* Área de Conteúdo Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar /> {/* Espaçador invisível para compensar o AppBar fixo */}
        
        {/* Renderiza a página atual aqui */}
        <Outlet /> 
      </Box>
    </Box>
  );
}

/**
 * Componente Principal do App (Definição de Rotas)
 */
function App() {
  return (
    <Routes>
      {/* Rotas Públicas (Sem Layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rotas Protegidas (Com Layout Dashboard) */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* A rota 'index' é a página inicial (/) */}
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<NewOrderPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="calendar" element={<OrderCalendarPage />} />
        <Route path="production" element={<KanbanPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="history" element={<ReportsHistoryPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;