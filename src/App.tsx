import React from "react";
import { AppProvider, useAppContext } from "./context/AppContext";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { TableView } from "./components/TableView";
import { CalendarView } from "./components/CalendarView";

const AppContent: React.FC = () => {
  const { activeView } = useAppContext();

  return (
    <>
      <Navigation />
      <main className="main-content">
        <Dashboard />
        {activeView === "TABLE" ? <TableView /> : <CalendarView />}
      </main>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
