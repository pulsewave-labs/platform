"""
PulseWave Main Runner
Ties everything together:
- Fetch BTC/USDT data
- Run S/R engine
- Detect regime
- Generate signals
- Print current analysis
- Optional backtesting
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import argparse
import sys
from typing import Dict, List, Optional

from data_fetcher import BinanceDataFetcher, fetch_crypto_data
from sr_engine import SupportResistanceEngine
from regime_detector import RegimeDetector
from confluence_scorer import ConfluenceScorer
from signal_generator import SignalGenerator
from backtester import PulseWaveBacktester, PositionSizing

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('pulsewave.log')
    ]
)

logger = logging.getLogger(__name__)


class PulseWavePlatform:
    """
    Main PulseWave trading platform that integrates all components
    """
    
    def __init__(self, config: dict = None):
        """
        Initialize the platform with configuration
        
        Args:
            config: Configuration dictionary with component parameters
        """
        self.config = config or self._default_config()
        
        # Initialize components
        self.data_fetcher = BinanceDataFetcher()
        
        self.sr_engine = SupportResistanceEngine(
            pivot_period=self.config.get('pivot_period', 10),
            max_pivots=self.config.get('max_pivots', 60),
            channel_width_pct=self.config.get('channel_width_pct', 10),
            max_sr_levels=self.config.get('max_sr_levels', 8),
            min_strength=self.config.get('min_strength', 3),
            lookback_period=self.config.get('lookback_period', 400)
        )
        
        self.regime_detector = RegimeDetector(
            atr_period=self.config.get('atr_period', 14),
            adx_period=self.config.get('adx_period', 14),
            bb_period=self.config.get('bb_period', 20),
            ema_fast=self.config.get('ema_fast', 20),
            ema_slow=self.config.get('ema_slow', 50)
        )
        
        self.confluence_scorer = ConfluenceScorer(
            rsi_period=self.config.get('rsi_period', 14),
            volume_ma_period=self.config.get('volume_ma_period', 20),
            proximity_threshold_pct=self.config.get('proximity_threshold_pct', 2.0)
        )
        
        self.signal_generator = SignalGenerator(
            sr_engine=self.sr_engine,
            regime_detector=self.regime_detector,
            confluence_scorer=self.confluence_scorer,
            min_confluence_score=self.config.get('min_confluence_score', 45.0),
            min_risk_reward=self.config.get('min_risk_reward', 1.5),
            max_stop_loss_pct=self.config.get('max_stop_loss_pct', 3.0)
        )
        
        logger.info("PulseWave platform initialized")
    
    def _default_config(self) -> dict:
        """Default configuration parameters"""
        return {
            # S/R Engine
            'pivot_period': 10,
            'max_pivots': 60,
            'channel_width_pct': 10,
            'max_sr_levels': 8,
            'min_strength': 3,
            'lookback_period': 400,
            
            # Regime Detection
            'atr_period': 14,
            'adx_period': 14,
            'bb_period': 20,
            'ema_fast': 20,
            'ema_slow': 50,
            
            # Confluence Scoring
            'rsi_period': 14,
            'volume_ma_period': 20,
            'proximity_threshold_pct': 2.0,
            
            # Signal Generation
            'min_confluence_score': 45.0,
            'min_risk_reward': 1.5,
            'max_stop_loss_pct': 3.0,
            
            # Data Fetching
            'symbol': 'BTCUSDT',
            'timeframes': ['4h', '1d'],
            'days_back': 30
        }
    
    def analyze_symbol(
        self, 
        symbol: str = None, 
        timeframes: List[str] = None,
        days_back: int = None
    ) -> Dict:
        """
        Run complete analysis for a symbol
        
        Args:
            symbol: Trading pair symbol
            timeframes: List of timeframes to analyze
            days_back: Days of historical data
            
        Returns:
            Dictionary with all analysis results
        """
        # Use config defaults if not specified
        symbol = symbol or self.config['symbol']
        timeframes = timeframes or self.config['timeframes']
        days_back = days_back or self.config['days_back']
        
        logger.info(f"Starting analysis for {symbol} on timeframes: {timeframes}")
        
        try:
            # Step 1: Fetch data
            logger.info("Fetching data...")
            data_dict = self.data_fetcher.get_multiple_timeframes(
                symbol=symbol,
                timeframes=timeframes,
                days_back=days_back
            )
            
            if not data_dict:
                raise ValueError("No data fetched")
            
            # Use primary timeframe (first one) for main analysis
            primary_tf = timeframes[0]
            primary_data = data_dict[primary_tf]
            
            current_price = primary_data['close'].iloc[-1]
            
            logger.info(f"Data fetched successfully. Current {symbol} price: ${current_price:.4f}")
            
            # Step 2: S/R Analysis
            logger.info("Calculating S/R levels...")
            sr_results = self.sr_engine.calculate_multi_timeframe_sr(data_dict)
            
            # Step 3: Regime Detection
            logger.info("Detecting market regime...")
            regime_result = self.regime_detector.detect_regime(primary_data)
            
            # Step 4: Signal Generation
            logger.info("Generating trading signal...")
            signal = self.signal_generator.generate_signal(primary_data, timeframes)
            
            # Compile results
            results = {
                'symbol': symbol,
                'current_price': current_price,
                'timestamp': datetime.utcnow(),
                'data': data_dict,
                'sr_results': sr_results,
                'regime_result': regime_result,
                'signal': signal,
                'timeframes': timeframes
            }
            
            logger.info("Analysis completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"Error during analysis: {e}")
            raise
    
    def print_analysis(self, results: Dict) -> None:
        """Print formatted analysis results"""
        
        print(f"\n{'='*80}")
        print(f"PULSEWAVE ANALYSIS - {results['symbol']}")
        print(f"Analysis Time: {results['timestamp'].strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print(f"Current Price: ${results['current_price']:.4f}")
        print(f"{'='*80}")
        
        # Print signal first (most important)
        self.signal_generator.print_signal_analysis(results['signal'])
        
        print(f"\n{'='*80}")
        print("DETAILED COMPONENT ANALYSIS")
        print(f"{'='*80}")
        
        # S/R Analysis for each timeframe
        for tf, sr_result in results['sr_results'].items():
            if sr_result.levels:
                self.sr_engine.print_sr_analysis(sr_result)
        
        # Regime Analysis
        self.regime_detector.print_regime_analysis(results['regime_result'])
        
        # Data summary
        print(f"\n=== Data Summary ===")
        for tf, data in results['data'].items():
            print(f"{tf:>4}: {len(data)} candles from {data.index[0].strftime('%Y-%m-%d')} to {data.index[-1].strftime('%Y-%m-%d')}")
    
    def run_backtest(
        self,
        symbol: str = None,
        timeframes: List[str] = None,
        days_back: int = 180,
        position_sizing: PositionSizing = PositionSizing.PERCENT,
        position_size: float = 0.02,
        initial_capital: float = 100000
    ) -> None:
        """
        Run backtest on historical data
        
        Args:
            symbol: Trading pair symbol
            timeframes: List of timeframes
            days_back: Historical data period
            position_sizing: Position sizing method
            position_size: Position size parameter
            initial_capital: Starting capital
        """
        symbol = symbol or self.config['symbol']
        timeframes = timeframes or self.config['timeframes']
        
        logger.info(f"Starting backtest for {symbol} with {days_back} days of data")
        
        try:
            # Fetch longer historical data for backtesting
            primary_tf = timeframes[0]
            data = self.data_fetcher.get_historical_data(
                symbol=symbol,
                interval=primary_tf,
                days_back=days_back
            )
            
            # Initialize backtester
            backtester = PulseWaveBacktester(
                signal_generator=self.signal_generator,
                position_sizing=position_sizing,
                position_size=position_size,
                initial_capital=initial_capital
            )
            
            # Run backtest
            logger.info("Running backtest...")
            results = backtester.run_backtest(data)
            
            # Print results
            backtester.print_backtest_results(results)
            
            return results
            
        except Exception as e:
            logger.error(f"Error during backtesting: {e}")
            raise
    
    def live_monitoring(
        self,
        symbol: str = None,
        timeframes: List[str] = None,
        interval_minutes: int = 15
    ) -> None:
        """
        Run live monitoring mode (continuous analysis)
        
        Args:
            symbol: Trading pair symbol
            timeframes: List of timeframes
            interval_minutes: Minutes between analysis updates
        """
        symbol = symbol or self.config['symbol']
        timeframes = timeframes or self.config['timeframes']
        
        logger.info(f"Starting live monitoring for {symbol} (updates every {interval_minutes} minutes)")
        
        import time
        
        try:
            while True:
                try:
                    results = self.analyze_symbol(symbol, timeframes)
                    
                    # Clear screen and print analysis
                    print("\033[2J\033[H")  # Clear screen
                    self.print_analysis(results)
                    
                    print(f"\nNext update in {interval_minutes} minutes...")
                    
                except KeyboardInterrupt:
                    print("\nMonitoring stopped by user")
                    break
                except Exception as e:
                    logger.error(f"Error during live monitoring: {e}")
                    print(f"Error: {e}")
                
                # Wait for next update
                time.sleep(interval_minutes * 60)
                
        except KeyboardInterrupt:
            print("\nLive monitoring stopped")


def main():
    """Main entry point with command line interface"""
    parser = argparse.ArgumentParser(description="PulseWave Trading Signal Platform")
    
    parser.add_argument('--symbol', '-s', default='BTCUSDT', 
                       help='Trading symbol (default: BTCUSDT)')
    parser.add_argument('--timeframes', '-t', nargs='+', default=['4h', '1d'],
                       help='Timeframes to analyze (default: 4h 1d)')
    parser.add_argument('--days', '-d', type=int, default=30,
                       help='Days of historical data (default: 30)')
    
    # Mode selection
    parser.add_argument('--backtest', '-b', action='store_true',
                       help='Run backtest mode')
    parser.add_argument('--live', '-l', action='store_true',
                       help='Run live monitoring mode')
    parser.add_argument('--analyze', '-a', action='store_true', default=True,
                       help='Run single analysis (default)')
    
    # Backtest specific options
    parser.add_argument('--backtest-days', type=int, default=180,
                       help='Days of data for backtesting (default: 180)')
    parser.add_argument('--position-size', type=float, default=0.02,
                       help='Position size for backtesting (default: 0.02)')
    parser.add_argument('--initial-capital', type=float, default=100000,
                       help='Initial capital for backtesting (default: 100000)')
    
    # Live monitoring options
    parser.add_argument('--interval', type=int, default=15,
                       help='Update interval in minutes for live mode (default: 15)')
    
    args = parser.parse_args()
    
    # Initialize platform
    platform = PulseWavePlatform()
    
    try:
        if args.backtest:
            # Run backtest
            platform.run_backtest(
                symbol=args.symbol,
                timeframes=args.timeframes,
                days_back=args.backtest_days,
                position_sizing=PositionSizing.PERCENT,
                position_size=args.position_size,
                initial_capital=args.initial_capital
            )
            
        elif args.live:
            # Run live monitoring
            platform.live_monitoring(
                symbol=args.symbol,
                timeframes=args.timeframes,
                interval_minutes=args.interval
            )
            
        else:
            # Run single analysis (default)
            results = platform.analyze_symbol(
                symbol=args.symbol,
                timeframes=args.timeframes,
                days_back=args.days
            )
            
            platform.print_analysis(results)
    
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Application error: {e}")
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # Example usage when run directly
    if len(sys.argv) == 1:
        # No command line arguments - run demo
        print("Running PulseWave demo analysis...")
        
        platform = PulseWavePlatform()
        
        try:
            # Analyze BTC/USDT
            results = platform.analyze_symbol('BTCUSDT', ['4h', '1d'], 30)
            platform.print_analysis(results)
            
        except Exception as e:
            print(f"Demo failed: {e}")
    else:
        # Run with command line arguments
        main()