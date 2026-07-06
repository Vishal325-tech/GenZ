import { dbService } from '../services/dbService.js';

export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, couponUsed, discountAmount, shippingAddress, paymentMethod, deliveryDate, deliveryTime } = req.body;

    if (!products || products.length === 0 || !shippingAddress || !paymentMethod || !deliveryDate || !deliveryTime) {
      return res.status(400).json({ message: 'Missing required order details.' });
    }

    // Map through products, confirm details, and deduct stock
    const checkedProducts = [];
    for (const item of products) {
      const prod = await dbService.findProductById(item.productId);
      if (!prod) {
        return res.status(404).json({ message: `Product ${item.name} not found.` });
      }
      if (prod.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${prod.name}` });
      }

      // Deduct stock
      await dbService.updateProduct(prod._id, { stock: prod.stock - item.quantity });

      checkedProducts.push({
        productId: item.productId,
        name: prod.name,
        quantity: Number(item.quantity),
        price: Number(item.price),
        personalization: item.personalization || {}
      });
    }

    const orderData = {
      userId: req.user ? req.user.id : null,
      customerName: req.user ? (await dbService.findUserById(req.user.id))?.name || 'Guest Customer' : 'Guest Customer',
      customerEmail: req.user ? (await dbService.findUserById(req.user.id))?.email || 'guest@giftmovers.com' : 'guest@giftmovers.com',
      products: checkedProducts,
      totalAmount: Number(totalAmount),
      couponUsed: couponUsed || '',
      discountAmount: Number(discountAmount || 0),
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid', // cod is pending, online payment is instantly simulated as paid
      deliveryDate,
      deliveryTime
    };

    const order = await dbService.createOrder(orderData);
    
    // Add simple user notification if authenticated
    if (req.user) {
      const user = await dbService.findUserById(req.user.id);
      if (user) {
        const notifications = user.notifications || [];
        notifications.push({
          title: 'Order Placed!',
          message: `Your order #${order._id.substring(0,8).toUpperCase()} for ${order.products.length} item(s) has been registered.`,
          isRead: false
        });
        await dbService.updateUser(req.user.id, { notifications });
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await dbService.findOrdersByUser(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await dbService.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Authorize: customer must own the order, or be admin/manager
    if (req.user.role === 'customer' && order.userId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. Access to this order detail is restricted.' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await dbService.findOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const order = await dbService.updateOrderStatus(req.params.id, status, note);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Dispatch update notification to user
    if (order.userId) {
      const user = await dbService.findUserById(order.userId);
      if (user) {
        const notifications = user.notifications || [];
        notifications.push({
          title: `Order Status: ${status.toUpperCase()}`,
          message: `Your order #${order._id.substring(0,8).toUpperCase()} is now ${status}. ${note || ''}`,
          isRead: false
        });
        await dbService.updateUser(order.userId, { notifications });
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const order = await dbService.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).send('<h1>Order not found</h1>');
    }

    // Simple, clean printable HTML invoice wrapper
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - GenZ Royal Hampers</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; }
          .title { font-size: 32px; font-weight: bold; color: #8B0000; letter-spacing: 1px; }
          .subtitle { color: #D4AF37; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
          table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
          table td { padding: 12px; vertical-align: top; }
          table tr td:nth-child(2) { text-align: right; }
          table tr.top td table td { padding-bottom: 20px; }
          table tr.information td table td { padding-bottom: 40px; }
          table tr.heading td { background: #f9f9f9; border-bottom: 1px solid #ddd; font-weight: bold; }
          table tr.details td { padding-bottom: 20px; }
          table tr.item td { border-bottom: 1px solid #eee; }
          table tr.item.last td { border-bottom: none; }
          table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; font-size: 18px; color: #8B0000; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
          .personalization { font-size: 12px; color: #666; margin-top: 4px; font-style: italic; }
          @media print {
            body { padding: 0; }
            .invoice-box { border: none; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table>
            <tr class="top">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                      <div class="title">GENZ ROYAL HAMPERS</div>
                      <div class="subtitle">ULTRA-PREMIUM & CELEBRATION GIFTS</div>
                    </td>
                    <td>
                      <strong>Invoice #:</strong> GRH-${order._id.substring(0,8).toUpperCase()}<br>
                      <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
                      <strong>Delivery Schedule:</strong> ${order.deliveryDate} (${order.deliveryTime})
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="information">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                      <strong>From:</strong><br>
                      GenZ Royal Hampers Inc.<br>
                      123 Luxury Avenue, Bangalore<br>
                      Bangalore, KA, India<br>
                      support@genzroyal.com
                    </td>
                    <td>
                      <strong>Deliver To:</strong><br>
                      ${order.shippingAddress.name}<br>
                      ${order.shippingAddress.street}<br>
                      ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}<br>
                      Phone: ${order.shippingAddress.phone}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="heading">
              <td>Item / Personalization</td>
              <td>Price</td>
            </tr>
            ${order.products.map(p => `
              <tr class="item">
                <td>
                  <strong>${p.name}</strong> x ${p.quantity}
                  ${p.personalization.customMessage ? `<div class="personalization">Message: "${p.personalization.customMessage}"</div>` : ''}
                  ${p.personalization.wrap ? `<div class="personalization">Wrapping: ${p.personalization.wrap} (${p.personalization.ribbonColor || 'No'} ribbon)</div>` : ''}
                </td>
                <td>₹${(p.price * p.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
            
            <tr class="item">
              <td>Subtotal</td>
              <td>₹${(order.totalAmount + order.discountAmount).toLocaleString()}</td>
            </tr>
            ${order.discountAmount > 0 ? `
              <tr class="item">
                <td>Discount (Coupon: ${order.couponUsed || 'Promo'})</td>
                <td>-₹${order.discountAmount.toLocaleString()}</td>
              </tr>
            ` : ''}
            <tr class="total">
              <td></td>
              <td>Total: ₹${order.totalAmount.toLocaleString()}</td>
            </tr>
            <tr class="details">
              <td colspan="2">
                <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}<br>
                <strong>Status:</strong> ${order.paymentStatus.toUpperCase()}
              </td>
            </tr>
          </table>
          <div class="footer">
            Thank you for ordering with GenZ Royal Hampers. We deliver luxury in every box!<br>
            For any inquiries, reach us at support@genzroyal.com
          </div>
        </div>
        <script>
          // Trigger print dialog on load for user convenience
          window.onload = function() {
            // window.print();
          }
        </script>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHTML);
  } catch (error) {
    res.status(500).send('<h1>Error generating invoice</h1>');
  }
};

// --- NEW DELIVERY CONTROLLERS ---

export const assignOrder = async (req, res) => {
  try {
    const { staffId } = req.body;
    if (!staffId) {
      return res.status(400).json({ message: 'Delivery staff ID is required.' });
    }

    const deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const order = await dbService.assignOrderToDeliveryStaff(req.params.id, staffId, deliveryOTP);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Add customer notification
    if (order.userId) {
      const user = await dbService.findUserById(order.userId);
      if (user) {
        const notifications = user.notifications || [];
        notifications.push({
          title: 'Order Dispatched!',
          message: `Your order #${order._id.substring(0,8).toUpperCase()} has been dispatched. Use delivery OTP '${deliveryOTP}' to receive it.`,
          isRead: false
        });
        await dbService.updateUser(order.userId, { notifications });
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveryAssignments = async (req, res) => {
  try {
    const orders = await dbService.findOrdersByDeliveryStaff(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyDeliveryOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await dbService.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.deliveryOTP !== otp) {
      return res.status(400).json({ message: 'Invalid delivery OTP. Please verify with the customer.' });
    }

    const updatedOrder = await dbService.updateOrderStatus(req.params.id, 'delivered', 'Order successfully verified and delivered by Raju.');
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveryStaffList = async (req, res) => {
  try {
    const staff = await dbService.findDeliveryStaff();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
