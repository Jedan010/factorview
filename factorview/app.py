import random

import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template, request

from factorview.data_loader import get_factor_perf, get_factor_stats, get_strategy_info

app = Flask(__name__, static_folder="static")


def clean_for_json(data):
    if isinstance(data, pd.DataFrame):
        return {c: clean_for_json(data[c]) for c in data.columns}
    if isinstance(data, (list, tuple, pd.Index, pd.Series, np.ndarray)):
        return [clean_for_json(x) for x in data]
    elif isinstance(data, dict):
        return {k: clean_for_json(v) for k, v in data.items()}
    elif isinstance(data, (float, int)):
        return None if pd.isna(data) else data
    if isinstance(data, pd.Timestamp):
        return data.strftime(r"%Y-%m-%d")
    return data


@app.route("/api/factors", methods=["GET"])
def get_factors():
    return jsonify(
        {
            name: {
                "values": clean_for_json(df),
                "index": clean_for_json(df.index),
            }
            for name, df in zip(
                ["factor_info", "ic", "group", "backtest_ret"],
                get_factor_stats(**request.args),
            )
        }
    )


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/factors")
def factor_list():
    return render_template("factor.html")


@app.route("/strategies")
def strategy_list():
    return render_template("strategy.html")


@app.route("/strategies/<int:strategy_id>")
def strategy_detail(strategy_id):
    return render_template("strategy_detail.html", strategy_id=strategy_id)


@app.route("/factors/<factor_name>")
def factor_detail(factor_name):
    try:
        return render_template("factor_detail.html", factor_name=factor_name)
    except Exception as e:
        app.logger.error(f"Error in factor_detail: {str(e)}")
        return "Internal Server Error", 500


@app.route("/api/factors/<factor_name>", methods=["GET"])
def get_factor_performance(factor_name):
    return jsonify(
        {
            name: {
                "values": clean_for_json(df.values),
                "index": clean_for_json(df.index),
            }
            for name, df in zip(
                ["ic", "group", "backtest_ret"],
                get_factor_perf(factor_name),
            )
        }
    )


@app.route("/api/strategies")
def get_strategies():
    df = get_strategy_info(**request.args)
    return jsonify(
        {
            "strategy_info": {
                "values": clean_for_json(df),
                "index": clean_for_json(df.index),
            }
        }
    )


@app.route("/api/strategies/<int:strategy_id>")
def get_strategy_detail(strategy_id):
    # 模拟策略详情数据
    return jsonify(
        {
            "id": strategy_id,
            "name": f"策略{strategy_id}",
            "annual_return": random.uniform(5, 30),
            "max_drawdown": random.uniform(5, 20),
            "sharpe_ratio": random.uniform(0.5, 2.5),
            "win_rate": random.uniform(40, 80),
            "trade_count": random.randint(100, 1000),
            "avg_holding_period": random.uniform(1, 30),
            "performance": {
                "labels": [f"Day {i}" for i in range(1, 31)],
                "values": [random.uniform(90, 130) for _ in range(30)],
            },
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
