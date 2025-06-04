import React from "react";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <>
      <Header />
      <main className="main" id="main">
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
