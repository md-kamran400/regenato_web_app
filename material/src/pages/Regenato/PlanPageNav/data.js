// Sample orders data for SF Body only with process timelines
export const ordersData = [
    {
      id: "ORD-001",
      partId: 1,
      quantity: 5,
      startDate: "2025-02-10",
      endDate: "2025-02-20",
      processes: {
        C1: {
          machineId: "VMC001",
          startDate: "2025-02-10",
          endDate: "2025-02-13",
        },
        C3: {
          machineId: "MM001",
          startDate: "2025-02-13",
          endDate: "2025-02-16",
        },
        C4: {
          machineId: "GF001",
          startDate: "2025-02-16",
          endDate: "2025-02-20",
        },
      },
    },
    {
      id: "ORD-002",
      partId: 1,
      quantity: 3,
      startDate: "2025-02-15",
      endDate: "2025-02-25",
      processes: {
        C1: {
          machineId: "VMC002",
          startDate: "2025-02-15",
          endDate: "2025-02-18",
        },
        C3: {
          machineId: "MM002",
          startDate: "2025-02-18",
          endDate: "2025-02-21",
        },
        C4: {
          machineId: "GF002",
          startDate: "2025-02-21",
          endDate: "2025-02-25",
        },
      },
    },
    {
      id: "ORD-003",
      partId: 1,
      quantity: 4,
      startDate: "2025-02-20",
      endDate: "2025-03-05",
      processes: {
        C1: {
          machineId: "VMC003",
          startDate: "2025-02-20",
          endDate: "2025-02-24",
        },
        C3: {
          machineId: "MM003",
          startDate: "2025-02-24",
          endDate: "2025-02-28",
        },
        C4: {
          machineId: "GF003",
          startDate: "2025-02-28",
          endDate: "2025-03-05",
        },
      },
    },
  ];
  
  // Machine assignments with operators
  export const machineAssignments = {
    C1: [
      { id: "VMC001", operator: "John Smith", orderId: "ORD-001" },
      { id: "VMC002", operator: "Maria Garcia", orderId: "ORD-002" },
      { id: "VMC003", operator: "David Chen", orderId: "ORD-003" },
    ],
    C3: [
      { id: "MM001", operator: "Sarah Johnson", orderId: "ORD-001" },
      { id: "MM002", operator: "James Wilson", orderId: "ORD-002" },
      { id: "MM003", operator: "Emily Brown", orderId: "ORD-003" },
    ],
    C4: [
      { id: "GF001", operator: "Michael Lee", orderId: "ORD-001" },
      { id: "GF002", operator: "Lisa Anderson", orderId: "ORD-002" },
      { id: "GF003", operator: "Robert Taylor", orderId: "ORD-003" },
    ],
  };
  
  export const machiningProcesses = {
    C1: { name: 'VMC Imported', rate: 2500 },
    C2: { name: 'VMC Local', rate: 1800 },
    C3: { name: 'Milling Manual', rate: 1200 },
    C4: { name: 'Grinding Final', rate: 1500 },
    C5: { name: 'CNC Lathe', rate: 2200 },
    C6: { name: 'Drill/Tap', rate: 800 },
    C7: { name: 'Wire Cut Local', rate: 1600 },
    C8: { name: 'Wire Cut Rough', rate: 1400 },
    C9: { name: 'Wire Cut Imported', rate: 2800 },
    C11: { name: 'Black Oxide', rate: 600 },
    C12: { name: 'Laser Marking', rate: 1000 },
    C13: { name: 'Lapping/Polishing', rate: 900 },
    C14: { name: 'Grinding Blank/Rough', rate: 1300 },
    C15: { name: 'Gauges & fixtures', rate: 1700 },
    C17: { name: 'Cylindrical Grinding', rate: 1900 },
    C18: { name: 'Manual Lathe', rate: 1100 },
    C19: { name: 'Hydraulic Grinding', rate: 2000 }
  };
  
  export const partsData = [
    { 
      id: 1, 
      name: 'SF BODY (RS-EM) -NEW', 
      costPerUnit: 150, 
      machiningHours: 6.5, 
      quantity: 1,
      processes: [
        { code: 'C1', time: '2h 15m' },
        { code: 'C3', time: '4h 30m' },
        { code: 'C11', time: '1h 45m' }
      ]
    },
    { 
      id: 2, 
      name: 'Bottom Base Plate (RSSF-PN-SB)', 
      costPerUnit: 85, 
      machiningHours: 4.25, 
      quantity: 1,
      processes: [
        { code: 'C2', time: '1h 30m' },
        { code: 'C4', time: '2h 00m' },
        { code: 'C12', time: '0h 45m' }
      ]
    },
    { 
      id: 3, 
      name: 'Retainer Plate (RSSF-MECH)', 
      costPerUnit: 95, 
      machiningHours: 3.75, 
      quantity: 1,
      processes: [
        { code: 'C5', time: '1h 45m' },
        { code: 'C6', time: '1h 00m' },
        { code: 'C13', time: '1h 00m' }
      ]
    },
    { 
      id: 4, 
      name: 'Shaft Plunger (RSSF-MECH)', 
      costPerUnit: 120, 
      machiningHours: 5.5, 
      quantity: 1,
      processes: [
        { code: 'C7', time: '2h 30m' },
        { code: 'C17', time: '2h 00m' },
        { code: 'C14', time: '1h 00m' }
      ]
    }
  ].map(part => ({ ...part, isExpanded: false }));