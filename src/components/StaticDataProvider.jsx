/**
 * Provide scenario-scoped static game data to the React app.
 *
 * What it does:
 * - Resolves the active scenario slug from the current hostname
 * - Fetches static scenario resources from the backend
 * - Exposes loading state, lookup helpers, and fetched data through context
 *
 * Important notes:
 * - For normal game play, the scenario slug is derived from the subdomain.
 * - Every static-data request includes scenarioSlug so the backend can return
 *   only the content for the active scenario.
 */

import React, { useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { keyBy as _keyBy } from 'lodash';
import { getScenarioSlug } from '../util/scenario';

const StaticDataContext = React.createContext(null);

export const useStaticData = () => {
  const context = useContext(StaticDataContext);
  if (context === undefined) {
    throw new Error('StaticDataProvider not found');
  }
  return context;
};

export const StaticDataProvider = ({ children }) => {
  const apiBase = process.env.REACT_APP_API_URL;
  const scenarioSlug = getScenarioSlug();

  const [backendError, setBackendError] = useState('');
  const [backendDown, setBackendDown] = useState(false);

  const noteBackendDown = useCallback(
    (err) => {
      if (backendDown) return;

      const msg = apiBase
        ? `Backend not reachable at ${apiBase}`
        : 'Missing REACT_APP_API_URL (set it in Amplify environment variables and redeploy).';

      setBackendError(msg);
      setBackendDown(true);

      // eslint-disable-next-line no-console
      console.error(err);
    },
    [apiBase, backendDown],
  );

  const fetchScenarioResource = useCallback(
    async (resourcePath) =>
      axios.get(`${apiBase}${resourcePath}`, {
        params: { scenarioSlug },
      }),
    [apiBase, scenarioSlug],
  );

  const [scenarioName, setScenarioName] = useState('');

  useEffect(() => {
    if (!apiBase || backendDown) return;
    fetchScenarioResource('/scenario')
      .then(({ data }) => setScenarioName(data?.name || scenarioSlug))
      .catch(() => setScenarioName(scenarioSlug));
  }, [apiBase, backendDown, fetchScenarioResource, scenarioSlug]);

  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locations, setLocations] = useState({});

  useEffect(() => {
    if (!apiBase || backendDown) {
      setLocationsLoading(false);
      return;
    }

    setLocationsLoading(true);

    fetchScenarioResource('/locations')
      .then(({ data }) => {
        setLocations(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setLocationsLoading(false));
  }, [apiBase, backendDown, fetchScenarioResource, noteBackendDown]);

  const getLocationNameByType = useCallback(
    (type, defaultName = 'HQ') => {
      const match = Object.values(locations).find(
        (location) => location.type === type,
      );
      return match?.name ?? defaultName;
    },
    [locations],
  );

  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [dictionary, setDictionary] = useState({});

  useEffect(() => {
    if (!apiBase || backendDown) {
      setDictionaryLoading(false);
      return;
    }

    setDictionaryLoading(true);

    fetchScenarioResource('/dictionary')
      .then(({ data }) => {
        const resultObject = (data || []).reduce((acc, obj) => {
          const values = Object.values(obj);
          const key = values[0];
          const value = values[1];

          if (!Object.prototype.hasOwnProperty.call(acc, key)) {
            acc[key] = value;
          }
          return acc;
        }, {});
        setDictionary(resultObject);
      })
      .catch(noteBackendDown)
      .finally(() => setDictionaryLoading(false));
  }, [apiBase, backendDown, fetchScenarioResource, noteBackendDown]);

  const getTextWithSynonyms = useCallback(
    (text) => {
      const input = String(text ?? '');

      const keys = Object.keys(dictionary || {});
      if (keys.length === 0) return input;

      const escapedKeys = keys.map((k) =>
        k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      );
      const regex = new RegExp(escapedKeys.join('|'), 'gi');

      return input.replace(regex, (match) => {
        const synonym = dictionary[match.toLowerCase()];
        if (!synonym) return match;

        return match[0] === match[0].toUpperCase()
          ? synonym.charAt(0).toUpperCase() + synonym.slice(1)
          : synonym;
      });
    },
    [dictionary],
  );

  const [systemsLoading, setSystemsLoading] = useState(false);
  const [systems, setSystems] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setSystemsLoading(false);
      return;
    }

    setSystemsLoading(true);
    fetchScenarioResource('/systems')
      .then(({ data }) => {
        setSystems(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setSystemsLoading(false));
  }, [apiBase, backendDown, fetchScenarioResource, noteBackendDown]);

  const [mitigationsLoading, setMitigationsLoading] = useState(false);
  const [mitigations, setMitigations] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setMitigationsLoading(false);
      return;
    }

    setMitigationsLoading(true);
    fetchScenarioResource('/mitigations')
      .then(({ data }) => {
        setMitigations(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setMitigationsLoading(false));
  }, [apiBase, backendDown, fetchScenarioResource, noteBackendDown]);

  const [injectionsLoading, setInjectionsLoading] = useState(false);
  const [injections, setInjections] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setInjectionsLoading(false);
      return;
    }

    setInjectionsLoading(true);
    fetchScenarioResource('/injections')
      .then(({ data }) => {
        setInjections(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setInjectionsLoading(false));
  }, [apiBase, backendDown, fetchScenarioResource, noteBackendDown]);

  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responses, setResponses] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setResponsesLoading(false);
      return;
    }

    setResponsesLoading(true);
    fetchScenarioResource('/responses')
      .then(({ data }) => {
        setResponses(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setResponsesLoading(false));
  }, [apiBase, backendDown, fetchScenarioResource, noteBackendDown]);

  const [actionsLoading, setActionsLoading] = useState(false);
  const [actions, setActions] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setActionsLoading(false);
      return;
    }

    setActionsLoading(true);
    fetchScenarioResource('/actions')
      .then(({ data }) => {
        setActions(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setActionsLoading(false));
  }, [apiBase, backendDown, fetchScenarioResource, noteBackendDown]);

  const [curveballsLoading, setCurveballsLoading] = useState(false);
  const [curveballs, setCurveballs] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setCurveballsLoading(false);
      return;
    }

    setCurveballsLoading(true);
    fetchScenarioResource('/curveballs')
      .then(({ data }) => {
        setCurveballs(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setCurveballsLoading(false));
  }, [apiBase, backendDown, fetchScenarioResource, noteBackendDown]);

  return (
    <StaticDataContext.Provider
            value={{
        scenarioSlug,
        scenarioName,

        backendError,
        backendDown,

        locationsLoading,
        locations,
        getLocationNameByType,

        dictionaryLoading,
        dictionary,
        getTextWithSynonyms,

        systemsLoading,
        systems,

        mitigationsLoading,
        mitigations,

        injectionsLoading,
        injections,

        responsesLoading,
        responses,

        actionsLoading,
        actions,

        curveballsLoading,
        curveballs,

        loading:
          locationsLoading ||
          dictionaryLoading ||
          systemsLoading ||
          mitigationsLoading ||
          injectionsLoading ||
          responsesLoading ||
          curveballsLoading ||
          actionsLoading,
      }}
    >
      {children}
    </StaticDataContext.Provider>
  );
};
