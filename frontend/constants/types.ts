export interface Stock {
    symbol: string,
    security: string,
    gics_sector: string,
    gics_sub_industry: string,
    headquarters_location: string,
    date_first_added: string,
    cik: number,
    founded: number
}

export interface StockPeriod {
    symbol: string,
    security: string,
    gics_sector: string,
    gics_sub_industry: string,
    headquarters_location: string,
    date_first_added: string,
    cik: number,
    founded: number,
    date: number,
    low: number,
    open: number,
    volume: number,
    high: number,
    close: number,
    adjusted_close: number,
    all_news: number,
    news_volume: number,
    news_positive: number,
    news_negative: number,
    news_products: number,
    layoffs: number,
    analysts_comments: number,
    news_stocks: number,
    dividends: number,
    corporate_earnings: number,
    m_and_a: number,
    store_openings: number,
    product_recalls: number,
    adverse_events: number,
    personnel_changes: number,
    stock_rumors: number
}

export interface RollingMean {
    date: number,
    num_data_points: number,
    rolling_mean: number
}