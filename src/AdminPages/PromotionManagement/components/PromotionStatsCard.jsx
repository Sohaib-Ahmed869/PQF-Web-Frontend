import React from 'react';

const PromotionStatsCard = ({ title, value, icon: Icon, color, subtitle }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-gray-800 transition-colors">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};

export default PromotionStatsCard; 