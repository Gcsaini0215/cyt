import Link from "next/link";

export default function BookBtn() {
  return (
    <Link
      className="rbt-btn btn-gradient book-btn"
      href="#"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <span>Book Now</span>
    </Link>
  );
}
