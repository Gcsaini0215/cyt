import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  Alert
} from '@mui/material';
import { LocationOn, MyLocation } from '@mui/icons-material';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

const SHORT_NAME_ADDRESS_COMPONENT_TYPES = new Set([
  'street_number',
  'administrative_area_level_1',
  'postal_code'
]);

const ADDRESS_COMPONENT_TYPES_IN_FORM = [
  'location',
  'locality',
  'administrative_area_level_1',
  'postal_code',
  'country',
];

const MapComponent = ({ center, zoom, markerPosition, onMapClick }) => {
  const ref = useRef();

  React.useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      const map = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapId: 'DEMO_MAP_ID',
        fullscreenControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        zoomControl: true,
        maxZoom: 22
      });

      const marker = new window.google.maps.Marker({
        map,
        position: markerPosition || center,
      });

      map.addListener('click', (event) => {
        const clickedLatLng = event.latLng;
        marker.setPosition(clickedLatLng);
        onMapClick(clickedLatLng);
      });

      // Store map and marker for cleanup
      return () => {
        marker.setMap(null);
      };
    });
  }, [center, zoom, markerPosition, onMapClick]);

  return <div ref={ref} style={{ height: '400px', width: '100%' }} />;
};

const AddressSelection = () => {
  const [addressData, setAddressData] = useState({
    location: '',
    locality: '',
    administrative_area_level_1: '',
    postal_code: '',
    country: '',
    aptSuite: ''
  });

  const [mapCenter, setMapCenter] = useState({ lat: 37.4221, lng: -122.0841 });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const autocompleteRef = useRef(null);

  const getFormInputElement = useCallback((componentType) => {
    return document.getElementById(`${componentType}-input`);
  }, []);

  const fillInAddress = useCallback((place) => {
    const getComponentName = (componentType) => {
      for (const component of place.address_components || []) {
        if (component.types[0] === componentType) {
          return SHORT_NAME_ADDRESS_COMPONENT_TYPES.has(componentType)
            ? component.short_name
            : component.long_name;
        }
      }
      return '';
    };

    const getComponentText = (componentType) => {
      return (componentType === 'location')
        ? `${getComponentName('street_number')} ${getComponentName('route')}`.trim()
        : getComponentName(componentType);
    };

    const newAddressData = { ...addressData };
    for (const componentType of ADDRESS_COMPONENT_TYPES_IN_FORM) {
      newAddressData[componentType] = getComponentText(componentType);
    }

    setAddressData(newAddressData);
  }, [addressData]);

  const renderAddress = useCallback((place) => {
    if (place.geometry && place.geometry.location) {
      const location = place.geometry.location;
      setMapCenter({ lat: location.lat(), lng: location.lng() });
      setMarkerPosition({ lat: location.lat(), lng: location.lng() });
    } else {
      setMarkerPosition(null);
    }
  }, []);

  const initAutocomplete = useCallback(async () => {
    if (!window.google) return;

    const { Autocomplete } = await window.google.maps.importLibrary('places');

    const autocomplete = new Autocomplete(getFormInputElement('location'), {
      fields: ['address_components', 'geometry', 'name'],
      types: ['address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        setError(`No details available for input: '${place.name}'`);
        return;
      }
      setError('');
      renderAddress(place);
      fillInAddress(place);
    });

    autocompleteRef.current = autocomplete;
  }, [getFormInputElement, renderAddress, fillInAddress]);

  React.useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      initAutocomplete();
    }).catch((err) => {
      setError('Failed to load Google Maps. Please check your API key.');
      console.error('Google Maps loader error:', err);
    });
  }, [initAutocomplete]);

  const handleMapClick = useCallback((latLng) => {
    setMarkerPosition({ lat: latLng.lat(), lng: latLng.lng() });
    // Reverse geocoding could be added here to update address fields
  }, []);

  // Validation functions
  const validateField = (field, value) => {
    const errors = { ...fieldErrors };

    switch (field) {
      case 'location':
        if (!value.trim()) {
          errors.location = 'Address is required';
        } else {
          delete errors.location;
        }
        break;
      case 'locality':
        if (!value.trim()) {
          errors.locality = 'City is required';
        } else {
          delete errors.locality;
        }
        break;
      case 'administrative_area_level_1':
        if (!value.trim()) {
          errors.administrative_area_level_1 = 'State/Province is required';
        } else {
          delete errors.administrative_area_level_1;
        }
        break;
      case 'postal_code':
        if (!value.trim()) {
          errors.postal_code = 'Zip/Postal code is required';
        } else if (!/^\d{5,6}$/.test(value.replace(/\s/g, ''))) {
          errors.postal_code = 'Please enter a valid postal code';
        } else {
          delete errors.postal_code;
        }
        break;
      case 'country':
        if (!value.trim()) {
          errors.country = 'Country is required';
        } else {
          delete errors.country;
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForm = () => {
    const requiredFields = ['location', 'locality', 'administrative_area_level_1', 'postal_code', 'country'];
    let isValid = true;

    requiredFields.forEach(field => {
      if (!validateField(field, addressData[field])) {
        isValid = false;
      }
    });

    setIsFormValid(isValid);
    return isValid;
  };

  const handleInputChange = (field, value) => {
    setAddressData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (fieldErrors[field]) {
      validateField(field, value);
    }
  };

  const handleInputBlur = (field) => {
    validateField(field, addressData[field]);
  };

  const handleVisitTherapist = () => {
    if (validateForm()) {
      // Form is valid, proceed with therapist search/navigation
      console.log('Visit Therapist clicked with address:', addressData);
      // You can add navigation logic here, e.g.:
      // router.push('/view-all-therapist', { state: { addressData } });
      setError('');
    } else {
      setError('Please fill in all required fields correctly.');
    }
  };

  const handleCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ lat: latitude, lng: longitude });
        setMarkerPosition({ lat: latitude, lng: longitude });
        setLoading(false);

        // Reverse geocoding to fill address fields
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`)
          .then(response => response.json())
          .then(data => {
            if (data.results && data.results[0]) {
              // You could parse the address components here
              console.log('Reverse geocoding result:', data.results[0]);
            }
          })
          .catch(err => {
            console.error('Reverse geocoding error:', err);
          });
      },
      (error) => {
        setError('Unable to retrieve your location.');
        setLoading(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{
        p: 3,
        borderRadius: 3,
        border: '2px solid #e8f5e8',
        boxShadow: '0 10px 30px rgba(34, 135, 86, 0.15)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationOn sx={{ mr: 1, color: '#228756', fontSize: 28 }} />
          <Typography variant="h5" component="h2" sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #228756, #56ab2f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Address Selection
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Address Input */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="location-input"
              label="Address *"
              placeholder="Enter your address"
              value={addressData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              onBlur={() => handleInputBlur('location')}
              variant="outlined"
              error={!!fieldErrors.location}
              helperText={fieldErrors.location}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleCurrentLocation} disabled={loading}>
                    <MyLocation />
                  </IconButton>
                )
              }}
            />
          </Grid>

          {/* Apt/Suite */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Apt, Suite, etc (optional)"
              placeholder="Apartment, suite, unit, building, floor, etc."
              value={addressData.aptSuite}
              onChange={(e) => handleInputChange('aptSuite', e.target.value)}
              variant="outlined"
            />
          </Grid>

          {/* City */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="locality-input"
              label="City *"
              value={addressData.locality}
              onChange={(e) => handleInputChange('locality', e.target.value)}
              onBlur={() => handleInputBlur('locality')}
              variant="outlined"
              error={!!fieldErrors.locality}
              helperText={fieldErrors.locality}
            />
          </Grid>

          {/* State and Zip */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="administrative_area_level_1-input"
              label="State/Province *"
              value={addressData.administrative_area_level_1}
              onChange={(e) => handleInputChange('administrative_area_level_1', e.target.value)}
              onBlur={() => handleInputBlur('administrative_area_level_1')}
              variant="outlined"
              error={!!fieldErrors.administrative_area_level_1}
              helperText={fieldErrors.administrative_area_level_1}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="postal_code-input"
              label="Zip/Postal code *"
              value={addressData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              onBlur={() => handleInputBlur('postal_code')}
              variant="outlined"
              error={!!fieldErrors.postal_code}
              helperText={fieldErrors.postal_code}
            />
          </Grid>

          {/* Country */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="country-input"
              label="Country *"
              value={addressData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              onBlur={() => handleInputBlur('country')}
              variant="outlined"
              error={!!fieldErrors.country}
              helperText={fieldErrors.country}
            />
          </Grid>

          {/* Map */}
          <Grid item xs={12}>
            <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={Status}>
                <MapComponent
                  center={mapCenter}
                  zoom={15}
                  markerPosition={markerPosition}
                  onMapClick={handleMapClick}
                />
              </Wrapper>
            </Box>
          </Grid>

          {/* Visit Therapist Button */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleVisitTherapist}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #228756 0%, #56ab2f 100%)',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(34, 135, 86, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1a6b45 0%, #4a8b25 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(34, 135, 86, 0.4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Visit Therapist
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AddressSelection;