import React, { useState } from 'react'
import { Button, Table, Badge } from 'reactstrap'
import parse from 'html-react-parser'
import moment from 'moment'
import config from '../../config'
import { NavLink } from 'react-router-dom'
import { FaEye, FaRegEdit } from 'react-icons/fa'

const TableView = ({ headers = [], data = [], showActions = false, renderActions = () => null }) => {
    const [expandedRows, setExpandedRows] = useState({})

    const toggleRow = (index, value) => {
        setExpandedRows((prev) => ({
            ...prev,
            [index]: !prev[index],
            value: value
        }))
    }

    const renderCellContent = (header, value, row, rowIndex) => {
        // If header has a custom render function, use it
        if (header.render && typeof header.render === 'function') {
            return header.render(value, row, rowIndex);
        }

        // Handle different data types and special cases
        if (header.html && value) {
            return (
                <td className='truncate-button' style={{ minWidth: '250px', maxWidth: '300px' }}>
                    <div style={{ 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'normal', 
                        wordBreak: 'break-word' 
                    }}>
                        {parse(value)}
                    </div>
                </td>
            );
        }

        if (header.json && value) {
            try {
                return JSON.stringify(JSON.parse(value), null, 2);
            } catch (e) {
                return value;
            }
        }

        if (header.category && value) {
            return (
                <NavLink to={"/seo/" + value?.parent?.slug + "/" + btoa(value?.slug)}>
                    {value?.name || "N/A"}
                </NavLink>
            );
        }

        if (header.date && value) {
            return moment(value).format("lll");
        }

        if (header.badge) {
            return header.render ? header.render(value, row) : (
                <Badge color="secondary">{value || "N/A"}</Badge>
            );
        }

        if (header.nested && value) {
            return value?.length === 0 ? "N/A" : (
                <button 
                    className="btn btn-sm btn-outline-primary" 
                    onClick={() => toggleRow(rowIndex, value)}
                >
                    {expandedRows[rowIndex] ? 'Hide' : 'Show'} Sub Category
                </button>
            );
        }

        if (header.image && value) {
            return (
                <img 
                    className='img-fluid' 
                    height={50} 
                    width={50} 
                    src={config.apiUrl + "/" + value}
                    alt="Category"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.png'; // fallback image
                        e.target.onerror = null;
                    }}
                />
            );
        }

        // Handle boolean values (for legacy support)
        if (typeof value === 'boolean') {
            return (
                <>
                    <label className='blog-table-radio mb-1'>
                        <input
                            type="radio"
                            name={`${header.key}-${rowIndex}`}
                            checked={value === true}
                            disabled={header.loader}
                            onChange={() => header.onChange?.(row, header?.key)}
                        />
                        Yes
                    </label>
                    <label className='blog-table-radio'>
                        <input
                            type="radio"
                            name={`${header.key}-${rowIndex}`}
                            checked={value === false}
                            disabled={header.loader}
                            onChange={() => header.onChange?.(row, header?.key)}
                        />
                        No
                    </label>
                </>
            );
        }

        // Default case
        if (header?.isAction) {
            return value || "";
        }

        // Handle null, undefined, or empty values
        if (value === null || value === undefined || value === "") {
            return <span className="text-muted">N/A</span>;
        }

        // Return the raw value
        return value.toString();
    };

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-5">
                <p className="text-muted">No data available</p>
            </div>
        );
    }

    return (
        <div className="member-view-wrapper">
            <div className="common-db-head mb-4">
                <div className="common-table">
                    <Table responsive hover className="table-striped">
                        <thead className="table-dark">
                            <tr>
                                {headers.map((header, idx) => (
                                    <th 
                                        key={idx} 
                                        className={header?.className || ''}
                                        style={{ 
                                            whiteSpace: 'nowrap',
                                            ...header.style 
                                        }}
                                    >
                                        {header?.label}
                                    </th>
                                ))}
                                {showActions && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <React.Fragment key={row.id || rowIndex}>
                                    <tr className={row.is_active === false ? 'table-secondary' : ''}>
                                        {headers.map((header, colIndex) => {
                                            const value = row[header?.key];
                                            
                                            return (
                                                <td 
                                                    key={colIndex}
                                                    className={header.tdClassName || ''}
                                                    style={{ 
                                                        verticalAlign: 'middle',
                                                        ...header.tdStyle 
                                                    }}
                                                >
                                                    {renderCellContent(header, value, row, rowIndex)}
                                                </td>
                                            );
                                        })}

                                        {showActions && (
                                            <td style={{ verticalAlign: 'middle' }}>
                                                {typeof renderActions === 'function' && renderActions(row)}
                                            </td>
                                        )}
                                    </tr>

                                    {/* Nested row display for subcategories */}
                                    {expandedRows[rowIndex] && (
                                        <tr>
                                            <td colSpan={headers.length + (showActions ? 1 : 0)} className="p-3">
                                                <div className="bg-light p-3 rounded">
                                                    <h6 className="mb-3">Subcategories</h6>
                                                    {row.children?.length > 0 || row.child?.length > 0 ? (
                                                        <Table size="sm" className="mb-0">
                                                            <thead>
                                                                <tr>
                                                                    <th>Name</th>
                                                                    <th>Slug</th>
                                                                    <th>Status</th>
                                                                    <th>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(row.children || row.child || []).map((item, i) => (
                                                                    <tr key={item.id || i}>
                                                                        <td>
                                                                            <div className="d-flex align-items-center">
                                                                                {item.image && (
                                                                                    <img 
                                                                                        src={`${config.apiUrl}/${item.image}`}
                                                                                        alt={item.name}
                                                                                        width="30"
                                                                                        height="30"
                                                                                        className="me-2 rounded"
                                                                                    />
                                                                                )}
                                                                                {item.name}
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <code>{item.slug}</code>
                                                                        </td>
                                                                        <td>
                                                                            <Badge color={item.is_active ? "success" : "danger"}>
                                                                                {item.is_active ? "Active" : "Inactive"}
                                                                            </Badge>
                                                                        </td>
                                                                        <td>
                                                                            <div className="d-flex gap-1">
                                                                                <NavLink to={`/cms/category/view/${btoa(item.slug)}`}>
                                                                                    <Button color="info" size="sm" title="View">
                                                                                        <FaEye />
                                                                                    </Button>
                                                                                </NavLink>
                                                                                <NavLink to={`/cms/category/update/${btoa(item.slug)}`}>
                                                                                    <Button color="primary" size="sm" title="Edit">
                                                                                        <FaRegEdit />
                                                                                    </Button>
                                                                                </NavLink>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    ) : (
                                                        <p className="text-muted mb-0">No subcategories found.</p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            {/* Table Info */}
            {data.length > 0 && (
                <div className="mt-3">
                    <small className="text-muted">
                        Displaying {data.length} {data.length === 1 ? 'record' : 'records'}
                    </small>
                </div>
            )}
        </div>
    );
};

export default TableView;