import React from 'react';

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased w-full relative">
      {children}
    </div>
  );
}
