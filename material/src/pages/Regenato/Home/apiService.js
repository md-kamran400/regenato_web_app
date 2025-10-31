// const BASE_URL = process.env.REACT_APP_BASE_URL;

// export const fetchManufacturingData = async () => {
//   const response = await fetch(`${BASE_URL}/api/manufacturing`);
//   if (!response.ok) throw new Error("Failed to fetch manufacturing data");
//   return await response.json();
// };

// export const fetchAllocationsData = async () => {
//   const response = await fetch(
//     `${BASE_URL}/api/defpartproject/all-allocations`
//   );
//   if (!response.ok) throw new Error("Failed to fetch allocations data");
//   return await response.json();
// };

// export const fetchOperatorsData = async () => {
//   const response = await fetch(`${BASE_URL}/api/userVariable`);
//   if (!response.ok) throw new Error("Failed to fetch operators data");
//   const data = await response.json();
//   return Array.isArray(data) ? data : [data];
// };

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const fetchManufacturingData = async () => {
  const response = await fetch(`${BASE_URL}/api/manufacturing`);
  if (!response.ok) throw new Error("Failed to fetch manufacturing data");
  return await response.json();
};

export const fetchAllocationsData = async () => {
  const response = await fetch(
    `${BASE_URL}/api/defpartproject/all-allocations`
  );
  if (!response.ok) throw new Error("Failed to fetch allocations data");
  const data = await response.json();
  return data.data || data; // Handle both response formats
};

export const fetchOperatorsData = async () => {
  const response = await fetch(`${BASE_URL}/api/userVariable`);
  if (!response.ok) throw new Error("Failed to fetch operators data");
  const data = await response.json();
  return Array.isArray(data) ? data : [data];
};

// Helper function to get flat allocations
export const getFlatAllocations = (allocationsData) => {
  const flatAllocations = [];
  
  allocationsData.forEach((project) => {
    project.allocations?.forEach((allocation) => {
      allocation.allocations?.forEach((processAlloc) => {
        processAlloc.allocations?.forEach((machineAlloc) => {
          flatAllocations.push({
            ...machineAlloc,
            projectName: project.projectName,
            partName: allocation.partName,
            processName: processAlloc.processName,
            processId: processAlloc.processId,
          });
        });
      });
    });
  });
  
  return flatAllocations;
};