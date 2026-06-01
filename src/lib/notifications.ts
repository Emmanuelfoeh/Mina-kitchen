import { db } from '@/lib/db';
import { Resend } from 'resend';

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'hello@minakitchen.ca';
const CONTACT_PHONE = process.env.CONTACT_PHONE || '';
const CONTACT_LINE = CONTACT_PHONE
  ? `${CONTACT_EMAIL} | ${CONTACT_PHONE}`
  : CONTACT_EMAIL;

export interface NotificationData {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: string;
  estimatedDelivery?: Date;
  deliveryAddress?: Record<string, unknown>;
}

/** Minimal shape of an order needed to render confirmation email content. */
interface ConfirmationEmailOrder {
  orderNumber: string;
  deliveryType: string;
  // Accepts a JS number or a Prisma.Decimal (both expose toFixed).
  total: { toFixed: (digits: number) => string };
  scheduledFor?: Date | string | null;
  customer: { name: string };
  items: Array<{ quantity: number; menuItem: { name: string } }>;
}

export class NotificationService {
  /**
   * Send an email via Resend. When RESEND_API_KEY is not configured this is a
   * no-op that logs a structured line and reports success (so unconfigured
   * environments aren't treated as failures). This is the single seam to swap
   * or extend the email provider.
   */
  private static async sendEmail(message: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const from =
      process.env.RESEND_FROM_EMAIL || "Mina's Kitchen <onboarding@resend.dev>";

    if (!apiKey) {
      console.log(
        JSON.stringify({
          level: 'info',
          msg: 'email.skipped (RESEND_API_KEY not set)',
          to: message.to,
          subject: message.subject,
        })
      );
      return true;
    }

    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
      if (error) {
        console.error('Resend send error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send order status notification to customer
   */
  static async sendOrderStatusNotification(
    data: NotificationData
  ): Promise<boolean> {
    try {
      const emailContent = this.generateStatusEmailContent(data);

      const sent = await this.sendEmail({
        to: data.customerEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      // Track the outcome (currently structured logs; no notifications table).
      await this.storeNotification({
        orderId: data.orderId,
        customerEmail: data.customerEmail,
        type: 'order_status_update',
        subject: emailContent.subject,
        content: emailContent.html,
        status: sent ? 'sent' : 'failed',
      });

      return sent;
    } catch (error) {
      console.error('Failed to send order status notification:', error);

      // Store failed notification for retry
      await this.storeNotification({
        orderId: data.orderId,
        customerEmail: data.customerEmail,
        type: 'order_status_update',
        subject: 'Order Status Update',
        content: 'Failed to generate notification content',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  /**
   * Generate email content based on order status
   */
  private static generateStatusEmailContent(data: NotificationData) {
    const statusMessages = {
      CONFIRMED: {
        subject: `Order Confirmed - ${data.orderNumber}`,
        title: 'Your Order Has Been Confirmed! 🎉',
        message:
          "Great news! We've received and confirmed your order. Our kitchen team is getting ready to prepare your delicious African cuisine.",
        nextStep: "We'll notify you when we start preparing your order.",
      },
      PREPARING: {
        subject: `Order Being Prepared - ${data.orderNumber}`,
        title: 'Your Order is Being Prepared! 👨‍🍳',
        message:
          'Our talented chefs are now preparing your authentic African dishes with love and care.',
        nextStep:
          "We'll let you know when your order is ready for pickup or delivery.",
      },
      READY: {
        subject: `Order Ready - ${data.orderNumber}`,
        title: 'Your Order is Ready! ✅',
        message: 'Your delicious African cuisine is ready and waiting for you!',
        nextStep: data.deliveryAddress
          ? 'Our delivery driver will be with you shortly.'
          : 'You can now come pick up your order.',
      },
      OUT_FOR_DELIVERY: {
        subject: `Order Out for Delivery - ${data.orderNumber}`,
        title: 'Your Order is On Its Way! 🚚',
        message: 'Your order has left our kitchen and is on its way to you.',
        nextStep: data.estimatedDelivery
          ? `Estimated delivery time: ${data.estimatedDelivery.toLocaleTimeString()}`
          : 'You should receive it within the next 30-45 minutes.',
      },
      DELIVERED: {
        subject: `Order Delivered - ${data.orderNumber}`,
        title: 'Order Delivered Successfully! 🎊',
        message:
          'Your order has been delivered. We hope you enjoy your authentic African cuisine!',
        nextStep: "Thank you for choosing us. We'd love to hear your feedback!",
      },
      CANCELLED: {
        subject: `Order Cancelled - ${data.orderNumber}`,
        title: 'Order Cancelled',
        message:
          'Your order has been cancelled. If you have any questions, please contact us.',
        nextStep: 'Any charges will be refunded within 3-5 business days.',
      },
    };

    const statusInfo = statusMessages[
      data.status as keyof typeof statusMessages
    ] || {
      subject: `Order Update - ${data.orderNumber}`,
      title: 'Order Status Update',
      message: `Your order status has been updated to: ${data.status.replace('_', ' ')}`,
      nextStep: "We'll keep you updated on any changes.",
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusInfo.subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .status-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Mina’s Kitchen</h1>
              <p>Authentic African Cuisine</p>
            </div>
            
            <div class="content">
              <h2>${statusInfo.title}</h2>
              <p>Hello ${data.customerName},</p>
              <p>${statusInfo.message}</p>
              
              <div class="order-info">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Status:</strong> <span class="status-badge">${data.status.replace('_', ' ')}</span></p>
                ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery.toLocaleString()}</p>` : ''}
              </div>
              
              <p><strong>What's Next:</strong> ${statusInfo.nextStep}</p>
              
              <p>If you have any questions about your order, please don't hesitate to contact us.</p>
              
              <p>Thank you for choosing Mina’s Kitchen!</p>
            </div>
            
            <div class="footer">
              <p> Mina’s Kitchen | Authentic African Cuisine</p>
              <p>Contact us: ${CONTACT_LINE}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return {
      subject: statusInfo.subject,
      html,
      text: `${statusInfo.title}\n\nHello ${data.customerName},\n\n${statusInfo.message}\n\nOrder Number: ${data.orderNumber}\nStatus: ${data.status.replace('_', ' ')}\n\nWhat's Next: ${statusInfo.nextStep}\n\nThank you for choosing Mina Kitchen!`,
    };
  }

  /**
   * Store notification in database for tracking
   */
  private static async storeNotification(notification: {
    orderId: string;
    customerEmail: string;
    type: string;
    subject: string;
    content: string;
    status: 'sent' | 'failed';
    error?: string;
  }) {
    try {
      // No notifications table yet — emit a structured audit line. This is the
      // seam to persist to a Notification model later.
      console.log(
        JSON.stringify({
          level: 'info',
          msg: 'notification',
          orderId: notification.orderId,
          type: notification.type,
          status: notification.status,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  /**
   * Send order confirmation notification (when order is first placed)
   */
  static async sendOrderConfirmationNotification(
    orderId: string
  ): Promise<boolean> {
    try {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              menuItem: {
                select: {
                  name: true,
                },
              },
            },
          },
          deliveryAddress: true,
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const emailContent = this.generateConfirmationEmailContent(order);

      const sent = await this.sendEmail({
        to: order.customer.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      await this.storeNotification({
        orderId: order.id,
        customerEmail: order.customer.email,
        type: 'order_confirmation',
        subject: emailContent.subject,
        content: emailContent.html,
        status: sent ? 'sent' : 'failed',
      });

      return sent;
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      return false;
    }
  }

  /**
   * Generate order confirmation email content
   */
  private static generateConfirmationEmailContent(
    order: ConfirmationEmailOrder
  ) {
    const itemsList = order.items
      .map(item => `${item.quantity}x ${item.menuItem.name}`)
      .join(', ');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .total { font-size: 18px; font-weight: bold; color: #f97316; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
              <p>Thank you for your order!</p>
            </div>
            
            <div class="content">
              <h2>Hello ${order.customer.name}! 👋</h2>
              <p>We've received your order and we're excited to prepare your authentic African cuisine!</p>
              
              <div class="order-summary">
                <h3>Order Summary</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Items:</strong> ${itemsList}</p>
                <p><strong>Order Type:</strong> ${order.deliveryType}</p>
                ${order.scheduledFor ? `<p><strong>Scheduled For:</strong> ${new Date(order.scheduledFor).toLocaleString()}</p>` : ''}
                <p class="total"><strong>Total: $${order.total.toFixed(2)}</strong></p>
              </div>
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>We'll confirm your order within 10 minutes</li>
                <li>Our chefs will start preparing your food</li>
                <li>You'll receive updates via email as your order progresses</li>
                ${order.deliveryType === 'DELIVERY' ? "<li>We'll deliver to your specified address</li>" : "<li>We'll notify you when it's ready for pickup</li>"}
              </ul>
              
              <p>Thank you for choosing Mina’s Kitchen for your authentic African cuisine experience!</p>
            </div>
            
            <div class="footer">
              <p>Mina’s Kitchen | Authentic African Cuisine</p>
              <p>Contact us: ${CONTACT_LINE}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return {
      subject: `Order Confirmation - ${order.orderNumber}`,
      html,
      text: `Order Confirmation - ${order.orderNumber}\n\nHello ${order.customer.name}!\n\nWe've received your order: ${itemsList}\n\nOrder Number: ${order.orderNumber}\nTotal: $${order.total.toFixed(2)}\n\nThank you for choosing Mina’s Kitchen!`,
    };
  }
}
