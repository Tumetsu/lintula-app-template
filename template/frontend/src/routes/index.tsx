import { NotesPage } from '@/components/notes/NotesPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: NotesPage,
});
