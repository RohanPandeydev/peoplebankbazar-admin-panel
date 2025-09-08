import { FiUser } from "react-icons/fi";


const SideBarMenuList = [
    
    {
        parent: "CMS",
        id: 1,
        icon: <FiUser />,
        children: [
            { name: "Blog", id: 1, feature: "blog", link: "/blog" },
        ],
    },
    

];

export default SideBarMenuList;
