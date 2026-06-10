import { Leaf } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Leaf className="footer-logo-icon" size={16} />
          <span>EcoTrace</span>
        </div>
        <p className="footer-text">
          &copy; {new Date().getFullYear()} EcoTrace. Empowering individuals to build a sustainable future.
        </p>
      </div>
    </footer>
  );
}
