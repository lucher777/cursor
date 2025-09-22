import dash
from dash import dcc, html, Input, Output, State, dash_table
import plotly.graph_objs as go
import plotly.express as px
import pandas as pd
import json
from datetime import datetime, timedelta
import dash_bootstrap_components as dbc
from trading_strategy import TradingStrategy
from config import Config
import threading
import time
import logging
from exchange_client import OKExClient

# 创建交易策略实例
strategy = TradingStrategy()

# 创建Dash应用
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
app.title = "虚拟币自动交易系统"

# 全局变量存储数据
market_data = {}  # 按交易对存储数据
strategy_data = {'status': 'waiting', 'last_update': None}

def create_price_chart(symbol=None):
    """创建价格图表"""
    if symbol is None:
        symbol = 'BTC-USDT'  # 默认交易对
    
    # 获取指定交易对的数据
    symbol_data = market_data.get(symbol, {'timestamp': [], 'price': [], 'volume': []})
    
    if not symbol_data['timestamp']:
        # 创建空图表并显示提示信息
        fig = go.Figure()
        fig.add_annotation(
            text=f"等待 {symbol} 数据...",
            xref="paper", yref="paper",
            x=0.5, y=0.5,
            showarrow=False,
            font=dict(size=16, color="gray")
        )
        fig.update_layout(
            title=f'{symbol} 实时价格走势',
            xaxis_title='时间',
            yaxis_title='价格 (USDT)',
            template='plotly_white',
            height=400
        )
        return fig
    
    fig = go.Figure()
    
    # 价格线
    fig.add_trace(go.Scatter(
        x=symbol_data['timestamp'],
        y=symbol_data['price'],
        mode='lines',
        name=f'{symbol} 价格',
        line=dict(color='#1f77b4', width=2)
    ))
    
    fig.update_layout(
        title=f'{symbol} 实时价格走势',
        xaxis_title='时间',
        yaxis_title='价格 (USDT)',
        template='plotly_white',
        height=400
    )
    
    return fig

def create_indicators_chart(symbol=None, analysis=None):
    """创建技术指标图表"""
    if not analysis:
        # 创建空图表并显示提示信息
        fig = go.Figure()
        title = f'{symbol} RSI指标' if symbol else 'RSI指标'
        fig.add_annotation(
            text="等待技术分析数据...",
            xref="paper", yref="paper",
            x=0.5, y=0.5,
            showarrow=False,
            font=dict(size=16, color="gray")
        )
        fig.update_layout(
            title=title,
            yaxis_title='RSI',
            yaxis=dict(range=[0, 100]),
            template='plotly_white',
            height=300
        )
        return fig
    
    fig = go.Figure()
    
    # RSI指标
    rsi_value = analysis.get('rsi', 50)
    fig.add_trace(go.Scatter(
        x=[datetime.now()],
        y=[rsi_value],
        mode='markers',
        name='RSI',
        marker=dict(size=10, color='red' if rsi_value > 70 else 'green' if rsi_value < 30 else 'blue')
    ))
    
    # 添加RSI超买超卖线
    fig.add_hline(y=70, line_dash="dash", line_color="red", annotation_text="超买")
    fig.add_hline(y=30, line_dash="dash", line_color="green", annotation_text="超卖")
    fig.add_hline(y=50, line_dash="dash", line_color="gray", annotation_text="中性")
    
    title = f'{symbol} RSI指标' if symbol else 'RSI指标'
    fig.update_layout(
        title=title,
        yaxis_title='RSI',
        yaxis=dict(range=[0, 100]),
        template='plotly_white',
        height=300
    )
    
    return fig

