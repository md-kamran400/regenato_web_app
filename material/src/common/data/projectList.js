// Import Images
import slack from "../../assets/images/brands/slack.png";
import dribbble from "../../assets/images/brands/dribbble.png";
import mailChimp from "../../assets/images/brands/mail_chimp.png";
import dropbox from "../../assets/images/brands/dropbox.png";
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../assets/images/users/avatar-5.jpg";
import avatar6 from "../../assets/images/users/avatar-6.jpg";
import avatar7 from "../../assets/images/users/avatar-7.jpg";
import avatar8 from "../../assets/images/users/avatar-8.jpg";
import avatar9 from "../../assets/images/users/avatar-9.jpg";
import avatar10 from "../../assets/images/users/avatar-10.jpg";
const projectList = [
    {
        id: 1,
        isDesign1 : true,
        label: "Base (48A47015001)",
        status: "INR 2,847",
        statusClass: "warning",
        deadline: "4.7",
        subItem: "500",
        progressBar: "50%",
        ratingClass:"active",
        cardHeaderClass:"danger"
    },
    {
        id: 2,
        isDesign1 : true,
        label: "Ram (48A47015001)",
        status: "INR 812.70",
        statusClass: "warning",
        deadline: "7.2",
        subItem: "120",
        progressBar: "50%",
        ratingClass:"active",
        cardHeaderClass:"warning"
    },
    {
        id: 3,
        isDesign1 : true,
        label: "Feeding Claw (48A47030)",
        status: "INR 812.70",
        statusClass: "warning",
        deadline: "7.2",
        subItem: "120",
        progressBar: "50%",
        ratingClass:"active",
        cardHeaderClass:"info"
    },
    {
        id: 4,
        isDesign1 : true,
        label: "Authentication",
        status: "INR 2,847",
        statusClass: "warning",
        deadline: "18 Sep, 2021",
        subItem: "120",
        progressBar: "50%",
        ratingClass:"active",
        cardHeaderClass:"success"
    },
    //design 2
    {
        id: 5,
        isDesign2 : true,
        label: "Po 1",
        status: "INR 2,847",
        statusClass: "warning",
        deadline: "4.7",
        subItem: "500",
        progressBar: "50%",
        ratingClass:"active",
        cardHeaderClass:"danger"
    },
    {
        id: 6,
        isDesign2 : true,
        label: "Po 2",
        status: "INR 812.70",
        statusClass: "success",
        deadline: "7.2",
        subItem: "120",
        progressBar: "95%",
        ratingClass:"active",
        cardHeaderClass:"warning"
    },
    {
        id: 7,
        isDesign2 : true,
        label: "Po 3",
        status: "INR 812.70",
        statusClass: "warning",
        deadline: "7.2",
        subItem: "120",
        progressBar: "41%",
        ratingClass:"",
        cardHeaderClass:"info"
    },
    {
        id: 8,
        isDesign2 : true,
        label: "Po 4",
        status: "INR 812.70",
        statusClass: "warning",
        deadline: "7.2",
        subItem: "120",
        progressBar: "35%",
        ratingClass:"active",
        cardHeaderClass:"success"
    },
    //design 3
    {
        id: 9,
        isDesign3 : true,
        img: dribbble,
        label: "Kanban Board",
        status: "Inprogess",
        statusClass: "warning",
        deadline: "08 Dec, 2021",
        number: "17/20",
        progressBar: "71%",
        subItem: [
            { id: 1, imgNumber: "D", bgColor: "danger" },
            { id: 2, imgTeam: avatar5 },
            { id: 3, imgNumber: "+" },
        ],
        ratingClass:"active",
        cardHeaderClass:"secondary-subtle"
    },
    {
        id: 10,
        isDesign3 : true,
        img: slack,
        label: "Ecommerce app",
        status: "Inprogess",
        statusClass: "warning",
        deadline: "20 Nov, 2021",
        number: "11/45",
        progressBar: "20%",
        subItem: [
            { id: 1, imgTeam: avatar9 },
            { id: 2, imgTeam: avatar10 },
            { id: 3, imgNumber: "+" },
        ],
        ratingClass:"",
        cardHeaderClass:"light"
    },
    {
        id: 11,
        isDesign3 : true,
        img: dropbox,
        label: "Redesign - Landing page",
        status: "Inprogess",
        statusClass: "warning",
        deadline: "10 Jul, 2021",
        number: "13/26",
        progressBar: "54%",
        subItem: [
            { id: 1, imgTeam: avatar3 },
            { id: 2, imgNumber: "S", bgColor: "secondary" },
            { id: 3, imgTeam: avatar4 },
            { id: 4, imgNumber: "+" },
        ],
        ratingClass:"",
        cardHeaderClass:"primary-subtle"
    },
    {
        id: 12,
        isDesign3 : true,
        img: mailChimp,
        label: "Multipurpose landing template",
        status: "Completed",
        statusClass: "success",
        deadline: "18 Sep, 2021",
        number: "25/32",
        progressBar: "75%",
        subItem: [
            { id: 1, imgNumber: "D", bgColor: "danger" },
            { id: 2, imgTeam: avatar5 },
            { id: 3, imgTeam: avatar6 },
            { id: 4, imgNumber: "+" },
        ],
        ratingClass:"active",
        cardHeaderClass:"danger-subtle"
    },
];
export { projectList };