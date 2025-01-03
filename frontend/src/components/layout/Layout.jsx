import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Badge,
  Tooltip,
  styled
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Assignment as ProjectIcon,
  Task as TaskIcon,
  Group as TeamIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import NotificationSystem from '../notifications/NotificationSystem';

const drawerWidth = 280;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: '#1a237e',
    color: 'white',
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: 'none',
  },
}));

const MenuItemStyled = styled(ListItem)(({ theme, active }) => ({
  margin: '8px 16px',
  borderRadius: '12px',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  ...(active && {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  }),
}));

const IconStyled = styled(ListItemIcon)({
  color: 'white',
  minWidth: '45px',
});

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/dashboard',
    color: '#4fc3f7'
  },
  { 
    text: 'Projetos', 
    icon: <ProjectIcon />, 
    path: '/projects',
    color: '#81c784'
  },
  { 
    text: 'Tarefas', 
    icon: <TaskIcon />, 
    path: '/tasks',
    color: '#ffb74d'
  },
  { 
    text: 'Equipe', 
    icon: <TeamIcon />, 
    path: '/team',
    color: '#ba68c8'
  },
  { 
    text: 'Calendário', 
    icon: <CalendarIcon />, 
    path: '/calendar',
    color: '#e57373'
  },
  { 
    text: 'Relatórios', 
    icon: <ReportIcon />, 
    path: '/reports',
    color: '#4db6ac'
  },
  { 
    text: 'Análises', 
    icon: <TimelineIcon />, 
    path: '/analytics',
    color: '#7986cb'
  },
  { 
    text: 'Métricas', 
    icon: <TrendingUpIcon />, 
    path: '/metrics',
    color: '#f06292'
  }
];

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Pesquisar">
              <IconButton color="inherit">
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <NotificationSystem />

            <Tooltip title="Configurações">
              <IconButton color="inherit">
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={handleMenuOpen}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {user?.email?.[0].toUpperCase()}
              </Avatar>
              <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2">
                  {user?.email}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Administrador
                </Typography>
              </Box>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
          >
            <MenuItem onClick={() => navigate('/profile')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <StyledDrawer
        variant="permanent"
        open={open}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            ITA Digital
          </Typography>
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <List sx={{ p: 2 }}>
          {menuItems.map((item) => (
            <MenuItemStyled
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              active={location.pathname === item.path ? 1 : 0}
            >
              <IconStyled sx={{ color: item.color }}>
                {item.icon}
              </IconStyled>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              />
              {item.text === 'Tarefas' && (
                <Badge 
                  badgeContent={4} 
                  color="error"
                  sx={{ 
                    '& .MuiBadge-badge': {
                      right: -3,
                      top: 13,
                      border: `2px solid #1a237e`,
                      padding: '0 4px',
                    },
                  }}
                />
              )}
            </MenuItemStyled>
          ))}
        </List>

        <Box sx={{ p: 2, mt: 'auto' }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Precisa de ajuda?
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Acesse nossa documentação
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: 'white',
                color: '#1a237e',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Documentação
            </Button>
          </Box>
        </Box>
      </StyledDrawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          marginTop: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 