# 页面布局
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col([
            html.H1("🚀 虚拟币自动交易系统", className="text-center mb-4"),
            html.Hr()
        ])
    ]),
    
    # 控制面板
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H4("交易控制", className="card-title"),
                    dbc.Row([
                        dbc.Col([
                            dbc.Label("交易对:"),
                            dcc.Dropdown(
                                id='symbol-dropdown',
                                options=[
                                    {'label': 'BTC/USDT (比特币)', 'value': 'BTC/USDT'},
                                    {'label': 'ETH/USDT (以太坊)', 'value': 'ETH/USDT'},
                                    {'label': 'BNB/USDT (币安币)', 'value': 'BNB/USDT'},
                                    {'label': 'ADA/USDT (卡尔达诺)', 'value': 'ADA/USDT'},
                                    {'label': 'DOT/USDT (波卡)', 'value': 'DOT/USDT'},
                                    {'label': 'LINK/USDT (链链)', 'value': 'LINK/USDT'},
                                    {'label': 'UNI/USDT (Uniswap)', 'value': 'UNI/USDT'},
                                    {'label': 'LTC/USDT (莱特币)', 'value': 'LTC/USDT'},
                                    {'label': 'BCH/USDT (比特币现金)', 'value': 'BCH/USDT'},
                                    {'label': 'XRP/USDT (瑞波币)', 'value': 'XRP/USDT'},
                                    {'label': 'SOL/USDT (索拉纳)', 'value': 'SOL/USDT'},
                                    {'label': 'AVAX/USDT (雪崩)', 'value': 'AVAX/USDT'},
                                    {'label': 'MATIC/USDT (Polygon)', 'value': 'MATIC/USDT'},
                                    {'label': 'ATOM/USDT (宇宙币)', 'value': 'ATOM/USDT'},
                                    {'label': 'NEAR/USDT (NEAR协议)', 'value': 'NEAR/USDT'},
                                    {'label': 'FTM/USDT (Fantom)', 'value': 'FTM/USDT'},
                                    {'label': 'ALGO/USDT (Algorand)', 'value': 'ALGO/USDT'},
                                    {'label': 'VET/USDT (唯链)', 'value': 'VET/USDT'},
                                    {'label': 'ICP/USDT (互联网计算机)', 'value': 'ICP/USDT'},
                                    {'label': 'FIL/USDT (Filecoin)', 'value': 'FIL/USDT'},
                                ],
                                value='BTC/USDT'
                            )
                        ], width=6),
                        dbc.Col([
                            dbc.Label("自动交易:"),
                            dbc.Switch(
                                id="auto-trade-switch",
                                label="启用",
                                value=False,
                            )
                        ], width=6)
                    ]),
                    html.Br(),
                    dbc.Row([
                        dbc.Col([
                            dbc.Button("手动分析", id="manual-analyze-btn", color="primary", className="me-2"),
                            dbc.Button("刷新数据", id="refresh-btn", color="secondary")
                        ])
                    ])
                ])
            ])
        ], width=12)
    ], className="mb-4"),
    
    # 状态面板
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H5("系统状态", className="card-title"),
                    html.Div(id="system-status")
                ])
            ])
        ], width=3),
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H5("当前价格", className="card-title"),
                    html.H3(id="current-price", children="--", className="text-primary")
                ])
            ])
        ], width=3),
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H5("持仓数量", className="card-title"),
                    html.H3(id="open-positions", children="0", className="text-info")
                ])
            ])
        ], width=3),
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H5("总盈亏", className="card-title"),
                    html.H3(id="total-profit", children="0.00", className="text-success")
                ])
            ])
        ], width=3)
    ], className="mb-4"),
    
    # 图表区域
    dbc.Row([
        dbc.Col([
            dcc.Graph(id="price-chart")
        ], width=8),
        dbc.Col([
            dcc.Graph(id="indicators-chart")
        ], width=4)
    ], className="mb-4"),
    
    # 交易信号和分析
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H5("交易信号", className="card-title"),
                    html.Div(id="trading-signals")
                ])
            ])
        ], width=6),
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H5("技术分析", className="card-title"),
                    html.Div(id="technical-analysis")
                ])
            ])
        ], width=6)
    ], className="mb-4"),
    
    # 交易历史
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H5("交易历史", className="card-title"),
                    html.Div(id="trade-history")
                ])
            ])
        ])
    ], className="mb-4"),
    
    # 自动刷新组件
    dcc.Interval(
        id='interval-component',
        interval=1*1000,  # 1秒更新一次
        n_intervals=0
    ),
    
    # 存储组件
    dcc.Store(id='strategy-store')
    
], fluid=True)

