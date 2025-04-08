import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import EditorLayout from './components/EditorLayout';
import RoomEntry from './components/RoomEntry';

const theme = createTheme({
  palette: {
    primary: { main: '#2b579a' },
    secondary: { main: '#f5f5f5' }
  },
  typography: {
    fontFamily: '"Calibri", "Segoe UI", sans-serif',
  }
});

function App() {
  const [room, setRoom] = useState(null);
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const socketRef = useRef(null);
  const isLocalUpdate = useRef(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });

    const socket = socketRef.current;

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    return () => {
      if (room) {
        socket.emit('leave-room', { roomId: room.id });
      }
      socket.disconnect();
    };
  }, []);

  const handleJoin = (roomId, username) => {
    const socket = socketRef.current;
    
    socket.emit('join-room', { roomId, username });
    
    socket.on('room-data', (data) => {
      setRoom({ id: roomId, username });
      setContent(data.content);
      setUsers(data.users);
    });

    socket.on('user-joined', (user) => {
      setUsers(prev => [...prev, user]);
    });

    socket.on('user-left', (userId) => {
      setUsers(prev => prev.filter(user => user.id !== userId));
    });

    socket.on('content-changed', (newContent) => {
      if (!isLocalUpdate.current && newContent !== content) {
        setContent(newContent);
      }
      isLocalUpdate.current = false;
    });
  };

  const handleContentChange = (newContent) => {
    isLocalUpdate.current = true;
    setContent(newContent);
    socketRef.current.emit('content-change', { 
      roomId: room.id, 
      content: newContent 
    });
  };

  const handleLeaveRoom = () => {
    socketRef.current.emit('leave-room', { roomId: room.id });
    setRoom(null);
    setUsers([]);
  };

  if (!room) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RoomEntry onJoin={handleJoin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EditorLayout
        documentId={room.id}
        content={content}
        users={users}
        currentUserId={socketRef.current?.id}
        onContentChange={handleContentChange}
        onLeaveRoom={handleLeaveRoom}
        username={room.username}
      />
    </ThemeProvider>
  );
}

export default App;