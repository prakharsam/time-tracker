// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/employees")
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error("Failed to load employees:", err));
  }, []);

  const handleInvite = async () => {
    if (!email.trim()) {
      alert("Please enter a valid email.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Invite sent successfully!");
        setEmail('');
      } else {
        alert("Failed to send invite.");
      }
    } catch (err) {
      console.error("Error sending invite:", err);
      alert("Error sending invite.");
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Employee Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Invite New Employee</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <input
            type="email"
            placeholder="Enter employee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1 }}
          />
          <button onClick={handleInvite}>Send Invite</button>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3>All Employees</h3>
        {employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <ul style={{ paddingLeft: 0 }}>
            {employees.map(emp => (
              <li
                key={emp.email}
                style={{
                  listStyle: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '10px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{emp.email}</strong><br />
                  Status: {emp.is_active ? '✅ Active' : '❌ Inactive'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
