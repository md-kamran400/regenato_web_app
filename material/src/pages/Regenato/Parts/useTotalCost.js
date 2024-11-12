// hooks/useTotalCost.js
import { useState, useEffect } from 'react';

const useTotalCost = () => {
  const [totalCost, setTotalCost] = useState({
    rm: 0,
    manufacturing: 0,
    shipment: 0,
    overheads: 0,
    total: 0,
  });

  const updateTotalCost = (category, amount) => {
    setTotalCost(prevCost => ({
      ...prevCost,
      [category]: amount,
      total: Object.values(prevCost).reduce((sum, val) => sum + val, 0),
    }));
  };

  return { totalCost, updateTotalCost };
};

export default useTotalCost;