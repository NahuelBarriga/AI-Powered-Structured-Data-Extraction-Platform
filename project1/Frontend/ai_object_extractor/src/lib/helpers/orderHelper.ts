import apiClient from "@/src/lib/api";

const api = apiClient.api;

export const submitOrder = async (orderData: string): Promise<any> => { //TODO: define return type
    return await api.post("/api/orders", orderData); //TODO: catch errors 
}