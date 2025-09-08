import React from 'react'
import BlogForm from '../component/blog/BlogForm'
import Wrapper from '../layouts/Wrapper'
import { useCustomQuery } from '../utils/QueryHooks';
import { buildQueryString } from '../utils/BuildQuery';
import CategoryServices from '../services/CategoryServices';
import Loader from '../utils/Loader/Loader';

const AddBlog = () => {
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




    return (
        <Wrapper>
            {isCategoryLoad ? <Loader /> : !(categoryList?.id) ? "No Category Found " : <BlogForm title={"Add Blog"} categorySlug={categoryList?.slug} />}

        </Wrapper>
    )
}

export default AddBlog