"""
PulseWave Support/Resistance Engine
Replicates the exact pivot-based S/R clustering algorithm from Pine Script
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, NamedTuple
import logging
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class SRLevel:
    """Represents a Support/Resistance level"""
    mid: float
    high: float
    low: float
    strength: int
    is_resistance: bool
    distance_pct: float = 0.0


@dataclass
class SRResult:
    """Contains all S/R levels for a timeframe"""
    levels: List[SRLevel]
    timeframe: str
    current_price: float
    channel_width: float
    pivot_count: int


class SupportResistanceEngine:
    """
    Core S/R engine that replicates Pine Script PulseWave algorithm exactly.
    
    The algorithm:
    1. Detect pivot highs/lows using configurable lookback periods
    2. Store recent pivots in a rolling buffer
    3. Calculate dynamic channel width based on price range
    4. Cluster pivots within channel width tolerance
    5. Calculate strength (touch count) for each cluster
    6. Remove overlapping weaker clusters
    7. Sort by strength and return top levels
    """
    
    def __init__(
        self,
        pivot_period: int = 10,
        max_pivots: int = 60,
        channel_width_pct: int = 10,
        max_sr_levels: int = 8,
        min_strength: int = 3,
        lookback_period: int = 400,
        source: str = "High/Low"  # "High/Low" or "Close/Open"
    ):
        self.pivot_period = pivot_period
        self.max_pivots = max_pivots
        self.channel_width_pct = channel_width_pct
        self.max_sr_levels = max_sr_levels
        self.min_strength = min_strength
        self.lookback_period = lookback_period
        self.source = source
        
    def _detect_pivots(self, data: pd.DataFrame) -> np.ndarray:
        """
        Detect pivot highs and lows exactly like Pine Script ta.pivothigh/ta.pivotlow
        
        Args:
            data: OHLCV DataFrame
            
        Returns:
            Array of pivot values (NaN for non-pivots)
        """
        if self.source == "High/Low":
            high_values = data['high'].values
            low_values = data['low'].values
        else:  # Close/Open
            high_values = np.maximum(data['close'].values, data['open'].values)
            low_values = np.minimum(data['close'].values, data['open'].values)
        
        pivots = np.full(len(data), np.nan)
        
        # Detect pivot highs
        for i in range(self.pivot_period, len(high_values) - self.pivot_period):
            is_pivot_high = True
            center_val = high_values[i]
            
            # Check left side
            for j in range(i - self.pivot_period, i):
                if high_values[j] >= center_val:
                    is_pivot_high = False
                    break
            
            if is_pivot_high:
                # Check right side
                for j in range(i + 1, i + self.pivot_period + 1):
                    if high_values[j] >= center_val:
                        is_pivot_high = False
                        break
            
            if is_pivot_high:
                pivots[i] = center_val
        
        # Detect pivot lows
        for i in range(self.pivot_period, len(low_values) - self.pivot_period):
            is_pivot_low = True
            center_val = low_values[i]
            
            # Check left side
            for j in range(i - self.pivot_period, i):
                if low_values[j] <= center_val:
                    is_pivot_low = False
                    break
            
            if is_pivot_low:
                # Check right side
                for j in range(i + 1, i + self.pivot_period + 1):
                    if low_values[j] <= center_val:
                        is_pivot_low = False
                        break
            
            if is_pivot_low:
                # Only set if no pivot high already exists at this position
                if np.isnan(pivots[i]):
                    pivots[i] = center_val
        
        return pivots
    
    def _calculate_channel_width(self, data: pd.DataFrame) -> float:
        """
        Calculate dynamic channel width based on price range
        Matches Pine Script: (ta.highest(cwLookback) - ta.lowest(cwLookback)) * ChannelW / 100
        """
        if len(data) < self.lookback_period:
            lookback_data = data
        else:
            lookback_data = data.tail(self.lookback_period)
        
        highest = lookback_data['high'].max()
        lowest = lookback_data['low'].min()
        
        channel_width = (highest - lowest) * self.channel_width_pct / 100
        return channel_width
    
    def _cluster_pivots(self, pivot_values: List[float], channel_width: float) -> List[Tuple[float, float, int]]:
        """
        Cluster pivots within channel width and calculate strength
        Returns list of (high, low, strength) tuples
        
        This replicates the core Pine Script clustering algorithm exactly
        """
        clusters = []
        
        for i, pivot_base in enumerate(pivot_values):
            cluster_low = pivot_base
            cluster_high = pivot_base
            num_pivots = 0
            
            # Find all pivots within channel width of this pivot
            for j, pivot_test in enumerate(pivot_values):
                if pivot_test <= cluster_low:
                    width = cluster_high - pivot_test
                else:
                    width = pivot_test - cluster_low
                
                if width <= channel_width:
                    if pivot_test <= cluster_high:
                        cluster_low = min(cluster_low, pivot_test)
                    else:
                        cluster_high = max(cluster_high, pivot_test)
                    num_pivots += 1
            
            # Check if this cluster overlaps with existing clusters
            is_valid = True
            overlapping_indices = []
            
            for k, (existing_high, existing_low, existing_strength) in enumerate(clusters):
                # Check for overlap
                if ((existing_high >= cluster_low and existing_high <= cluster_high) or 
                    (existing_low >= cluster_low and existing_low <= cluster_high)):
                    
                    if num_pivots >= existing_strength:
                        # New cluster is stronger, mark existing for removal
                        overlapping_indices.append(k)
                    else:
                        # Existing cluster is stronger, don't add new one
                        is_valid = False
                        break
            
            if is_valid and num_pivots >= self.min_strength:
                # Remove overlapping weaker clusters (in reverse order to maintain indices)
                for idx in sorted(overlapping_indices, reverse=True):
                    clusters.pop(idx)
                
                clusters.append((cluster_high, cluster_low, num_pivots))
        
        # Sort by strength (descending) and limit to max levels
        clusters.sort(key=lambda x: x[2], reverse=True)
        return clusters[:self.max_sr_levels]
    
    def calculate_sr_levels(self, data: pd.DataFrame, timeframe: str = "current") -> SRResult:
        """
        Calculate Support/Resistance levels for given OHLCV data
        
        Args:
            data: DataFrame with OHLC columns
            timeframe: String identifier for timeframe
            
        Returns:
            SRResult containing all calculated levels
        """
        if len(data) < self.pivot_period * 2 + 1:
            logger.warning(f"Insufficient data for pivot detection. Need at least {self.pivot_period * 2 + 1} bars")
            return SRResult([], timeframe, data['close'].iloc[-1], 0.0, 0)
        
        # Detect pivots
        pivot_array = self._detect_pivots(data)
        
        # Extract valid pivots (most recent first)
        valid_pivots = []
        for i in range(len(pivot_array) - 1, -1, -1):
            if not np.isnan(pivot_array[i]):
                valid_pivots.append(pivot_array[i])
                if len(valid_pivots) >= self.max_pivots:
                    break
        
        if len(valid_pivots) < self.min_strength:
            logger.info(f"Insufficient pivots found: {len(valid_pivots)}")
            return SRResult([], timeframe, data['close'].iloc[-1], 0.0, len(valid_pivots))
        
        # Calculate channel width
        channel_width = self._calculate_channel_width(data)
        
        # Cluster pivots
        clusters = self._cluster_pivots(valid_pivots, channel_width)
        
        # Convert clusters to SRLevel objects
        current_price = data['close'].iloc[-1]
        sr_levels = []
        
        for high, low, strength in clusters:
            mid = (high + low) / 2
            # Round to tick size (assume 2 decimal places for crypto)
            mid = round(mid, 8)
            
            is_resistance = mid >= current_price
            distance_pct = abs(mid - current_price) / current_price * 100
            
            sr_level = SRLevel(
                mid=mid,
                high=high,
                low=low,
                strength=strength,
                is_resistance=is_resistance,
                distance_pct=distance_pct
            )
            sr_levels.append(sr_level)
        
        return SRResult(
            levels=sr_levels,
            timeframe=timeframe,
            current_price=current_price,
            channel_width=channel_width,
            pivot_count=len(valid_pivots)
        )
    
    def calculate_multi_timeframe_sr(self, data_dict: Dict[str, pd.DataFrame]) -> Dict[str, SRResult]:
        """
        Calculate S/R levels for multiple timeframes
        
        Args:
            data_dict: Dictionary of {timeframe: DataFrame}
            
        Returns:
            Dictionary of {timeframe: SRResult}
        """
        results = {}
        
        for timeframe, data in data_dict.items():
            try:
                results[timeframe] = self.calculate_sr_levels(data, timeframe)
                logger.info(f"Calculated {len(results[timeframe].levels)} S/R levels for {timeframe}")
            except Exception as e:
                logger.error(f"Error calculating S/R for {timeframe}: {e}")
                results[timeframe] = SRResult([], timeframe, data['close'].iloc[-1], 0.0, 0)
        
        return results
    
    def get_nearest_levels(self, sr_result: SRResult, current_price: float = None) -> Tuple[Optional[SRLevel], Optional[SRLevel]]:
        """
        Get the nearest support and resistance levels
        
        Returns:
            Tuple of (nearest_support, nearest_resistance)
        """
        if current_price is None:
            current_price = sr_result.current_price
        
        nearest_support = None
        nearest_resistance = None
        
        for level in sr_result.levels:
            if level.mid < current_price:
                # Support level
                if nearest_support is None or level.mid > nearest_support.mid:
                    nearest_support = level
            elif level.mid > current_price:
                # Resistance level  
                if nearest_resistance is None or level.mid < nearest_resistance.mid:
                    nearest_resistance = level
        
        return nearest_support, nearest_resistance
    
    def print_sr_analysis(self, sr_result: SRResult) -> None:
        """Print formatted S/R analysis"""
        print(f"\n=== S/R Analysis - {sr_result.timeframe} ===")
        print(f"Current Price: ${sr_result.current_price:.4f}")
        print(f"Channel Width: ${sr_result.channel_width:.4f} ({self.channel_width_pct}%)")
        print(f"Pivot Count: {sr_result.pivot_count}")
        print(f"S/R Levels Found: {len(sr_result.levels)}")
        
        if sr_result.levels:
            print("\nLevels (sorted by strength):")
            print("Type       | Price      | Strength | Distance")
            print("-----------|------------|----------|----------")
            
            for level in sr_result.levels:
                level_type = "RESISTANCE" if level.is_resistance else "SUPPORT   "
                print(f"{level_type} | ${level.mid:8.4f} | {level.strength:8d} | {level.distance_pct:6.2f}%")
                
            # Show nearest levels
            nearest_support, nearest_resistance = self.get_nearest_levels(sr_result)
            print("\nNearest Levels:")
            if nearest_support:
                print(f"Support:    ${nearest_support.mid:.4f} (strength: {nearest_support.strength})")
            if nearest_resistance:
                print(f"Resistance: ${nearest_resistance.mid:.4f} (strength: {nearest_resistance.strength})")


if __name__ == "__main__":
    # Example usage
    pass