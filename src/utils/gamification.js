// Key for localStorage
const INTERACTIONS_KEY = "userInteractions";

// Initialize or get user interactions
export const getUserInteractions = () => {
  const interactions = localStorage.getItem(INTERACTIONS_KEY);
  return interactions ? JSON.parse(interactions) : {};
};

// Save user interaction for a chain and action
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

// Get total number of interactions (sum of all actions across all chains)
export const getTotalInteractions = (interactions) => {
  let total = 0;
  for (const chain in interactions) {
    const actions = interactions[chain];
    total += actions.sayHi + actions.sayGM + actions.sayGN;
  }
  return total;
};

// Reset user interactions
export const resetUserInteractions = () => {
  localStorage.removeItem(INTERACTIONS_KEY);
  return {};
};