import React from 'react'
import Swal from 'sweetalert2';
import { useCustomQuery } from '../utils/QueryHooks';
import {buildQueryString} from '../utils/BuildQuery'
import CategoryServices from '../services/CategoryServices';

const DropdownListing = () => {

    // Get By Root Category
    const {
        data: categoryList,
        isLoading: isCategoryLoad,
    } = useCustomQuery({
        queryKey: ['category-list'],
        service: CategoryServices.categoryList,
        params: buildQueryString([{
            key: "page", value: 1,
        }, {
            key: "limit", value: 10

        },
        {
            key: "parent_id", value: true

        },
        ]),

        select: (data) => {
            if (!data?.data?.status) {
                Swal.fire({
                    title: "Error",
                    text: data?.data?.message,
                    icon: "error",
                });
                return
            }
            return data?.data?.data;
        },
        errorMsg: "",
        onSuccess: (data) => {








        }
    });


    console.log(categoryList,"categoryList")


    return categoryList
}

export default DropdownListing