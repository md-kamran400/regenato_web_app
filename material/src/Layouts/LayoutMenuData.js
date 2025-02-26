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
          id: "variables",
          label: "Variables",
          link: "/regenato-variables",
          icon: "fa fa-sliders", // Example FontAwesome icon class
        },
        {
          id: "timeline",
          label: "TimeLine",
          link: "/regenato-timeline",
          icon: "fa fa-calendar", // Example FontAwesome icon class
        },
        {
          id: "planPage",
          label: "Plan",
          link: "/regenato-planPage",
          icon: "fa fa-calendar", // Example FontAwesome icon class
        },
        {
          id: "Capecity",
          label: "Capecity",
          link: "/regenato-Capecity",
          icon: "fa fa-cogs",
          children: [
            {
              id: "machineCapecity",
              label: "Machine Capecity",
              link: "/regenato-machine-capecity",
              icon: "fa fa-list",
            },
            {
              id: "Operator Capecity",
              label: "Operator Capecity",
              link: "/regenato-operator-capecity",
              icon: "fa fa-list",
            },
          ],
        },
      ],
    },
  ];
  return menuItems;
};

export default navdata;
