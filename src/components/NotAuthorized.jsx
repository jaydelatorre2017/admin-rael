import React from "react";
import { useNavigate } from "react-router-dom";

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <div
        className="w-full max-w-md h-72 bg-no-repeat bg-center bg-contain mb-8"
        style={{
          backgroundImage: 'url("https://i.imgur.com/qIufhof.png")',
        }}
      />
      <h1 className="text-[80px] sm:text-[100px] font-bold text-red-500 mb-2">403</h1>
      <p className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</p>
      <p className="text-base text-gray-500 mb-6">
        You do not have permission to view this page.
      </p>
      <button
        onClick={() => navigate("/contact")}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition"
      >
        Contact the Admin
      </button>
    </div>
  );
};

export default NotAuthorized;
