import React, { useEffect, useState, useCallback } from 'react';
import {
  Form,
  Button,
  Alert,
  Spinner,
  Table,
  Row,
  Col,
} from 'react-bootstrap';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export default function ScenarioLoad({ password }) {
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok, counts, scenarioSlug, scenarioRevision }
  const [error, setError] = useState(null);

  const fetchTags = useCallback(() => {
    setTagsLoading(true);
    axios
      .get(`${API}/admin/scenarios/available`)
      .then(({ data }) => {
        const available = data.tags || [];
        setTags(available);
        if (available.length === 1) setSelectedTag(available[0]);
      })
      .catch(() => setTags([]))
      .finally(() => setTagsLoading(false));
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleLoad = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data } = await axios.post(
        `${API}/admin/scenarios/load`,
        { tag: selectedTag },
        { headers: { 'x-admin-password': password } },
      );
      setResult(data);
    } catch (err) {
      const body = err?.response?.data;
      setError(body?.message || 'Load failed. Check the admin password and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group tags by scenario slug for display
  const tagsBySlug = tags.reduce((acc, tag) => {
    const slug = tag.split('@')[0];
    if (!acc[slug]) acc[slug] = [];
    acc[slug].push(tag);
    return acc;
  }, {});

  return (
    <>
      <h5 className="mb-3">Load Scenario Revision from Disk</h5>

      {tagsLoading ? (
        <Spinner animation="border" size="sm" />
      ) : tags.length === 0 ? (
        <Alert variant="warning">
          No scenario revisions found on disk under{' '}
          <code>seeds/scenarios/</code>.
        </Alert>
      ) : (
        <Form onSubmit={handleLoad}>
          <Row className="align-items-end mb-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Revision tag</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedTag}
                  onChange={(e) => {
                    setSelectedTag(e.target.value);
                    setResult(null);
                    setError(null);
                  }}
                  style={{ fontSize: '1rem' }}
                >
                  {tags.length > 1 && (
                    <option value="">— select a revision —</option>
                  )}
                  {Object.entries(tagsBySlug).map(([slug, slugTags]) => (
                    <optgroup key={slug} label={slug}>
                      {slugTags.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag.split('@')[1]}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs="auto">
              <Button
                type="submit"
                variant="primary"
                className="rounded-pill"
                disabled={!selectedTag || !password || loading}
                title={!password ? 'Enter admin password first' : undefined}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Loading…
                  </>
                ) : (
                  'Load Revision'
                )}
              </Button>
            </Col>
          </Row>

          {!password && (
            <Alert variant="info" className="py-2">
              Enter admin password above to load a revision.
            </Alert>
          )}
        </Form>
      )}

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {result?.ok && (
        <Alert variant="success" className="mt-3">
          <Alert.Heading>
            Loaded <code>{result.scenarioSlug}@{result.scenarioRevision}</code>{' '}
            successfully
          </Alert.Heading>
          <Table size="sm" className="mb-0 mt-2" style={{ width: 'auto' }}>
            <tbody>
              {Object.entries(result.counts || {}).map(([key, count]) => (
                <tr key={key}>
                  <td className="pe-4 text-muted">{key}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Alert>
      )}
    </>
  );
}
