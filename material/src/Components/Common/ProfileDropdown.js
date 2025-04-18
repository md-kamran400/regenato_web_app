import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Button,
} from "reactstrap";
import { FaUser } from "react-icons/fa";

const ProfileDropdown = () => {
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || null;

  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login page
    navigate("/login");
    window.location.reload(); // Refresh to update the UI
  };

  // If no user is logged in, show Login button
  if (!user) {
    return (
      <div className="ms-sm-3 header-item topbar-user">
        <Link to="/login">
          <Button color="primary" className="btn-sm">
            Login
          </Button>
        </Link>
      </div>
    );
  }

  // If user is logged in, show profile dropdown
  return (
    <Dropdown
      isOpen={isProfileDropdown}
      toggle={toggleProfileDropdown}
      className="ms-sm-3 header-item topbar-user"
    >
      <DropdownToggle tag="button" type="button" className="btn shadow-none">
        <span className="d-flex align-items-center">
          <FaUser size={20} color="#333" />
          <span className="text-start ms-xl-2">
            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
              {user.name || "User"}
            </span>
            <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
              {user.role || "Role"}
            </span>
          </span>
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end">
        <DropdownItem onClick={handleLogout}>
          <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
          <span className="align-middle" data-key="t-logout">
            Logout
          </span>
        </DropdownItem>
        <DropdownItem href="/regenato-user-management">
          <i className="ri-settings-5-line text-muted fs-16 align-middle me-1"></i>{" "}
          <span className="align-middle" data-key="t-logout">
            Settings
          </span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
