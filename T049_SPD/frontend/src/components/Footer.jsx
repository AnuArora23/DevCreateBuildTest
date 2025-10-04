import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4">KrishiMitra AI</h4>
            <p className="text-gray-400">
              Empowering farmers with artificial intelligence and modern
              technology.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/features" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="/download" className="hover:text-white">
                  Download
                </a>
              </li>
              <li>
                <a href="/support" className="hover:text-white">
                  Farmer Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>help@krishimitra.ai</li>
              <li>+91-1800-AGR-HELP</li>
              <li>Available 6AM - 10PM</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Partners</h4>
            <p className="text-gray-400">
              In collaboration with Agricultural Universities and Government
              Schemes
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          © {new Date().getFullYear()} KrishiMitra AI. All rights reserved. |
          Made with ❤️ for Indian Farmers
        </div>
      </div>
    </footer>
  );
};

export default Footer;
