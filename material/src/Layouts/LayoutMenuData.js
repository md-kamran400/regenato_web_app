const navdata = () => {
  const menuItems = [
    {
      subItems: [
        {
          id: "home",
          label: "Home",
          link: "/regenato-home",
          icon: "fa fa-home", // Example FontAwesome icon class
        },
        {
          id: "projects",
          label: "Projects",
          link: "/regenato-projects",
          icon: "fa fa-folder", // Example FontAwesome icon class
        },
        {
          id: "parts",
          label: "Parts",
          link: "/regenato-parts",
          icon: "fa fa-cogs", // Example FontAwesome icon class
        },
        // {
        //   id: "bom",
        //   label: "BOM",
        //   link: "/regenato-bom",
        //   icon: "fa fa-list", // Example FontAwesome icon class
        // },
        {
          id: "variable",
          label: "Variable",
          link: "/regenato-variables",
          icon: "fa fa-sliders", // Example FontAwesome icon class
        },
        // {
        //   id: "resource",
        //   label: "Resource",
        //   link: "/regenato-resource",
        //   icon: "fa fa-users", // Example FontAwesome icon class
        // },
      ],
    },
  ];
  return menuItems;
};

export default navdata;
