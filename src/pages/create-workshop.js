import MainLayout from "../components/therapists/main-layout";
import dynamic from "next/dynamic";

const CreateWorkshop = dynamic(
  () => import("../components/therapists/workshops/create-workshop"),
  { ssr: false }
);

export default function CreateWorkshopPage() {
  return (
    <MainLayout>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Create Workshops</h4>
          </div>
          <CreateWorkshop />
        </div>
      </div>
    </MainLayout>
  );
}
