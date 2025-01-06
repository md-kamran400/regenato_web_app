// src/contexts/PartDataContext.js

import React, { createContext, useState } from 'react';

export const PartDataContext = createContext();

export const PartDataProvider = ({ children }) => {
  const [sharedPartData, setSharedPartData] = useState(null);

  return (
    <PartDataContext.Provider value={{ sharedPartData, setSharedPartData }}>
      {children}
    </PartDataContext.Provider>
  );
};

// export { PartDataProvider, PartDataContext };