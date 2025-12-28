import React, { useRef, useState } from "react";
import { useAuth } from "./AuthContext";

export default function Login({ toggleAuthMode }) {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError("");
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            // Navigate to dashboard or home here
        } catch (err) {
            setError("Failed to log in: " + err.message);
        }

        setLoading(false);
    }

    return (
        <div>
            <h2>Log In</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input type="email" ref={emailRef} required />
                <label>Password</label>
                <input type="password" ref={passwordRef} required />
                <button disabled={loading} type="submit">
                    Log In
                </button>
            </form>
            <div style={{ marginTop: '10px' }}>
                Need an account? <button onClick={toggleAuthMode}>Sign Up</button>
            </div>
        </div>
    );
}