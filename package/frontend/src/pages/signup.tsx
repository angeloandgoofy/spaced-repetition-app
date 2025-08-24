import { useMutation } from "@apollo/client";
import { SIGNUP } from '../graphql/mutations';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SignupForm {
  email: string;
  password: string;
  name: string;
}

interface SignupData {
  signup: string;
}

function Signup() {
  const [signupMutation, { loading }] = useMutation<SignupData>(SIGNUP);
  const [formData, setFormData] = useState<SignupForm>({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      const { data } = await signupMutation({
        variables: {
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
        }
      });

      if (data?.signup) {
        localStorage.setItem("token", data.signup);
        setSuccess('Account created successfully! Redirecting...');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="form-container">
      <h2>SIGN UP</h2>
      
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

      {success && (
        <div className="success-message" style={{ 
          color: '#059669', 
          marginBottom: '1rem', 
          padding: '0.5rem', 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          borderRadius: '0.25rem' 
        }}>
          {success}
        </div>
      )}

      <form onSubmit={(e) => { 
        e.preventDefault(); 
        handleSignUp();
      }}>
        <fieldset disabled={loading}>
          <label>
            Name: 
            <input 
              type="text" 
              name="name" 
              placeholder="Enter your name" 
              value={formData.name}
              onChange={handleChange} 
              required
            />
          </label>
          <br />
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
              placeholder="Enter your password (min 6 chars)" 
              value={formData.password}
              onChange={handleChange} 
              minLength={6}
              required 
            />
          </label>
          <br />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </fieldset>
      </form>
    </div>
  );
}

export default Signup;