import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList = [];
      let unread = 0;

      snapshot.forEach(doc => {
        const notification = { id: doc.id, ...doc.data() };
        notificationsList.push(notification);
        if (!notification.read) unread++;
      });

      setNotifications(notificationsList);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await updateDoc(doc(db, 'notifications', notification.id), {
          read: true
        });
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
      }
    }
    
    // Navegar para o local apropriado baseado no tipo de notificação
    if (notification.type === 'project') {
      window.location.href = `/projects/${notification.projectId}`;
    } else if (notification.type === 'task') {
      window.location.href = `/projects/${notification.projectId}?task=${notification.taskId}`;
    }
    
    handleClose();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '300px',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">
            Notificações
          </Typography>
        </Box>
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography color="textSecondary">
              Nenhuma notificação
            </Typography>
          </MenuItem>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover'
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="div"
                        variant="caption"
                        color="textSecondary"
                      >
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </React.Fragment>
                  }
                />
                {!notification.read && (
                  <CircleIcon
                    color="primary"
                    sx={{ fontSize: 12, ml: 1 }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationSystem; 