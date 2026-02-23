import Link from "next/link";

export default function OutlineBtn(props) {
  return (
    <Link className="out-btn out-btn-border" href="#">
      {props.title}
    </Link>
  );
}
