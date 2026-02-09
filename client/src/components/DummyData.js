// ---------- Charts Data ----------
export const desktopOS = [
  { id: 0, value: 40, label: 'Small Electronics' },
  { id: 1, value: 30, label: 'IT & Office Equipment' },
  { id: 2, value: 20, label: 'Entertainment Devices' },
  { id: 3, value: 10, label: 'Other' },
];

export const valueFormatter = (value) => `${value}%`;

export const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const deviceCounts = [
  12, 19, 8, 15, 22, 30, 25, 18, 20, 27, 35, 40,
];

export const pieColors = [
  '#0D47A1',
  '#1976D2',
  '#42A5F5',
  '#90CAF9',
];

// ---------- Widgets ----------
export const widgetData = [
  { number: 120, label: 'Electronics Recycled' },
  { number: 75, label: 'Electronics Upcycled' },
  { number: 7, label: 'Upcoming Pickups Today' },
];

// ---------- Requests ----------
export const requests = [
  {
    id: 1,
    type: 'Laptop',
    image: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/dell-plus/db16255/media-gallery/non-touch/laptop-dell-plus-db16255nt-ice-bl-fpr-gallery-5.psd?fmt=png-alpha&pscan=auto&scl=1&hei=804&wid=979&qlt=100,1&resMode=sharp2&size=979,804&chrss=full',
    date: '16/11/2025',
    time: '11:43 PM',
    condition: 'Not Working',
    method: 'Pick Up',
  },
  {
    id: 2,
    type: 'Phone',
    image: 'https://cdn.mos.cms.futurecdn.net/hf2CQvHr9KNtKuUSDkeQVH.jpg',
    date: '1/11/2025',
    time: '10:00 AM',
    condition: 'Working',
    method: 'Drop Off',
  },
  {
    id: 3,
    type: 'PC',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMgwMWbZLv8i_-QfS2mWOcmXKKOy5kN877zA&s',
    date: '15/9/2025',
    time: '2:30 PM',
    condition: 'Working',
    method: 'Pick Up',
  },
];

export const requestHistoryData = [
  {
    id: 101,
    title: "Phone",
    image: "https://cdn.mos.cms.futurecdn.net/hf2CQvHr9KNtKuUSDkeQVH.jpg",
    requestDate: "16/11/2025",
    condition: "Not Working",
    category: "Small Electronics",
    method: "Drop Off",
    userId: 101,
    phone: "98765432",
    email: "mohammed@gmail.com",
    status: "Pending",
  },
  {
    id: 90,
    title: "TV",
    image: "https://cdn.jiostore.online/v2/jmd-asp/jdprod/wrkr/jioretailer/products/pictures/item/free/original/eYeIBBxuzX-bpl-32-hd-television-492166140-i-1-1200wx1200h.jpeg",
    requestDate: "11/11/2025",
    condition: "Working",
    category: "Large Electronics",
    method: "Pick Up",
    userId: 108,
    phone: "98765432",
    email: "ali@gmail.com",
    status: "Cancelled",
  },
  {
    id: 88,
    title: "Fridge",
    image: "https://www.cuisinart.com/dw/image/v2/ABAF_PRD/on/demandware.static/-/Sites-master-us/default/dw3546ad47/images/large/CCF-31_01_V2.jpg?sw=1200&sh=1200&sm=fit",
    requestDate: "12/10/2025",
    condition: "Not Working",
    category: "Home Appliances",
    method: "Pick Up",
    userId: 1011,
    phone: "98765432",
    email: "omar@gmail.com",
    status: "Completed",
  },
  {
    id: 70,
    title: "Iron",
    image: "https://png.pngtree.com/thumb_back/fw800/background/20240524/pngtree-3d-iron-image-background-image_15817157.jpg",
    requestDate: "16/09/2025",
    condition: "Not Working",
    category: "Small Electronics",
    method: "Drop Off",
    userId: 1090,
    phone: "98765432",
    email: "ahmed@gmail.com",
    status: "Rejected",
  },
];

export const collectorProfileData = {
  logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTN7Ik2Tsq6SeEyuBudrRAKkwCi6BgMPLhHg&s",
  companyName: "Oman Environmental Services Holding Company",

  basicInfo: {
    collectorId: "101",
    collectorType: "Government-approved recycler",
    workingHours: "Sunday - Thursday 8AM - 4PM",
    phone: "+968 24228401",
    email: "beah@gmail.com",
  },

  acceptedCategories: [
    { name: "Small Electronics", checked: true },
    { name: "Large Electronics", checked: true },
    { name: "Home Appliances (Small)", checked: true },
    { name: "Home Appliances (Large)", checked: true },
    { name: "IT & Office Equipment", checked: true },
    { name: "Kitchen & Cooking Appliances", checked: true },
    { name: "Entertainment Devices", checked: true },
    { name: "Personal Care Electronics", checked: true },
    { name: "Tools & Outdoor Equipment", checked: true },
    { name: "Lighting Equipment", checked: true },
    { name: "Medical & Fitness Devices", checked: true },
    { name: "Batteries & Accessories", checked: true },
  ],

  location: {
    address: "Muscat, ALSEEB",
  },
};

