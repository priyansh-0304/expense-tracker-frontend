import { useState } from "react";
import api from "../api";

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/users/login", { email, password });

      localStorage.setItem("jwt", res.data);
      onSuccess(); // THIS WAS MISSING OR BROKEN
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow w-80">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <input
        className="w-full mb-2 border p-2 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full mb-2 border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="w-full bg-blue-600 text-white py-2 rounded">
        Login
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}