import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { FaUser } from "react-icons/fa";

//import images
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import { createSelector } from "reselect";

const ProfileDropdown = () => {
  // const profiledropdownData = createSelector(
  //   (state) => state.Profile,
  //   (user) => user.user
  // );
  // Inside your component
  // const user = useSelector(profiledropdownData);

  // const [userName, setUserName] = useState("Admin");

  // useEffect(() => {
  //   if (sessionStorage.getItem("authUser")) {
  //     const obj = JSON.parse(sessionStorage.getItem("authUser"));
  //     setUserName(
  //       process.env.REACT_APP_DEFAULTAUTH === "fake"
  //         ? obj.username === undefined
  //           ? user.first_name
  //             ? user.first_name
  //             : obj.data.first_name
  //           : "Admin" || "Admin"
  //         : process.env.REACT_APP_DEFAULTAUTH === "firebase"
  //         ? obj.email && obj.email
  //         : "Admin"
  //     );
  //   }
  // }, [userName, user]);

  //Dropdown Toggle
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown);
  };
  return (
    <React.Fragment>
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
                Sanjay
              </span>
              {/* <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{userName}</span> */}
              <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
                Admin
              </span>
              {/* <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">Founder</span> */}
            </span>
          </span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem >
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
    </React.Fragment>
  );
};

export default ProfileDropdown;
