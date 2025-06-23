import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}auth`;

export async function register(data: Object) {
    try {
        const response = await axios.post(`${API_URL}/register`, { data });
        return response.data;
    } catch (error: any) {
        console.error("Registration failed:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Failed to register. Please try again later."
        };
    }
}

export async function login(data: Object) {
    try {
        const response = await axios.post(`${API_URL}/login`, { data });
        return response.data;
    } catch (error: any) {
        console.error("Login failed:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Failed to log in. Please try again later."
        };
    }
}

export async function verifyUser(code: string) {
    try {
        const response = await axios.post(`${API_URL}/verify?code=${code}`);
        return response.data;
    } catch (error: any) {
        console.error("User Verification Failed:", error);
        return {
            success: false,
            error: error.response?.data?.error || "User is removed because of 3 days of unverified period, try register again!"
        };
    }
}

export async function forgotPassChallenge(email: string) {
    try {
        const response = await axios.post(`${API_URL}/challenge-forgot-password`, { email });
        return response.data;
    } catch (error: any) {
        console.error("Challenge Failed:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Challenge failed, Try Login Again."
        };
    }
}
export async function verifyOTP(otp: string, email: string) {
    try {
        const response = await axios.post(`${API_URL}/verifyOTP`, { email, otp });
        return response.data;
    } catch (error: any) {
        console.error("verification Failed:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Verification failed, Try Login Again."
        };
    }
}

export async function forgotPass(email: string, otp: string, password: string) {
    try {
        const response = await axios.post(`${API_URL}/forgotPass`, { email, otp, password });
        return response.data;
    } catch (error: any) {
        console.error("Challenge Failed:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Challenge failed, Try Login Again."
        };
    }
}

export async function isTokenValid(token: string) {
    try {
        const response = await axios.post(
            `${API_URL}/verify`,
            { token },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Token Validation Failed:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Token seems invalid, Try Login Again."
        };
    }
}