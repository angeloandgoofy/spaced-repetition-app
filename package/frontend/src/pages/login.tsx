import { useMutation } from "@apollo/client";
import { LOGIN } from '../graphql/mutations';
import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Dashboard from "./Dashboard";

function Login() {
    const [loginMutation] = useMutation(LOGIN);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const navigate = useNavigate(); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async () => {
        try {
        const { data } = await loginMutation({
            variables: {
            email: formData.email,
            password: formData.password,
            }
        });

        if (data?.login) {
            localStorage.setItem("token", data.login);
            navigate('/dashboard')
        }
        } catch (err) {
        alert('Unsuccessful login');
        console.error("ERROR:", err);
        }
    };

    return (
        <div className="login">
            <h2>Login</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <fieldset>
                    <label>Email: <input type="text" name="email" placeholder="email" onChange={handleChange} required /></label><br />
                    <label>Password: <input type="password" name="password" placeholder="password" onChange={handleChange} required /></label><br />
                    <button type="submit">Login</button>
                </fieldset>
            </form>
        </div>
    );
}

export default Login;