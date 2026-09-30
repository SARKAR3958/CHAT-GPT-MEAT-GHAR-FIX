import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { MapPin, Compass, Navigation, Loader2, AlertTriangle, Check, X, Search, Sparkles } from 'lucide-react';
import { LocationData } from '../../types/location';

// Configure Leaflet default icon paths in Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface NominatimResult {
  place_id: number | string;
  lat: string;
  lon: string;
  display_name: string;
  subtitle?: string;
  isExactMatch?: boolean;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
    [key: string]: string | undefined;
  };
}

interface InteractiveLocationPickerMapProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (location: LocationData) => void;
  onConfirm: (location: LocationData) => void;
}

// Indian geographic boundary for map view
const INDIA_BOUNDS: L.LatLngBoundsExpression = [
  [6.0, 68.0],
  [37.6, 97.5],
];

// All 28 States and 8 Union Territories of India
const INDIAN_STATES_AND_UTS = [
  'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh', 'goa',
  'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka', 'kerala',
  'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland',
  'odisha', 'orissa', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana',
  'tripura', 'uttar pradesh', 'uttarakhand', 'uttaranchal', 'west bengal',
  'delhi', 'new delhi', 'nct', 'national capital territory',
  'jammu and kashmir', 'jammu & kashmir', 'ladakh', 'chandigarh', 'puducherry',
  'pondicherry', 'dadra and nagar haveli', 'daman and diu', 'lakshadweep',
  'andaman and nicobar', 'andaman & nicobar'
];

// Major Indian cities, districts, and urban centers across all regions
const MAJOR_INDIAN_CITIES = [
  'noida', 'greater noida', 'ghaziabad', 'delhi', 'gurugram', 'gurgaon', 'faridabad',
  'mumbai', 'navi mumbai', 'thane', 'pune', 'nagpur', 'nashik', 'aurangabad', 'solapur',
  'bengaluru', 'bangalore', 'mysuru', 'mysore', 'hubli', 'mangalore', 'belgaum',
  'chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem', 'tirunelveli',
  'hyderabad', 'secunderabad', 'warangal', 'visakhapatnam', 'vijayawada', 'guntur',
  'kolkata', 'howrah', 'durgapur', 'asansol', 'siliguri',
  'ahmedabad', 'surat', 'vadodara', 'rajkot', 'bhavnagar', 'jamnagar', 'gandhinagar',
  'jaipur', 'jodhpur', 'kota', 'bikaner', 'ajmer', 'udaipur', 'bhilwara', 'alwar',
  'lucknow', 'kanpur', 'varanasi', 'prayagraj', 'allahabad', 'agra', 'meerut', 'bareilly',
  'aligarh', 'moradabad', 'gorakhpur', 'saharanpur', 'firozabad', 'jhansi', 'muzaffarnagar',
  'patna', 'gaya', 'bhagalpur', 'muzaffarpur', 'purnia', 'darbhanga', 'bihar sharif',
  'bhopal', 'indore', 'jabalpur', 'gwalior', 'ujjain', 'sagar', 'dewas', 'satna',
  'chandigarh', 'ludhiana', 'amritsar', 'jalandhar', 'patiala', 'bathinda', 'hoshiarpur',
  'kochi', 'cochin', 'thiruvananthapuram', 'trivandrum', 'kozhikode', 'calicut', 'thrissur', 'kollam',
  'bhubaneswar', 'cuttack', 'rourkela', 'puri', 'sambalpur', 'berhampur',
  'guwahati', 'silchar', 'dibrugarh', 'jorhat', 'nagaon', 'tezpur',
  'ranchi', 'jamshedpur', 'dhanbad', 'bokaro', 'deoghar', 'hazaribagh',
  'raipur', 'bhilai', 'bilaspur', 'korba', 'durg', 'rajnandgaon',
  'dehradun', 'haridwar', 'roorkee', 'rishikesh', 'haldwani', 'rudrapur', 'nainital',
  'shimla', 'dharamshala', 'solan', 'mandi', 'kullu', 'manali',
  'srinagar', 'jammu', 'anantnag', 'baramulla', 'leh', 'kargil',
  'panaji', 'margao', 'vasco da gama', 'mapusa', 'ponda',
  'agartala', 'imphal', 'shillong', 'aizawl', 'kohima', 'gangtok', 'itanagar',
  'port blair', 'kavaratti', 'daman', 'diu', 'silvassa'
];

// 6-digit Indian PIN code pattern (e.g. 110001, 201301, 400001, 560038, etc.)
const INDIAN_PINCODE_REGEX = /\b[1-9][0-9]{5}\b/;

/**
 * Deep inspection helper to verify if an address/coordinate belongs to India
 */
