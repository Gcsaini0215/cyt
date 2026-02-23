import React from "react";


const appointments = [
  {
    id: "#Apt0001",
    name: "Adrian",
    image:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIANgBIAMBIgACEQEDEQH/xAAaAAADAQEBAQAAAAAAAAAAAAABAgMABAUG/9oACAEBAAAAAPALUuYTUlrZ4gtWbBa5qW53oqDebqPU6Ecz4HoiauYYI1K2OXOkfMNndn58lkRG3RhSkJginVSLszSPiat9mi6K+GbdSQWpSqM9T0rFwvj0o+Si00c5bZtt0pynB2dqozy8ndLBhB9GqtrW5m6ohSMzvZgrqnklszGU321ot1U5qySyjY7oeia0PJShWhW6JtdNTMiOmOYHUc2tPwN3xLlLc+R7hcVO2N9HHF2el/nF6umBcvxYUvp4Dah2cbDWZqL4q16Vol05SpabuFrrOJkVCtqV1PnxSlHn1T5hOhLar0aRBTYuXzu3zu6Gdk7I8igvYo2etGxTBc1+ufPT54+jxs56+OKalqrFnezUDgWSBfr6k5fnad3BRz1+WZ0Jq+A1S2a5bERr1egPievczNfq8ekql7siizbFrM4sJ7s7N8N27ld69fj0lXWqmFWr0tFulhmrmsx+E7FYq/X5NY0HSx2q12Z6NRmLEnH4Tq1Lc1erynVh06yszdFWYlyWJJx+I6aJaFurynDbpF1L3JclmZiSxx+I6rc1hTt8lgT1C6J2PmZiSxLE4n4q/XzbW6eEKX6FrR2Ysz7M2JY7b4+vRdpO8olTarkkks+xZydjm+X3T0g4ljtmOB2bZgC522x8g7Bnxxc4NscTjgSdjgD5BbbO+R2zbEnbZWYkjEqD44zu+xzbZiRsCTi4cnbY/wD/xAAYAQEBAQEBAAAAAAAAAAAAAAABAAIDBP/aAAoCAhADEAAAAM88Yxne9JkMGnAm6MmWqTv6ccsg6rWjJkZXLZzhys3btjmluyubGZoNG81mwzXftZyLpyBu5YTTNmCxDnXr745WXdNkMxVQSUGHG/X2zg5211FGM5ijUZqcONezrnmZN6tRZnOc8XOtFJW+mDu2YzrZUY1YrEQ4VTT3Rchm3UGdQWEcytu1bjMDk2Qay1iwzTam1NrARnWqBy4MaKZStzV158LGimKyzEmqhUbVcTVrCZy1Q0pVTFUevja5wE2WShssjJNX/8QAMhAAAgIBBAECBgECBgMBAAAAAQIAESEDEjFBURBhBBMiMnGBkTNyIEJic6GxNGOSwf/aAAgBAQABPwD7m4oQA2KSUx8KDPlAmySY6KoocGaug7Gxn2i6QdtlAEeYyFHIPMrMIEGw5JMBBI+m58w1TNwcCBaBzjqVXvYjBlIK0PaKuQx47lguU4viDSZQaN0OJ96XtFDFzaLoyydygHPQgP0LQyDGfUcbT5ubghBAJNcdVG1FcfbMsQxq/EXWqhVEdxQdgOSPBEOi23BJI6i1qiwxUgce8LA/dZB5EJGwi+bBgLKFG7HUZzqUPFwKDZYZEArLcHgwstLUTPBAi80RVQsz2Fo0OQYpurLbqzCqWrobzNQ6e4bQSPTIJl5i7QD1CQ3gxqxjkxWYEUSBFCM1xy90tRFCnKhjVTexNUDDopWmb2MbuFNVhpgBT4Ixct0bFgzYl4JhIU2tGFjZM3nihEbIAS76MwzEtdQMwauB/FRdQAAkkmai7gGFcdREsBmFrnBnzFUGbqANYPZzNRbIArnnyJk5ruoXJqwMQED6uPEH1EUB5uEFjdm/MW1OQMS95o4zN4TBOfIhUkkji8mOlCicxU7BHGbmnpI4QbwCSRH0dbSycpfMKryIZxNxrHcOqrcAbh3HUghl4MDXg4oY/MGs9VQg1yBYxNXU3uX4JM3vW3MxNpMF5FRaBFwWBYtdvG3gkxrZbIUGqF8wah32fpb/AIh+Yfp3YY89RGqhnBowaK2xsHHEDEsy7v11GRiQpMcjZs4zawjxD0JoizUuwL4EXuEOVsHAMBvuuvNRi/mIXWty7jeJ9oI4PcWg4JWwDkR33bQBQA4sw2LErEAzRmKoibANOx9w95sO0gUGvjogwaZ5xgfVHJatq4qAOATeJ8jVD7KsmqPUKOgIabcA9QMOTcs8iUGIrmXR8iDU27gACh4BiMhWnUY4sQtYFEDwZrLa2uTiDUCqBjmBkPPJ/YMO+w+0tV+5gC6ikMBuq4QB7xtjUbgVVo8ieSRxwIeBXJhBEWwhOMwuQrKRi81zcDg2SbJELXtNCxyR3AykuSvmqirlh15PUCkK1AV5iEKPqhrtbEKgj6QBF02s5rzPmKt/WPbufNR+FrOWjguS6mj2BFRgKosL+muoDrkKAvvVVgR0+ZlyAG+3OMTwYYc8eICQKlnsCVuBFQAFRgxcLQI5iagwANxvkRkY09AXyPeG12/SBmKW5IBzma5rVPFe0K5GbE2CbqKgS87mAZu5dm/MatgImn9tzUY5Hd/8TqwPEsgEwPkVCwraTwbE+ZjbzmajWBtGIrIRTbrilRakce82AOGWyHNX2s1F1jttyVrE09MAbiTGCKp+W5xg1AW66zNXXLbKFHP8GbmJUc1/EHHEbzYi4zuo9DzPmXyAKihd6ZFcx9QC1U9zSVDtNkE5vzCgIweZTpVKuRwIjFmN8HAUmbgTmMoBscDqahDbSB5h3bulm4hrNT5ikYs9kTcSTSc+8GqppTibwCKa5uAF7go6HMYoVJ3ZiueBc2lczB5iadmjRJ4BMAsZFVF0RzmocmlEC1+jEYgBbPNx2BssFFwqXLEUol1GPPiKDdt/EXUKqRsHM+rVNE4v8CX9WPtEsmAemODEcBQrcQaz87sVRmi25CDeO4VQMaJm2jzi4UAth4zCuecwsSCC14mAOJ81iACBUOpfQm8YsAxqrCRNNStMP4gQK9CCgMCavUAswtRAOaETU29d/uFzS0NvPMQVUH/7NxwL4lMx5m+12kRmvnEFE2Yc1GIHsfMUM+OBLA6uDPJH4hnYnFQxSbrPERQWAM+01yQcxXLc4AGb7m/6gBRmuDvHnb1CYAImjpujAKN1Ws2KOVFwADgVCbq+YgsCV9bSo5swOQCOjCxYZmnhhiPm/EGB6X5m5qpQB7mE7QOTMfzyIwOCzA+wh9hUEKggG4m0KFCrnvuMLFlDQuHmpXmcGHEBnYh24xfmAdiLS0ewf5hO8KbAPU5EE0nKNjifED6g/G4QCyAIBi4rUIBn05nXonMY2INtdTmxAAIKIxARVcxmxQi7ieB+TMQlDwKMxAWHU+Y5P24gBJssL9DxXcq+5RUkVCFxWZt9u5WFwKvMta6yeJtIKmmEAhFGA4EUtqApd1x7GBYa2UD4MWKCZq2qEiAYE4v0DVDvIsihBEsn9Yig/kStpNtUwDgwBSuSTNnhQB2WMTSWuRZ6E+VV3ftU+SxFqCRCCCQeb4MsCxD7RCy+x5EaiN191ABz1KAFmVzUF8wXQFRFBbiAfVR4MXnM5aHE0GKPuEUFjCgVTF4mnxNcXpg/6p4/Eb0SgQY7lzQlKMfcYFZrFAY/6ir/AKzNqgArVxQL8wLpG1LGfKAGa4OJ8lODgwaRBxqsJuYEVqkkdjM26msSXeh2WjaJUAh/fipxQIoyrFQARRz9N/lqgUnAg0jYApvPNCbGXDiql5gNMBX5hXsCvFmGCIjvVDF8mZBI8GIabIual5iAmAAKK8TXIGnXmLxDB3LuKnmADIoTUFEfiZFkzeaFyy3AxFbUyPo/cUa1YZRNmpydT/5FRtDTABFE97jZig8BaqOhbxZipZNxz8w2wzxc+TqbuLrqd1RvsVKxAu6AahYbWyRE0N52BwDyDVzW0GXG1SfA59BRK9iGqMRdxEC7FZjwi/SvuYDcySI+6hZJmlL958U1uF8QcGHuCAUsJBaaa/VZmqVsZlngWIAMk8z3q4i43GAcG/eEms5i5RsD2gfyIqadfSuT1cRAGPmUNwoMAZp0s1gjAEDM2FbBJX/kQ3fIPnEUksKXMQn5hXbg0TTVF1vmCrGDRvMfQpl2nnG7xNT4dtNs1R4rExzPh1O5T7ifGHaiqB9zX/EHUU0x/FTUM0hAv2iajb9RiByZVAzoiBajfZ+4CcG+oo3HN14EVFL4WhNWt5HgCCtrA9zA5EqzSibMW0skAGWQPzLbAvHtASrWp/UO56okHuBiBRgbgnmKTZmwDNXfE2FGtFsHrsTHIOICfp45ibGbB2tdiUIyK+CJtO39T4O90+MNOiXe1P8AuKNxUeTU4jVU0xBwD7ReTGoKvv6LdX5Mf7TFWwBFG1Yh4PiOLYsPQBScnE+k8fzxMnk36UQLzALzAhiAy/qzDpCibuKOjAIEIxeIyZYnAPOODNJCxC5NzS3B1QoLHfqSbH8T4Ij5q/u58bn4k+aWVOeqhFARBz+p/kb8NEEdfoXPpRGIfsPi4o4nRi8Jg3mPxjsT/KAeoEo/gCAWKiaSgi+xEVV+0AQIs+ULwYg5BBioBRBjaSGzUCV5gQjibDizRvAg0iDXmNp1XcVWHAxAihmYDJ59BK3Nc+BzqCvBnxJ3fE6xHG8z4Vb+K+GH/tWBQ2pqHwCf+ZrYZYhzH/pOfYxOZqH6RFFzmo9ha94orEYbUQebJmlnbjzNZQGA9hAtkQj7vzEHH5gF1UAMAgXNwJFSoBAJUqD/AA/uDgjufCUNZRHXbq6o8MZ8P/5Wh/urNCvma/8Atn/sTWywiAWY/wDRf+0xPumplRFURvu/Qj3sH986PsIeE/tmkPs/BmsLcxRlYRlhEHUTdVYg3TMzM+ZnzP3P36D0uX6X6clveaNh0I/Bmv8A19Q1yQYp26um3jUWaTFNTVocqRNU0xi8m/EP9MisUYn+XEcfT+4Cbj/d+hHFIP77gFq/4hFhf7JpgbU/ccEMbiEGr6Imws5PEANZlCVAD5lHzKPmAtATL9pu9pZ8Sz49LglwSzc0urE+JOdI+EI/gwnE08nceODNcEOfcCJybqD7T9MFgDJjcQcxvuH4j5WAfQ34i1jxticJHIt78xUe8jEVm7ly4KmIKmIK/wAF+t+l+gJc3ZszI28iqjL8zTvsVicAhhiKGGdMkRiSc84iVeeKm9QVXuo4KajiEhgaii7jVuH4h4x2JpsKirtJHiJZ4jaYfmBK4MCt7SjBcFwSvUSpUqD/AA5mkm6amMDgVNBxRB5JiqOdtN3ClgG4fh2djmh1F0WHMOiTnkw6DkZyRB8LqC58jUH8Q6GrjEOlq0KGRERwSaH4gWoFE2wA+Z9Us+JZn1QEwMZuM3GboGNy7lyx6XL9P3NIilFCzc1tHV1HtRggRPh6JYmHrGZdCbyDUDnq5vN8QOZY8S5Zl+mJjwJcoeBOOpfrftMeIKhIlwGAzEx6Zly5cAVcLLm4+JZhdlwu2bj5BIgPORMGuJuC8S74gJ8iBqJzLlyxA0uWRLMz59LgMsCbupk+t1Llyx59L9A0s+RNwB7m4TcfM5lY4gqX7zdCB+IMYv3uGxAw4liBhzd5m4Ey5c8XL5lwGbjM3BA0BxLn79L9D6UYLgQ8GFCBgm4AwNE9XLfP0iXgfSZkdQE1MjwJV1mV/Ms+Zu49syxN3kXAccQNxN3c3ZqFiRPmTeZvm4+Julky+YMwkiAWL9O+JuxLv0zM1dT/xAAkEQACAQQCAgIDAQAAAAAAAAAAARECECFBEjETUSCBAyIwYf/aAAgBAgEBPwAlmUkxVNuzOJ0akn2LO1JjSOP+Ee0ZVvoSTUKzUMdORKBSftPeCYJUj4qIEkxU0UuSU+hNjyQ1JOmhpi0Y9jbJiERLZxGoOLeGNNCip5Y4pagdNVT0JOlQI+htpSSmZF3IkR6RxyJHZnpD5SMaUz0ZZ0Qu7tSOlDlFLcxbpxdEDtggdod2MhPNmbGLq7ZMFVZzT2Z0yVtjuzdlkjKGLq+7Mbc4gmoVWjk0JyrKGh0QPoXVnZ/BuLuOzF1arpmrM3Z/B3akSOKKaUrVdGjY+zdmM0OqB5+CZJJIxPBsfd2Mdd5JJJE7SOpTkrrWhflqR5KzzVo89Xo87ejySczmjmvRzORyOSJQqzmhpkEDVo/lm8jY+0O0K0IgSQ0iMDURfdkf/8QAIREAAwACAgIDAQEAAAAAAAAAAAERECAxQRIhMFFhAnH/2gAIAQMBAT8AG2KouGSnB/pyR4mLr/XpnelhURCPbxWUqxcVfYxP2dkIRkaIsJ0eGISw+CE/DxR6y6PgbH7ONU2hEw79i50Y/wBxB6sQnDs5Fyd6clLcQhwSiX5noYkLRE0aJSCIiHUHhDGdC1WIQWGdkFh7QmzeOhad/Gx84WIL5OXlJEX2eJ4kIQgkNYmywyl18i4ulK4UuKUpSsTLi6//2Q==",
    badge: null,
    date: "11 Nov 2024 10.45 AM",
    types: ["General Visit", "Video Call"],
    email: "adrian@example.com",
    phone: "+1 504 368 6874"
  },
  {
    id: "#Apt0002",
    name: "Kelly",
    image:
      "data:image/jpeg;base64,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",
    badge: "New",
    date: "05 Nov 2024 11.50 AM",
    types: ["General Visit", "Audio Call"],
    email: "kelly@example.com",
    phone: "+1 832 891 8403"
  }
  // Add more appointments as needed
];

