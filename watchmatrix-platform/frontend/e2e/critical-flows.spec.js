import { expect, test } from "@playwright/test";

function authPayload({ role, fullName, email }) {
  return {
    ok: true,
    data: {
      accessToken: "e2e-token",
      user: {
        id: `${role.toLowerCase()}-1`,
        fullName,
        email,
        role,
        isActive: true
      }
    }
  };
}

test("buyer can sign in and land on profile", async ({ page }) => {
  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(authPayload({ role: "CUSTOMER", fullName: "Buyer E2E", email: "buyer.e2e@test.local" }))
    });
  });

  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { id: "customer-1", fullName: "Buyer E2E", email: "buyer.e2e@test.local", role: "CUSTOMER" } })
    });
  });

  await page.route("**/api/v1/orders", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) });
  });

  await page.route("**/api/v1/notifications", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) });
  });

  await page.route("**/api/v1/chat/conversations", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) });
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("buyer.e2e@test.local");
  await page.getByLabel("Password").fill("Passw0rd!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText("Buyer E2E")).toBeVisible();
});

test("customer chat flow: create conversation and send message", async ({ page }) => {
  const conversationId = "conv-e2e-1";
  const messages = [{
    id: "msg-2",
    conversationId,
    content: "Welcome",
    createdAt: new Date().toISOString(),
    sender: { id: "customer-seller-1", fullName: "Seller E2E", role: "SELLER" }
  }];

  await page.addInitScript(() => {
    localStorage.setItem("watchmatrix_access_token", "e2e-token");
    localStorage.setItem("watchmatrix_auth_user", JSON.stringify({
      id: "customer-1",
      fullName: "Buyer E2E",
      email: "buyer.e2e@test.local",
      role: "CUSTOMER"
    }));
  });

  await page.route("**/api/v1/chat/contacts/customer-seller-1/orders", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) });
  });

  await page.route("**/api/v1/chat/contacts", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: [{ id: "customer-seller-1", fullName: "Seller E2E", role: "SELLER", email: "seller.e2e@test.local" }]
      })
    });
  });

  await page.route("**/api/v1/chat/conversations", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: [{
            id: conversationId,
            type: "DIRECT",
            orderId: null,
            unreadCount: 0,
            members: [
              { id: "customer-1", fullName: "Buyer E2E", role: "CUSTOMER" },
              { id: "customer-seller-1", fullName: "Seller E2E", role: "SELLER" }
            ],
            counterpart: { id: "customer-seller-1", fullName: "Seller E2E", role: "SELLER" },
            lastMessage: { id: "msg-1", content: "Welcome", createdAt: new Date().toISOString(), sender: { id: "customer-seller-1", fullName: "Seller E2E", role: "SELLER" } }
          }]
        })
      });
      return;
    }

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          id: conversationId,
          type: "DIRECT",
          orderId: null,
          unreadCount: 0,
          members: [
            { id: "customer-1", fullName: "Buyer E2E", role: "CUSTOMER" },
            { id: "customer-seller-1", fullName: "Seller E2E", role: "SELLER" }
          ],
          counterpart: { id: "customer-seller-1", fullName: "Seller E2E", role: "SELLER" },
          lastMessage: null
        }
      })
    });
  });

  await page.route(`**/api/v1/chat/conversations/${conversationId}/messages**`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: messages
        })
      });
      return;
    }

    const payload = route.request().postDataJSON();
    const nextMessage = {
      id: `msg-${messages.length + 3}`,
      conversationId,
      content: payload.content,
      createdAt: new Date().toISOString(),
      sender: { id: "customer-1", fullName: "Buyer E2E", role: "CUSTOMER" }
    };
    messages.push(nextMessage);

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: nextMessage
      })
    });
  });

  await page.route(`**/api/v1/chat/conversations/${conversationId}/read`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { markedRead: true } }) });
  });

  await page.goto("/chat");
  await expect(page.getByRole("heading", { name: "Live Chat" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Seller E2E" })).toBeVisible();

  await page.getByPlaceholder("Type your message...").fill("Need update on order");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText("Need update on order")).toBeVisible();
});

