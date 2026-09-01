import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { properties } from '../data/properties';
import { currencyFormatter } from '../utils/format';
import { getProperties } from '../api/properties';
import './Analytics.css';

const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#e67e22'];

const Analytics = () => {
  const propertiesByCity = properties.reduce((acc, property) => {
    const existing = acc.find((item) => item.city === property.city);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ city: property.city, count: 1 });
    }
    return acc;
  }, []);

  const averagePriceByCity = properties.reduce((acc, property) => {
    const existing = acc.find((item) => item.city === property.city);
    if (existing) {
      existing.totalPrice += property.price;
      existing.count += 1;
    } else {
      acc.push({ city: property.city, totalPrice: property.price, count: 1 });
    }
    return acc;
  }, []).map((item) => ({
    city: item.city,
    averagePrice: Math.round(item.totalPrice / item.count)
  }));

  const [apiProperties, setApiProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProperties() {
      try {
        const data = await getProperties({ signal: controller.signal });
        setApiProperties(data);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProperties();

    return () => controller.abort();
  }, []);

  return (
    <div className="analytics-container">
      <h1>📊 Property Analytics</h1>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Properties by City</h3>
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
          <h3>Average Price by City</h3>
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

        {!loading && !error && apiProperties.length === 0 && (
          <p>No properties available.</p>
        )}

        {!loading && !error && apiProperties.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>City</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {apiProperties.map((property) => (
                  <tr key={property.id}>
                    <td>{property.id}</td>
                    <td>{property.city}</td>
                    <td>{currencyFormatter.format(property.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;