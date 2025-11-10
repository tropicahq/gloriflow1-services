import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [layout("routes/_layout.tsx", [
  index("routes/home.tsx"),
  route("api/auth/*", "routes/api/auth.ts"),
  route("api/webhook", "routes/api/webhook.ts"),
  route('payment-callback', 'routes/payment-callback.tsx'),
  route("paybill", "./routes/paybill/_layout.tsx", [
    route("airtime", "./routes/paybill/airtime.tsx"),
    route("internet", "./routes/paybill/databundle.tsx"),
  ]),
  route("login", "routes/login.tsx")
])] satisfies RouteConfig;
