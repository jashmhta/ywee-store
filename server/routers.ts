import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getUserAddresses, createAddress, updateAddress, deleteAddress,
  getUserOrders, getOrderById, createOrder, generateOrderNumber,
  getUserByEmail, createUser, upsertUser, getUserByOpenId,
} from "./db";
import {
  createSessionToken, generateOpenId, verifyGoogleToken,
} from "./auth";

export const appRouter = router({
  system: systemRouter,

  // ── Auth (Google Sign-In) ──────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    googleLogin: publicProcedure
      .input(z.object({ credential: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const googleUser = await verifyGoogleToken(input.credential);
        if (!googleUser) {
          throw new Error("Invalid Google token. Please try again.");
        }

        // Find existing user by email
        let user = await getUserByEmail(googleUser.email);
        let openId: string;

        if (user) {
          openId = user.openId;
          await upsertUser({ openId, lastSignedIn: new Date() });
        } else {
          openId = generateOpenId();
          const userId = await createUser({
            openId,
            name: googleUser.name,
            email: googleUser.email,
            password: "",
            loginMethod: "google",
          });
          user = { id: userId, openId, name: googleUser.name, email: googleUser.email } as any;
        }

        const sessionToken = await createSessionToken({
          userId: user.id,
          openId,
          email: googleUser.email,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });

        return {
          success: true,
          user: { id: user.id, name: googleUser.name, email: googleUser.email, picture: googleUser.picture },
        };
      }),
  }),

  // ── Addresses ──────────────────────────────────────────────────────────────
  addresses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserAddresses(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        fullName: z.string().min(2),
        phone: z.string().min(10),
        addressLine1: z.string().min(5),
        addressLine2: z.string().optional(),
        city: z.string().min(2),
        state: z.string().min(2),
        pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        await createAddress({
          userId: ctx.user.id,
          fullName: input.fullName,
          phone: input.phone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 ?? null,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          isDefault: input.isDefault ? 1 : 0,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        fullName: z.string().min(2).optional(),
        phone: z.string().min(10).optional(),
        addressLine1: z.string().min(5).optional(),
        addressLine2: z.string().optional(),
        city: z.string().min(2).optional(),
        state: z.string().min(2).optional(),
        pincode: z.string().regex(/^\d{6}$/).optional(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...rest } = input;
        await updateAddress(id, ctx.user.id, {
          ...rest,
          isDefault: rest.isDefault !== undefined ? (rest.isDefault ? 1 : 0) : undefined,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteAddress(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ── Orders ─────────────────────────────────────────────────────────────────
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserOrders(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getOrderById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.string(),
          productName: z.string(),
          productImage: z.string().optional(),
          size: z.string().optional(),
          color: z.string().optional(),
          quantity: z.number().min(1),
          unitPrice: z.number(),
        })),
        shippingAddress: z.object({
          fullName: z.string(),
          phone: z.string(),
          addressLine1: z.string(),
          addressLine2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          pincode: z.string(),
        }),
        paymentMethod: z.enum(["cod", "upi", "card", "netbanking"]),
        couponCode: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const discount = input.couponCode === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
        const shippingFee = subtotal >= 999 ? 0 : 99;
        const total = subtotal - discount + shippingFee;
        const orderNumber = await generateOrderNumber();

        const orderId = await createOrder(
          {
            userId: ctx.user.id,
            orderNumber,
            status: "confirmed",
            paymentStatus: input.paymentMethod === "cod" ? "pending" : "paid",
            paymentMethod: input.paymentMethod,
            subtotal: subtotal.toString(),
            discount: discount.toString(),
            shippingFee: shippingFee.toString(),
            total: total.toString(),
            couponCode: input.couponCode ?? null,
            shippingFullName: input.shippingAddress.fullName,
            shippingPhone: input.shippingAddress.phone,
            shippingAddressLine1: input.shippingAddress.addressLine1,
            shippingAddressLine2: input.shippingAddress.addressLine2 ?? null,
            shippingCity: input.shippingAddress.city,
            shippingState: input.shippingAddress.state,
            shippingPincode: input.shippingAddress.pincode,
            notes: input.notes ?? null,
          },
          input.items.map(item => ({
            orderId: 0,
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage ?? null,
            size: item.size ?? null,
            color: item.color ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            totalPrice: (item.unitPrice * item.quantity).toString(),
          }))
        );

        return { success: true, orderId, orderNumber, total };
      }),
  }),
});

export type AppRouter = typeof appRouter;
