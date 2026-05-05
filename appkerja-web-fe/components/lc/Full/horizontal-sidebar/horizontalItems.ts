export interface menu {
  header?: string;
  title?: string;
  icon?: any;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  subCaption?: string;
  class?: string;
  extraclass?: string;
  type?: string;
  BgColor?: string;
}

const horizontalItems: menu[] = [
  {
    title: "Dashboards",
    icon: "screencast-2-linear",
    BgColor: "primary",
    to: "#",
    children: [
      {
        title: "Dashboard",
        to: "/dashboards/dashboard1",
      },
      {
        title: "Dashboard 2",
        to: "/dashboards/dashboard2",
      },
    ],
  },
  {
    title: "Front Pages",
    icon: "home-angle-linear",
    BgColor: "error",
    to: "#",
    children: [
      {
        title: "Homepage",
        to: "/front-pages/homepage",
      },
      {
        title: "About Us",
        to: "/front-pages/about-us",
      },
      {
        title: "Blog",
        to: "/front-pages/blog/posts",
      },
      {
        title: "Blog Details",
        to: "/front-pages/blog/early-black-friday-amazon-deals-cheap-tvs-headphones",
      },
      {
        title: "Contact Us",
        to: "/front-pages/contact-us",
      },
      {
        title: "Portfolio",
        to: "/front-pages/portfolio",
      },
      {
        title: "Pricing",
        to: "/front-pages/pricing",
      },
    ],
  },

  {
    title: "Apps",
    icon: "clapperboard-text-line-duotone",
    BgColor: "indigo",
    to: "#",
    children: [
      {
        title: "Contact",
        to: "/apps/contacts",
      },
      {
        title: "Chats",
        to: "/apps/chats",
      },
      {
        title: "Blog",
        to: "/",
        children: [
          {
            title: "Posts",
            to: "/apps/blog/posts",
          },
          {
            title: "Detail",
            to: "/apps/blog/early-black-friday-amazon-deals-cheap-tvs-headphones",
          },
        ],
      },
      {
        title: "E-Commerce",
        to: "/ecommerce/",
        children: [
          {
            title: "Shop One",
            to: "/apps/ecommerce/productsone",
          },
          {
            title: "Shop Two",
            to: "/apps/ecommerce/productstwo",
          },
          {
            title: "Details One",
            to: "/apps/ecommerce/product/one/detail/1",
          },
          {
            title: "Details Two",
            to: "/apps/ecommerce/producttwo/two/detail/1",
          },
          {
            title: "List",
            to: "/apps/ecommerce/productlist",
          },
          {
            title: "Checkout",
            to: "/apps/ecommerce/checkout",
          },
          {
            title: "Add Product",
            to: "/apps/ecommerce/addproduct",
          },
          {
            title: "Edit Product",
            to: "/apps/ecommerce/editproduct",
          },
        ],
      },
      {
        title: "User Profile",
        to: "/",
        children: [
          {
            title: "Profile One",
            to: "/apps/userprofile/one",
          },
          {
            title: "Profile Two",
            to: "/apps/userprofile/two",
          },
        ],
      },
      {
        title: "Invoice",
        to: "/",
        children: [
          {
            title: "List",
            to: "/apps/invoice",
          },
          {
            title: "Details",
            to: "/apps/invoice/details/102",
          },
          {
            title: "Create",
            to: "/apps/invoice/create",
          },
          {
            title: "Edit",
            to: "/apps/invoice/edit/102",
          },
        ],
      },
      {
        title: "Email",
        to: "/apps/email",
      },
      {
        title: "Notes",
        to: "/apps/notes",
      },
      {
        title: "Calendar",
        to: "/apps/calendar",
      },
      {
        title: "Kanban",
        to: "/apps/kanban",
      },
      {
        title: "Tickets",
        to: "/apps/tickets",
      },
    ],
  },

  {
    title: "Pages",
    icon: "folder-with-files-line-duotone",
    BgColor: "error",
    to: "#",
    children: [
      {
        title: "Pricing",
        to: "/theme-pages/pricing",
      },
      {
        title: "Account Setting",
        to: "/theme-pages/account-settings",
      },
      {
        title: "FAQ",
        to: "/theme-pages/pricing",
      },
      {
        title: "Gallery Lightbox",

        to: "/theme-pages/gallery-lightbox",
      },
      {
        title: "Search Results",

        to: "/theme-pages/search-results",
      },
      {
        title: "Social Contacts",

        to: "/theme-pages/social-media-contacts",
      },
      {
        title: "Treeview",

        to: "/theme-pages/treeview",
      },
      {
        title: "Widget",
        to: "/widget-card",
        children: [
          {
            title: "Cards",
            to: "/widgets/cards",
          },
          {
            title: "Banners",
            to: "/widgets/banners",
          },
          {
            title: "Charts",
            to: "/widgets/charts",
          },
        ],
      },
      {
        title: "UI",
        to: "#",
        children: [
          {
            title: "Alert",
            to: "/ui-components/alert",
          },
          {
            title: "Accordion",
            to: "/ui-components/accordion",
          },
          {
            title: "Avatar",
            to: "/ui-components/avatar",
          },
          {
            title: "Chip",
            to: "/ui-components/chip",
          },
          {
            title: "Dialog",
            to: "/ui-components/dialogs",
          },
          {
            title: "List",
            to: "/ui-components/list",
          },
          {
            title: "Menus",
            to: "/ui-components/menus",
          },
          {
            title: "Rating",
            to: "/ui-components/rating",
          },
          {
            title: "Tabs",
            to: "/ui-components/tabs",
          },
          {
            title: "Tooltip",
            to: "/ui-components/tooltip",
          },
          {
            title: "Typography",
            to: "/ui-components/typography",
          },
        ],
      },
      {
        title: "Charts",
        to: "#",
        children: [
          {
            title: "Line",
            to: "/charts/line-chart",
          },
          {
            title: "Gredient",
            to: "/charts/gredient-chart",
          },
          {
            title: "Area",
            to: "/charts/area-chart",
          },
          {
            title: "Candlestick",
            to: "/charts/candlestick-chart",
          },
          {
            title: "Column",
            to: "/charts/column-chart",
          },
          {
            title: "Doughnut & Pie",
            to: "/charts/doughnut-pie-chart",
          },
          {
            title: "Radialbar & Radar",
            to: "/charts/radialbar-chart",
          },
        ],
      },
      {
        title: "Auth",
        to: "#",
        children: [
          {
            title: "Error",
            to: "/auth/404",
          },
          {
            title: "Maintenance",
            to: "/auth/maintenance",
          },
          {
            title: "Login",
            to: "#",
            children: [
              {
                title: "Side Login",
                to: "/auth/login",
              },
              {
                title: "Boxed Login",
                to: "/auth/login2",
              },
            ],
          },
          {
            title: "Register",

            to: "#",
            children: [
              {
                title: "Side Register",
                to: "/auth/register2",
              },
              {
                title: "Boxed Register",
                to: "/auth/register",
              },
            ],
          },
          {
            title: "Forgot Password",
            to: "#",
            children: [
              {
                title: "Side Forgot Password",
                to: "/auth/forgot-password",
              },
              {
                title: "Boxed Forgot Password",
                to: "/auth/forgot-password2",
              },
            ],
          },
          {
            title: "Two Steps",
            to: "#",
            children: [
              {
                title: "Side Two Steps",
                to: "/auth/two-step",
              },
              {
                title: "Boxed Two Steps",
                to: "/auth/two-step2",
              },
            ],
          },
        ],
      },
      {
        title: "Teachers",
        to: "",
        children: [
          {
            title: "All Teachers",
            to: "/school-pages/teachers",
          },
          {
            title: "Teachers Details",
            to: "/school-pages/teachers/details",
          },
        ],
      },
      {
        title: "Exam",
        to: "",
        children: [
          {
            title: "Exam Schedule",
            to: "/school-pages/exam/schedule",
          },
          {
            title: "Exam Result",
            to: "/school-pages/exam/result",
          },
          {
            title: "Exam Result Details",
            to: "/school-pages/exam/result-details",
          },
        ],
      },
      {
        title: "Students",
        to: "",
        children: [
          {
            title: "All Students",
            to: "/school-pages/students",
          },
          {
            title: "Students Details",
            to: "/school-pages/students/details",
          },
        ],
      },
      {
        title: "Classes",
        to: "/school-pages/classes",
      },
      {
        title: "Attendance",
        to: "/school-pages/attendance",
      },
    ],
  },
  {
    title: "Forms",
    icon: "file-line-duotone",
    BgColor: "success",
    to: "#",
    children: [
      {
        title: "Form Elements",
        to: "/components/",
        children: [
          {
            title: "Autocomplete",
            to: "/forms/form-elements/autocomplete",
          },
          {
            title: "Combobox",
            to: "/forms/form-elements/combobox",
          },
          {
            title: "Button",
            to: "/forms/form-elements/button",
          },
          {
            title: "Checkbox",
            to: "/forms/form-elements/checkbox",
          },
          {
            title: "Custom Inputs",
            to: "/forms/form-elements/custominputs",
          },
          {
            title: "File Inputs",
            to: "/forms/form-elements/fileinputs",
          },
          {
            title: "Radio",
            to: "/forms/form-elements/radio",
          },
          {
            title: "Date Time",
            to: "/forms/form-elements/date-time",
          },
          {
            title: "Select",
            to: "/forms/form-elements/select",
          },
          {
            title: "Slider",
            to: "/forms/form-elements/slider",
          },
          {
            title: "Switch",
            to: "/forms/form-elements/switch",
          },
          {
            title: "Time Picker",
            to: "/forms/form-elements/timepicker",
          },
          {
            title: "Stepper",
            to: "/forms/form-elements/stepper",
          },
        ],
      },
      {
        title: "Form Layout",
        to: "/forms/form-layouts",
      },
      {
        title: "Form Horizontal",
        to: "/forms/form-horizontal",
      },
      {
        title: "Form Vertical",
        to: "/forms/form-vertical",
      },
      {
        title: "Form Custom",
        to: "/forms/form-custom",
      },
      {
        title: "Form Validation",
        to: "/forms/form-validation",
      },
    ],
  },
  {
    title: "Tables",
    icon: "layers-minimalistic-line-duotone",
    BgColor: "warning",
    to: "#",
    children: [
      {
        title: "Basic Table",
        to: "/tables/basic",
      },
      {
        title: "Dark Table",
        to: "/tables/dark",
      },
      {
        title: "Density Table",
        to: "/tables/density",
      },
      {
        title: "Fixed Header Table",
        to: "/tables/fixed-header",
      },
      {
        title: "Height Table",
        to: "/tables/height",
      },
      {
        title: "Editable Table",
        to: "/tables/editable",
      },
    ],
  },
  {
    title: "Data Tables",
    BgColor: "secondary",
    icon: "database-outline",
    to: "#",
    children: [
      {
        title: "Basic Table",
        to: "/datatables/basic",
      },
      {
        title: "Header Table",
        to: "/datatables/header",
      },
      {
        title: "Selection Table",
        to: "/datatables/selection",
      },
      {
        title: "Sorting Table",
        to: "/datatables/sorting",
      },
      {
        title: "Pagination Table",
        to: "/datatables/pagination",
      },
      {
        title: "Filtering Table",
        to: "/datatables/filtering",
      },
      {
        title: "Grouping Table",
        to: "/datatables/grouping",
      },
      {
        title: "Table Slots",
        to: "/datatables/slots",
      },
      {
        title: "CRUD Table",
        to: "/datatables/crudtable",
      },
    ],
  },
];

export default horizontalItems;
