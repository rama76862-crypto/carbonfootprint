import { useEffect } from 'react';
import { useCarbonContext } from '../context/CarbonContext';
import { Car, Home, Utensils, ShoppingBag, Info, Sparkles } from 'lucide-react';
import './Pages.css';

export default function Insights() {
  const { emissionsData, assistantPlan, syncStatus, actions } = useCarbonContext();
  const { refreshAssistantPlan } = actions;

  useEffect(() => {
    refreshAssistantPlan('reduce monthly footprint with practical lifestyle changes');
  }, [refreshAssistantPlan]);

  const categoryTotals = emissionsData.reduce(
    (acc, curr) => {
      acc.transport += curr.transport;
      acc.home += curr.home;
      acc.food += curr.food;
      acc.shopping += curr.shopping;
      return acc;
    },
    { transport: 0, home: 0, food: 0, shopping: 0 }
  );

  const grandTotal = categoryTotals.transport + categoryTotals.home + categoryTotals.food + categoryTotals.shopping;

  const sectors = [
    { name: 'Transport', value: categoryTotals.transport, icon: Car, color: 'var(--color-accent)', class: 'progress-transport' },
    { name: 'Home Energy', value: categoryTotals.home, icon: Home, color: 'var(--color-warning)', class: 'progress-home' },
    { name: 'Food & Diet', value: categoryTotals.food, icon: Utensils, color: 'var(--color-accent-soft)', class: 'progress-food' },
    { name: 'Shopping & Spend', value: categoryTotals.shopping, icon: ShoppingBag, color: 'var(--color-danger)', class: 'progress-shopping' }
  ];

  return (
    <div className="inner-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Carbon Insights</h1>
          <p className="page-description">Breakdown and analysis of your carbon footprint across sectors.</p>
        </div>
      </div>

      <div className="card info-banner">
        <Info className="info-icon" size={20} />
        <p>This breakdown shows the cumulative totals of your logged emissions for the year to date. Use these insights to identify your highest emitting categories.</p>
      </div>

      <div className="insights-grid">
        {/* Sector breakdowns */}
        <div className="card breakdown-card">
          <h3>Sector Breakdown</h3>
          <p className="card-subtitle">Cumulative emissions by category (tonnes CO₂e)</p>
          <div className="breakdown-list">
            {sectors.map((sector) => {
              const Icon = sector.icon;
              const percentage = grandTotal > 0 ? (sector.value / grandTotal) * 100 : 0;
              return (
                <div className="breakdown-item" key={sector.name}>
                  <div className="breakdown-info">
                    <div className="breakdown-label">
                      <Icon size={18} style={{ color: sector.color }} />
                      <span>{sector.name}</span>
                    </div>
                    <div className="breakdown-stats">
                      <span className="breakdown-value">{sector.value.toFixed(2)} t</span>
                      <span className="breakdown-percentage text-mono">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="comparison-bar-bg">
                    <div className={`comparison-bar ${sector.class}`} style={{ width: `${percentage}%`, backgroundColor: sector.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic tips overview based on highest emitter */}
        <div className="card dynamics-card">
          <h3>Top Sector Analysis</h3>
          <p className="card-subtitle">Your highest source of carbon emissions</p>
          
          {(() => {
            const sortedSectors = [...sectors].sort((a, b) => b.value - a.value);
            const highest = sortedSectors[0];
            const Icon = highest.icon;
            
            return (
              <div className="highest-emitter-panel">
                <div className="emitter-header">
                  <div className="emitter-icon-bg" style={{ backgroundColor: `${highest.color}15` }}>
                    <Icon size={32} style={{ color: highest.color }} />
                  </div>
                  <div>
                    <h4>{highest.name}</h4>
                    <p className="highlight-text" style={{ color: highest.color }}>Highest Emitting Category</p>
                  </div>
                </div>
                <p className="emitter-description">
                  {highest.name} accounts for {((highest.value / (grandTotal || 1)) * 100).toFixed(0)}% of your overall carbon footprint. Focus on your highest-impact habits first, then use the Tips page for actions you can take today.
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="card assistant-card">
        <div className="assistant-card-header">
          <div className="assistant-title-group">
            <Sparkles size={20} className="assistant-icon" />
            <div>
              <h3>Smart Carbon Coach</h3>
              <p className="card-subtitle">Personalized next steps from your latest footprint context</p>
            </div>
          </div>
          <span className={`sync-pill ${syncStatus}`}>{syncStatus}</span>
        </div>

        {assistantPlan ? (
          <>
            {assistantPlan.provider === 'fallback' && assistantPlan.providerError ? (
              <p className="assistant-message" style={{ color: 'var(--color-warning)' }}>
                {assistantPlan.providerError}
              </p>
            ) : null}
            <p className="assistant-message">{assistantPlan.message}</p>
            <div className="assistant-actions-grid">
              {assistantPlan.nextActions.map((action) => (
                <div className="assistant-action" key={action.title}>
                  <div className="assistant-action-topline">
                    <h4>{action.title}</h4>
                    <span className={`badge-difficulty ${action.effort}`}>{action.effort}</span>
                  </div>
                  <p>{action.rationale}</p>
                  <span className="saving-value text-mono">-{action.impactKgPerYear} kg CO2 / yr</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="assistant-message">Start the API server to unlock live, context-aware coaching. The app still works locally with default data.</p>
        )}
      </div>
    </div>
  );
}
