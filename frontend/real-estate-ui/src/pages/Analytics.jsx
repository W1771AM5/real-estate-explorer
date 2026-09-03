import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { propiedades } from '../data/propiedades';
import './Analytics.css';

const Analytics = () => {
  // 1. Verificar si hay datos
  const hayDatos = propiedades.length > 0;

  // Procesar datos solo si hay propiedades
  const dataPorCiudad = hayDatos ? propiedades.reduce((acc, prop) => {
    const existing = acc.find(item => item.ciudad === prop.ciudad);
    if (existing) {
      existing.cantidad += 1;
    } else {
      acc.push({ ciudad: prop.ciudad, cantidad: 1 });
    }
    return acc;
  }, []) : [];

  const dataPrecioPromedio = hayDatos ? propiedades.reduce((acc, prop) => {
    const existing = acc.find(item => item.ciudad === prop.ciudad);
    if (existing) {
      existing.precioTotal += prop.precio;
      existing.cantidad += 1;
    } else {
      acc.push({ ciudad: prop.ciudad, precioTotal: prop.precio, cantidad: 1 });
    }
    return acc;
  }, []).map(item => ({
    ciudad: item.ciudad,
    precioPromedio: Math.round(item.precioTotal / item.cantidad)
  })) : [];

  // Colores para la gráfica circular (Pie)
  const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#e67e22'];

  return (
    <div className="analytics-container">
      <h1>📊 Análisis de Propiedades</h1>
      
      {!hayDatos && (
        <div className="no-data-message">
          <p>🛑 No hay propiedades registradas en el sistema.</p>
          <p>Agrega propiedades para ver las gráficas.</p>
        </div>
      )}

      {hayDatos && (
        <div className="charts-grid">
          {/* Gráfica 1: Barras */}
          <div className="chart-card">
            <h3>Propiedades por Ciudad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataPorCiudad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ciudad" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3498db" name="Número de propiedades" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica 2: Pastel / Circular */}
          <div className="chart-card">
            <h3>Precio Promedio por Ciudad</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={dataPrecioPromedio}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ ciudad, precioPromedio }) => `${ciudad}: $${precioPromedio.toLocaleString()}`}
                  outerRadius={130}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="precioPromedio"
                >
                  {dataPrecioPromedio.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Precio promedio']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;