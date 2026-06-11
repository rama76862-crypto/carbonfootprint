import { useNavigate } from 'react-router-dom';
import { Car, Home as HomeIcon, Utensils, ShoppingBag, ArrowRight, Search, BarChart3, Target } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      <ThreeBackground />
      
      {/* Hero Section */}
      <section className="hero-viewport">
        <div className="hero-layout">
          <h1 className="hero-main-title animate-fade-up">
            Your actions shape the planet.
          </h1>
          
          <div className="ticker-readout text-mono animate-fade-up animate-delay-200">
            <span className="ticker-globe">🌍</span> Global CO₂ today: <span className="ticker-number">424.3 ppm</span>
          </div>
          
          <p className="hero-description-text animate-fade-up animate-delay-300">
            Track your carbon footprint, understand your impact, take steps that actually matter.
          </p>

          <div className="hero-cta-buttons animate-fade-up animate-delay-400">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
              Start Tracking <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={scrollToHowItWorks}>
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar-section">
        <div className="stats-bar-grid container">
          <div className="stat-card animate-fade-left animate-delay-100">
            <span className="stat-label">Global average per person/year</span>
            <span className="stat-val">4.7 tonnes</span>
          </div>
          <div className="stat-card animate-fade-up animate-delay-200">
            <span className="stat-label">India average per person/year</span>
            <span className="stat-val">1.9 tonnes</span>
          </div>
          <div className="stat-card animate-fade-right animate-delay-300">
            <span className="stat-label">Paris Agreement target</span>
            <span className="stat-val text-accent">2.0 tonnes</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section container">
        <h2 className="home-section-title animate-fade-up">How It Works</h2>
        <div className="steps-flow-container">
          <div className="connecting-line"></div>
          
          <div className="step-item animate-fade-up animate-delay-100">
            <div className="step-icon-circle">
              <Search size={22} />
            </div>
            <h3 className="step-title">Log Your Activities</h3>
            <p className="step-desc">
              Add transport, home energy, food, and shopping data.
            </p>
          </div>

          <div className="step-item animate-fade-up animate-delay-200">
            <div className="step-icon-circle">
              <BarChart3 size={22} />
            </div>
            <h3 className="step-title">See Your Impact</h3>
            <p className="step-desc">
              Visual breakdown of where your emissions come from.
            </p>
          </div>

          <div className="step-item animate-fade-up animate-delay-300">
            <div className="step-icon-circle">
              <Target size={22} />
            </div>
            <h3 className="step-title">Take Action</h3>
            <p className="step-desc">
              Get personalized tips sorted by impact and ease.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section container">
        <h2 className="home-section-title animate-fade-up">Emission Categories</h2>
        <p className="section-subtitle text-center animate-fade-up animate-delay-100">Understand how each category contributes to your footprint.</p>
        
        <div className="categories-grid">
          <div className="card category-hover-card animate-scale-in animate-delay-100" onClick={() => navigate('/tracker')}>
            <div className="category-header">
              <div className="category-icon-wrapper transport-color">
                <Car size={24} />
              </div>
              <span className="category-pct text-mono">avg 35%</span>
            </div>
            <h3>Transport</h3>
            <p>Emissions from daily driving, air travel, commutes, and public transportation modes.</p>
          </div>

          <div className="card category-hover-card animate-scale-in animate-delay-200" onClick={() => navigate('/tracker')}>
            <div className="category-header">
              <div className="category-icon-wrapper home-color">
                <HomeIcon size={24} />
              </div>
              <span className="category-pct text-mono">avg 30%</span>
            </div>
            <h3>Home Energy</h3>
            <p>Electricity consumption, natural gas heating, solar yields, and general housing power usage.</p>
          </div>

          <div className="card category-hover-card animate-scale-in animate-delay-300" onClick={() => navigate('/tracker')}>
            <div className="category-header">
              <div className="category-icon-wrapper food-color">
                <Utensils size={24} />
              </div>
              <span className="category-pct text-mono">avg 20%</span>
            </div>
            <h3>Food & Diet</h3>
            <p>Impact of dietary selections including high meat intake, vegetarian habits, and waste overheads.</p>
          </div>

          <div className="card category-hover-card animate-scale-in animate-delay-400" onClick={() => navigate('/tracker')}>
            <div className="category-header">
              <div className="category-icon-wrapper shop-color">
                <ShoppingBag size={24} />
              </div>
              <span className="category-pct text-mono">avg 15%</span>
            </div>
            <h3>Shopping</h3>
            <p>Manufacturing and shipping footprints from retail goods, clothing, and tech purchases.</p>
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="footer-cta-section">
        <div className="footer-cta-container text-center">
          <h2 className="cta-headline animate-fade-up">Ready to know your number?</h2>
          <button className="btn btn-primary btn-lg cta-btn animate-fade-up animate-delay-200" onClick={() => navigate('/dashboard')}>
            Calculate My Footprint <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
