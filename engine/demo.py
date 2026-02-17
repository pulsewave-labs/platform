"""
PulseWave Platform Demo
Demonstrates the platform capabilities using sample data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Try to import platform components (will fail if pandas not installed)
try:
    from sr_engine import SupportResistanceEngine
    from regime_detector import RegimeDetector  
    from confluence_scorer import ConfluenceScorer
    from signal_generator import SignalGenerator
    from main import PulseWavePlatform
    IMPORTS_OK = True
except ImportError as e:
    print(f"Missing dependencies: {e}")
    print("Please install: pip install pandas numpy requests")
    IMPORTS_OK = False


def generate_sample_ohlcv_data(num_bars: int = 1000, start_price: float = 50000.0) -> pd.DataFrame:
    """
    Generate realistic OHLCV sample data for testing
    Creates a trending market with support/resistance levels
    """
    np.random.seed(42)  # For reproducible results
    
    # Generate base price series with trend and noise
    trend = np.linspace(0, 0.3, num_bars)  # 30% uptrend over period
    noise = np.random.normal(0, 0.02, num_bars).cumsum()  # Random walk noise
    
    # Create price levels with some mean reversion
    base_returns = trend + noise * 0.5
    
    # Add some volatility clustering
    volatility = np.random.exponential(0.015, num_bars)
    for i in range(1, len(volatility)):
        volatility[i] = 0.7 * volatility[i-1] + 0.3 * volatility[i]
    
    returns = base_returns * volatility
    
    # Generate OHLC from returns
    close_prices = start_price * np.exp(returns.cumsum())
    
    # Generate realistic OHLC bars
    data = []
    for i in range(num_bars):
        close = close_prices[i]
        
        # Realistic daily range (0.5% to 8%)
        daily_range_pct = np.random.uniform(0.005, 0.08)
        range_size = close * daily_range_pct
        
        # Open near previous close (with some gap)
        if i == 0:
            open_price = close * np.random.uniform(0.995, 1.005)
        else:
            prev_close = data[-1]['close']
            gap = np.random.normal(0, 0.002)  # Small overnight gap
            open_price = prev_close * (1 + gap)
        
        # High and low based on range
        high = max(open_price, close) + range_size * np.random.uniform(0.2, 0.8)
        low = min(open_price, close) - range_size * np.random.uniform(0.2, 0.8)
        
        # Volume (correlated with volatility)
        base_volume = 1000000
        volume_mult = 1 + abs(returns[i]) * 20  # Higher volume on big moves
        volume = base_volume * volume_mult * np.random.uniform(0.5, 2.0)
        
        data.append({
            'open': open_price,
            'high': high,
            'low': low, 
            'close': close,
            'volume': volume
        })
    
    # Create DataFrame with datetime index
    df = pd.DataFrame(data)
    
    # Create realistic datetime index (4-hour bars)
    start_time = datetime(2024, 1, 1)
    timestamps = [start_time + timedelta(hours=4*i) for i in range(num_bars)]
    df.index = pd.DatetimeIndex(timestamps)
    
    return df


def demo_sr_engine():
    """Demo the S/R engine component"""
    print("=== S/R Engine Demo ===")
    
    # Generate sample data
    data = generate_sample_ohlcv_data(500, 50000)
    
    # Initialize S/R engine
    sr_engine = SupportResistanceEngine(
        pivot_period=10,
        max_pivots=60,
        channel_width_pct=10,
        min_strength=3
    )
    
    # Calculate S/R levels
    sr_result = sr_engine.calculate_sr_levels(data, "4h")
    
    # Print analysis
    sr_engine.print_sr_analysis(sr_result)
    
    return sr_result


def demo_regime_detector():
    """Demo the regime detector component"""
    print("\n=== Regime Detector Demo ===")
    
    # Generate sample data
    data = generate_sample_ohlcv_data(200, 45000)
    
    # Initialize regime detector
    detector = RegimeDetector()
    
    # Detect regime
    regime_result = detector.detect_regime(data)
    
    # Print analysis
    detector.print_regime_analysis(regime_result)
    
    return regime_result


def demo_complete_platform():
    """Demo the complete integrated platform"""
    print("\n=== Complete Platform Demo ===")
    
    # Initialize platform
    platform = PulseWavePlatform()
    
    # Generate sample data for multiple timeframes
    data_4h = generate_sample_ohlcv_data(500, 50000)
    data_1d = generate_sample_ohlcv_data(100, 50000)  # Less bars for daily
    
    # Create data dict (simulating multi-timeframe)
    data_dict = {
        '4h': data_4h,
        '1d': data_1d
    }
    
    # Manually run analysis components (since we can't fetch real data)
    print("Analyzing sample market data...")
    
    # S/R Analysis
    sr_results = platform.sr_engine.calculate_multi_timeframe_sr(data_dict)
    
    # Regime Detection  
    regime_result = platform.regime_detector.detect_regime(data_4h)
    
    # Signal Generation
    signal = platform.signal_generator.generate_signal(data_4h, ['4h', '1d'])
    
    # Print complete analysis
    current_price = data_4h['close'].iloc[-1]
    results = {
        'symbol': 'SAMPLE_DATA', 
        'current_price': current_price,
        'timestamp': datetime.utcnow(),
        'data': data_dict,
        'sr_results': sr_results,
        'regime_result': regime_result,
        'signal': signal,
        'timeframes': ['4h', '1d']
    }
    
    platform.print_analysis(results)


def demo_architecture_overview():
    """Show the overall architecture and data flow"""
    print("=== PulseWave Architecture Overview ===")
    print("""
    Data Flow:
    1. Data Fetcher → OHLCV data from Binance API
    2. S/R Engine → Pivot detection & clustering → S/R levels
    3. Regime Detector → Technical indicators → Market regime
    4. Confluence Scorer → Multi-factor analysis → Signal score
    5. Signal Generator → Entry/SL/TP levels → Trading signal
    6. Backtester → Historical testing → Performance metrics
    
    Core Components:
    ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
    │  Data Fetcher   │───►│   S/R Engine     │───►│ Regime Detector │
    │                 │    │                  │    │                 │
    │ • Binance API   │    │ • Pivot detect   │    │ • ATR, ADX      │
    │ • Multi-TF      │    │ • Clustering     │    │ • BB Width      │
    │ • Rate limits   │    │ • Strength calc  │    │ • EMA position  │
    └─────────────────┘    └──────────────────┘    └─────────────────┘
                                      │                       │
                                      ▼                       ▼
    ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
    │   Backtester    │◄───│ Signal Generator │◄───│Confluence Scorer│
    │                 │    │                  │    │                 │
    │ • Vectorized    │    │ • Entry/SL/TP    │    │ • 7 factors     │
    │ • Position size │    │ • Risk/reward    │    │ • 0-100 score   │
    │ • Performance   │    │ • Confidence     │    │ • Multi-TF      │
    └─────────────────┘    └──────────────────┘    └─────────────────┘
    """)


def main():
    """Run complete demo"""
    print("🎯 PulseWave Trading Platform Demo")
    print("=" * 60)
    
    if not IMPORTS_OK:
        print("Cannot run demo - missing dependencies")
        print("Please install: pip install pandas numpy requests")
        return
    
    try:
        # Show architecture
        demo_architecture_overview()
        
        # Demo individual components
        demo_sr_engine()
        demo_regime_detector()
        
        # Demo complete platform
        demo_complete_platform()
        
        print("\n" + "=" * 60)
        print("✅ Demo completed successfully!")
        print("\nTo use with real data:")
        print("  python main.py --symbol BTCUSDT --timeframes 4h 1d")
        print("\nTo run backtests:")  
        print("  python main.py --backtest --symbol BTCUSDT")
        print("\nTo monitor live:")
        print("  python main.py --live --symbol BTCUSDT")
        
    except Exception as e:
        print(f"\n❌ Demo error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()