export default function CreateTable(props) {
  return (
    <div className="row gy-5">
      <div className="col-lg-12">
        <div className="rbt-dashboard-table table-responsive mobile-table-750">
          <table className="rbt-table table table-borderless">
            <thead>
              <tr>
                {props.columns.map((column) => {
                  return <th key={column}>{column}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {props.children}
            </tbody>
          </table>
        </div>
        {/* <div className="load-more-btn text-center">
          <Link className="rbt-btn-link" href="#">
            Browse All Course
            <i className="feather-arrow-right"></i>
          </Link>
        </div> */}
      </div>
    </div>
  );
}
