import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
      <div
        className="w-full max-w-xl h-72 mb-8 bg-center bg-no-repeat bg-contain"
        style={{
          backgroundImage:
            'url("https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif")',
        }}
      />
      <h1 className="text-[80px] sm:text-[100px] font-bold text-gray-800">404</h1>
      <div className="text-2xl font-semibold text-gray-700 mt-2">Looks like you're lost</div>
      <div className="text-base text-gray-500 mt-1 mb-6">
        The page you are looking for is not available.
      </div>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
      >
        Go to Home
      </button>
    </div>
  );
};

export default NotFoundPage;
