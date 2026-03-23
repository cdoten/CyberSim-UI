// src/util/scenario.js
//
// Resolves the current scenario slug from the hostname.
//
// Production:  cso.cybersim.app      → 'cso'
//              campaign.cybersim.app → 'campaign'
// Local dev:   localhost             → REACT_APP_SCENARIO_SLUG env var, or 'cso'

export function getScenarioSlug() {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];

  if (!subdomain || subdomain === 'localhost') {
    return process.env.REACT_APP_SCENARIO_SLUG || 'cso';
  }

  return subdomain;
}
