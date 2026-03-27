// src/util/scenario.test.js

import { getScenarioSlug } from './scenario';

describe('getScenarioSlug', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns the subdomain from a real production hostname', () => {
    delete window.location;
    window.location = { hostname: 'cso.cybersim.app' };
    expect(getScenarioSlug()).toBe('cso');
  });

  it('returns the correct subdomain for other scenarios', () => {
    delete window.location;
    window.location = { hostname: 'campaign.cybersim.app' };
    expect(getScenarioSlug()).toBe('campaign');
  });

  it('falls back to REACT_APP_SCENARIO_SLUG env var on localhost', () => {
    delete window.location;
    window.location = { hostname: 'localhost' };
    process.env.REACT_APP_SCENARIO_SLUG = 'tnr';
    expect(getScenarioSlug()).toBe('tnr');
  });

  it('falls back to cso when on localhost with no env var set', () => {
    delete window.location;
    window.location = { hostname: 'localhost' };
    delete process.env.REACT_APP_SCENARIO_SLUG;
    expect(getScenarioSlug()).toBe('cso');
  });

  it('falls back to cso when hostname is empty', () => {
    delete window.location;
    window.location = { hostname: '' };
    delete process.env.REACT_APP_SCENARIO_SLUG;
    expect(getScenarioSlug()).toBe('cso');
  });

  it('falls back to env var when hosted at a bare domain', () => {
    delete window.location;
    window.location = { hostname: 'cybersim.app' };
    process.env.REACT_APP_SCENARIO_SLUG = 'tnr';
    expect(getScenarioSlug()).toBe('tnr');
  });

  it('falls back to cso when hosted at a bare domain with no env var', () => {
    delete window.location;
    window.location = { hostname: 'cybersim.app' };
    delete process.env.REACT_APP_SCENARIO_SLUG;
    expect(getScenarioSlug()).toBe('cso');
  });
});
