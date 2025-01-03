import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress
} from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjetos: 0,
    projetosAtivos: 0,
    tarefasPendentes: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const projetosRef = collection(db, 'projects');
        const q = query(projetosRef, where('members', 'array-contains', user.uid));
        const querySnapshot = await getDocs(q);
        
        let ativos = 0;
        let tarefas = 0;
        
        querySnapshot.forEach(doc => {
          const projeto = doc.data();
          if (projeto.status === 'Em Andamento') ativos++;
          if (projeto.tasks) tarefas += projeto.tasks.filter(t => t.status === 'Pendente').length;
        });

        setStats({
          totalProjetos: querySnapshot.size,
          projetosAtivos: ativos,
          tarefasPendentes: tarefas
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
        </Grid>
        
        {/* Cards de Estatísticas */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Projetos
              </Typography>
              <Typography variant="h3">
                {stats.totalProjetos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Projetos Ativos
              </Typography>
              <Typography variant="h3">
                {stats.projetosAtivos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tarefas Pendentes
              </Typography>
              <Typography variant="h3">
                {stats.tarefasPendentes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Área Principal */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Atividades Recentes
            </Typography>
            {/* Aqui você pode adicionar uma lista de atividades recentes */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 