"""
Signal Generator
Combines S/R engine, regime detector, and confluence scorer
to generate LONG/SHORT/NEUTRAL signals with entry, stop loss, take profit levels
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, NamedTuple
from enum import Enum
import logging

from sr_engine import SupportResistanceEngine, SRResult, SRLevel
from regime_detector import RegimeDetector, RegimeResult, MarketRegime
from confluence_scorer import ConfluenceScorer, ConfluenceResult, SignalDirection

logger = logging.getLogger(__name__)


class Signal(Enum):
    """Signal types"""
    LONG = "LONG"
    SHORT = "SHORT"
    NEUTRAL = "NEUTRAL"


class TradingSignal(NamedTuple):
    """Complete trading signal with all details"""
    signal: Signal
    entry_price: float
    stop_loss: float
    take_profit: float
    confidence: float  # 0-100
    confluence_score: float  # 0-100
    risk_reward_ratio: float
    reasoning: List[str]
    sr_context: Dict[str, SRResult]
    regime_context: RegimeResult
    confluence_context: ConfluenceResult


class SignalGenerator:
    """
    Generates trading signals by combining:
    1. S/R engine analysis
    2. Market regime detection  
    3. Confluence scoring
    4. Risk management calculations
    
    Signal generation logic:
    - Identify potential S/R level interactions
    - Check regime alignment
    - Calculate confluence score
    - Determine entry, stop loss, take profit levels
    - Apply minimum confidence and risk/reward filters
    """
    
    def __init__(
        self,
        sr_engine: SupportResistanceEngine,
        regime_detector: RegimeDetector,
        confluence_scorer: ConfluenceScorer,
        min_confluence_score: float = 45.0,
        min_risk_reward: float = 1.5,
        max_stop_loss_pct: float = 3.0,
        position_size_method: str = "fixed"  # "fixed", "percent", "atr"
    ):
        self.sr_engine = sr_engine
        self.regime_detector = regime_detector
        self.confluence_scorer = confluence_scorer
        self.min_confluence_score = min_confluence_score
        self.min_risk_reward = min_risk_reward
        self.max_stop_loss_pct = max_stop_loss_pct
        self.position_size_method = position_size_method
        
    def _calculate_atr(self, data: pd.DataFrame, period: int = 14) -> float:
        """Calculate current Average True Range"""
        high = data['high']
        low = data['low']
        close = data['close']
        
        high_low = high - low
        high_close = np.abs(high - close.shift())
        low_close = np.abs(low - close.shift())
        
        true_range = np.maximum(high_low, np.maximum(high_close, low_close))
        atr = true_range.rolling(window=period).mean().iloc[-1]
        
        return atr
    
    def _identify_signal_opportunities(self, data: pd.DataFrame, sr_results: Dict[str, SRResult]) -> List[SignalDirection]:
        """
        Identify potential signal opportunities based on S/R level proximity and price action
        """
        opportunities = []
        current_price = data['close'].iloc[-1]
        previous_close = data['close'].iloc[-2]
        
        # Check all timeframes for S/R level interactions
        for timeframe, sr_result in sr_results.items():
            for level in sr_result.levels:
                distance_pct = abs(level.mid - current_price) / current_price * 100
                
                # Only consider levels within reasonable distance (3%)
                if distance_pct <= 3.0:
                    
                    # Long signal opportunity: bouncing off support
                    if (level.mid < current_price and not level.is_resistance and 
                        previous_close <= level.mid and current_price > level.mid):
                        opportunities.append(SignalDirection.LONG)
                        logger.info(f"Long opportunity: bouncing off support at {level.mid}")
                    
                    # Short signal opportunity: rejecting at resistance
                    elif (level.mid > current_price and level.is_resistance and 
                          previous_close >= level.mid and current_price < level.mid):
                        opportunities.append(SignalDirection.SHORT)
                        logger.info(f"Short opportunity: rejecting at resistance at {level.mid}")
                    
                    # Breakout opportunities
                    elif distance_pct <= 1.0:  # Very close to level
                        if level.is_resistance:
                            opportunities.append(SignalDirection.LONG)  # Potential breakout up
                        else:
                            opportunities.append(SignalDirection.SHORT)  # Potential breakdown
        
        # Remove duplicates and return
        return list(set(opportunities))
    
    def _calculate_stop_loss(self, data: pd.DataFrame, signal_direction: SignalDirection,
                           entry_price: float, sr_results: Dict[str, SRResult]) -> float:
        """
        Calculate stop loss level based on:
        1. Nearby S/R levels
        2. ATR-based risk
        3. Maximum loss percentage
        """
        current_atr = self._calculate_atr(data)
        max_stop_distance = entry_price * self.max_stop_loss_pct / 100
        
        # Find relevant S/R levels for stop placement
        primary_sr = list(sr_results.values())[0]
        
        if signal_direction == SignalDirection.LONG:
            # For longs, stop below nearest support or entry - ATR
            stop_candidates = []
            
            # ATR-based stop
            stop_candidates.append(entry_price - current_atr * 1.5)
            
            # S/R level based stop
            for level in primary_sr.levels:
                if level.mid < entry_price and not level.is_resistance:
                    # Place stop slightly below support level
                    stop_candidates.append(level.low - (level.high - level.low) * 0.1)
            
            # Choose the highest stop (least risk) that's still reasonable
            stop_loss = max(stop_candidates) if stop_candidates else entry_price - current_atr * 2
            
            # Ensure stop is not too far
            if entry_price - stop_loss > max_stop_distance:
                stop_loss = entry_price - max_stop_distance
                
        else:  # SHORT
            # For shorts, stop above nearest resistance or entry + ATR
            stop_candidates = []
            
            # ATR-based stop
            stop_candidates.append(entry_price + current_atr * 1.5)
            
            # S/R level based stop
            for level in primary_sr.levels:
                if level.mid > entry_price and level.is_resistance:
                    # Place stop slightly above resistance level
                    stop_candidates.append(level.high + (level.high - level.low) * 0.1)
            
            # Choose the lowest stop (least risk) that's still reasonable
            stop_loss = min(stop_candidates) if stop_candidates else entry_price + current_atr * 2
            
            # Ensure stop is not too far
            if stop_loss - entry_price > max_stop_distance:
                stop_loss = entry_price + max_stop_distance
        
        return stop_loss
    
    def _calculate_take_profit(self, signal_direction: SignalDirection, entry_price: float,
                             stop_loss: float, sr_results: Dict[str, SRResult]) -> float:
        """
        Calculate take profit level based on:
        1. Risk/reward ratio requirements
        2. Nearby S/R levels as targets
        3. ATR-based targets
        """
        risk = abs(entry_price - stop_loss)
        min_profit_target = risk * self.min_risk_reward
        
        # Find S/R levels that could act as profit targets
        primary_sr = list(sr_results.values())[0]
        target_candidates = []
        
        if signal_direction == SignalDirection.LONG:
            # Look for resistance levels above entry as targets
            for level in primary_sr.levels:
                if level.mid > entry_price and level.is_resistance:
                    target_candidates.append(level.mid)
            
            # Minimum target based on risk/reward
            min_target = entry_price + min_profit_target
            target_candidates.append(min_target)
            
            # Choose closest reasonable target that meets minimum R:R
            valid_targets = [t for t in target_candidates if t >= min_target]
            take_profit = min(valid_targets) if valid_targets else min_target
            
        else:  # SHORT
            # Look for support levels below entry as targets
            for level in primary_sr.levels:
                if level.mid < entry_price and not level.is_resistance:
                    target_candidates.append(level.mid)
            
            # Minimum target based on risk/reward
            min_target = entry_price - min_profit_target
            target_candidates.append(min_target)
            
            # Choose closest reasonable target that meets minimum R:R
            valid_targets = [t for t in target_candidates if t <= min_target]
            take_profit = max(valid_targets) if valid_targets else min_target
        
        return take_profit
    
    def _calculate_confidence(self, confluence_result: ConfluenceResult, 
                            regime_result: RegimeResult) -> float:
        """
        Calculate overall signal confidence based on:
        1. Confluence score
        2. Regime confidence
        3. Additional factors
        """
        base_confidence = confluence_result.total_score
        regime_confidence = regime_result.confidence
        
        # Weight the components
        confluence_weight = 0.7
        regime_weight = 0.3
        
        overall_confidence = (base_confidence * confluence_weight + 
                            regime_confidence * regime_weight)
        
        return min(overall_confidence, 95.0)  # Cap at 95%
    
    def generate_signal(self, data: pd.DataFrame, 
                       timeframes: List[str] = None) -> TradingSignal:
        """
        Generate trading signal for given data
        
        Args:
            data: OHLCV DataFrame
            timeframes: List of timeframe identifiers for multi-TF analysis
            
        Returns:
            TradingSignal with complete analysis
        """
        if timeframes is None:
            timeframes = ["current"]
        
        current_price = data['close'].iloc[-1]
        
        # Step 1: Calculate S/R levels (assuming single timeframe for now)
        sr_results = {}
        for tf in timeframes:
            sr_results[tf] = self.sr_engine.calculate_sr_levels(data, tf)
        
        # Step 2: Detect market regime
        regime_result = self.regime_detector.detect_regime(data)
        
        # Step 3: Identify signal opportunities
        opportunities = self._identify_signal_opportunities(data, sr_results)
        
        if not opportunities:
            # No clear opportunities - return neutral signal
            return TradingSignal(
                signal=Signal.NEUTRAL,
                entry_price=current_price,
                stop_loss=current_price,
                take_profit=current_price,
                confidence=0.0,
                confluence_score=0.0,
                risk_reward_ratio=0.0,
                reasoning=["No clear S/R level interaction detected"],
                sr_context=sr_results,
                regime_context=regime_result,
                confluence_context=None
            )
        
        # Step 4: Evaluate each opportunity and pick the best
        best_signal = None
        best_confluence = None
        best_score = 0.0
        
        for opportunity in opportunities:
            # Calculate confluence score for this direction
            confluence_result = self.confluence_scorer.calculate_confluence_score(
                data, sr_results, regime_result, opportunity
            )
            
            if confluence_result.total_score > best_score:
                best_score = confluence_result.total_score
                best_signal = opportunity
                best_confluence = confluence_result
        
        # Step 5: Check if signal meets minimum requirements
        if best_score < self.min_confluence_score:
            return TradingSignal(
                signal=Signal.NEUTRAL,
                entry_price=current_price,
                stop_loss=current_price,
                take_profit=current_price,
                confidence=best_score,
                confluence_score=best_score,
                risk_reward_ratio=0.0,
                reasoning=[f"Confluence score {best_score:.1f} below minimum {self.min_confluence_score}"],
                sr_context=sr_results,
                regime_context=regime_result,
                confluence_context=best_confluence
            )
        
        # Step 6: Calculate entry, stop loss, and take profit
        entry_price = current_price  # Market entry for now
        stop_loss = self._calculate_stop_loss(data, best_signal, entry_price, sr_results)
        take_profit = self._calculate_take_profit(best_signal, entry_price, stop_loss, sr_results)
        
        # Calculate risk/reward ratio
        risk = abs(entry_price - stop_loss)
        reward = abs(take_profit - entry_price)
        risk_reward_ratio = reward / risk if risk > 0 else 0.0
        
        # Check risk/reward requirement
        if risk_reward_ratio < self.min_risk_reward:
            return TradingSignal(
                signal=Signal.NEUTRAL,
                entry_price=current_price,
                stop_loss=current_price,
                take_profit=current_price,
                confidence=best_score * 0.5,  # Reduce confidence
                confluence_score=best_score,
                risk_reward_ratio=risk_reward_ratio,
                reasoning=[f"Risk/reward {risk_reward_ratio:.2f} below minimum {self.min_risk_reward}"],
                sr_context=sr_results,
                regime_context=regime_result,
                confluence_context=best_confluence
            )
        
        # Step 7: Calculate final confidence
        confidence = self._calculate_confidence(best_confluence, regime_result)
        
        # Step 8: Build reasoning
        reasoning = [
            f"Signal direction: {best_signal.value}",
            f"Confluence score: {best_score:.1f}/100",
            f"Risk/reward ratio: {risk_reward_ratio:.2f}",
            f"Regime: {regime_result.regime.value} ({regime_result.confidence:.1f}%)"
        ]
        reasoning.extend(best_confluence.reasoning[:3])  # Top 3 confluence factors
        
        return TradingSignal(
            signal=Signal.LONG if best_signal == SignalDirection.LONG else Signal.SHORT,
            entry_price=entry_price,
            stop_loss=stop_loss,
            take_profit=take_profit,
            confidence=confidence,
            confluence_score=best_score,
            risk_reward_ratio=risk_reward_ratio,
            reasoning=reasoning,
            sr_context=sr_results,
            regime_context=regime_result,
            confluence_context=best_confluence
        )
    
    def print_signal_analysis(self, signal: TradingSignal) -> None:
        """Print comprehensive signal analysis"""
        print(f"\n{'='*50}")
        print(f"PULSEWAVE TRADING SIGNAL")
        print(f"{'='*50}")
        
        # Signal summary
        signal_emoji = "🟢" if signal.signal == Signal.LONG else "🔴" if signal.signal == Signal.SHORT else "⚪"
        print(f"Signal: {signal_emoji} {signal.signal.value}")
        print(f"Confidence: {signal.confidence:.1f}%")
        print(f"Confluence Score: {signal.confluence_score:.1f}/100")
        
        if signal.signal != Signal.NEUTRAL:
            print(f"\nTrade Setup:")
            print(f"  Entry:       ${signal.entry_price:.4f}")
            print(f"  Stop Loss:   ${signal.stop_loss:.4f}")
            print(f"  Take Profit: ${signal.take_profit:.4f}")
            print(f"  Risk/Reward: {signal.risk_reward_ratio:.2f}")
            
            risk_pct = abs(signal.entry_price - signal.stop_loss) / signal.entry_price * 100
            reward_pct = abs(signal.take_profit - signal.entry_price) / signal.entry_price * 100
            print(f"  Risk:        {risk_pct:.2f}%")
            print(f"  Reward:      {reward_pct:.2f}%")
        
        print(f"\nReasoning:")
        for i, reason in enumerate(signal.reasoning, 1):
            print(f"  {i}. {reason}")
        
        # Print sub-analyses
        if signal.sr_context:
            primary_sr = list(signal.sr_context.values())[0]
            self.sr_engine.print_sr_analysis(primary_sr)
        
        if signal.regime_context:
            self.regime_detector.print_regime_analysis(signal.regime_context)
        
        if signal.confluence_context:
            self.confluence_scorer.print_confluence_analysis(signal.confluence_context)


if __name__ == "__main__":
    # Example usage
    pass