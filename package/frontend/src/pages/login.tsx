import { useMutation } from "@apollo/client";
import { LOGIN } from '../graphql/mutations';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

interface LoginData {
  login: string;
}

function Login() {
  const [loginMutation, { loading }] = useMutation<LoginData>(LOGIN);
  const [formData, setFormData] = useState<LoginForm>({ 
    email: "", 
    password: "" 
  });
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogin = async () => {
    // Input validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const { data } = await loginMutation({
        variables: {
          email: formData.email.trim(),
          password: formData.password,
        }
      });

      if (data?.login) {
        localStorage.setItem("token", data.login);
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      {error && (
        <div className="error-message" style={{ 
          color: '#ef4444', 
          marginBottom: '1rem', 
          padding: '0.5rem', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '0.25rem' 
        }}>
          {error}
        </div>
      )}
      <form onSubmit={(e) => { 
        e.preventDefault(); 
        handleLogin(); 
      }}>
        <fieldset disabled={loading}>
          <label>
            Email: 
            <input 
              type="email" 
              name="email" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange} 
              required 
            />
          </label>
          <br />
          <label>
            Password: 
            <input 
              type="password" 
              name="password" 
              placeholder="Enter your password" 
              value={formData.password}
              onChange={handleChange} 
              required 
            />
          </label>
          <br />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </fieldset>
      </form>
    </div>
  );
}

export default Login;