import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import ServiceNew from "../components/services/SerivceNew";
export default function SerivcePage() {
  return (
    <div id="__next">
      <MyNavbar />
      <ServiceNew/>
      <NewsLetter />
      <Footer />
    </div>
  );
}
