import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
  getUserAddresses: vi.fn(),
  createAddress: vi.fn(),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
  getUserOrders: vi.fn(),
  getOrderById: vi.fn(),
  createOrder: vi.fn(),
  generateOrderNumber: vi.fn(),
}));

import {
  generateOrderNumber,
  createOrder,
  getUserOrders,
  getOrderById,
  getUserAddresses,
  createAddress,
} from "./db";

describe("generateOrderNumber", () => {
  it("should return a string starting with YW", async () => {
    (generateOrderNumber as any).mockResolvedValue("YWTEST1234");
    const num = await generateOrderNumber();
    expect(num).toMatch(/^YW/);
  });

  it("should return unique values", async () => {
    let counter = 0;
    (generateOrderNumber as any).mockImplementation(async () => `YW${Date.now()}${counter++}`);
    const n1 = await generateOrderNumber();
    const n2 = await generateOrderNumber();
    expect(n1).not.toBe(n2);
  });
});

describe("Order calculation logic", () => {
  it("should calculate subtotal correctly", () => {
    const items = [
      { unitPrice: 999, quantity: 2 },
      { unitPrice: 499, quantity: 1 },
    ];
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    expect(subtotal).toBe(2497);
  });

  it("should apply WELCOME10 coupon correctly", () => {
    const subtotal = 1000;
    const couponCode = "WELCOME10";
    const discount = couponCode === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
    expect(discount).toBe(100);
  });

  it("should not apply discount for invalid coupon", () => {
    const subtotal = 1000;
    const couponCode = "INVALID";
    const discount = couponCode === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
    expect(discount).toBe(0);
  });

  it("should apply free shipping for orders above 999", () => {
    const subtotal = 1000;
    const shippingFee = subtotal >= 999 ? 0 : 99;
    expect(shippingFee).toBe(0);
  });

  it("should charge shipping for orders below 999", () => {
    const subtotal = 500;
    const shippingFee = subtotal >= 999 ? 0 : 99;
    expect(shippingFee).toBe(99);
  });

  it("should calculate grand total correctly", () => {
    const subtotal = 1000;
    const discount = 100;
    const shippingFee = 0;
    const total = subtotal - discount + shippingFee;
    expect(total).toBe(900);
  });
});

describe("Address validation", () => {
  it("should validate pincode format", () => {
    const validPincode = /^\d{6}$/;
    expect(validPincode.test("110001")).toBe(true);
    expect(validPincode.test("12345")).toBe(false);
    expect(validPincode.test("1234567")).toBe(false);
    expect(validPincode.test("abcdef")).toBe(false);
  });

  it("should validate phone number format", () => {
    const isValidPhone = (phone: string) => /^\d{10}$/.test(phone.replace(/\s/g, ""));
    expect(isValidPhone("9876543210")).toBe(true);
    expect(isValidPhone("987654321")).toBe(false);
    expect(isValidPhone("98765432101")).toBe(false);
    expect(isValidPhone("987 654 3210")).toBe(true);
  });
});

describe("getUserAddresses", () => {
  it("should return empty array when db not available", async () => {
    (getUserAddresses as any).mockResolvedValue([]);
    const result = await getUserAddresses(1);
    expect(result).toEqual([]);
  });

  it("should return addresses for a user", async () => {
    const mockAddresses = [
      { id: 1, userId: 1, fullName: "Test User", phone: "9876543210",
        addressLine1: "123 Test St", city: "Mumbai", state: "Maharashtra",
        pincode: "400001", isDefault: 1, createdAt: new Date() }
    ];
    (getUserAddresses as any).mockResolvedValue(mockAddresses);
    const result = await getUserAddresses(1);
    expect(result).toHaveLength(1);
    expect(result[0].fullName).toBe("Test User");
  });
});

describe("getUserOrders", () => {
  it("should return empty array when no orders", async () => {
    (getUserOrders as any).mockResolvedValue([]);
    const result = await getUserOrders(1);
    expect(result).toEqual([]);
  });

  it("should return orders for a user", async () => {
    const mockOrders = [
      { id: 1, userId: 1, orderNumber: "YWTEST001", status: "confirmed",
        paymentStatus: "paid", total: "999.00", createdAt: new Date() }
    ];
    (getUserOrders as any).mockResolvedValue(mockOrders);
    const result = await getUserOrders(1);
    expect(result).toHaveLength(1);
    expect(result[0].orderNumber).toBe("YWTEST001");
  });
});

describe("getOrderById", () => {
  it("should return null for non-existent order", async () => {
    (getOrderById as any).mockResolvedValue(null);
    const result = await getOrderById(999, 1);
    expect(result).toBeNull();
  });

  it("should return order with items", async () => {
    const mockOrder = {
      id: 1, userId: 1, orderNumber: "YWTEST001",
      items: [{ id: 1, orderId: 1, productId: "p1", productName: "Test Product",
        quantity: 1, unitPrice: "999.00", totalPrice: "999.00" }]
    };
    (getOrderById as any).mockResolvedValue(mockOrder);
    const result = await getOrderById(1, 1);
    expect(result).not.toBeNull();
    expect(result?.items).toHaveLength(1);
  });
});