test("seller can update sold item fulfillment to shipped with tracking", async ({ page }) => {
  const soldItem = {
    id: "item-e2e-1",
    productName: "Matrix Diver",
    productBrand: "WatchMatrix",
    quantity: 1,
    subtotal: 2500,
    sellerStatus: "PENDING",
    editableStatuses: ["PENDING", "PACKED", "SHIPPED"],
    courierName: null,
    trackingNumber: null,
    order: {
      id: "order-e2e-1",
      status: "PENDING",
      customerName: "Buyer E2E",
      customerEmail: "buyer.e2e@test.local",
      createdAt: new Date().toISOString()
    }
  };

  const fulfillmentLogs = [];

  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(authPayload({ role: "SELLER", fullName: "Seller E2E", email: "seller.e2e@test.local" }))
    });
  });

  await page.route("**/api/v1/chat/conversations", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) });
  });

  await page.route("**/api/v1/seller/products", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) });
  });

  await page.route("**/api/v1/seller/categories", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) });
  });

  await page.route("**/api/v1/orders/seller/items**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          items: [soldItem],
          pagination: { page: 1, limit: 8, total: 1, totalPages: 1 }
        }
      })
    });
  });

  await page.route("**/api/v1/orders/seller/fulfillment-logs**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          items: fulfillmentLogs,
          pagination: { page: 1, limit: 8, total: fulfillmentLogs.length, totalPages: 1 }
        }
      })
    });
  });

  await page.route("**/api/v1/orders/seller/items/item-e2e-1/status", async (route) => {
    const payload = route.request().postDataJSON();
    soldItem.sellerStatus = payload.sellerStatus;
    soldItem.courierName = payload.courierName || null;
    soldItem.trackingNumber = payload.trackingNumber || null;
    fulfillmentLogs.unshift({
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      orderId: soldItem.order.id,
      productName: soldItem.productName,
      previousStatus: "PENDING",
      nextStatus: payload.sellerStatus
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: soldItem })
    });
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("seller.e2e@test.local");
  await page.getByLabel("Password").fill("Passw0rd!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/seller$/);
  await expect(page.getByRole("heading", { name: "Seller Dashboard" })).toBeVisible();

  const soldItemRow = page.locator("tr", { hasText: "Matrix Diver" });
  await soldItemRow.locator("select").first().selectOption("SHIPPED");
  await soldItemRow.getByPlaceholder("Courier name").fill("Pathao");
  await soldItemRow.getByPlaceholder("Tracking number").fill("WM-TRACK-1001");
  await soldItemRow.getByRole("button", { name: "Update" }).click();

  await expect(soldItemRow.getByText("SHIPPED")).toBeVisible();
  await expect(soldItemRow.getByText("Courier: Pathao", { exact: false })).toBeVisible();
  await expect(page.locator("section", { hasText: "Fulfillment History" }).getByText("PENDING -> SHIPPED")).toBeVisible();
});

test("admin can sign in and open admin dashboard", async ({ page }) => {
  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(authPayload({ role: "ADMIN", fullName: "Admin E2E", email: "admin.e2e@test.local" }))
    });
  });

  await page.route("**/api/v1/admin/overview", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          users: 12,
          sellers: 4,
          activeSellers: 3,
          suspendedSellers: 1,
          products: 16,
          sellerProducts: 14,
          totalRevenue: 15000,
          orders: 7
        }
      })
    });
  });

  await page.route("**/api/v1/admin/sellers**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { items: [], pagination: { page: 1, limit: 8, total: 0, totalPages: 1 } } })
    });
  });

  await page.route("**/api/v1/admin/orders**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { items: [], pagination: { page: 1, limit: 8, total: 0, totalPages: 1 } } })
    });
  });

  await page.route("**/api/v1/admin/audit-logs**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { items: [], pagination: { page: 1, limit: 8, total: 0, totalPages: 1 } } })
    });
  });

  await page.route("**/api/v1/chat/escalations**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { items: [], pagination: { page: 1, limit: 8, total: 0, totalPages: 1 } } })
    });
  });

  await page.route("**/api/v1/chat/conversations", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) });
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("admin.e2e@test.local");
  await page.getByLabel("Password").fill("Passw0rd!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seller Intelligence" })).toBeVisible();
});