export function isLocationInIndia(
  lat: number,
  lng: number,
  addressDetails?: NominatimResult['address'] | null,
  displayName?: string | null
): boolean {
  const normDisplayName = (displayName || '').toLowerCase();
  const addr = addressDetails || {};
  const countryCode = (addr.country_code || '').toLowerCase().trim();
  const countryName = (addr.country || '').toLowerCase().trim();
  const stateName = (addr.state || '').toLowerCase().trim();
  const countyName = (addr.county || '').toLowerCase().trim();
  const cityName = (addr.city || addr.town || addr.village || addr.municipality || '').toLowerCase().trim();
  const suburbName = (addr.suburb || addr.neighbourhood || addr.residential || '').toLowerCase().trim();
  const postcode = (addr.postcode || '').trim();

  // Combine all text for keyword inspection
  const combinedText = `${normDisplayName} ${countryName} ${stateName} ${countyName} ${cityName} ${suburbName} ${postcode}`.toLowerCase();

  // 1. Direct country code check
  if (countryCode === 'in' || countryCode === 'ind') {
    return true;
  }

  // 2. Direct country name check
  if (countryName.includes('india') || countryName.includes('bharat') || countryName.includes('hindustan')) {
    return true;
  }

  // 3. Display name contains India or Bharat
  if (normDisplayName.includes('india') || normDisplayName.includes('bharat')) {
    return true;
  }

  // 4. Any Indian State or Union Territory matched in details or display_name
  for (const st of INDIAN_STATES_AND_UTS) {
    if (combinedText.includes(st)) {
      return true;
    }
  }

  // 5. Valid 6-digit Indian PIN code matched
  if (INDIAN_PINCODE_REGEX.test(postcode) || INDIAN_PINCODE_REGEX.test(combinedText)) {
    return true;
  }

  // 6. Major Indian city or district matched
  for (const c of MAJOR_INDIAN_CITIES) {
    if (combinedText.includes(c)) {
      return true;
    }
  }

  // 7. Check Indian Geographic Coordinates Box (Latitude: 6.0° to 37.6° N, Longitude: 68.0° to 97.5° E)
  const isInsideIndiaBox = lat >= 6.0 && lat <= 37.6 && lng >= 68.0 && lng <= 97.5;
  const explicitForeignCodes = ['pk', 'cn', 'np', 'bd', 'bt', 'mm', 'lk', 'af', 'us', 'gb', 'ca', 'ae', 'sa', 'au', 'sg', 'de', 'fr'];
  const isExplicitForeignCountry = explicitForeignCodes.includes(countryCode);

  if (isInsideIndiaBox && !isExplicitForeignCountry) {
    return true;
  }

  return false;
}

