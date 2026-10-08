import { AppLayout } from '@/components/layout/AppLayout';
import { createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: AppLayout,
});
