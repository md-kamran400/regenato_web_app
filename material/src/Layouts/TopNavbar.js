import React from "react";
import navdata from "./LayoutMenuData"; // Assuming navdata is in the same folder

const TopNavbar = () => {
  const menuItems = navdata()[0].subItems;

  const navbarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    padding: "10px 20px",
    color: "#fff",
  };

  const navItemStyle = {
    display: "flex",
    alignItems: "center",
    color: "#fff",
    textDecoration: "none",
    padding: "10px",
    margin: "0 10px",
    fontSize: "16px",
  };

  const iconStyle = {
    marginRight: "8px",
  };

  const navContainerStyle = {
    display: "flex",
    listStyleType: "none",
    margin: 0,
    padding: 0,
  };

  return (
    <nav style={navbarStyle}>
      <div style={{display: "flex", margin: "auto"}}>
        <p>Manu data </p>
        <p>Manu data </p>
        <p>Manu data </p>
        <p>Manu data </p>
        <p>Manu data </p>
        <p>Manu data </p>
        <p>Manu data </p>
        <p>Manu data </p>
        <p>Manu data </p>
        <p>Manu data </p>
      </div>
    </nav>
  );
};

export default TopNavbar;
