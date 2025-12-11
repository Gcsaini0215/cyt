import React from 'react';
import { Helmet } from 'react-helmet-async';
import AddressSelection from '../components/home/address-selection';

const AddressSelectionPage = () => {
  return (
    <>
      <Helmet>
        <title>Address Selection - Choose Your Therapist</title>
        <meta
          name="description"
          content="Select your location to find therapists near you. Choose Your Therapist helps you connect with verified psychologists in your area."
        />
        <meta name="keywords" content="Address Selection, Location, Find Therapists, Choose Your Therapist" />
      </Helmet>
      <div style={{ padding: '20px 0', minHeight: '80vh' }}>
        <AddressSelection />
      </div>
    </>
  );
};

export default AddressSelectionPage;