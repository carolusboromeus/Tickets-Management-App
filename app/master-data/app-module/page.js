import Layout from "./home";

export const metadata = {
    title: "App Module List | Tickets Management",
    description: "Ticket management is a work management tool that empowers teams to manage, report issues productively and organized.",
};

export default function Home() {
    return (
        <div>
            {<Layout/>}
        </div>
    );
}