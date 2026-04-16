import { Suspense } from "react";
import DashboardLinkClient from "../../components/DashboardLinkClient";

export default function DashboardLinkPage() {
  return (
    <Suspense fallback={null}>
      <DashboardLinkClient />
    </Suspense>
  );
}
