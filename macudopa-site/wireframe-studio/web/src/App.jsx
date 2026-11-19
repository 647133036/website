import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { AuthShell } from './pages/Auth.jsx';
import { StudioShell } from './components/Shell.jsx';
import { StudioPage } from './pages/Studio.jsx';
import { UsersPage } from './pages/Users.jsx';
import { GroupsPage } from './pages/Groups.jsx';
import { PreviewPage } from './pages/Preview.jsx';
import { Spinner, Guard } from './components/ui.jsx';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) {
    return (
      <AuthShell>
        <Routes>
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthShell>
    );
  }
  return (
    <StudioShell>
      <Routes>
        <Route path="/" element={<Navigate to="/studio" replace />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/users" element={<Guard need="admin"><UsersPage /></Guard>} />
        <Route path="/groups" element={<Guard need="admin"><GroupsPage /></Guard>} />
      </Routes>
    </StudioShell>
  );
}
