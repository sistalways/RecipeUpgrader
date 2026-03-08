import { createFileRoute } from '@tanstack/react-router';
import { NavigationBar } from '../components/NavigationBar';

export const Route = createFileRoute('/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="MainContent">
      <NavigationBar />
      <div>
        <div className="DashboardContent">Welcome to Recipe Builder</div>
      </div>
    </div>
  );
}
