import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
export default function Success() {
  return (
    <>
      <MyNavbar />
      <div className="bg-color-white rbt-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h2 className="title">
                  Profile has been submitted <br />
                  Please wait for approval
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
