import React from "react";

export default function RecentInvoices({ data }) {
  const invoices = data || [];

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mt--40">
      <div className="content">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Recent Invoices</h4>
        </div>
        <div className="rbt-dashboard-table table-responsive mobile-table-750">
          <table className="rbt-table table table-borderless">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Client Name</th>
                <th>Booking Date</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <th>#{invoice.invoice_id || invoice.id}</th>
                    <td>{invoice.client_name}</td>
                    <td>{invoice.booking_date}</td>
                    <td>{invoice.amount} INR</td>
                    <td>
                      <a className="rbt-btn btn-gradient btn-sm" href="#">
                        Download
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    No recent invoices
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {invoices.length > 0 && (
            <div className="load-more-btn text-center">
              <a className="rbt-btn-link" href="#">
                Browse All Invoices<i className="feather-arrow-right"></i>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
