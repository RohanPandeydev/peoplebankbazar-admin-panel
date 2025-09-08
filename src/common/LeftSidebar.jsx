import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiChevronRight, FiPlus, FiMinus } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import { IoImages } from "react-icons/io5";
import { IoGift } from "react-icons/io5";
import { MdManageAccounts } from "react-icons/md";

const LeftSidebar = ({ toggleMenu }) => {
  const location = useLocation();
  const [activeParent, setActiveParent] = useState(null);
  const [openSubMenus, setOpenSubMenus] = useState({});

  const handleParentClick = (parent) => {
    setActiveParent((prev) => (prev === parent ? null : parent));
  };

  const toggleSubMenu = (id) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Master Section
  const masterSection = {
    parent: "Master",
    id: "master",
    icon: <MdManageAccounts />,
    children: [
      {
        id: "categories",
        name: "Categories",
        link: "/master/categories",
      },
      {
        id: "banks",
        name: "Banks",
        link: "/master/banks",
      },
    ],
  };

  // CMS Section
  const cmsSection = {
    parent: "CMS",
    id: "cms",
    icon: <IoImages />,
    children: [
      {
        id: "homepage",
        name: "Homepage",
        link: "/cms/homepage",
      },
      {
        id: "category_listing",
        name: "Category Listing",
        link: "/cms/category-listing",
      },
      {
        id: "bank_details",
        name: "Bank Details",
        link: "/cms/bank-details",
      },
      // {
      //   id: "bank_detail",
      //   name: "Bank Details",
      //   link: "/cms/bank-detail",
      // },
    ],
  };

  // Promotions Section
  const promotionsSection = {
    parent: "Promotions",
    id: "promotions",
    icon: <IoGift />,
    children: [
      {
        id: "promotional_cards",
        name: "Promotional Cards",
        link: "/promotions/cards",
      },
      {
        id: "also_buy",
        name: "Also Buy",
        link: "/promotions/also-buy",
      },
    ],
  };

  const renderChildren = (items) => {
    return items.map((item) => {
      const hasSubMenu = item.subMenu?.length > 0;
      const isSubMenuOpen = openSubMenus[item.id] || false;
      const link = item.link;

      return (
        <li className="nav-item" key={item.id}>
          <div className="d-flex justify-content-between align-items-center">
            <NavLink
              className="nav-link flex-grow-1 unique-link"
              to={link}
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#019bbf" : "transparent",
                color: isActive ? "#FFF" : "#000",
              })}
            >
              {item.name}
              {hasSubMenu && (
                <span
                  className="toggle-submenu"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSubMenu(item.id);
                  }}
                  style={{ cursor: "pointer", paddingRight: "10px" }}
                >
                  {isSubMenuOpen ? <FiMinus /> : <FiPlus />}
                </span>
              )}
            </NavLink>
          </div>

          {hasSubMenu && isSubMenuOpen && (
            <ul className="nav flex-column sub-menu ms-3">
              {renderChildren(item.subMenu)}
            </ul>
          )}
        </li>
      );
    });
  };

  const isParentActive = (section) =>
    activeParent === section.parent ||
    section.children?.some((child) =>
      location.pathname.toLowerCase().startsWith(child.link.toLowerCase())
    );

  return (
    <div className={toggleMenu ? "left-sidebar open" : "left-sidebar"}>
      <ul className="sidebarnav">
        {/* Dashboard */}
        <li className="nav-item">
          <NavLink
            className="nav-link"
            to="/"
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#019bbf" : "transparent",
              color: isActive ? "#fff" : "#000",
            })}
          >
            <span className="menu-icon">
              <RxDashboard />
            </span>{" "}
            Dashboard
          </NavLink>
        </li>

        {/* Master Section */}
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#Master"
            aria-expanded={isParentActive(masterSection)}
            aria-controls="Master"
            onClick={() => handleParentClick(masterSection.parent)}
          >
            <span className="menu-icon">{masterSection.icon}</span>
            <span className="menu-title">{masterSection.parent}</span>
            <i className="menu-arrow">
              <FiChevronRight />
            </i>
          </a>
          <div
            className={`collapse ${
              isParentActive(masterSection) ? "show" : ""
            }`}
            id="Master"
          >
            <ul className="nav flex-column sub-menu">
              {renderChildren(masterSection.children)}
            </ul>
          </div>
        </li>

        {/* CMS Section */}
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#CMS"
            aria-expanded={isParentActive(cmsSection)}
            aria-controls="CMS"
            onClick={() => handleParentClick(cmsSection.parent)}
          >
            <span className="menu-icon">{cmsSection.icon}</span>
            <span className="menu-title">{cmsSection.parent}</span>
            <i className="menu-arrow">
              <FiChevronRight />
            </i>
          </a>
          <div
            className={`collapse ${
              isParentActive(cmsSection) ? "show" : ""
            }`}
            id="CMS"
          >
            <ul className="nav flex-column sub-menu">
              {renderChildren(cmsSection.children)}
            </ul>
          </div>
        </li>

        {/* Promotions Section */}
        <li className="nav-item">
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#Promotions"
            aria-expanded={isParentActive(promotionsSection)}
            aria-controls="Promotions"
            onClick={() => handleParentClick(promotionsSection.parent)}
          >
            <span className="menu-icon">{promotionsSection.icon}</span>
            <span className="menu-title">{promotionsSection.parent}</span>
            <i className="menu-arrow">
              <FiChevronRight />
            </i>
          </a>
          <div
            className={`collapse ${
              isParentActive(promotionsSection) ? "show" : ""
            }`}
            id="Promotions"
          >
            <ul className="nav flex-column sub-menu">
              {renderChildren(promotionsSection.children)}
            </ul>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default LeftSidebar;
