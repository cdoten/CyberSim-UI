import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Button,
  Badge,
  Alert,
  Spinner,
  Modal,
} from 'react-bootstrap';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export default function ScenarioStatus({ password }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // slug to confirm
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchScenarios = useCallback(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`${API}/admin/scenarios`)
      .then(({ data }) => setScenarios(data.scenarios || []))
      .catch(() => setError('Failed to load scenarios.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await axios.delete(`${API}/admin/scenarios/${deleteTarget}`, {
        headers: { 'x-admin-password': password },
      });
      setDeleteTarget(null);
      fetchScenarios();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Delete failed. Check the admin password and try again.';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}{' '}
        <Button variant="link" onClick={fetchScenarios}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Loaded Scenarios</h5>
        <Button variant="outline-secondary" size="sm" onClick={fetchScenarios}>
          Refresh
        </Button>
      </div>

      {scenarios.length === 0 ? (
        <Alert variant="info">No scenarios loaded. Use the Load Revision tab to load one.</Alert>
      ) : (
        <Table bordered hover responsive size="sm">
          <thead className="table-light">
            <tr>
              <th>Slug</th>
              <th>Name</th>
              <th>Revision</th>
              <th>Systems</th>
              <th>Injections</th>
              <th>Mitigations</th>
              <th>Roles</th>
              <th>Actions</th>
              <th>Active Games</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.slug}>
                <td>
                  <code>{s.slug}</code>
                </td>
                <td>{s.name}</td>
                <td>
                  {s.revision ? (
                    <code>{s.revision}</code>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>{s.counts.systems}</td>
                <td>{s.counts.injections}</td>
                <td>{s.counts.mitigations}</td>
                <td>{s.counts.roles}</td>
                <td>{s.counts.actions}</td>
                <td>
                  {s.activeGames > 0 ? (
                    <Badge variant="warning">{s.activeGames}</Badge>
                  ) : (
                    <span className="text-muted">0</span>
                  )}
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    disabled={!password}
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteTarget(s.slug);
                    }}
                    title={!password ? 'Enter admin password first' : 'Remove from DB'}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Delete confirmation modal */}
      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Remove scenario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Remove <strong>{deleteTarget}</strong> and all its static content
            from the database?
          </p>
          <p className="text-muted mb-0" style={{ fontSize: '0.9em' }}>
            Disk files are not deleted — the revision can be reloaded at any
            time from the Load Revision tab.
          </p>
          {deleteError && (
            <Alert variant="danger" className="mt-3 mb-0">
              {deleteError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteTarget(null)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Removing…' : 'Remove'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