# 回调函数
@app.callback(
    [Output('strategy-store', 'data'),
     Output('system-status', 'children'),
     Output('current-price', 'children'),
     Output('open-positions', 'children'),
     Output('total-profit', 'children')],
    [Input('interval-component', 'n_intervals'),
     Input('manual-analyze-btn', 'n_clicks'),
     Input('refresh-btn', 'n_clicks'),
     Input('symbol-dropdown', 'value')],
    [State('auto-trade-switch', 'value')]
)
def update_strategy_data(n_intervals, manual_clicks, refresh_clicks, symbol, auto_trade):
    """更新策略数据"""
    global strategy_data
    
    try:
        # 检查是否是新的交易对
        if symbol and symbol not in market_data:
            print(f"切换到新交易对: {symbol}")
        
        # 运行策略分析
        result = strategy.run_strategy(symbol)
        strategy_data = result
        
        # 更新市场数据
        if result.get('current_price') and symbol:
            # 初始化交易对数据
            if symbol not in market_data:
                market_data[symbol] = {'timestamp': [], 'price': [], 'volume': []}
            
            market_data[symbol]['timestamp'].append(datetime.now())
            market_data[symbol]['price'].append(result['current_price'])
            
            # 保持最近100个数据点
            if len(market_data[symbol]['timestamp']) > 100:
                market_data[symbol]['timestamp'] = market_data[symbol]['timestamp'][-100:]
                market_data[symbol]['price'] = market_data[symbol]['price'][-100:]
        
        # 系统状态
        status_color = "success" if result.get('status') == 'success' else "danger"
        status_text = "运行正常" if result.get('status') == 'success' else "错误"
        system_status = dbc.Badge(status_text, color=status_color)
        
        # 当前价格
        current_price = f"${result.get('current_price', 0):.2f}" if result.get('current_price') else "--"
        
        # 持仓数量
        open_positions = str(result.get('open_positions', 0))
        
        # 总盈亏
        account_summary = strategy.get_account_summary()
        total_profit = f"${account_summary.get('total_profit', 0):.2f}"
        
        return result, system_status, current_price, open_positions, total_profit
        
    except Exception as e:
        error_status = dbc.Badge("系统错误", color="danger")
        return {}, error_status, "--", "0", "0.00"

@app.callback(
    Output('price-chart', 'figure'),
    [Input('strategy-store', 'data')],
    [State('symbol-dropdown', 'value')]
)
def update_price_chart(strategy_data, symbol):
    """更新价格图表"""
    return create_price_chart(symbol)

@app.callback(
    Output('indicators-chart', 'figure'),
    [Input('strategy-store', 'data')],
    [State('symbol-dropdown', 'value')]
)
def update_indicators_chart(strategy_data, symbol):
    """更新指标图表"""
    analysis = strategy_data.get('analysis') if strategy_data else None
    return create_indicators_chart(symbol, analysis)

@app.callback(
    Output('trading-signals', 'children'),
    [Input('strategy-store', 'data')]
)
def update_trading_signals(strategy_data):
    """更新交易信号"""
    if not strategy_data or 'buy_signal' not in strategy_data:
        return "等待数据..."
    
    signals = []
    
    if strategy_data.get('buy_signal'):
        signals.append(dbc.Badge("买入信号", color="success", className="me-2"))
    
    if strategy_data.get('sell_signal'):
        signals.append(dbc.Badge("卖出信号", color="danger", className="me-2"))
    
    if not signals:
        signals.append(dbc.Badge("无信号", color="secondary"))
    
    return signals

