import React, { useState } from 'react'
import TableView from '../../utils/TableView'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { buildQueryString } from '../../utils/BuildQuery';
import Pagination from '../../utils/Pagination';
import { useCustomQuery } from '../../utils/QueryHooks';
import BlogServices from '../../services/BlogServices';
import Loader from '../../utils/Loader/Loader';
import NoDataFound from '../../utils/NoDataFound';
import { Button, Col, FormGroup, Input, Row } from 'reactstrap';
import Swal from 'sweetalert2';
import ButtonLoader from '../../utils/Loader/ButtonLoader';
import CategoryServices from '../../services/CategoryServices';
import AsyncSelect from 'react-select/async';
import { useEffect } from 'react';
import ProtectedRoute, { ProtectedMethod } from '../../guard/RBACGuard';

import { BiReset } from "react-icons/bi";
import { FaEye, FaRegEdit } from 'react-icons/fa';
import { MdOutlineDeleteOutline } from 'react-icons/md';

const BlogList = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [limit, setLimit] = useState(10)
    const queryClient = useQueryClient()
    const [rowId, setRowId] = useState("")
    const [key, setKey] = useState(0); // Add this state to force re-render

    const [searchFilter, setSearchFilter] = useState({
        search: "",
        category: "",
        categoryName: "",
        is_published: ""


    })


    const {
        data: categoryList,
        isLoading: isCategoryLoad,
    } = useCustomQuery({
        queryKey: ['category-list',],
        service: CategoryServices.categoryList,
        params: buildQueryString([{
            key: "page", value: 1,
        }, {
            key: "limit", value: 10
        },
        {
            key: "filter", value: "name"
        },
        {
            key: "search", value: "Blog & News"
        }

        ]),

        select: (data) => {
            if (data?.data?.data?.length > 0) {
                return data?.data?.data[0]
            }
            return {}
        },
        errorMsg: "",
        onSuccess: (data) => {

        }
    });

    // Get page from URL, default to 1
    const currentPage = parseInt(searchParams.get('page') || '1');

    const {
        data: blogList,
        isLoading: isBlogLoad,
    } = useCustomQuery({
        queryKey: ['blog-list', currentPage, searchFilter],
        service: BlogServices.blogList,
        params: buildQueryString([{
            key: "page", value: currentPage || 1,
        }, {
            key: "limit", value: limit || 10
        },
        {
            key: "search", value: searchFilter?.search
        },
        {
            key: "is_published", value: searchFilter?.is_published
        },
        {
            key: "category", value: searchFilter?.category
        }

        ]),
        select: (data) => {
            return data?.data;
        },
        errorMsg: "",
        onSuccess: (data) => {

        }
    });



    const handleSearch = (e) => {
        const name = e.target.name
        const value = e.target?.value

        setSearchFilter({
            ...searchFilter, [name]: value
        })

        // Update search parameters
        searchParams.set('page', '1'); // Reset page to 1 on filter change

        // Navigate to new URL with updated search params
        navigate(`${location.pathname}?${searchParams.toString()}`);




    }

    const handleResetFilter = () => {
        setSearchFilter({
            search: "",
            category: "",
            categoryName: "",
            is_published: " "

        })
        // Update search parameters
        searchParams.set('page', '1'); // Reset page to 1 on filter change

        // Navigate to new URL with updated search params
        navigate(`${location.pathname}?${searchParams.toString()}`);
    }


    const handleSearchCategory = async (inputValue) => {
        try {
            // Only call API if categoryList.slug exists
            if (!categoryList?.slug) {
                return []; // Return empty if slug is not available
            }

            const response = await CategoryServices.categoryList(buildQueryString([{
                key: "page", value: 1,
            }, {
                key: "limit", value: 10
            }, {
                key: "parent_slug", value: categoryList?.slug
            }, {
                key: "filter", value: "slug"
            }, {
                key: "search", value: inputValue
            }]));

            return response?.data?.data?.map((category) => ({
                label: category.name,
                value: category.id,
            })) || [];
        } catch (error) {
            console.error("Error fetching Category list:", error);
            return [];
        }
    }

    // Reset the select component when the slug changes
    useEffect(() => {
        // Whenever categoryList.slug changes, it will trigger a re-render of AsyncSelect
        console.log('Category slug changed:', categoryList?.slug);
        setKey(prevKey => prevKey + 1); // Force re-render of AsyncSelect
    }, [categoryList?.slug]);  // Watch for changes in categoryList.slug


    const handleSoftDelete = (row) => {
        if (row.is_published) {
            Swal.fire({
                title: "Unpublish Required",
                text: "Please unpublish this blog before deleting it.",
                icon: "warning",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "OK",
            });
        } else {
            Swal.fire({
                title: "Are you sure?",
                text: "This blog will be deleted.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it",
            }).then((result) => {
                if (result.isConfirmed) {
                    setRowId(row?.id)

                    deletemutation.mutate({ id: row?.id });
                }
            });
        }
    };


    const renderActions = (row) => (
        <>
            <NavLink to={`/cms/blog/${btoa(row.slug)}`}>
                <Button color="info" size="sm" className="me-2"><FaEye /></Button>
            </NavLink>
            <ProtectedMethod moduleName={"blog"} action='update'>
                <NavLink to={`/cms/blog/update/${btoa(row.slug)}`}>
                    <Button color="primary" size="sm"><FaRegEdit /></Button>
                </NavLink>
            </ProtectedMethod>
            <ProtectedMethod moduleName={"blog"} action='delete'>
                <Button color="danger" className='mx-2' size="sm" disabled={row.id == rowId || deletemutation?.isLoading} onClick={() => handleSoftDelete(row)}>{row.id == rowId || deletemutation?.isLoading ? <ButtonLoader /> : <MdOutlineDeleteOutline />}</Button>
            </ProtectedMethod>



        </>
    )

    const handleChangePublishedStatus = (row) => {
        Swal.fire({
            title: row.is_published ? "Unpublish this blog?" : "Publish this blog?",
            text: "Are you sure you want to change the publish status?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, proceed",
        }).then((result) => {
            if (result.isConfirmed) {
                updatemutation.mutate({
                    slugId: row?.slug,
                    is_published: !row.is_published,
                });
            }
        });


    }

    const updatemutation = useMutation(
        (formdata) => BlogServices.updateBlogStatusBySlug(formdata),

        {
            onSuccess: (data) => {
                if (!data?.data?.status) {
                    Swal.fire({
                        title: "Error",
                        text: data?.data?.message,
                        icon: "error",
                    });
                    return
                }

                setRowId("")
                // Swal.fire({
                //   title: "Successful",
                //   text: "Blog updated  Successfully",
                //   icon: "success",
                // });



                queryClient.refetchQueries(["blog-list", currentPage])
                return;
            },
            onError: (err) => {
                Swal.fire({
                    title: "Error",
                    text: err?.response?.data?.message || err?.message,
                    icon: "error",
                });
                return;
            },
        }
    );

    const deletemutation = useMutation(
        (formdata) => BlogServices.softDeleteBlog(formdata),

        {
            onSuccess: (data) => {
                if (!data?.data?.status) {
                    Swal.fire({
                        title: "Error",
                        text: data?.data?.message,
                        icon: "error",
                    });
                    return
                }

                setRowId("")
                Swal.fire({
                    title: "Successful",
                    text: "Blog deleted  Successfully",
                    icon: "success",
                });



                queryClient.refetchQueries(["blog-list", currentPage])
                return;
            },
            onError: (err) => {
                Swal.fire({
                    title: "Error",
                    text: err?.response?.data?.message || err?.message,
                    icon: "error",
                });
                return;
            },
        }
    );
    const headers = [
        {
            key: "category",
            label: "Category",
            category: true

        },
        {
            key: "title",
            label: "Title"

        },
        {
            key: "slug",
            label: "Slug"

        },
        {
            key: "content",
            label: "Content",
            html: true
        },
        {
            key: "cover_image",
            label: "Cover Image",
            image: true
        },

        {
            key: "published_at",
            label: "Published On",
            date: true
        },

        {
            key: "is_published",
            label: "Published",
            id: rowId,
            loader: updatemutation.isLoading,
            onChange: handleChangePublishedStatus

        },
        {
            key: "Action",
            label: "",
            isAction: true

        },

    ]
    return (
        <>
            <Row>
                <Col md="3" className="mb-2">

                    <Input
                        type="text"
                        name="search"
                        autoComplete="new-slug"
                        placeholder='Search...'
                        onChange={handleSearch}
                        value={searchFilter?.search}
                    />

                </Col>

                <Col md="4" className="mb-2">
                    <FormGroup className="common-formgroup">
                        <AsyncSelect
                            key={key} // Add key prop to force re-render when category slug changes
                            cacheOptions
                            defaultOptions
                            isDisabled={isCategoryLoad || !categoryList?.slug}
                            loadOptions={handleSearchCategory}
                            placeholder={categoryList?.slug ? "Search Category..." : "Select parent category first"}
                            value={
                                searchFilter?.category
                                    ? {
                                        label: searchFilter?.categoryName,
                                        value: searchFilter?.category,
                                    }
                                    : null
                            }
                            onChange={(selectedOption) => {
                                setSearchFilter({
                                    ...searchFilter,
                                    category: selectedOption?.value,
                                    categoryName: selectedOption?.label
                                });
                            }}
                        />


                    </FormGroup>
                </Col>

                <Col md="3" className="mb-2">

                    <Input
                        type="select"
                        name="is_published"
                        onChange={handleSearch}
                        value={searchFilter?.is_published}


                    >

                        <option value={""}>Select Status</option>
                        <option value={true}>Published</option>
                        <option value={false}>Unpublished</option>
                    </Input>
                </Col>
                <Col md={2}>
                    <Button type="click" onClick={handleResetFilter} className="reset-button">
                    <BiReset />Reset</Button>
                </Col>
            </Row>

            {
                isBlogLoad ? <Loader /> : blogList?.data?.length == 0 ? <NoDataFound msg={"No Blog Found"} /> : <>
                    <TableView headers={headers} data={blogList?.data} showActions={true} renderActions={renderActions} />

                    <Pagination
                        pagination={blogList?.pagination}
                    />

                </>
            }

        </>
    )
}

export default BlogList