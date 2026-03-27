import qs from 'query-string';
import { store } from '@risingstack/react-easy-state';
import io from 'socket.io-client';
import { keyBy as _keyBy } from 'lodash';

import { SocketEvents } from '../constants';
import { getScenarioSlug } from '../util/scenario';

const socket = io(process.env.REACT_APP_API_URL, { transports: ['websocket'] });

export const gameStore = store({
  loading: false,

  // ERROR
  errorTimer: null,
  error: {
    message: '',
    show: false,
  },
  closeError: () => (gameStore.error.show = false),
  popError: (errorMessage) => {
    gameStore.error = { message: errorMessage, show: true };
    if (gameStore.errorTimer) {
      clearTimeout(gameStore.errorTimer);
    }
    gameStore.errorTimer = setTimeout(() => {
      gameStore.closeError();
    }, 4000);
  },

  // INFO
  infoTimer: null,
  info: {
    message: '',
    show: false,
  },
  closeInfo: () => (gameStore.info.show = false),
  popInfo: (infoMessage) => {
    gameStore.info = { message: infoMessage, show: true };
    if (gameStore.infoTimer) {
      clearTimeout(gameStore.infoTimer);
    }
    gameStore.infoTimer = setTimeout(() => {
      gameStore.closeInfo();
    }, 4000);
  },

  // HELPERS
  setGame: (game) => {
    Object.keys(game).forEach((key) => {
      if (key === 'systems') {
        gameStore.systems = game.systems.reduce(
          (acc, { system_id, state }) => ({
            ...acc,
            [system_id]: state,
          }),
          {},
        );
      } else if (key === 'mitigations') {
        gameStore.mitigations = game.mitigations.reduce(
          (acc, { mitigation_id, state }) => ({
            ...acc,
            [mitigation_id]: state,
          }),
          {},
        );
        gameStore.preparationMitigations = game.mitigations.reduce(
          (acc, { mitigation_id, preparation }) => ({
            ...acc,
            [mitigation_id]: preparation,
          }),
          {},
        );
      } else if (key === 'injections') {
        gameStore.injections = _keyBy(
          game.injections,
          'injection_id',
        );
      } else {
        gameStore[key] = game[key];
      }
    });
  },
  emitEvent: (event, params, successInfo) =>
    params
      ? socket.emit(event, params, ({ error }) => {
          if (error) {
            gameStore.popError(error);
          } else if (successInfo) {
            gameStore.popInfo(successInfo);
          }
        })
      : socket.emit(event, ({ error }) => {
          if (error) {
            gameStore.popError(error);
          } else if (successInfo) {
            gameStore.popInfo(successInfo);
          }
        }),

  // ACTIONS
  actions: {
    enterGame: ({
      eventType,
      gameId,
      rememberGameId,
      initialBudget = 6000,
      initialPollPercentage = 55,
    }) => {
      gameStore.loading = true;
      socket.emit(
        eventType,
        gameId,
        initialBudget,
        initialPollPercentage,
        // Pass the scenario slug so the backend loads the correct scenario content
        // for this deployment. Resolved from the hostname subdomain (e.g. cso.cybersim.app → 'cso').
        getScenarioSlug(),
        ({ error, game }) => {
          if (!error) {
            gameStore.setGame(game);
            if (rememberGameId) {
              localStorage.setItem('gameId', gameId);
            } else {
              localStorage.removeItem('gameId');
            }
          } else {
            gameStore.popError(error);
          }
          gameStore.loading = false;
        },
      );
    },
    resumeSimulation: () =>
      gameStore.emitEvent(SocketEvents.STARTSIMULATION),
    pauseSimulation: () =>
      gameStore.emitEvent(SocketEvents.PAUSESIMULATION),
    finishSimulation: () =>
      gameStore.emitEvent(SocketEvents.FINISHSIMULATION),
    toggleMitigation: (params, showInfo = false) =>
      gameStore.emitEvent(
        SocketEvents.CHANGEMITIGATION,
        params,
        ...(showInfo ? ['Item bought'] : []),
      ),
    performAction: (params) =>
      gameStore.emitEvent(
        SocketEvents.PERFORMACTION,
        params,
        'Action Performed',
      ),
    performCurveball: (params) =>
      gameStore.emitEvent(
        SocketEvents.PERFORMCURVEBALL,
        params,
        'Curveball Performed',
      ),
    restoreSystem: (params) =>
      gameStore.emitEvent(
        SocketEvents.RESTORESYSTEM,
        params,
        'System Restored',
      ),
    startSimulation: () =>
      gameStore.emitEvent(SocketEvents.STARTSIMULATION),
    deliverInjection: (params) =>
      gameStore.emitEvent(SocketEvents.DELIVERINJECTION, params),
    respondToInjection: (params) =>
      gameStore.emitEvent(
        SocketEvents.RESPONDTOINJECTION,
        params,
        'Response made',
      ),
    nonCorrectRespondToInjection: (params) =>
      gameStore.emitEvent(
        SocketEvents.NONCORRECTRESPONDTOINJECTION,
        params,
        'Response made',
      ),
  },
});

socket.on(SocketEvents.CONNECT, () => {
  gameStore.socketConnected = true;
});

// LISTEN TO GAME STATE UPDATES
socket.on(SocketEvents.GAMEUPDATED, (g) => gameStore.setGame(g));

// RECONNECT GAME ROOM IF CONNECTION LOST
socket.on(SocketEvents.RECONNECT, () => {
  if (gameStore.id) {
    socket.emit(
      SocketEvents.JOINGAME,
      gameStore.id,
      null, // initialBudget (only for CREATE GAME)
      null, // initialPollPercentage (only for CREATE GAME)
      ({ error, game: g }) => {
        if (!error) {
          gameStore.setGame(g);
        }
        gameStore.popError(error);
      },
    );
  }
});

// AUTO JOIN GAME FORM QUERY PARAMS
const { gameId: gameIdFromQuery, ...newParams } = qs.parse(
  window.location.search,
);
if (gameIdFromQuery) {
  gameStore.loading = true;
  socket.emit(
    SocketEvents.JOINGAME,
    gameIdFromQuery,
    null, // initialBudget (only for CREATE GAME)
    null, // initialPollPercentage (only for CREATE GAME)
    ({ error, game }) => {
      if (!error) {
        gameStore.setGame(game);
        window.history.replaceState(
          null,
          null,
          `?${qs.stringify(newParams)}`,
        );
        localStorage.setItem('gameId', gameIdFromQuery);
      } else {
        gameStore.loading = false;
      }
    },
  );
}