export const ewasteStats = {
  totalDevices: 28,
  categories: 6,
  mostRecycled: "Phones",
};

export const infoCards = [
  {
    title: "Environmental Benefits of E-Waste Recycling",
    icon: "recycle",
    points: [
      "Reduces mining by recovering valuable materials (gold, copper, aluminum).",
      "Lowers greenhouse gas emissions.",
      "Helps create a circular economy where materials are reused.",
      "Protects ecosystems and reduces long-term environmental harm.",
    ],
  },
  {
    title: "Why You Shouldn’t Throw Electronics in the Trash!!",
    icon: "trash",
    points: [
      "Electronics contain toxic materials (lead, mercury, chemicals).",
      "Batteries can cause fires in trash bins or landfills.",
      "E-waste damages soil and water causing environmental pollution.",
      "Throwing electronics away increases hazardous materials; recycling ensures proper processing.",
    ],
  },
];

export const devices = [
  {
    name: "PC",
    risk: "Medium",
    category: "Medium",
    image: "https://cdn-icons-png.flaticon.com/512/3103/3103446.png",
    steps: [
      "Back up your files.",
      "Sign out of accounts.",
      "Remove any accessories.",
      "Factory reset or wipe hard drive.",
      "Do NOT break or burn the drive yourself.",
    ],
  },
  {
    name: "Monitor",
    risk: "Medium",
    category: "Medium",
    image: "https://cdn-icons-png.flaticon.com/512/1067/1067256.png",
    steps: [
      "Unplug everything safely.",
      "Check for warranty or manufacturer recycling.",
      "Do NOT open the monitor.",
    ],
  },
  {
    name: "Phone",
    risk: "Hazardous",
    category: "Hazardous",
    image: "https://cdn-icons-png.flaticon.com/512/545/545245.png",
    steps: [
      "Back up your data.",
      "Sign out of accounts & disable security locks.",
      "Remove SIM and SD card.",
      "Factory reset the phone to erase everything.",
    ],
  },
  {
    name: "Microwave",
    risk: "Hazardous",
    category: "Hazardous",
    image: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png",
    steps: [
      "Unplug and clean it.",
      "Remove the glass plate.",
      "Do NOT open the microwave yourself.",
    ],
  },
  {
    name: "Iron",
    risk: "Low",
    category: "Low",
    image: "https://cdn-icons-png.flaticon.com/512/1046/1046875.png",
    steps: [
      "Unplug it and make sure it's fully cooled.",
      "Remove any detachable parts.",
      "Do NOT try to open or repair wiring.",
    ],
  },
  {
    name: "Fridge",
    risk: "Hazardous",
    category: "Hazardous",
    image: "https://cdn-icons-png.flaticon.com/512/1046/1046869.png",
    steps: [
      "Unplug it and empty it fully.",
      "Let it defrost.",
      "Do NOT try to cut pipes or remove the compressor yourself.",
    ],
  },
];


export const recyclingCenters = [
  {
    id: 1,
    name: "Oman Environmental Services Holding Company",
    address: "HCF5+XF9, Muscat",
    phone: "24228401",
    hours: "Sunday - Thursday (8AM - 4PM)",
    lat: 23.5880,
    lng: 58.3829,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTN7Ik2Tsq6SeEyuBudrRAKkwCi6BgMPLhHg&s", 
    rating: 3.6,
    reviews: 84,
  },
  {
    id: 2,
    name: "SARCO Samsung Authorized Service",
    address: "Al Ghala, Muscat",
    phone: "24567890",
    hours: "Sunday - Thursday (8AM - 5PM)",
    lat: 23.6140,
    lng: 58.5380,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUWiSlNkbA4k09LAYzfUIgXUdK20yFXrdn4g&s",
    rating: 4.2,
    reviews: 52,
  },
  {
    id: 3,
    name: "Tradebe Services LLC, Muscat",
    address: "Al Amarat, Muscat",
    phone: "24678901",
    hours: "Sunday - Thursday (8AM - 4PM)",
    lat: 23.5800,
    lng: 58.4200,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9ZzqpIzcThKSOroKRvmkZiOcbPyZws1HJ7w&s",
    rating: 4.0,
    reviews: 36,
  },
  
];
