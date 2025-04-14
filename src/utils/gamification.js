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

// Shared reset logic for daily reset at UTC midnight
export const handleDailyReset = (lastResetTimeKey, setInteractions) => {
  const now = new Date();
  const lastReset = localStorage.getItem(lastResetTimeKey)
    ? parseInt(localStorage.getItem(lastResetTimeKey), 10)
    : now.getTime();

  // Get the UTC date for today and the last reset time
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const lastResetDate = new Date(lastReset);
  const lastResetUTC = new Date(Date.UTC(lastResetDate.getUTCFullYear(), lastResetDate.getUTCMonth(), lastResetDate.getUTCDate()));

  // If the last reset was on a different UTC day, reset the interactions
  if (todayUTC.getTime() > lastResetUTC.getTime()) {
    console.log(`Resetting interactions for ${lastResetTimeKey} at ${now.toISOString()}`);
    resetUserInteractions();
    setInteractions({});
    localStorage.setItem(lastResetTimeKey, now.getTime().toString());
  }

  // Calculate time remaining until next UTC midnight
  const nextMidnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const diffMs = nextMidnightUTC - now;
  const diffSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};