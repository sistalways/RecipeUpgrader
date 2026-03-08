import { Link } from '@tanstack/react-router';

export function NavigationBar() {
  return (
    <nav className="NavigationLinks NavigationLinks--top">
      <Link to="/recipeBuilder">Recipe Builder</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/">Logout</Link>
    </nav>
  );
}
