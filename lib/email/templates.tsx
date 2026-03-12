export function orderConfirmationEmail(params: {
  customerName: string;
  orderId: string;
  cookName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  fulfillmentType: string;
  pickupTime?: string;
}) {
  const itemsHtml = params.items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>x${item.quantity}</td><td>$${(item.price / 100).toFixed(2)}</td></tr>`
    )
    .join("");

  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #E8672A; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">HomePlate</h1>
      </div>
      <div style="padding: 24px;">
        <h2>Order Confirmed!</h2>
        <p>Hi ${params.customerName},</p>
        <p>Your order from <strong>${params.cookName}</strong> has been placed.</p>
        <p><strong>Order ID:</strong> ${params.orderId}</p>
        <p><strong>Fulfillment:</strong> ${params.fulfillmentType}</p>
        ${params.pickupTime ? `<p><strong>Pickup Time:</strong> ${params.pickupTime}</p>` : ""}
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="border-bottom: 1px solid #eee;">
              <th style="text-align: left; padding: 8px;">Item</th>
              <th style="text-align: left; padding: 8px;">Qty</th>
              <th style="text-align: left; padding: 8px;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="font-size: 18px; font-weight: bold;">Total: $${(params.total / 100).toFixed(2)}</p>
        <p style="color: #888; font-size: 12px;">Made in a Home Kitchen — MEHKO Permitted</p>
      </div>
    </div>
  `;
}

export function newOrderCookEmail(params: {
  cookName: string;
  orderId: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  fulfillmentType: string;
  pickupTime?: string;
}) {
  const itemsList = params.items
    .map((item) => `<li>${item.name} x${item.quantity}</li>`)
    .join("");

  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #E8672A; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">HomePlate</h1>
      </div>
      <div style="padding: 24px;">
        <h2>New Order! 🎉</h2>
        <p>Hi ${params.cookName},</p>
        <p>You have a new order from <strong>${params.customerName}</strong>.</p>
        <p><strong>Order ID:</strong> ${params.orderId}</p>
        <p><strong>Fulfillment:</strong> ${params.fulfillmentType}</p>
        ${params.pickupTime ? `<p><strong>Pickup Time:</strong> ${params.pickupTime}</p>` : ""}
        <ul>${itemsList}</ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" 
           style="display: inline-block; background: #E8672A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Order
        </a>
      </div>
    </div>
  `;
}
