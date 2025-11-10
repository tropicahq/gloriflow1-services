import type { Route } from "./+types/home";
import { Link } from "react-router";
import { BarChart, Phone } from "lucide-react";
import { authMiddleware } from "~/middleware/auth";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Gloriflow1 Services | Welcome" },
  ];
}

export const middleware: Array<Route.MiddlewareFunction> = [
  // @ts-ignore
  authMiddleware
]



export const loader = async ({ request }: Route.LoaderArgs) => {
  return null
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (

    <main className="flex grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        {/* <h1>Hello world with {loaderData.version}</h1> </main> */}
        <div className="text-center mb-12">
          <h2 className="lg:text-4xl text-3xl font-bold mb-4 text-gray-900">What would you like to do today?</h2>
          <p className="text-gray-500 dark:text-gray-400">Choose an option to get started.</p>
        </div>
        {/**/}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <Link to={"/paybill/airtime"} className="flex flex-col items-center justify-center p-7 bg-card dark:bg-slate-800/50 rounded-sm shadow-sm hover:shadow-md transition-shadow border border-border">
            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-primary/10 rounded-full text-primary">
              {/* <span className="material-symbols-outlined text-4xl">phone_iphone</span> */}
              <Phone className="text-4xl" />
            </div>
            <p className="font-semibold text-lg">Purchase Airtime</p>
          </Link>
          <Link to={"/paybill/internet"} className="flex flex-col items-center justify-center p-7 bg-card dark:bg-slate-800/50 rounded-sm shadow-sm hover:shadow-md transition-shadow border border-border">
            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-primary/10 rounded-full text-primary">
              {/* <span className="material-symbols-outlined text-4xl">signal_cellular_alt</span> */}
              <BarChart className="text-4xl" />
            </div>
            <p className="font-semibold text-lg">Purchase Data</p>
          </Link>
        </div>
      </div>
    </main>

  );
}
