import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
  const menuItems = [
    {
      subItems: [
        {
          id: "home",
          label: "Home",
          link: "/regenato-home",
        },
        {
          id: "projects",
          label: "Projects",
          link: "/regenato-projects",
        },
        {
          id: "parts",
          label: "Parts",
          link: "/regenato-parts",
        },
        {
          id: "bom",
          label: "BOM",
          link: "/regenato-bom",
        },
        {
          id: "variable",
          label: "Variable",
          link: "/regenato-variables",
        },
        {
          id: "resource",
          label: "Resource",
          link: "/regenato-resource",
        },
      ],
    },

  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;