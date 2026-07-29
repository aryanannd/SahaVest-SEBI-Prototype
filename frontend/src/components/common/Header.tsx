import React from 'react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <h1 className={`font-headline-md text-primary tracking-tight font-bold ${className}`}>
      SahaVest
    </h1>
  );
};
