import React, { useState, useEffect } from 'react';
import AdminSidebar from '../SuperAdminSidebar';
import ProductList from './components/ProductList';
import EditProduct from './components/EditProduct';
import ViewProduct from './components/ViewProduct';
import DeleteProduct from './components/DeleteProduct';
import superAdminProductService from '../../services/SuperAdmin/ProductService';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiGrid, 
  FiPackage,
  FiTrendingUp,
  FiActivity,
  FiEye,
  FiTrash2,
  FiDollarSign,
  FiShoppingCart,
  FiEyeOff,
  FiRefreshCw,
  FiBarChart2
} from 'react-icons/fi';
import { FaEuroSign,FaSnowflake} from 'react-icons/fa';


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
  const [apiStats, setApiStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchProductStats();
  }, []);

  // Recalculate stats when selectedPriceList changes
  useEffect(() => {
    if (products.length > 0) {
      calculateStats(products);
    }
    // eslint-disable-next-line
  }, [selectedPriceList]);

  // Refactored: fetchProducts to match CategoryPage response handling
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await superAdminProductService.getAllProducts();
      let productsData = [];

      if (Array.isArray(response.data?.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data?.data?.products)) {
        productsData = response.data.data.products;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      } else {
        productsData = [];
      }

      setProducts(productsData);
      calculateStats(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
      setStats({ total: 0, frozen: 0, inStock: 0, totalValue: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStats = async () => {
    try {
      const res = await superAdminProductService.getProductStats();
      setApiStats(res.data?.data || null);
    } catch (error) {
      setApiStats(null);
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
      await superAdminProductService.deleteProduct(productId);
      toast.success('Product deleted successfully! 🗑️');

      setProducts(prevProducts => {
        const updatedProducts = prevProducts.filter(product => product._id !== productId);

        // Update stats
        const stats = {
          total: updatedProducts.length,
          frozen: updatedProducts.filter(product => product.Frozen === 'tYES').length,
          inStock: updatedProducts.filter(product => (product.QuantityOnStock || 0) > 0).length,
          totalValue: updatedProducts.reduce((sum, product) => {
            const price = product.ItemPrices && product.ItemPrices[0] ? product.ItemPrices[0].Price : 0;
            const stock = product.QuantityOnStock || 0;
            return sum + (price * stock);
          }, 0)
        };
        setStats(stats);

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
            onDeleteRequest={product => {
              setProductToDelete(product);
              setShowDeleteModal(true);
            }}
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
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-gray-900">
                      Product Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your product inventory and catalog</p>
                  </div>
                  <div className="flex space-x-4">
                    <NavigationButton
                      onClick={() => setShowStats((prev) => !prev)}
                      icon={showStats ? FiEye : FiEyeOff}
                      variant="secondary"
                    >
                      {showStats ? 'Hide Statistics' : 'Show Statistics'}
                    </NavigationButton>
                    <NavigationButton
                      onClick={fetchProductStats}
                      icon={FiRefreshCw}
                      variant="secondary"
                    >
                      Refresh Stats
                    </NavigationButton>
                  </div>
                </div>
                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Products"
                    value={apiStats?.totalProducts ?? stats.total}
                    icon={FiPackage}
                    color="bg-gradient-to-r from-[#a51d20] to-[#c62828]"
                    subtitle={`Stores: ${apiStats?.totalStoresWithProducts ?? '-'}`}
                  />
                  <StatCard
                    title="Frozen Products"
                    value={apiStats?.frozenProducts ?? stats.frozen}
                    icon={FaSnowflake}
                    color="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]"
                    subtitle="Frozen items"
                  />
                  <StatCard
                    title="Available Products"
                    value={apiStats?.availableProducts ?? stats.inStock}
                    icon={FiShoppingCart}
                    color="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]"
                    subtitle="Available items"
                  />
                  <StatCard
                    title="Total Stock Value"
                    value={apiStats?.totalStockValue !== undefined ? apiStats.totalStockValue : stats.totalValue.toFixed(1)}
                    icon={FaEuroSign}
                    color="bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6]"
                    subtitle="Inventory value"
                  />
                </div>
                {/* Store Statistics Table */}
                {showStats && apiStats && (
                  <div className="mb-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden mb-8">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FiBarChart2 className="w-5 h-5 mr-2 text-gray-600" />
                          Store Statistics
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50/50">
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Store Name</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Products</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Available</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Out of Stock</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Frozen</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Stock Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(apiStats?.storeStatistics || []).map((store) => (
                              <tr key={store._id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                <td className="px-6 py-4">{store.storeName}</td>
                                <td className="px-6 py-4">{store.totalProducts}</td>
                                <td className="px-6 py-4">{store.availableProducts}</td>
                                <td className="px-6 py-4">{store.outOfStockProducts}</td>
                                <td className="px-6 py-4">{store.frozenProducts}</td>
                                <td className="px-6 py-4">{store.totalStockValue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {/* Top Categories Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FiTrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                          Top Categories
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50/50">
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category ID</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Count</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Stock</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Available Products</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(apiStats?.topCategories || []).map((cat) => (
                              <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                <td className="px-6 py-4">{cat._id}</td>
                                <td className="px-6 py-4">{cat.productCount}</td>
                                <td className="px-6 py-4">{cat.totalStock}</td>
                                <td className="px-6 py-4">{cat.availableProducts}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
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
                onDelete={async (productId) => {
                  await deleteProduct(productId);
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