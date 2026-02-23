

export default function AppointmentTabHead({ setActiveTab }) {
  return (
    <div className="appointment-tab-head">
      <div className="appointment-tabs">
        <ul className="nav nav-pills inner-tab" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="pills-upcoming-tab"
              type="button"
            >
              Upcoming<span>00</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="pills-cancel-tab"
              type="button"
            >
              Cancelled<span>00</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="pills-complete-tab"
              type="button"
            >
              Completed<span>00</span>
            </button>
          </li>
          <li className="nav-item" role="presentation"> <div className="position-relative daterange-wraper me-2">
          <div className="input-groupicon calender-input" >
            <input
              type="text"
              className="form-control date-range bookingrange"
              placeholder="From Date - To Date"
              style={{height:36}}
            />
          </div>
          <i className="fa-solid fa-calendar-days"></i>
        </div></li>
        <li className="nav-item" role="presentation"> 
           <div className="form-sorts dropdown">
          <button
            className="dropdown-toggle"
            id="table-filter"
            style={{ border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-filter me-2"></i>Filter By
          </button>
          <div className="filter-dropdown-menu">
            <div className="filter-set-view">
              <div className="accordion" id="accordionExample">
                <div className="filter-set-content">  
                   <div className="filter-set-content-head">
                    <span style={{fontSize:"15px",color:"black",paddingLeft:"12px"}}>
                      Appointment Type
                    </span>
                  </div>              
                  <div
                    className="filter-set-contents accordion-collapse collapse show"
                    id="collapseOne"
                    data-bs-parent="#accordionExample"
                  >
                    <ul>
                      <li>
                        <div className="filter-checks">
                          <label className="checkboxs">
                            <input type="checkbox" />
                            <span className="checkmarks"></span>
                            <span className="check-title">Audio</span>
                          </label>
                        </div>
                      </li>
                      <li>
                        <div className="filter-checks">
                          <label className="checkboxs">
                            <input type="checkbox" />
                            <span className="checkmarks"></span>
                            <span className="check-title">Video</span>
                          </label>
                        </div>
                      </li>
                      <li>
                        <div className="filter-checks">
                          <label className="checkboxs">
                            <input type="checkbox" />
                            <span className="checkmarks"></span>
                            <span className="check-title">In-person</span>
                          </label>
                        </div>
                      </li>
                     
                    </ul>
                  </div>
                </div>
                <div className="filter-set-content">
                  <div className="filter-set-content-head">
                    <span style={{fontSize:"15px",color:"black",paddingLeft:"12px"}}>
                      Status
                    </span>
                  </div>
                  <div
                    className="filter-set-contents accordion-collapse collapse show"
                    id="collapseThree"
                    data-bs-parent="#accordionExample"
                  >
                    <ul>
                      
                      <li>
                        <div className="filter-checks">
                          <label className="checkboxs">
                            <input type="checkbox" />
                            <span className="checkmarks"></span>
                            <span className="check-title">Upcoming</span>
                          </label>
                        </div>
                      </li>
                      <li>
                        <div className="filter-checks">
                          <label className="checkboxs">
                            <input type="checkbox" />
                            <span className="checkmarks"></span>
                            <span className="check-title">Completed</span>
                          </label>
                        </div>
                      </li>
                      <li>
                        <div className="filter-checks">
                          <label className="checkboxs">
                            <input type="checkbox" />
                            <span className="checkmarks"></span>
                            <span className="check-title">Cancelled</span>
                          </label>
                        </div>
                      </li>
                      
                    </ul>
                  </div>
                </div>
              </div>
              <div className="filter-reset-btns">
                <a href="appointments.html" className="btn btn-light">
                  Reset
                </a>
                <a href="appointments.html" className="btn btn-primary">
                  Filter Now
                </a>
              </div>
            </div>
          </div>
        </div>
          </li>
        </ul>
      </div>
     
    </div>
  );
}
