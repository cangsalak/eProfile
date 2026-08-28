'use client';

import React from 'react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="px-6 py-2 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 font-bold"
    >
      <i className="fa-solid fa-print mr-2"></i> พิมพ์ใบลา
    </button>
  );
}
