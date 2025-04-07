// Key for localStorage
const INTERACTIONS_KEY = "userInteractions";

// Initialize or get user interactions
export const getUserInteractions = () => {
  const interactions = localStorage.getItem(INTERACTIONS_KEY);
  return interactions ? JSON.parse(interactions) : {};
};

export const saveUserInteraction = (chainKey, action) => {
  const interactions = getUserInteractions();
  if (!interactions[chainKey]) {
    interactions[chainKey] = { sayHi: 0, sayGM: 0, sayGN: 0 };
  }
  interactions[chainKey][action]++;
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(interactions));
  return interactions;
};

// Get unique chains interacted with
export const getUniqueChainsInteracted = (interactions) => {
  return Object.keys(interactions).length;
};