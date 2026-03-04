import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { view } from '@risingstack/react-easy-state';

import { SocketEvents } from '../constants';
import { gameStore } from './GameStore';
import { useStaticData } from './StaticDataProvider';

const gameIdFromLocalStorage = localStorage.getItem('gameId');

const EnterGame = view(() => {
  const {
    loading,
    actions: { enterGame },
  } = gameStore;

  const { getTextWithSynonyms } = useStaticData();

  const [gameId, setGameId] = useState(gameIdFromLocalStorage || '');
  const [rememberGameId, setRememberGameId] = useState(
    !!gameIdFromLocalStorage,
  );

  const [adjustGameConfig, setAdjustGameConfig] = useState(false);
  const [initialBudget, setInitialBudget] = useState(6000);
  const [initialPollPercentage, setInitialPollPercentage] =
    useState(55.0);

  return (
    <Container fluid="md" className="mt-5 pt-5">
      <Row>
        <Col xs={12} md={{ span: 8, offset: 2 }}>
          <Row className="font-weight-bold">
            <Col>
              <h4>ENTER GAME</h4>
            </Col>
          </Row>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              enterGame({
                eventType: SocketEvents.CREATEGAME,
                gameId,
                rememberGameId,
                initialBudget,
                initialPollPercentage,
              });
            }}
          >
            <Form.Group controlId="GameId">
              <Form.Label>
                <h5 className="font-weight-normal mb-0">
                  Your game's name:
                </h5>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Game Name"
                onChange={(event) => setGameId(event.target.value)}
                value={gameId}
                autoComplete="off"
                style={{ fontSize: '1.125rem' }}
              />
            </Form.Group>
            <Form.Group controlId="RememberGameId">
              <Form.Check
                type="switch"
                label={<span>Remember me</span>}
                defaultChecked={rememberGameId}
                onChange={(e) => setRememberGameId(e.target.checked)}
                style={{ fontSize: '1.125rem' }}
              />
            </Form.Group>
            <Form.Group controlId="AdjustGameConfig">
              <Form.Check
                type="switch"
                label={<span>Adjust initial game options</span>}
                defaultChecked={adjustGameConfig}
                onChange={(e) =>
                  setAdjustGameConfig(e.target.checked)
                }
                style={{ fontSize: '1.125rem' }}
              />
            </Form.Group>
            {adjustGameConfig && (
              <div className="p-3 border border-primary">
                <Form.Group controlId="Budget">
                  <Form.Label column="lg">
                    <h5 className="font-weight-normal mb-0">
                      {getTextWithSynonyms('Budget:')}
                    </h5>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={getTextWithSynonyms('Budget')}
                    size="sm"
                    onChange={(event) => {
                      const newValue = !event.target.value.length
                        ? ''
                        : parseInt(event.target.value, 10);

                      setInitialBudget(newValue);
                    }}
                    value={initialBudget}
                    step={100}
                    min={0}
                    isInvalid={!initialBudget}
                    autoComplete="off"
                    style={{ fontSize: '1.125rem' }}
                  />
                </Form.Group>

                <Form.Group
                  controlId="PollPercentage"
                  className="mb-0"
                >
                  <Form.Label column="lg">
                    <h5 className="font-weight-normal mb-0">
                      {getTextWithSynonyms('Poll percentage:')}
                    </h5>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    size="sm"
                    placeholder={getTextWithSynonyms(
                      'Poll percentage',
                    )}
                    onChange={(event) => {
                      const newValue = !event.target.value.length
                        ? ''
                        : parseFloat(event.target.value);

                      setInitialPollPercentage(newValue);
                    }}
                    value={initialPollPercentage}
                    autoComplete="off"
                    step={0.5}
                    max={200}
                    min={0}
                    isInvalid={!initialPollPercentage}
                    style={{ fontSize: '1.125rem' }}
                  />
                </Form.Group>
              </div>
            )}
            <Row className="my-4">
              <Col>
                <Button
                  variant="outline-primary"
                  className="rounded-pill w-100"
                  type="button"
                  disabled={!gameId || loading}
                  onClick={() =>
                    enterGame({
                      eventType: SocketEvents.CREATEGAME,
                      gameId,
                      rememberGameId,
                      initialBudget,
                      initialPollPercentage,
                    })
                  }
                >
                  <h4 className="font-weight-normal mb-0">
                    Create Game
                  </h4>
                </Button>
              </Col>
            </Row>
            <Row className="my-4">
              <Col>
                <Button
                  variant="outline-primary"
                  className="rounded-pill w-100"
                  type="button"
                  disabled={!gameId || loading}
                  onClick={() =>
                    enterGame({
                      eventType: SocketEvents.JOINGAME,
                      gameId,
                      rememberGameId,
                    })
                  }
                >
                  <h4 className="font-weight-normal mb-0">
                    Join Game
                  </h4>
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Container>
  );
});

export default EnterGame;
