import React from 'react';
import Head from "next/head";
import dynamic from 'next/dynamic';

const AddressSelection = dynamic(() => import('../components/home/address-selection'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', minHeight: '80vh', textAlign: 'center' }}>Loading...</div>
});

const AddressSelectionPage = () => {
  return (
    <>
      <Head>
        <title>Address Selection - Choose Your Therapist</title>
        <meta
          name="description"
          content="Select your location to find therapists near you. Choose Your Therapist helps you connect with verified psychologists in your area."
        />
        <meta name="keywords" content="Address Selection, Location, Find Therapists, Choose Your Therapist" />
      </Head>
      <div style={{ padding: '20px 0', minHeight: '80vh' }}>
        <AddressSelection />
      </div>
    </>
  );
};

export default AddressSelectionPage;