import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template
from quantfactor import p

from data_loader import get_factor_info, get_factor_perf

app = Flask(__name__)

factor_info_df = get_factor_info()


@app.route("/api/factors", methods=["GET"])
def get_factors():
    df = factor_info_df.reset_index().rename_axis("factor_id").reset_index()
    return jsonify(df.to_dict("records"))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/factors/<factor_name>")
def factor_detail(factor_name):
    try:
        # 验证factor_name是否存在
        if factor_name not in factor_info_df.index:
            return f"Factor {factor_name} not found", 404

        return render_template("factor_detail.html", factor_name=factor_name)
    except Exception as e:
        app.logger.error(f"Error in factor_detail: {str(e)}")
        return "Internal Server Error", 500


@app.route("/api/factors/<factor_name>", methods=["GET"])
def get_factor_performance(factor_name):
    ic, group, backtest_ret = get_factor_perf(factor_name)

    # Convert all data to JSON serializable format, handling NaN values
    def clean_for_json(data):
        if isinstance(data, (list, tuple, pd.Index, pd.Series, np.ndarray)):
            return [clean_for_json(x) for x in data]
        elif isinstance(data, dict):
            return {k: clean_for_json(v) for k, v in data.items()}
        elif isinstance(data, (float, int)):
            return None if pd.isna(data) else data
        if isinstance(data, pd.Timestamp):
            return data.strftime(r"%Y-%m-%d")
        return data

    return jsonify(
        {
            "ic": {
                "values": clean_for_json(ic.values),
                "index": clean_for_json(ic.index),
            },
            "group": {
                "values": clean_for_json(group.values),
                "index": clean_for_json(group.index),
            },
            "backtest_ret": {
                "values": clean_for_json(backtest_ret.values),
                "index": clean_for_json(backtest_ret.index),
            },
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
