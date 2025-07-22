import React, { useState, useEffect } from 'react';
import AdminSidebar from '../Sidebar';
import ProductList from './components/ProductList';
import EditProduct from './components/EditProduct';
import ViewProduct from './components/ViewProduct';
import DeleteProduct from './components/DeleteProduct';
import productService from '../../services/Admin/productService';
import { toast } from 'react-toastify';
import { 
  FiGrid, 
  FiPackage,
  FiTrendingUp,
  FiActivity,
  FiEye,
  FiTrash2,
  FiDollarSign,
  FiShoppingCart
} from 'react-icons/fi';
import { FaEuroSign, FaSnowflake } from 'react-icons/fa';


const ProductPage = () => {
  const [view, setView] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedPriceList, setSelectedPriceList] = useState(1); // NEW: price list state
  const [stats, setStats] = useState({
    total: 0,
    frozen: 0,
    inStock: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Recalculate stats when selectedPriceList changes
  useEffect(() => {
    if (products.length > 0) {
      calculateStats(products);
    }
    // eslint-disable-next-line
  }, [selectedPriceList]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      const productsData = response.data?.data?.products || response.data?.data || response.data || [];
      if (Array.isArray(productsData)) {
        setProducts(productsData);
        calculateStats(productsData);
      } else {
        setProducts([]);
        setStats({ total: 0, frozen: 0, inStock: 0, totalValue: 0 });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
      setStats({ total: 0, frozen: 0, inStock: 0, totalValue: 0 });
    } finally {
      setLoading(false);
    }
  };

  // NEW: Calculate stats using selectedPriceList
  const calculateStats = (productsData) => {
    const stats = {
      total: productsData.length,
      frozen: productsData.filter(product => product.frozen === 'tYES' || product.Frozen === 'tYES').length,
      inStock: productsData.filter(product => (product.stock ?? product.QuantityOnStock ?? 0) > 0).length,
      totalValue: productsData.reduce((sum, product) => {
        let price = 0;
        if (product.prices && Array.isArray(product.prices)) {
          const priceObj = product.prices.find(p => p.PriceList === selectedPriceList);
          price = priceObj ? priceObj.Price : 0;
        } else if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
          const priceObj = product.ItemPrices.find(p => p.PriceList === selectedPriceList);
          price = priceObj ? priceObj.Price : 0;
        }
        const stock = product.stock ?? product.QuantityOnStock ?? 0;
        return sum + (price * stock);
      }, 0)
    };
    setStats(stats);
  };

  const deleteProduct = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully! 🗑️');

              setProducts(prevProducts => {
          const updatedProducts = prevProducts.filter(product => product._id !== productId);
          calculateStats(updatedProducts);
          return updatedProducts;
        });

      // If the deleted product is currently being viewed, return to list
      if (selectedProduct && selectedProduct._id === productId) {
        setView('list');
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      // Refresh products to ensure sync with server
      fetchProducts();
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:border-transparent cursor-pointer`}> 
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <div className="flex items-center mt-2">
              <span className="text-gray-500 text-sm">{subtitle}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-black/20`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const NavigationButton = ({ onClick, icon: Icon, children, variant = 'primary' }) => {
    const baseClasses = "flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105";
    const variants = {
      primary: "bg-gradient-to-r from-[#a51d20] to-[#c62828] text-white hover:shadow-lg shadow-md",
      secondary: "bg-white text-[#a51d20] border border-[#f8d7da] hover:bg-[#fbeaea] hover:border-[#e57373] hover:text-[#c62828]"
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variants[variant]}`}
      >
        <Icon className="w-5 h-5 mr-2" />
        {children}
      </button>
    );
  };

  const handleBack = () => {
    setView('list');
    setSelectedProduct(null);
  };

  const handleProductSuccess = () => {
    setView('list');
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleDeleteRequest = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const renderContent = () => {
    switch (view) {
      case 'edit':
        return <EditProduct product={selectedProduct} onBack={handleBack} onSuccess={handleProductSuccess} />;
      case 'view':
        return <ViewProduct product={selectedProduct} onBack={handleBack} onEdit={(product) => { setSelectedProduct(product); setView('edit'); }} onDelete={deleteProduct} />;
      default:
        return (
          <ProductList
            products={products}
            loading={loading}
            onDelete={deleteProduct}
            onRefresh={fetchProducts}
            onView={(product) => {
              setSelectedProduct(product);
              setView('view');
            }}
            onEdit={(product) => {
              setSelectedProduct(product);
              setView('edit');
            }}
            selectedPriceList={selectedPriceList}
            setSelectedPriceList={setSelectedPriceList}
            onDeleteRequest={handleDeleteRequest}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-600/3 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <div className="p-8">
            {/* Header and Stats - Only show on main list view */}
            {view === 'list' && (
              <>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">
                      Product Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your product inventory and catalog</p>
                  </div>
                  <div className="flex space-x-4">
                    {/* Add Product functionality removed */}
                  </div>
                </div>
                
                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Products"
                    value={stats.total}
                    icon={FiPackage}
                    color="bg-gradient-to-r from-[#a51d20] to-[#c62828]"
                    subtitle="All products"
                  />
                  <StatCard
                    title="Frozen Products"
                    value={stats.frozen}
                    icon={FaSnowflake}
                    color="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]"
                    subtitle="Frozen items"
                  />
                  <StatCard
                    title="In Stock"
                    value={stats.inStock}
                    icon={FiShoppingCart}
                    color="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]"
                    subtitle="Available items"
                  />
                  <StatCard
                    title="Total Value"
                    value={`${stats.totalValue.toFixed(1)}`}
                    icon={FaEuroSign}
                    color="bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6]"
                    subtitle="Inventory value"
                  />
                </div>
              </>
            )}
            
            {/* Content */}
            <div className={view === 'list' ? "bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden" : ""}>
              {renderContent()}
            </div>
            
            {/* Delete Product Modal */}
            {showDeleteModal && productToDelete && (
              <DeleteProduct
                product={productToDelete}
                onClose={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                onDelete={(productId) => {
                  deleteProduct(productId);
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;