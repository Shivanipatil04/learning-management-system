import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import { setCredentials } from '../../../store/authSlice';

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    userType: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/signup', form);
      const { user, token } = response.data;

      dispatch(setCredentials({ user, token }));
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-row">
          <div className="brand-badge" aria-label="LearnHub logo">
            <span />
          </div>
          <div className="brand-wordmark">
            <span className="learn">Learn</span>
            <span className="hub">Hub</span>
          </div>
        </div>

        <h1 className="form-title">Create your account</h1>
        <p className="form-subtitle">Join LearnHub and start learning.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="userType">Account type</label>
            <select
              id="userType"
              name="userType"
              value={form.userType}
              onChange={handleChange}
              style={{
                border: '1px solid rgba(61, 61, 58, 0.15)',
                background: '#fffdfc',
                borderRadius: '10px',
                height: '46px',
                padding: '0 14px',
                color: '#3D3D3A',
              }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="coachingClassAdmin">Coaching Class Admin</option>
              <option value="superAdmin">Super Admin</option>
            </select>
          </div>

          {error ? <div className="error-message">{error}</div> : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="inline-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
