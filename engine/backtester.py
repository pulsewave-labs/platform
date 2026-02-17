"""
Backtester
Simple vectorized backtester for the PulseWave signal system
Calculates: win rate, profit factor, max drawdown, Sharpe ratio, expectancy
Supports position sizing: fixed, percent, Kelly criterion
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Optional, NamedTuple
from enum import Enum
import logging
from dataclasses import dataclass

from signal_generator import SignalGenerator, TradingSignal, Signal

logger = logging.getLogger(__name__)


class PositionSizing(Enum):
    """Position sizing methods"""
    FIXED = "fixed"
    PERCENT = "percent"
    ATR = "atr"
    KELLY = "kelly"


@dataclass
class Trade:
    """Individual trade record"""
    entry_time: pd.Timestamp
    exit_time: pd.Timestamp
    signal_type: Signal
    entry_price: float
    exit_price: float
    stop_loss: float
    take_profit: float
    position_size: float
    pnl: float
    pnl_pct: float
    exit_reason: str
    bars_held: int
    confidence: float


class BacktestResult(NamedTuple):
    """Backtest results summary"""
    trades: List[Trade]
    total_return: float
    win_rate: float
    profit_factor: float
    max_drawdown: float
    sharpe_ratio: float
    expectancy: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    avg_win: float
    avg_loss: float
    largest_win: float
    largest_loss: float
    avg_bars_held: float


class PulseWaveBacktester:
    """
    Vectorized backtester for PulseWave signals
    
    Features:
    - Multiple position sizing methods
    - Realistic slippage and commission modeling
    - Detailed trade analysis
    - Risk metrics calculation
    - Performance visualization ready
    """
    
    def __init__(
        self,
        signal_generator: SignalGenerator,
        position_sizing: PositionSizing = PositionSizing.PERCENT,
        position_size: float = 0.02,  # 2% risk per trade for percent method
        commission: float = 0.001,    # 0.1% commission
        slippage: float = 0.0005,     # 0.05% slippage
        max_bars_held: int = 100,     # Maximum bars to hold position
        initial_capital: float = 100000  # Starting capital
    ):
        self.signal_generator = signal_generator
        self.position_sizing = position_sizing
        self.position_size = position_size
        self.commission = commission
        self.slippage = slippage
        self.max_bars_held = max_bars_held
        self.initial_capital = initial_capital
        
    def _calculate_position_size(self, data: pd.DataFrame, signal: TradingSignal,
                               current_capital: float, index: int) -> float:
        """
        Calculate position size based on selected method
        """
        if signal.signal == Signal.NEUTRAL:
            return 0.0
        
        current_price = signal.entry_price
        risk_per_share = abs(signal.entry_price - signal.stop_loss)
        
        if self.position_sizing == PositionSizing.FIXED:
            # Fixed dollar amount
            shares = self.position_size / current_price
            
        elif self.position_sizing == PositionSizing.PERCENT:
            # Fixed percentage of capital at risk
            risk_capital = current_capital * self.position_size
            shares = risk_capital / risk_per_share if risk_per_share > 0 else 0
            
        elif self.position_sizing == PositionSizing.ATR:
            # ATR-based position sizing
            atr = self._calculate_atr(data.iloc[:index+1])
            atr_multiple = risk_per_share / atr if atr > 0 else 1
            base_size = current_capital * 0.02  # Base 2% risk
            shares = base_size / (atr * max(atr_multiple, 1))
            
        elif self.position_sizing == PositionSizing.KELLY:
            # Kelly criterion (simplified - would need historical win/loss data)
            # Using conservative approach
            win_rate = 0.55  # Assume based on confluence score
            avg_win = signal.risk_reward_ratio
            avg_loss = 1.0
            kelly_pct = (win_rate * avg_win - (1 - win_rate) * avg_loss) / avg_win
            kelly_pct = max(0, min(kelly_pct * 0.5, 0.05))  # Conservative Kelly
            risk_capital = current_capital * kelly_pct
            shares = risk_capital / risk_per_share if risk_per_share > 0 else 0
            
        else:
            shares = 0
        
        # Ensure we don't exceed available capital
        max_shares = (current_capital * 0.95) / current_price  # Keep 5% cash buffer
        return min(shares, max_shares)
    
    def _calculate_atr(self, data: pd.DataFrame, period: int = 14) -> float:
        """Calculate Average True Range"""
        if len(data) < period + 1:
            return data['high'].iloc[-1] - data['low'].iloc[-1]
        
        high = data['high']
        low = data['low']
        close = data['close']
        
        high_low = high - low
        high_close = np.abs(high - close.shift())
        low_close = np.abs(low - close.shift())
        
        true_range = np.maximum(high_low, np.maximum(high_close, low_close))
        atr = true_range.rolling(window=period).mean().iloc[-1]
        
        return atr if not np.isnan(atr) else high_low.iloc[-1]
    
    def _apply_slippage_and_commission(self, price: float, is_buy: bool, size: float) -> float:
        """Apply realistic slippage and commission to trade"""
        if is_buy:
            # Buying - pay slippage up, plus commission
            execution_price = price * (1 + self.slippage)
        else:
            # Selling - pay slippage down, plus commission
            execution_price = price * (1 - self.slippage)
        
        # Commission is applied to total trade value
        commission_cost = price * size * self.commission
        
        return execution_price, commission_cost
    
    def run_backtest(self, data: pd.DataFrame, 
                    start_date: Optional[str] = None,
                    end_date: Optional[str] = None,
                    min_bars_for_signal: int = 100) -> BacktestResult:
        """
        Run complete backtest on historical data
        
        Args:
            data: OHLCV DataFrame with datetime index
            start_date: Start date for backtest (optional)
            end_date: End date for backtest (optional)
            min_bars_for_signal: Minimum bars needed before generating signals
            
        Returns:
            BacktestResult with all performance metrics
        """
        # Filter data by date range if specified
        if start_date:
            data = data[data.index >= start_date]
        if end_date:
            data = data[data.index <= end_date]
        
        if len(data) < min_bars_for_signal + 50:
            raise ValueError("Insufficient data for backtesting")
        
        # Initialize tracking variables
        trades = []
        current_position = None
        current_capital = self.initial_capital
        equity_curve = [self.initial_capital]
        
        logger.info(f"Starting backtest with {len(data)} bars from {data.index[0]} to {data.index[-1]}")
        
        # Iterate through data
        for i in range(min_bars_for_signal, len(data)):
            current_date = data.index[i]
            current_data = data.iloc[:i+1]  # All data up to current point
            
            # Check if we have an open position
            if current_position is not None:
                current_price = data['close'].iloc[i]
                entry_price = current_position['entry_price']
                stop_loss = current_position['stop_loss']
                take_profit = current_position['take_profit']
                position_size = current_position['position_size']
                signal_type = current_position['signal_type']
                entry_time = current_position['entry_time']
                bars_held = i - current_position['entry_index']
                
                # Check exit conditions
                exit_triggered = False
                exit_price = current_price
                exit_reason = ""
                
                if signal_type == Signal.LONG:
                    if current_price <= stop_loss:
                        exit_price = stop_loss
                        exit_reason = "Stop Loss"
                        exit_triggered = True
                    elif current_price >= take_profit:
                        exit_price = take_profit
                        exit_reason = "Take Profit"
                        exit_triggered = True
                    elif data['low'].iloc[i] <= stop_loss:
                        exit_price = stop_loss
                        exit_reason = "Stop Loss"
                        exit_triggered = True
                    elif data['high'].iloc[i] >= take_profit:
                        exit_price = take_profit
                        exit_reason = "Take Profit"
                        exit_triggered = True
                
                elif signal_type == Signal.SHORT:
                    if current_price >= stop_loss:
                        exit_price = stop_loss
                        exit_reason = "Stop Loss"
                        exit_triggered = True
                    elif current_price <= take_profit:
                        exit_price = take_profit
                        exit_reason = "Take Profit"
                        exit_triggered = True
                    elif data['high'].iloc[i] >= stop_loss:
                        exit_price = stop_loss
                        exit_reason = "Stop Loss"
                        exit_triggered = True
                    elif data['low'].iloc[i] <= take_profit:
                        exit_price = take_profit
                        exit_reason = "Take Profit"
                        exit_triggered = True
                
                # Time-based exit
                if bars_held >= self.max_bars_held:
                    exit_price = current_price
                    exit_reason = "Time Limit"
                    exit_triggered = True
                
                if exit_triggered:
                    # Close position
                    exit_price, commission_cost = self._apply_slippage_and_commission(
                        exit_price, signal_type == Signal.SHORT, position_size
                    )
                    
                    # Calculate P&L
                    if signal_type == Signal.LONG:
                        pnl = (exit_price - entry_price) * position_size - commission_cost
                    else:  # SHORT
                        pnl = (entry_price - exit_price) * position_size - commission_cost
                    
                    pnl_pct = pnl / (entry_price * position_size) * 100
                    current_capital += pnl
                    
                    # Record trade
                    trade = Trade(
                        entry_time=entry_time,
                        exit_time=current_date,
                        signal_type=signal_type,
                        entry_price=entry_price,
                        exit_price=exit_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        position_size=position_size,
                        pnl=pnl,
                        pnl_pct=pnl_pct,
                        exit_reason=exit_reason,
                        bars_held=bars_held,
                        confidence=current_position['confidence']
                    )
                    trades.append(trade)
                    
                    logger.info(f"Closed {signal_type.value} position: {pnl:.2f} ({pnl_pct:.2f}%) - {exit_reason}")
                    
                    current_position = None
            
            else:
                # No position - look for new signals
                try:
                    signal = self.signal_generator.generate_signal(current_data)
                    
                    if signal.signal != Signal.NEUTRAL:
                        # Calculate position size
                        position_size = self._calculate_position_size(
                            current_data, signal, current_capital, i
                        )
                        
                        if position_size > 0:
                            # Enter position
                            entry_price, commission_cost = self._apply_slippage_and_commission(
                                signal.entry_price, True, position_size
                            )
                            
                            current_capital -= commission_cost
                            
                            current_position = {
                                'signal_type': signal.signal,
                                'entry_price': entry_price,
                                'stop_loss': signal.stop_loss,
                                'take_profit': signal.take_profit,
                                'position_size': position_size,
                                'entry_time': current_date,
                                'entry_index': i,
                                'confidence': signal.confidence
                            }
                            
                            logger.info(f"Opened {signal.signal.value} position at {entry_price:.4f}, size: {position_size:.2f}")
                
                except Exception as e:
                    logger.error(f"Error generating signal at {current_date}: {e}")
                    continue
            
            # Update equity curve
            if current_position:
                # Mark-to-market current position
                current_price = data['close'].iloc[i]
                if current_position['signal_type'] == Signal.LONG:
                    unrealized_pnl = (current_price - current_position['entry_price']) * current_position['position_size']
                else:
                    unrealized_pnl = (current_position['entry_price'] - current_price) * current_position['position_size']
                equity = current_capital + unrealized_pnl
            else:
                equity = current_capital
            
            equity_curve.append(equity)
        
        # Calculate performance metrics
        return self._calculate_metrics(trades, equity_curve, data)
    
    def _calculate_metrics(self, trades: List[Trade], equity_curve: List[float], data: pd.DataFrame) -> BacktestResult:
        """Calculate all backtest performance metrics"""
        if not trades:
            return BacktestResult(
                trades=[],
                total_return=0.0,
                win_rate=0.0,
                profit_factor=0.0,
                max_drawdown=0.0,
                sharpe_ratio=0.0,
                expectancy=0.0,
                total_trades=0,
                winning_trades=0,
                losing_trades=0,
                avg_win=0.0,
                avg_loss=0.0,
                largest_win=0.0,
                largest_loss=0.0,
                avg_bars_held=0.0
            )
        
        # Basic metrics
        total_trades = len(trades)
        winning_trades = len([t for t in trades if t.pnl > 0])
        losing_trades = len([t for t in trades if t.pnl < 0])
        
        win_rate = winning_trades / total_trades * 100 if total_trades > 0 else 0
        
        # P&L metrics
        total_pnl = sum(t.pnl for t in trades)
        total_return = (equity_curve[-1] - self.initial_capital) / self.initial_capital * 100
        
        winning_pnl = sum(t.pnl for t in trades if t.pnl > 0)
        losing_pnl = abs(sum(t.pnl for t in trades if t.pnl < 0))
        
        profit_factor = winning_pnl / losing_pnl if losing_pnl > 0 else float('inf')
        
        avg_win = winning_pnl / winning_trades if winning_trades > 0 else 0
        avg_loss = losing_pnl / losing_trades if losing_trades > 0 else 0
        
        largest_win = max((t.pnl for t in trades if t.pnl > 0), default=0)
        largest_loss = min((t.pnl for t in trades if t.pnl < 0), default=0)
        
        expectancy = (win_rate/100 * avg_win) - ((100-win_rate)/100 * avg_loss)
        
        avg_bars_held = sum(t.bars_held for t in trades) / total_trades if total_trades > 0 else 0
        
        # Drawdown calculation
        equity_series = pd.Series(equity_curve)
        rolling_max = equity_series.expanding().max()
        drawdown = (equity_series - rolling_max) / rolling_max
        max_drawdown = drawdown.min() * 100  # Convert to percentage
        
        # Sharpe ratio calculation
        if len(equity_curve) > 1:
            returns = pd.Series(equity_curve).pct_change().dropna()
            if len(returns) > 0 and returns.std() > 0:
                sharpe_ratio = returns.mean() / returns.std() * np.sqrt(252)  # Annualized
            else:
                sharpe_ratio = 0.0
        else:
            sharpe_ratio = 0.0
        
        return BacktestResult(
            trades=trades,
            total_return=total_return,
            win_rate=win_rate,
            profit_factor=profit_factor,
            max_drawdown=max_drawdown,
            sharpe_ratio=sharpe_ratio,
            expectancy=expectancy,
            total_trades=total_trades,
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            avg_win=avg_win,
            avg_loss=avg_loss,
            largest_win=largest_win,
            largest_loss=largest_loss,
            avg_bars_held=avg_bars_held
        )
    
    def print_backtest_results(self, result: BacktestResult) -> None:
        """Print formatted backtest results"""
        print(f"\n{'='*60}")
        print(f"PULSEWAVE BACKTEST RESULTS")
        print(f"{'='*60}")
        
        print(f"\n📊 PERFORMANCE SUMMARY")
        print(f"Total Return:      {result.total_return:8.2f}%")
        print(f"Total Trades:      {result.total_trades:8d}")
        print(f"Win Rate:          {result.win_rate:8.2f}%")
        print(f"Profit Factor:     {result.profit_factor:8.2f}")
        print(f"Max Drawdown:      {result.max_drawdown:8.2f}%")
        print(f"Sharpe Ratio:      {result.sharpe_ratio:8.2f}")
        print(f"Expectancy:        ${result.expectancy:7.2f}")
        
        print(f"\n📈 TRADE BREAKDOWN")
        print(f"Winning Trades:    {result.winning_trades:8d} ({result.winning_trades/result.total_trades*100:.1f}%)")
        print(f"Losing Trades:     {result.losing_trades:8d} ({result.losing_trades/result.total_trades*100:.1f}%)")
        print(f"Average Win:       ${result.avg_win:7.2f}")
        print(f"Average Loss:      ${result.avg_loss:7.2f}")
        print(f"Largest Win:       ${result.largest_win:7.2f}")
        print(f"Largest Loss:      ${result.largest_loss:7.2f}")
        print(f"Avg Bars Held:     {result.avg_bars_held:8.1f}")
        
        if result.trades:
            print(f"\n🔍 RECENT TRADES (Last 5)")
            print("Date       | Type  | Entry    | Exit     | P&L      | Reason")
            print("-----------+-------+----------+----------+----------+----------")
            for trade in result.trades[-5:]:
                pnl_sign = "+" if trade.pnl >= 0 else ""
                print(f"{trade.entry_time.strftime('%Y-%m-%d')} | {trade.signal_type.value:5} | "
                      f"{trade.entry_price:8.4f} | {trade.exit_price:8.4f} | "
                      f"{pnl_sign}{trade.pnl:7.2f} | {trade.exit_reason}")


if __name__ == "__main__":
    # Example usage
    pass