import PromotionalBanners from './components/BannerPage';
import Category from './components/Category';
import FeatureProduct from './components/FeatureProduct';
import Footer from './components/Footer';
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="relative">
        {/* Content Sections */}
        <PromotionalBanners />
        <Category />
        <FeatureProduct />
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;