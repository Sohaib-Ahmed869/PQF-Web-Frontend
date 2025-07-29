import React from "react";

const ConfirmModal = ({ open, onConfirm, onCancel, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative animate-fade-in">
        <h2 className="text-xl font-bold text-red-600 mb-2 text-center">{title}</h2>
        <div className="text-black/80 mb-6 text-center">{message}</div>
        <div className="flex gap-4 justify-center">
          <button
            className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition-colors"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className="px-5 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold shadow transition-colors"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 