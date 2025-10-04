import { Link } from 'react-router-dom';
import { Shirt, Puzzle, HeartPulse, Gem, ArrowRight, Sparkles, Star, Heart, Gift } from 'lucide-react';

const Categories = () => {
  const categories = [
    { 
      name: 'Baby Clothing', 
      href: '/shop?category=Baby Clothing', 
      icon: Shirt, 
      gradient: 'from-pink-400 via-rose-400 to-red-400',
      bgGradient: 'from-pink-50 to-rose-100',
      shadowColor: 'shadow-pink-200/50',
      description: 'Soft & Comfortable',
      count: '120+ Items',
      decorIcon: Heart,
      hoverScale: 'hover:scale-105'
    },
    { 
      name: 'Toys & Games', 
      href: '/shop?category=Toys', 
      icon: Puzzle, 
      gradient: 'from-blue-400 via-cyan-400 to-teal-400',
      bgGradient: 'from-blue-50 to-cyan-100', 
      shadowColor: 'shadow-blue-200/50',
      description: 'Fun & Educational',
      count: '80+ Items',
      decorIcon: Sparkles,
      hoverScale: 'hover:scale-105'
    },
    { 
      name: 'Care Products', 
      href: '/shop?category=Care Products', 
      icon: HeartPulse, 
      gradient: 'from-emerald-400 via-green-400 to-teal-500',
      bgGradient: 'from-emerald-50 to-green-100',
      shadowColor: 'shadow-emerald-200/50', 
      description: 'Safe & Natural',
      count: '65+ Items',
      decorIcon: Star,
      hoverScale: 'hover:scale-105'
    },
    { 
      name: 'Accessories', 
      href: '/shop?category=Accessories', 
      icon: Gem, 
      gradient: 'from-purple-400 via-violet-400 to-indigo-400',
      bgGradient: 'from-purple-50 to-violet-100',
      shadowColor: 'shadow-purple-200/50',
      description: 'Stylish & Cute',
      count: '45+ Items',
      decorIcon: Gift,
      hoverScale: 'hover:scale-105'
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          {/* Enhanced heading with decorations */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-700">Curated Collections</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Shop by 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Category</span>
          </h2>
          
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover premium baby products carefully selected for comfort, safety, and style
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link key={category.name} to={category.href} className="group">
              <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${category.hoverScale} hover:shadow-2xl ${category.shadowColor} bg-white border border-gray-100`}>
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-40`} />
                
                {/* Floating decoration */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  <category.decorIcon className="w-8 h-8 text-gray-400" />
                </div>
                
                {/* Animated gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative p-6 h-64 flex flex-col justify-between">
                  {/* Icon container with enhanced styling */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      <category.icon className="w-7 h-7" />
                    </div>
                    
                    {/* Item count badge */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                      {category.count}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Enhanced CTA with better styling */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center text-gray-700 group-hover:text-gray-900 font-semibold text-sm transition-colors duration-300">
                      Shop Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${category.gradient} transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500`} />
                    </div>
                  </div>
                </div>
                
                {/* Bottom accent with animation */}
                <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${category.gradient} group-hover:w-full transition-all duration-500`} />
              </div>
            </Link>
          ))}
        </div>
        
        {/* View All Categories CTA */}
        <div className="text-center mt-12">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-full font-semibold hover:shadow-lg border border-gray-200 hover:border-primary/20 transition-all duration-300 hover:scale-105 group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;


