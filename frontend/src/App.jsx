import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function App() {
  const [telemetry, setTelemetry] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://transformer-api-oj68.onrender.com');
        const data = await response.json();
        setTelemetry(data.reverse());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const strugglingTransformer = telemetry.filter(t => t.transformer_id === "TX-ADDIS-002");
  
  // Predictive Alert Logic: Grab the most recent reading to check current health
  const latestData = strugglingTransformer.length > 0 ? strugglingTransformer[strugglingTransformer.length - 1] : null;
  const isCritical = latestData && latestData.oil_temp_c >= 90;

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ color: '#111827', marginBottom: '8px' }}>Distribution Transformer Digital Twin</h1>
      <p style={{ color: '#4b5563', marginBottom: '32px' }}>Live predictive telemetry for grid node TX-ADDIS-002 (Severe Phase Imbalance)</p>

      {/* Predictive Alert Banner */}
      {isCritical && (
        <div style={{ backgroundColor: '#fee2e2', borderLeft: '6px solid #dc2626', padding: '20px', marginBottom: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#991b1b', margin: '0 0 8px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ CRITICAL WARNING: Thermal Runaway Predicted
          </h2>
          <p style={{ color: '#7f1d1d', margin: 0, fontSize: '15px' }}>
            Phase A is drawing <strong>{latestData.phase_a_amps}A</strong> (sustained overload). 
            Internal oil temperature has reached <strong>{latestData.oil_temp_c}°C</strong>. 
            <br/><br/>
            <strong>Action Required:</strong> Dispatch maintenance team to balance load. Estimated time to insulation paper failure: &lt; 2 hours.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Phase Current Chart */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#374151' }}>Phase Load (Amps)</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strugglingTransformer}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={[0, 700]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="phase_a_amps" stroke="#dc2626" name="Phase A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="phase_b_amps" stroke="#2563eb" name="Phase B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="phase_c_amps" stroke="#10b981" name="Phase C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Oil Temperature Chart */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#374151' }}>Internal Oil Temperature (°C)</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strugglingTransformer}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={[20, 100]} />
                {/* Visual Danger Zone Line */}
                <Line type="monotone" dataKey={() => 90} stroke="#dc2626" strokeDasharray="5 5" name="Failure Threshold (90°C)" strokeWidth={1} dot={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="oil_temp_c" stroke="#f59e0b" name="Oil Temp (°C)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}