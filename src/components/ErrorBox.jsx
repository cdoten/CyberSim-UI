import React from 'react';
import { view } from '@risingstack/react-easy-state';
import { Alert } from 'react-bootstrap';

import { gameStore } from './GameStore';
import { useStaticData } from './StaticDataProvider';

const ErrorBox = view(() => {
  const { backendError } = useStaticData() || {};

  const showBackendError = Boolean(backendError);

  return (
    <div
      className="position-fixed"
      style={{
        bottom: '60px',
        left: '50%',
        transform: 'translate(-50%)',
        zIndex: 999,
        width: 'min(92vw, 720px)',
      }}
    >
      {/* Backend/Static data bootstrap error */}
      <Alert show={showBackendError} variant="warning">
        {backendError}
      </Alert>

      {/* Existing gameStore error */}
      <Alert
        show={gameStore.error.show}
        variant="danger"
        onClose={gameStore.closeError}
        dismissible
      >
        {gameStore.error.message}
      </Alert>
    </div>
  );
});

export default ErrorBox;
