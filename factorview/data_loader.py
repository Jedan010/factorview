import pandas as pd
from quantfactor import FactorManagerAll, p


def get_factor_statistics(factor_names: list[str]):
    """
    根据因子名称列表获取对应的统计值。

    参数:
    factor_names (list): 因子名称列表。

    返回:
    pd.DataFrame: 包含因子统计值的DataFrame, 索引为factor_name。
    """
    ic_df = (
        FactorManagerAll.get_perf_factor(
            perf_type="ic", factor_names=factor_names, fields="corr", is_cache=True
        )["corr"]
        .groupby("factor_name")
        .mean()
        .rename("ic")
    )
    group_df = (
        FactorManagerAll.get_perf_factor(
            perf_type="group_pnl",
            factor_names=factor_names,
            fields="LS_Hedge",
            is_cache=True,
        )["LS_Hedge"]
        .groupby("factor_name")
        .apply(lambda x: p.annual_return(x.droplevel(["factor_name", "pool"])))
        .rename("group_pnl")
    )
    backtest_ret_df = (
        FactorManagerAll.get_perf_factor(
            perf_type="backtest_ret",
            factor_names=factor_names,
            fields="excess_ret",
            query=[("optimizer_index", "000905.SH"), ("benchmark_index", "000905.SH")],
            is_cache=True,
        )["excess_ret"]
        .groupby("factor_name")
        .apply(
            lambda x: p.annual_return(
                x.droplevel(
                    ["factor_name", "pool", "optimizer_index", "benchmark_index"]
                )
            )
        )
        .rename("backtest_ret")
    )

    df = pd.concat([ic_df, group_df, backtest_ret_df], axis=1)
    return df


def get_factor_info():
    factor_info_df = FactorManagerAll.get_info_factor()
    perf_df = get_factor_statistics(factor_info_df.index)
    df = factor_info_df[["class_name"]].join(perf_df)

    return df


def get_factor_perf(factor_name: str):
    ic_df = FactorManagerAll.get_perf_factor(
        perf_type="ic",
        factor_names=factor_name,
        index_col="date",
        fields="corr",
        is_cache=True,
    )
    ic_df["corr_roll"] = ic_df["corr"].rolling(252, min_periods=60).mean()
    group_df = FactorManagerAll.get_perf_factor(
        perf_type="group_pnl",
        factor_names=factor_name,
        index_col="date",
        fields=[
            "Group_01",
            "Group_02",
            "Group_03",
            "Group_04",
            "Group_05",
            "Group_06",
            "Group_07",
            "Group_08",
            "Group_09",
            "Group_10",
            "LS_Hedge",
        ],
        is_cache=True,
    )
    backtest_df = FactorManagerAll.get_perf_factor(
        perf_type="backtest_ret",
        factor_names=factor_name,
        index_col="date",
        fields=[
            "strategy_ret",
            "index_ret",
            "excess_ret",
            "holding_num",
            "turnover",
            "transaction_fee",
        ],
        query=[("optimizer_index", "000905.SH"), ("benchmark_index", "000905.SH")],
        is_cache=True,
    )

    return (ic_df, group_df, backtest_df)
