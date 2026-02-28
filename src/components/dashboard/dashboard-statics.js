export default function DashboardStatics({ data }) {
    return <div className="row">
        <div className="col-lg-4 col-md-3 col-md-3 col-sm-12">
            <div className="rbt-performance-feature-list">
                <div className="rbt-performance-feature">
                    <span className="rbt-feature-score">{(data && data.bookings) || '00'}</span>
                    <div className="rbt-separator"></div>
                    <span className="rbt-feature-text">Therapists</span>
                </div>
            </div>
        </div>
        <div className="col-lg-4 col-md-3 col-md-3 col-sm-12">
            <div className="rbt-performance-feature-list">
                <div className="rbt-performance-feature">
                    <span className="rbt-feature-score">{(data && data.events) || '00'}</span>
                    <div className="rbt-separator"></div>
                    <span className="rbt-feature-text">Events</span>
                </div>
            </div>
        </div>
        <div className="col-lg-4 col-md-3 col-md-3 col-sm-12">
            <div className="rbt-performance-feature-list">
                <div className="rbt-performance-feature">
                    <span className="rbt-feature-score">{(data && data.appointments) || '00'}</span>
                    <div className="rbt-separator"></div>
                    <span className="rbt-feature-text">Appointments</span>
                </div>
            </div>
        </div>
    </div>
}

