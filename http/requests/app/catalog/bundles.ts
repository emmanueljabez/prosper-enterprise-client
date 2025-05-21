import axiosInstance from "~/http/axios";
import type { Bundle, BundleItem } from "@/types/catalog/bundles"

export default {
    fetchBundles() {
        return axiosInstance.get(`/bundles`)
    },

    getBundleById(id: string) {
        return axiosInstance.get(`/bundles/${id}`)
    },

    createBundle(bundle: Bundle) {
        return axiosInstance.post(`/bundles`, bundle)
    },

    updateBundle(id: string, bundle: Bundle) {
        return axiosInstance.put(`/bundles/${id}`, bundle)
    },

    deleteBundle(id: string) {
        return axiosInstance.delete(`/bundles/${id}`)
    },

    updateBundleStatus(id: string, status: string, reason?: string) {
        return axiosInstance.patch(`/bundles/${id}/status`, { 
            status,
            statusReason: reason
        })
    },

    duplicateBundle(id: string) {
        return axiosInstance.post(`/bundles/${id}/duplicate`)
    },

    updateBundleItems(id: string, items: BundleItem[]) {
        return axiosInstance.patch(`/bundles/${id}/items`, {
            bundleItems: items
        })
    },

    bulkUpdateBundles(ids: string[], updates: any) {
        return axiosInstance.patch(`/bundles/bulk-update`, {
            bundleIds: ids,
            updates
        })
    }
}