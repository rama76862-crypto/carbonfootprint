import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { carbonApi } from '../services/carbonApi';

const CarbonContext = createContext();

export function CarbonProvider({ children }) {
  const [userProfile, setUserProfile] = useState({
    name: 'Alex Eco',
    location: 'India',
    householdSize: 3,
    annualTarget: 2.0,
    persona: 'urban_family'
  });

  const [emissionsData, setEmissionsData] = useState([
    { month: 'January', transport: 0.45, home: 0.35, food: 0.09, shopping: 0.12, total: 1.01 },
    { month: 'February', transport: 0.40, home: 0.32, food: 0.09, shopping: 0.10, total: 0.91 },
    { month: 'March', transport: 0.42, home: 0.28, food: 0.09, shopping: 0.15, total: 0.94 },
    { month: 'April', transport: 0.38, home: 0.25, food: 0.09, shopping: 0.11, total: 0.83 },
    { month: 'May', transport: 0.48, home: 0.22, food: 0.09, shopping: 0.18, total: 0.97 },
    { month: 'June', transport: 0.35, home: 0.20, food: 0.09, shopping: 0.13, total: 0.77 }
  ]);

  const [syncStatus, setSyncStatus] = useState('idle');
  const [assistantPlan, setAssistantPlan] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadBackendState() {
      setSyncStatus('loading');

      try {
        const [profile, emissionsResponse] = await Promise.all([
          carbonApi.getProfile(),
          carbonApi.getEmissions()
        ]);

        if (!active) return;
        setUserProfile(profile);
        setEmissionsData(emissionsResponse.emissions);
        setSyncStatus('synced');
      } catch (error) {
        if (!active) return;
        console.warn('Using local carbon defaults because the API is unavailable:', error.message);
        setSyncStatus('offline');
      }
    }

    loadBackendState();

    return () => {
      active = false;
    };
  }, []);

  const addEmissionsEntry = useCallback((entry) => {
    const transport = parseFloat(entry.transport) || 0;
    const home = parseFloat(entry.home) || 0;
    const food = parseFloat(entry.food) || 0;
    const shopping = parseFloat(entry.shopping) || 0;
    const total = transport + home + food + shopping;
    const normalizedEntry = { ...entry, transport, home, food, shopping, total };

    setEmissionsData((prev) => {
      // If month already exists, update it. Otherwise append.
      const index = prev.findIndex((e) => e.month.toLowerCase() === entry.month.toLowerCase());
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = normalizedEntry;
        return updated;
      }
      return [...prev, normalizedEntry];
    });

    carbonApi.saveEmission(normalizedEntry)
      .then((response) => {
        setEmissionsData(response.emissions);
        setSyncStatus('synced');
      })
      .catch((error) => {
        console.warn('Could not persist emissions entry:', error.message);
        setSyncStatus('offline');
      });
  }, []);

  const updateEntry = useCallback((month, updatedFields) => {
    let patchedEntry = null;

    setEmissionsData((prev) =>
      prev.map((entry) => {
        if (entry.month.toLowerCase() === month.toLowerCase()) {
          const merged = { ...entry, ...updatedFields };
          const transport = parseFloat(merged.transport) || 0;
          const home = parseFloat(merged.home) || 0;
          const food = parseFloat(merged.food) || 0;
          const shopping = parseFloat(merged.shopping) || 0;
          const total = transport + home + food + shopping;
          patchedEntry = { ...merged, transport, home, food, shopping, total: parseFloat(total.toFixed(3)) };
          return patchedEntry;
        }
        return entry;
      })
    );

    carbonApi.updateEmission(month, updatedFields)
      .then((response) => {
        setEmissionsData(response.emissions);
        setSyncStatus('synced');
      })
      .catch((error) => {
        if (patchedEntry) {
          console.warn('Local entry updated but API sync failed:', error.message);
        }
        setSyncStatus('offline');
      });
  }, []);

  const updateUserProfile = useCallback((profile) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));

    carbonApi.updateProfile(profile)
      .then((updatedProfile) => {
        setUserProfile(updatedProfile);
        setSyncStatus('synced');
      })
      .catch((error) => {
        console.warn('Could not persist user profile:', error.message);
        setSyncStatus('offline');
      });
  }, []);

  const refreshAssistantPlan = useCallback(async (goal = 'reduce monthly footprint') => {
    try {
      const plan = await carbonApi.getAssistantPlan(goal);
      setAssistantPlan(plan);
      setSyncStatus('synced');
      return plan;
    } catch (error) {
      console.warn('Could not load assistant plan:', error.message);
      setSyncStatus('offline');
      return null;
    }
  }, []);

  const updateProfile = useCallback((profileUpdates) => {
    setUserProfile((prev) => ({
      ...prev,
      ...profileUpdates
    }));
    updateUserProfile(profileUpdates);
  }, [updateUserProfile]);

  const resetEmissionsData = useCallback(() => {
    setEmissionsData([]);
  }, []);

  const importEmissionsData = useCallback((data) => {
    if (Array.isArray(data)) {
      const cleanData = data.map((entry) => {
        const transport = parseFloat(entry.transport) || 0;
        const home = parseFloat(entry.home) || 0;
        const food = parseFloat(entry.food) || 0;
        const shopping = parseFloat(entry.shopping) || 0;
        const total = transport + home + food + shopping;
        return {
          month: entry.month || 'Unknown',
          transport,
          home,
          food,
          shopping,
          total: parseFloat(total.toFixed(3))
        };
      });
      setEmissionsData(cleanData);
    }
  }, []);

  // totalAnnual is computed dynamically
  const totalAnnual = useMemo(() => {
    const sum = emissionsData.reduce((acc, curr) => acc + (curr.total || 0), 0);
    return parseFloat(sum.toFixed(2));
  }, [emissionsData]);

  const value = useMemo(() => ({
    userProfile,
    emissionsData,
    totalAnnual,
    syncStatus,
    assistantPlan,
    actions: {
      setUserProfile: updateUserProfile,
      addEmissionsEntry,
      updateEntry,
      updateProfile,
      resetEmissionsData,
      importEmissionsData,
      refreshAssistantPlan
    }
  }), [
    userProfile,
    emissionsData,
    totalAnnual,
    syncStatus,
    assistantPlan,
    updateUserProfile,
    addEmissionsEntry,
    updateEntry,
    updateProfile,
    resetEmissionsData,
    importEmissionsData,
    refreshAssistantPlan
  ]);

  return (
    <CarbonContext.Provider value={value}>
      {children}
    </CarbonContext.Provider>
  );
}

export function useCarbonContext() {
  const context = useContext(CarbonContext);
  if (!context) {
    throw new Error('useCarbonContext must be used within a CarbonProvider');
  }
  return context;
}
