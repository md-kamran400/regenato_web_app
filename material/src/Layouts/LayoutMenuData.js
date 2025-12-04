const navdata = (userRole = "guest") => {
  // Define all possible menu items first
  const allMenuItems = {
    projects: {
      id: "projects",
      label: "Production Order",
      link: "/regenato-projects",
      icon: "fa fa-folder",
    },
    Plan: {
      id: "Plan",
      label: "Plan",
      link: "/regenato-allocation-plan",
      icon: "fa fa-wrench",
      children: [
        {
          id: "ware House",
          label: "Inventory",
          link: "/regenato-wareHouse-plan",
          icon: "fa fa-list",
        },
        {
          id: "Plan",
          label: "Plan",
          link: "/regenato-allocation-plan",
          icon: "fa fa-list",
        },
      ],
    },
    variables: {
      id: "variables",
      label: "Variables",
      link: "/regenato-variables",
      icon: "fa fa-sliders",
    },
    view: {
      id: "View",
      label: "View",
      icon: "fa fa-cogs",
      children: [
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

          id: "processVire",
          label: "Process View",
          link: "/regenato-process-view",
          icon: "fa fa-list",
        },
        {
          id: "OperatorView",
          label: "Operator View",
          link: "/regenato-operator-view",
          icon: "fa fa-list",
        },
        {
          id: "planView",
          label: "Plan View",
          link: "/regenato-planPage",
          icon: "fa fa-list",
        },
        {
          id: "planView",
          label: "Production View",
          link: "/regenato-Production-timeline",
          icon: "fa fa-list",
        },
      ],
    },
    parts: {
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
    machineCapacity: {
      id: "machineCapecity",
      label: "Machine Capacity",
      icon: "fa fa-chart-bar",
      children: [
        {
          id: "machineCapecity",
          label: "Machine Capacity",
          link: "/regenato-machine-capacity",
          icon: "fa fa-list",
        },
        {
          id: "Operator Capecity",
          label: "Operator Capacity",
          link: "/regenato-operator-capacity",
          icon: "fa fa-list",
        },
      ],
    },
  };

  // Define menu configurations for each role
  const roleConfigurations = {
    admin: [
      allMenuItems.projects,
      allMenuItems.Plan,
      allMenuItems.parts,
      allMenuItems.variables,
      allMenuItems.view,
      allMenuItems.machineCapacity,
    ],
    production: [
      allMenuItems.projects,
      allMenuItems.variables,
      allMenuItems.view,
      allMenuItems.machineCapacity,
    ],
    incharge: [
      allMenuItems.projects,
      allMenuItems.Plan,
      allMenuItems.variables,
      allMenuItems.view,
    ],
    guest: [], // or whatever you want for guests
  };

  // Return the appropriate menu items based on role
  return [
    { subItems: roleConfigurations[userRole] || roleC / onfigurations.guest },
  ];
};

export default navdata;
