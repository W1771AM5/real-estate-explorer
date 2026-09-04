import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { currencyFormatter } from '../utils/format';
import { getProperties } from '../api/properties';
import './Analytics.css';

const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];

const PAGE_SIZE = 50;

function Analytics() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await getProperties({ take: 1000, signal: controller.signal });
        setProperties(data);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const propertiesByCity = useMemo(() => {
    const counts = new Map();
    for (const p of properties) {
      const key = p.locality ?? 'Unknown';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  }, [properties]);

  const averagePriceByCity = useMemo(() => {
    const totals = new Map();
    for (const p of properties) {
      if (p.price == null) continue;
      const key = p.locality ?? 'Unknown';
      const entry = totals.get(key) ?? { total: 0, count: 0 };
      entry.total += p.price;
      entry.count += 1;
      totals.set(key, entry);
    }
    return [...totals.entries()]
      .map(([city, { total, count }]) => ({
        city,
        averagePrice: Math.round(total / count),
      }))
      .filter((row) => row.count > 0);
  }, [properties]);

  const visible = properties.slice(0, visibleCount);
  const hasMore = visible.length < properties.length;

  return (
    <div className="analytics-container">
      <h1>📊 Property Analytics</h1>

      {loading && (
        <div role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Loading properties…
        </div>
      )}

      {error && !loading && (
        <p role="alert" className="api-error">
          Could not load properties: {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Properties by Locality</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertiesByCity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3498db" name="Number of properties" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Average Price by Locality</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={averagePriceByCity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ city, averagePrice }) => `${city}: ${currencyFormatter.format(averagePrice)}`}
                    outerRadius={130}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="averagePrice"
                  >
                    {averagePriceByCity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [currencyFormatter.format(value), 'Average price']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card api-properties-card">
            <h3>Properties from the API</h3>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Broker</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Beds</th>
                    <th>Baths</th>
                    <th>Sqft</th>
                    <th>Address</th>
                    <th>Locality</th>
                    <th>Zip</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((property) => (
                    <tr key={property.id}>
                      <td>{property.id}</td>
                      <td className="broker-cell">{property.brokerTitle}</td>
                      <td>{property.propertyType ?? '—'}</td>
                      <td>{property.listingStatus ?? '—'}</td>
                      <td>{property.beds ?? '—'}</td>
                      <td>{property.baths ?? '—'}</td>
                      <td>{property.propertySqft?.toLocaleString() ?? '—'}</td>
                      <td>{property.address}</td>
                      <td>{property.locality ?? '—'}</td>
                      <td>{property.zip ?? '—'}</td>
                      <td>{currencyFormatter.format(property.price ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="load-more">
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                >
                  Load more ({properties.length - visible.length} remaining of {properties.length})
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
