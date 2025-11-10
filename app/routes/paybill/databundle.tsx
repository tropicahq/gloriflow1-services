import type { Route } from "./+types/databundle";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Gloriflow1 Services | Bill Payment Internet" },
    // { name: "description", content: "Welcome to React Router!" },
  ];
}
const DataBill = () => {
  return (
    <main><h1>Data</h1></main>
  )
}

export default DataBill
