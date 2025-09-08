import React, { useState } from "react";
import TableView from "../../utils/TableView";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { buildQueryString } from "../../utils/BuildQuery";
import Pagination from "../../utils/Pagination";
import { useCustomQuery } from "../../utils/QueryHooks";
import PromotionalServices from "../../services/PromotionalServices";
import Loader from "../../utils/Loader/Loader";
import NoDataFound from "../../utils/NoDataFound";
import { Button, Col, Input, Row } from "reactstrap";
import Swal from "sweetalert2";
import ButtonLoader from "../../utils/Loader/ButtonLoader";
import { BiReset } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";

const PromotionalList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryClient = useQueryClient();

  const [toggleRowId, setToggleRowId] = useState("");
  const [deleteRowId, setDeleteRowId] = useState("");
  const [limit, setLimit] = useState(10);

  const [searchFilter, setSearchFilter] = useState({
    search: "",
    card_type: "",
    target_audience: "",
    is_featured: "",
    is_active: "",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");

  // Fetch promotional cards
  const { data: promoList, isLoading } = useCustomQuery({
    queryKey: ["promotional-list", currentPage, searchFilter, limit],
    service: PromotionalServices.getAllPromotionalCardsAdmin,
    params: buildQueryString([
      { key: "page", value: currentPage || 1 },
      { key: "limit", value: limit || 10 },
      { key: "search", value: searchFilter.search },
      { key: "card_type", value: searchFilter.card_type },
      { key: "target_audience", value: searchFilter.target_audience },
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
      card_type: "",
      target_audience: "",
      is_featured: "",
      is_active: "",
    });
    searchParams.set("page", "1");
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  // Toggle mutations
  const toggleMutation = useMutation({
    mutationFn: (data) => PromotionalServices.togglePromotionalCardStatus(data),
    onSuccess: () => {
      setToggleRowId("");
      queryClient.refetchQueries(["promotional-list"]);
    },
    onError: () => setToggleRowId(""),
  });

  const deleteMutation = useMutation({
    mutationFn: (data) => PromotionalServices.deletePromotionalCard(data),
    onSuccess: () => {
      setDeleteRowId("");
      queryClient.refetchQueries(["promotional-list"]);
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

  // Table headers
  const headers = [
    { key: "title", label: "Title" },
    { key: "subtitle", label: "Subtitle" },
    { key: "card_type", label: "Type" },
    {
      key: "categories",
      label: "Categories",
      render: (v) => (v?.length ? v.map((cat) => cat.name).join(", ") : "-"),
    },
    {
      key: "is_featured",
      label: "Featured",
      render: (v, r) => renderToggleSwitch(v, r, "is_featured"),
    },
    {
      key: "is_hot_offer",
      label: "Hot Offer",
      render: (v, r) => renderToggleSwitch(v, r, "is_hot_offer"),
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
        <h4 className="mb-0">Promotional Cards</h4>
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
          <Input type="select" name="card_type" value={searchFilter.card_type} onChange={handleSearch}>
            <option value="">All Types</option>
            <option value="investment">Investment</option>
            <option value="insurance">Insurance</option>
            <option value="calculator">Calculator</option>
            <option value="loan">Loan</option>
            <option value="other">Other</option>
          </Input>
        </Col>
        {/* <Col md="2">
          <Input
            type="select"
            name="target_audience"
            value={searchFilter.target_audience}
            onChange={handleSearch}
          >
            <option value="">All Audiences</option>
            <option value="all">All Users</option>
            <option value="new_users">New Users</option>
            <option value="existing_users">Existing Users</option>
            <option value="premium_users">Premium Users</option>
          </Input>
        </Col> */}
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
      ) : !promoList?.cards?.length ? (
        <NoDataFound msg="No promotional cards found" />
      ) : (
        <>
          <TableView
            headers={headers}
            data={promoList.cards}
            showActions={true}
            renderActions={renderActions}
          />
          {promoList?.pagination && <Pagination pagination={promoList.pagination} />}
        </>
      )}
    </>
  );
};

export default PromotionalList;
