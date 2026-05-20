import api from "@/constants/api";
import { Product } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export type CartItem = {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    size: string;
    price: number;
}

type CartContextType = {
    cartItems: CartItem[],
    addToCart: (Product: Product, size: string) => Promise<void>;
    removeFromCart: (itemId: string, size: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number, size: string) => Promise<void>;
    clearCart: () => Promise<void>;
    cartTotal: number;
    itemCount: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children} : {children: ReactNode}) {

    const {getToken, isSignedIn} = useAuth()

    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [cartTotal, setCartTotal] = useState(0)
    //const [itemCount, setItemCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const fetchCart = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.get('/cart', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (data.success && data.data) {
                const serverCart = data.data;
                const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
                id: item.product._id,
                productId: item.product._id,
                product: item.product,
                quantity: item.quantity,
                size: item?.size || 'M',
                price: item.product.price
                }));
                setCartItems(mappedItems)
                setCartTotal(serverCart.totalAmount)
            }
        } catch (error) {
            console.error("Error fetching cart:", error)
        } finally {
            setIsLoading(false)
        }
        
        
        
    }

    const addToCart = async (product: Product, size: string) => {
        if (!isSignedIn) {
            return Toast.show({
                type: 'error',
                text1: 'Please sign in to add items to your cart'
            })
        }
        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.post('/cart/add', {
                productId: product._id,
                quantity: 1,
                size
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (data.success) {
                await fetchCart();
            }
        } catch (error: any) {
            console.error("Error adding item to cart:", error)
            Toast.show({
                type: 'error',
                text1: 'Error adding item to cart'
            })
        } finally {
            setIsLoading(false);
        }
    }

    const removeFromCart = async (productId: string, size: string) => {
        if (!isSignedIn) return;

        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.delete(`/cart/item/${productId}?size=${size}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (data.success) {
                await fetchCart();
            }
        } catch (error) {
            console.error("Error removing item from cart:", error)
        } finally {
            setIsLoading(false);
        }
    }

    const updateQuantity = async (productId:string, quantity: number, size: string ) => {
        if (!isSignedIn) return;
        if (quantity < 1) return;

        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.put(`/cart/item/${productId}`, {
                quantity, size
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (data.success) {
                await fetchCart();
            }
        } catch (error: any) {
            console.error("Error updating cart item:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const clearCart = async () => {
        if (!isSignedIn) return;

        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.delete(`/cart/`,  {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (data.success) {
                setCartItems([]);
                setCartTotal(0);
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
        } finally {
            setIsLoading(false)
        }
    }

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    useEffect(() => {
        if (isSignedIn) {
            fetchCart();
        } else {
            setCartItems([]);
            setCartTotal(0);
        }
    }, [isSignedIn])

    return (
    <CartContext.Provider value={{
        cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount, isLoading
    }}>
        {children}
    </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}