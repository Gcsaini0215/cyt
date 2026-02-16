import CreateCoupan from "../../components/therapists/coupans/create";
import MainLayout from "../../components/therapists/main-layout";

export default function CreateCoupanPage() {
  return (
    <MainLayout>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Create Coupan</h4>
          </div>
          <CreateCoupan />
        </div>
      </div>
    </MainLayout>
  );
}
