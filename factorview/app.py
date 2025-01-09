import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template, request

from factorview.data_loader import get_factor_stats, get_factor_perf

app = Flask(__name__)


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
def index():
    return render_template("index.html")


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


if __name__ == "__main__":
    app.run(debug=True)
