import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const TaskForm = ({ open, onClose, projectId, task = null, onTaskSaved }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'Pendente',
    prazo: '',
    prioridade: 'Média'
  });

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo,
        descricao: task.descricao,
        status: task.status,
        prazo: task.prazo,
        prioridade: task.prioridade
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (task) {
        await updateDoc(doc(db, 'tasks', task.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'tasks'), {
          ...formData,
          projectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      onTaskSaved();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {task ? 'Editar Tarefa' : 'Nova Tarefa'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
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
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="Pendente">Pendente</MenuItem>
              <MenuItem value="Em Progresso">Em Progresso</MenuItem>
              <MenuItem value="Concluída">Concluída</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Prioridade</InputLabel>
            <Select
              value={formData.prioridade}
              onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
              label="Prioridade"
            >
              <MenuItem value="Baixa">Baixa</MenuItem>
              <MenuItem value="Média">Média</MenuItem>
              <MenuItem value="Alta">Alta</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Prazo"
            type="date"
            value={formData.prazo}
            onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            {task ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm; 