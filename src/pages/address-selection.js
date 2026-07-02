import React from 'react';
import Head from "next/head";
import dynamic from 'next/dynamic';

const AddressSelection = dynamic(
  () => import('../components/home/address-selection').catch(() => () => null),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: '20px', minHeight: '80vh', textAlign: 'center', paddingTop: '20vh', color: '#94a3b8' }}>
        Loading map...
      </div>
    ),
  }
);

export default function AddressSelectionPage() {
  return (
    <>
      <Head>
        <title>Address Selection - Choose Your Therapist</title>
        <meta name="description" content="Select your location to find therapists near you." />
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{ padding: '20px 0', minHeight: '80vh' }}>
        <AddressSelection />
      </div>
    </>
  );
}
