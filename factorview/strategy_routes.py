from flask import jsonify
import random
from datetime import datetime, timedelta

def init_strategy_routes(app):
    @app.route('/api/strategies')
    def get_strategies():
        # 模拟策略数据
        strategies = []
        for i in range(1, 6):
            strategies.append({
                'id': i,
                'name': f'策略{i}',
                'category': random.choice(['趋势跟踪', '均值回归', '套利']),
                'annual_return': random.uniform(5, 30),
                'max_drawdown': random.uniform(5, 20),
                'sharpe_ratio': random.uniform(0.5, 2.5),
                'created_at': (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d')
            })
        return jsonify({'data': strategies})

    @app.route('/api/strategies/<int:strategy_id>')
    def get_strategy_detail(strategy_id):
        # 模拟策略详情数据
        return jsonify({
            'id': strategy_id,
            'name': f'策略{strategy_id}',
            'annual_return': random.uniform(5, 30),
            'max_drawdown': random.uniform(5, 20),
            'sharpe_ratio': random.uniform(0.5, 2.5),
            'win_rate': random.uniform(40, 80),
            'trade_count': random.randint(100, 1000),
            'avg_holding_period': random.uniform(1, 30),
            'performance': {
                'labels': [f'Day {i}' for i in range(1, 31)],
                'values': [random.uniform(90, 130) for _ in range(30)]
            }
        })
