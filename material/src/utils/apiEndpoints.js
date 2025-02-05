// src/utils/apiEndpoints.js


export const getRawMaterialEndpoint = (projectId, partId, itemId, variableId) => {
    // Check if we're dealing with partsList or subAssemblyListFirst
    const isPartsList = window.location.pathname.includes('partsLists');
    
    const baseUrl = `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}`;
    
    if (isPartsList) {
      return `${baseUrl}/partsLists/${partId}/items/${itemId}/rmVariables/${variableId}`;
    }
    
    return `${baseUrl}/partsLists/${partId}/items/${itemId}/rmVariables/${variableId}`;
  };
  