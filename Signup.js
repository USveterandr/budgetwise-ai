import React, { useRef, useState } from "react";
import { useAuth } from "./AuthContext";

export default function Signup({ toggleAuthMode }) {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError("Passwords do not match");
        }

        try {
            setError("");
            setLoading(true);
            await signup(emailRef.current.value, passwordRef.current.value);
            // Navigate to dashboard or home here
        } catch (err) {
            setError("Failed to create an account: " + err.message);
        }

        setLoading(false);
    }

    return (
        <div>
            <h2>Sign Up</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input type="email" ref={emailRef} required />
                <label>Password</label>
                <input type="password" ref={passwordRef} required />
                <label>Password Confirmation</label>
                <input type="password" ref={passwordConfirmRef} required />
                <button disabled={loading} type="submit">Sign Up</button>
            </form>
            <div style={{ marginTop: '10px' }}>
                Already have an account? <button onClick={toggleAuthMode}>Log In</button>
            </div>
        </div>
    );
}