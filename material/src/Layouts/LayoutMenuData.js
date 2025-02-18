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
          label: "Production Order",
          link: "/regenato-projects",
          icon: "fa fa-folder", // Example FontAwesome icon class
        },
        {
          id: "allocation",
          label: "Allocation",
          link: "/regenato-allocation",
          icon: "fa fa-wrench", // Example FontAwesome icon class
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
        {
          id: "timeline",
          label: "TImeline",
          link: "/regenato-timeline",
          icon: "fa fa-calendar", // Example FontAwesome icon class
        },
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
