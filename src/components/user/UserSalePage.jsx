// UserSalePage.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../../light-style/user-css/userSalePage.css";
import sample from "../../assets/icons/allCategory.png";
import searchIcon from "../../assets/icons/light-search.png";
import noti from "../../assets/icons/notification.png";
import user from "../../assets/icons/user.png";
import cart from "../../assets/icons/cart.png";
import VoucherModal from "./VoucherModal";
import { useCart } from "./CartContent";
import ProductStockSearchModal from "./ProductStockSearchModal";
import LowStockModal from "./LowStockModal";

// ============================================================
// ✅ Empty image as data URI
// ============================================================
const empty_image = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#f0f3f7"/>
    <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">No Image</text>
  </svg>`)}`;

// ============================================================
// ✅ DEMO SEED DATA
// ============================================================
const PRODUCTS_KEY = "demo_products";
const CATEGORIES_KEY = "demo_categories";
const DISCOUNTS_KEY = "demo_discounts";

// ============================================================
// ✅ REAL SAMPLE IMAGES (Unsplash - free to use)
// ============================================================
const IMG = {
  // Electronics
  keyboard:   "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
  mouse:      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
  monitor:    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop",
  headphone:  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  powerbank:  "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop",
  phone:      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
  laptop:     "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
  camera:     "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
  speaker:    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
  usb:        "https://images.unsplash.com/photo-1618410320928-25228d811631?w=400&h=400&fit=crop",
  // Food
  coffee:     "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
  tea:        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop",
  burger:     "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
  soda:       "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=400&fit=crop",
  water:      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop",
  pizza:      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop",
  cake:       "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
  icecream:   "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=400&fit=crop",
  juice:      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",
  bread:      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
  // Clothing
  tshirt:     "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  shoes:      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  cap:        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
  jacket:     "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
  jeans:      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
  dress:      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
  scarf:      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop",
  glasses:    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop",
  watch:      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
  bag:        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
  // Home
  bulb:       "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop",
  cup:        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
  bottle:     "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
  lamp:       "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
  pillow:     "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop",
  towel:      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop",
  kettle:     "https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=400&h=400&fit=crop",
  plate:      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=400&h=400&fit=crop",
  spoon:      "https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?w=400&h=400&fit=crop",
  clock:      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400&fit=crop",
  // Stationery
  notebook:   "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop",
  pen:        "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=400&fit=crop",
  eraser:     "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
  pencil:     "https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&h=400&fit=crop",
  ruler:      "https://images.unsplash.com/photo-1598618443855-4c6c3e2e3e4f?w=400&h=400&fit=crop",
  stapler:    "https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&h=400&fit=crop",
  folder:     "https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&h=400&fit=crop",
  marker:     "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=400&fit=crop",
  glue:       "https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&h=400&fit=crop",
  scissors:   "https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&h=400&fit=crop",
  // Category images
  catElectronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop",
  catFood:        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
  catClothing:    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop",
  catHome:        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop",
  catStationery:  "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=400&fit=crop",
};

// ============================================================
// ✅ 5 Categories
// ============================================================
const SEED_CATEGORIES = [
  { id: 1, name: "အီလက်ထရောနစ်", name_en: "Electronics",     status: "Active", image: IMG.catElectronics, filterKey: "electronics", createdAt: new Date().toISOString() },
  { id: 2, name: "အစားအသောက်",    name_en: "Food & Beverage", status: "Active", image: IMG.catFood,        filterKey: "food",        createdAt: new Date().toISOString() },
  { id: 3, name: "အဝတ်အထည်",      name_en: "Clothing",        status: "Active", image: IMG.catClothing,    filterKey: "clothing",    createdAt: new Date().toISOString() },
  { id: 4, name: "အိမ်သုံးပစ္စည်း", name_en: "Home Appliances", status: "Active", image: IMG.catHome,        filterKey: "home",        createdAt: new Date().toISOString() },
  { id: 5, name: "စာရေးကိရိယာ",   name_en: "Stationery",      status: "Active", image: IMG.catStationery,  filterKey: "stationery",  createdAt: new Date().toISOString() },
];

