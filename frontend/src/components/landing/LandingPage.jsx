import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Dashboard Intuitivo',
      description: 'Visualize todos os seus projetos e métricas importantes em um único lugar.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Segurança Garantida',
      description: 'Seus dados estão protegidos com a mais alta tecnologia em segurança.'
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Gestão de Tarefas',
      description: 'Organize e acompanhe todas as tarefas do seu projeto de forma eficiente.'
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Colaboração em Equipe',
      description: 'Trabalhe em conjunto com sua equipe em tempo real.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `url('/assets/pattern.png')`,
            opacity: 0.1,
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                color="white"
                fontWeight="bold"
                gutterBottom
              >
                Gestão de Projetos
                <Typography
                  component="span"
                  variant="h2"
                  color={theme.palette.secondary.main}
                  fontWeight="bold"
                >
                  {' '}ITA Digital
                </Typography>
              </Typography>
              <Typography
                variant="h5"
                color="white"
                sx={{ mb: 4, opacity: 0.9 }}
              >
                Simplifique a gestão dos seus projetos com nossa plataforma intuitiva e poderosa.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: theme.shadows[10]
                }}
              >
                Começar Agora
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/assets/dashboard-preview.png"
                alt="Dashboard Preview"
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  borderRadius: 2,
                  boxShadow: theme.shadows[20],
                  transform: 'perspective(1000px) rotateY(-10deg)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Recursos Principais
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    align="center"
                    gutterBottom
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    color="textSecondary"
                    align="center"
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          py: 8
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
          >
            Pronto para transformar a gestão dos seus projetos?
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="textSecondary"
            paragraph
            sx={{ mb: 4 }}
          >
            Junte-se a milhares de empresas que já estão usando nossa plataforma.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
            >
              Começar Gratuitamente
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/about')}
            >
              Saiba Mais
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 