export default function AppointmentCancelled() {
  return (
    <>
      <div
        className="tab-pane fade show active"
        id="pills-upcoming"
        role="tabpanel"
        aria-labelledby="pills-upcoming-tab"
      >
        {appointments.map((appointment, index) => (
          <div className="appointment-wrap" key={index}>
            <ul>
              <li>
                <div className="patinet-information">
                  <a href="doctor-upcoming-appointment.html">
                    <img src={appointment.image} alt="User Image" />
                  </a>
                  <div className="patient-info">
                    <p>{appointment.id}</p>
                    <h6>
                      <a href="doctor-upcoming-appointment.html">
                        {appointment.name}
                      </a>
                      {appointment.badge && (
                        <span className="badge new-tag">
                          {appointment.badge}
                        </span>
                      )}
                    </h6>
                  </div>
                </div>
              </li>
              <li className="appointment-info">
                <p>
                  <i className="fa-solid fa-clock"></i> {appointment.date}
                  <ul className="d-flex apponitment-types">
                    {appointment.types.map((type, idx) => (
                      <li key={idx}>{type}</li>
                    ))}
                  </ul>
                </p>
              </li>
              <li className="appointment-start">
                <button className="start-link">View Details</button>
              </li>
            </ul>
          </div>
        ))}
        <div class="col-lg-12" style={{ marginTop: "20px" }}>
          <nav>
            <ul class="rbt-pagination justify-content-center">
              <li>
                <a aria-label="Previous" href="/elements/style-guide#">
                  <i class="feather-chevron-left"></i>
                </a>
              </li>
              <li>
                <a href="/elements/style-guide#">1</a>
              </li>
              <li class="active">
                <a href="/elements/style-guide#">2</a>
              </li>
              <li>
                <a href="/elements/style-guide#">3</a>
              </li>
              <li>
                <a aria-label="Next" href="/elements/style-guide#">
                  <i class="feather-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
