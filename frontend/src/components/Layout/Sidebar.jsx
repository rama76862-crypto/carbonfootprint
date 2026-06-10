import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCarbonContext } from '../../context/CarbonContext';
import { LayoutDashboard, Pencil, BarChart3, Lightbulb, Settings, User, BrainCircuit } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { userProfile } = useCarbonContext();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tracker', path: '/tracker', icon: Pencil },
    { name: 'Insights', path: '/insights', icon: BarChart3 },
    { name: 'Tips', path: '/tips', icon: Lightbulb },
    { name: 'Eco Assistant', path: '/assistant', icon: BrainCircuit }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-item active' : 'sidebar-item'
              }
            >
              <Icon className="sidebar-icon" size={20} />
              <span className="sidebar-label">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar-placeholder">
            <User size={18} className="avatar-icon" />
          </div>
          <div className="user-info">
            <span className="user-name">{userProfile.name}</span>
            <span className="user-location">{userProfile.location}</span>
          </div>
        </div>
        
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? 'sidebar-item sidebar-settings active' : 'sidebar-item sidebar-settings'
          }
        >
          <Settings className="sidebar-icon" size={20} />
          <span className="sidebar-label">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
