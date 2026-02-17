"""
PulseWave Trading Platform
A comprehensive trading signal engine that replicates Pine Script PulseWave S/R algorithm

Components:
- sr_engine: Support/Resistance level detection
- regime_detector: Market regime classification  
- confluence_scorer: Multi-factor signal scoring
- signal_generator: Trading signal generation
- backtester: Performance analysis
- data_fetcher: OHLCV data from Binance
- main: Complete platform integration

Usage:
    from pulsewave_engine import PulseWavePlatform
    
    platform = PulseWavePlatform()
    results = platform.analyze_symbol('BTCUSDT')
    platform.print_analysis(results)
"""

__version__ = "1.1.0"
__author__ = "PulseWave Development Team"

# Core imports
from .sr_engine import SupportResistanceEngine, SRLevel, SRResult
from .regime_detector import RegimeDetector, RegimeResult, MarketRegime
from .confluence_scorer import ConfluenceScorer, ConfluenceResult, SignalDirection
from .signal_generator import SignalGenerator, TradingSignal, Signal
from .backtester import PulseWaveBacktester, BacktestResult, PositionSizing
from .data_fetcher import BinanceDataFetcher, fetch_crypto_data
from .main import PulseWavePlatform

# Convenience exports
__all__ = [
    # Core classes
    'PulseWavePlatform',
    'SupportResistanceEngine',
    'RegimeDetector', 
    'ConfluenceScorer',
    'SignalGenerator',
    'PulseWaveBacktester',
    'BinanceDataFetcher',
    
    # Data structures
    'SRLevel',
    'SRResult',
    'RegimeResult',
    'ConfluenceResult', 
    'TradingSignal',
    'BacktestResult',
    
    # Enums
    'MarketRegime',
    'SignalDirection',
    'Signal',
    'PositionSizing',
    
    # Utility functions
    'fetch_crypto_data'
]