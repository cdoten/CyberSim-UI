import React, { useState } from 'react';
import {
  Container,
  Nav,
  Form,
  InputGroup,
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import { Link, Routes, Route, useLocation } from 'react-router-dom';

import ScenarioStatus from './ScenarioStatus';
import GameManagement from './GameManagement';
import ScenarioLoad from './ScenarioLoad';
import ScenarioImport from '../ScenarioImport';

const TABS = [
  { key: 'status', label: 'Scenario Status', path: '/admin' },
  { key: 'games', label: 'Games', path: '/admin/games' },
  { key: 'load', label: 'Load Revision', path: '/admin/load' },
  { key: 'import', label: 'Airtable Import', path: '/admin/scenarios/import' },
];

export default function AdminApp() {
  const [password, setPassword] = useState('');
  const location = useLocation();

  const activeTab =
    TABS.slice()
      .reverse()
      .find((t) => location.pathname.startsWith(t.path))?.key || 'status';

  return (
    <Container fluid="md" className="mt-4 pt-4">
      <Row className="mb-3 align-items-center">
        <Col>
          <h3 className="mb-0">CyberSim Admin</h3>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" size="sm" className="rounded-pill">
            <Link to="/" className="button-link" style={{ textDecoration: 'none', color: 'inherit' }}>
              ← Back to Game
            </Link>
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12} md={6} lg={4}>
          <InputGroup size="sm">
            <InputGroup.Text>Admin password</InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />
          </InputGroup>
        </Col>
      </Row>

      <Nav variant="tabs" className="mb-3">
        {TABS.map((tab) => (
          <Nav.Item key={tab.key}>
            <Nav.Link
              as={Link}
              to={tab.path}
              active={activeTab === tab.key}
            >
              {tab.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <Routes>
        <Route index element={<ScenarioStatus password={password} />} />
        <Route path="games" element={<GameManagement password={password} />} />
        <Route path="load" element={<ScenarioLoad password={password} />} />
        <Route
          path="scenarios/import"
          element={<ScenarioImport password={password} />}
        />
      </Routes>
    </Container>
  );
}
