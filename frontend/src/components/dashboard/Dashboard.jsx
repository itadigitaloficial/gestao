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
  InputLabel,
  IconButton,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Tooltip,
  styled,
  Chip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  transition: 'box-shadow 0.3s ease-in-out',
}));

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
  <StyledCard>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Typography color="textSecondary" variant="subtitle2">
        {title}
      </Typography>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {trend === 'up' ? (
            <ArrowUpwardIcon sx={{ color: 'success.main', fontSize: 16 }} />
          ) : (
            <ArrowDownwardIcon sx={{ color: 'error.main', fontSize: 16 }} />
          )}
          <Typography
            variant="caption"
            sx={{
              color: trend === 'up' ? 'success.main' : 'error.main',
              ml: 0.5,
            }}
          >
            {trendValue}% em relação ao mês anterior
          </Typography>
        </Box>
      )}
    </CardContent>
  </StyledCard>
);

const TaskCard = ({ task }) => (
  <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
    <Avatar sx={{ bgcolor: task.priority === 'Alta' ? 'error.main' : 'primary.main', mr: 2 }}>
      {task.title[0]}
    </Avatar>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="subtitle1">{task.title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
        <Typography variant="caption" color="textSecondary">
          {task.dueDate}
        </Typography>
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
            {task.assignee[0]}
          </Avatar>
        </Box>
      </Box>
    </Box>
    <Chip
      label={task.status}
      size="small"
      color={task.status === 'Concluída' ? 'success' : 'default'}
    />
  </Paper>
);

const ProjectProgressCard = ({ project }) => (
  <Paper sx={{ p: 2, mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="subtitle1">{project.name}</Typography>
      <Typography variant="subtitle2" color="textSecondary">
        {project.progress}%
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={project.progress}
      sx={{
        height: 8,
        borderRadius: 4,
        bgcolor: 'rgba(0, 0, 0, 0.1)',
        '& .MuiLinearProgress-bar': {
          borderRadius: 4,
        },
      }}
    />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
      <Typography variant="caption" color="textSecondary">
        {project.startDate}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {project.endDate}
      </Typography>
    </Box>
  </Paper>
);

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
      <Grid container spacing={3}>
        {/* Estatísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Projetos"
            value={stats.totalProjects}
            icon={<AssignmentIcon />}
            color="#1976d2"
            trend="up"
            trendValue={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Projetos Ativos"
            value={stats.activeProjects}
            icon={<GroupIcon />}
            color="#2e7d32"
            trend="up"
            trendValue={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tarefas Pendentes"
            value={stats.totalTasks}
            icon={<WarningIcon />}
            color="#ed6c02"
            trend="down"
            trendValue={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tarefas Concluídas"
            value={stats.completedTasks}
            icon={<CheckCircleIcon />}
            color="#9c27b0"
            trend="up"
            trendValue={15}
          />
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Evolução dos Projetos</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                >
                  <MenuItem value="week">Semana</MenuItem>
                  <MenuItem value="month">Mês</MenuItem>
                  <MenuItem value="year">Ano</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#1976d2"
                  fillOpacity={1}
                  fill="url(#colorTasks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Status das Tarefas
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
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
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tarefas Recentes e Projetos em Andamento */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tarefas Recentes
            </Typography>
            {recentTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Progresso dos Projetos
            </Typography>
            {activeProjects.map((project) => (
              <ProjectProgressCard key={project.id} project={project} />
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 