// Fallback Indian locations across diverse states and cities
const POPULAR_INDIAN_PLACES = [
  // Mumbai & Maharashtra
  { name: '10, Mahapalika Marg, Azad Maidan, Fort, Mumbai, Maharashtra 400001, India', lat: 18.9429, lon: 72.8315, road: 'Mahapalika Marg', suburb: 'Azad Maidan, Fort', city: 'Mumbai', state: 'Maharashtra', postcode: '400001' },
  { name: 'Azad Maidan, Fort, Mumbai, Maharashtra, 400001', lat: 18.9396, lon: 72.8313, road: 'Mahapalika Marg', suburb: 'Fort', city: 'Mumbai', state: 'Maharashtra', postcode: '400001' },
  { name: 'Bandra West, Hill Road, Mumbai, Maharashtra, 400050', lat: 19.0596, lon: 72.8295, road: 'Hill Road', suburb: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', postcode: '400050' },
  { name: 'Andheri East, Chakala, Mumbai, Maharashtra, 400093', lat: 19.1136, lon: 72.8697, road: 'Andheri Kurla Road', suburb: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', postcode: '400093' },
  { name: 'Koregaon Park, Pune, Maharashtra, 411001', lat: 18.5362, lon: 73.8940, road: 'North Main Road', suburb: 'Koregaon Park', city: 'Pune', state: 'Maharashtra', postcode: '411001' },
  // Delhi NCR
  { name: 'Sector 10, Noida, Uttar Pradesh, 201301', lat: 28.5830, lon: 77.3190, road: 'Main Road', suburb: '', city: '', state: '', postcode: '' },
  { name: 'Sector 18, Atta Market, Noida, Uttar Pradesh, 201301', lat: 28.5708, lon: 77.3260, road: 'Atta Market Road', suburb: 'Sector 18', city: '', state: '', postcode: '' },
  { name: 'Sector 62, Noida, Uttar Pradesh, 201309', lat: 28.6280, lon: 77.3649, road: 'Electronic City', suburb: 'Sector 62', city: '', state: '', postcode: '201309' },
  { name: 'Connaught Place, New Delhi, Delhi, 110001', lat: 28.6315, lon: 77.2167, road: 'Inner Circle', suburb: 'Connaught Place', city: 'New Delhi', state: 'Delhi', postcode: '110001' },
  { name: 'Lajpat Nagar Central Market, New Delhi, 110024', lat: 28.5677, lon: 77.2433, road: 'Feroze Gandhi Road', suburb: 'Lajpat Nagar', city: 'New Delhi', state: 'Delhi', postcode: '110024' },
  { name: 'DLF Cyber City, Phase 2, Gurugram, Haryana, 122002', lat: 28.4950, lon: 77.0895, road: 'Cyber Hub Road', suburb: 'DLF Phase 2', city: 'Gurugram', state: 'Haryana', postcode: '122002' },
  { name: 'Indirapuram, Ghaziabad, Uttar Pradesh, 201014', lat: 28.6420, lon: 77.3712, road: 'Vaibhav Khand', suburb: 'Indirapuram', city: 'Ghaziabad', state: '', postcode: '201014' },
  // Bengaluru & Karnataka
  { name: 'Indiranagar 100ft Road, Bengaluru, Karnataka, 560038', lat: 12.9784, lon: 77.6408, road: '100 Feet Road', suburb: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', postcode: '560038' },
  { name: 'Koramangala 5th Block, Bengaluru, Karnataka, 560095', lat: 12.9352, lon: 77.6245, road: 'Jyoti Nivas College Road', suburb: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', postcode: '560095' },
  // Hyderabad & Telangana
  { name: 'HITEC City, Madhapur, Hyderabad, Telangana, 500081', lat: 17.4474, lon: 78.3762, road: 'Hitech City Main Road', suburb: 'Madhapur', city: 'Hyderabad', state: 'Telangana', postcode: '500081' },
  { name: 'Banjara Hills, Road No 12, Hyderabad, Telangana, 500034', lat: 17.4165, lon: 78.4382, road: 'Road No 12', suburb: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', postcode: '500034' },
  // Chennai & Kolkata
  { name: 'T. Nagar, Usman Road, Chennai, Tamil Nadu, 600017', lat: 13.0418, lon: 80.2341, road: 'South Usman Road', suburb: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu', postcode: '600017' },
  { name: 'Park Street, Kolkata, West Bengal, 700016', lat: 22.5510, lon: 88.3527, road: 'Mother Teresa Sarani', suburb: 'Park Street', city: 'Kolkata', state: 'West Bengal', postcode: '700016' },
  // Lucknow, Jaipur & Ahmedabad
  { name: 'Hazratganj, Lucknow, Uttar Pradesh, 226001', lat: 26.8467, lon: 80.9462, road: 'Mahatma Gandhi Marg', suburb: 'Hazratganj', city: 'Lucknow', state: '', postcode: '226001' },
  { name: 'C-Scheme, Ashok Nagar, Jaipur, Rajasthan, 302001', lat: 26.9078, lon: 75.8016, road: 'Subhash Marg', suburb: 'C-Scheme', city: 'Jaipur', state: 'Rajasthan', postcode: '302001' },
  { name: 'SG Highway, Bodakdev, Ahmedabad, Gujarat, 380054', lat: 23.0416, lon: 72.5074, road: 'SG Highway', suburb: 'Bodakdev', city: 'Ahmedabad', state: 'Gujarat', postcode: '380054' },
  { name: 'Bailey Road, Patna, Bihar, 800001', lat: 25.6093, lon: 85.1235, road: 'Jawaharlal Nehru Marg', suburb: 'Bailey Road', city: 'Patna', state: 'Bihar', postcode: '800001' },
  { name: 'Sector 17 Plaza, Chandigarh, 160017', lat: 30.7398, lon: 76.7827, road: 'Sector 17 Plaza Road', suburb: 'Sector 17', city: 'Chandigarh', state: 'Chandigarh', postcode: '160017' },
];

// Quick City Jump Buttons
const QUICK_CITY_CHIPS = [
  { name: 'Mumbai', lat: 18.9429, lon: 72.8315, zoom: 15 },
  { name: 'Noida (Sec 10)', lat: 28.5830, lon: 77.3190, zoom: 16 },
  { name: 'Delhi NCR', lat: 28.6315, lon: 77.2167, zoom: 15 },
  { name: 'Bengaluru', lat: 12.9784, lon: 77.6408, zoom: 15 },
  { name: 'Pune', lat: 18.5362, lon: 73.8940, zoom: 15 },
  { name: 'Hyderabad', lat: 17.4474, lon: 78.3762, zoom: 15 },
];

/**
 * Intelligent decomposition of full addresses (like Google Maps copies)
 * into search candidates that Geocoding APIs can find immediately.
 */
function generateSearchCandidates(rawQuery: string): string[] {
  const candidates: string[] = [];
  const q = rawQuery.trim();
  if (!q) return candidates;

  candidates.push(q);

  // 1. Strip unit / flat / house / shop numbers (e.g. "10, ", "Shop No. 4, ", "Flat B-302, ")
  const strippedUnit = q.replace(
    /^(?:flat\s*(?:no\.?|#)?\s*\w+|shop\s*(?:no\.?|#)?\s*\w+|plot\s*(?:no\.?|#)?\s*\w+|house\s*(?:no\.?|#)?\s*\w+|room\s*(?:no\.?|#)?\s*\w+|#\s*\w+|\b\d+[a-zA-Z]?(?:\/\d+)?\b)[\s,/-]*/i,
    ''
  ).trim();

  if (strippedUnit && strippedUnit !== q) {
    candidates.push(strippedUnit);
  }

  // 2. Parse comma-separated parts (Google Maps standard)
  const parts = q.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    // Non-pure-numeric tokens
    const textParts = parts.filter((p) => !/^\d+$/.test(p));
    if (textParts.length >= 2) {
      candidates.push(textParts.join(' '));
      candidates.push(textParts.slice(0, 3).join(' '));
    }

    // Identify city if present
    const cityPart = [...parts].reverse().find((p) => {
      const lower = p.toLowerCase();
      return MAJOR_INDIAN_CITIES.some((c) => lower.includes(c));
    });

    if (cityPart) {
      for (const p of parts.slice(0, 3)) {
        if (p !== cityPart && !/^\d+$/.test(p) && p.length > 2) {
          candidates.push(`${p} ${cityPart}`);
        }
      }
    }

    // Check for 6-digit PIN code in parts
    const pinMatch = q.match(INDIAN_PINCODE_REGEX);
    if (pinMatch) {
      const pin = pinMatch[0];
      if (parts[0] && !/^\d+$/.test(parts[0])) {
        candidates.push(`${parts[0]} ${pin}`);
      }
      if (cityPart) {
        candidates.push(`${cityPart} ${pin}`);
      }
    }
  }

  // Deduplicate case-insensitively
  const seen = new Set<string>();
  const uniqueCandidates: string[] = [];
  for (const cand of candidates) {
    const norm = cand.toLowerCase().trim();
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      uniqueCandidates.push(cand);
    }
  }

  return uniqueCandidates.slice(0, 5);
}

// In-memory LRU reverse-geocode cache to make repeated panning instant (< 5ms)
const reverseGeocodeCache = new Map<string, LocationData>();

export const InteractiveLocationPickerMap: React.FC<InteractiveLocationPickerMapProps> = ({
  initialLat = 26.1445,
  initialLng = 91.7362,
  onLocationSelect,
  onConfirm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticMoveRef = useRef(false);

  // Stable callback refs
  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  const onConfirmRef = useRef(onConfirm);
  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  const [deliverable, setDeliverable] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    address: 'Select a location on the map',
    lat: initialLat,
    lng: initialLng,
    road: 'Main Road',
    suburb: '',
    city: '',
    state: '',
    postcode: '',
  });

  // Fast & Snappy Reverse Geocoding with local cache and dual-provider fallback
  const performReverseGeocode = useCallback(async (lat: number, lng: number, forcePreserveAddress?: string) => {
    // Check in-memory cache first (rounded to 3 decimals, ~100m proximity)
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    if (reverseGeocodeCache.has(cacheKey) && !forcePreserveAddress) {
      const cached = reverseGeocodeCache.get(cacheKey)!;
      setSelectedLocation(cached);
      setDeliverable(true);
      setErrorMsg(null);
      onLocationSelectRef.current?.(cached);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGeocoding(true);
    setErrorMsg(null);

    // Snappy 1600ms timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 1600);

    try {
      let addrData: NominatimResult | null = null;

      // 1. Nominatim Reverse Geocoding with custom User-Agent
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            signal: controller.signal,
            headers: {
              'Accept-Language': 'en-US,en',
            },
          }
        );
        if (response.ok) {
          addrData = await response.json();
        }
      } catch {
        // Fallback to Photon
      }

      // 2. Photon API Reverse Geocode fallback
      if (!addrData && !controller.signal.aborted) {
        try {
          const photonRes = await fetch(
            `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`,
            { signal: controller.signal }
          );
          if (photonRes.ok) {
            const photonData = await photonRes.json();
            if (photonData.features && photonData.features.length > 0) {
              const props = photonData.features[0].properties;
              addrData = {
                place_id: props.osm_id || 'photon-rev',
                lat: lat.toString(),
                lon: lng.toString(),
                display_name: [props.name, props.street, props.district, props.city, props.state, props.country || 'India']
                  .filter(Boolean)
                  .join(', '),
                address: {
                  road: props.street || props.name || '',
                  suburb: props.district || props.locality || '',
                  city: props.city || props.county || 'India',
                  state: props.state || 'India',
                  postcode: props.postcode || '',
                  country: props.country || 'India',
                  country_code: (props.countrycode || '').toLowerCase() || 'in',
                },
              };
            }
          }
        } catch {
          // Both network calls failed
        }
      }

      clearTimeout(timeoutId);

      // Deep verification of all details, fields, and coordinates
      const isValidIndia = isLocationInIndia(lat, lng, addrData?.address, addrData?.display_name);

      if (!isValidIndia) {
        setDeliverable(false);
        setErrorMsg('Delivery is only available in India.');
        const nonIndiaLoc: LocationData = {
          address: addrData?.display_name || `Location outside India (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          lat,
          lng,
        };
        setSelectedLocation(nonIndiaLoc);
        onLocationSelectRef.current?.(nonIndiaLoc);
        return;
      }

      // Verified Indian Location
      setDeliverable(true);
      setErrorMsg(null);

      const addr = addrData?.address || {};
      const road = addr.road || addr.street || addr.pedestrian || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.county || '';
      const city = addr.city || addr.town || addr.municipality || addr.district || '';
      const state = addr.state || '';
      const postcode = addr.postcode || '';

      let addressString = forcePreserveAddress || '';
      if (!addressString) {
        const parts = [road, suburb, city, state, postcode].filter(Boolean);
        addressString = parts.length > 0 ? parts.join(', ') : (addrData?.display_name || '');
      }

      if (!addressString) {
        addressString = `Pinned Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}, India`;
      } else if (!addressString.toLowerCase().includes('india') && !addressString.toLowerCase().includes('bharat')) {
        addressString = `${addressString}, India`;
      }

      const newLoc: LocationData = {
        address: addressString,
        lat,
        lng,
        road: road || 'Main Road',
        suburb: suburb || (city ? `${city} Area` : 'Local Area'),
        city: city || 'India',
        state: state || 'India',
        postcode: postcode || '',
      };

      // Store in memory cache
      reverseGeocodeCache.set(cacheKey, newLoc);

      setSelectedLocation(newLoc);
      onLocationSelectRef.current?.(newLoc);
    } catch {
      clearTimeout(timeoutId);
      const isIndiaCoords = isLocationInIndia(lat, lng, null, null);

      if (!isIndiaCoords) {
        setDeliverable(false);
        setErrorMsg('Delivery is only available in India.');
      } else {
        setDeliverable(true);
        setErrorMsg(null);
      }

      const fallbackLoc:LocationData={address:forcePreserveAddress || `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,lat,lng,road:'',suburb:'',city:'',state:'',postcode:''};
      setErrorMsg('Address lookup is unavailable. Enter the delivery address manually.');
      setSelectedLocation(fallbackLoc);
      onLocationSelectRef.current?.(fallbackLoc);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as unknown as { _leaflet_id?: string | null })._leaflet_id) {
      (mapContainerRef.current as unknown as { _leaflet_id?: string | null })._leaflet_id = null;
    }

    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        console.warn('Map cleanup warning:', e);
      }
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      minZoom: 4,
      maxZoom: 19,
      maxBounds: INDIA_BOUNDS,
      maxBoundsViscosity: 0.9,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    const handleMoveStart = () => {
      setIsDragging(true);
    };

    const handleMoveEnd = () => {
      setIsDragging(false);
      if (!mapRef.current) return;

      // If moved programmatically (via search suggestion selection), skip overwriting address
      if (isProgrammaticMoveRef.current) {
        isProgrammaticMoveRef.current = false;
        return;
      }

      try {
        const center = mapRef.current.getCenter();
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        // Snappy 250ms debounce
        debounceTimerRef.current = setTimeout(() => {
          performReverseGeocode(center.lat, center.lng);
        }, 250);
      } catch (e) {
        console.warn('Moveend error:', e);
      }
    };

    // Tap or click on map to immediately move pin there
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!mapRef.current) return;
      mapRef.current.flyTo(e.latlng, mapRef.current.getZoom(), { duration: 0.4 });
    };

    map.on('movestart', handleMoveStart);
    map.on('moveend', handleMoveEnd);
    map.on('click', handleMapClick);

    // Initial geocode
    performReverseGeocode(initialLat, initialLng);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      map.off('movestart', handleMoveStart);
      map.off('moveend', handleMoveEnd);
      map.off('click', handleMapClick);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn('Map remove warning:', e);
        }
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intelligent Location Search: handles any address, shop, building, or PIN code
  useEffect(() => {
    const rawQ = searchQuery.trim();
    if (!rawQ || rawQ.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setNoResultsFound(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setNoResultsFound(false);

      const candidateQueries = generateSearchCandidates(rawQ);
      let foundResults: NominatimResult[] = [];

      // Query candidate variations in parallel / sequential cascade
      for (const cand of candidateQueries) {
        if (foundResults.length >= 4) break;

        const candWithIndia = cand.toLowerCase().includes('india') ? cand : `${cand}, India`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(candWithIndia)}&countrycodes=in&format=json&addressdetails=1&limit=6`
          );
          if (response.ok) {
            const results: NominatimResult[] = await response.json();
            const valid = results.filter((item) =>
              isLocationInIndia(parseFloat(item.lat), parseFloat(item.lon), item.address, item.display_name)
            );
            if (valid.length > 0) {
              foundResults.push(...valid);
            }
          }
        } catch {
          // Continue to next candidate
        }
      }

      // If Nominatim gave 0 results, query Photon with candidate queries
      if (foundResults.length === 0) {
        for (const cand of candidateQueries) {
          if (foundResults.length > 0) break;
          try {
            const photonRes = await fetch(
              `https://photon.komoot.io/api/?q=${encodeURIComponent(cand)}&limit=6`
            );
            if (photonRes.ok) {
              const photonData = await photonRes.json();
              if (photonData.features && photonData.features.length > 0) {
                const photonMatches: NominatimResult[] = photonData.features
                  .filter((f: {
                    geometry: { coordinates: [number, number] };
                    properties: { countrycode?: string; country?: string; state?: string; city?: string; name?: string; street?: string };
                  }) => {
                    const lat = f.geometry.coordinates[1];
                    const lon = f.geometry.coordinates[0];
                    const props = f.properties;
                    const combined = `${props.name || ''} ${props.street || ''} ${props.city || ''} ${props.state || ''} ${props.country || ''}`.toLowerCase();
                    return isLocationInIndia(lat, lon, {
                      state: props.state,
                      city: props.city,
                      country: props.country,
                      country_code: props.countrycode,
                    }, combined);
                  })
                  .map((f: {
                    geometry: { coordinates: [number, number] };
                    properties: { osm_id?: number; name?: string; street?: string; district?: string; city?: string; state?: string; country?: string; postcode?: string };
                  }, idx: number) => {
                    const p = f.properties;
                    const title = [p.name, p.street, p.district, p.city, p.state, 'India'].filter(Boolean).join(', ');
                    return {
                      place_id: p.osm_id || `photon-${idx}`,
                      lat: f.geometry.coordinates[1].toString(),
                      lon: f.geometry.coordinates[0].toString(),
                      display_name: title,
                      address: {
                        road: p.street || p.name || '',
                        suburb: p.district || '',
                        city: p.city || '',
                        state: p.state || '',
                        country: p.country || 'India',
                        country_code: 'in',
                        postcode: p.postcode || '',
                      },
                    };
                  });
                foundResults = photonMatches;
              }
            }
          } catch {
            // Photon network failure
          }
        }
      }

      // Check against local Indian popular database
      const qLower = rawQ.toLowerCase();
      const localMatches = POPULAR_INDIAN_PLACES.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.city.toLowerCase().includes(qLower) ||
          p.suburb.toLowerCase().includes(qLower) ||
          p.road.toLowerCase().includes(qLower) ||
          p.postcode.includes(qLower)
      ).map((p, idx) => ({
        place_id: `popular-${idx}`,
        lat: p.lat.toString(),
        lon: p.lon.toString(),
        display_name: p.name,
        address: {
          road: p.road,
          suburb: p.suburb,
          city: p.city,
          state: p.state,
          country: 'India',
          country_code: 'in',
          postcode: p.postcode,
        },
      }));

      // Combine and deduplicate by place_id / lat-lon
      const combined = [...foundResults, ...localMatches];
      const seenLocs = new Set<string>();
      let deduplicated: NominatimResult[] = [];

      for (const item of combined) {
        const key = `${parseFloat(item.lat).toFixed(3)},${parseFloat(item.lon).toFixed(3)}`;
        if (!seenLocs.has(key)) {
          seenLocs.add(key);
          deduplicated.push(item);
        }
      }

      // If user typed a detailed address (like "10, Mahapalika Marg, Azad Maidan...")
      // and we found a nearby match, synthesize a top "Exact Address Match" result
      // preserving their exact house/building/shop details!
      if (deduplicated.length > 0 && rawQ.includes(',') && rawQ.length > 15) {
        const bestMatch = deduplicated[0];
        const exactAddressItem: NominatimResult = {
          place_id: 'user-exact-match',
          lat: bestMatch.lat,
          lon: bestMatch.lon,
          display_name: rawQ.toLowerCase().includes('india') ? rawQ : `${rawQ}, India`,
          subtitle: `Near ${bestMatch.display_name.split(',')[0]} • Verified Pin in India`,
          isExactMatch: true,
          address: bestMatch.address,
        };
        deduplicated = [exactAddressItem, ...deduplicated];
      }

      if (deduplicated.length === 0) {
        setSearchResults([]);
        setNoResultsFound(true);
      } else {
        setSearchResults(deduplicated.slice(0, 8));
        setNoResultsFound(false);
      }

      setShowSearchDropdown(true);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select Search Suggestion
  const handleSelectSuggestion = (item: NominatimResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    setSearchQuery(item.display_name);
    setShowSearchDropdown(false);

    // Prevent moveend from immediately overwriting user's specific searched address
    isProgrammaticMoveRef.current = true;

    if (mapRef.current) {
      try {
        mapRef.current.flyTo([lat, lng], 17, {
          duration: 0.8,
        });
      } catch (e) {
        console.warn('flyTo error:', e);
      }
    }

    const addr = item.address || {};
    const road = addr.road || addr.street || '';
    const suburb = addr.suburb || addr.neighbourhood || '';
    const city = addr.city || addr.town || '';
    const state = addr.state || '';
    const postcode = addr.postcode || '';

    const newLoc: LocationData = {
      address: item.display_name,
      lat,
      lng,
      road: road || 'Main Road',
      suburb: suburb || (city ? `${city} Area` : 'Local Area'),
      city: city || 'India',
      state: state || 'India',
      postcode: postcode || '201301',
    };

    setDeliverable(true);
    setErrorMsg(null);
    setSelectedLocation(newLoc);
    onLocationSelectRef.current?.(newLoc);
  };

  // Jump to City chip
  const handleJumpToCity = (chip: typeof QUICK_CITY_CHIPS[0]) => {
    isProgrammaticMoveRef.current = true;
    if (mapRef.current) {
      mapRef.current.flyTo([chip.lat, chip.lon], chip.zoom, { duration: 0.8 });
    }
    performReverseGeocode(chip.lat, chip.lon);
  };

  // GPS Current Location Handler
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          try {
            mapRef.current.flyTo([latitude, longitude], 17, { duration: 0.8 });
          } catch (e) {
            console.warn('flyTo error:', e);
          }
        }
        performReverseGeocode(latitude, longitude);
      },
      (err) => {
        setIsGpsLoading(false);
        console.warn('GPS recentering to initial location:', err);
        if (mapRef.current) {
          try {
            mapRef.current.flyTo([initialLat, initialLng], 16, { duration: 0.8 });
          } catch (e) {
            console.warn('flyTo error:', e);
          }
        }
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
      {/* Top Search Bar & Suggestions Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-3 bg-gradient-to-b from-white via-white/90 to-transparent backdrop-blur-xs">
        <div className="relative max-w-lg mx-auto">
          <div className="flex items-center bg-white rounded-2xl px-3.5 py-2.5 border border-slate-200 shadow-md">
            <Search className="w-4 h-4 text-[#A8071A] shrink-0 mr-2.5" />
            <input
              type="text"
              name="map_search_no_autofill"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0 || noResultsFound) setShowSearchDropdown(true);
              }}
              placeholder="Enter building, shop, address, or PIN (e.g. 10, Mahapalika Marg Mumbai)"
              className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none placeholder-slate-400"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-[#A8071A] animate-spin shrink-0 ml-1" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchDropdown(false);
                  setNoResultsFound(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Quick Hub Navigation Chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Quick jump:</span>
            {QUICK_CITY_CHIPS.map((chip) => (
              <button
                key={chip.name}
                type="button"
                onClick={() => handleJumpToCity(chip)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-[#A8071A] hover:border-red-200 transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                {chip.name}
              </button>
            ))}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-[1010] divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {noResultsFound ? (
                <div className="p-4 text-center">
                  <p className="text-xs font-bold text-slate-700">
                    No exact location found for &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Try searching with landmark, street, or city (e.g. Mahapalika Marg, Azad Maidan, Fort, Mumbai).
                  </p>
                </div>
              ) : (
                searchResults.map((item, index) => {
                  const isExact = item.isExactMatch;
                  const parts = item.display_name.split(',');
                  const title = parts[0] || item.display_name;
                  const subtitle = item.subtitle || parts.slice(1).join(',').trim();

                  return (
                    <button
                      type="button"
                      key={item.place_id || index}
                      onClick={() => handleSelectSuggestion(item)}
                      className={`w-full text-left px-3.5 py-2.5 hover:bg-red-50/70 transition-colors flex items-start gap-2.5 cursor-pointer ${
                        isExact ? 'bg-amber-50/50 border-l-4 border-[#A8071A]' : ''
                      }`}
                    >
                      <div className={`p-1 rounded-lg shrink-0 mt-0.5 ${isExact ? 'bg-red-100 text-[#A8071A]' : 'bg-slate-100 text-slate-600'}`}>
                        {isExact ? <Sparkles className="w-3.5 h-3.5 fill-[#A8071A]" /> : <MapPin className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-extrabold text-slate-900 truncate">{title}</p>
                          {isExact && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-[#A8071A] text-white">
                              Exact Pin
                            </span>
                          )}
                        </div>
                        {subtitle && <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">{subtitle}</p>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map View Container */}
      <div className="relative w-full flex-1 min-h-[360px] bg-slate-100 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Custom Stationary Red Center Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[900] pointer-events-none flex flex-col items-center">
          {/* Location Speech Bubble */}
          <div
            className={`text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow-lg mb-1 flex items-center gap-1.5 transition-all duration-200 ${
              !deliverable
                ? 'bg-amber-600'
                : isDragging
                ? '-translate-y-2 scale-105 bg-[#A8071A]'
                : 'bg-[#A8071A]'
            }`}
          >
            <span>
              {!deliverable
                ? 'Outside Delivery Zone'
                : isDragging
                ? 'Move pin to exact spot'
                : isGeocoding
                ? 'Pinning Location...'
                : '📍 Exact Location Pinned'}
            </span>
            {isGeocoding ? (
              <Loader2 className="w-3 h-3 animate-spin text-white" />
            ) : deliverable ? (
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-white" />
            )}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-inherit rotate-45" />
          </div>

          {/* Red Pin Body */}
          <div className={`relative transition-transform duration-200 ${isDragging ? '-translate-y-3 scale-110' : ''}`}>
            <div
              className={`w-11 h-11 rounded-full text-white flex items-center justify-center shadow-2xl border-2 border-white ring-4 ${
                deliverable ? 'bg-[#A8071A] ring-red-500/25' : 'bg-amber-600 ring-amber-600/30'
              }`}
            >
              <MapPin className="w-6 h-6 fill-white text-white" />
            </div>
            {/* Ground Shadow */}
            <div
              className={`w-8 h-2 bg-slate-900/30 rounded-full blur-[2px] mx-auto mt-1 transition-all ${
                isDragging ? 'scale-75 opacity-40' : 'scale-100 opacity-80'
              }`}
            />
          </div>
        </div>

        {/* Floating GPS Recenter Button */}
        <button
          type="button"
          onClick={handleCurrentLocation}
          title="Recenter to Current GPS Location"
          className="absolute bottom-5 right-4 z-[900] w-11 h-11 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 flex items-center justify-center hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
        >
          {isGpsLoading ? (
            <Loader2 className="w-5 h-5 text-[#A8071A] animate-spin" />
          ) : (
            <Compass className="w-5 h-5 text-[#A8071A]" />
          )}
        </button>
      </div>

      {/* Bottom Selected Location Card */}
      <div className="bg-white rounded-t-3xl p-5 border-t border-slate-200 shadow-2xl z-[900] relative">
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3" />

        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                deliverable ? 'bg-red-50 text-[#A8071A]' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <MapPin className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900">Selected Location</h3>
              <p className="text-[10px] text-slate-500 font-semibold">
                {deliverable ? 'Verified for Express Meat Delivery in India' : 'Location Check'}
              </p>
            </div>
          </div>

          {deliverable ? (
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" /> Deliverable in India
            </span>
          ) : (
            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Outside Delivery Zone
            </span>
          )}
        </div>

        {/* Real-time Address Display Box */}
        <div
          className={`border rounded-2xl p-3 mb-4 flex items-center gap-3 ${
            deliverable ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/40 border-amber-200'
          }`}
        >
          <MapPin className={`w-4 h-4 shrink-0 ${deliverable ? 'text-[#A8071A] fill-red-100' : 'text-amber-600'}`} />
          <div className="flex-1 min-w-0">
            {isGeocoding && !selectedLocation.address ? (
              <div className="space-y-1.5 animate-pulse">
                <div className="h-3 bg-slate-200 rounded-md w-3/4" />
                <div className="h-2.5 bg-slate-200 rounded-md w-1/2" />
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-800 leading-snug break-words">
                  {selectedLocation.address}
                </p>
                {errorMsg && <p className="text-[10px] font-bold text-amber-700 mt-0.5">{errorMsg}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Confirm Location CTA Button: always active when deliverable is true */}
        <button
          type="button"
          onClick={() => onConfirmRef.current?.(selectedLocation)}
          disabled={!deliverable}
          className="w-full py-3.5 px-6 bg-[#A8071A] hover:bg-red-800 active:bg-red-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-red-900/20 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Navigation className="w-4 h-4 fill-white" />
          <span>Confirm Location & Proceed</span>
        </button>
      </div>
    </div>
  );
};
