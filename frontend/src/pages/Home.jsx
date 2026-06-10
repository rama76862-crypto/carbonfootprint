import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Home as HomeIcon, Utensils, ShoppingBag, ArrowRight, Search, BarChart3, Target } from 'lucide-react';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Fireflies / particles
    const particles = [];
    const particleCount = 40;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        fadeSpeed: Math.random() * 0.004 + 0.001,
        fadeIn: Math.random() > 0.5
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        if (p.fadeIn) {
          p.opacity += p.fadeSpeed;
          if (p.opacity >= 0.6) p.fadeIn = false;
        } else {
          p.opacity -= p.fadeSpeed;
          if (p.opacity <= 0.1) p.fadeIn = true;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 230, 207, ${p.opacity})`; // Soft mint green
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#2ECC71';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-viewport">
        <canvas ref={canvasRef} className="fireflies-canvas" />
        
        <div className="hero-layout">
          <h1 className="hero-main-title">
            Your actions shape the planet.
          </h1>
          
          <div className="ticker-readout text-mono">
            <span className="ticker-globe">🌍</span> Global CO₂ today: <span className="ticker-number">424.3 ppm</span>
          </div>
          
          <p className="hero-description-text">
            Track your carbon footprint, understand your impact, take steps that actually matter.
          </p>

          <div className="hero-cta-buttons">
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
          <div className="stat-card">
            <span className="stat-label">Global average per person/year</span>
            <span className="stat-val">4.7 tonnes</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">India average per person/year</span>
            <span className="stat-val">1.9 tonnes</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Paris Agreement target</span>
            <span className="stat-val text-accent">2.0 tonnes</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section container">
        <h2 className="home-section-title">How It Works</h2>
        <div className="steps-flow-container">
          <div className="connecting-line"></div>
          
          <div className="step-item">
            <div className="step-icon-circle">
              <Search size={22} />
            </div>
            <h3 className="step-title">Log Your Activities</h3>
            <p className="step-desc">
              Add transport, home energy, food, and shopping data.
            </p>
          </div>

          <div className="step-item">
            <div className="step-icon-circle">
              <BarChart3 size={22} />
            </div>
            <h3 className="step-title">See Your Impact</h3>
            <p className="step-desc">
              Visual breakdown of where your emissions come from.
            </p>
          </div>

          <div className="step-item">
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
        <h2 className="home-section-title">Emission Categories</h2>
        <p className="section-subtitle text-center">Understand how each category contributes to your footprint.</p>
        
        <div className="categories-grid">
          <div className="card category-hover-card" onClick={() => navigate('/tracker')}>
            <div className="category-header">
              <div className="category-icon-wrapper transport-color">
                <Car size={24} />
              </div>
              <span className="category-pct text-mono">avg 35%</span>
            </div>
            <h3>Transport</h3>
            <p>Emissions from daily driving, air travel, commutes, and public transportation modes.</p>
          </div>

          <div className="card category-hover-card" onClick={() => navigate('/tracker')}>
            <div className="category-header">
              <div className="category-icon-wrapper home-color">
                <HomeIcon size={24} />
              </div>
              <span className="category-pct text-mono">avg 30%</span>
            </div>
            <h3>Home Energy</h3>
            <p>Electricity consumption, natural gas heating, solar yields, and general housing power usage.</p>
          </div>

          <div className="card category-hover-card" onClick={() => navigate('/tracker')}>
            <div className="category-header">
              <div className="category-icon-wrapper food-color">
                <Utensils size={24} />
              </div>
              <span className="category-pct text-mono">avg 20%</span>
            </div>
            <h3>Food & Diet</h3>
            <p>Impact of dietary selections including high meat intake, vegetarian habits, and waste overheads.</p>
          </div>

          <div className="card category-hover-card" onClick={() => navigate('/tracker')}>
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
          <h2 className="cta-headline">Ready to know your number?</h2>
          <button className="btn btn-primary btn-lg cta-btn" onClick={() => navigate('/dashboard')}>
            Calculate My Footprint <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
