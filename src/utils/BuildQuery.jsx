export const buildQueryString = (params) => {
    const queryParams = params
      .filter(param => param.value) // Only keep params that have a value
      .map(param => `${param.key}=${encodeURIComponent(param.value)}`); // Encode URI components
  
    return queryParams.length ? `?${queryParams.join("&")}` : "";
  };
  