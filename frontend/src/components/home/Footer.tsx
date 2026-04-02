
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/c59983aa-c865-4c97-85ff-9de45f1f7d68.png" 
                alt="JBVNL Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold">JBVNL</span>
            </div>
            <p className="text-gray-400">
              Empowering Jharkhand with reliable electricity services and modern digital solutions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => navigate('/bill-payment')} className="hover:text-white transition-colors">Bill Payment</button></li>
              <li><button onClick={() => navigate('/new-connection')} className="hover:text-white transition-colors">New Connection</button></li>
              <li><button onClick={() => navigate('/complaint-status')} className="hover:text-white transition-colors">Complaint Status</button></li>
              <li><button onClick={() => navigate('/tariff-rates')} className="hover:text-white transition-colors">Tariff Rates</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@jbvnl.gov.in</li>
              <li>Phone: 1800-345-6789</li>
              <li>Address: Ranchi, Jharkhand</li>
              <li>Hours: 24/7 Online Support</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Jharkhand Bijli Vitran Nigam Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
