import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const Api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BACKEND_URL,
        prepareHeaders: (headers, { pageParam }) => {
            if (pageParam) {
                headers.set('page', String(pageParam));
            }
            return headers;
        }
    }),
    endpoints: (builder) => ({
        ownerDashData: builder.query({ query: () => 'admin/ownerDashData' }),
        usersData: builder.query({ query: (page) => `admin/user/userStats?page=${page}` }),
        contactsData: builder.query({ query: (page) => `admin/contacts/get-contacts?page=${page}` }),
        reviewsData: builder.query({ query: (page) => `admin/get-admin-review-from-panel?page=${page}` }),
        productsData: builder.query({ query: (page) => `admin/product/get-admin-products?page=${page}` }),
        ordersData: builder.query({ query: (page) => `admin/orders/get-admin-orders?page=${page}` }),

        toggleVisibleFunc: builder.mutation({
            query: (data) => ({
                url: 'admin/toggle-visibility-of-product-from-panel',
                method: 'POST',
                body: data
            })
        }),

        addProduct: builder.mutation({
            query: (data) => ({
                url: 'admin/add-product-in-panel-vistro',
                method: 'POST',
                body: data
            })
        }),

        editProduct: builder.mutation({
            query: (data) => ({
                url: 'admin/edit-product-in-panel-vistro',
                method: 'POST',
                body: data
            })
        }),

        removeProduct: builder.mutation({
            query: (data) => ({
                url: 'admin/remove-product-in-panel-vistro',
                method: 'POST',
                body: data
            })
        }),

        addImageToProduct: builder.mutation({
            query: (data) => ({
                url: 'admin/add-image-to-product-from-panel',
                method: 'POST',
                body: data
            })
        }),

        removeImageToProduct: builder.mutation({
            query: (data) => ({
                url: 'admin/remove-image-to-product-from-panel',
                method: 'POST',
                body: data
            })
        }),

        addBundleToProduct: builder.mutation({
            query: (data) => ({
                url: 'admin/add-bundle-to-product-from-panel',
                method: 'POST',
                body: data
            })
        }),

        removeBundleToProduct: builder.mutation({
            query: (data) => ({
                url: 'admin/remove-bundle-to-product-from-panel',
                method: 'POST',
                body: data
            })
        }),

        addReview: builder.mutation({
            query: (data) => ({
                url: 'admin/add-review-from-panel',
                method: 'POST',
                body: data
            })
        }),
        removeReview: builder.mutation({
            query: (data) => ({
                url: 'admin/remove-review-from-panel',
                method: 'POST',
                body: data
            })
        }),
        removeUser: builder.mutation({
            query: (data) => ({
                url: 'admin/user/admin-remove-user',
                method: 'POST',
                body: data
            })
        }),
    })
})

export const { useUsersDataQuery, useContactsDataQuery, useProductsDataQuery, useOrdersDataQuery, useReviewsDataQuery, useToggleVisibleFuncMutation, useAddProductMutation, useEditProductMutation, useRemoveProductMutation, useAddImageToProductMutation, useRemoveImageToProductMutation, useAddBundleToProductMutation, useRemoveBundleToProductMutation, useAddReviewMutation, useRemoveReviewMutation, useOwnerDashDataQuery, useServersDataQuery, useRemoveUserMutation, useRemoveServerMutation, useFeatureServerMutation, usePremiumServerMutation, useGetSlotsQuery, useAddSlotsMutation, useEditSlotsMutation, useDeleteSlotsMutation } = Api
