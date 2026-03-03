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

const baseState = {
  password: '',
};

export default function Migrate() {
  const [state, setState] = useState(baseState);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState({});
  const [isLoading, setLoading] = useState(false);

  const onChange = useCallback(
    (ev) => {
      const { name, value } = ev.target;
      setState({ ...state, [name]: value });
      if (errors?.[name]) {
        setErrors({ ...errors, [errors.name]: undefined });
      }
    },
    [state, errors],
  );

  const onSubmit = useCallback(
    async (ev) => {
      try {
        setLoading(true);
        ev.preventDefault();
        ev.stopPropagation();
        await axios.post(
          `${process.env.REACT_APP_API_URL}/migrate`,
          state,
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
      <Button
        variant="outline-primary"
        className="rounded-pill navigation"
      >
        <Link to="/" className="button-link">
          <h4 className="font-weight-normal mb-0">Go Back</h4>
        </Link>
      </Button>
      <Row>
        <Col xs={12} md={{ span: 8, offset: 2 }}>
          <Row className="font-weight-bold">
            <Col>
              <h4>MIGRATE THE DATABASE</h4>
            </Col>
          </Row>
          <Form onSubmit={onSubmit}>
            <Form.Group>
              <Form.Label>
                <h5 className="font-weight-normal mb-0">
                  Master password:
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
                  disabled={!state.password || isLoading}
                >
                  <h4 className="font-weight-normal mb-0">
                    {isLoading
                      ? 'Ongoing migration ...'
                      : isSuccess
                      ? 'Migrate the Database Again'
                      : 'Migrate the Database'}
                  </h4>
                </Button>
              </Col>
            </Row>
          </Form>
          <div className="pt-3">
            {errors?.message && (
              <h3 className="text-danger text-center">
                {errors.message}
              </h3>
            )}
            {isSuccess && (
              <h3 className="text-success text-center">
                The database was sucessfully migrated!
              </h3>
            )}
            {Boolean(validationError.errors?.length) && (
              <>
                <h3 className="text-danger text-center">
                  {validationError.message ??
                    'An unexpected error occured! Please contact the developers to fix it.'}
                </h3>
                <div>
                  {validationError.errors.map((error, index) => (
                    <Alert
                      key={index}
                      variant="danger"
                      dismissible
                      onClose={() =>
                        setValidationError(
                          (previousValidationErrors) => ({
                            ...previousValidationErrors,
                            errors:
                              previousValidationErrors.errors.filter(
                                (err) => err !== error,
                              ),
                          }),
                        )
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
