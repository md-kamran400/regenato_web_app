const RmtableData = [
    {
        id: '1',
        name: 'Steel',
        netweight: "1.4",
        price: 325,
        totalrate: 455.00,
        action: 'Edit / Remove'
    },
    {
        id: '2',
        name: 'Copper',
        netweight: "--,--",
        price: 200,
        totalrate: 0,
        action: 'Edit / Remove'
    },
    {
        id: '3',
        name: '	Graphite',
        netweight: "--,--",
        price: 125,
        totalrate: 0,
        action: 'Edit / Remove'
    },
    {
        id: '3',
        name: 'Hardering',
        netweight: "--,--",
        price: 125,
        totalrate: 75,
        action: 'Edit / Remove'
    },
];

const manufacturingtableData = [
    {
        id: '1',
        name: '	VMC Imported',
        hours: 0,
        hourlyrate: "800",
        totalrate: 0,
        action: 'Edit / Remove'
    },
    {
        id: '2',
        name: 'VMC Local',
        hours: 1.3,
        hourlyrate: "500",
        totalrate: 625,
        action: 'Edit / Remove'
    },
    {
        id: '3',
        name: '	Milling Manual',
        hours: 0,
        hourlyrate: "350",
        totalrate: 0,
        action: 'Edit / Remove'
    },
    {
        id: '4',
        name: '	Grinding Final',
        hours: 1.3,
        hourlyrate: "300",
        totalrate: 375,
        action: 'Edit / Remove'
    },
   {
        id: '5',
        name: '	CNC Lathe',
        hours: 0,
        hourlyrate: "500",
        totalrate: 0,
        action: 'Edit / Remove'
    },
    {
        id: '6',
        name: 'Drill/Tap',
        hours: 0,
        hourlyrate: "300",
        totalrate: 0,
        action: 'Edit / Remove'
    },
    {
        id: '7',
        name: '	Wire Cut Local',
        hours: 0,
        hourlyrate: "0",
        totalrate: 0,
        action: 'Edit / Remove'
    },
    {
        id: '8',
        name: '	Wire Cut Rough',
        hours: 1,
        hourlyrate: "350",
        totalrate: 350,
        action: 'Edit / Remove'
    },
    {
        id: '9',
        name: 'Wire Cut Imported',
        hours: 0,
        hourlyrate: "1300",
        totalrate: 0,
        action: 'Edit / Remove'
    },
    {
        id: '10',
        name: '	EDM',
        hours: 0,
        hourlyrate: "0",
        totalrate: 0,
        action: 'Edit / Remove'
    },
    {
        id: '11',
        name: '	Black Oxide',
        hours: 0,
        hourlyrate: "20",
        totalrate: 40,
        action: 'Edit / Remove'
    },
    {
        id: '12',
        name: '	Laser Marking',
        hours: 0,
        hourlyrate: "50",
        totalrate: 50,
        action: 'Edit / Remove'
    },
    {
        id: '13',
        name: '	Lapping/Polishing',
        hours: 0,
        hourlyrate: "0",
        totalrate: 0,
        action: 'Edit / Remove'
    },
    {
        id: '14',
        name: 'Grinding Blank/Rough',
        hours: 0.8,
        hourlyrate: "200",
        totalrate: 150,
        action: 'Edit / Remove'
    },
    {
        id: '15',
        name: 'Gauges & fixtures (if required. Add separate break up)',
        hours: 0,
        hourlyrate: "00",
        totalrate: 20,
        action: 'Edit / Remove'
    },

];


const shipmenttableData = [
    {
        id: 1,
        name: 'Freight Cost',
        hourlyrate: 30,
        action: 'Edit / Remove'
    },
    {
        id: 2,
        name: 'Cost For Packing',
        hourlyrate: 20,
        action: 'Edit / Remove'
    },
];

const OverheaderstableData = [
    {
        id: '1',
        name: '	Profit Margin',
        percentage: "15",
        totalrate: 657,
        action: 'Edit / Remove'
    },
];

export { RmtableData, manufacturingtableData,shipmenttableData, OverheaderstableData};
