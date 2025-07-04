import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";

import SignInPage from "./components/Login";
import DashboardLayoutSlots from "./components/main";
import QRScannerDashboard from "./components/scanner";
import ParticipantIDGenerator from "./components/PariticipantId";
import ParticipantCertificateGenerator from "./components/certificategenerator";
import { isTokenValid } from "./utils/tokenUtils"; // import utility

function AnimatedRoutes() {
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const isValid = token && isTokenValid(token);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageWrapper><SignInPage /></PageWrapper>} />
       <Route 
        path="/id" 
        element={ <ParticipantIDGenerator /> }/>
      <Route 
        path="/scanner" 
        element={ <QRScannerDashboard /> }/>
             <Route 
        path="/certificate-of-appearance" 
        element={ <ParticipantCertificateGenerator /> }/>
      <Route 
        path="/dashboard/*" 
        element={isValid ? <DashboardLayoutSlots /> : <Navigate to="/" />} 
      />
    </Routes>
  );
}

function PageWrapper({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
