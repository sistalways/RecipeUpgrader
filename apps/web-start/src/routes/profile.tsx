import { createFileRoute } from '@tanstack/react-router';
import { NavigationBar } from '../components/NavigationBar';

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="MainContent">
      <NavigationBar />
      <div className="ProfileContent">
        <h1>Profile</h1>
        <p>This is your profile page.</p>
      </div>
    </div>
  );
}
