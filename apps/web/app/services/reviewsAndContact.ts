import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}reviews`;

export async function getReviews() {
    try {
        const response = await axios.get(`${API_URL}/get-reviews`);
        return response.data;
    } catch (error: any) {
        console.error("Fetching Reviews failed:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Failed to fetch the reviews. Please try again later."
        };
    }
}

export async function contactSupport(data: Object, token: string) {
    try {
        const response = await axios.post(
            `${API_URL}/contact`,
            { data },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Submission Failed:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Submission failed, Login might be invalid, Try Login Again."
        };
    }
}