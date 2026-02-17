"""
Confluence Scorer
Scores signals 0-100 based on multiple factors:
- S/R proximity and strength
- Regime alignment 
- RSI condition
- Volume confirmation
- Multi-timeframe agreement
- Trend alignment (EMA)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, NamedTuple, Optional
import logging
from enum import Enum

from sr_engine import SRResult, SRLevel
from regime_detector import RegimeResult, MarketRegime

logger = logging.getLogger(__name__)


class SignalDirection(Enum):
    """Signal direction"""
    LONG = "LONG"
    SHORT = "SHORT"


class ConfluenceResult(NamedTuple):
    """Confluence scoring result"""
    total_score: float  # 0-100
    signal_direction: SignalDirection
    factor_breakdown: Dict[str, float]
    reasoning: List[str]


class ConfluenceScorer:
    """
    Scores trading signals based on confluence of multiple factors.
    
    Factors:
    1. S/R Proximity (0-20 points) - How close to strong S/R level
    2. S/R Strength (0-15 points) - Strength of nearby S/R level  
    3. Regime Alignment (0-20 points) - Signal direction matches regime
    4. RSI Condition (0-15 points) - RSI supports signal direction
    5. Volume Confirmation (0-10 points) - Volume supports the move
    6. Multi-timeframe Agreement (0-10 points) - Higher TF levels align
    7. Trend Alignment (0-10 points) - Signal aligns with EMA trend
    
    Total: 100 points maximum
    """
    
    def __init__(
        self,
        rsi_period: int = 14,
        volume_ma_period: int = 20,
        ema_trend_period: int = 50,
        proximity_threshold_pct: float = 2.0  # Within 2% of S/R level
    ):
        self.rsi_period = rsi_period
        self.volume_ma_period = volume_ma_period
        self.ema_trend_period = ema_trend_period
        self.proximity_threshold_pct = proximity_threshold_pct
        
    def _calculate_rsi(self, data: pd.DataFrame) -> pd.Series:
        """Calculate RSI indicator"""
        close = data['close']
        delta = close.diff()
        
        gain = (delta.where(delta > 0, 0)).rolling(window=self.rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=self.rsi_period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def _score_sr_proximity(self, current_price: float, sr_result: SRResult, 
                          signal_direction: SignalDirection) -> tuple[float, str]:
        """
        Score S/R proximity factor (0-20 points)
        Higher score for being close to relevant S/R level
        """
        if not sr_result.levels:
            return 0.0, "No S/R levels available"
        
        relevant_levels = []
        
        if signal_direction == SignalDirection.LONG:
            # For long signals, look for support levels below current price
            relevant_levels = [lvl for lvl in sr_result.levels if lvl.mid < current_price and not lvl.is_resistance]
        else:
            # For short signals, look for resistance levels above current price  
            relevant_levels = [lvl for lvl in sr_result.levels if lvl.mid > current_price and lvl.is_resistance]
        
        if not relevant_levels:
            return 5.0, f"No relevant S/R levels for {signal_direction.value}"
        
        # Find closest relevant level
        closest_level = min(relevant_levels, key=lambda x: abs(x.mid - current_price))
        
        distance_pct = abs(closest_level.mid - current_price) / current_price * 100
        
        if distance_pct <= self.proximity_threshold_pct:
            # Very close to S/R level
            score = 20 - (distance_pct / self.proximity_threshold_pct * 10)  # 10-20 points
            reason = f"Very close to {closest_level.mid:.4f} ({distance_pct:.2f}%)"
        elif distance_pct <= self.proximity_threshold_pct * 2:
            # Moderately close
            score = 10 - ((distance_pct - self.proximity_threshold_pct) / self.proximity_threshold_pct * 5)  # 5-10 points
            reason = f"Near {closest_level.mid:.4f} ({distance_pct:.2f}%)"
        else:
            # Far from S/R level
            score = 2.0
            reason = f"Far from S/R levels (closest: {distance_pct:.2f}%)"
        
        return max(score, 0.0), reason
    
    def _score_sr_strength(self, current_price: float, sr_result: SRResult,
                         signal_direction: SignalDirection) -> tuple[float, str]:
        """
        Score S/R strength factor (0-15 points)
        Higher score for stronger nearby S/R levels
        """
        if not sr_result.levels:
            return 0.0, "No S/R levels available"
        
        # Find relevant levels within reasonable distance
        relevant_levels = []
        max_distance_pct = 5.0  # Consider levels within 5%
        
        for level in sr_result.levels:
            distance_pct = abs(level.mid - current_price) / current_price * 100
            if distance_pct <= max_distance_pct:
                if signal_direction == SignalDirection.LONG and level.mid <= current_price:
                    relevant_levels.append(level)
                elif signal_direction == SignalDirection.SHORT and level.mid >= current_price:
                    relevant_levels.append(level)
        
        if not relevant_levels:
            return 3.0, "No relevant strong levels nearby"
        
        # Find strongest relevant level
        strongest_level = max(relevant_levels, key=lambda x: x.strength)
        
        # Score based on strength (typically 3-20+ touches)
        if strongest_level.strength >= 10:
            score = 15.0
            reason = f"Very strong level ({strongest_level.strength} touches)"
        elif strongest_level.strength >= 7:
            score = 12.0
            reason = f"Strong level ({strongest_level.strength} touches)"
        elif strongest_level.strength >= 5:
            score = 8.0
            reason = f"Moderate level ({strongest_level.strength} touches)"
        else:
            score = 4.0
            reason = f"Weak level ({strongest_level.strength} touches)"
        
        return score, reason
    
    def _score_regime_alignment(self, regime_result: RegimeResult, 
                              signal_direction: SignalDirection) -> tuple[float, str]:
        """
        Score regime alignment factor (0-20 points)
        Higher score when signal direction matches market regime
        """
        regime = regime_result.regime
        confidence = regime_result.confidence
        
        if signal_direction == SignalDirection.LONG:
            if regime == MarketRegime.TRENDING_UP:
                score = confidence / 100 * 20  # Full points if high confidence uptrend
                reason = f"Strong uptrend alignment ({confidence:.1f}%)"
            elif regime == MarketRegime.RANGING:
                score = 8.0  # Neutral in ranging market
                reason = f"Ranging market - moderate long opportunity"
            elif regime == MarketRegime.VOLATILE:
                score = 5.0  # Risky in volatile market
                reason = f"Volatile market - risky for longs"
            else:  # TRENDING_DOWN
                score = 2.0
                reason = f"Against downtrend - high risk"
        
        else:  # SHORT
            if regime == MarketRegime.TRENDING_DOWN:
                score = confidence / 100 * 20  # Full points if high confidence downtrend
                reason = f"Strong downtrend alignment ({confidence:.1f}%)"
            elif regime == MarketRegime.RANGING:
                score = 8.0  # Neutral in ranging market
                reason = f"Ranging market - moderate short opportunity"
            elif regime == MarketRegime.VOLATILE:
                score = 5.0  # Risky in volatile market
                reason = f"Volatile market - risky for shorts"
            else:  # TRENDING_UP
                score = 2.0
                reason = f"Against uptrend - high risk"
        
        return score, reason
    
    def _score_rsi_condition(self, data: pd.DataFrame, signal_direction: SignalDirection) -> tuple[float, str]:
        """
        Score RSI condition factor (0-15 points)
        Higher score when RSI supports signal direction
        """
        if len(data) < self.rsi_period + 5:
            return 5.0, "Insufficient data for RSI"
        
        rsi = self._calculate_rsi(data)
        current_rsi = rsi.iloc[-1]
        
        if signal_direction == SignalDirection.LONG:
            if current_rsi <= 30:
                score = 15.0
                reason = f"RSI oversold ({current_rsi:.1f}) - strong long signal"
            elif current_rsi <= 40:
                score = 10.0
                reason = f"RSI below 40 ({current_rsi:.1f}) - good long setup"
            elif current_rsi <= 50:
                score = 6.0
                reason = f"RSI neutral-bearish ({current_rsi:.1f})"
            elif current_rsi <= 70:
                score = 3.0
                reason = f"RSI rising ({current_rsi:.1f}) - late to long"
            else:
                score = 1.0
                reason = f"RSI overbought ({current_rsi:.1f}) - poor long entry"
        
        else:  # SHORT
            if current_rsi >= 70:
                score = 15.0
                reason = f"RSI overbought ({current_rsi:.1f}) - strong short signal"
            elif current_rsi >= 60:
                score = 10.0
                reason = f"RSI above 60 ({current_rsi:.1f}) - good short setup"
            elif current_rsi >= 50:
                score = 6.0
                reason = f"RSI neutral-bullish ({current_rsi:.1f})"
            elif current_rsi >= 30:
                score = 3.0
                reason = f"RSI falling ({current_rsi:.1f}) - late to short"
            else:
                score = 1.0
                reason = f"RSI oversold ({current_rsi:.1f}) - poor short entry"
        
        return score, reason
    
    def _score_volume_confirmation(self, data: pd.DataFrame, signal_direction: SignalDirection) -> tuple[float, str]:
        """
        Score volume confirmation factor (0-10 points)
        Higher score when volume supports the move
        """
        if 'volume' not in data.columns or len(data) < self.volume_ma_period + 5:
            return 5.0, "No volume data or insufficient history"
        
        volume = data['volume']
        volume_ma = volume.rolling(window=self.volume_ma_period).mean()
        
        current_volume = volume.iloc[-1]
        avg_volume = volume_ma.iloc[-1]
        
        # Recent volume trend (last 3 bars vs previous 3 bars)
        recent_vol_avg = volume.iloc[-3:].mean()
        previous_vol_avg = volume.iloc[-6:-3].mean()
        
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1.0
        volume_trend = recent_vol_avg / previous_vol_avg if previous_vol_avg > 0 else 1.0
        
        # Price direction for volume confirmation
        price_change = (data['close'].iloc[-1] - data['close'].iloc[-2]) / data['close'].iloc[-2]
        
        if signal_direction == SignalDirection.LONG:
            if volume_ratio > 1.5 and price_change > 0:
                score = 10.0
                reason = f"Strong volume confirmation ({volume_ratio:.1f}x avg)"
            elif volume_ratio > 1.2 and volume_trend > 1.1:
                score = 7.0
                reason = f"Good volume support ({volume_ratio:.1f}x avg)"
            elif volume_ratio > 0.8:
                score = 5.0
                reason = f"Average volume ({volume_ratio:.1f}x avg)"
            else:
                score = 2.0
                reason = f"Low volume concern ({volume_ratio:.1f}x avg)"
        
        else:  # SHORT
            if volume_ratio > 1.5 and price_change < 0:
                score = 10.0
                reason = f"Strong volume confirmation ({volume_ratio:.1f}x avg)"
            elif volume_ratio > 1.2 and volume_trend > 1.1:
                score = 7.0
                reason = f"Good volume support ({volume_ratio:.1f}x avg)"
            elif volume_ratio > 0.8:
                score = 5.0
                reason = f"Average volume ({volume_ratio:.1f}x avg)"
            else:
                score = 2.0
                reason = f"Low volume concern ({volume_ratio:.1f}x avg)"
        
        return score, reason
    
    def _score_multitimeframe_agreement(self, sr_results: Dict[str, SRResult],
                                      signal_direction: SignalDirection) -> tuple[float, str]:
        """
        Score multi-timeframe agreement factor (0-10 points)
        Higher score when multiple timeframes show relevant S/R levels
        """
        if len(sr_results) <= 1:
            return 5.0, "Single timeframe analysis"
        
        current_price = list(sr_results.values())[0].current_price
        supporting_timeframes = 0
        total_timeframes = len(sr_results)
        
        for tf, sr_result in sr_results.items():
            relevant_levels = []
            
            for level in sr_result.levels:
                distance_pct = abs(level.mid - current_price) / current_price * 100
                if distance_pct <= 3.0:  # Within 3% 
                    if signal_direction == SignalDirection.LONG and level.mid <= current_price:
                        relevant_levels.append(level)
                    elif signal_direction == SignalDirection.SHORT and level.mid >= current_price:
                        relevant_levels.append(level)
            
            if relevant_levels:
                supporting_timeframes += 1
        
        agreement_ratio = supporting_timeframes / total_timeframes
        
        if agreement_ratio >= 0.8:
            score = 10.0
            reason = f"Strong MTF agreement ({supporting_timeframes}/{total_timeframes})"
        elif agreement_ratio >= 0.6:
            score = 7.0
            reason = f"Good MTF agreement ({supporting_timeframes}/{total_timeframes})"
        elif agreement_ratio >= 0.4:
            score = 5.0
            reason = f"Moderate MTF agreement ({supporting_timeframes}/{total_timeframes})"
        else:
            score = 2.0
            reason = f"Poor MTF agreement ({supporting_timeframes}/{total_timeframes})"
        
        return score, reason
    
    def _score_trend_alignment(self, data: pd.DataFrame, signal_direction: SignalDirection) -> tuple[float, str]:
        """
        Score trend alignment factor (0-10 points)
        Higher score when signal aligns with EMA trend
        """
        if len(data) < self.ema_trend_period + 5:
            return 5.0, "Insufficient data for trend analysis"
        
        close = data['close']
        ema = close.ewm(span=self.ema_trend_period).mean()
        
        current_price = close.iloc[-1]
        current_ema = ema.iloc[-1]
        
        # EMA slope (trend direction)
        ema_slope = (ema.iloc[-1] - ema.iloc[-5]) / ema.iloc[-5] * 100
        
        # Price position relative to EMA
        price_vs_ema = (current_price - current_ema) / current_ema * 100
        
        if signal_direction == SignalDirection.LONG:
            if price_vs_ema > 1 and ema_slope > 0.1:
                score = 10.0
                reason = f"Strong uptrend alignment (Price {price_vs_ema:.1f}% above EMA)"
            elif price_vs_ema > 0 and ema_slope > 0:
                score = 7.0
                reason = f"Good uptrend alignment"
            elif price_vs_ema > -1:
                score = 5.0
                reason = f"Near EMA support"
            else:
                score = 2.0
                reason = f"Below EMA trend ({price_vs_ema:.1f}%)"
        
        else:  # SHORT
            if price_vs_ema < -1 and ema_slope < -0.1:
                score = 10.0
                reason = f"Strong downtrend alignment (Price {abs(price_vs_ema):.1f}% below EMA)"
            elif price_vs_ema < 0 and ema_slope < 0:
                score = 7.0
                reason = f"Good downtrend alignment"
            elif price_vs_ema < 1:
                score = 5.0
                reason = f"Near EMA resistance"
            else:
                score = 2.0
                reason = f"Above EMA trend ({price_vs_ema:.1f}%)"
        
        return score, reason
    
    def calculate_confluence_score(
        self,
        data: pd.DataFrame,
        sr_results: Dict[str, SRResult],
        regime_result: RegimeResult,
        signal_direction: SignalDirection
    ) -> ConfluenceResult:
        """
        Calculate overall confluence score for a signal
        
        Args:
            data: OHLCV DataFrame
            sr_results: Dict of S/R results by timeframe
            regime_result: Market regime detection result
            signal_direction: LONG or SHORT signal
            
        Returns:
            ConfluenceResult with total score and breakdown
        """
        current_price = data['close'].iloc[-1]
        primary_sr = list(sr_results.values())[0]  # Use primary timeframe for main S/R analysis
        
        # Calculate individual factor scores
        factors = {}
        reasoning = []
        
        # 1. S/R Proximity (0-20 points)
        prox_score, prox_reason = self._score_sr_proximity(current_price, primary_sr, signal_direction)
        factors['sr_proximity'] = prox_score
        reasoning.append(f"S/R Proximity ({prox_score:.1f}/20): {prox_reason}")
        
        # 2. S/R Strength (0-15 points)
        strength_score, strength_reason = self._score_sr_strength(current_price, primary_sr, signal_direction)
        factors['sr_strength'] = strength_score
        reasoning.append(f"S/R Strength ({strength_score:.1f}/15): {strength_reason}")
        
        # 3. Regime Alignment (0-20 points)
        regime_score, regime_reason = self._score_regime_alignment(regime_result, signal_direction)
        factors['regime_alignment'] = regime_score
        reasoning.append(f"Regime Alignment ({regime_score:.1f}/20): {regime_reason}")
        
        # 4. RSI Condition (0-15 points)
        rsi_score, rsi_reason = self._score_rsi_condition(data, signal_direction)
        factors['rsi_condition'] = rsi_score
        reasoning.append(f"RSI Condition ({rsi_score:.1f}/15): {rsi_reason}")
        
        # 5. Volume Confirmation (0-10 points)
        volume_score, volume_reason = self._score_volume_confirmation(data, signal_direction)
        factors['volume_confirmation'] = volume_score
        reasoning.append(f"Volume Confirmation ({volume_score:.1f}/10): {volume_reason}")
        
        # 6. Multi-timeframe Agreement (0-10 points)
        mtf_score, mtf_reason = self._score_multitimeframe_agreement(sr_results, signal_direction)
        factors['mtf_agreement'] = mtf_score
        reasoning.append(f"MTF Agreement ({mtf_score:.1f}/10): {mtf_reason}")
        
        # 7. Trend Alignment (0-10 points)
        trend_score, trend_reason = self._score_trend_alignment(data, signal_direction)
        factors['trend_alignment'] = trend_score
        reasoning.append(f"Trend Alignment ({trend_score:.1f}/10): {trend_reason}")
        
        # Calculate total score
        total_score = sum(factors.values())
        
        return ConfluenceResult(
            total_score=min(total_score, 100.0),  # Cap at 100
            signal_direction=signal_direction,
            factor_breakdown=factors,
            reasoning=reasoning
        )
    
    def print_confluence_analysis(self, confluence_result: ConfluenceResult) -> None:
        """Print formatted confluence analysis"""
        print(f"\n=== Confluence Analysis - {confluence_result.signal_direction.value} ===")
        print(f"Total Score: {confluence_result.total_score:.1f}/100")
        
        # Score interpretation
        if confluence_result.total_score >= 75:
            quality = "EXCELLENT"
        elif confluence_result.total_score >= 60:
            quality = "GOOD"
        elif confluence_result.total_score >= 45:
            quality = "MODERATE"
        elif confluence_result.total_score >= 30:
            quality = "WEAK"
        else:
            quality = "POOR"
        
        print(f"Signal Quality: {quality}")
        
        print(f"\nFactor Breakdown:")
        for reason in confluence_result.reasoning:
            print(f"  {reason}")


if __name__ == "__main__":
    # Example usage
    pass