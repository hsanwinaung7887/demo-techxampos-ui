// src/redux/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  taxPercentage: 0,
  customerName: 'ဧည့်သည်',
  customerPhone: '',
  heldCarts: [],
  isLoading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
      // Save to localStorage
      localStorage.setItem('saleCart', JSON.stringify(state.items));
    },
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          quantity: 1,
          stock: product.totalStock || 0,
          image: product.image,
          imageUrl: product.imageUrl,
          discount: product.discount,
          discountAmount: product.discountAmount,
          hasDiscount: product.hasDiscount
        });
      }
      localStorage.setItem('saleCart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item && quantity >= 1) {
        item.quantity = quantity;
        localStorage.setItem('saleCart', JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('saleCart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.setItem('saleCart', JSON.stringify([]));
    },
    setTaxPercentage: (state, action) => {
      state.taxPercentage = action.payload;
      localStorage.setItem('saleTax', JSON.stringify(state.taxPercentage));
    },
    setCustomerName: (state, action) => {
      state.customerName = action.payload;
      localStorage.setItem('saleCustomer', JSON.stringify({
        name: state.customerName,
        phone: state.customerPhone
      }));
    },
    setCustomerPhone: (state, action) => {
      state.customerPhone = action.payload;
      localStorage.setItem('saleCustomer', JSON.stringify({
        name: state.customerName,
        phone: state.customerPhone
      }));
    },
    setHeldCarts: (state, action) => {
      state.heldCarts = action.payload;
      localStorage.setItem('heldCarts', JSON.stringify(state.heldCarts));
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    loadFromLocalStorage: (state) => {
      const savedCart = localStorage.getItem('saleCart');
      if (savedCart) {
        try {
          state.items = JSON.parse(savedCart);
        } catch (e) {
          console.error('Error parsing saved cart:', e);
        }
      }
      
      const savedCustomer = localStorage.getItem('saleCustomer');
      if (savedCustomer) {
        try {
          const { name, phone } = JSON.parse(savedCustomer);
          state.customerName = name || 'ဧည့်သည်';
          state.customerPhone = phone || '';
        } catch (e) {
          console.error('Error parsing saved customer:', e);
        }
      }
      
      const savedTax = localStorage.getItem('saleTax');
      if (savedTax) {
        try {
          state.taxPercentage = JSON.parse(savedTax) || 0;
        } catch (e) {
          console.error('Error parsing saved tax:', e);
        }
      }
      
      const savedHeldCarts = localStorage.getItem('heldCarts');
      if (savedHeldCarts) {
        try {
          state.heldCarts = JSON.parse(savedHeldCarts);
        } catch (e) {
          console.error('Error parsing held carts:', e);
        }
      }
    },
  },
});

export const {
  setCartItems,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setTaxPercentage,
  setCustomerName,
  setCustomerPhone,
  setHeldCarts,
  setIsLoading,
  loadFromLocalStorage,
} = cartSlice.actions;

export default cartSlice.reducer;