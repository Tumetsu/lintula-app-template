import { APP_NAME } from '@/lib/appInfo';
import { AppBar, Container, Toolbar, Typography } from '@mui/material';
import { Outlet } from '@tanstack/react-router';

/** Page chrome around every route. */
export function AppLayout() {
  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="span">
            {APP_NAME}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}
