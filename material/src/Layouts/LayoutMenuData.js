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
          icon: "fa fa-cogs",
          children: [
            {
              id: "assemblyList",
              label: "Assembly List",
              link: "/regenato-assembly-list",
              icon: "fa fa-list",
            },
            {
              id: "subAssemblyList",
              label: "Sub Assembly List",
              link: "/regenato-sub-assembly-list",
              icon: "fa fa-list",
            },
            {
              id: "partsList",
              label: "Parts List",
              link: "/regenato-parts",
              icon: "fa fa-list",
            },
          ],
        },
        // {
        //   id: "bom",
        //   label: "BOM",
        //   link: "/regenato-bom",
        //   icon: "fa fa-list", // Example FontAwesome icon class
        // },
        {
          id: "variables",
          label: "Variables",
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
