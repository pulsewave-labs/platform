import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Subscription tiers and pricing
export const SUBSCRIPTION_PLANS = {
  pulse: {
    name: 'Pulse',
    stripePriceId: process.env.STRIPE_PULSE_PRICE_ID!,
    price: 49,
    interval: 'month' as const,
    features: [
      '5 AI signals per day',
      'Basic risk management',
      'Auto trade journal',
      'Email alerts',
      'Discord community'
    ],
    limits: {
      signals: 5,
      trades: 50,
      pairs: 10
    }
  },
  wave: {
    name: 'Wave',
    stripePriceId: process.env.STRIPE_WAVE_PRICE_ID!,
    price: 99,
    interval: 'month' as const,
    features: [
      'Unlimited AI signals',
      'Advanced risk controls',
      'Full auto-journaling',
      'Real-time WebSocket alerts',
      'Premium Discord + Telegram',
      'Advanced charting',
      'News filtering'
    ],
    limits: {
      signals: -1, // unlimited
      trades: -1,
      pairs: -1
    }
  },
  tsunami: {
    name: 'Tsunami',
    stripePriceId: process.env.STRIPE_TSUNAMI_PRICE_ID!,
    price: 199,
    interval: 'month' as const,
    features: [
      'Everything in Wave',
      'API access',
      'Custom integrations',
      'Backtesting engine',
      'Portfolio analytics',
      'Priority support',
      'White-label options'
    ],
    limits: {
      signals: -1,
      trades: -1,
      pairs: -1
    }
  }
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS

// Helper functions
export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
}) {
  return await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    subscription_data: {
      metadata: {
        userId,
      },
      trial_period_days: 14,
    },
    metadata: {
      userId,
    },
  })
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer', 'items.data.price.product'],
  })
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

export async function resumeSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

export async function createCustomer({
  email,
  name,
  userId,
}: {
  email: string
  name?: string
  userId: string
}) {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  })
}

export function constructWebhookEvent(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}

// Utility to get subscription status from Stripe subscription
export function getSubscriptionStatus(subscription: Stripe.Subscription) {
  if (subscription.status === 'active') {
    return 'active'
  }
  
  if (subscription.status === 'trialing') {
    return 'trialing'
  }
  
  if (subscription.status === 'past_due') {
    return 'past_due'
  }
  
  if (['canceled', 'incomplete_expired'].includes(subscription.status)) {
    return 'canceled'
  }
  
  return 'inactive'
}

// Get subscription tier from Stripe price ID
export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  const plan = Object.entries(SUBSCRIPTION_PLANS).find(
    ([_, config]) => config.stripePriceId === priceId
  )
  
  return plan ? (plan[0] as SubscriptionTier) : null
}