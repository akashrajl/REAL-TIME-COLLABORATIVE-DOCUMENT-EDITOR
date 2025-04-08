import React, { useRef, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Box, Paper, 
  List, ListItem, ListItemText, IconButton,
  Tooltip, ButtonGroup
} from '@mui/material';
import { 
  Groups, ExitToApp, 
  FormatBold, FormatItalic, FormatUnderlined,
  FormatAlignLeft, FormatAlignCenter, FormatAlignRight
} from '@mui/icons-material';

const EditorLayout = ({ 
  documentId, content, users, currentUserId,
  onContentChange, onLeaveRoom, username 
}) => {
  const editorRef = useRef(null);
  const lastContent = useRef(content);

  // Save cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    return {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset
    };
  };

  // Restore cursor position
  const restoreCursorPosition = (position) => {
    if (!position) return;
    
    const selection = window.getSelection();
    const range = document.createRange();
    
    try {
      range.setStart(position.startContainer, position.startOffset);
      range.setEnd(position.endContainer, position.endOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {
      console.warn("Couldn't restore cursor position", e);
    }
  };

  // Handle input with cursor preservation
  const handleInput = (e) => {
    const cursorPos = saveCursorPosition();
    const newContent = e.currentTarget.innerHTML;
    onContentChange(newContent);
    lastContent.current = newContent;
    
    // Restore cursor after DOM update
    setTimeout(() => {
      if (cursorPos) restoreCursorPosition(cursorPos);
    }, 0);
  };

  // Apply formatting commands
  const execFormat = (cmd, value = null) => {
    const cursorPos = saveCursorPosition();
    document.execCommand(cmd, false, value);
    onContentChange(editorRef.current.innerHTML);
    
    setTimeout(() => {
      if (cursorPos) restoreCursorPosition(cursorPos);
    }, 0);
  };

  // Set initial content
  useEffect(() => {
    if (editorRef.current && content !== lastContent.current) {
      const cursorPos = saveCursorPosition();
      editorRef.current.innerHTML = content;
      lastContent.current = content;
      
      setTimeout(() => {
        if (cursorPos) restoreCursorPosition(cursorPos);
      }, 0);
    }
  }, [content]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Real-Time Collaborative Document Editor
          </Typography>
          <Typography variant="subtitle2" sx={{ mr: 2 }}>
            {username}
          </Typography>
          <Tooltip title="Leave Room">
            <IconButton color="inherit" onClick={onLeaveRoom}>
              <ExitToApp />
            </IconButton>
          </Tooltip>
        </Toolbar>

        {/* Formatting Toolbar */}
        <Box sx={{ 
          bgcolor: 'secondary.main',
          px: 2,
          py: 1,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <ButtonGroup size="small" sx={{ gap: 0.5 }}>
            <Tooltip title="Bold">
              <IconButton onClick={() => execFormat('bold')}>
                <FormatBold fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic">
              <IconButton onClick={() => execFormat('italic')}>
                <FormatItalic fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Underline">
              <IconButton onClick={() => execFormat('underline')}>
                <FormatUnderlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Align Left">
              <IconButton onClick={() => execFormat('justifyLeft')}>
                <FormatAlignLeft fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Center">
              <IconButton onClick={() => execFormat('justifyCenter')}>
                <FormatAlignCenter fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Align Right">
              <IconButton onClick={() => execFormat('justifyRight')}>
                <FormatAlignRight fontSize="small" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Box>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Editor Area */}
        <Box sx={{ flex: 4, p: 2, overflow: 'hidden' }}>
          <Paper elevation={0} sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e0e0e0'
          }}>
            <Box
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              sx={{
                flexGrow: 1,
                p: 3,
                outline: 'none',
                fontSize: '11pt',
                lineHeight: 1.5,
                overflowY: 'auto',
                '& p': { margin: '0 0 12px 0' }
              }}
            />
          </Paper>
        </Box>

        {/* Members Panel */}
        <Box sx={{ 
          flex: 1,
          p: 2,
          bgcolor: 'background.paper',
          borderLeft: '1px solid #e0e0e0',
          overflowY: 'auto'
        }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              fontWeight: 'bold'
            }}>
              <Groups sx={{ mr: 1 }} /> Members ({users.length})
            </Typography>
            <List dense>
              {users.map((user) => (
                <ListItem key={user.id} sx={{ 
                  px: 0,
                  fontWeight: user.id === currentUserId ? 'bold' : 'normal'
                }}>
                  <ListItemText 
                    primary={user.name}
                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="caption" sx={{ 
              display: 'block',
              mt: 2,
              color: 'text.secondary'
            }}>
              Room ID: {documentId}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default EditorLayout;