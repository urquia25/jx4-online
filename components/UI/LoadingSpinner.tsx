
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <div className="w-16 h-16 border-4 border-accent border-t-primary rounded-full animate-spin"></div>
    <p className="text-primary font-semibold animate-pulse">Cargando catálogo JX4...</p>
  </div>
);

export default LoadingSpinner;
