import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

const CommentSection = ({ projectId, taskId = null }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('projectId', '==', projectId),
      ...(taskId ? [where('taskId', '==', taskId)] : []),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsList = [];
      snapshot.forEach((doc) => {
        commentsList.push({ id: doc.id, ...doc.data() });
      });
      setComments(commentsList);
    });

    return () => unsubscribe();
  }, [projectId, taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        content: newComment,
        projectId,
        taskId,
        userId: user.uid,
        userName: user.displayName || 'Usuário',
        createdAt: new Date().toISOString()
      });
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Escreva um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={!newComment.trim()}
            >
              Enviar
            </Button>
          </Box>
        </form>
      </Paper>

      <List>
        {comments.map((comment) => (
          <React.Fragment key={comment.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>{comment.userName[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography component="span" variant="subtitle2">
                    {comment.userName}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      {comment.content}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                    >
                      {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default CommentSection; 