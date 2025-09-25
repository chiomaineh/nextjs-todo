"use client";

import { useAuth } from "../context/AuthContext";
import { FaGoogle } from "react-icons/fa";

export default function Login() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="log-in min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="login-card card w-96 bg-base-100 shadow-xl">
        <div className="login-body card-body text-center">
          <h2 className="login-title card-title text-2xl font-bold mb-6 justify-center">
            Welcome to Todo App
          </h2>
          <p className="login-subtitle text-gray-600 mb-6">
            Sign in to manage your todos
          </p>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="login-btn btn btn-primary btn-block"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <FaGoogle className="google-icon mr-2" />
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
