import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}products`;

interface GetProductsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  category?: string;
  filter?: string;
  tags?: string;
}

interface SearchProductsParams {
  query: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  category?: string;
  filter?: string;
  tags?: string;
}

export async function getProducts(params: GetProductsParams = {}) {
  try {
    const {
      page = 1,
      limit = 8,
      sortBy = 'lowest',
      category = 'All',
      filter = 'all',
      tags = 'all'
    } = params;

    const response = await axios.post(`${API_URL}/fetch-products`, {
      page,
      limit,
      sortBy,
      category,
      filter,
      tags
    });

    return response.data;
  } catch (error: any) {
    console.error("Fetching Products failed:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch the products. Please try again later."
    };
  }
}

export async function getFeaturedProducts() {
  try {
    const response = await axios.get(`${API_URL}/fetch-featured-products`);

    return response.data;
  } catch (error: any) {
    console.error("Fetching Featured Products failed:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch the featured products. Please try again later."
    };
  }
}

export async function fetchUserOrders(page: number, token: string | undefined) {
  try {
    const response = await axios.post(`${API_URL}/fetch-orders`, {
      page,
      token
    });

    return response.data;
  } catch (error: any) {
    console.error("Fetching Orders failed:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch the orders. Please try again later."
    };
  }
}

export async function searchProduct(query: string, params: Omit<SearchProductsParams, 'query'> = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'lowest',
      category = 'All',
      filter = 'all',
    } = params;

    const response = await axios.get(`${API_URL}/search-product`, {
      params: {
        query,
        page,
        limit,
        sortBy,
        category,
        filter
      }
    });

    return response.data;
  } catch (error: any) {
    console.error("Searching Products failed:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to search the products. Please try again later."
    };
  }
}

export async function getSingleProduct(productId: string) {
  try {
    const response = await axios.get(`${API_URL}/get-single-product?productId=${productId}`);
    return response.data;
  } catch (error: any) {
    console.error("Fetching Product failed:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch the products. Please try again later."
    };
  }
}

export async function checkoutWithStripe(products: Object) {
  try {
    const response = await axios.post(
      `${API_URL}/checkoutWithStripe`,
      { products },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Checking out failed:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to checkout the products. Please try again later."
    };
  }
}

interface PayPalProduct {
  name: string;
  price: number;
  description?: string;
  quantity?: number;
}

interface PayPalResponse {
  success: boolean;
  approvalUrl?: string;
  orderId?: string;
  error?: string;
}

export async function checkoutWithPayPal(products: PayPalProduct[]): Promise<PayPalResponse> {
  try {
    const response = await axios.post(
      `${API_URL}/checkoutWithPayPal`,
      { products },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("PayPal checkout failed:", error);
    return {
      success: false,
      error: error?.response?.data?.error || "Failed to initialize PayPal checkout. Please try again later."
    };
  }
}

export async function capturePayPalPayment(orderId: string): Promise<PayPalResponse> {
  try {
    const response = await axios.post(
      `${API_URL}/capturePayPalPayment`,
      { orderId },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("PayPal capture failed:", error);
    return {
      success: false,
      error: error?.response?.data?.error || "Failed to capture PayPal payment. Please try again later."
    };
  }
}

interface StripeVerificationResponse {
  success: boolean;
  paymentIntentId?: string;
  status?: string;
  amount?: {
    value: string;
    currency: string;
  };
  error?: string;
}

interface PlaceOrderResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  error?: string;
}

interface OrderData {
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    variant?: string;
    image?: string;
  }>;
  subtotal: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  token: string;
  paypalCaptureId?: string;
  payerEmail?: string;
  stripePaymentIntentId?: string;
}

export async function verifyStripePayment(paymentIntentId: string): Promise<StripeVerificationResponse> {
  try {
    const response = await axios.post(
      `${API_URL}/verifyStripePayment`,
      { paymentIntentId },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Stripe verification failed:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to verify Stripe payment. Please try again later."
    };
  }
}


export async function confirmStripePayment(
  paymentIntentId: string,
  paymentMethodId?: string
): Promise<StripeVerificationResponse> {
  try {
    const response = await axios.post(
      `${API_URL}/confirmStripePayment`,
      {
        paymentIntentId,
        ...(paymentMethodId && { paymentMethodId })
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Stripe confirmation failed:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to confirm Stripe payment. Please try again later."
    };
  }
}

export async function placeOrder(orderData: OrderData): Promise<PlaceOrderResponse> {
  try {
    const response = await axios.post(
      `${API_URL}/placeOrder`,
      { orderData },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Order placement failed:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to place order. Please contact support."
    };
  }
}

export const initiateDownload = async (orderId: string, itemId: string, bundleName: string, token: string) => {
   try {
    const response = await axios.post(`${API_URL}/download-file`, {
      orderId,
      itemId,
      bundleName,
      token
    }, {
      responseType: 'blob' 
    });

    return response; 
    
  } catch (error: any) {
    console.error('Download service error:', error);
    
    if (error.response && error.response.data) {
      if (error.response.data instanceof Blob) {
        const errorText = await error.response.data.text();
        try {
          const errorData = JSON.parse(errorText);
          return errorData;
        } catch {
          return { success: false, error: errorText || 'Download failed' };
        }
      }
      return error.response.data;
    }
    
    throw error;
  }
};

// export async function getOrderDetails(orderId: string, token: string): Promise<any> {
//   try {
//     const response = await axios.get(
//       `${API_URL}/orders/${orderId}`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         }
//       }
//     );

//     return response.data;
//   } catch (error: any) {
//     console.error("Failed to get order details:", error);
//     return {
//       success: false,
//       error: error.response?.data?.error || "Failed to retrieve order details."
//     };
//   }
// }

// export async function getUserOrders(token: string): Promise<any> {
//   try {
//     const response = await axios.get(
//       `${API_URL}/orders`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         }
//       }
//     );

//     return response.data;
//   } catch (error: any) {
//     console.error("Failed to get user orders:", error);
//     return {
//       success: false,
//       error: error.response?.data?.error || "Failed to retrieve order history."
//     };
//   }
// }