// ============================================================
// ✅ 50 Products (10 per category)
// ============================================================
const SEED_PRODUCTS = [
  // ========== အီလက်ထရောနစ် (1) — 10 items ==========
  { id: 1,  name: "ကီးဘုတ်",       barcode: "120215421001", sku: "PRD-001", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "pcs",   costPrice: 8000,   sellingPrice: 12000,  minStock: 5,  totalStock: 25,  status: "Active", notes: "", description: "စံ USB ကီးဘုတ်",        image: IMG.keyboard,  createdAt: new Date(Date.now()-50*86400000).toISOString() },
  { id: 2,  name: "မောက်စ်",        barcode: "120215421002", sku: "PRD-002", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "pcs",   costPrice: 5000,   sellingPrice: 8500,   minStock: 5,  totalStock: 3,   status: "Active", notes: "", description: "ကြိုးမဲ့ မောက်စ်",          image: IMG.mouse,     createdAt: new Date(Date.now()-49*86400000).toISOString() },
  { id: 3,  name: "မော်နီတာ",       barcode: "120215421003", sku: "PRD-003", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "ခု",    costPrice: 180000, sellingPrice: 250000, minStock: 2,  totalStock: 8,   status: "Active", notes: "", description: "24-inch Full HD",       image: IMG.monitor,   createdAt: new Date(Date.now()-48*86400000).toISOString() },
  { id: 4,  name: "နားကြပ်",         barcode: "120215421004", sku: "PRD-004", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "ခု",    costPrice: 25000,  sellingPrice: 45000,  minStock: 5,  totalStock: 15,  status: "Active", notes: "", description: "Bluetooth နားကြပ်",       image: IMG.headphone, createdAt: new Date(Date.now()-47*86400000).toISOString() },
  { id: 5,  name: "ပါဝါဘန့်",        barcode: "120215421005", sku: "PRD-005", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "ခု",    costPrice: 15000,  sellingPrice: 28000,  minStock: 3,  totalStock: 12,  status: "Active", notes: "", description: "20000mAh Power Bank",   image: IMG.powerbank, createdAt: new Date(Date.now()-46*86400000).toISOString() },
  { id: 6,  name: "ဖုန်း",           barcode: "120215421006", sku: "PRD-006", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "လုံး",  costPrice: 250000, sellingPrice: 380000, minStock: 2,  totalStock: 7,   status: "Active", notes: "", description: "Smartphone",             image: IMG.phone,     createdAt: new Date(Date.now()-45*86400000).toISOString() },
  { id: 7,  name: "လက်တော့ပ်",      barcode: "120215421007", sku: "PRD-007", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "လုံး",  costPrice: 800000, sellingPrice: 1200000,minStock: 1,  totalStock: 5,   status: "Active", notes: "", description: "15-inch Laptop",        image: IMG.laptop,    createdAt: new Date(Date.now()-44*86400000).toISOString() },
  { id: 8,  name: "ကင်မရာ",         barcode: "120215421008", sku: "PRD-008", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "လုံး",  costPrice: 350000, sellingPrice: 520000, minStock: 2,  totalStock: 4,   status: "Active", notes: "", description: "DSLR Camera",           image: IMG.camera,    createdAt: new Date(Date.now()-43*86400000).toISOString() },
  { id: 9,  name: "စပီကာ",          barcode: "120215421009", sku: "PRD-009", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "ခု",    costPrice: 35000,  sellingPrice: 58000,  minStock: 3,  totalStock: 10,  status: "Active", notes: "", description: "Bluetooth Speaker",     image: IMG.speaker,   createdAt: new Date(Date.now()-42*86400000).toISOString() },
  { id: 10, name: "USB ဒရိုက်",      barcode: "120215421010", sku: "PRD-010", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "ခု",    costPrice: 8000,   sellingPrice: 15000,  minStock: 5,  totalStock: 20,  status: "Active", notes: "", description: "64GB USB Drive",        image: IMG.usb,       createdAt: new Date(Date.now()-41*86400000).toISOString() },

  // ========== အစားအသောက် (2) — 10 items ==========
  { id: 11, name: "ကော်ဖီ",          barcode: "120215421011", sku: "PRD-011", categoryId: 2, categoryName: "အစားအသောက်",     unit: "ထုပ်",  costPrice: 3500,   sellingPrice: 6000,   minStock: 10, totalStock: 40,  status: "Active", notes: "", description: "အာမေးနီးယား ကော်ဖီ",      image: IMG.coffee,    createdAt: new Date(Date.now()-40*86400000).toISOString() },
  { id: 12, name: "လဖက်ရည်",        barcode: "120215421012", sku: "PRD-012", categoryId: 2, categoryName: "အစားအသောက်",     unit: "ထုပ်",  costPrice: 2500,   sellingPrice: 4500,   minStock: 10, totalStock: 50,  status: "Active", notes: "", description: "မြန်မာ လဖက်ရည်",          image: IMG.tea,       createdAt: new Date(Date.now()-39*86400000).toISOString() },
  { id: 13, name: "ဘာဂါ",           barcode: "120215421013", sku: "PRD-013", categoryId: 2, categoryName: "အစားအသောက်",     unit: "ခု",    costPrice: 4000,   sellingPrice: 7000,   minStock: 10, totalStock: 30,  status: "Active", notes: "", description: "Beef Burger",            image: IMG.burger,    createdAt: new Date(Date.now()-38*86400000).toISOString() },
  { id: 14, name: "ဗူးသတ္တု",        barcode: "120215421014", sku: "PRD-014", categoryId: 2, categoryName: "အစားအသောက်",     unit: "ဗူး",   costPrice: 800,    sellingPrice: 1500,   minStock: 24, totalStock: 120, status: "Active", notes: "", description: "အအေး ဗူးသတ္တု",          image: IMG.soda,      createdAt: new Date(Date.now()-37*86400000).toISOString() },
  { id: 15, name: "ရေသန့်",          barcode: "120215421015", sku: "PRD-015", categoryId: 2, categoryName: "အစားအသောက်",     unit: "ပုလင်း", costPrice: 300,    sellingPrice: 700,    minStock: 50, totalStock: 200, status: "Active", notes: "", description: "1L ရေသန့်ပုလင်း",          image: IMG.water,     createdAt: new Date(Date.now()-36*86400000).toISOString() },
  { id: 16, name: "ပီဇာ",           barcode: "120215421016", sku: "PRD-016", categoryId: 2, categoryName: "အစားအသောက်",     unit: "ခု",    costPrice: 8000,   sellingPrice: 14000,  minStock: 5,  totalStock: 25,  status: "Active", notes: "", description: "Cheese Pizza",           image: IMG.pizza,     createdAt: new Date(Date.now()-35*86400000).toISOString() },
  { id: 17, name: "ကိတ်",            barcode: "120215421017", sku: "PRD-017", categoryId: 2, categoryName: "အစားအသောက်",     unit: "ခု",    costPrice: 12000,  sellingPrice: 20000,  minStock: 3,  totalStock: 15,  status: "Active", notes: "", description: "Chocolate Cake",         image: IMG.cake,      createdAt: new Date(Date.now()-34*86400000).toISOString() },
  { id: 18, name: "အိုင်စကရင်",      barcode: "120215421018", sku: "PRD-018", categoryId: 2, categoryName: "အစားအသောက်",     unit: "ခု",    costPrice: 1500,   sellingPrice: 3000,   minStock: 20, totalStock: 60,  status: "Active", notes: "", description: "Vanilla Ice Cream",      image: IMG.icecream,  createdAt: new Date(Date.now()-33*86400000).toISOString() },
  { id: 19, name: "သစ်သီးရည်",      barcode: "120215421019", sku: "PRD-019", categoryId: 2, categoryName: "အစားအသောက်",     unit: "ခွက်",  costPrice: 2000,   sellingPrice: 3500,   minStock: 15, totalStock: 45,  status: "Active", notes: "", description: "Orange Juice",           image: IMG.juice,     createdAt: new Date(Date.now()-32*86400000).toISOString() },
  { id: 20, name: "ပေါင်မုန့်",      barcode: "120215421020", sku: "PRD-020", categoryId: 2, categoryName: "အစားအသောက်",     unit: "ခု",    costPrice: 1500,   sellingPrice: 2800,   minStock: 20, totalStock: 80,  status: "Active", notes: "", description: "Fresh Bread",            image: IMG.bread,     createdAt: new Date(Date.now()-31*86400000).toISOString() },

  // ========== အဝတ်အထည် (3) — 10 items ==========
  { id: 21, name: "တီရှပ်",          barcode: "120215421021", sku: "PRD-021", categoryId: 3, categoryName: "အဝတ်အထည်",      unit: "ထည်",   costPrice: 6000,   sellingPrice: 12000,  minStock: 5,  totalStock: 30,  status: "Active", notes: "", description: "Cotton T-Shirt",         image: IMG.tshirt,    createdAt: new Date(Date.now()-30*86400000).toISOString() },
  { id: 22, name: "ဖိနပ်",           barcode: "120215421022", sku: "PRD-022", categoryId: 3, categoryName: "အဝတ်အထည်",      unit: "စုံ",   costPrice: 20000,  sellingPrice: 35000,  minStock: 3,  totalStock: 14,  status: "Active", notes: "", description: "Sports Shoes",           image: IMG.shoes,     createdAt: new Date(Date.now()-29*86400000).toISOString() },
  { id: 23, name: "ဦးထုပ်",          barcode: "120215421023", sku: "PRD-023", categoryId: 3, categoryName: "အဝတ်အထည်",      unit: "ခု",    costPrice: 3000,   sellingPrice: 6500,   minStock: 10, totalStock: 35,  status: "Active", notes: "", description: "Baseball Cap",           image: IMG.cap,       createdAt: new Date(Date.now()-28*86400000).toISOString() },
  { id: 24, name: "ဂျာကင်အင်္ကျီ",   barcode: "120215421024", sku: "PRD-024", categoryId: 3, categoryName: "အဝတ်အထည်",      unit: "ထည်",   costPrice: 25000,  sellingPrice: 45000,  minStock: 3,  totalStock: 12,  status: "Active", notes: "", description: "Winter Jacket",          image: IMG.jacket,    createdAt: new Date(Date.now()-27*86400000).toISOString() },
  { id: 25, name: "ဂျင်းဘောင်းဘီ",   barcode: "120215421025", sku: "PRD-025", categoryId: 3, categoryName: "အဝတ်အထည်",      unit: "ထည်",   costPrice: 15000,  sellingPrice: 28000,  minStock: 5,  totalStock: 22,  status: "Active", notes: "", description: "Denim Jeans",            image: IMG.jeans,     createdAt: new Date(Date.now()-26*86400000).toISOString() },
  { id: 26, name: "အမျိုးသမီးဝတ်စုံ", barcode: "120215421026", sku: "PRD-026", categoryId: 3, categoryName: "အဝတ်အထည်",      unit: "ထည်",   costPrice: 18000,  sellingPrice: 32000,  minStock: 3,  totalStock: 18,  status: "Active", notes: "", description: "Summer Dress",           image: IMG.dress,     createdAt: new Date(Date.now()-25*86400000).toISOString() },
  { id: 27, name: "လည်စည်း",         barcode: "120215421027", sku: "PRD-027", categoryId: 3, categoryName: "အဝတ်အထည်",      unit: "ခု",    costPrice: 4000,   sellingPrice: 8000,   minStock: 10, totalStock: 40,  status: "Active", notes: "", description: "Wool Scarf",             image: IMG.scarf,     createdAt: new Date(Date.now()-24*86400000).toISOString() },
  { id: 28, name: "မျက်မှန်",        barcode: "120215421028", sku: "PRD-028", categoryId: 3, categoryName: "အဝတ်အထည်",      unit: "လုံး",  costPrice: 10000,  sellingPrice: 18000,  minStock: 5,  totalStock: 25,  status: "Active", notes: "", description: "Sunglasses",             image: IMG.glasses,   createdAt: new Date(Date.now()-23*86400000).toISOString() },
  { id: 29, name: "လက်ပတ်နာရီ",      barcode: "120215421029", sku: "PRD-029", categoryId: 3, categoryName: "အဝတ်အထည်",      unit: "လုံး",  costPrice: 30000,  sellingPrice: 55000,  minStock: 3,  totalStock: 10,  status: "Active", notes: "", description: "Wrist Watch",            image: IMG.watch,     createdAt: new Date(Date.now()-22*86400000).toISOString() },
  { id: 30, name: "လက်ဆွဲအိတ်",     barcode: "120215421030", sku: "PRD-030", categoryId: 3, categoryName: "အဝတ်အထည်",      unit: "လုံး",  costPrice: 12000,  sellingPrice: 22000,  minStock: 5,  totalStock: 20,  status: "Active", notes: "", description: "Handbag",                image: IMG.bag,       createdAt: new Date(Date.now()-21*86400000).toISOString() },

  // ========== အိမ်သုံးပစ္စည်း (4) — 10 items ==========
  { id: 31, name: "မီးသီး",          barcode: "120215421031", sku: "PRD-031", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း",  unit: "လုံး",  costPrice: 1500,   sellingPrice: 2800,   minStock: 20, totalStock: 60,  status: "Active", notes: "", description: "LED မီးသီး 12W",           image: IMG.bulb,      createdAt: new Date(Date.now()-20*86400000).toISOString() },
  { id: 32, name: "ခွက်",            barcode: "120215421032", sku: "PRD-032", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း",  unit: "ခု",    costPrice: 2500,   sellingPrice: 4500,   minStock: 12, totalStock: 45,  status: "Active", notes: "", description: "Ceramic ခွက်",              image: IMG.cup,       createdAt: new Date(Date.now()-19*86400000).toISOString() },
  { id: 33, name: "ရေသောက်ဗူး",     barcode: "120215421033", sku: "PRD-033", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း",  unit: "ဗူး",   costPrice: 3500,   sellingPrice: 5000,   minStock: 10, totalStock: 18,  status: "Active", notes: "", description: "စတီးရေဗူး 1L",              image: IMG.bottle,    createdAt: new Date(Date.now()-18*86400000).toISOString() },
  { id: 34, name: "စားပွဲတင်မီးခွက်", barcode: "120215421034", sku: "PRD-034", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း",  unit: "လုံး",  costPrice: 12000,  sellingPrice: 20000,  minStock: 5,  totalStock: 15,  status: "Active", notes: "", description: "Table Lamp",             image: IMG.lamp,      createdAt: new Date(Date.now()-17*86400000).toISOString() },
  { id: 35, name: "ခေါင်းအုံး",      barcode: "120215421035", sku: "PRD-035", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း",  unit: "လုံး",  costPrice: 8000,   sellingPrice: 15000,  minStock: 5,  totalStock: 25,  status: "Active", notes: "", description: "Soft Pillow",            image: IMG.pillow,    createdAt: new Date(Date.now()-16*86400000).toISOString() },
  { id: 36, name: "မျက်နှာသုတ်ပဝါ", barcode: "120215421036", sku: "PRD-036", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း",  unit: "ခု",    costPrice: 3000,   sellingPrice: 5500,   minStock: 10, totalStock: 50,  status: "Active", notes: "", description: "Cotton Towel",           image: IMG.towel,     createdAt: new Date(Date.now()-15*86400000).toISOString() },
  { id: 37, name: "ရေနွေးအိုး",      barcode: "120215421037", sku: "PRD-037", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း",  unit: "လုံး",  costPrice: 25000,  sellingPrice: 42000,  minStock: 3,  totalStock: 10,  status: "Active", notes: "", description: "Electric Kettle",        image: IMG.kettle,    createdAt: new Date(Date.now()-14*86400000).toISOString() },
  { id: 38, name: "ပန်းကန်",         barcode: "120215421038", sku: "PRD-038", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း",  unit: "ခု",    costPrice: 4000,   sellingPrice: 7500,   minStock: 12, totalStock: 40,  status: "Active", notes: "", description: "Ceramic Plate",          image: IMG.plate,     createdAt: new Date(Date.now()-13*86400000).toISOString() },
  { id: 39, name: "ဇွန်း",           barcode: "120215421039", sku: "PRD-039", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း",  unit: "ခု",    costPrice: 800,    sellingPrice: 1500,   minStock: 30, totalStock: 100, status: "Active", notes: "", description: "Stainless Spoon",        image: IMG.spoon,     createdAt: new Date(Date.now()-12*86400000).toISOString() },
  { id: 40, name: "နာရီ",            barcode: "120215421040", sku: "PRD-040", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း",  unit: "လုံး",  costPrice: 15000,  sellingPrice: 25000,  minStock: 3,  totalStock: 8,   status: "Active", notes: "", description: "Wall Clock",             image: IMG.clock,     createdAt: new Date(Date.now()-11*86400000).toISOString() },

  // ========== စာရေးကိရိယာ (5) — 10 items ==========
  { id: 41, name: "စာအုပ်မှတ်စု",    barcode: "120215421041", sku: "PRD-041", categoryId: 5, categoryName: "စာရေးကိရိယာ",   unit: "ခု",    costPrice: 1500,   sellingPrice: 2500,   minStock: 10, totalStock: 50,  status: "Active", notes: "", description: "A5 မှတ်စုစာအုပ်",           image: IMG.notebook,  createdAt: new Date(Date.now()-10*86400000).toISOString() },
  { id: 42, name: "ဖောင်တိန်",        barcode: "120215421042", sku: "PRD-042", categoryId: 5, categoryName: "စာရေးကိရိယာ",   unit: "ချောင်း",costPrice: 800,    sellingPrice: 1500,   minStock: 20, totalStock: 0,   status: "Inactive", notes: "ပစ္စည်းပြတ်", description: "အပြာရောင် ဖောင်တိန်",       image: IMG.pen,       createdAt: new Date(Date.now()-9*86400000).toISOString() },
  { id: 43, name: "ခဲဖျက်",          barcode: "120215421043", sku: "PRD-043", categoryId: 5, categoryName: "စာရေးကိရိယာ",   unit: "ခု",    costPrice: 500,    sellingPrice: 1000,   minStock: 30, totalStock: 100, status: "Active", notes: "", description: "Plastic Eraser",            image: IMG.eraser,    createdAt: new Date(Date.now()-8*86400000).toISOString() },
  { id: 44, name: "ခဲတံ",            barcode: "120215421044", sku: "PRD-044", categoryId: 5, categoryName: "စာရေးကိရိယာ",   unit: "ချောင်း",costPrice: 300,    sellingPrice: 600,    minStock: 50, totalStock: 200, status: "Active", notes: "", description: "HB Pencil",              image: IMG.pencil,    createdAt: new Date(Date.now()-7*86400000).toISOString() },
  { id: 45, name: "ပေတံ",            barcode: "120215421045", sku: "PRD-045", categoryId: 5, categoryName: "စာရေးကိရိယာ",   unit: "ခု",    costPrice: 500,    sellingPrice: 1000,   minStock: 20, totalStock: 80,  status: "Active", notes: "", description: "30cm Ruler",             image: IMG.ruler,     createdAt: new Date(Date.now()-6*86400000).toISOString() },
  { id: 46, name: "စာအုပ်ချိတ်",      barcode: "120215421046", sku: "PRD-046", categoryId: 5, categoryName: "စာရေးကိရိယာ",   unit: "ခု",    costPrice: 3500,   sellingPrice: 6000,   minStock: 10, totalStock: 30,  status: "Active", notes: "", description: "Stapler",                image: IMG.stapler,   createdAt: new Date(Date.now()-5*86400000).toISOString() },
  { id: 47, name: "ဖိုင်တွဲ",          barcode: "120215421047", sku: "PRD-047", categoryId: 5, categoryName: "စာရေးကိရိယာ",   unit: "ခု",    costPrice: 1200,   sellingPrice: 2200,   minStock: 15, totalStock: 60,  status: "Active", notes: "", description: "A4 Folder",              image: IMG.folder,    createdAt: new Date(Date.now()-4*86400000).toISOString() },
  { id: 48, name: "မာကာ",            barcode: "120215421048", sku: "PRD-048", categoryId: 5, categoryName: "စာရေးကိရိယာ",   unit: "ချောင်း",costPrice: 1500,   sellingPrice: 2800,   minStock: 20, totalStock: 70,  status: "Active", notes: "", description: "Marker Pen",             image: IMG.marker,    createdAt: new Date(Date.now()-3*86400000).toISOString() },
  { id: 49, name: "ကော်ရည်",         barcode: "120215421049", sku: "PRD-049", categoryId: 5, categoryName: "စာရေးကိရိယာ",   unit: "ခု",    costPrice: 800,    sellingPrice: 1500,   minStock: 25, totalStock: 90,  status: "Active", notes: "", description: "Glue Stick",             image: IMG.glue,      createdAt: new Date(Date.now()-2*86400000).toISOString() },
  { id: 50, name: "ကတ်ကြေး",         barcode: "120215421050", sku: "PRD-050", categoryId: 5, categoryName: "စာရေးကိရိယာ",   unit: "ခု",    costPrice: 2500,   sellingPrice: 4500,   minStock: 10, totalStock: 35,  status: "Active", notes: "", description: "Scissors",               image: IMG.scissors,  createdAt: new Date(Date.now()-1*86400000).toISOString() },
];

// ✅ Demo Discounts
const SEED_DISCOUNTS = [
  { id: 1, name: "Clothing 10% OFF",  type: "Percentage", discountValue: 10,  status: "Active", categoryId: 3, startDate: new Date(Date.now()-5*86400000).toISOString(), endDate: new Date(Date.now()+30*86400000).toISOString(), createdAt: new Date().toISOString() },
  { id: 2, name: "Food 500 Ks OFF",   type: "Fixed",      discountValue: 500, status: "Active", categoryId: 2, startDate: new Date(Date.now()-3*86400000).toISOString(), endDate: new Date(Date.now()+30*86400000).toISOString(), createdAt: new Date().toISOString() },
];

// ✅ localStorage helpers
const getData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) { localStorage.setItem(key, JSON.stringify(fallback)); return fallback; }
    return JSON.parse(raw);
  } catch { return fallback; }
};
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ✅ ensureSeed
const ensureSeed = () => {
  const p = getData(PRODUCTS_KEY, null);
  if (!p || !Array.isArray(p) || p.length < 50) saveData(PRODUCTS_KEY, SEED_PRODUCTS);
  const c = getData(CATEGORIES_KEY, null);
  if (!c || !Array.isArray(c) || c.length === 0) saveData(CATEGORIES_KEY, SEED_CATEGORIES);
  const d = getData(DISCOUNTS_KEY, null);
  if (!d || !Array.isArray(d) || d.length === 0) saveData(DISCOUNTS_KEY, SEED_DISCOUNTS);
};

// ✅ Apply discount
const applyDiscount = (product) => {
  const basePrice = Number(product.sellingPrice || product.price || 0);
  const discounts = getData(DISCOUNTS_KEY, []);
  const now = new Date();
  const active = discounts.find(d => {
    if (d.status !== 'Active') return false;
    if (d.startDate && new Date(d.startDate) > now) return false;
    if (d.endDate && new Date(d.endDate) < now) return false;
    if (d.categoryId && d.categoryId !== product.categoryId) return false;
    return true;
  });

  let finalPrice = basePrice;
  let discountObj = null;

  if (active) {
    if (active.type === 'Percentage') {
      finalPrice = Math.round(basePrice - (basePrice * active.discountValue / 100));
      discountObj = { id: active.id, type: 'Percentage', discountValue: active.discountValue, label: `${active.discountValue}% OFF` };
    } else if (active.type === 'Fixed') {
      finalPrice = Math.max(0, basePrice - active.discountValue);
      discountObj = { id: active.id, type: 'Fixed', discountValue: active.discountValue, label: `${active.discountValue.toLocaleString()} Ks OFF` };
    }
  }

  return {
    ...product,
    price: finalPrice,
    originalPrice: basePrice,
    hasDiscount: finalPrice < basePrice,
    discount: discountObj,
    discountAmount: basePrice - finalPrice,
  };
};

// ===== Language hook =====
const useLanguage = () => {
  const [lang, setLang] = useState(localStorage.getItem('appLanguage') || 'mm');
  useEffect(() => {
    const handler = (e) => setLang(e.detail.language);
    window.addEventListener('appLanguageChanged', handler);
    return () => window.removeEventListener('appLanguageChanged', handler);
  }, []);
  return lang;
};

// ===== Group products =====
const groupProductsByName = (products) => {
  const grouped = new Map();
  products.forEach(product => {
    const key = `${product.name}|${product.categoryId}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        key, name: product.name, categoryId: product.categoryId,
        categoryName: product.categoryName, variants: [],
        image: product.image, minPrice: product.price || 0,
        maxPrice: product.price || 0, totalStock: product.totalStock || 0,
        firstVariant: product
      });
    }
    const g = grouped.get(key);
    g.variants.push(product);
    const price = product.price || 0;
    g.minPrice = Math.min(g.minPrice, price);
    g.maxPrice = Math.max(g.maxPrice, price);
    g.totalStock += (product.totalStock || 0);
  });
  return Array.from(grouped.values());
};

// ============================================================
// ✅ Helper: Count products per category
// ============================================================
const getCategoryCounts = () => {
  const allProducts = getData(PRODUCTS_KEY, SEED_PRODUCTS);
  const activeProducts = allProducts.filter(p => p.status === 'Active');
  const counts = {};
  let totalActive = 0;

  activeProducts.forEach(p => {
    counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    totalActive++;
  });

  return { counts, totalActive };
};

// ===== Main Component =====
const UserSalePage = () => {
  const navigate = useNavigate();
  const language = useLanguage();

  const { user: reduxUser, isAuthenticated } = useSelector((state) => state.auth);
  const currentUser = useMemo(() => {
    if (reduxUser && isAuthenticated) return reduxUser;
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  }, [reduxUser, isAuthenticated]);

  useEffect(() => { ensureSeed(); }, []);

  const {
    cartItems, addToCart: contextAddToCart, updateQuantity: contextUpdateQuantity,
    removeFromCart: contextRemoveFromCart, clearCart: contextClearCart,
    taxPercentage, setTaxPercentage, customerName, setCustomerName,
    customerPhone, setCustomerPhone, heldCarts, holdCart: contextHoldCart,
    continueHeldCart: contextContinueHeldCart, deleteHeldCart: contextDeleteHeldCart,
    checkout, branchId, isLoading: cartLoading, categories: contextCategories, fetchCategories,
    getNextInvoiceNumber
  } = useCart();

  // Local states
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showHeldCartsModal, setShowHeldCartsModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [saleData, setSaleData] = useState(null);
  const [showStockSearchModal, setShowStockSearchModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeError, setBarcodeError] = useState(null);
  const barcodeInputRef = useRef(null);

  const [isActionLoading, setIsActionLoading] = useState(false);

  const [selectedVariantModal, setSelectedVariantModal] = useState({
    isOpen: false, productGroup: null, groupName: ''
  });

  const [hasLowStock, setHasLowStock] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showLowStockModal, setShowLowStockModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [loadingDirection, setLoadingDirection] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showRedFlash, setShowRedFlash] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTimeoutRef = useRef(null);
  const [isHoldLoading, setIsHoldLoading] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categorySelectRef = useRef(null);
  const initialLoadDone = useRef(false);

  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalActiveCount, setTotalActiveCount] = useState(0);

  useEffect(() => {
    const cats = getData(CATEGORIES_KEY, SEED_CATEGORIES);
    setCategories(cats);
    const { counts, totalActive } = getCategoryCounts();
    setCategoryCounts(counts);
    setTotalActiveCount(totalActive);
  }, []);

  const formatMoney = useCallback((amount) => {
    if (amount === null || amount === undefined) return '0 Ks';
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(num)) return '0 Ks';
    const rounded = num.toFixed(1);
    return rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' Ks';
  }, []);

  const getSelectedCategoryName = useCallback(() => {
    if (selectedCategory === null) return language === "mm" ? "ပစ္စည်းအားလုံး" : "All Products";
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? cat.name : (language === "mm" ? "ပစ္စည်းအားလုံး" : "All Products");
  }, [selectedCategory, categories, language]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categorySelectRef.current && !categorySelectRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkLowStock = useCallback((list) => {
    if (!list || list.length === 0) { setLowStockCount(0); setHasLowStock(false); return; }
    let c = 0;
    list.forEach(p => { const s = p.totalStock || 0; if (s === 0 || (s > 0 && s < 5)) c++; });
    setLowStockCount(c); setHasLowStock(c > 0);
  }, []);

  const fetchProducts = useCallback((page = 1, categoryId = null, search = '', options = {}) => {
    setLoading(true);
    setError(null);
    try {
      let all = getData(PRODUCTS_KEY, SEED_PRODUCTS);
      all = all.filter(p => p.status === 'Active');
      if (categoryId) all = all.filter(p => p.categoryId === categoryId);
      if (search) {
        const q = search.toLowerCase().trim();
        all = all.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
        );
      }
      all = all.map(p => applyDiscount(p));

      const size = options.size || itemsPerPage;
      const total = all.length;
      const totalPagesCalc = Math.max(1, Math.ceil(total / size));
      const safePage = Math.min(Math.max(1, page), totalPagesCalc);
      const start = (safePage - 1) * size;
      const paged = all.slice(start, start + size);

      const grouped = groupProductsByName(paged);
      setProducts(paged);
      setGroupedProducts(grouped);
      setTotalItems(total);
      setTotalPages(totalPagesCalc);
      setCurrentPage(safePage);
      setPageInputValue(safePage.toString());
      checkLowStock(paged);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
      setIsPageLoading(false);
    }
  }, [itemsPerPage, checkLowStock]);

  useEffect(() => {
    if (!initialLoadDone.current) {
      fetchProducts(1);
      initialLoadDone.current = true;
    }
  }, [fetchProducts]);

  useEffect(() => {
    if (initialLoadDone.current) {
      setCurrentPage(1);
      fetchProducts(1, selectedCategory, searchTerm);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1, selectedCategory, searchTerm);
    }, 400);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm]);

  useEffect(() => {
    const handler = () => setShowHeldCartsModal(true);
    window.addEventListener('showHeldCartsModal', handler);
    return () => window.removeEventListener('showHeldCartsModal', handler);
  }, []);

  const playSuccessBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = 1800;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } catch (err) {}
  }, []);

  useEffect(() => {
    const handleBarcodeScanned = (e) => {
      const barcode = e.detail.barcode;
      if (!barcode) return;
      const all = getData(PRODUCTS_KEY, SEED_PRODUCTS).map(p => applyDiscount(p));
      const found = all.find(p => p.barcode === barcode || p.sku === barcode);
      if (found) {
        const sameName = all.filter(p => p.name === found.name);
        if (sameName.length > 1) {
          setSelectedVariantModal({ isOpen: true, productGroup: { ...found, variants: sameName }, groupName: found.name });
        } else {
          const avail = found.totalStock || 0;
          const exist = cartItems.find(i => i.id === found.id);
          const cur = exist ? exist.quantity : 0;
          if (cur + 1 > avail) { alert(language === "mm" ? `${found.name} လက်ကျန် ${avail} ခုသာရှိပါသည်` : `${found.name} only ${avail} items in stock`); return; }
          contextAddToCart(found);
          playSuccessBeep();
          setShowRedFlash(true);
          setTimeout(() => setShowRedFlash(false), 300);
        }
      } else {
        alert(language === "mm" ? `Barcode "${barcode}" မတွေ့ပါ` : `Barcode "${barcode}" not found`);
      }
    };
    window.addEventListener('barcodeScanned', handleBarcodeScanned);
    return () => window.removeEventListener('barcodeScanned', handleBarcodeScanned);
  }, [cartItems, language, contextAddToCart, playSuccessBeep]);

  useEffect(() => {
    const handler = (e) => {
      setIsBarcodeModalOpen(e.detail.isOpen);
      setBarcodeInput("");
      setBarcodeError(null);
    };
    window.addEventListener('toggleBarcodeScanner', handler);
    return () => window.removeEventListener('toggleBarcodeScanner', handler);
  }, []);

  useEffect(() => {
    if (isBarcodeModalOpen && barcodeInputRef.current) {
      setTimeout(() => barcodeInputRef.current.focus(), 100);
    }
  }, [isBarcodeModalOpen]);

  const searchAndAddByBarcode = useCallback((barcode) => {
    if (!barcode.trim()) return;
    setBarcodeError(null);
    const all = getData(PRODUCTS_KEY, SEED_PRODUCTS).map(p => applyDiscount(p));
    const found = all.find(p => p.barcode === barcode || p.sku === barcode);
    if (found) {
      const avail = found.totalStock || 0;
      const exist = cartItems.find(i => i.id === found.id);
      const cur = exist ? exist.quantity : 0;
      if (cur + 1 > avail) { setBarcodeError(language === "mm" ? `${found.name} လက်ကျန် ${avail} ခုသာရှိပါသည်` : `${found.name} only ${avail} items in stock`); return; }
      contextAddToCart(found);
      setBarcodeInput("");
    } else {
      setBarcodeError(language === "mm" ? `Barcode "${barcode}" မတွေ့ပါ` : `Barcode "${barcode}" not found`);
    }
  }, [cartItems, language, contextAddToCart]);

  const handleBarcodeKeyPress = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); searchAndAddByBarcode(barcodeInput); }
  };

  const clearBarcodeInput = () => {
    setBarcodeInput(""); setBarcodeError(null);
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  };

  const changePage = useCallback((pageNumber, direction = null) => {
    if (pageNumber < 1 || pageNumber > totalPages || isPageLoading || loading) return;
    setLoadingDirection(direction);
    setIsPageLoading(true);
    setCurrentPage(pageNumber);
    setPageInputValue(pageNumber.toString());
    fetchProducts(pageNumber, selectedCategory, searchTerm);
  }, [totalPages, isPageLoading, loading, fetchProducts, selectedCategory, searchTerm]);

  const handlePageInputChange = (e) => setPageInputValue(e.target.value);
  const handlePageInputBlur = () => {
    let p = parseInt(pageInputValue);
    if (isNaN(p) || p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPageInputValue(p.toString());
    if (p !== currentPage) changePage(p);
  };
  const handleItemsPerPageChange = (e) => {
    const s = parseInt(e.target.value);
    setItemsPerPage(s); setCurrentPage(1); setPageInputValue("1");
    fetchProducts(1, selectedCategory, searchTerm, { size: s });
  };
  const clearSearch = () => setSearchTerm("");

  const calculateTotals = useMemo(() => {
    let subtotal = 0, discountTotal = 0, totalQuantity = 0;
    cartItems.forEach(item => {
      const orig = (item.originalPrice || item.price || 0) * item.quantity;
      const disc = (item.price || 0) * item.quantity;
      subtotal += disc;
      discountTotal += (orig - disc);
      totalQuantity += item.quantity;
    });
    const taxAmount = (subtotal * taxPercentage) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, discountTotal, taxAmount, total, totalQuantity };
  }, [cartItems, taxPercentage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) { alert(language === "mm" ? "ဈေးခြင်းထဲ ဘာမှမရှိပါ!" : "Cart is empty!"); return; }
    let nextInvoiceNo = 'Generating...';
    try {
      const inv = await getNextInvoiceNumber();
      if (inv) nextInvoiceNo = inv;
    } catch (e) {}
    setSaleData({
      items: cartItems,
      totals: calculateTotals,
      paymentMethod: selectedPayment,
      tax: taxPercentage,
      customer: { name: customerName, phone: customerPhone },
      cashier: currentUser?.name || "Cashier",
      invoiceNo: nextInvoiceNo,
    });
    setShowVoucherModal(true);
  }, [cartItems, calculateTotals, selectedPayment, taxPercentage, customerName, customerPhone, currentUser, language, getNextInvoiceNumber]);

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const completeSale = useCallback(async (finalSaleData) => {
    setIsProcessing(true);
    setProgress(20);
    setProgressText(language === "mm" ? "ငွေရှင်းနေသည်..." : "Processing...");
    try {
      setProgress(50);
      await sleep(200);
      const result = await checkout(
        finalSaleData.additionalDiscount || 0,
        finalSaleData.paymentMethod,
        true,
        finalSaleData.tax,
        finalSaleData.invoiceNo
      );
      setProgress(90);
      await sleep(200);
      setProgress(100);
      alert(language === "mm"
        ? `✅ ငွေရှင်းခြင်း အောင်မြင်ပါသည်!\nဘောင်ချာနံပါတ်: ${result.invoiceNo}`
        : `✅ Payment successful!\nInvoice No: ${result.invoiceNo}`);
      fetchProducts(currentPage, selectedCategory, searchTerm);
      setTimeout(() => { setIsProcessing(false); setProgress(0); }, 500);
    } catch (error) {
      console.error(error);
      alert(language === "mm" ? `❌ ငွေရှင်းခြင်း မအောင်မြင်ပါ\n${error.message}` : `❌ Checkout failed\n${error.message}`);
      setIsProcessing(false);
    }
  }, [checkout, language, fetchProducts, currentPage, selectedCategory, searchTerm]);

  const clearCartWithLoading = useCallback(async () => {
    if (cartItems.length === 0) return;
    const msg = language === "mm" ? "ဈေးခြင်းထဲမှ ပစ္စည်းအားလုံးကို ဖျက်ရန် သေချာပါသလား?" : "Are you sure you want to clear all items from cart?";
    if (!window.confirm(msg)) return;
    setIsActionLoading(true);
    try { contextClearCart(); } finally { setIsActionLoading(false); }
  }, [cartItems, language, contextClearCart]);

  const holdCart = useCallback(async () => {
    if (cartItems.length === 0) { alert(language === "mm" ? "ဈေးခြင်းထဲ ဘာမှမရှိပါ!" : "Cart is empty!"); return; }
    setIsHoldLoading(true);
    try {
      const result = await contextHoldCart();
      if (result) alert(language === "mm" ? `ဈေးခြင်းကို ${customerName} အတွက် ခေတ္တထားပြီးပါပြီ!` : `Cart held successfully for ${customerName}!`);
    } finally { setIsHoldLoading(false); }
  }, [cartItems, language, contextHoldCart, customerName]);

  const continueHeldCart = useCallback((heldCart) => {
    contextContinueHeldCart(heldCart);
    setShowHeldCartsModal(false);
  }, [contextContinueHeldCart]);

  const deleteHeldCart = useCallback((cartId) => {
    const msg = language === "mm" ? "ခေတ္တထားထားသော ဈေးခြင်းကို ဖျက်ရန် သေချာပါသလား?" : "Are you sure you want to delete this held cart?";
    if (window.confirm(msg)) contextDeleteHeldCart(cartId);
  }, [language, contextDeleteHeldCart]);

  const saveCustomerInfo = useCallback(() => {
    setShowCustomerModal(false);
    alert(language === "mm" ? "ဧည့်သည်အချက်အလက် သိမ်းဆည်းပြီးပါပြီ!" : "Customer information saved!");
  }, [language]);

  const getImageSrc = useCallback((product) => {
    if (!product) return empty_image;
    return product.imageUrl || product.image || product.thumbnailUrl || empty_image;
  }, []);

  if (!currentUser) {
    return (
      <div className="userSalePage-main">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{language === "mm" ? "အသုံးပြုသူဒေတာ ဖွင့်နေသည်..." : "Loading user data..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="userSalePage-main">
      {isProcessing && (
        <div className="sale-progress-overlay">
          <div className="sale-progress-container">
            <div className="sale-progress-header">
              <span className="sale-progress-icon"><i className="fas fa-spinner fa-pulse"></i></span>
              <span className="sale-progress-title">{progressText}</span>
            </div>
            <div className="sale-progress-bar-wrapper">
              <div className="sale-progress-bar" style={{ width: `${progress}%` }}>
                <span className="sale-progress-percent">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRedFlash && <div className="red-flash-overlay"></div>}

      {showCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{language === "mm" ? "ဧည့်သည်အချက်အလက်" : "Customer Information"}</h3>
              <span onClick={() => setShowCustomerModal(false)}>✕</span>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{language === "mm" ? "ဧည့်သည်အမည်" : "Customer Name"}</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={language === "mm" ? "ဧည့်သည်အမည်ရေးပါ" : "Enter customer name"} />
              </div>
              <div className="form-group">
                <label>{language === "mm" ? "ဖုန်း" : "Phone"}</label>
                <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder={language === "mm" ? "ဖုန်းနံပါတ်ရေးပါ" : "Enter phone"} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowCustomerModal(false)}>{language === "mm" ? "မလုပ်တော့ပါ" : "Cancel"}</button>
              <button className="btn btn-primary" onClick={saveCustomerInfo}>{language === "mm" ? "သိမ်းဆည်းမည်" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {showHeldCartsModal && (
        <div className="modal-overlay">
          <div className="modal-content held-carts-modal">
            <div className="modal-header">
              <h3 className="held-carts">{language === "mm" ? "ခေတ္တထားထားသော ဈေးခြင်းများ" : "Held Carts"} ({heldCarts.length})</h3>
              <span onClick={() => setShowHeldCartsModal(false)}>✕</span>
            </div>
            <div className="modal-body">
              {heldCarts.length === 0 ? (
                <p style={{ textAlign: 'center', padding: 20 }}>{language === "mm" ? "ခေတ္တထားထားသော ဈေးခြင်းများ မရှိပါ" : "No held carts found"}</p>
              ) : (
                <div className="held-carts-list">
                  {heldCarts.map(c => (
                    <div key={c.id} className="held-cart-item">
                      <div className="held-cart-info">
                        <div className="held-cart-customer"><strong>{c.customerName}</strong><span>{c.customerPhone}</span></div>
                        <div className="held-cart-details">
                          <span>{c.items?.length || 0} {language === "mm" ? "ခု" : "items"}</span>
                          <span>{language === "mm" ? "စုစုပေါင်း:" : "Total:"} {typeof c.total === 'number' ? c.total.toLocaleString() : 0} Ks</span>
                        </div>
                      </div>
                      <div className="held-cart-actions">
                        <button className="btn btn-continue" onClick={() => continueHeldCart(c)}>{language === "mm" ? "ဆက်လက်လုပ်ဆောင်မည်" : "Continue"}</button>
                        <button className="btn btn-delete" onClick={() => deleteHeldCart(c.id)}>{language === "mm" ? "ဖျက်မည်" : "Delete"}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowHeldCartsModal(false)}>{language === "mm" ? "ပိတ်မည်" : "Close"}</button>
            </div>
          </div>
        </div>
      )}

      <button className="mobile-cart-float-btn" onClick={() => setShowMobileCart(true)}>
        <span className="cart-icon"><i className="fas fa-shopping-cart"></i></span>
        <span className="cart-total">{formatMoney(calculateTotals.total)}</span>
        {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
      </button>

            {showMobileCart && (
        <div className="mobile-cart-modal" onClick={() => setShowMobileCart(false)}>
          <div className="mobile-cart-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-cart-modal-header">
              <h3>{language === "mm" ? "ဈေးခြင်း" : "Cart"} <span>({cartItems.length} {language === "mm" ? "ခု" : "items"})</span></h3>
              <button className="mobile-cart-modal-close" onClick={() => setShowMobileCart(false)}>✕</button>
            </div>
            <div className="mobile-cart-modal-body">
              {cartItems.length === 0 ? (
                <div className="mobile-cart-empty">
                  <img src={cart} alt="cart" width="60px" />
                  <p>{language === "mm" ? "ဈေးခြင်းထဲ ပစ္စည်းမရှိပါ" : "No items in cart"}</p>
                </div>
              ) : (
                cartItems.map(item => {
                  const origPrice = Number(item.originalPrice || item.price || 0);
                  const finalPrice = Number(item.price || 0);
                  const hasDisc = origPrice > finalPrice;
                  return (
                    <div key={item.id} className="mobile-cart-item">
                      <img src={getImageSrc(item)} alt={item.name} className="mobile-cart-item-img" onError={(e) => { e.target.src = empty_image; }} />
                      <div className="mobile-cart-item-info">
                        <div className="mobile-cart-item-name">{item.name}</div>
                        {hasDisc ? (
                          <div className="mobile-cart-price-block">
                            <span className="mobile-cart-original-price">{origPrice.toLocaleString()} Ks</span>
                            <span className="mobile-cart-discount-price">{finalPrice.toLocaleString()} Ks</span>
                          </div>
                        ) : (
                          <div className="mobile-cart-item-price">{finalPrice.toLocaleString()} Ks</div>
                        )}
                      </div>
                      <div className="mobile-cart-item-controls">
                        <button onClick={() => contextUpdateQuantity(item.id, item.quantity - 1)} disabled={cartLoading}>-</button>
                        <input type="number" min="1" value={item.quantity} readOnly disabled={cartLoading} />
                        <button onClick={() => contextUpdateQuantity(item.id, item.quantity + 1)} disabled={cartLoading}>+</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mobile-cart-footer">
              <div className="cart-summary-row"><span>{language === "mm" ? "အရေတွက်" : "Qty"}</span><span>{calculateTotals.totalQuantity}</span></div>
              {calculateTotals.discountTotal > 0 && (
                <div className="cart-summary-row"><span>{language === "mm" ? "လျှော့စျေး" : "Discount"}</span><span style={{ color: '#ff4444' }}>- {formatMoney(calculateTotals.discountTotal)}</span></div>
              )}
              <div className="cart-summary-row"><span>{language === "mm" ? "စုစုပေါင်း" : "Subtotal"}</span><span>{formatMoney(calculateTotals.subtotal)}</span></div>
              <div className="cart-total-row"><span>{language === "mm" ? "ပေးရမည့်ငွေ" : "Total"}</span><span>{formatMoney(calculateTotals.total)}</span></div>
              <button className="checkout-btn" onClick={() => { setShowMobileCart(false); handleCheckout(); }} disabled={cartItems.length === 0}>{language === "mm" ? "ငွေရှင်းမည်" : "Checkout"}</button>
            </div>
          </div>
        </div>
      )}

      {showVoucherModal && saleData && (
        <VoucherModal
          isOpen={showVoucherModal}
          onClose={() => setShowVoucherModal(false)}
          saleData={saleData}
          shopInfo={{
            name: "Myanmar Shop", name_en: "Myanmar Shop",
            address: "123, Yangon-Mandalay Road, Yangon", address_en: "123, Yangon-Mandalay Road, Yangon",
            phone: "09-123456789", phone_en: "09-123456789",
            cashier: currentUser?.name || "Cashier", cashier_en: currentUser?.name || "Cashier",
          }}
          onCompleteSale={completeSale}
          language={language}
          preGeneratedInvoiceNo={saleData?.invoiceNo}
        />
      )}

      {isBarcodeModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBarcodeModalOpen(false)}>
          <div className="barcode-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="barcode-modal-header">
              <h3><i className="fas fa-barcode"></i> Barcode Scanner</h3>
              <button className="barcode-modal-close" onClick={() => setIsBarcodeModalOpen(false)}>✕</button>
            </div>
            <div className="barcode-modal-body">
              <div className="barcode-input-container">
                <i className="fas fa-camera barcode-icon"></i>
                <input ref={barcodeInputRef} type="text" className="barcode-input"
                  placeholder={language === "mm" ? "Barcode ရိုက်ထည့်ပါ (သို့) Scan လုပ်ပါ" : "Enter or scan barcode"}
                  value={barcodeInput}
                  onChange={(e) => { setBarcodeInput(e.target.value); setBarcodeError(null); }}
                  onKeyPress={handleBarcodeKeyPress} autoFocus />
                {barcodeInput && <button className="barcode-clear-btn" onClick={clearBarcodeInput}>✕</button>}
              </div>
              {barcodeError && <div className="barcode-error"><i className="fas fa-exclamation-circle"></i><span>{barcodeError}</span></div>}
            </div>
          </div>
        </div>
      )}

      <div className="card-cart-container">
        <div className="card-container-show">
          {/* Category Filter */}
          <div className="user-filter-category">
            <div className="card-box">
              <div className={`cate-card horizontal ${selectedCategory === null ? 'active-category' : ''}`} onClick={() => setSelectedCategory(null)}>
                <div className="cate-img"><img src={sample} alt="all" /></div>
                <div className="cate-text">
                  <span>{language === "mm" ? "အားလုံး" : "All"}</span>
                  <p>{totalActiveCount} {language === "mm" ? "ခု" : "items"}</p>
                </div>
              </div>
              {categories.map(category => (
                <div key={category.id} className={`cate-card horizontal ${selectedCategory === category.id ? 'active-category' : ''}`} onClick={() => setSelectedCategory(category.id)}>
                  <div className="cate-img"><img src={category.image || sample} alt={category.name} /></div>
                  <div className="cate-text">
                    <span>{category.name}</span>
                    <p>{categoryCounts[category.id] || 0} {language === "mm" ? "ခု" : "items"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="user-search-category">
            <div className="card-box">
              <div className="sale-search-input-container">
                <button className="search-btn"><img className="search-btn-icon" src={searchIcon} alt="search" /></button>
                <input className="sale-searchbar" type="text"
                  placeholder={language === "mm" ? "ပစ္စည်းအမည်၊ ဘားကုဒ်၊ SKU ဖြင့်ရှာရန်" : "Search by product name, barcode, or SKU"}
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={loading} />
                {searchTerm && <button className="clear-search-btn" onClick={clearSearch}>✕</button>}
              </div>

              <div className="sale-category-select-wrapper">
                <div className="sale-custom-select-wrapper" ref={categorySelectRef}>
                  <div className={`sale-custom-select-trigger ${isCategoryDropdownOpen ? 'open' : ''}`} onClick={() => !loading && setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}>
                    <span className="sale-selected-value">{getSelectedCategoryName()}</span>
                    <i className={`fas fa-chevron-${isCategoryDropdownOpen ? 'up' : 'down'}`}></i>
                  </div>
                  {isCategoryDropdownOpen && (
                    <div className="sale-custom-select-dropdown">
                      <div className={`sale-custom-option ${selectedCategory === null ? 'selected' : ''}`} onClick={() => { setSelectedCategory(null); setIsCategoryDropdownOpen(false); }}>
                        {language === "mm" ? `ပစ္စည်းအားလုံး (${totalActiveCount})` : `All Products (${totalActiveCount})`}
                      </div>
                      {categories.map(c => (
                        <div key={c.id} className={`sale-custom-option ${selectedCategory === c.id ? 'selected' : ''}`} onClick={() => { setSelectedCategory(c.id); setIsCategoryDropdownOpen(false); }}>
                          {c.name} ({categoryCounts[c.id] || 0})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button className="icon-btn notification-btn" onClick={() => setShowLowStockModal(true)} style={{ position: 'relative' }}>
                <img className="noti-icon" src={noti} alt="notification" />
                {hasLowStock && <span className="notification-badge"></span>}
                {lowStockCount > 0 && <span className="notification-count">{lowStockCount}</span>}
              </button>

              <label className="branch-checkbox-label">
                <input type="checkbox" checked={showStockSearchModal} onChange={(e) => setShowStockSearchModal(e.target.checked)} />
                {language === "mm" ? "ဆိုင်ခွဲများ" : "Shop Branch"}
              </label>
            </div>
          </div>

          {error && <div className="error-message" style={{ padding: 10, margin: 10, background: '#f8d7da', color: '#721c24', borderRadius: 5, textAlign: 'center' }}>{error}</div>}

          {/* Product Grid */}
          <div className="user-category-card-show">
            {loading ? (
              <div className="loading-state"><i className="fas fa-spinner fa-spin" style={{ fontSize: 32, color: '#4361ee' }}></i><p>{language === "mm" ? 'ပစ္စည်းများ ဖွင့်နေသည်...' : 'Loading products...'}</p></div>
            ) : (
              <div className="category-card-box">
                {groupedProducts.map(group => {
                  const isGroup = group.variants.length > 1;
                  const single = !isGroup ? group.variants[0] : null;
                  const hasStock = isGroup ? group.totalStock > 0 : (single?.totalStock || 0) > 0;
                  const stockCount = isGroup ? group.totalStock : (single?.totalStock || 0);
                  const isOutOfStock = !hasStock;
                  const price = Number(single?.price || 0);
                  const origPrice = Number(single?.originalPrice || price);
                  const hasDiscount = origPrice > price;

                  return (
                    <div key={group.key} className={`category-card-list ${isOutOfStock ? 'out-of-stock' : ''}`}
                      onClick={() => {
                        if (!hasStock) return;
                        if (isGroup) setSelectedVariantModal({ isOpen: true, productGroup: group, groupName: group.name });
                        else contextAddToCart(single);
                      }}
                      style={{ cursor: hasStock ? 'pointer' : 'not-allowed', position: 'relative', opacity: isOutOfStock ? 0.6 : 1 }}>
                      {!isGroup && !isOutOfStock && stockCount < 5 && (
                        <div className="low-stock-badge">{language === "mm" ? `လက်ကျန် ${stockCount}` : `${stockCount} left`}</div>
                      )}
                      {isOutOfStock && <div className="out-of-stock-overlay">{language === "mm" ? "ကုန်သည်" : "Out of Stock"}</div>}
                      <div className="category-image-container">
                        <img src={group.image || sample} alt={group.name} className="category-image" onError={(e) => { e.target.src = sample; }} />
                      </div>
                      <div className="cate-overlay">
                        <span className="item-name">{group.name}</span>
                        <div className="price-container">
                          {isGroup ? (
                            <span className="more-text" style={{ color: '#4361ee', fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                              <i className="fas fa-layer-group" style={{ fontSize: 12 }}></i>
                              {language === "mm" ? "ရွေးရန်" : "More"}
                            </span>
                          ) : (
                            <>
                              {hasDiscount && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 12, marginRight: 5 }}>{origPrice.toLocaleString()} Ks</span>}
                              <span className="item-price-cart" style={{ color: hasDiscount ? '#ff4444' : '#333', fontWeight: 'bold' }}>{price.toLocaleString()} Ks</span>
                            </>
                          )}
                        </div>
                      </div>
                      {!isGroup && (
                        <div className="cate-overlay-qty">
                          <div className="item-qty" style={{
                            backgroundColor: isOutOfStock ? '#ff4444' : (stockCount < 5 ? '#ff8800' : 'white'),
                            color: isOutOfStock ? 'white' : (stockCount < 5 ? 'white' : 'black')
                          }}>
                            {stockCount}{language === "mm" ? " ခု" : ""}
                          </div>
                        </div>
                      )}
                      {!isGroup && single?.hasDiscount && single?.discount && (
                        <div className="discount-badge" style={{
                          backgroundColor: '#ff4444', color: 'white', padding: '2px 8px', borderRadius: 10,
                          fontSize: 11, fontWeight: 'bold', position: 'absolute', top: 8, right: 8, zIndex: 2,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          {single.discount.label || 'Discount'}
                        </div>
                      )}
                    </div>
                  );
                })}
                {groupedProducts.length === 0 && !loading && (
                  <div className="no-products" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, background: '#f8f9fa', borderRadius: 8 }}>
                    <i className="fas fa-box-open" style={{ fontSize: 48, color: '#ccc', marginBottom: 15 }}></i>
                    <p>{language === "mm" ? 'ပစ္စည်းများ မတွေ့ပါ' : 'No products found'}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="sale-title-center">
            <div className="sale-showing-count">
              <span className="sale-count-numbers">{totalItems > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, totalItems)}</span>
              <span className="sale-count-label">{language === "mm" ? "ခုမှ" : "of"}</span>
              <span className="sale-count-numbers">{totalItems}</span>
              <span className="sale-count-label">{language === "mm" ? "ပစ္စည်း" : "items"}</span>
            </div>
            <div className="cat-compact-nav">
              <div className="sale-items-per-page">
                <select className="sale-per-page-select" value={itemsPerPage} onChange={handleItemsPerPageChange} disabled={loading || isPageLoading}>
                  <option value={10}>10</option><option value={15}>15</option><option value={20}>20</option><option value={50}>50</option>
                </select>
                <span className="sale-per-page-label">{language === "mm" ? "/စာမျက်နှာ" : "/pg"}</span>
              </div>
              <button className={`sale-nav-btn ${isPageLoading ? 'loading' : ''}`} onClick={() => changePage(currentPage - 1, 'prev')} disabled={currentPage === 1 || loading || isPageLoading}>
                {isPageLoading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
              </button>
              <div className="sale-page-control">
                <input type="text" className="sale-page-input" value={pageInputValue} onChange={handlePageInputChange} onBlur={handlePageInputBlur} onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={loading || isPageLoading} />
                <span className="sale-page-total">/ {totalPages.toLocaleString()}</span>
              </div>
              <button className={`sale-nav-btn ${isPageLoading ? 'loading' : ''}`} onClick={() => changePage(currentPage + 1, 'next')} disabled={currentPage === totalPages || totalPages === 0 || loading || isPageLoading}>
                {isPageLoading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
              </button>
            </div>
          </div>
        </div>

                {/* ✅ Cart Sidebar — Original (strikethrough) + Final Price */}
        <div className="card-cart-show">
          <div className="item-cart">
            <div className="cate-card horizontal">
              <div className="cate-main-frame">
                <div className="cate-cus-img"><img src={user} alt="customer" /></div>
                <div className="cate-text1">
                  <span className="guest">{customerName}</span>
                  <span className="guest-phone">{customerPhone}</span>
                </div>
              </div>
              <button className="close-guest" onClick={() => setShowCustomerModal(true)}>{language === "mm" ? "စာရင်းသွင်း" : "Register"}</button>
            </div>

            <div className="cart-items-card">
              <h2>{language === "mm" ? "ဈေးခြင်းထဲသို့" : "Shopping Cart"} ({cartItems.length} {language === "mm" ? "ခု" : "items"})</h2>
              <div className="sub-cart-items-card">
                {cartItems.map(item => {
                  const origPrice = Number(item.originalPrice || item.price || 0);
                  const finalPrice = Number(item.price || 0);
                  const hasDisc = origPrice > finalPrice;
                  return (
                    <div key={item.id} className="cate-card2 horizontal">
                      <div className="cate-main-frame cart-item-box">
                        <div className="cate-img2">
                          <img src={getImageSrc(item)} alt={item.name} onError={(e) => { e.target.src = empty_image; }} />
                        </div>
                        <div className="cate-text2">
                          <span className="cart-name">{item.name}</span>
                          {hasDisc ? (
                            <div className="cart-price-block">
                              <span className="cart-original-price">{origPrice.toLocaleString()} Ks</span>
                              <span className="cart-discount-price">{finalPrice.toLocaleString()} Ks</span>
                            </div>
                          ) : (
                            <span className="cart-price">{finalPrice.toLocaleString()} Ks</span>
                          )}
                        </div>
                      </div>
                      <div className="btn-collection">
                        <button className="close-guest first" onClick={(e) => { e.stopPropagation(); contextUpdateQuantity(item.id, item.quantity - 1); }} disabled={cartLoading}>-</button>
                        <input className="middle no-spin" min="1" readOnly value={item.quantity} disabled={cartLoading} />
                        <button className="close-guest third" onClick={(e) => { e.stopPropagation(); contextUpdateQuantity(item.id, item.quantity + 1); }} disabled={cartLoading}>+</button>
                      </div>
                    </div>
                  );
                })}
                {cartItems.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: '#666' }}>
                    <div style={{ fontSize: 48, color: '#ddd', marginBottom: 0 }}>
                      <img src={cart} alt="cart" width="50px" style={{ opacity: 0.1, filter: 'brightness(0) saturate(100%)' }} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 5, color: '#333' }}>{language === "mm" ? "ဈေးခြင်းထဲ ပစ္စည်းမရှိပါ" : "No items in cart"}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{language === "mm" ? "ပစ္စည်းတွေကို နှိပ်ပြီးထည့်ပါ" : "Click on products to add to cart"}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="payment-voucher-card">
              <div className="payment-voucher-card-container">
                <div className="total-qty"><span>{language === "mm" ? "အရေတွက်" : "Total Quantity"}</span><span>{calculateTotals.totalQuantity}</span></div>
                {calculateTotals.discountTotal > 0 && (
                  <div className="discount-summary"><span>{language === "mm" ? "စုစုပေါင်းလျှော့စျေး" : "Total Discount"}</span><span style={{ fontWeight: 'bold', letterSpacing: 0.5 }}>- {formatMoney(calculateTotals.discountTotal)}</span></div>
                )}
                <div className="subTotal"><span>{language === "mm" ? "စုစုပေါင်း (လျှော့ဈေးပါပီး)" : "Subtotal (Tax Excluded)"}</span><span style={{ fontWeight: 'bold', letterSpacing: 0.5 }}>{formatMoney(calculateTotals.subtotal)}</span></div>
                <div className="finalTotal"><span>{language === "mm" ? "စုစုပေါင်း" : "Total (Tax Included)"}</span><span style={{ color: '#007bff', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.5 }}>{formatMoney(calculateTotals.total)}</span></div>
                <div className="button-collection">
                  <div className="button-type">
                    <button className="btn clear" onClick={clearCartWithLoading} disabled={cartItems.length === 0 || isActionLoading || cartLoading}>{isActionLoading ? <i className="fas fa-spinner fa-spin"></i> : (language === "mm" ? "ဖျက်မည်" : "Clear")}</button>
                    <button className="btn hold" onClick={holdCart} disabled={cartItems.length === 0 || isHoldLoading}>{isHoldLoading ? <i className="fas fa-spinner fa-spin"></i> : (language === "mm" ? "ခေတ္တထား" : "Hold")}</button>
                  </div>
                  <div className="checkOut">
                    <button className="btn checkout" onClick={handleCheckout} disabled={cartItems.length === 0 || isActionLoading || cartLoading} style={cartItems.length === 0 || isActionLoading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                      {isActionLoading ? <i className="fas fa-spinner fa-spin"></i> : (language === "mm" ? "ငွေရှင်းမည်" : "Checkout")}
                    </button>
                  </div>
                </div>

                <LowStockModal isOpen={showLowStockModal} onClose={() => setShowLowStockModal(false)} language={language} branchId={branchId} />
                <ProductStockSearchModal isOpen={showStockSearchModal} onClose={() => setShowStockSearchModal(false)} language={language} branchId={branchId} />
              </div>
            </div>
          </div>
          </div>
        </div>

      {/* Variant Modal */}
      {selectedVariantModal.isOpen && selectedVariantModal.productGroup && (
        <div className="modal-overlay" onClick={() => setSelectedVariantModal({ isOpen: false, productGroup: null, groupName: '' })}>
          <div className="variant-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="variant-modal-header">
              <h3><i className="fas fa-boxes"></i> {language === "mm" ? "ပစ္စည်းအမျိုးအစားရွေးရန်" : "Select Product Variant"}</h3>
              <button className="variant-modal-close" onClick={() => setSelectedVariantModal({ isOpen: false, productGroup: null, groupName: '' })}>✕</button>
            </div>
            <div className="variant-modal-body">
              <div className="variant-group-info">
                <div className="variant-group-image"><img src={selectedVariantModal.productGroup.image || empty_image} alt={selectedVariantModal.groupName} onError={(e) => { e.target.src = empty_image; }} /></div>
                <div className="variant-group-details"><h4>{selectedVariantModal.groupName}</h4></div>
              </div>
              <div className="variant-list">
                <div className="variant-grid">
                  {selectedVariantModal.productGroup.variants.map(variant => {
                    const outOfStock = (variant.totalStock || 0) <= 0;
                    return (
                      <div key={variant.id} className={`variant-card ${outOfStock ? 'out-of-stock' : ''}`}
                        onClick={() => { if (!outOfStock) { contextAddToCart(variant); setSelectedVariantModal({ isOpen: false, productGroup: null, groupName: '' }); } }}
                        style={{ cursor: outOfStock ? 'not-allowed' : 'pointer' }}>
                        <div className="variant-card-content">
                          <div className="variant-sku">{variant.sku}</div>
                          <div className="variant-barcode">{variant.barcode}</div>
                          <div className="variant-price-detail"><span className="variant-price-value">{Number(variant.price || 0).toLocaleString()} Ks</span></div>
                          <div className="variant-stock-detail">
                            <span className={`variant-stock-badge ${outOfStock ? 'out' : 'in'}`}>{outOfStock ? (language === "mm" ? "ကုန်နေ" : "Out") : `${variant.totalStock} ${language === "mm" ? "ခုရှိ" : "in stock"}`}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="variant-modal-footer">
              <button className="variant-btn-cancel" onClick={() => setSelectedVariantModal({ isOpen: false, productGroup: null, groupName: '' })}>{language === "mm" ? "ပိတ်မည်" : "Close"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSalePage;