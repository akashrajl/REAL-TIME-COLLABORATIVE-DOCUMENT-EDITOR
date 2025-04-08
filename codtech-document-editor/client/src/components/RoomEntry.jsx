import React, { useState } from 'react';
import { 
  Box, Paper, Typography, TextField, 
  Button, Link, Stack
} from '@mui/material';

const RoomEntry = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      onJoin(roomId, username);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      bgcolor: 'background.default'
    }}>
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Enter the ROOM ID
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="ROOM ID"
              variant="outlined"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
            />
            
            <TextField
              fullWidth
              label="USERNAME"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
            >
              JOIN
            </Button>
          </Stack>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have a room ID?{' '}
          <Link 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setRoomId(Math.random().toString(36).substring(2, 8).toUpperCase());
            }}
          >
            Create New Room
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RoomEntry;