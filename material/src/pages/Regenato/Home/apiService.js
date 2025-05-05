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
  return await response.json();
};

export const fetchOperatorsData = async () => {
  const response = await fetch(`${BASE_URL}/api/userVariable`);
  if (!response.ok) throw new Error("Failed to fetch operators data");
  const data = await response.json();
  return Array.isArray(data) ? data : [data];
};
