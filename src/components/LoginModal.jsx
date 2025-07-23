import React, { useRef, useEffect } from 'react';

const LoginModal = ({ show, onClose, onLogin }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-4">Login Required</h2>
        <p className="mb-6 text-gray-700">You need to be logged in to add items to your cart or wishlist.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Login
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 text-gray-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 