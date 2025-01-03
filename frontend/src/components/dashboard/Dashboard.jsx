import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Download as DownloadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0
  });
  const [projectData, setProjectData] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [user, filterPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const projectsRef = collection(db, 'projects');
      const tasksRef = collection(db, 'tasks');

      // Buscar projetos
      const projectsQuery = query(projectsRef, where('members', 'array-contains', user.uid));
      const projectsSnapshot = await getDocs(projectsQuery);
      
      const projects = [];
      let active = 0;
      let completed = 0;

      projectsSnapshot.forEach(doc => {
        const project = { id: doc.id, ...doc.data() };
        projects.push(project);
        if (project.status === 'Em Andamento') active++;
        if (project.status === 'Concluído') completed++;
      });

      // Buscar tarefas
      const tasksQuery = query(tasksRef);
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const tasksByStatusMap = {
        'Pendente': 0,
        'Em Progresso': 0,
        'Concluída': 0
      };

      const timelineMap = {};

      tasksSnapshot.forEach(doc => {
        const task = doc.data();
        tasksByStatusMap[task.status]++;

        // Processar dados para o gráfico de linha
        const date = new Date(task.createdAt);
        const key = filterPeriod === 'month' 
          ? `${date.getMonth() + 1}/${date.getFullYear()}`
          : `${date.getFullYear()}`;
        
        if (!timelineMap[key]) {
          timelineMap[key] = { date: key, tasks: 0 };
        }
        timelineMap[key].tasks++;
      });

      // Preparar dados para os gráficos
      const taskStatusData = Object.entries(tasksByStatusMap).map(([status, count]) => ({
        name: status,
        value: count
      }));

      const timelineDataArray = Object.values(timelineMap).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      setStats({
        totalProjects: projects.length,
        activeProjects: active,
        completedProjects: completed,
        totalTasks: tasksSnapshot.size
      });

      setProjectData(projects);
      setTasksByStatus(taskStatusData);
      setTimelineData(timelineDataArray);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Dados dos projetos
    const projectsWS = XLSX.utils.json_to_sheet(projectData.map(p => ({
      Nome: p.nome,
      Status: p.status,
      'Data Início': new Date(p.dataInicio).toLocaleDateString(),
      'Data Fim': p.dataFim ? new Date(p.dataFim).toLocaleDateString() : 'N/A'
    })));
    
    XLSX.utils.book_append_sheet(workbook, projectsWS, "Projetos");
    
    // Dados das tarefas
    const tasksWS = XLSX.utils.json_to_sheet(tasksByStatus);
    XLSX.utils.book_append_sheet(workbook, tasksWS, "Tarefas por Status");
    
    XLSX.writeFile(workbook, "relatorio-dashboard.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Relatório do Dashboard", 14, 15);
    
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 25);
    
    // Estatísticas gerais
    doc.text("Estatísticas Gerais", 14, 40);
    const statsData = [
      ["Total de Projetos", stats.totalProjects],
      ["Projetos Ativos", stats.activeProjects],
      ["Projetos Concluídos", stats.completedProjects],
      ["Total de Tarefas", stats.totalTasks]
    ];
    
    doc.autoTable({
      startY: 45,
      head: [["Métrica", "Valor"]],
      body: statsData
    });
    
    // Tarefas por status
    doc.text("Tarefas por Status", 14, doc.lastAutoTable.finalY + 15);
    const taskStatusData = tasksByStatus.map(item => [item.name, item.value]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Status", "Quantidade"]],
      body: taskStatusData
    });
    
    doc.save("relatorio-dashboard.pdf");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={filterPeriod}
              label="Período"
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <MenuItem value="month">Mensal</MenuItem>
              <MenuItem value="year">Anual</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportToExcel}
            sx={{ mr: 1 }}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportToPDF}
          >
            PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="textSecondary" gutterBottom>
              Total de Projetos
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalProjects}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="textSecondary" gutterBottom>
              Projetos Ativos
            </Typography>
            <Typography component="p" variant="h4">
              {stats.activeProjects}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="textSecondary" gutterBottom>
              Projetos Concluídos
            </Typography>
            <Typography component="p" variant="h4">
              {stats.completedProjects}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="textSecondary" gutterBottom>
              Total de Tarefas
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalTasks}
            </Typography>
          </Paper>
        </Grid>

        {/* Gráfico de Pizza - Status das Tarefas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Status das Tarefas
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Linha - Evolução das Tarefas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Evolução das Tarefas
            </Typography>
            <ResponsiveContainer>
              <LineChart data={timelineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tasks" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Barras - Projetos por Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Projetos por Status
            </Typography>
            <ResponsiveContainer>
              <BarChart data={[
                { name: 'Em Andamento', value: stats.activeProjects },
                { name: 'Concluídos', value: stats.completedProjects }
              ]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 