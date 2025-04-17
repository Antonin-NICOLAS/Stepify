import React from "react";
import Header from "./components/Header";

function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main className="main" id="main">
        {children}
      </main>
    </>
  );
}

export default MainLayout;