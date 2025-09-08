import React, { useState } from "react";
import TableView from "../../utils/TableView";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { buildQueryString } from "../../utils/BuildQuery";
import Pagination from "../../utils/Pagination";
import { useCustomQuery } from "../../utils/QueryHooks";
import CategoryServices from "../../services/CategoryServices";
import Loader from "../../utils/Loader/Loader";
import NoDataFound from "../../utils/NoDataFound";
import { Button, Col, Input, Row, Badge } from "reactstrap";
import Swal from "sweetalert2";
import ButtonLoader from "../../utils/Loader/ButtonLoader";
import ProtectedRoute, { ProtectedMethod } from "../../guard/RBACGuard";

import { BiReset } from "react-icons/bi";
import { FaRegEdit, FaPlus } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";
import config from "../../../config";

const CategoryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryClient = useQueryClient();
  const [toggleRowId, setToggleRowId] = useState("");
  const [deleteRowId, setDeleteRowId] = useState("");
  const [limit, setLimit] = useState(10);

  const [searchFilter, setSearchFilter] = useState({
    search: "",
    category_type: "",
    is_active: "",
    parent_id: "",
    is_featured: "",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");

  const {
    data: categoryList,
    isLoading: isCategoryLoad,
  } = useCustomQuery({
    queryKey: ["category-list", currentPage, searchFilter, limit],
    service: CategoryServices.categoryList,
    params: buildQueryString([
      { key: "page", value: currentPage || 1 },
      { key: "limit", value: limit || 10 },
      { key: "search", value: searchFilter?.search },
      { key: "category_type", value: searchFilter?.category_type },
      { key: "is_active", value: searchFilter?.is_active },
      { key: "parent_id", value: searchFilter?.parent_id },
      { key: "is_featured", value: searchFilter?.is_featured },
    ]),
    select: (data) => data,
    errorMsg: "",
  });

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearchFilter({ ...searchFilter, [name]: value });

    searchParams.set("page", "1");
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const handleResetFilter = () => {
    setSearchFilter({
      search: "",
      category_type: "",
      is_active: "",
      parent_id: "",
      is_featured: "",
    });
    searchParams.set("page", "1");
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  // Toggle category status mutation
  const toggleMutation = useMutation({
    mutationFn: (data) => CategoryServices.toggleCategoryStatus(data),
    onSuccess: (data) => {
      setToggleRowId("");
      Swal.fire({
        title: "Success!",
        text: data?.data?.message || "Status updated successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      queryClient.refetchQueries(["category-list"]);
    },
    onError: (err) => {
      setToggleRowId("");
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || err?.message || "Failed to update status",
        icon: "error",
      });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (data) => CategoryServices.deleteCategory(data),
    onSuccess: (data) => {
      setDeleteRowId("");
      Swal.fire({
        title: "Deleted!",
        text: data?.data?.message || "Category deleted successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      queryClient.refetchQueries(["category-list"]);
    },
    onError: (err) => {
      setDeleteRowId("");
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || err?.message || "Failed to delete category",
        icon: "error",
      });
    },
  });

  // Handle toggle for is_active, is_featured, is_hot_offer
  const handleToggle = (row, field) => {
    const fieldNames = {
      is_active: "Active Status",
      is_featured: "Featured Status",
      is_hot_offer: "Hot Offer Status"
    };

    Swal.fire({
      title: `Change ${fieldNames[field]}?`,
      text: `Are you sure you want to ${row[field] ? 'disable' : 'enable'} this ${fieldNames[field].toLowerCase()}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        setToggleRowId(`${row.id}-${field}`);
        toggleMutation.mutate({
          id: row.id,
          [field]: !row[field]
        });
      }
    });
  };

  // Handle delete
  const handleDelete = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete "${row.name}" category. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        setDeleteRowId(row.id);
        deleteMutation.mutate({ id: row.id });
      }
    });
  };

  // Custom render functions for table
  const renderImage = (value, row) => {
    if (!value) {
      return <span className="text-muted">No Image</span>;
    }
    return (
      <img
        src={`${config.apiUrl}/${value}`}
        alt={row.name}
        style={{
          width: "50px",
          height: "50px",
          objectFit: "cover",
          borderRadius: "4px",
          border: "1px solid #dee2e6"
        }}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline';
        }}
      />
    );
  };

  const renderParent = (value, row) => {
    if (!value) {
      return <Badge color="secondary">Root Category</Badge>;
    }
    return <Badge color="info">{value.name}</Badge>;
  };

  const renderChildren = (value, row) => {
    if (!value || value.length === 0) {
      return <span className="text-muted">No subcategories</span>;
    }
    return <Badge color="success">{value.length} subcategories</Badge>;
  };

  const renderToggleSwitch = (value, row, field) => {
    const isLoading = toggleRowId === `${row.id}-${field}`;

    return (
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          checked={value}
          disabled={isLoading}
          onChange={() => handleToggle(row, field)}
          style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
        />
        {isLoading && <ButtonLoader />}
      </div>
    );
  };

  const renderActions = (row) => (
    <div className="d-flex gap-2">
      {/* <NavLink to={`/cms/category/update/${btoa(row.slug)}`}>
          <Button color="primary" size="sm" title="Edit Category">
            <FaRegEdit />
          </Button>
        </NavLink>
       */}
      <Button
        color="danger"
        size="sm"
        title="Delete Category"
        disabled={deleteRowId === row.id}
        onClick={() => handleDelete(row)}
      >
        {deleteRowId === row.id ? <ButtonLoader /> : <MdOutlineDeleteOutline />}
      </Button>
    </div>
  );

  // Table headers configuration
  const headers = [
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div>
          <strong>{value}</strong>
          {row.slug && <div className="text-muted small">/{row.slug}</div>}
        </div>
      )
    },
    {
      key: "description",
      label: "Description",
      render: (value) => {
        if (!value) return <span className="text-muted">No description</span>;
        return (
          <div
            style={{
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
            title={value}
          >
            {value}
          </div>
        );
      }
    },
    {
      key: "image",
      label: "Image",
      render: renderImage
    },
    {
      key: "category_type",
      label: "Type",
      render: (value) => <Badge color="primary">{value || 'N/A'}</Badge>
    },
    // { 
    //   key: "parent", 
    //   label: "Parent",
    //   render: renderParent
    // },
    // { 
    //   key: "children", 
    //   label: "Subcategories",
    //   render: renderChildren
    // },
    // { 
    //   key: "sort_order", 
    //   label: "Sort Order",
    //   render: (value) => <Badge color="secondary">{value || 0}</Badge>
    // },
    {
      key: "is_featured",
      label: "Featured",
      render: (value, row) => renderToggleSwitch(value, row, 'is_featured')
    },
    {
      key: "is_hot_offer",
      label: "Hot Offer",
      render: (value, row) => renderToggleSwitch(value, row, 'is_hot_offer')
    },
    {
      key: "is_active",
      label: "Active",
      render: (value, row) => renderToggleSwitch(value, row, 'is_active')
    }
  ];



  return (
    <>
      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Categories Management</h4>
        <ProtectedMethod moduleName="category" action="create">
          <NavLink to="/cms/category/create">
            <Button color="success">
              <FaPlus className="me-2" />
              Add Category
            </Button>
          </NavLink>
        </ProtectedMethod>
      </div>

      {/* Filters */}
      <Row className="mb-4">
        <Col md="3" className="mb-2">
          <Input
            type="text"
            name="search"
            placeholder="Search by name or description..."
            onChange={handleSearch}
            value={searchFilter?.search}
          />
        </Col>
        <Col md="2" className="mb-2">
          <Input
            type="select"
            name="category_type"
            onChange={handleSearch}
            value={searchFilter?.category_type}
          >
            <option value="">All Types</option>
            <option value="loan">Loan</option>
            <option value="insurance">Insurance</option>
            <option value="investment">Investment</option>
            <option value="credit_card">Credit Card</option>
            <option value="other">Other</option>
          </Input>
        </Col>
        <Col md="2" className="mb-2">
          <Input
            type="select"
            name="is_active"
            onChange={handleSearch}
            value={searchFilter?.is_active}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Input>
        </Col>
        <Col md="2" className="mb-2">
          <Input
            type="select"
            name="is_featured"
            onChange={handleSearch}
            value={searchFilter?.is_featured}
          >
            <option value="">All Featured</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </Input>
        </Col>
        <Col md="2" className="mb-2">
          <Input
            type="select"
            name="limit"
            onChange={(e) => {
              setLimit(e.target.value);
              searchParams.set("page", "1");
              navigate(`${location.pathname}?${searchParams.toString()}`);
            }}
            value={limit}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </Input>
        </Col>
        <Col md="1">
          <Button
            type="button"
            onClick={handleResetFilter}
            className="w-100"
            color="outline-secondary"
            title="Reset Filters"
          >
            <BiReset />
          </Button>
        </Col>
      </Row>

      {/* Results Summary */}
      {categoryList && !isCategoryLoad && (
        <div className="mb-3">
          <small className="text-muted">
            Showing {categoryList.categories?.length || 0} of {categoryList.pagination?.total_items || 0} categories
          </small>
        </div>
      )}

      {/* Table */}
      {isCategoryLoad ? (
        <Loader />
      ) : !categoryList?.categories || categoryList.categories.length === 0 ? (
        <NoDataFound msg="No categories found" />
      ) : (
        <>
          <TableView
            headers={headers}
            data={categoryList.categories}
            showActions={true}
            renderActions={renderActions}
          />

          {categoryList?.pagination && (
            <Pagination pagination={categoryList.pagination} />
          )}
        </>
      )}
    </>
  );
};

export default CategoryList;