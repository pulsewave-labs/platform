"""
Data Fetcher
Fetches OHLCV data from Binance API (public, no auth needed)
Supports multiple timeframes and returns clean pandas DataFrames
"""

import pandas as pd
import numpy as np
import requests
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import time
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TimeframeConfig:
    """Timeframe configuration"""
    binance_interval: str
    description: str
    minutes: int


class BinanceDataFetcher:
    """
    Fetches OHLCV data from Binance public API
    
    Features:
    - No authentication required
    - Multiple timeframes support
    - Automatic rate limiting
    - Data validation and cleaning
    - Timezone handling
    - Error handling and retries
    """
    
    BASE_URL = "https://api.binance.com/api/v3"
    
    # Timeframe mapping
    TIMEFRAMES = {
        "1m": TimeframeConfig("1m", "1 Minute", 1),
        "3m": TimeframeConfig("3m", "3 Minutes", 3),
        "5m": TimeframeConfig("5m", "5 Minutes", 5),
        "15m": TimeframeConfig("15m", "15 Minutes", 15),
        "30m": TimeframeConfig("30m", "30 Minutes", 30),
        "1h": TimeframeConfig("1h", "1 Hour", 60),
        "2h": TimeframeConfig("2h", "2 Hours", 120),
        "4h": TimeframeConfig("4h", "4 Hours", 240),
        "6h": TimeframeConfig("6h", "6 Hours", 360),
        "8h": TimeframeConfig("8h", "8 Hours", 480),
        "12h": TimeframeConfig("12h", "12 Hours", 720),
        "1d": TimeframeConfig("1d", "1 Day", 1440),
        "3d": TimeframeConfig("3d", "3 Days", 4320),
        "1w": TimeframeConfig("1w", "1 Week", 10080),
        "1M": TimeframeConfig("1M", "1 Month", 43200)
    }
    
    def __init__(self, rate_limit_delay: float = 0.1):
        """
        Initialize data fetcher
        
        Args:
            rate_limit_delay: Delay between API calls in seconds
        """
        self.rate_limit_delay = rate_limit_delay
        self.last_request_time = 0
        
    def _rate_limit(self) -> None:
        """Apply rate limiting between requests"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.rate_limit_delay:
            time.sleep(self.rate_limit_delay - time_since_last)
        
        self.last_request_time = time.time()
    
    def _make_request(self, endpoint: str, params: dict, max_retries: int = 3) -> dict:
        """
        Make API request with retry logic
        
        Args:
            endpoint: API endpoint
            params: Request parameters
            max_retries: Maximum retry attempts
            
        Returns:
            JSON response data
        """
        url = f"{self.BASE_URL}/{endpoint}"
        
        for attempt in range(max_retries + 1):
            try:
                self._rate_limit()
                
                response = requests.get(url, params=params, timeout=10)
                response.raise_for_status()
                
                return response.json()
                
            except requests.exceptions.RequestException as e:
                if attempt == max_retries:
                    logger.error(f"API request failed after {max_retries} retries: {e}")
                    raise
                
                wait_time = (attempt + 1) * 2  # Exponential backoff
                logger.warning(f"API request failed (attempt {attempt + 1}), retrying in {wait_time}s: {e}")
                time.sleep(wait_time)
    
    def get_symbol_info(self, symbol: str) -> dict:
        """
        Get symbol information from Binance
        
        Args:
            symbol: Trading pair symbol (e.g., 'BTCUSDT')
            
        Returns:
            Symbol information dictionary
        """
        try:
            exchange_info = self._make_request("exchangeInfo", {})
            
            for symbol_info in exchange_info['symbols']:
                if symbol_info['symbol'].upper() == symbol.upper():
                    return symbol_info
            
            raise ValueError(f"Symbol {symbol} not found")
            
        except Exception as e:
            logger.error(f"Error getting symbol info for {symbol}: {e}")
            raise
    
    def get_klines(
        self, 
        symbol: str, 
        interval: str, 
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 1000
    ) -> pd.DataFrame:
        """
        Get OHLCV kline/candlestick data
        
        Args:
            symbol: Trading pair symbol (e.g., 'BTCUSDT')
            interval: Timeframe interval (e.g., '1h', '4h', '1d')
            start_time: Start datetime (optional)
            end_time: End datetime (optional)
            limit: Maximum number of klines (max 1000)
            
        Returns:
            DataFrame with OHLCV data
        """
        if interval not in self.TIMEFRAMES:
            raise ValueError(f"Unsupported interval: {interval}. Supported: {list(self.TIMEFRAMES.keys())}")
        
        params = {
            'symbol': symbol.upper(),
            'interval': self.TIMEFRAMES[interval].binance_interval,
            'limit': min(limit, 1000)
        }
        
        if start_time:
            params['startTime'] = int(start_time.timestamp() * 1000)
        
        if end_time:
            params['endTime'] = int(end_time.timestamp() * 1000)
        
        try:
            data = self._make_request("klines", params)
            
            if not data:
                raise ValueError("No data returned from API")
            
            # Convert to DataFrame
            df = pd.DataFrame(data, columns=[
                'timestamp', 'open', 'high', 'low', 'close', 'volume',
                'close_time', 'quote_volume', 'count', 'taker_buy_volume',
                'taker_buy_quote_volume', 'ignore'
            ])
            
            # Clean and convert data types
            df = self._clean_kline_data(df)
            
            logger.info(f"Fetched {len(df)} {interval} candles for {symbol}")
            return df
            
        except Exception as e:
            logger.error(f"Error fetching klines for {symbol} {interval}: {e}")
            raise
    
    def get_historical_data(
        self,
        symbol: str,
        interval: str,
        days_back: int = 30,
        end_date: Optional[datetime] = None
    ) -> pd.DataFrame:
        """
        Get historical data for specified number of days
        
        Args:
            symbol: Trading pair symbol
            interval: Timeframe interval
            days_back: Number of days of historical data
            end_date: End date (defaults to now)
            
        Returns:
            DataFrame with historical OHLCV data
        """
        if end_date is None:
            end_date = datetime.utcnow()
        
        start_date = end_date - timedelta(days=days_back)
        
        # For longer time periods, we need to make multiple requests
        all_data = []
        current_start = start_date
        
        while current_start < end_date:
            # Calculate end for this batch (max 1000 candles per request)
            interval_minutes = self.TIMEFRAMES[interval].minutes
            max_duration = timedelta(minutes=interval_minutes * 1000)
            current_end = min(current_start + max_duration, end_date)
            
            try:
                batch_data = self.get_klines(
                    symbol=symbol,
                    interval=interval,
                    start_time=current_start,
                    end_time=current_end,
                    limit=1000
                )
                
                if len(batch_data) > 0:
                    all_data.append(batch_data)
                else:
                    break
                
                # Move to next batch
                current_start = batch_data.index[-1] + timedelta(minutes=interval_minutes)
                
            except Exception as e:
                logger.warning(f"Error fetching batch starting {current_start}: {e}")
                break
        
        if not all_data:
            raise ValueError("No data fetched")
        
        # Combine all batches
        combined_data = pd.concat(all_data, ignore_index=False)
        
        # Remove duplicates and sort
        combined_data = combined_data[~combined_data.index.duplicated(keep='last')]
        combined_data = combined_data.sort_index()
        
        logger.info(f"Fetched {len(combined_data)} {interval} candles for {symbol} "
                   f"from {combined_data.index[0]} to {combined_data.index[-1]}")
        
        return combined_data
    
    def get_multiple_timeframes(
        self,
        symbol: str,
        timeframes: List[str],
        days_back: int = 30
    ) -> Dict[str, pd.DataFrame]:
        """
        Get data for multiple timeframes
        
        Args:
            symbol: Trading pair symbol
            timeframes: List of timeframe intervals
            days_back: Number of days of historical data
            
        Returns:
            Dictionary mapping timeframe to DataFrame
        """
        results = {}
        
        for tf in timeframes:
            try:
                results[tf] = self.get_historical_data(
                    symbol=symbol,
                    interval=tf,
                    days_back=days_back
                )
                logger.info(f"Successfully fetched {tf} data")
                
            except Exception as e:
                logger.error(f"Failed to fetch {tf} data: {e}")
                # Continue with other timeframes even if one fails
                continue
        
        return results
    
    def _clean_kline_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and process kline data
        
        Args:
            df: Raw kline DataFrame
            
        Returns:
            Cleaned DataFrame with proper types and index
        """
        # Convert timestamp to datetime and set as index
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df.set_index('timestamp', inplace=True)
        
        # Convert price and volume columns to float
        price_cols = ['open', 'high', 'low', 'close']
        volume_cols = ['volume', 'quote_volume', 'taker_buy_volume', 'taker_buy_quote_volume']
        
        for col in price_cols + volume_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Keep only essential columns
        essential_cols = ['open', 'high', 'low', 'close', 'volume']
        df = df[essential_cols].copy()
        
        # Remove any rows with NaN values
        df.dropna(inplace=True)
        
        # Ensure data is properly sorted
        df.sort_index(inplace=True)
        
        # Basic data validation
        if len(df) == 0:
            raise ValueError("No valid data after cleaning")
        
        # Check for obvious data quality issues
        for col in price_cols:
            if (df[col] <= 0).any():
                logger.warning(f"Found non-positive values in {col} column")
                df = df[df[col] > 0]  # Remove invalid price data
        
        if (df['volume'] < 0).any():
            logger.warning("Found negative volume values")
            df = df[df['volume'] >= 0]
        
        # Ensure high >= low, etc.
        invalid_candles = (df['high'] < df['low']) | (df['high'] < df['open']) | \
                         (df['high'] < df['close']) | (df['low'] > df['open']) | \
                         (df['low'] > df['close'])
        
        if invalid_candles.any():
            logger.warning(f"Found {invalid_candles.sum()} invalid candles (high < low, etc.)")
            df = df[~invalid_candles]
        
        return df
    
    def get_current_price(self, symbol: str) -> float:
        """
        Get current price for a symbol
        
        Args:
            symbol: Trading pair symbol
            
        Returns:
            Current price
        """
        try:
            ticker = self._make_request("ticker/price", {'symbol': symbol.upper()})
            return float(ticker['price'])
            
        except Exception as e:
            logger.error(f"Error fetching current price for {symbol}: {e}")
            raise
    
    def validate_symbol(self, symbol: str) -> bool:
        """
        Validate if symbol exists and is actively trading
        
        Args:
            symbol: Trading pair symbol
            
        Returns:
            True if symbol is valid and active
        """
        try:
            symbol_info = self.get_symbol_info(symbol)
            return symbol_info['status'] == 'TRADING'
            
        except Exception:
            return False
    
    def get_available_symbols(self, quote_asset: str = "USDT") -> List[str]:
        """
        Get list of available trading symbols for a quote asset
        
        Args:
            quote_asset: Quote asset (e.g., 'USDT', 'BTC')
            
        Returns:
            List of available symbols
        """
        try:
            exchange_info = self._make_request("exchangeInfo", {})
            
            symbols = []
            for symbol_info in exchange_info['symbols']:
                if (symbol_info['quoteAsset'] == quote_asset.upper() and 
                    symbol_info['status'] == 'TRADING'):
                    symbols.append(symbol_info['symbol'])
            
            return sorted(symbols)
            
        except Exception as e:
            logger.error(f"Error fetching available symbols: {e}")
            return []


# Convenience functions
def fetch_crypto_data(
    symbol: str = "BTCUSDT", 
    timeframes: List[str] = None,
    days_back: int = 30
) -> Dict[str, pd.DataFrame]:
    """
    Convenience function to fetch crypto data
    
    Args:
        symbol: Trading pair (default: BTCUSDT)
        timeframes: List of timeframes (default: ['4h', '1d'])
        days_back: Historical data period
        
    Returns:
        Dictionary of timeframe data
    """
    if timeframes is None:
        timeframes = ['4h', '1d']
    
    fetcher = BinanceDataFetcher()
    
    # Validate symbol first
    if not fetcher.validate_symbol(symbol):
        raise ValueError(f"Invalid or inactive symbol: {symbol}")
    
    return fetcher.get_multiple_timeframes(symbol, timeframes, days_back)


if __name__ == "__main__":
    # Example usage
    fetcher = BinanceDataFetcher()
    
    # Test basic functionality
    try:
        # Fetch 30 days of 4H data for BTC/USDT
        data = fetcher.get_historical_data("BTCUSDT", "4h", days_back=30)
        print(f"Fetched {len(data)} candles")
        print(data.head())
        print(data.tail())
        
    except Exception as e:
        print(f"Error: {e}")