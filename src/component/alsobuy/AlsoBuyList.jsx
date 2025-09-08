import React, { useState } from "react";
import TableView from "../../utils/TableView";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { buildQueryString } from "../../utils/BuildQuery";
import Pagination from "../../utils/Pagination";
import { useCustomQuery } from "../../utils/QueryHooks";
import AlsoBuyServices from "../../services/AlsoBuyServices";
import Loader from "../../utils/Loader/Loader";
import NoDataFound from "../../utils/NoDataFound";
import { Button, Col, Input, Row } from "reactstrap";
import Swal from "sweetalert2";
import ButtonLoader from "../../utils/Loader/ButtonLoader";
import { BiReset } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";

const AlsoBuyList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryClient = useQueryClient();

  const [toggleRowId, setToggleRowId] = useState("");
  const [deleteRowId, setDeleteRowId] = useState("");
  const [limit, setLimit] = useState(10);

  const [searchFilter, setSearchFilter] = useState({
    search: "",
    is_featured: "",
    is_active: "",
    category_id: "",
    bank_id: "",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");

  // Fetch also-buy list
  const { data: alsoBuyList, isLoading } = useCustomQuery({
    queryKey: ["also-buy-list", currentPage, searchFilter, limit],
    service: AlsoBuyServices.getAllAlsoBuyItemsAdmin,
    params: buildQueryString([
      { key: "page", value: currentPage || 1 },
      { key: "limit", value: limit || 10 },
      { key: "search", value: searchFilter.search },
      { key: "category_id", value: searchFilter.category_id },
      { key: "bank_id", value: searchFilter.bank_id },
      { key: "is_featured", value: searchFilter.is_featured },
      { key: "is_active", value: searchFilter.is_active },
    ]),
    select: (data) => data,
  });

  // Search & filter handlers
  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearchFilter({ ...searchFilter, [name]: value });
    searchParams.set("page", "1");
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const handleResetFilter = () => {
    setSearchFilter({
      search: "",
      is_featured: "",
      is_active: "",
      category_id: "",
      bank_id: "",
    });
    searchParams.set("page", "1");
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  // Toggle mutations
  const toggleMutation = useMutation({
    mutationFn: (data) => AlsoBuyServices.toggleAlsoBuyItemStatus(data),
    onSuccess: () => {
      setToggleRowId("");
      queryClient.refetchQueries(["also-buy-list"]);
    },
    onError: () => setToggleRowId(""),
  });

  const deleteMutation = useMutation({
    mutationFn: (data) => AlsoBuyServices.deleteAlsoBuyItem(data),
    onSuccess: () => {
      setDeleteRowId("");
      queryClient.refetchQueries(["also-buy-list"]);
    },
    onError: () => setDeleteRowId(""),
  });

  // Handle toggle for boolean fields
  const handleToggle = (row, field) => {
    const currentValue = row[field] === true || row[field] === "true";
    setToggleRowId(`${row.id}-${field}`);
    toggleMutation.mutate({ id: row.id, [field]: !currentValue });
  };

  const handleDelete = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete "${row.title}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setDeleteRowId(row.id);
        deleteMutation.mutate({ id: row.id });
      }
    });
  };

  // Render toggle switch
  const renderToggleSwitch = (value, row, field) => {
    const boolValue = value === true || value === "true";
    return (
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          checked={boolValue}
          disabled={toggleRowId === `${row.id}-${field}`}
          onChange={() => handleToggle(row, field)}
        />
        {toggleRowId === `${row.id}-${field}` && <ButtonLoader />}
      </div>
    );
  };

  // Render actions column
  const renderActions = (row) => (
    <div className="d-flex gap-2">
      <Button
        color="danger"
        size="sm"
        disabled={deleteRowId === row.id}
        onClick={() => handleDelete(row)}
      >
        {deleteRowId === row.id ? <ButtonLoader /> : <MdOutlineDeleteOutline />}
      </Button>
    </div>
  );

  // Table headers (matching model)
  const headers = [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    {
      key: "bank",
      label: "Bank",
      render: (v) => v?.name || "-",
    },
    {
      key: "category",
      label: "Category",
      render: (v) => v?.name || "-",
    },
    // {
    //   key: "related_bank",
    //   label: "Related Bank",
    //   render: (v) => v?.name || "-",
    // },
    {
      key: "discount_percentage",
      label: "Discount (%)",
      render: (v) => v ? `${v}%` : "-",
    },
    { key: "discount_text", label: "Discount Text" },
    { key: "badge_text", label: "Badge" },
    {
      key: "badge_color",
      label: "Badge Color",
      render: (v) => (
        <span
          style={{
            background: v || "gray",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: "4px",
          }}
        >
          {v || "-"}
        </span>
      ),
    },
    {
      key: "is_featured",
      label: "Featured",
      render: (v, r) => renderToggleSwitch(v, r, "is_featured"),
    },
    {
      key: "is_active",
      label: "Active",
      render: (v, r) => renderToggleSwitch(v, r, "is_active"),
    },
  ];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Also Buy Items</h4>
      </div>

      {/* Filters */}
      <Row className="mb-4">
        <Col md="3">
          <Input
            type="text"
            name="search"
            placeholder="Search by title..."
            value={searchFilter.search}
            onChange={handleSearch}
          />
        </Col>
        <Col md="2">
          <Input
            type="select"
            name="is_featured"
            value={searchFilter.is_featured}
            onChange={handleSearch}
          >
            <option value="">All Featured</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </Input>
        </Col>
        <Col md="2">
          <Input
            type="select"
            name="is_active"
            value={searchFilter.is_active}
            onChange={handleSearch}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Input>
        </Col>
        <Col md="1">
          <Button
            type="button"
            color="outline-secondary"
            onClick={handleResetFilter}
            className="w-100"
          >
            <BiReset />
          </Button>
        </Col>
      </Row>

      {/* Table */}
      {isLoading ? (
        <Loader />
      ) : !alsoBuyList?.items?.length ? (
        <NoDataFound msg="No also-buy items found" />
      ) : (
        <>
          <TableView
            headers={headers}
            data={alsoBuyList.items}
            showActions={true}
            renderActions={renderActions}
          />
          {alsoBuyList?.pagination && <Pagination pagination={alsoBuyList.pagination} />}
        </>
      )}
    </>
  );
};

export default AlsoBuyList;
