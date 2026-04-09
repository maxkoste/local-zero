import React from "react";
import NavBar from '../components/nav-bar';
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <NavBar />
      <Outlet /> {/* Renders the child route */}
    </>
  );
}
