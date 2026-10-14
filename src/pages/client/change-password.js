import { useEffect } from "react";
import { useRouter } from "next/router";

// Login is by email OTP — there's no password to change. Old links land on Profile.
export default function ChangeMyPassword() {
  const router = useRouter();
  useEffect(() => { router.replace("/my-settings"); }, [router]);
  return null;
}
