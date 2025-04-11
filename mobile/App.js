import React, { useState } from 'react';
import theme from './src/theme';

// Simple login form component
const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      onLogin({ username, role: username.includes('teacher') ? 'teacher' : 'parent' });
    } else {
      setError('Please enter both username and password');
    }
  };

  return (
    <div className="login-form" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: theme.colors.primary, textAlign: 'center' }}>School Connect Login</h2>
      
      {error && <div style={{ color: theme.colors.error, marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username</label>
          <input 
            id="username"
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: `1px solid ${theme.colors.placeholder}`
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input 
            id="password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: `1px solid ${theme.colors.placeholder}`
            }}
          />
        </div>
        
        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: theme.colors.primary, 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Login
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
          Hint: Use "teacher" or "parent" in your username to login as that role
        </p>
      </form>
    </div>
  );
};

// Parent dashboard component
const ParentDashboard = ({ user, onLogout }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: theme.colors.primary }}>Parent Dashboard</h1>
        <button 
          onClick={onLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#f5f5f5', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Logout
        </button>
      </header>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: theme.colors.primary, marginTop: 0 }}>Welcome, {user.username}</h2>
        <p>Access your student's information and communicate with teachers.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {['Student Progress', 'Messages', 'Calendar', 'School News', 'Resources'].map((item) => (
          <div 
            key={item} 
            style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{ color: theme.colors.primary, marginTop: 0 }}>{item}</h3>
            <p style={{ color: theme.colors.text }}>Access your {item.toLowerCase()} here.</p>
            <button 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: theme.colors.primary, 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              View {item}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Teacher dashboard component
const TeacherDashboard = ({ user, onLogout }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: theme.colors.primary }}>Teacher Dashboard</h1>
        <button 
          onClick={onLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#f5f5f5', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Logout
        </button>
      </header>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: theme.colors.primary, marginTop: 0 }}>Welcome, {user.username}</h2>
        <p>Manage your classes, students, and communication with parents.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {['Student Management', 'Attendance', 'Grades', 'Assignments', 'Announcements', 'Messages'].map((item) => (
          <div 
            key={item} 
            style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{ color: theme.colors.primary, marginTop: 0 }}>{item}</h3>
            <p style={{ color: theme.colors.text }}>Manage {item.toLowerCase()} here.</p>
            <button 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: theme.colors.primary, 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Manage {item}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App component
export default function App() {
  const [user, setUser] = useState(null);
  
  const handleLogin = (userData) => {
    setUser(userData);
  };
  
  const handleLogout = () => {
    setUser(null);
  };
  
  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : user.role === 'parent' ? (
        <ParentDashboard user={user} onLogout={handleLogout} />
      ) : (
        <TeacherDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
