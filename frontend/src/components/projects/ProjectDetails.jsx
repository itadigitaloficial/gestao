import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Comment as CommentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import TaskForm from '../tasks/TaskForm';
import CommentSection from '../comments/CommentSection';
import FileUpload from '../files/FileUpload';

const ProjectDetails = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const { projectId } = useParams();
  const { user } = useAuth();
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() });
        await Promise.all([
          fetchTasks(),
          fetchTeamMembers()
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do projeto:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasksList = [];
    tasksSnapshot.forEach(doc => {
      tasksList.push({ id: doc.id, ...doc.data() });
    });
    setTasks(tasksList);
  };

  const fetchTeamMembers = async () => {
    if (project?.team) {
      const teamMembers = await Promise.all(
        project.team.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          return { id: userDoc.id, ...userDoc.data() };
        })
      );
      setTeam(teamMembers);
    }
  };

  const calculateProgress = () => {
    if (!tasks.length) return 0;
    const completed = tasks.filter(task => task.status === 'Concluída').length;
    return (completed / tasks.length) * 100;
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskFormOpen(true);
  };

  const handleTaskSaved = () => {
    fetchTasks();
    setTaskFormOpen(false);
    setSelectedTask(null);
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Cabeçalho do Projeto */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {project?.nome}
            </Typography>
            <Typography color="textSecondary" paragraph>
              {project?.descricao}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={project?.status}
                color={project?.status === 'Em Andamento' ? 'primary' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip
                icon={<ScheduleIcon />}
                label={`Prazo: ${new Date(project?.dataFim).toLocaleDateString()}`}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Excluir
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Barra de Progresso */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Progresso do Projeto
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {Math.round(calculateProgress())}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={calculateProgress()}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
      </Paper>

      {/* Abas de Conteúdo */}
      <Box sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Tarefas" />
          <Tab label="Equipe" />
          <Tab label="Arquivos" />
          <Tab label="Comentários" />
        </Tabs>

        {/* Conteúdo das Abas */}
        <Box role="tabpanel" hidden={activeTab !== 0}>
          {activeTab === 0 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Lista de Tarefas</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Nova Tarefa
                </Button>
              </Box>
              <List>
                {tasks.map((task) => (
                  <Paper key={task.id} sx={{ mb: 2 }}>
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end">
                          <EditIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={task.titulo}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {task.descricao}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                size="small"
                                label={task.status}
                                color={task.status === 'Concluída' ? 'success' : 'default'}
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                size="small"
                                label={`Prazo: ${new Date(task.prazo).toLocaleDateString()}`}
                              />
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {/* Aba de Equipe */}
        <Box role="tabpanel" hidden={activeTab !== 1}>
          {activeTab === 1 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Membros da Equipe</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Adicionar Membro
                </Button>
              </Box>
              <Grid container spacing={2}>
                {team.map((member) => (
                  <Grid item xs={12} sm={6} md={4} key={member.id}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{member.nome[0]}</Avatar>
                        <Box>
                          <Typography variant="subtitle1">{member.nome}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {member.cargo}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        {/* Aba de Arquivos */}
        <Box role="tabpanel" hidden={activeTab !== 2}>
          {activeTab === 2 && (
            <FileUpload projectId={projectId} />
          )}
        </Box>

        {/* Aba de Comentários */}
        <Box role="tabpanel" hidden={activeTab !== 3}>
          {activeTab === 3 && (
            <CommentSection projectId={projectId} />
          )}
        </Box>
      </Box>

      {/* Adicione o TaskForm */}
      <TaskForm
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setSelectedTask(null);
        }}
        projectId={projectId}
        task={selectedTask}
        onTaskSaved={handleTaskSaved}
      />
    </Container>
  );
};

export default ProjectDetails; 