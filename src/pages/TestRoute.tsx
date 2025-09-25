import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TestRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    
    throw new Error("This is a deliberately triggered error for testing!");
  }, []); 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="card w-96 bg-base-100 shadow-xl text-center p-6">
        <h2 className="text-2xl font-bold mb-4">Test Route</h2>
        <p>This page is designed to throw an error.</p>
        <button className="btn btn-primary mt-6" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default TestRoute;