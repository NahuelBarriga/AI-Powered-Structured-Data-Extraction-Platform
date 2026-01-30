import apiClient from "@/src/lib/api";

const api = apiClient.api;

export const submitOrder = async (orderData: string): Promise<any> => { //TODO: define return type
    const response = await api.post("/api/order", { 
        text: orderData,
        mode: 'new'
    }); //TODO: catch errors 
    return response.data;
}