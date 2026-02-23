import React from "react";


export default function Notification() {
  return (
    <div className="col-xl-15">
      <div className="dashboard-card">
        <div className="dashboard-card-head">
          <div className="header-title">
            <h5>Notifications</h5>
          </div>
        </div>
        <div className="dashboard-card-body">
          <div className="table-responsive">
            <table className="table">
              <tbody>
                <tr>
                  <td>
                    <div className="table-noti-info">
                      <div className="table-noti-icon color-violet">
                        <i className="fa-solid fa-bell"></i>
                      </div>
                      <div className="table-noti-message">
                        <h6>
                          <a href="#">
                            Booking Confirmed on <span> 21 Mar 2024 </span>{" "}
                            10:30 AM
                          </a>
                        </h6>
                        <span className="message-time">Just Now</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="table-noti-info">
                      <div className="table-noti-icon color-blue">
                        <i className="fa-solid fa-star"></i>
                      </div>
                      <div className="table-noti-message">
                        <h6>
                          <a href="#">
                            You have a <span> New </span> Review for your
                            Appointment{" "}
                          </a>
                        </h6>
                        <span className="message-time">5 Days ago</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="table-noti-info">
                      <div className="table-noti-icon color-red">
                        <i className="fa-solid fa-calendar-check"></i>
                      </div>
                      <div className="table-noti-message">
                        <h6>
                          <a href="#">
                            You have Appointment with <span> Ahmed </span> by
                            01:20 PM{" "}
                          </a>
                        </h6>
                        <span className="message-time">12:55 PM</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="table-noti-info">
                      <div className="table-noti-icon color-yellow">
                        <i className="fa-solid fa-money-bill-1-wave"></i>
                      </div>
                      <div className="table-noti-message">
                        <h6>
                          <a href="#">
                            Sent an amount of <span> $200 </span> for an
                            Appointment by 01:20 PM{" "}
                          </a>
                        </h6>
                        <span className="message-time">2 Days ago</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="table-noti-info">
                      <div className="table-noti-icon color-blue">
                        <i className="fa-solid fa-star"></i>
                      </div>
                      <div className="table-noti-message">
                        <h6>
                          <a href="#">
                            You have a <span> New </span> Review for your
                            Appointment{" "}
                          </a>
                        </h6>
                        <span className="message-time">5 Days ago</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
