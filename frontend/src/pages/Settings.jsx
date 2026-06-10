import React, { useState, useRef } from 'react';
import { useCarbonContext } from '../context/CarbonContext';
import { COUNTRY_AVERAGES } from '../utils/constants';
import { Save, Trash2, Download, Upload, User, MapPin, Users, Target, ShieldAlert, Sparkles, Check } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const { userProfile, emissionsData, actions } = useCarbonContext();
  const fileInputRef = useRef(null);

  // Form states
  const [name, setName] = useState(userProfile.name);
  const [location, setLocation] = useState(userProfile.location);
  const [householdSize, setHouseholdSize] = useState(userProfile.householdSize);
  const [annualTarget, setAnnualTarget] = useState(userProfile.annualTarget || 2.0);
  
  // Custom interface accents
  const [activeTheme, setActiveTheme] = useState('green');
  
  // Status states
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [importStatus, setImportStatus] = useState(null); // 'success' | 'error' | null
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setSaveStatus('error');
      return;
    }
    
    actions.updateProfile({
      name: name.trim(),
      location,
      householdSize: parseInt(householdSize) || 1,
      annualTarget: parseFloat(annualTarget) || 2.0
    });

    setSaveStatus('success');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleExportData = () => {
    const backup = {
      version: '1.0.0',
      userProfile: {
        name,
        location,
        householdSize,
        annualTarget
      },
      emissionsData
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ecotrace_backup_${name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Validation checks
        if (parsed.emissionsData && Array.isArray(parsed.emissionsData)) {
          actions.importEmissionsData(parsed.emissionsData);
        }
        
        if (parsed.userProfile) {
          const profile = parsed.userProfile;
          if (profile.name) setName(profile.name);
          if (profile.location) setLocation(profile.location);
          if (profile.householdSize) setHouseholdSize(profile.householdSize);
          if (profile.annualTarget) setAnnualTarget(profile.annualTarget);
          
          actions.updateProfile({
            name: profile.name || name,
            location: profile.location || location,
            householdSize: profile.householdSize || householdSize,
            annualTarget: profile.annualTarget || annualTarget
          });
        }

        setImportStatus('success');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        setImportStatus('error');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // clear input
  };

  const handleResetAllData = () => {
    actions.resetEmissionsData();
    actions.updateProfile({
      name: 'Alex Eco',
      location: 'India',
      householdSize: 3,
      annualTarget: 2.0
    });
    setName('Alex Eco');
    setLocation('India');
    setHouseholdSize(3);
    setAnnualTarget(2.0);
    setShowConfirmReset(false);
    
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="inner-page settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-description">Configure your carbon benchmarks, export logs, or reset data.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="card settings-card form-container">
          <div className="card-header-with-icon">
            <User className="card-header-icon text-accent" size={20} />
            <h3>Eco Profile Variables</h3>
          </div>
          
          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group-custom">
              <label htmlFor="name-input">Profile Name</label>
              <div className="input-with-icon-wrapper">
                <User size={16} className="input-field-icon" />
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="input-text-custom"
                />
              </div>
            </div>

            <div className="form-row-custom">
              <div className="form-group-custom flex-1">
                <label htmlFor="location-select">Location / Country</label>
                <div className="input-with-icon-wrapper">
                  <MapPin size={16} className="input-field-icon" />
                  <select
                    id="location-select"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="select-custom"
                  >
                    {Object.keys(COUNTRY_AVERAGES).map((country) => (
                      <option key={country} value={country}>
                        {country} (~{COUNTRY_AVERAGES[country]} t CO₂)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-custom flex-1">
                <label htmlFor="household-input">Household Size</label>
                <div className="input-with-icon-wrapper">
                  <Users size={16} className="input-field-icon" />
                  <input
                    id="household-input"
                    type="number"
                    min="1"
                    max="15"
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 1)}
                    className="input-text-custom"
                  />
                </div>
              </div>
            </div>

            <div className="form-group-custom">
              <label htmlFor="target-input">Custom Target Threshold (tonnes CO₂ / year)</label>
              <div className="input-with-icon-wrapper">
                <Target size={16} className="input-field-icon" />
                <input
                  id="target-input"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50.0"
                  value={annualTarget}
                  onChange={(e) => setAnnualTarget(parseFloat(e.target.value) || 2.0)}
                  className="input-text-custom"
                />
              </div>
              <p className="field-helper-text">
                Recommended target is <strong>2.0 tonnes</strong> (Paris Climate Agreement limit).
              </p>
            </div>

            <div className="form-submit-row">
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Settings
              </button>
              
              {saveStatus === 'success' && (
                <span className="save-message success text-mono flex align-center gap-xs">
                  <Check size={14} /> Profile Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="save-message error text-mono">
                  Error saving changes.
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Theme & Styling Accents */}
        <div className="card settings-card">
          <div className="card-header-with-icon">
            <Sparkles className="card-header-icon text-warning" size={20} />
            <h3>UI Aesthetics Accent</h3>
          </div>
          <p className="settings-desc">Choose a highlight highlight color to customize your carbon interface dashboard.</p>
          
          <div className="theme-selectors-grid">
            {[
              { id: 'green', label: 'Forest Green', color: '#2ECC71' },
              { id: 'blue', label: 'Electric Blue', color: '#3498DB' },
              { id: 'orange', label: 'Solar Orange', color: '#F39C12' },
              { id: 'purple', label: 'Neon Amethyst', color: '#9B59B6' }
            ].map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`theme-selector-btn ${activeTheme === theme.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTheme(theme.id);
                  document.documentElement.style.setProperty('--color-accent', theme.color);
                  document.documentElement.style.setProperty('--color-accent-soft', `${theme.color}A0`);
                }}
              >
                <span className="theme-color-dot" style={{ backgroundColor: theme.color }}></span>
                <span>{theme.label}</span>
                {activeTheme === theme.id && <Check size={14} className="theme-checked-icon" />}
              </button>
            ))}
          </div>
        </div>

        {/* Data Portability (Backup / Reset) */}
        <div className="card settings-card portability-card">
          <div className="card-header-with-icon">
            <Download className="card-header-icon text-info" size={20} />
            <h3>Data Management</h3>
          </div>
          <p className="settings-desc">Export carbon footprints for spreadsheets, or import JSON snapshots.</p>

          <div className="action-buttons-group">
            <button type="button" className="btn btn-outline" onClick={handleExportData}>
              <Download size={16} /> Export Carbon Data (.json)
            </button>
            
            <button type="button" className="btn btn-outline" onClick={handleImportClick}>
              <Upload size={16} /> Import Backup (.json)
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>

          {importStatus === 'success' && (
            <div className="import-status success text-mono flex align-center gap-xs">
              <Check size={14} /> Backup loaded successfully!
            </div>
          )}
          {importStatus === 'error' && (
            <div className="import-status error text-mono">
              Error parsing file. Invalid format.
            </div>
          )}

          <div className="danger-zone-container">
            <h4 className="danger-zone-title">Danger Zone</h4>
            <p className="settings-desc">Resetting clears all custom emissions logs and profiles to initial states.</p>
            
            {!showConfirmReset ? (
              <button
                type="button"
                className="btn btn-danger-custom"
                onClick={() => setShowConfirmReset(true)}
              >
                <Trash2 size={16} /> Reset All Data
              </button>
            ) : (
              <div className="confirm-reset-box card">
                <div className="flex align-center gap-sm danger-heading">
                  <ShieldAlert className="text-danger" size={20} />
                  <span>Are you absolutely sure?</span>
                </div>
                <p>This action cannot be undone. All recorded tracking history will be permanently deleted.</p>
                <div className="reset-buttons flex gap-sm">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowConfirmReset(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-custom"
                    onClick={handleResetAllData}
                  >
                    Yes, Purge Everything
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
