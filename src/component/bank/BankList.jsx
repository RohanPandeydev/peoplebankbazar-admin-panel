import React, { useState } from "react";
import TableView from "../../utils/TableView";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { buildQueryString } from "../../utils/BuildQuery";
import Pagination from "../../utils/Pagination";
import { useCustomQuery } from "../../utils/QueryHooks";
import BankServices from "../../services/BankServices";
import Loader from "../../utils/Loader/Loader";
import NoDataFound from "../../utils/NoDataFound";
import { Button, Col, Input, Row, Badge } from "reactstrap";
import Swal from "sweetalert2";
import ButtonLoader from "../../utils/Loader/ButtonLoader";

import { BiReset } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";
import config from "../../../config";

const BankList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryClient = useQueryClient();
  const [toggleRowId, setToggleRowId] = useState("");
  const [deleteRowId, setDeleteRowId] = useState("");
  const [limit, setLimit] = useState(10);

  const [searchFilter, setSearchFilter] = useState({
    search: "",
    is_active: "",
    is_featured: "",
    is_hot_offer: "",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");

  const { data: bankList, isLoading: isBankLoad } = useCustomQuery({
    queryKey: ["bank-list", currentPage, searchFilter, limit],
    service: BankServices.getAllBanksAdmin,
    params: buildQueryString([
      { key: "page", value: currentPage || 1 },
      { key: "limit", value: limit || 10 },
      { key: "search", value: searchFilter?.search },
      { key: "is_active", value: searchFilter?.is_active },
      { key: "is_featured", value: searchFilter?.is_featured },
      { key: "is_hot_offer", value: searchFilter?.is_hot_offer },
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
    setSearchFilter({ search: "", is_active: "", is_featured: "", is_hot_offer: "" });
    searchParams.set("page", "1");
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const toggleMutation = useMutation({
    mutationFn: (data) => BankServices.toggleBankStatus(data),
    onSuccess: (data) => {
      setToggleRowId("");
      Swal.fire({
        title: "Success!",
        text: data?.data?.message || "Status updated successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      queryClient.refetchQueries(["bank-list"]);
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

  const deleteMutation = useMutation({
    mutationFn: (data) => BankServices.deleteBank(data),
    onSuccess: (data) => {
      setDeleteRowId("");
      Swal.fire({
        title: "Deleted!",
        text: data?.data?.message || "Bank deleted successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      queryClient.refetchQueries(["bank-list"]);
    },
    onError: (err) => {
      setDeleteRowId("");
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || err?.message || "Failed to delete bank",
        icon: "error",
      });
    },
  });

  const handleToggle = (row, field) => {
    const fieldNames = {
      is_active: "Active Status",
      is_featured: "Featured Status",
      is_hot_offer: "Hot Offer Status",
    };

    Swal.fire({
      title: `Change ${fieldNames[field]}?`,
      text: `Are you sure you want to ${row[field] ? "disable" : "enable"} this ${fieldNames[field].toLowerCase()}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setToggleRowId(`${row.id}-${field}`);
        toggleMutation.mutate({ id: row.id, [field]: !row[field] });
      }
    });
  };

  const handleDelete = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete "${row.name}". This action cannot be undone!`,
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

  const renderLogo = (value) => {
    if (!value) return <span className="text-muted">No Logo</span>;
    return <img src={`${config.apiUrl}/${value}`} alt="logo" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px", border: "1px solid #dee2e6" }} />;
  };

  const renderToggleSwitch = (value, row, field) => {
    const isLoading = toggleRowId === `${row.id}-${field}`;
    return (
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" checked={value} disabled={isLoading} onChange={() => handleToggle(row, field)} />
        {isLoading && <ButtonLoader />}
      </div>
    );
  };

  const renderActions = (row) => (
    <div className="d-flex gap-2">
      {/* <NavLink to={`/bank/update/${btoa(row.slug)}`}>
        <Button color="primary" size="sm" title="Edit Bank">Edit</Button>
      </NavLink> */}
      <Button color="danger" size="sm" disabled={deleteRowId === row.id} onClick={() => handleDelete(row)}>
        {deleteRowId === row.id ? <ButtonLoader /> : <MdOutlineDeleteOutline />}
      </Button>
    </div>
  );

  const headers = [
    { key: "name", label: "Name" },
    { key: "logo", label: "Logo", render: renderLogo },
    { key: "official_website", label: "Website", render: (value) => value ? <a href={value} target="_blank" rel="noreferrer">{value}</a> : <span className="text-muted">N/A</span> },
    { key: "interest_rate_min", label: "Interest Rate", render: (value, row) => `${row.interest_rate_min || 0}% - ${row.interest_rate_max || 0}%` },
    { key: "tenure_min", label: "Tenure (Months)", render: (value, row) => `${row.tenure_min || 0} - ${row.tenure_max || 0}` },
    { key: "is_featured", label: "Featured", render: (value, row) => renderToggleSwitch(value, row, 'is_featured') },
    { key: "is_hot_offer", label: "Hot Offer", render: (value, row) => renderToggleSwitch(value, row, 'is_hot_offer') },
    { key: "is_active", label: "Active", render: (value, row) => renderToggleSwitch(value, row, 'is_active') },
  ];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Bank Management</h4>
        {/* <NavLink to="/bank/create">
          <Button color="success">
            <FaPlus className="me-2" />
            Add Bank
          </Button>
        </NavLink> */}
      </div>

      {/* Filters */}
      <Row className="mb-4">
        <Col md="3">
          <Input type="text" name="search" placeholder="Search by name or website..." onChange={handleSearch} value={searchFilter.search} />
        </Col>
        <Col md="2">
          <Input type="select" name="is_active" onChange={handleSearch} value={searchFilter.is_active}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Input>
        </Col>
        <Col md="2">
          <Input type="select" name="is_featured" onChange={handleSearch} value={searchFilter.is_featured}>
            <option value="">All Featured</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </Input>
        </Col>
        <Col md="2">
          <Input type="select" name="is_hot_offer" onChange={handleSearch} value={searchFilter.is_hot_offer}>
            <option value="">All Hot Offers</option>
            <option value="true">Hot Offer</option>
            <option value="false">No Hot Offer</option>
          </Input>
        </Col>
        <Col md="2">
          <Input type="select" name="limit" onChange={(e) => setLimit(e.target.value)} value={limit}>
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </Input>
        </Col>
        <Col md="1">
          <Button type="button" onClick={handleResetFilter} className="w-100" color="outline-secondary"><BiReset /></Button>
        </Col>
      </Row>

      {/* Table */}
      {isBankLoad ? <Loader /> : !bankList?.banks?.length ? <NoDataFound msg="No banks found" /> : (
        <>
          <TableView headers={headers} data={bankList.banks} showActions={true} renderActions={renderActions} />
          {bankList?.pagination && <Pagination pagination={bankList.pagination} />}
        </>
      )}
    </>
  );
};

export default BankList;
