import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className={`bg-white rounded-2xl p-6 border border-gray-200 transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:border-transparent cursor-pointer`}> 
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-700 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && (
          <div className="flex items-center mt-2">
            <span className="text-gray-500 text-sm">{subtitle}</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-black/20`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default StatCard;