import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useCarbonContext } from '../../context/CarbonContext';
import { Menu, X, Leaf } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { totalAnnual } = useCarbonContext();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tracker', path: '/tracker' },
    { name: 'Insights', path: '/insights' },
    { name: 'Tips', path: '/tips' },
    { name: 'Assistant', path: '/assistant' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <Leaf className="logo-icon" size={24} />
          <span>EcoTrace</span>
        </NavLink>

        {/* Desktop Links */}
        <div className="navbar-links-desktop">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right side: Score & Hamburger */}
        <div className="navbar-right">
          <div className="score-badge">
            <span className="score-label">My Score</span>
            <span className="score-value">{totalAnnual} tonnes CO₂</span>
          </div>

          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Links Overlay */}
      {isOpen && (
        <div className="navbar-links-mobile">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
