import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template, request

from factorview.data_loader import (
    get_factor_perf,
    get_factor_stats,
    get_strategy_info,
    get_strategy_perf,
)

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


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/factors")
def factor_list():
    return render_template("factor.html")


@app.route("/factors/<factor_name>")
def factor_detail(factor_name):
    return render_template("factor_detail.html", factor_name=factor_name)


@app.route("/strategies")
def strategy_list():
    return render_template("strategy.html")


@app.route("/strategies/<strategy_name>")
def strategy_performance(strategy_name):
    return render_template("strategy_detail.html", strategy_name=strategy_name)


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


@app.route("/api/strategies", methods=["GET"])
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


@app.route("/api/strategies/<strategy_name>", methods=["GET"])
def get_strategy_performance(strategy_name):
    # 模拟策略详情数据
    return jsonify(
        {
            name: {
                "values": clean_for_json(df.values),
                "index": clean_for_json(df.index),
            }
            for name, df in zip(["backtest_ret"], get_strategy_perf(strategy_name))
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
