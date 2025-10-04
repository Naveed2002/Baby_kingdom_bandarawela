import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Import local images
import cheramyLogo from "../../assets/brandlogo/babycheramy.png";
import farlinLogo from "../../assets/brandlogo/farlinlogo.png";
import marvelLogo from "../../assets/brandlogo/marvel-logo.png";
import hemasLogo from "../../assets/brandlogo/hemas_logo.jpg";
import unileverLogo from "../../assets/brandlogo/Unilever-Logo.png";
import pandaBabyLogo from "../../assets/brandlogo/Panda_Babylogo.png";
import kidsJoyLogo from "../../assets/brandlogo/kids_joy_png_logo.png";

const brands = [
  { id: 1, name: "Cheramy", logo: cheramyLogo },
  { id: 2, name: "Farlin", logo: farlinLogo },
  { id: 3, name: "Marvel Baby", logo: marvelLogo },
  { id: 4, name: "Hemas", logo: hemasLogo },
  { id: 5, name: "Unilever", logo: unileverLogo },
  { id: 6, name: "Panda", logo: pandaBabyLogo },
  { id: 7, name: "Kids Joy", logo: kidsJoyLogo },
];

const Cta = () => {
  return (
    <section className="bg-gradient-to-r from-pink-50 via-white to-blue-50 text-black py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Brand logos */}
        <div className="mb-16">
          <h3 className="text-xl sm:text-2xl font-semibold mb-8 text-center text-gray-800">
          Proudly Offering Trusted Brands for 25+ Years
          </h3>
          <div className="relative overflow-hidden">
            <div className="flex w-max animate-loop-scroll space-x-16 py-6">
              {[...brands, ...brands].map((brand, index) => (
                <div
                  key={`${brand.id}-${index}`}
                  className="flex flex-col items-center justify-center min-w-[120px]"
                >
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg p-3 transition-transform hover:scale-105">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 mt-2">
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
            Ready to Shop?
          </h2>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto text-gray-600">
            Join thousands of happy parents who trust{" "}
            <span className="font-semibold text-pink-500">Baby Kingdom</span>{" "}
            for their baby's needs. Start shopping today and discover the
            difference quality makes.
          </p>
          <Link
            to="/shop"
            className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-4 rounded-2xl shadow-md inline-flex items-center justify-center transition-all duration-300"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Cta;
