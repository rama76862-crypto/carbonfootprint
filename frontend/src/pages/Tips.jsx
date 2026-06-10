import { useState } from 'react';
import { TIPS_DATA } from '../utils/constants';
import {
  Zap,
  Utensils,
  Bus,
  Thermometer,
  Leaf,
  Plane,
  ShoppingBag,
  Droplet,
  Trash2,
  Users,
  Sun,
  Power,
  Heart,
  MapPin,
  Recycle,
  Cpu,
  Gauge,
  Bike,
  CreditCard,
  Container,
  Compass
} from 'lucide-react';
import './Pages.css';

// Map icon string to Lucide component
const iconMap = {
  'zap': Zap,
  'utensils': Utensils,
  'bus': Bus,
  'thermometer': Thermometer,
  'leaf': Leaf,
  'plane': Plane,
  'shopping-bag': ShoppingBag,
  'droplet': Droplet,
  'trash-2': Trash2,
  'users': Users,
  'sun': Sun,
  'power': Power,
  'heart': Heart,
  'map-pin': MapPin,
  'recycle': Recycle,
  'cpu': Cpu,
  'gauge': Gauge,
  'bike': Bike,
  'credit-card': CreditCard,
  'container': Container
};

export default function Tips() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = ['all', 'home', 'transport', 'food', 'shopping'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const filteredTips = TIPS_DATA.filter((tip) => {
    const categoryMatch = selectedCategory === 'all' || tip.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || tip.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  return (
    <div className="inner-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Eco Action Tips</h1>
          <p className="page-description">Actionable changes to reduce your environmental impact.</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filters-container card">
        <div className="filter-group">
          <span className="filter-label">Category:</span>
          <div className="filter-buttons">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Difficulty:</span>
          <div className="filter-buttons">
            {difficulties.map((diff) => (
              <button
                key={diff}
                className={`filter-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(diff)}
              >
                {diff.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="tips-grid">
        {filteredTips.map((tip) => {
          const TipIcon = iconMap[tip.icon] || Compass;
          return (
            <div className="card tip-card" key={tip.id}>
              <div className="tip-header">
                <div className="tip-icon-bg">
                  <TipIcon size={22} className="tip-icon" />
                </div>
                <div className="tip-meta">
                  <span className={`badge-difficulty ${tip.difficulty}`}>
                    {tip.difficulty}
                  </span>
                  <span className="tip-category">{tip.category}</span>
                </div>
              </div>
              
              <h3 className="tip-title">{tip.title}</h3>
              <p className="tip-desc">{tip.description}</p>
              
              <div className="tip-footer">
                <span className="saving-label">Potential Saving:</span>
                <span className="saving-value text-mono">-{tip.savingKg} kg CO₂ / yr</span>
              </div>
            </div>
          );
        })}
      </div>
      {filteredTips.length === 0 && (
        <div className="no-results card text-center">
          <p>No tips found matching the selected filters.</p>
        </div>
      )}
    </div>
  );
}
