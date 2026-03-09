import React, { useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { keyBy as _keyBy } from 'lodash';

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

  // Optional resources should not block app startup
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locations, setLocations] = useState({});
  const [locationsError, setLocationsError] = useState('');

  useEffect(() => {
    if (!apiBase || backendDown) {
      setLocationsLoading(false);
      return;
    }

    setLocationsLoading(true);
    setLocationsError('');

    axios
      .get(`${apiBase}/locations`)
      .then(({ data }) => {
        setLocations(_keyBy(data || [], 'id'));
      })
      .catch((err) => {
        setLocationsError('Failed to load locations');
        console.error(err);
      })
      .finally(() => setLocationsLoading(false));
  }, [apiBase, backendDown]);

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
  const [dictionaryError, setDictionaryError] = useState('');

  useEffect(() => {
    if (!apiBase || backendDown) {
      setDictionaryLoading(false);
      return;
    }

    setDictionaryLoading(true);
    setDictionaryError('');

    axios
      .get(`${apiBase}/dictionary`)
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
      .catch((err) => {
        setDictionaryError('Failed to load dictionary');
        console.error(err);
      })
      .finally(() => setDictionaryLoading(false));
  }, [apiBase, backendDown]);

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

  // Required resources
  const [systemsLoading, setSystemsLoading] = useState(false);
  const [systems, setSystems] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setSystemsLoading(false);
      return;
    }

    setSystemsLoading(true);
    axios
      .get(`${apiBase}/systems`)
      .then(({ data }) => {
        setSystems(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setSystemsLoading(false));
  }, [apiBase, backendDown, noteBackendDown]);

  const [mitigationsLoading, setMitigationsLoading] = useState(false);
  const [mitigations, setMitigations] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setMitigationsLoading(false);
      return;
    }

    setMitigationsLoading(true);
    axios
      .get(`${apiBase}/mitigations`)
      .then(({ data }) => {
        setMitigations(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setMitigationsLoading(false));
  }, [apiBase, backendDown, noteBackendDown]);

  const [injectionsLoading, setInjectionsLoading] = useState(false);
  const [injections, setInjections] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setInjectionsLoading(false);
      return;
    }

    setInjectionsLoading(true);
    axios
      .get(`${apiBase}/injections`)
      .then(({ data }) => {
        setInjections(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setInjectionsLoading(false));
  }, [apiBase, backendDown, noteBackendDown]);

  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responses, setResponses] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setResponsesLoading(false);
      return;
    }

    setResponsesLoading(true);
    axios
      .get(`${apiBase}/responses`)
      .then(({ data }) => {
        setResponses(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setResponsesLoading(false));
  }, [apiBase, backendDown, noteBackendDown]);

  const [actionsLoading, setActionsLoading] = useState(false);
  const [actions, setActions] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setActionsLoading(false);
      return;
    }

    setActionsLoading(true);
    axios
      .get(`${apiBase}/actions`)
      .then(({ data }) => {
        setActions(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setActionsLoading(false));
  }, [apiBase, backendDown, noteBackendDown]);

  const [curveballsLoading, setCurveballsLoading] = useState(false);
  const [curveballs, setCurveballs] = useState({});
  useEffect(() => {
    if (!apiBase || backendDown) {
      setCurveballsLoading(false);
      return;
    }

    setCurveballsLoading(true);
    axios
      .get(`${apiBase}/curveballs`)
      .then(({ data }) => {
        setCurveballs(_keyBy(data || [], 'id'));
      })
      .catch(noteBackendDown)
      .finally(() => setCurveballsLoading(false));
  }, [apiBase, backendDown, noteBackendDown]);

  console.log('Static data status', {
    backendDown,
    systemsLoading,
    mitigationsLoading,
    injectionsLoading,
    responsesLoading,
    actionsLoading,
    curveballsLoading,
    systemsCount: Object.keys(systems).length,
    mitigationsCount: Object.keys(mitigations).length,
    injectionsCount: Object.keys(injections).length,
    responsesCount: Object.keys(responses).length,
    actionsCount: Object.keys(actions).length,
    curveballsCount: Object.keys(curveballs).length,
    loading:
      systemsLoading ||
      mitigationsLoading ||
      injectionsLoading ||
      responsesLoading ||
      curveballsLoading ||
      actionsLoading,
  });

  return (
    <StaticDataContext.Provider
      value={{
        backendError,
        backendDown,

        locationsLoading,
        locations,
        locationsError,
        getLocationNameByType,

        dictionaryLoading,
        dictionary,
        dictionaryError,
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
