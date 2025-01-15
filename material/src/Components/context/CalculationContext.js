// import React, { createContext, useContext, useState } from "react";

// const CalculationContext = createContext();

// export const CalculationProvider = ({ children }) => {
//   const [costPerUnit, setCostPerUnit] = useState(0);
//   const [timePerUnit, setTimePerUnit] = useState(0);

//   return (
//     <CalculationContext.Provider
//       value={{ costPerUnit, setCostPerUnit, timePerUnit, setTimePerUnit }}
//     >
//       {children}
//     </CalculationContext.Provider>
//   );
// };

// export const useCalculation = () => useContext(CalculationContext);

// In CalculationContext.js
import React, { createContext, useState, useContext } from "react";

const CalculationContext = createContext();

export const CalculationProvider = ({ children }) => {
  const [costPerUnitAvg, setCostPerUnitAvg] = useState(0);
  const [manufacturingHours, setManufacturingHours] = useState(0);

  return (
    <CalculationContext.Provider
      value={{
        costPerUnitAvg,
        setCostPerUnitAvg,
        manufacturingHours,
        setManufacturingHours,
      }}
    >
      {children}
    </CalculationContext.Provider>
  );
};

export const useCalculation = () => useContext(CalculationContext);
