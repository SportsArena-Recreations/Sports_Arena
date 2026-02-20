import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Index from "./pages/Index";
import Facilities from "./pages/Facilities";
import FacilityDetail from "./pages/FacilityDetail";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageFacilities from "./pages/admin/ManageFacilities";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageTournaments from "./pages/admin/ManageTournaments";
import ManageTeams from "./pages/admin/ManageTeams";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<Index />} />

          {/* Public routes with Navbar */}
          <Route element={<PublicLayout />}>
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/facilities/:id" element={<FacilityDetail />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="facilities" element={<ManageFacilities />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="tournaments" element={<ManageTournaments />} />
            <Route path="teams" element={<ManageTeams />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
