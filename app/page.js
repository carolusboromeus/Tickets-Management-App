// import Image from "next/image";
import Layout from "./mainPage";

export const metadata = {
  title: "Ticket Management",
  description: "Ticket management is a work management tool that empowers teams to manage, report issues productively and organized.",
};

export default function Home() {
  return (
    <div>
      <Layout/>
    </div>
  );
}
