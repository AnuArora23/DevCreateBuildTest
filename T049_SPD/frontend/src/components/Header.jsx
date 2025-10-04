import React from "react";

const Header = () => {
  return (
    <header className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">KrishiMitra AI 🌱</h1>
      <nav className="space-x-4">
        <a href="/" className="hover:underline font-medium">
          Home
        </a>
        <a href="/soilHealth" className="hover:underline font-medium">
          soilHealth
        </a>
        <a href="/marketPrice" className="hover:underline font-medium">
          marketPrice
        </a>
        <a href="/chatBot" className="hover:underline font-medium">
          chatBot
        </a>
        <a href="/weatherAlert" className="hover:underline font-medium">
          weatherAlert
        </a>
      </nav>
    </header>
  );
};

export default Header;
