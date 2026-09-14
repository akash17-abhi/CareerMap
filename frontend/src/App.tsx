import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import { CareerMapSessionProvider } from "@/context/CareerMapSessionContext";

import AnalyzerPage from "@/features/analyzer/AnalyzerPage";
import HomePage from "@/pages/HomePage";
import RoadmapPage from "@/features/roadmap/RoadmapPage";

export default function App() {
  return (
    <BrowserRouter>
      <CareerMapSessionProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyzer" element={<AnalyzerPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Route>
        </Routes>
      </CareerMapSessionProvider>
    </BrowserRouter>
  );
}
