import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { FaHome } from 'react-icons/fa';

function NotFound() {
  return (
    <div className="container-custom py-20">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button leftIcon={<FaHome />} size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound; 