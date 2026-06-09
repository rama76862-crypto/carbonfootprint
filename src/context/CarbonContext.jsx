import React, { createContext, useContext, useState, useMemo } from 'react';

const CarbonContext = createContext();

export function CarbonProvider({ children }) {
  const [userProfile, setUserProfile] = useState({
    name: 'Alex Eco',
    location: 'India',
    householdSize: 3
  });

  const [emissionsData, setEmissionsData] = useState([
    { month: 'January', transport: 0.45, home: 0.35, food: 0.09, shopping: 0.12, total: 1.01 },
    { month: 'February', transport: 0.40, home: 0.32, food: 0.09, shopping: 0.10, total: 0.91 },
    { month: 'March', transport: 0.42, home: 0.28, food: 0.09, shopping: 0.15, total: 0.94 },
    { month: 'April', transport: 0.38, home: 0.25, food: 0.09, shopping: 0.11, total: 0.83 },
    { month: 'May', transport: 0.48, home: 0.22, food: 0.09, shopping: 0.18, total: 0.97 },
    { month: 'June', transport: 0.35, home: 0.20, food: 0.09, shopping: 0.13, total: 0.77 }
  ]);

  const addEmissionsEntry = (entry) => {
    const transport = parseFloat(entry.transport) || 0;
    const home = parseFloat(entry.home) || 0;
    const food = parseFloat(entry.food) || 0;
    const shopping = parseFloat(entry.shopping) || 0;
    const total = transport + home + food + shopping;

    setEmissionsData((prev) => {
      // If month already exists, update it. Otherwise append.
      const index = prev.findIndex((e) => e.month.toLowerCase() === entry.month.toLowerCase());
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...entry, transport, home, food, shopping, total };
        return updated;
      }
      return [...prev, { ...entry, transport, home, food, shopping, total }];
    });
  };

  const updateEntry = (month, updatedFields) => {
    setEmissionsData((prev) =>
      prev.map((entry) => {
        if (entry.month.toLowerCase() === month.toLowerCase()) {
          const merged = { ...entry, ...updatedFields };
          const transport = parseFloat(merged.transport) || 0;
          const home = parseFloat(merged.home) || 0;
          const food = parseFloat(merged.food) || 0;
          const shopping = parseFloat(merged.shopping) || 0;
          const total = transport + home + food + shopping;
          return { ...merged, transport, home, food, shopping, total };
        }
        return entry;
      })
    );
  };

  // totalAnnual is computed dynamically
  const totalAnnual = useMemo(() => {
    const sum = emissionsData.reduce((acc, curr) => acc + (curr.total || 0), 0);
    return parseFloat(sum.toFixed(2));
  }, [emissionsData]);

  const value = {
    userProfile,
    emissionsData,
    totalAnnual,
    actions: {
      setUserProfile,
      addEmissionsEntry,
      updateEntry
    }
  };

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
