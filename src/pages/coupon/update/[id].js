// Coupons are edited in a pop-up on /coupons now — keep old links working.
export async function getServerSideProps({ params }) {
  return { redirect: { destination: `/coupons?edit=${encodeURIComponent(params.id)}`, permanent: false } };
}

export default function UpdateCouponRedirect() {
  return null;
}
