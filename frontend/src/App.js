import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "./components/Login/Login";
import WrongPath from "./components/WrongPath/WrongPath";
import HomePage from "./components/HomePage/HomePage";
import ManageProjects from "./components/ManageProjects/ManageProjects";
import Sidebar from "./components/Sidebar/Sidebar";
import Projects from "./components/Projects/Projects";
import Templates from "./components/Templates/Templates";
import CreateProject from "./components/CreateProject/CreateProject";
import CreateUser from "./components/CreateUser/CreateUser";
import ShowAllUsers from "./components/ShowAllUsers/ShowAllUsers";
import HeaderMenu from "./components/HeaderMenu/HeaderMenu";
import ProjectPage from "./components/ProjectPage/ProjectPage";
import OverviewProjects from "./components/OverviewProjects/OverviewProjects";
import SystemControl from "./components/SystemControl/SystemControl";
import Submissions from "./components/Submissions/Submissions";
import MoreInformation from "./components/MoreInformation/MoreInformation";
import CheckSubmissions from "./components/CheckSubmissions/CheckSubmissions";
import GradeSubmission from "./components/GradeSubmission/GradeSubmission";
import UploadSubmissions from "./components/UploadSubmissions/UploadSubmissions";
import Notifications from "./components/Notifications/Notifications";
import SubmissionsStatus from "./components/SubmissionsStatus/SubmissionsStatus";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import DeleteAll from "./components/DeleteAll/DeleteAll";
import Groups from "./components/Groups/Groups";

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

const MainLayout = () => {
  const location = useLocation();
  const noSidebarRoutes = ["/login", "/", "*"];
  const shouldDisplaySidebar = !noSidebarRoutes.includes(location.pathname);

  useEffect(() => {
    const routeTitles = {
      "/profile/:userId": "פרופיל",
      "/home": "דף הבית",
      "/projects": "פרויקטים",
      "/project/:projectID": "דף פרויקט",
      "/templates": "תבניות",
      "/my-submissions": "הגשות שלי",
      "/create-project": "יצירת פרויקט",
      "/list-projects": "ניהול פרויקטים",
      "/create-user": "יצירת משתמש",
      "/display-users": "הצגת משתמשים",
      "/overview-projects": "סקירת פרויקטים",
      "/groups": "קבוצות",
      "/submissions": "ניהול הגשות",
      "/check-submissions": "בדיקת הגשות",
      "/submission-status": "סטטוס הגשות",
      "/grade-submission/:submissionId": "הערכת הגשה",
      "/more-information": "מידע נוסף",
      "/system": "בקרת מערכת",
      "/delete-all": "מחיקת הכל",
      "/notifications": "התראות",
    };

    const currentPath = Object.keys(routeTitles).find((path) =>
      new RegExp(`^${path.replace(/:\w+/g, "\\w+")}$`).test(location.pathname),
    );

    document.title = `ניהול פרויקטים | ${routeTitles[currentPath] || "כניסה"}`;
  }, [location.pathname]);

  return (
    <>
      {/* Display the sidebar only if the route is not in noSidebarRoutes */}
      {shouldDisplaySidebar && <Sidebar />}
      {/* Render content-container only when the sidebar is visible */}
      {shouldDisplaySidebar ? (
        <div className="content-container">
          <HeaderMenu />
          {/* Render the routes */}
          <div className="main-content">
            <Routes>
              {/* Protected Routes */}
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute privileges={["student", "advisor", "judge", "coordinator"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute privileges={["student", "advisor", "judge", "coordinator"]}>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute privileges={["student", "advisor", "judge", "coordinator"]}>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              {/* TODO privileges */}
              <Route path="/project/:projectID" element={<ProjectPage />} />
              <Route
                path="/templates"
                element={
                  <ProtectedRoute privileges={["student", "advisor", "judge", "coordinator"]}>
                    <Templates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-submissions"
                element={
                  <ProtectedRoute privileges={["student"]}>
                    <UploadSubmissions />
                  </ProtectedRoute>
                }
              />

              {/* Development routes */}
              <Route
                path="/create-project"
                element={
                  <ProtectedRoute privileges={["advisor", "coordinator"]}>
                    <CreateProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/list-projects"
                element={
                  <ProtectedRoute privileges={["advisor"]}>
                    <ManageProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-user"
                element={
                  <ProtectedRoute privileges={["coordinator"]}>
                    <CreateUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/display-users"
                element={
                  <ProtectedRoute privileges={["coordinator"]}>
                    <ShowAllUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/overview-projects"
                element={
                  <ProtectedRoute privileges={["coordinator"]}>
                    <OverviewProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups"
                element={
                  <ProtectedRoute privileges={["coordinator"]}>
                    <Groups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submissions"
                element={
                  <ProtectedRoute privileges={["coordinator"]}>
                    <Submissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/check-submissions"
                element={
                  <ProtectedRoute privileges={["judge"]}>
                    <CheckSubmissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submission-status"
                element={
                  <ProtectedRoute privileges={["advisor"]}>
                    <SubmissionsStatus />
                  </ProtectedRoute>
                }
              />
              {/* TODO privileges */}
              <Route
                path="/grade-submission/:submissionId"
                element={
                  <ProtectedRoute privileges={["judge"]}>
                    <GradeSubmission />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/more-information"
                element={
                  <ProtectedRoute privileges={["student", "advisor", "judge", "coordinator"]}>
                    <MoreInformation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system"
                element={
                  <ProtectedRoute privileges={["coordinator"]}>
                    <SystemControl />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delete-all"
                element={
                  <ProtectedRoute privileges={["coordinator"]}>
                    <DeleteAll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute privileges={["student", "advisor", "judge", "coordinator"]}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={
                  <ProtectedRoute privileges={["student", "advisor", "judge", "coordinator"]}>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              {/* Development route */}
            </Routes>
          </div>
        </div>
      ) : (
        // Render routes without the sidebar or content container
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<WrongPath />} />
        </Routes>
      )}
    </>
  );
};

export default App;
