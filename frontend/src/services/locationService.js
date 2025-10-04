// Location service for address suggestions and location data
import axios from 'axios';

// Sri Lankan provinces/states
const sriLankanProvinces = [
  'Central Province',
  'Eastern Province', 
  'North Central Province',
  'Northern Province',
  'North Western Province',
  'Sabaragamuwa Province',
  'Southern Province',
  'Uva Province',
  'Western Province'
];

// Major cities in Sri Lanka by province
const sriLankanCities = {
  'Western Province': [
    'Colombo', 'Gampaha', 'Kalutara', 'Mount Lavinia', 'Dehiwala', 'Moratuwa', 
    'Sri Jayawardenepura Kotte', 'Negombo', 'Panadura', 'Wattala', 'Kelaniya'
  ],
  'Central Province': [
    'Kandy', 'Matale', 'Nuwara Eliya', 'Hatton', 'Dambulla', 'Nawalapitiya',
    'Gampola', 'Wattegama', 'Haputale'
  ],
  'Southern Province': [
    'Galle', 'Matara', 'Hambantota', 'Ambalangoda', 'Tangalle', 'Weligama',
    'Mirissa', 'Unawatuna', 'Hikkaduwa'
  ],
  'Northern Province': [
    'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya', 'Point Pedro'
  ],
  'Eastern Province': [
    'Trincomalee', 'Batticaloa', 'Ampara', 'Kalmunai', 'Akkaraipattu', 'Valaichchenai'
  ],
  'North Western Province': [
    'Kurunegala', 'Puttalam', 'Chilaw', 'Narammala', 'Wariyapola'
  ],
  'North Central Province': [
    'Anuradhapura', 'Polonnaruwa', 'Kekirawa', 'Habarana'
  ],
  'Uva Province': [
    'Badulla', 'Bandarawela', 'Monaragala', 'Wellawaya', 'Mahiyanganaya', 'Ella'
  ],
  'Sabaragamuwa Province': [
    'Ratnapura', 'Kegalle', 'Balangoda', 'Embilipitiya', 'Pelmadulla'
  ]
};

// Address suggestions based on input
const getAddressSuggestions = async (input) => {
  if (!input || input.length < 2) return [];
  
  try {
    // For demo purposes, we'll use a simple matching algorithm
    // In production, you might want to use Google Places API or similar
    const suggestions = [];
    
    // Search through all cities and add matching ones
    Object.values(sriLankanCities).flat().forEach(city => {
      if (city.toLowerCase().includes(input.toLowerCase())) {
        suggestions.push({
          description: city,
          city: city,
          state: getProvinceByCity(city),
          country: 'Sri Lanka'
        });
      }
    });
    
    // Add province matches
    sriLankanProvinces.forEach(province => {
      if (province.toLowerCase().includes(input.toLowerCase())) {
        suggestions.push({
          description: province,
          city: '',
          state: province,
          country: 'Sri Lanka'
        });
      }
    });
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return [];
  }
};

// Get province by city name
const getProvinceByCity = (cityName) => {
  for (const [province, cities] of Object.entries(sriLankanCities)) {
    if (cities.includes(cityName)) {
      return province;
    }
  }
  return '';
};

// Get cities by province
const getCitiesByProvince = (province) => {
  return sriLankanCities[province] || [];
};

// Get all provinces
const getProvinces = () => {
  return sriLankanProvinces;
};

// Geocoding service (simplified)
const geocodeAddress = async (address) => {
  try {
    // This would typically call a real geocoding API
    // For now, we'll return a mock response
    return {
      success: true,
      results: [{
        formatted_address: address,
        geometry: {
          location: { lat: 7.8731, lng: 80.7718 } // Center of Sri Lanka
        }
      }]
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { success: false, error: error.message };
  }
};

export {
  getAddressSuggestions,
  getProvinceByCity,
  getCitiesByProvince,
  getProvinces,
  geocodeAddress,
  sriLankanCities,
  sriLankanProvinces
};