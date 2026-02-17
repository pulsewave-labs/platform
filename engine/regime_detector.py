"""
Market Regime Detector
Determines market regime: TRENDING_UP, TRENDING_DOWN, RANGING, VOLATILE
Uses ATR ratio, ADX, Bollinger Band width, price vs EMA position
"""

import pandas as pd
import numpy as np
from typing import Tuple, NamedTuple
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class MarketRegime(Enum):
    """Market regime classifications"""
    TRENDING_UP = "TRENDING_UP"
    TRENDING_DOWN = "TRENDING_DOWN" 
    RANGING = "RANGING"
    VOLATILE = "VOLATILE"


class RegimeResult(NamedTuple):
    """Market regime detection result"""
    regime: MarketRegime
    confidence: float  # 0-100
    components: dict   # Breakdown of each factor


class RegimeDetector:
    """
    Detects market regime using multiple technical indicators:
    
    1. ATR Ratio - measure of volatility expansion/contraction
    2. ADX - trend strength indicator
    3. Bollinger Band Width - volatility measurement
    4. Price vs EMA Position - trend direction
    5. Price momentum - short vs medium term
    
    Combines these factors to determine overall market regime with confidence score
    """
    
    def __init__(
        self,
        atr_period: int = 14,
        adx_period: int = 14,
        bb_period: int = 20,
        bb_std: float = 2.0,
        ema_fast: int = 20,
        ema_slow: int = 50,
        momentum_fast: int = 5,
        momentum_slow: int = 20
    ):
        self.atr_period = atr_period
        self.adx_period = adx_period
        self.bb_period = bb_period
        self.bb_std = bb_std
        self.ema_fast = ema_fast
        self.ema_slow = ema_slow
        self.momentum_fast = momentum_fast
        self.momentum_slow = momentum_slow
        
    def _calculate_atr(self, data: pd.DataFrame) -> pd.Series:
        """Calculate Average True Range"""
        high_low = data['high'] - data['low']
        high_close = np.abs(data['high'] - data['close'].shift())
        low_close = np.abs(data['low'] - data['close'].shift())
        
        true_range = np.maximum(high_low, np.maximum(high_close, low_close))
        atr = true_range.rolling(window=self.atr_period).mean()
        
        return atr
    
    def _calculate_adx(self, data: pd.DataFrame) -> pd.Series:
        """Calculate Average Directional Index (ADX)"""
        high = data['high']
        low = data['low']
        close = data['close']
        
        # Calculate directional movements
        plus_dm = high.diff()
        minus_dm = low.diff() * -1
        
        # Set negative movements to zero
        plus_dm[plus_dm < 0] = 0
        minus_dm[minus_dm < 0] = 0
        
        # Calculate True Range
        atr = self._calculate_atr(data)
        
        # Calculate smoothed directional indicators
        plus_di = 100 * (plus_dm.rolling(window=self.adx_period).mean() / atr)
        minus_di = 100 * (minus_dm.rolling(window=self.adx_period).mean() / atr)
        
        # Calculate DX
        dx = 100 * np.abs(plus_di - minus_di) / (plus_di + minus_di)
        
        # Calculate ADX (smoothed DX)
        adx = dx.rolling(window=self.adx_period).mean()
        
        return adx
    
    def _calculate_bollinger_width(self, data: pd.DataFrame) -> pd.Series:
        """Calculate Bollinger Band Width as percentage"""
        close = data['close']
        sma = close.rolling(window=self.bb_period).mean()
        std = close.rolling(window=self.bb_period).std()
        
        upper_band = sma + (std * self.bb_std)
        lower_band = sma - (std * self.bb_std)
        
        bb_width = ((upper_band - lower_band) / sma) * 100
        
        return bb_width
    
    def _calculate_ema_position(self, data: pd.DataFrame) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Calculate EMA position indicators"""
        close = data['close']
        
        ema_fast = close.ewm(span=self.ema_fast).mean()
        ema_slow = close.ewm(span=self.ema_slow).mean()
        
        # Price position relative to EMAs
        price_vs_fast = ((close - ema_fast) / ema_fast) * 100
        price_vs_slow = ((close - ema_slow) / ema_slow) * 100
        
        # EMA trend (fast vs slow)
        ema_trend = ((ema_fast - ema_slow) / ema_slow) * 100
        
        return price_vs_fast, price_vs_slow, ema_trend
    
    def _calculate_momentum(self, data: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
        """Calculate price momentum indicators"""
        close = data['close']
        
        momentum_fast = ((close - close.shift(self.momentum_fast)) / close.shift(self.momentum_fast)) * 100
        momentum_slow = ((close - close.shift(self.momentum_slow)) / close.shift(self.momentum_slow)) * 100
        
        return momentum_fast, momentum_slow
    
    def _score_trend_strength(self, adx_value: float, ema_trend: float) -> Tuple[float, bool]:
        """
        Score trend strength and direction
        Returns (strength_score, is_uptrend)
        """
        # ADX interpretation
        if adx_value >= 25:
            trend_strength = min((adx_value - 25) / 25, 1.0)  # Scale 0-1
        else:
            trend_strength = 0.0
        
        # EMA trend direction
        is_uptrend = ema_trend > 0
        
        return trend_strength, is_uptrend
    
    def _score_volatility(self, atr_ratio: float, bb_width: float) -> float:
        """
        Score volatility level (0 = low, 1 = high)
        """
        # ATR ratio scoring (comparing current to recent average)
        atr_score = min(max(atr_ratio - 1.0, 0.0) / 1.0, 1.0)  # Scale above 1.0
        
        # BB width scoring (relative to typical ranges)
        bb_score = min(max(bb_width - 2.0, 0.0) / 8.0, 1.0)  # Scale 2-10%
        
        # Combined volatility score
        volatility_score = (atr_score + bb_score) / 2.0
        
        return volatility_score
    
    def _score_momentum_alignment(self, price_vs_fast: float, price_vs_slow: float, 
                                momentum_fast: float, momentum_slow: float) -> Tuple[float, bool]:
        """
        Score momentum alignment and direction
        Returns (alignment_score, is_bullish)
        """
        # Check alignment of momentum indicators
        signals = [price_vs_fast > 0, price_vs_slow > 0, momentum_fast > 0, momentum_slow > 0]
        bullish_signals = sum(signals)
        bearish_signals = sum([not s for s in signals])
        
        if bullish_signals >= 3:
            alignment_score = bullish_signals / 4.0
            is_bullish = True
        elif bearish_signals >= 3:
            alignment_score = bearish_signals / 4.0
            is_bullish = False
        else:
            alignment_score = 0.5  # Mixed signals
            is_bullish = momentum_fast > momentum_slow
        
        return alignment_score, is_bullish
    
    def detect_regime(self, data: pd.DataFrame) -> RegimeResult:
        """
        Detect market regime for given OHLCV data
        
        Args:
            data: DataFrame with OHLC data
            
        Returns:
            RegimeResult with regime classification and confidence
        """
        if len(data) < max(self.adx_period, self.bb_period, self.ema_slow, self.momentum_slow) + 10:
            logger.warning("Insufficient data for regime detection")
            return RegimeResult(
                regime=MarketRegime.RANGING,
                confidence=50.0,
                components={}
            )
        
        # Calculate all indicators
        atr = self._calculate_atr(data)
        adx = self._calculate_adx(data)
        bb_width = self._calculate_bollinger_width(data)
        price_vs_fast, price_vs_slow, ema_trend = self._calculate_ema_position(data)
        momentum_fast, momentum_slow = self._calculate_momentum(data)
        
        # Get latest values
        current_atr = atr.iloc[-1]
        current_adx = adx.iloc[-1]
        current_bb_width = bb_width.iloc[-1]
        current_price_vs_fast = price_vs_fast.iloc[-1]
        current_price_vs_slow = price_vs_slow.iloc[-1]
        current_ema_trend = ema_trend.iloc[-1]
        current_momentum_fast = momentum_fast.iloc[-1]
        current_momentum_slow = momentum_slow.iloc[-1]
        
        # Calculate ATR ratio (current vs recent average)
        atr_ma = atr.rolling(window=20).mean().iloc[-1]
        atr_ratio = current_atr / atr_ma if atr_ma > 0 else 1.0
        
        # Score components
        trend_strength, is_uptrend = self._score_trend_strength(current_adx, current_ema_trend)
        volatility_score = self._score_volatility(atr_ratio, current_bb_width)
        momentum_alignment, is_momentum_bullish = self._score_momentum_alignment(
            current_price_vs_fast, current_price_vs_slow, 
            current_momentum_fast, current_momentum_slow
        )
        
        # Component breakdown for transparency
        components = {
            'atr_ratio': atr_ratio,
            'adx': current_adx,
            'bb_width': current_bb_width,
            'trend_strength': trend_strength,
            'volatility_score': volatility_score,
            'momentum_alignment': momentum_alignment,
            'ema_trend': current_ema_trend,
            'is_uptrend': is_uptrend,
            'is_momentum_bullish': is_momentum_bullish
        }
        
        # Regime classification logic
        if volatility_score > 0.7:
            # High volatility - could be trending or just volatile
            if trend_strength > 0.6 and momentum_alignment > 0.7:
                # Strong trend with high volatility
                regime = MarketRegime.TRENDING_UP if (is_uptrend and is_momentum_bullish) else MarketRegime.TRENDING_DOWN
                confidence = min(85 + (trend_strength * 15), 95)
            else:
                # High volatility without clear trend
                regime = MarketRegime.VOLATILE
                confidence = min(60 + (volatility_score * 30), 85)
        
        elif trend_strength > 0.5 and momentum_alignment > 0.6:
            # Clear trending conditions
            if is_uptrend == is_momentum_bullish:
                regime = MarketRegime.TRENDING_UP if is_uptrend else MarketRegime.TRENDING_DOWN
                confidence = min(70 + (trend_strength * 20) + (momentum_alignment * 10), 95)
            else:
                # Mixed trend signals
                regime = MarketRegime.RANGING
                confidence = 60
        
        else:
            # Low trend strength and momentum alignment
            regime = MarketRegime.RANGING
            confidence = min(50 + ((1 - trend_strength) * 20) + ((1 - momentum_alignment) * 15), 80)
        
        return RegimeResult(
            regime=regime,
            confidence=confidence,
            components=components
        )
    
    def print_regime_analysis(self, regime_result: RegimeResult) -> None:
        """Print formatted regime analysis"""
        print(f"\n=== Market Regime Analysis ===")
        print(f"Regime: {regime_result.regime.value}")
        print(f"Confidence: {regime_result.confidence:.1f}%")
        
        comp = regime_result.components
        print(f"\nComponent Breakdown:")
        print(f"  ATR Ratio:          {comp.get('atr_ratio', 0):.2f}")
        print(f"  ADX:                {comp.get('adx', 0):.1f}")
        print(f"  Bollinger Width:    {comp.get('bb_width', 0):.2f}%")
        print(f"  Trend Strength:     {comp.get('trend_strength', 0):.2f}")
        print(f"  Volatility Score:   {comp.get('volatility_score', 0):.2f}")
        print(f"  Momentum Alignment: {comp.get('momentum_alignment', 0):.2f}")
        print(f"  EMA Trend:          {comp.get('ema_trend', 0):.2f}%")
        print(f"  Trend Direction:    {'UP' if comp.get('is_uptrend', False) else 'DOWN'}")
        print(f"  Momentum Direction: {'BULLISH' if comp.get('is_momentum_bullish', False) else 'BEARISH'}")


if __name__ == "__main__":
    # Example usage
    pass