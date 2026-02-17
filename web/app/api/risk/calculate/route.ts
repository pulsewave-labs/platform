import { NextRequest, NextResponse } from 'next/server'

interface RiskCalculationRequest {
  account_size: number
  risk_percent: number
  entry_price: number
  stop_loss: number
  direction?: 'LONG' | 'SHORT'
  leverage?: number
  fees_percent?: number
}

interface RiskCalculationResponse {
  position_size: number
  position_value: number
  risk_amount: number
  potential_loss: number
  potential_loss_with_fees: number
  stop_loss_distance: number
  stop_loss_distance_percent: number
  r_multiple: number | null
  take_profit?: number
  potential_profit?: number
  risk_reward_ratio?: number
  fees?: {
    entry_fee: number
    exit_fee: number
    total_fees: number
  }
  leverage_info?: {
    margin_required: number
    liquidation_price?: number
  }
  warnings: string[]
}

function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  direction: 'LONG' | 'SHORT',
  maintenanceMargin: number = 0.005 // 0.5% maintenance margin
): number {
  if (direction === 'LONG') {
    return entryPrice * (1 - (1 / leverage) + maintenanceMargin)
  } else {
    return entryPrice * (1 + (1 / leverage) - maintenanceMargin)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RiskCalculationRequest = await request.json()

    // Validate required fields
    const requiredFields = ['account_size', 'risk_percent', 'entry_price', 'stop_loss']
    for (const field of requiredFields) {
      if (!(field in body) || body[field as keyof RiskCalculationRequest] === null || body[field as keyof RiskCalculationRequest] === undefined) {
        return NextResponse.json(
          { error: 'Validation error', message: `Field '${field}' is required` },
          { status: 400 }
        )
      }
    }

    // Validate numeric values
    if (body.account_size <= 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Account size must be greater than 0' },
        { status: 400 }
      )
    }

    if (body.risk_percent <= 0 || body.risk_percent > 100) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Risk percent must be between 0.01 and 100' },
        { status: 400 }
      )
    }

    if (body.entry_price <= 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Entry price must be greater than 0' },
        { status: 400 }
      )
    }

    if (body.stop_loss <= 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Stop loss must be greater than 0' },
        { status: 400 }
      )
    }

    // Set defaults
    const direction = body.direction || 'LONG'
    const leverage = body.leverage || 1
    const feesPercent = body.fees_percent || 0.1 // Default 0.1% fees

    // Validate direction and stop loss relationship
    if (direction === 'LONG' && body.stop_loss >= body.entry_price) {
      return NextResponse.json(
        { error: 'Validation error', message: 'For LONG positions, stop loss must be below entry price' },
        { status: 400 }
      )
    }

    if (direction === 'SHORT' && body.stop_loss <= body.entry_price) {
      return NextResponse.json(
        { error: 'Validation error', message: 'For SHORT positions, stop loss must be above entry price' },
        { status: 400 }
      )
    }

    // Validate leverage
    if (leverage < 1 || leverage > 100) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Leverage must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Calculate risk amount
    const riskAmount = (body.account_size * body.risk_percent) / 100

    // Calculate stop loss distance
    const stopLossDistance = Math.abs(body.entry_price - body.stop_loss)
    const stopLossDistancePercent = (stopLossDistance / body.entry_price) * 100

    // Calculate position size
    let positionSize: number
    let positionValue: number

    if (leverage > 1) {
      // For leveraged trading, calculate based on margin
      const marginRequired = riskAmount
      positionSize = (marginRequired * leverage) / body.entry_price
      positionValue = positionSize * body.entry_price
    } else {
      // For spot trading, calculate based on risk
      positionSize = riskAmount / stopLossDistance
      positionValue = positionSize * body.entry_price
      
      // Check if position value exceeds account size
      if (positionValue > body.account_size) {
        positionSize = body.account_size / body.entry_price
        positionValue = body.account_size
      }
    }

    // Calculate potential loss
    const potentialLoss = positionSize * stopLossDistance

    // Calculate fees
    const entryFee = (positionValue * feesPercent) / 100
    const exitFee = (positionSize * body.stop_loss * feesPercent) / 100
    const totalFees = entryFee + exitFee
    const potentialLossWithFees = potentialLoss + totalFees

    // Calculate liquidation price for leveraged positions
    let liquidationPrice: number | undefined
    let marginRequired: number | undefined

    if (leverage > 1) {
      liquidationPrice = calculateLiquidationPrice(body.entry_price, leverage, direction)
      marginRequired = positionValue / leverage
    }

    // Initialize warnings
    const warnings: string[] = []

    // Risk warnings
    if (body.risk_percent > 5) {
      warnings.push(`Risk per trade (${body.risk_percent}%) exceeds recommended 2-3%`)
    }

    if (stopLossDistancePercent > 10) {
      warnings.push(`Stop loss distance (${stopLossDistancePercent.toFixed(2)}%) is quite large`)
    }

    if (leverage > 1) {
      warnings.push(`Using ${leverage}x leverage increases both potential profits and losses`)
      
      if (liquidationPrice) {
        const liquidationDistance = Math.abs(body.entry_price - liquidationPrice) / body.entry_price * 100
        if (liquidationDistance < 5) {
          warnings.push(`Liquidation price is only ${liquidationDistance.toFixed(2)}% away`)
        }
      }
    }

    // Position size warnings
    if (positionValue > body.account_size * 0.5) {
      warnings.push('Position size exceeds 50% of account - consider reducing size')
    }

    // Build response
    const response: RiskCalculationResponse = {
      position_size: Math.round(positionSize * 1000000) / 1000000, // 6 decimal places
      position_value: Math.round(positionValue * 100) / 100,
      risk_amount: Math.round(riskAmount * 100) / 100,
      potential_loss: Math.round(potentialLoss * 100) / 100,
      potential_loss_with_fees: Math.round(potentialLossWithFees * 100) / 100,
      stop_loss_distance: Math.round(stopLossDistance * 100) / 100,
      stop_loss_distance_percent: Math.round(stopLossDistancePercent * 100) / 100,
      r_multiple: null,
      fees: {
        entry_fee: Math.round(entryFee * 100) / 100,
        exit_fee: Math.round(exitFee * 100) / 100,
        total_fees: Math.round(totalFees * 100) / 100
      },
      warnings
    }

    // Add leverage info if applicable
    if (leverage > 1 && marginRequired && liquidationPrice) {
      response.leverage_info = {
        margin_required: Math.round(marginRequired * 100) / 100,
        liquidation_price: Math.round(liquidationPrice * 100) / 100
      }
    }

    // Calculate take profit and R:R if provided
    if (body.entry_price && body.stop_loss) {
      // Suggest take profit at 2:1 R:R
      const risk = stopLossDistance
      let suggestedTakeProfit: number

      if (direction === 'LONG') {
        suggestedTakeProfit = body.entry_price + (risk * 2)
      } else {
        suggestedTakeProfit = body.entry_price - (risk * 2)
      }

      const potentialProfit = positionSize * (risk * 2)

      response.take_profit = Math.round(suggestedTakeProfit * 100) / 100
      response.potential_profit = Math.round(potentialProfit * 100) / 100
      response.risk_reward_ratio = 2.0
      response.r_multiple = 2.0
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('API error:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON', message: 'Request body must be valid JSON' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method for documentation/help
export async function GET() {
  return NextResponse.json({
    description: 'Position size and risk calculator for trading',
    endpoint: '/api/risk/calculate',
    method: 'POST',
    required_fields: [
      'account_size',
      'risk_percent', 
      'entry_price',
      'stop_loss'
    ],
    optional_fields: [
      'direction (LONG|SHORT, default: LONG)',
      'leverage (1-100, default: 1)', 
      'fees_percent (default: 0.1)'
    ],
    example_request: {
      account_size: 10000,
      risk_percent: 2,
      entry_price: 50000,
      stop_loss: 48000,
      direction: 'LONG',
      leverage: 1,
      fees_percent: 0.1
    },
    example_response: {
      position_size: 0.1,
      position_value: 5000,
      risk_amount: 200,
      potential_loss: 200,
      potential_loss_with_fees: 210,
      stop_loss_distance: 2000,
      stop_loss_distance_percent: 4,
      take_profit: 54000,
      potential_profit: 400,
      risk_reward_ratio: 2,
      r_multiple: 2,
      fees: {
        entry_fee: 5,
        exit_fee: 4.8,
        total_fees: 9.8
      },
      warnings: []
    }
  })
}