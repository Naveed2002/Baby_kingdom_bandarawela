import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductCard = ({ product, onAddToCart, viewMode = 'grid' }) => {
  if (!product) return null;

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  if (viewMode === 'list') {
    return (
      <div className="card group overflow-hidden flex flex-row">
        <div className="relative overflow-hidden rounded-l-2xl w-48 flex-shrink-0">
          <img
            src={`http://localhost:5001${product.mainImage}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
            }}
          />
          {discountPercent && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-300">
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-500">(4.8)</span>
            </div>
            <div className="flex items-center space-x-2">
              {product.originalPrice && product.originalPrice > product.price ? (
                <>
                  <span className="text-2xl font-bold text-primary">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-3 mt-auto">
            <Link
              to={`/products/${product._id}`}
              className="btn-primary px-6 py-2 text-sm"
            >
              View Details
            </Link>
            <button
              onClick={() => {
                if (onAddToCart) {
                  onAddToCart(product);
                  toast.success('Added to cart');
                }
              }}
              className="px-6 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-colors duration-300 flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="card group overflow-hidden flex flex-col">
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={`http://localhost:5001${product.mainImage}`}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
          }}
        />
        {discountPercent && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md z-10">
            {discountPercent}% OFF
          </div>
        )}
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2 h-6">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-gray-500">(4.8)</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3 mt-auto">
          <div className="flex items-center space-x-2">
            {product.originalPrice && product.originalPrice > product.price ? (
              <>
                <span className="text-xl font-bold text-primary">
                  Rs. {product.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-primary">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 btn-primary text-center py-2 text-sm"
          >
            View Details
          </Link>
          <button
            onClick={() => {
              if (onAddToCart) {
                onAddToCart(product);
                toast.success('Added to cart');
              }
            }}
            className="p-2 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-colors duration-300"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;


