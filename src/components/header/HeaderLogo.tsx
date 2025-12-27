
import React from 'react';

const HeaderLogo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 shadow-lg transform transition-transform hover:scale-110 hover:shadow-xl">
        <div className="text-white font-bold text-lg tracking-tight">
          X
        </div>
      </div>

      <div className="hidden sm:block">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
          Markdown Studio X
        </h1>
        <p className="text-xs text-muted-foreground font-medium">
          Free Markdown Editor
        </p>
      </div>
    </div>
  );
};

export default HeaderLogo;
