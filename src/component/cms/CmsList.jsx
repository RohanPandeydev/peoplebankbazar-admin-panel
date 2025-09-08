import React, { useState } from "react";
import TableView from "../../utils/TableView";
import { useCustomQuery } from "../../utils/QueryHooks";
import CmsServices from "../../services/CmsServices"; 
import Loader from "../../utils/Loader/Loader";
import NoDataFound from "../../utils/NoDataFound";
import { Row, Col, Input, Button, Badge } from "reactstrap";
import { buildQueryString } from "../../utils/BuildQuery";
import Pagination from "../../utils/Pagination";
import { BiReset } from "react-icons/bi";
import config from "../../../config";

const CmsList = ({ page_type }) => {
  const [limit, setLimit] = useState(10);
  const [searchFilter, setSearchFilter] = useState({
    search: "",
    is_active: "",
  });

  // API call
  const { data: cmsList, isLoading } = useCustomQuery({
    queryKey: ["cms-list", searchFilter, limit],
    service: CmsServices.getAllCmsContentAdmin,
    params: buildQueryString([
      { key: "page", value: 1 },
      { key: "limit", value: limit },
      { key: "page_type", value: page_type || "bank_listing" },
      { key: "search", value: searchFilter?.search },
      { key: "is_active", value: searchFilter?.is_active },
    ]),
    select: (data) => data,
    errorMsg: "",
  });

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearchFilter({ ...searchFilter, [name]: value });
  };

  const handleResetFilter = () => {
    setSearchFilter({
      search: "",
      is_active: "",
    });
  };

  // Render image safely
  const renderImage = (value, row) => {
    if (!value) return <span className="text-muted">No Image</span>;
    return (
      <img
        src={`${config.apiUrl}/${value}`}
        alt={row.title}
        style={{
          width: "50px",
          height: "50px",
          objectFit: "cover",
          borderRadius: "4px",
          border: "1px solid #dee2e6",
        }}
      />
    );
  };

  // Table headers
  let headers = [
    { key: "title", label: "Title" },
    { key: "subtitle", label: "Subtitle" },
    {
      key: "category",
      label: "Category",
      render: (value) =>
        value ? <Badge color="info">{value?.name}</Badge> : "No Category",
    },
    { key: "image_url", label: "Image", render: renderImage },
  ];

  // ✅ Add Bank column only for bank_detail page type
  if (page_type === "bank_detail") {
    headers.splice(3, 0, {
      key: "bank",
      label: "Bank",
      render: (value) =>
        value ? <Badge color="primary">{value?.name}</Badge> : "No Bank",
    });
  }

  // ✅ Dynamic heading
  const getHeading = () => {
    switch (page_type) {
      case "bank_detail":
        return "CMS Bank Detail Content";
      case "bank_listing":
        return "CMS Bank Listing Content";
      case "category_listing":
        return "CMS Category Listing Content";
      default:
        return "CMS Content";
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">{getHeading()}</h4>
      </div>

      {/* Filters */}
      <Row className="mb-4">
        <Col md="3" className="mb-2">
          <Input
            type="text"
            name="search"
            placeholder="Search by title or subtitle..."
            onChange={handleSearch}
            value={searchFilter?.search}
          />
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
            name="limit"
            onChange={(e) => setLimit(e.target.value)}
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

      {/* Table or Loader */}
      {isLoading ? (
        <Loader />
      ) : !cmsList?.content || cmsList?.content.length === 0 ? (
        <NoDataFound msg="No CMS content found" />
      ) : (
        <>
          <TableView headers={headers} data={cmsList?.content} />
          {cmsList?.pagination && <Pagination pagination={cmsList.pagination} />}
        </>
      )}
    </>
  );
};

export default CmsList;
