import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Box
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    status: 'Em Andamento'
  });
  
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('members', 'array-contains', user.uid));
      const querySnapshot = await getDocs(q);
      
      const projectsList = [];
      querySnapshot.forEach((doc) => {
        projectsList.push({ id: doc.id, ...doc.data() });
      });
      
      setProjects(projectsList);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  const handleOpen = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        nome: project.nome,
        descricao: project.descricao,
        dataInicio: project.dataInicio,
        dataFim: project.dataFim,
        status: project.status
      });
    } else {
      setEditingProject(null);
      setFormData({
        nome: '',
        descricao: '',
        dataInicio: '',
        dataFim: '',
        status: 'Em Andamento'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...formData,
          owner: user.uid,
          members: [user.uid],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      handleClose();
      fetchProjects();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await deleteDoc(doc(db, 'projects', projectId));
        fetchProjects();
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projetos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Novo Projeto
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.nome}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {project.descricao}
                </Typography>
                <Chip
                  label={project.status}
                  color={project.status === 'Em Andamento' ? 'primary' : 'default'}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Box display="flex" justifyContent="flex-end">
                  <IconButton onClick={() => handleOpen(project)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(project.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nome do Projeto"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Data de Início"
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Data de Término"
              type="date"
              value={formData.dataFim}
              onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingProject ? 'Salvar' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ProjectList; 