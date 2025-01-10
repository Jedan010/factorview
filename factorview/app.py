import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template, request

from factorview.data_loader import (
    load_factor_perf,
    load_factor_stats,
    load_strategy_info,
    load_strategy_perf,
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


@app.route("/factor")
def factor_info():
    return render_template("factor_info.html")


@app.route("/factor/<factor_name>")
def factor_perf(factor_name):
    return render_template("factor_perf.html", factor_name=factor_name)


@app.route("/strategy")
def strategy_info():
    return render_template("strategy_info.html")


@app.route("/strategy/<strategy_name>")
def strategy_perf(strategy_name):
    return render_template("strategy_perf.html", strategy_name=strategy_name)


@app.route("/api/factor", methods=["GET"])
def get_factor_info():
    return jsonify(
        {
            name: {
                "values": clean_for_json(df),
                "index": clean_for_json(df.index),
            }
            for name, df in zip(
                ["factor_info", "ic", "group", "backtest_ret"],
                load_factor_stats(**request.args),
            )
        }
    )


@app.route("/api/factor/<factor_name>", methods=["GET"])
def get_factor_performance(factor_name):
    return jsonify(
        {
            name: {
                "values": clean_for_json(df.values),
                "index": clean_for_json(df.index),
            }
            for name, df in zip(
                ["ic", "group", "backtest_ret"],
                load_factor_perf(factor_name),
            )
        }
    )


@app.route("/api/strategy", methods=["GET"])
def get_strategy_info():
    df = load_strategy_info(**request.args)
    return jsonify(
        {
            "strategy_info": {
                "values": clean_for_json(df),
                "index": clean_for_json(df.index),
            }
        }
    )


@app.route("/api/strategy/<strategy_name>", methods=["GET"])
def get_strategy_perf(strategy_name):
    # 模拟策略详情数据
    return jsonify(
        {
            name: {
                "values": clean_for_json(df.values),
                "index": clean_for_json(df.index),
            }
            for name, df in zip(["backtest_ret"], load_strategy_perf(strategy_name))
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
