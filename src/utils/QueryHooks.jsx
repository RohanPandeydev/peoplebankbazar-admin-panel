import { useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

export const useCustomQuery = ({
    queryKey, // Array of query keys
    service, // Function that makes the API call
    params = {}, // Parameters to pass to the service
    select, // Optional transform function for the returned data
    onSuccess, // Custom onSuccess handler for things like form prefill
    enabled = true, // Whether the query should run automatically
    showErrorToast = true, // Option to control error toast display
    staleTime = 0, // Default 5 minutes cache freshness
    additionalOptions = {},// Any additional React Query options
    errorMsg = ""
}) => {
    const queryClient = useQueryClient();

    // Check if we already have cached data
    const cachedData = queryClient.getQueryData(queryKey);

    const { data, isLoading, error, refetch } = useQuery(
        queryKey,
        () => service(params)
        ,
        {
            refetchOnWindowFocus: false,
            enabled,
            staleTime,
            select,
            onSuccess: (data) => {
                // If user provided an onSuccess callback, execute it
                if (onSuccess) {
                    onSuccess(data);
                }
            },
            onError: (err) => {
                console.log("Error response data:", err.response?.data);

                if (showErrorToast) {
                    const msg =
                        errorMsg || err.response?.data?.message ||
                        "An unexpected error occurred. Please try again.";

                    Swal.fire({
                        title: "Error",
                        text: msg,
                        icon: "error",
                    });
                }
            },
            ...additionalOptions
        }
    );
   

    return {
        data,
        isLoading,
        error,
        refetch,
        isCached: !!cachedData && !isLoading
    };
};