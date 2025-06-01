import { useMutation } from "@apollo/client";
import { SIGNUP } from '../graphql/mutations';
import { useState } from "react";

function Signup() {
  const [signupMutation] = useMutation(SIGNUP);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async () => {
    try {
      const { data } = await signupMutation({
        variables: {
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }
      });

      if (data?.signup) {
        localStorage.setItem("token", data.signup);
        alert('Successful sign up');
      }
    } catch (err) {
      alert('Unsuccessful sign up');
      console.error("ERROR:", err);
    }
  };

  return (
    <div className="form-container">
      <h2>SIGN UP</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleSignUp();}}>
        <fieldset>
          <label>Name: <input type="text" name="name" placeholder="username" onChange={handleChange} /></label><br />
          <label>Email: <input type="text" name="email" placeholder="email" onChange={handleChange} required /></label><br />
          <label>Password: <input type="password" name="password" placeholder="password" onChange={handleChange} required /></label><br />
          <button type="submit">Sign Up</button>
        </fieldset>
      </form>
    </div>
  );
}

export default Signup;