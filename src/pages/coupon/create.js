// Coupons are created in a pop-up on /coupons now — keep old links working.
export async function getServerSideProps() {
  return { redirect: { destination: "/coupons?new=1", permanent: false } };
}

export default function CreateCouponRedirect() {
  return null;
}
