import Link from "next/link";

// h1: pass true on pages that have no other <h1> (the breadcrumb title is then the page heading)
export default function PageBreadCrumb({ title = "", linkTitle = "", h1 = false }) {
    const H = h1 ? "h1" : "h2";
    return <div className="rbt-breadcrumb-default ptb--100 ptb_md--50 ptb_sm--30 bg-gradient-1">
        <div className="container">
            <div className="row mt--60">
                <div className="col-lg-12">
                    <div className="breadcrumb-inner text-center">
                        <H className="title">{title}</H>
                        <ul className="page-list mb--20">
                            <li className="rbt-breadcrumb-item">
                                <Link href="/">Home</Link>
                            </li>
                            <li>
                                <div className="icon-right">
                                    <i className="feather-chevron-right"></i>
                                </div>
                            </li>
                            <li className="rbt-breadcrumb-item active">{linkTitle}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
}