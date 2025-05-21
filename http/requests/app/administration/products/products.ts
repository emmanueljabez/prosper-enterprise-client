import axiosInstance from "../../../../axios/index"
import type { Product } from "@/types/administration/products/products"

export default {
    fetchProducts() {
        return axiosInstance.get(`/products`)
    },

    createProduct(product: Product) {
        return axiosInstance.post(`/products`, product)
    },
}