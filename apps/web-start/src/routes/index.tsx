import { createFileRoute } from '@tanstack/react-router';
import { NavigationBar } from '../components/NavigationBar';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <header className="MainContent">
        <div className="AppTheme">
          <div className="AppHeading">Recipe Builder</div>
          <div className="AppDesc">
            A Nutrition Tool that gives you tasty & high protein recipes that
            help you achieve your fitness goals!
          </div>
        </div>
        <div className="LoginButton">
          <a href="/home">Login</a>
        </div>
      </header>
    </div>
  );
}
