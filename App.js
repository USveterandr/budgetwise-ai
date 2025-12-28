import React, { useState } from "react";
import { AuthProvider } from "./AuthContext";
import Login from "./Login";
import Signup from "./Signup";

function App() {
    const [isLogin, setIsLogin] = useState(true);

    function toggleAuthMode() {
        setIsLogin(!isLogin);
    }

    return (
        <AuthProvider>
            {isLogin ? (
                <Login toggleAuthMode={toggleAuthMode} />
            ) : (
                <Signup toggleAuthMode={toggleAuthMode} />
            )}
        </AuthProvider>
    );
}

export default App;