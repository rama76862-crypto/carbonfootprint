import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarbonContext } from '../context/CarbonContext';
import { getEmissionsCategory } from '../utils/calculations';
import { GLOBAL_AVERAGE, TARGET, COUNTRY_AVERAGES } from '../utils/constants';
import { 
  Plus, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Car,
  Home as HomeIcon,
  Utensils,
  ShoppingBag
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userProfile, emissionsData, totalAnnual } = useCarbonContext();

  // 1. Calculations for Mini Stat Cards
  const stats = useMemo(() => {
    if (!emissionsData.length) {
      return { totalThisYear: 0, bestMonth: 'None', biggestCategory: 'None', daysLogged: 34 };
    }

    // Best Month (Lowest total emissions)
    const bestEntry = emissionsData.reduce((best, curr) => {
      return curr.total < best.total ? curr : best;
    }, emissionsData[0]);

    // Aggregate category totals to find the biggest category
    const categorySum = emissionsData.reduce(
      (acc, curr) => {
        acc.transport += curr.transport || 0;
        acc.home += curr.home || 0;
        acc.food += curr.food || 0;
        acc.shopping += curr.shopping || 0;
        return acc;
      },
      { transport: 0, home: 0, food: 0, shopping: 0 }
    );

    const biggestCatKey = Object.keys(categorySum).reduce((a, b) => {
      return categorySum[a] > categorySum[b] ? a : b;
    }, 'transport');

    const catMapping = {
      transport: 'Transport',
      home: 'Home Energy',
      food: 'Food & Diet',
      shopping: 'Shopping'
    };

    return {
      totalThisYear: totalAnnual,
      bestMonth: bestEntry.month,
      biggestCategory: catMapping[biggestCatKey] || 'Transport',
      daysLogged: 34 // static logging streak requirement
    };
  }, [emissionsData, totalAnnual]);

  // 2. Category Sums for Pie Chart
  const categorySum = useMemo(() => {
    return emissionsData.reduce(
      (acc, curr) => {
        acc.transport += curr.transport || 0;
        acc.home += curr.home || 0;
        acc.food += curr.food || 0;
        acc.shopping += curr.shopping || 0;
        return acc;
      },
      { transport: 0, home: 0, food: 0, shopping: 0 }
    );
  }, [emissionsData]);

  const pieData = useMemo(() => {
    return [
      { name: 'Transport', value: categorySum.transport, color: '#2ECC71' },
      { name: 'Home Energy', value: categorySum.home, color: '#3498DB' },
      { name: 'Food & Diet', value: categorySum.food, color: '#F39C12' },
      { name: 'Shopping', value: categorySum.shopping, color: '#9B59B6' }
    ].filter(item => item.value > 0);
  }, [categorySum]);

  // 3. Dynamic Progress Ring Calculations
  // scale progress out of a max 12 tonnes CO2 limit
  const ringPercent = useMemo(() => {
    return Math.min(100, (totalAnnual / 12) * 100);
  }, [totalAnnual]);

  const ringColor = useMemo(() => {
    if (totalAnnual < GLOBAL_AVERAGE) return '#2ECC71'; // Green (under 4.7)
    if (totalAnnual <= 8.0) return '#F39C12';           // Orange (4.7 - 8.0)
    return '#E74C3C';                                    // Red (above 8.0)
  }, [totalAnnual]);

  // SVG Circle parameters
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * ringPercent) / 100;

  // Comparison metrics vs benchmarks
  const countryAvg = useMemo(() => {
    return COUNTRY_AVERAGES[userProfile.location] || 1.9;
  }, [userProfile.location]);

  const diffIndia = useMemo(() => {
    return parseFloat((totalAnnual - countryAvg).toFixed(2));
  }, [totalAnnual, countryAvg]);

  const targetVal = useMemo(() => {
    return userProfile.annualTarget || TARGET;
  }, [userProfile.annualTarget]);

  const diffParis = useMemo(() => {
    return parseFloat((totalAnnual - targetVal).toFixed(2));
  }, [totalAnnual, targetVal]);

  // 4. Calendar Heatmap Generation (June 2026 starting Monday, June 1st)
  const heatmapDays = useMemo(() => {
    // We will render a 7 col x 5 row grid (35 cells) covering June 1 to June 30 plus padding days
    const cells = [];
    const totalCells = 35; // 5 weeks
    // June 1, 2026 starts on Monday. Assuming grid index 0 = Mon, 1 = Tue, ... 6 = Sun
    // So Monday June 1st lines up exactly at index 0.
    
    // We mark 12 consecutive days as logged (from May 29 to June 9)
    // May 29, 30, 31 (3 days) + June 1 to June 9 (9 days) = 12-day streak!
    
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i + 1; // 1 to 35
      const isJune = dayNum <= 30;
      
      let isLogged = false;
      if (isJune && dayNum <= 9) {
        isLogged = true; // June 1 to June 9
      }
      
      cells.push({
        day: isJune ? dayNum : null,
        isLogged,
        key: i
      });
    }
    return cells;
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header Row */}
      <div className="dashboard-header flex align-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Real-time carbon tracking metrics and target analytics.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/tracker')}>
          <Plus size={18} /> Add Entry
        </button>
      </div>

      {/* 4 Mini Stat Cards */}
      <div className="mini-cards-grid">
        <div className="card mini-card">
          <div className="mini-card-icon-wrapper total-icon">
            <Leaf size={20} />
          </div>
          <div className="mini-card-info">
            <span className="mini-card-label">Total This Year</span>
            <span className="mini-card-value">{stats.totalThisYear.toFixed(2)} t</span>
          </div>
        </div>

        <div className="card mini-card">
          <div className="mini-card-icon-wrapper best-icon">
            <Calendar size={20} />
          </div>
          <div className="mini-card-info">
            <span className="mini-card-label">Best Month</span>
            <span className="mini-card-value">{stats.bestMonth}</span>
          </div>
        </div>

        <div className="card mini-card">
          <div className="mini-card-icon-wrapper biggest-icon">
            <TrendingUp size={20} />
          </div>
          <div className="mini-card-info">
            <span className="mini-card-label">Biggest Category</span>
            <span className="mini-card-value">{stats.biggestCategory}</span>
          </div>
        </div>

        <div className="card mini-card">
          <div className="mini-card-icon-wrapper logged-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="mini-card-info">
            <span className="mini-card-label">Days Logged</span>
            <span className="mini-card-value">{stats.daysLogged} Days</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Layout */}
      <div className="dashboard-main-grid">
        {/* Left Column (65%) */}
        <div className="left-dashboard-col">
          {/* Monthly Emissions Area Chart */}
          <div className="card chart-card">
            <h3>Your Emissions — Last 6 Months</h3>
            <p className="card-subtitle">Monthly total CO₂ emissions (tonnes)</p>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={emissionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 249, 244, 0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'rgba(244, 249, 244, 0.1)', borderRadius: '8px' }}
                    labelStyle={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-text)' }}
                    itemStyle={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontSize: '12px' }}
                    formatter={(value) => [`${parseFloat(value).toFixed(2)} t CO₂`, 'Emissions']}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stacked Category Bar Chart */}
          <div className="card chart-card">
            <h3>Emissions Breakdown By Month</h3>
            <p className="card-subtitle">Detailed sector emissions per month (tonnes CO₂)</p>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={emissionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 249, 244, 0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'rgba(244, 249, 244, 0.1)', borderRadius: '8px' }}
                    labelStyle={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-text)' }}
                    itemStyle={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                    formatter={(value, name) => [`${parseFloat(value).toFixed(2)} t`, name.charAt(0).toUpperCase() + name.slice(1)]}
                  />
                  <Bar dataKey="transport" name="transport" stackId="emissions" fill="#2ECC71" />
                  <Bar dataKey="home" name="home energy" stackId="emissions" fill="#3498DB" />
                  <Bar dataKey="food" name="food & diet" stackId="emissions" fill="#F39C12" />
                  <Bar dataKey="shopping" name="shopping" stackId="emissions" fill="#9B59B6" />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (35%) */}
        <div className="right-dashboard-col">
          {/* Score Card (Progress Ring) */}
          <div className="card widget-card text-center flex-column align-center">
            <h3>Emissions Score</h3>
            
            <div className="progress-ring-container">
              <svg width="180" height="180" viewBox="0 0 180 180" className="progress-ring">
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="var(--color-surface-2)"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke={ringColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
                <text x="50%" y="46%" textAnchor="middle" className="ring-text-value" fill="var(--color-text)">
                  {totalAnnual.toFixed(1)}
                </text>
                <text x="50%" y="65%" textAnchor="middle" className="ring-text-label" fill="var(--color-text-muted)">
                  tonnes CO₂/yr
                </text>
              </svg>
            </div>

            <div className="comparison-rows">
              <div className="comp-row">
                <span>vs. {userProfile.location} avg ({countryAvg.toFixed(1)} t)</span>
                <span className={`comp-val ${diffIndia > 0 ? 'red' : 'green'}`}>
                  {diffIndia > 0 ? `+${diffIndia.toFixed(1)}` : diffIndia.toFixed(1)}
                  {diffIndia > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </span>
              </div>
              <div className="comp-row">
                <span>vs. Target limit ({targetVal.toFixed(1)} t)</span>
                <span className={`comp-val ${diffParis > 0 ? 'red' : 'green'}`}>
                  {diffParis > 0 ? `+${diffParis.toFixed(1)}` : diffParis.toFixed(1)}
                  {diffParis > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </span>
              </div>
            </div>
          </div>

          {/* Category Pie (Donut Chart) */}
          <div className="card widget-card flex-column align-center">
            <h3>Category Share</h3>
            <p className="card-subtitle text-center">Relative footprint shares this year</p>
            <div className="donut-chart-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'rgba(244, 249, 244, 0.1)', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(value) => [`${value.toFixed(2)} t CO₂`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-label text-center">
                <span className="donut-center-title">This Year</span>
              </div>
            </div>
          </div>

          {/* Streak Heatmap Card */}
          <div className="card widget-card">
            <div className="heatmap-header">
              <span className="flex align-center gap-sm">
                <Flame size={18} className="streak-fire-icon" /> 12-day logging streak
              </span>
            </div>
            
            <div className="heatmap-days-labels">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>

            <div className="heatmap-grid">
              {heatmapDays.map((cell, idx) => (
                <div 
                  key={idx}
                  className={`heatmap-cell ${cell.day === null ? 'empty' : ''} ${cell.isLogged ? 'logged' : ''}`}
                  title={cell.day ? `June ${cell.day}: ${cell.isLogged ? 'Logged' : 'No entries'}` : ''}
                >
                  {cell.day && <span className="heatmap-day-number">{cell.day}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
