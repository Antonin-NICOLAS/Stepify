import React from "react";
import GlobalLoader from '../utils/GlobalLoader.jsx';
import { Outlet } from "react-router-dom";

function LoaderLayout() {
  return (
    <>
      <GlobalLoader />
      <main className="loading-content">
        <Outlet />
      </main>
    </>
  );
}

export default LoaderLayout;