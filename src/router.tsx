import { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router"
import { AppLayout } from "@/components/layout/app-layout"

const Dashboard = lazy(() => import("@/pages/dashboard"))
const CustomerList = lazy(() => import("@/pages/customers/customer-list"))
const CustomerDetail = lazy(() => import("@/pages/customers/customer-detail"))
const CustomerNew = lazy(() => import("@/pages/customers/customer-new"))
const RewardsList = lazy(() => import("@/pages/rewards/rewards-list"))
const CampaignList = lazy(() => import("@/pages/campaigns/campaign-list"))
const CampaignNew = lazy(() => import("@/pages/campaigns/campaign-new"))
const Settings = lazy(() => import("@/pages/settings"))

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <LazyPage>
            <Dashboard />
          </LazyPage>
        ),
      },
      {
        path: "customers",
        element: (
          <LazyPage>
            <CustomerList />
          </LazyPage>
        ),
      },
      {
        path: "customers/new",
        element: (
          <LazyPage>
            <CustomerNew />
          </LazyPage>
        ),
      },
      {
        path: "customers/:id",
        element: (
          <LazyPage>
            <CustomerDetail />
          </LazyPage>
        ),
      },
      {
        path: "rewards",
        element: (
          <LazyPage>
            <RewardsList />
          </LazyPage>
        ),
      },
      {
        path: "campaigns",
        element: (
          <LazyPage>
            <CampaignList />
          </LazyPage>
        ),
      },
      {
        path: "campaigns/new",
        element: (
          <LazyPage>
            <CampaignNew />
          </LazyPage>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyPage>
            <Settings />
          </LazyPage>
        ),
      },
    ],
  },
])
