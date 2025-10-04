import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Heart, Star, Search } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative h-[70vh] flex items-center overflow-hidden">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 transition-all duration-1000" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center text-white">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs sm:text-sm font-medium mb-3 border border-white/30">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
              Trusted by 5,000+ Happy Parents
            </div>

            {/* Main heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 leading-tight">
              Everything Your Baby Needs
            </h1>
            
            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-white/90 font-medium mb-2">
              Premium Quality • Trusted by Parents • Fast Delivery
            </p>
            
            {/* Description */}
            <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto mb-4 leading-relaxed">
              Discover our curated collection of safe, comfortable, and adorable baby products.
            </p>

            {/* Search bar */}
            <div className="max-w-md mx-auto mb-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-full p-1.5 flex items-center shadow-lg">
                <div className="flex-1 flex items-center pl-3">
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    className="w-full bg-transparent text-gray-700 placeholder-gray-500 focus:outline-none text-xs sm:text-sm"
                  />
                </div>
                <Link 
                  to="/shop" 
                  className="bg-gradient-to-r from-primary to-secondary text-white px-3 sm:px-4 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1 text-xs sm:text-sm"
                >
                  Search
                </Link>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center mb-5">
              <Link 
                to="/shop" 
                className="bg-white text-gray-900 px-5 sm:px-6 py-2.5 rounded-full font-bold text-sm sm:text-base hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-2 group"
              >
                Shop Now
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/about"
                className="border border-white text-white px-5 sm:px-6 py-2.5 rounded-full font-bold text-sm sm:text-base hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-white/90">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs sm:text-sm">100% Safe</div>
                  <div className="text-xs text-white/70">Quality Assured</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-white/90">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs sm:text-sm">Fast Delivery</div>
                  <div className="text-xs text-white/70">Island-wide</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-white/90">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs sm:text-sm">25+ Years</div>
                  <div className="text-xs text-white/70">Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
