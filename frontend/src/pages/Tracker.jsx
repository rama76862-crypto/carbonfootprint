import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarbonContext } from '../context/CarbonContext';
import { 
  calcTransportEmissions, 
  calcHomeEmissions, 
  calcFoodEmissions, 
  calcShoppingEmissions 
} from '../utils/calculations';
import { MONTHS } from '../utils/constants';
import { 
  Car, 
  Home as HomeIcon, 
  Utensils, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2,
  Check, 
  Plane, 
  Bus, 
  Train, 
  Bike, 
  Calendar
} from 'lucide-react';
import './Tracker.css';

export default function Tracker() {
  const navigate = useNavigate();
  const { actions } = useCarbonContext();

  // Selected logging month
  const [selectedMonth, setSelectedMonth] = useState('July');

  // Active Category tab ('transport' | 'home' | 'food' | 'shopping')
  const [activeTab, setActiveTab] = useState('transport');

  // --- 1. Transport Form State ---
  const [transportType, setTransportType] = useState('car');
  const [distance, setDistance] = useState(150);
  const [frequency, setFrequency] = useState('weekly');
  const [transportList, setTransportList] = useState([]);

  // --- 2. Home Energy Form State ---
  const [electricity, setElectricity] = useState(250); // kWh
  const [gas, setGas] = useState(80); // units
  const [householdSize, setHouseholdSize] = useState(3);
  const [renewable, setRenewable] = useState(false);

  // --- 3. Food & Diet Form State ---
  const [dietType, setDietType] = useState('omnivore');
  const [foodWaste, setFoodWaste] = useState('medium');
  const [localSeasonal, setLocalSeasonal] = useState(false);

  // --- 4. Shopping Form State ---
  const [spendInr, setSpendInr] = useState(10000); // INR
  const [secondHand, setSecondHand] = useState(false);

  // Frequency Multiplier to convert to monthly value
  const getFreqMultiplier = (freq) => {
    switch (freq) {
      case 'daily': return 30;
      case 'weekly': return 4.3;
      case 'monthly': return 1;
      case 'one-time': return 1;
      default: return 1;
    }
  };

  // Live Trip Calculation for current inputs (kg CO2)
  const currentTripCo2Kg = useMemo(() => {
    const tonnes = calcTransportEmissions(distance, transportType) * getFreqMultiplier(frequency);
    return Math.round(tonnes * 1000);
  }, [distance, transportType, frequency]);

  // Add Transport entry to session list
  const handleAddTrip = () => {
    const key = Date.now();
    const itemCo2 = calcTransportEmissions(distance, transportType) * getFreqMultiplier(frequency);
    setTransportList([
      ...transportList,
      {
        id: key,
        type: transportType,
        distance,
        frequency,
        co2Kg: Math.round(itemCo2 * 1000),
        co2Tonnes: itemCo2
      }
    ]);
  };

  const handleRemoveTrip = (id) => {
    setTransportList(transportList.filter(item => item.id !== id));
  };

  // --- Live Calculations in kg CO2 per Month ---
  const transportTotalKg = useMemo(() => {
    return transportList.reduce((acc, curr) => acc + curr.co2Kg, 0);
  }, [transportList]);

  const homeTotalKg = useMemo(() => {
    // Shared home carbon is divided by household size
    const totalTonnes = calcHomeEmissions(electricity, gas) * (renewable ? 0.3 : 1.0);
    const perCapitaTonnes = totalTonnes / Math.max(1, householdSize);
    return Math.round(perCapitaTonnes * 1000);
  }, [electricity, gas, householdSize, renewable]);

  const foodTotalKg = useMemo(() => {
    let tonnes = calcFoodEmissions(dietType, 30); // 30 days
    let wasteFactor = 1.0;
    if (foodWaste === 'low') wasteFactor = 1.05;
    else if (foodWaste === 'medium') wasteFactor = 1.15;
    else if (foodWaste === 'high') wasteFactor = 1.25;
    
    tonnes *= wasteFactor;
    if (localSeasonal) tonnes *= 0.90; // 10% reduction
    return Math.round(tonnes * 1000);
  }, [dietType, foodWaste, localSeasonal]);

  const shoppingTotalKg = useMemo(() => {
    // Convert INR to USD (approx 1 USD = 83 INR)
    const usd = spendInr / 83;
    let tonnes = calcShoppingEmissions(usd);
    if (secondHand) tonnes *= 0.60; // 40% reduction
    return Math.round(tonnes * 1000);
  }, [spendInr, secondHand]);

  // Combined Session Totals
  const sessionTotalKg = useMemo(() => {
    return transportTotalKg + homeTotalKg + foodTotalKg + shoppingTotalKg;
  }, [transportTotalKg, homeTotalKg, foodTotalKg, shoppingTotalKg]);

  const barPercent = useMemo(() => {
    return Math.min(100, (sessionTotalKg / 600) * 100); // 600kg max month indicator
  }, [sessionTotalKg]);

  const barColor = useMemo(() => {
    if (sessionTotalKg < 170) return 'var(--color-accent)';      // green
    if (sessionTotalKg <= 400) return 'var(--color-warning)';    // orange
    return 'var(--color-danger)';                                // red
  }, [sessionTotalKg]);

  // Save Session Entry to Context & Redirect
  const handleSaveEntry = () => {
    const transportVal = transportList.reduce((acc, curr) => acc + curr.co2Tonnes, 0);
    const homeVal = (calcHomeEmissions(electricity, gas) * (renewable ? 0.3 : 1.0)) / householdSize;
    
    let foodVal = calcFoodEmissions(dietType, 30);
    let wasteFactor = 1.0;
    if (foodWaste === 'low') wasteFactor = 1.05;
    else if (foodWaste === 'medium') wasteFactor = 1.15;
    else if (foodWaste === 'high') wasteFactor = 1.25;
    foodVal *= wasteFactor;
    if (localSeasonal) foodVal *= 0.90;

    const shopVal = (calcShoppingEmissions(spendInr / 83)) * (secondHand ? 0.60 : 1.0);

    actions.addEmissionsEntry({
      month: selectedMonth,
      transport: parseFloat(transportVal.toFixed(3)),
      home: parseFloat(homeVal.toFixed(3)),
      food: parseFloat(foodVal.toFixed(3)),
      shopping: parseFloat(shopVal.toFixed(3))
    });

    navigate('/dashboard');
  };

  // Stepper helper
  const adjustDistance = (val) => {
    setDistance(prev => Math.max(0, prev + val));
  };

  return (
    <div className="tracker-page">
      {/* Header with Month Selector */}
      <div className="tracker-header flex align-center justify-between">
        <div>
          <h1 className="page-title">Emissions Tracker</h1>
          <p className="page-description">Configure your monthly carbon activities below.</p>
        </div>
        <div className="month-selector-wrapper flex align-center gap-sm card">
          <Calendar size={16} className="calendar-icon" />
          <span className="month-label">Logging Month:</span>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-dropdown"
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Main Form Layout */}
      <div className="tracker-split-layout">
        {/* Left Side Navigation (40%) */}
        <div className="tracker-nav-panel">
          <div className="tracker-tabs-card card">
            <h3>Activities</h3>
            <div className="tracker-vertical-tabs">
              <button 
                className={`tracker-tab ${activeTab === 'transport' ? 'active' : ''}`}
                onClick={() => setActiveTab('transport')}
              >
                <div className="tab-label-group flex align-center gap-sm">
                  <Car size={18} />
                  <span>Transport</span>
                </div>
                <span className="tab-badge text-mono">
                  {transportList.length} {transportList.length === 1 ? 'trip' : 'trips'}
                </span>
              </button>

              <button 
                className={`tracker-tab ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                <div className="tab-label-group flex align-center gap-sm">
                  <HomeIcon size={18} />
                  <span>Home Energy</span>
                </div>
                <span className="tab-badge text-mono">
                  {(electricity > 0 || gas > 0) ? '1 entry' : '0 entries'}
                </span>
              </button>

              <button 
                className={`tracker-tab ${activeTab === 'food' ? 'active' : ''}`}
                onClick={() => setActiveTab('food')}
              >
                <div className="tab-label-group flex align-center gap-sm">
                  <Utensils size={18} />
                  <span>Food & Diet</span>
                </div>
                <span className="tab-badge text-mono">
                  {dietType ? '1 entry' : '0 entries'}
                </span>
              </button>

              <button 
                className={`tracker-tab ${activeTab === 'shopping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shopping')}
              >
                <div className="tab-label-group flex align-center gap-sm">
                  <ShoppingBag size={18} />
                  <span>Shopping</span>
                </div>
                <span className="tab-badge text-mono">
                  {spendInr > 0 ? '1 entry' : '0 entries'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Active Form Panel (60%) */}
        <div className="tracker-form-panel">
          <div className="tracker-form-card card">
            
            {/* TRANSPORT FORM */}
            {activeTab === 'transport' && (
              <div className="form-content">
                <div className="form-section-title flex align-center gap-sm">
                  <Car className="accent-color" />
                  <h3>Transport Emissions</h3>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Vehicle/Mode Type</label>
                  <div className="segmented-control">
                    {[
                      { type: 'car', icon: Car, label: 'Car' },
                      { type: 'flight', icon: Plane, label: 'Flight' },
                      { type: 'bus', icon: Bus, label: 'Bus' },
                      { type: 'train', icon: Train, label: 'Train' },
                      { type: 'bike', icon: Bike, label: 'Bike' }
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.type}
                          className={`segment-btn ${transportType === item.type ? 'active' : ''}`}
                          onClick={() => setTransportType(item.type)}
                          type="button"
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group flex-1">
                    <label className="input-label">Distance (km)</label>
                    <div className="stepper-input">
                      <button className="stepper-btn" onClick={() => adjustDistance(-50)} type="button">
                        <Minus size={14} />
                      </button>
                      <input 
                        type="number" 
                        value={distance} 
                        onChange={(e) => setDistance(Math.max(0, parseInt(e.target.value) || 0))}
                        className="stepper-value text-mono"
                      />
                      <button className="stepper-btn" onClick={() => adjustDistance(50)} type="button">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Frequency</label>
                  <div className="pill-radio-group">
                    {['daily', 'weekly', 'monthly', 'one-time'].map(freq => (
                      <label 
                        key={freq} 
                        className={`pill-radio-label ${frequency === freq ? 'active' : ''}`}
                      >
                        <input 
                          type="radio" 
                          name="frequency" 
                          value={freq}
                          checked={frequency === freq}
                          onChange={() => setFrequency(freq)}
                          className="pill-radio-input"
                        />
                        {freq.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-calculation-summary text-mono">
                  This trip adds ~<span className="summary-number">{currentTripCo2Kg}</span> kg CO₂ / month
                </div>

                <button className="btn btn-outline" onClick={handleAddTrip} type="button">
                  <Plus size={16} /> Add Trip
                </button>

                {/* List of current trips in session */}
                {transportList.length > 0 && (
                  <div className="logged-trips-sublist">
                    <h4>Trips Added in This Session</h4>
                    <div className="trip-tags-grid">
                      {transportList.map(trip => (
                        <div key={trip.id} className="trip-tag">
                          <span className="trip-tag-details">
                            <span className="capitalize">{trip.type}</span>: {trip.distance}km ({trip.frequency})
                          </span>
                          <span className="trip-tag-val text-mono">+{trip.co2Kg}kg</span>
                          <button 
                            className="remove-trip-btn"
                            onClick={() => handleRemoveTrip(trip.id)}
                            title="Remove trip"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HOME ENERGY FORM */}
            {activeTab === 'home' && (
              <div className="form-content">
                <div className="form-section-title flex align-center gap-sm">
                  <HomeIcon className="warning-color" />
                  <h3>Home Energy Emissions</h3>
                </div>

                <div className="input-group">
                  <div className="input-header flex justify-between">
                    <label className="input-label">Electricity Usage (kWh)</label>
                    <input 
                      type="number" 
                      value={electricity}
                      onChange={(e) => setElectricity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-input-small text-mono"
                    />
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    step="10"
                    value={electricity}
                    onChange={(e) => setElectricity(parseInt(e.target.value) || 0)}
                    className="slider-input"
                  />
                  <div className="slider-limits text-mono">
                    <span>0 kWh</span>
                    <span>1000 kWh</span>
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-header flex justify-between">
                    <label className="input-label">Gas Usage (units)</label>
                    <input 
                      type="number" 
                      value={gas}
                      onChange={(e) => setGas(Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-input-small text-mono"
                    />
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="500" 
                    step="5"
                    value={gas}
                    onChange={(e) => setGas(parseInt(e.target.value) || 0)}
                    className="slider-input"
                  />
                  <div className="slider-limits text-mono">
                    <span>0 units</span>
                    <span>500 units</span>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Household Size</label>
                  <div className="stepper-input">
                    <button className="stepper-btn" onClick={() => setHouseholdSize(prev => Math.max(1, prev - 1))} type="button">
                      <Minus size={14} />
                    </button>
                    <span className="stepper-value text-mono">{householdSize}</span>
                    <button className="stepper-btn" onClick={() => setHouseholdSize(prev => Math.min(8, prev + 1))} type="button">
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="input-helper">Footprint is shared among household occupants.</p>
                </div>

                <div className="input-group toggle-row flex align-center justify-between">
                  <div>
                    <label className="input-label no-margin">Renewable Energy Source</label>
                    <p className="input-helper">I use rooftop solar or green energy supply.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={renewable}
                      onChange={(e) => setRenewable(e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="form-calculation-summary text-mono">
                  Your energy share = <span className="summary-number">{homeTotalKg}</span> kg CO₂ / month
                </div>
              </div>
            )}

            {/* FOOD & DIET FORM */}
            {activeTab === 'food' && (
              <div className="form-content">
                <div className="form-section-title flex align-center gap-sm">
                  <Utensils className="food-color-title" />
                  <h3>Food & Diet Emissions</h3>
                </div>

                <div className="input-group">
                  <label className="input-label">Primary Diet Type</label>
                  <div className="diet-cards-grid">
                    {[
                      { type: 'meat_heavy', title: 'Meat-heavy', desc: 'Frequent red meat and dairy', colorClass: 'meat-heavy' },
                      { type: 'omnivore', title: 'Omnivore', desc: 'Balanced meats, veggies, grains', colorClass: 'omnivore' },
                      { type: 'vegetarian', title: 'Vegetarian', desc: 'No meat, includes dairy/eggs', colorClass: 'vegetarian' },
                      { type: 'vegan', title: 'Vegan', desc: 'Strictly plant-based nutrition', colorClass: 'vegan' }
                    ].map(diet => (
                      <div 
                        key={diet.type}
                        className={`diet-card ${diet.colorClass} ${dietType === diet.type ? 'selected' : ''}`}
                        onClick={() => setDietType(diet.type)}
                      >
                        <div className="diet-select-check">
                          {dietType === diet.type && <Check size={12} />}
                        </div>
                        <h4>{diet.title}</h4>
                        <p>{diet.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Household Food Waste</label>
                  <div className="pill-radio-group">
                    {['low', 'medium', 'high'].map(waste => (
                      <label 
                        key={waste} 
                        className={`pill-radio-label ${foodWaste === waste ? 'active' : ''}`}
                      >
                        <input 
                          type="radio" 
                          name="foodWaste" 
                          value={waste}
                          checked={foodWaste === waste}
                          onChange={() => setFoodWaste(waste)}
                          className="pill-radio-input"
                        />
                        {waste.toUpperCase()}
                      </label>
                    ))}
                  </div>
                  <p className="input-helper">Waste adds 5% (low), 15% (medium), or 25% (high) markup.</p>
                </div>

                <div className="input-group toggle-row flex align-center justify-between">
                  <div>
                    <label className="input-label no-margin">Local & Seasonal Food</label>
                    <p className="input-helper">Prioritize foods grown locally to reduce transport miles.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={localSeasonal}
                      onChange={(e) => setLocalSeasonal(e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="form-calculation-summary text-mono">
                  Your diet adds ~<span className="summary-number">{foodTotalKg}</span> kg CO₂ / month
                </div>
              </div>
            )}

            {/* SHOPPING FORM */}
            {activeTab === 'shopping' && (
              <div className="form-content">
                <div className="form-section-title flex align-center gap-sm">
                  <ShoppingBag className="danger-color" />
                  <h3>Shopping & Purchases</h3>
                </div>

                <div className="input-group">
                  <div className="input-header flex justify-between">
                    <label className="input-label">Monthly Spend (INR)</label>
                    <span className="spend-value-readout text-mono">₹{spendInr.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50000" 
                    step="1000"
                    value={spendInr}
                    onChange={(e) => setSpendInr(parseInt(e.target.value) || 0)}
                    className="slider-input"
                  />
                  <div className="slider-limits text-mono">
                    <span>₹0</span>
                    <span>₹50,000+</span>
                  </div>
                  
                  {/* Preset quick buttons */}
                  <div className="presets-container flex gap-sm">
                    {[5000, 10000, 20000, 30000].map(val => (
                      <button
                        key={val}
                        type="button"
                        className="btn-preset text-mono"
                        onClick={() => setSpendInr(val)}
                      >
                        ₹{(val / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group toggle-row flex align-center justify-between">
                  <div>
                    <label className="input-label no-margin">Thrift & Second-Hand Goods</label>
                    <p className="input-helper">Frequent thriting avoids manufacturing overheads.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={secondHand}
                      onChange={(e) => setSecondHand(e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="form-calculation-summary text-mono">
                  Your shopping adds ~<span className="summary-number">{shoppingTotalKg}</span> kg CO₂ / month
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Sticky Bottom Running Total Bar */}
      <div className="sticky-running-total-bar">
        <div className="running-total-container flex align-center justify-between">
          <div className="running-total-math">
            <span className="running-total-label">Session total:</span>
            <span className="running-total-val text-mono">{sessionTotalKg.toLocaleString()} kg CO₂</span>
          </div>

          <div className="progress-bar-container flex-1">
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${barPercent}%`, backgroundColor: barColor }}
              ></div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleSaveEntry} type="button">
            Save Monthly Log
          </button>
        </div>
      </div>
    </div>
  );
}