@app.callback(
    Output('technical-analysis', 'children'),
    [Input('strategy-store', 'data')]
)
def update_technical_analysis(strategy_data):
    """更新技术分析"""
    if not strategy_data or 'analysis' not in strategy_data:
        return "等待分析..."
    
    analysis = strategy_data['analysis']
    
    volatility_info = ""
    if 'volatility' in analysis:
        volatility = analysis['volatility']
        if volatility == 'low':
            volatility_info = "🔵 低波动"
        elif volatility == 'medium':
            volatility_info = "🟢 中等波动"
        elif volatility == 'high':
            volatility_info = "🟡 高波动"
        elif volatility == 'extreme':
            volatility_info = "🔴 极高波动"
    
    return [
        html.P(f"趋势: {analysis.get('trend', 'N/A')}"),
        html.P(f"强度: {analysis.get('strength', 0):.2f}"),
        html.P(f"RSI: {analysis.get('rsi', 0):.1f}"),
        html.P(f"MACD: {analysis.get('macd', 0):.4f}"),
        html.P(f"波动性: {volatility_info}"),
        html.P(f"RSI超卖/超买: {analysis.get('rsi_oversold', 30)}/{analysis.get('rsi_overbought', 70)}"),
    ]

@app.callback(
    Output('trade-history', 'children'),
    [Input('strategy-store', 'data')]
)
def update_trade_history(strategy_data):
    """更新交易历史"""
    if not strategy.trade_history:
        return "暂无交易记录"
    
    # 获取最近10条交易记录
    recent_trades = strategy.trade_history[-10:]
    
    table_data = []
    for trade in recent_trades:
        table_data.append({
            '时间': trade['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
            '交易对': trade['symbol'],
            '方向': '买入' if trade['side'] == 'buy' else '卖出',
            '数量': f"{trade['amount']:.6f}",
            '价格': f"${trade['price']:.2f}"
        })
    
    return dash_table.DataTable(
        data=table_data,
        columns=[{"name": i, "id": i} for i in ['时间', '交易对', '方向', '数量', '价格']],
        style_cell={'textAlign': 'left'},
        style_data_conditional=[
            {
                'if': {'filter_query': '{方向} = 买入'},
                'backgroundColor': '#d4edda',
                'color': 'black',
            },
            {
                'if': {'filter_query': '{方向} = 卖出'},
                'backgroundColor': '#f8d7da',
                'color': 'black',
            }
        ]
    )

# 添加API路由到Dash应用的Flask服务器
@app.server.route('/api/instruments')
def get_instruments():
    """获取交易产品基础信息"""
    try:
        from flask import request, jsonify
        inst_type = request.args.get('instType', 'SPOT')
        uly = request.args.get('uly')
        inst_family = request.args.get('instFamily')
        inst_id = request.args.get('instId')
        
        # 验证产品类型
        valid_types = ['SPOT', 'MARGIN', 'SWAP', 'FUTURES', 'OPTION']
        if inst_type not in valid_types:
            return jsonify({'error': f'无效的产品类型: {inst_type}'}), 400
        
        client = OKExClient()
        result = client.get_instruments(inst_type, uly, inst_family, inst_id)
        
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"获取产品信息失败: {e}")
        return jsonify({'error': str(e)}), 500

@app.server.route('/api/instruments/summary')
def get_instruments_summary():
    """获取产品信息摘要"""
    try:
        from flask import jsonify
        client = OKExClient()
        
        # 获取各种产品类型的数量
        summary = {}
        product_types = ['SPOT', 'MARGIN', 'SWAP', 'FUTURES', 'OPTION']
        
        for inst_type in product_types:
            result = client.get_instruments(inst_type)
            summary[inst_type] = {
                'count': len(result.get('data', [])),
                'products': [item['instId'] for item in result.get('data', [])[:5]]  # 只显示前5个
            }
        
        return jsonify({
            'code': '0',
            'msg': '',
            'data': summary
        })
        
    except Exception as e:
        logging.error(f"获取产品摘要失败: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run_server(host=Config.WEB_HOST, port=Config.WEB_PORT, debug=True)