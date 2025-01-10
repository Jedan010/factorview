import pandas as pd
from quantfactor import FactorManagerAll, p


def load_factor_stats(
    factor_names: list[str] = None,
    start_date: str = None,
    end_date: str = None,
    pool: str = "all",
    optimizer_index: str = "000905.SH",
    benchmark_index: str = "000905.SH",
    **kwargs,
):
    factor_info_df = FactorManagerAll.get_info_factor(
        factor_names=factor_names,
        query=[("status not in  ('invalid', 'highlyCorr', 'tmp')")],
        is_cache=True,
    )
    if factor_info_df.empty:
        factor_names = pd.Index([])
    else:
        factor_names = factor_info_df.index

    ic_df = FactorManagerAll.get_perf_factor(
        perf_type="ic",
        factor_names=factor_names,
        start_date=start_date,
        end_date=end_date,
        fields=["corr"],
        index_col=["date", "factor_name"],
        query=[("pool", pool)],
        is_cache=True,
        **kwargs,
    )
    if ic_df.empty:
        ic_stats = pd.DataFrame(
            index=pd.Index([], name="factor_name"), columns=["ic", "icir"]
        ).reindex(factor_names)
    else:
        ic_stats = (
            ic_df["corr"]
            .groupby("factor_name")
            .pipe(
                lambda x: pd.concat(
                    [
                        x.mean().rename("ic"),
                        (x.mean() / x.std()).rename("icir"),
                    ],
                    axis=1,
                ).reindex(factor_names)
            )
        )

    group_df = FactorManagerAll.get_perf_factor(
        perf_type="group_pnl",
        factor_names=factor_names,
        start_date=start_date,
        end_date=end_date,
        fields=["Group_01", "Group_10", "LS_Hedge"],
        index_col=["date", "factor_name"],
        query=[("pool", pool)],
        is_cache=True,
        **kwargs,
    )
    if group_df.empty:
        group_stats = pd.DataFrame(
            index=pd.Index([], name="factor_name"),
            columns=["bottom_ret", "top_ret", "long_short_ret"],
        ).reindex(factor_names)
    else:
        group_stats = (
            group_df.groupby("factor_name")
            .apply(lambda x: x.droplevel("factor_name").agg(p.annual_return))
            .reindex(factor_names)
            .rename(
                columns={
                    "Group_01": "bottom_ret",
                    "Group_10": "top_ret",
                    "LS_Hedge": "long_short_ret",
                }
            )
        )

    backtest_df = FactorManagerAll.get_perf_factor(
        perf_type="backtest_ret",
        factor_names=factor_names,
        start_date=start_date,
        end_date=end_date,
        fields=["excess_ret", "turnover"],
        index_col=["date", "factor_name"],
        query=[
            ("pool", pool),
            ("optimizer_index", optimizer_index),
            ("benchmark_index", benchmark_index),
        ],
        is_cache=True,
        **kwargs,
    )
    if backtest_df.empty:
        backtest_stats = pd.DataFrame(
            index=pd.Index([], name="factor_name"),
            columns=[
                "annual_return",
                "max_drawdown",
                "sharpe_ratio",
                "calmar_ratio",
                "turnover",
            ],
        ).reindex(factor_names)
    else:
        backtest_stats = backtest_df.groupby("factor_name").pipe(
            lambda x: pd.concat(
                [
                    x["excess_ret"]
                    .apply(
                        lambda x: x.droplevel("factor_name").agg(
                            [
                                p.annual_return,
                                p.max_drawdown,
                                p.sharpe_ratio,
                                p.calmar_ratio,
                            ]
                        )
                    )
                    .unstack(),
                    x["turnover"].mean().mul(252),
                ],
                axis=1,
            ).reindex(factor_names)
        )

    return (factor_info_df, ic_stats, group_stats, backtest_stats)


def load_factor_perf(factor_name: str):
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


def load_strategy_info(**kwargs):
    """取得策略信息"""
    return FactorManagerAll.get_info_strategy()


def load_strategy_perf(
    strategy_name: str,
    optimizer_index: str = "000905.SH",
    benchmark_index: str = "000905.SH",
    **kwargs,
):
    backtest_df = FactorManagerAll.get_perf_factor(
        perf_type="backtest_ret",
        factor_names=strategy_name,
        index_col="date",
        fields=[
            "strategy_ret",
            "index_ret",
            "excess_ret",
            "holding_num",
            "turnover",
            "transaction_fee",
        ],
        query=[
            ("optimizer_index", optimizer_index),
            ("benchmark_index", benchmark_index),
        ],
        is_cache=True,
        **kwargs,
    )
    return (backtest_df,)
