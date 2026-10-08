import { useNotes } from '@/hooks/useNotes';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type FormEvent } from 'react';

/** The example page: create, list and delete notes. Replace it with your own. */
export function NotesPage() {
  const { notes, isLoading, loadFailed, isCreating, createNote, deleteNote } = useNotes();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await createNote(title, body);
    setTitle('');
    setBody('');
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Notes
      </Typography>

      <Paper component="form" onSubmit={submit} variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField
            label="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            multiline
            minRows={2}
          />
          <Box>
            <Button type="submit" variant="contained" disabled={!title.trim() || isCreating}>
              Add note
            </Button>
          </Box>
        </Stack>
      </Paper>

      {isLoading && <CircularProgress aria-label="Loading notes" />}
      {loadFailed && <Alert severity="error">The notes could not be loaded.</Alert>}
      {!isLoading && !loadFailed && notes.length === 0 && (
        <Typography color="text.secondary">No notes yet.</Typography>
      )}

      <List aria-label="Notes">
        {notes.map((note) => (
          <ListItem
            key={note.id}
            divider
            secondaryAction={
              <IconButton
                edge="end"
                aria-label={`Delete ${note.title}`}
                onClick={() => deleteNote(note.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={note.title} secondary={note.body_preview} />
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
