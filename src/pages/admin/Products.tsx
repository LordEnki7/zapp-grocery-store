import React, { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import Button from '../../components/ui/Button';

function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock products data
  const products = [
    {
      id: '1',
      name: 'Jamaican Blue Mountain Coffee',
      price: 24.99,
      category: 'Grocery',
      stock: 45,
      createdAt: '2025-05-15'
    },
    {
      id: '2',
      name: 'Trinidad Scorpion Pepper Sauce',
      price: 12.99,
      category: 'Grocery',
      stock: 78,
      createdAt: '2025-05-20'
    },
    {
      id: '3',
      name: 'Ghanaian Jollof Rice Mix',
      price: 8.99,
      category: 'Grocery',
      stock: 120,
      createdAt: '2025-05-22'
    },
    {
      id: '4',
      name: 'Nigerian Suya Spice',
      price: 7.49,
      category: 'Grocery',
      stock: 85,
      createdAt: '2025-05-25'
    },
    {
      id: '5',
      name: 'Jamaican Beef Patties (Frozen)',
      price: 15.99,
      category: 'Frozen',
      stock: 30,
      createdAt: '2025-05-28'
    }
  ];

  // Filter products by search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            leftIcon={<FaUpload />}
            onClick={() => alert('CSV upload functionality would open here')}
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            leftIcon={<FaPlus />}
            onClick={() => alert('Add product form would open here')}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">ID: {product.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${product.stock > 50 ? 'text-green-800' : product.stock > 20 ? 'text-yellow-800' : 'text-red-800'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => alert(`Edit product ${product.id}`)}
                      aria-label="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => alert(`Delete product ${product.id}`)}
                      aria-label="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products; 