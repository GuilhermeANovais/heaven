import { useState } from 'react';
import { 
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, 
  ListItemText, ListItemIcon, CssBaseline, ListItemButton, IconButton 
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
  Settings,
  Menu as MenuIcon 
} from 'lucide-react';
import { Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Componentes
import { ProtectedRoute } from './components/ProtectedRoute';
import { GlobalSearch } from './components/GlobalSearch'; 

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const menuItemStyle = (path: string) => ({
    borderRadius: 2,
    mx: 1, 
    mb: 0.5, 
    backgroundColor: isActive(path) ? '#e8f5e9' : 'transparent', 
    color: isActive(path) ? '#1B5E20' : '#4b5563', 
    '&:hover': {
      backgroundColor: isActive(path) ? '#c8e6c9' : '#f3f4f6', 
    },
  });

  const iconStyle = (path: string) => ({
    color: isActive(path) ? '#1B5E20' : '#9ca3af',
    minWidth: 40,
  });

  const drawerContent = (
    <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%', pt: 2 }}>
      <List>
        <ListItem key="Dashboard" disablePadding>
          <ListItemButton component={Link} to="/" sx={menuItemStyle('/')} onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={iconStyle('/')}><LayoutDashboard size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 'medium', fontSize: '0.9rem' }} />
          </ListItemButton>
        </ListItem>

        <ListItem key="Pedidos" disablePadding>
          <ListItemButton component={Link} to="/orders" sx={menuItemStyle('/orders')} onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={iconStyle('/orders')}><Receipt size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Pedidos" />
          </ListItemButton>
        </ListItem>

        <ListItem key="Calendário" disablePadding>
          <ListItemButton component={Link} to="/calendar" sx={menuItemStyle('/calendar')} onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={iconStyle('/calendar')}><CalendarDays size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Calendário" />
          </ListItemButton>
        </ListItem>

        <ListItem key="Produção" disablePadding>
          <ListItemButton component={Link} to="/production" sx={menuItemStyle('/production')} onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={iconStyle('/production')}><KanbanSquare size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Produção" />
          </ListItemButton>
        </ListItem>

        <ListItem key="Produtos" disablePadding>
          <ListItemButton component={Link} to="/products" sx={menuItemStyle('/products')} onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={iconStyle('/products')}><ShoppingBag size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Produtos" />
          </ListItemButton>
        </ListItem>

        <ListItem key="Clientes" disablePadding>
          <ListItemButton component={Link} to="/clients" sx={menuItemStyle('/clients')} onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={iconStyle('/clients')}><Users size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Clientes" />
          </ListItemButton>
        </ListItem>

        <ListItem key="Despesas" disablePadding>
          <ListItemButton component={Link} to="/expenses" sx={menuItemStyle('/expenses')} onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={iconStyle('/expenses')}><Wallet size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Despesas" />
          </ListItemButton>
        </ListItem>

        <ListItem key="Histórico" disablePadding>
          <ListItemButton component={Link} to="/history" sx={menuItemStyle('/history')} onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={iconStyle('/history')}><FileText size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Histórico" />
          </ListItemButton>
        </ListItem>

        <ListItem key="Auditoria" disablePadding>
          <ListItemButton component={Link} to="/audit" sx={menuItemStyle('/audit')} onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={iconStyle('/audit')}><History size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Auditoria" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <List sx={{ marginTop: 'auto', mb: 1 }}>
        <ListItem key="Configurações" disablePadding>
          <ListItemButton component={Link} to="/settings" sx={menuItemStyle('/settings')} onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={iconStyle('/settings')}><Settings size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Configurações" primaryTypographyProps={{ fontWeight: 'medium', fontSize: '0.9rem' }} />
          </ListItemButton>
        </ListItem>

        <ListItem key="Sair" disablePadding>
          <ListItemButton 
            onClick={() => auth.logout()}
            sx={{ 
              borderRadius: 2, mx: 1, color: '#d32f2f', 
              '&:hover': { backgroundColor: '#fee2e2' }
            }}
          >
            <ListItemIcon sx={{ color: '#d32f2f', minWidth: 40 }}><LogOut size={20} strokeWidth={1.5} /></ListItemIcon>
            <ListItemText primary="Sair" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'medium' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}> 
      <CssBaseline />
      
      {/* Barra Superior */}
      <AppBar
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white', 
          color: '#1a1a1a', 
          boxShadow: 'none', 
          borderBottom: '1px solid #e5e7eb',
          // O AppBar ocupa toda a largura em todos os layouts (Clipped Drawer)
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          
          {/* LADO ESQUERDO: Menu (Mobile) + Logo (Sempre Visível) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            {/* Botão Menu (Apenas Mobile) */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo e Título (Sempre presentes na Barra) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                bgcolor: '#1B5E20', 
                color: 'white', 
                p: 0.5, 
                borderRadius: 1, 
                display: 'flex' 
              }}>
                <ChefHat size={24} strokeWidth={1.5} />
              </Box>
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 'bold', 
                  letterSpacing: '-0.5px', 
                  color: '#111827', 
                  display: { xs: 'none', md: 'block' } // Texto apenas em Desktop para economizar espaço no mobile
                }}
              >
                Confeitaria Heaven
              </Typography>
            </Box>
          </Box>

          {/* CENTRO/DIREITA: Busca Global */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', maxWidth: 500 }}>
            <GlobalSearch />
          </Box>

          {/* Espaço ou Ações à Direita */}
          <Box sx={{ minWidth: 40 }} />
        </Toolbar>
      </AppBar>

      {/* Navegação (Drawer) */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Drawer Mobile (Temporário) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} 
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <Toolbar /> {/* Espaçador para o AppBar */}
          {drawerContent}
        </Drawer>

        {/* Drawer Desktop (Permanente) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #e5e7eb' },
          }}
          open
        >
          <Toolbar /> {/* Espaçador para o AppBar */}
          {drawerContent}
        </Drawer>
      </Box>

      {/* Área de Conteúdo Principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          overflowX: 'hidden' 
        }}
      >
        <Toolbar /> 
        <Outlet /> 
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
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