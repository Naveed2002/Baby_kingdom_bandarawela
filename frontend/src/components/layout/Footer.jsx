import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  Crown,
  Heart
} from 'lucide-react';

// Payment / Brand logos
import visaLogo from "../../assets/brandlogo/visa_logo.webp";
import masterCardLogo from "../../assets/brandlogo/mastercard-logo.svg";
import amexLogo from "../../assets/brandlogo/american_ex_logo.png";
import onlineBankingLogo from "../../assets/brandlogo/online_bank.jpg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Baby Kingdom</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your trusted destination for premium baby products in Bandarawela, Sri Lanka. 
              We provide quality products that ensure your little ones' comfort and safety.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-primary transition-colors duration-300">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop?category=Clothes" className="text-gray-300 hover:text-primary transition-colors duration-300">
                  Baby Clothes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Toys" className="text-gray-300 hover:text-primary transition-colors duration-300">
                  Toys & Games
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Care Products" className="text-gray-300 hover:text-primary transition-colors duration-300">
                  Care Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Accessories" className="text-gray-300 hover:text-primary transition-colors duration-300">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-gray-300">
                  Darmavijaya mawatha, Bandarawela,<br />
                  Uva Province, Sri Lanka
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <div className="text-gray-300">
                  <a href="tel:+94724783380" className="hover:text-primary transition-colors duration-300">
                    +94 72 478 3380
                  </a>
                  <br />
                  <a href="tel:+94572220009" className="hover:text-primary transition-colors duration-300">
                    +94 57 222 0009
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:info@babykingdom.lk" className="text-gray-300 hover:text-primary transition-colors duration-300">
                  babykingdom.goods@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex items-center space-x-4 mt-8">
          <span className="text-gray-400 text-sm font-semibold">We Accept:</span>
          <img src={visaLogo} alt="Visa" className="h-6" />
          <img src={masterCardLogo} alt="Mastercard" className="h-6" />
          <img src={amexLogo} alt="Amex" className="h-6" />
          <img src={onlineBankingLogo} alt="Online Banking" className="h-6" />
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-4 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Baby Kingdom. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>in Sri Lanka</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
