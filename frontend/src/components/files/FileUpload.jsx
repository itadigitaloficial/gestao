import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Typography,
  Paper
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  listAll,
  deleteObject
} from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { storage, db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

const FileUpload = ({ projectId }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const filesQuery = query(
        collection(db, 'files'),
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(filesQuery);
      const filesList = [];
      snapshot.forEach(doc => {
        filesList.push({ id: doc.id, ...doc.data() });
      });
      setFiles(filesList);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `projects/${projectId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Erro no upload:', error);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'files'), {
            name: file.name,
            url: downloadURL,
            projectId,
            uploadedBy: user.uid,
            uploadedAt: new Date().toISOString(),
            size: file.size,
            type: file.type
          });
          fetchFiles();
        } catch (error) {
          console.error('Erro ao salvar arquivo:', error);
        } finally {
          setUploading(false);
        }
      }
    );
  };

  const handleDelete = async (file) => {
    try {
      const storageRef = ref(storage, `projects/${projectId}/${file.name}`);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, 'files', file.id));
      fetchFiles();
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<UploadIcon />}
            disabled={uploading}
          >
            Upload de Arquivo
          </Button>
        </label>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" color="textSecondary" align="center">
              {Math.round(uploadProgress)}%
            </Typography>
          </Box>
        )}
      </Paper>

      <List>
        {files.map((file) => (
          <ListItem key={file.id}>
            <ListItemIcon>
              <FileIcon />
            </ListItemIcon>
            <ListItemText
              primary={file.name}
              secondary={new Date(file.uploadedAt).toLocaleString()}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => window.open(file.url, '_blank')}
              >
                <DownloadIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleDelete(file)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FileUpload; 