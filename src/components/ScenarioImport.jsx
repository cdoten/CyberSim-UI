/**
 * Admin form for importing a scenario from Airtable.
 *
 * Important notes:
 * - Submits to the backend admin import endpoint.
 * - Requires both scenarioSlug and the scenario import password.
 * - This is an admin workflow component, not part of normal game play.
 */

import React, { useState, useCallback } from 'react';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getScenarioSlug } from '../util/scenario';

const baseState = {
  scenarioSlug: getScenarioSlug(),
  password: '',
};

export default function ScenarioImport() {
  const [state, setState] = useState(baseState);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState({});
  const [isLoading, setLoading] = useState(false);

  const onChange = useCallback(
    (ev) => {
      setIsSuccess(false);
      const { name, value } = ev.target;
      setState((previousState) => ({
        ...previousState,
        [name]: value,
      }));

      if (errors?.[name]) {
        setErrors((previousErrors) => ({
          ...previousErrors,
          [name]: undefined,
        }));
      }
    },
    [errors],
  );

  const onSubmit = useCallback(
    async (ev) => {
      try {
        setLoading(true);
        ev.preventDefault();
        ev.stopPropagation();

        await axios.post(
          `${process.env.REACT_APP_API_URL}/admin/scenarios/import`,
          {
            scenarioSlug: state.scenarioSlug.trim(),
            password: state.password,
          },
        );

        setValidationError({});
        setErrors({});
        setIsSuccess(true);
      } catch (err) {
        const error = err?.response?.data;

        if (error?.validation) {
          setValidationError(error);
          setErrors({});
        } else {
          if (error) {
            setErrors(error);
          }
          setValidationError({});
        }

        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    },
    [state],
  );

  return (
    <Container fluid="md" className="mt-5 pt-5">
      <Button variant="outline-primary" className="rounded-pill navigation">
        <Link to="/" className="button-link">
          <h4 className="font-weight-normal mb-0">Go Back</h4>
        </Link>
      </Button>

      <Row>
        <Col xs={12} md={{ span: 8, offset: 2 }}>
          <Row className="font-weight-bold">
            <Col>
              <h4>Import Scenario from Airtable</h4>
            </Col>
          </Row>

          <Form onSubmit={onSubmit}>
            <Form.Group>
              <Form.Label>
                <h5 className="font-weight-normal mb-0">Scenario slug:</h5>
              </Form.Label>
              <Form.Control
                type="text"
                name="scenarioSlug"
                value={state.scenarioSlug}
                onChange={onChange}
                autoComplete="off"
                style={{ fontSize: '1.125rem' }}
                isInvalid={errors?.scenarioSlug}
                placeholder="e.g. cso"
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {errors?.scenarioSlug}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>
                <h5 className="font-weight-normal mb-0">
                  Scenario import password:
                </h5>
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={state.password}
                onChange={onChange}
                autoComplete="off"
                style={{ fontSize: '1.125rem' }}
                isInvalid={errors?.password}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {errors?.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="my-4">
              <Col>
                <Button
                  variant="outline-primary"
                  className="rounded-pill w-100"
                  type="submit"
                  disabled={
                    !state.scenarioSlug.trim() || !state.password || isLoading
                  }
                >
                  <h4 className="font-weight-normal mb-0">
                    {isLoading
                      ? 'Import in process...'
                      : isSuccess
                      ? 'Import the Scenario Again'
                      : 'Import Scenario'}
                  </h4>
                </Button>
              </Col>
            </Row>
          </Form>

          <div className="pt-3">
            {errors?.message && (
              <h3 className="text-danger text-center">{errors.message}</h3>
            )}

            {isSuccess && (
              <h3 className="text-success text-center">
                Scenario successfully imported from Airtable
              </h3>
            )}

            {Boolean(validationError.errors?.length) && (
              <>
                <h3 className="text-danger text-center">
                  {validationError.message ??
                    'Unexpected error. Please contact system administrators with this information.'}
                </h3>
                <div>
                  {validationError.errors.map((error, index) => (
                    <Alert
                      key={index}
                      variant="danger"
                      dismissible
                      onClose={() =>
                        setValidationError((previousValidationErrors) => ({
                          ...previousValidationErrors,
                          errors: previousValidationErrors.errors.filter(
                            (err) => err !== error,
                          ),
                        }))
                      }
                    >
                      <Alert.Heading>{error.message}</Alert.Heading>
                      {error.value && (
                        <div className="pre">
                          {JSON.stringify(error.value, null, 2)}
                        </div>
                      )}
                    </Alert>
                  ))}
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
