import pandas as pd
from quantfactor import FactorManagerAll, p


def load_factor_info(
    factor_names: list[str] = None,
    table_names: list[str] = None,
    class_names: list[str] = None,
    status: list[str] = None,
    develop_codes: list[str] = None,
    factor_ids: list[str] = None,
    creation_time: list[str] = None,
    query: list[str] = None,
    **kwargs,
):
    """取得因子信息"""

    if query is None:
        query = []
    if isinstance(query, (str, tuple)):
        query = [query]

    if table_names is not None:
        query.append("table_name", table_names)
    if class_names is not None:
        query.append("class_name", class_names)
    if status is not None:
        query.append("status", status)
    else:
        query.append("status not in  ('tmp')")
    if develop_codes is not None:
        query.append("develop_code", develop_codes)
    if factor_ids is not None:
        query.append("factor_id", factor_ids)
    if creation_time is not None:
        query.append("creation_time", creation_time)

    factor_info_df = FactorManagerAll.get_info_factor(
        factor_names=factor_names,
        query=query,
        is_cache=True,  # **kwargs
    )

    return factor_info_df


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
        query=[("status not in  ('tmp')")],
        is_cache=True,
    )
    if factor_info_df.empty:
        factor_names = pd.Index([], name="factor_name")
    else:
        factor_names = pd.Index(factor_info_df.index, name="factor_name")

    date_df = pd.DataFrame(
        index=factor_names, columns=["min", "max"], dtype="datetime64[ns]"
    )

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
        ic_stats = pd.DataFrame(index=factor_names, columns=["ic", "icir"])
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
        _date_ic = (
            ic_df.reset_index("date")["date"]
            .groupby("factor_name")
            .agg(["min", "max"])
            .reindex(factor_names)
        )
        date_df["min"] = (
            date_df[["min"]].join(_date_ic["min"], rsuffix="_2").max(axis=1)
        )
        date_df["max"] = (
            date_df[["max"]].join(_date_ic["max"], rsuffix="_2").min(axis=1)
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
            index=factor_names, columns=["bottom_ret", "top_ret", "long_short_ret"]
        )
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
        _date_group = (
            group_df.reset_index("date")["date"]
            .groupby("factor_name")
            .agg(["min", "max"])
            .reindex(factor_names)
        )
        date_df["min"] = (
            date_df[["min"]].join(_date_group["min"], rsuffix="_2").max(axis=1)
        )
        date_df["max"] = (
            date_df[["max"]].join(_date_group["max"], rsuffix="_2").min(axis=1)
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
            index=factor_names,
            columns=[
                "annual_return",
                "max_drawdown",
                "sharpe_ratio",
                "calmar_ratio",
                "turnover",
            ],
        )
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
        _date_backtest = (
            backtest_df.reset_index("date")["date"]
            .groupby("factor_name")
            .agg(["min", "max"])
            .reindex(factor_names)
        )
        date_df["min"] = (
            date_df[["min"]].join(_date_backtest["min"], rsuffix="_2").max(axis=1)
        )
        date_df["max"] = (
            date_df[["max"]].join(_date_backtest["max"], rsuffix="_2").min(axis=1)
        )

    return (factor_info_df, ic_stats, group_stats, backtest_stats, date_df)


def load_factor_perf(
    factor_name: str,
    start_date: str = None,
    end_date: str = None,
    pool: str = "all",
    optimizer_index: str = "000905.SH",
    benchmark_index: str = "000905.SH",
    **kwargs,
):
    if start_date is not None:
        start_date = pd.to_datetime(start_date)
        _start = start_date - pd.DateOffset(days=400)
    else:
        _start = None
    ic_df = FactorManagerAll.get_perf_factor(
        perf_type="ic",
        factor_names=factor_name,
        start_date=_start,
        end_date=end_date,
        index_col="date",
        fields="corr",
        query=[("pool", pool)],
        is_cache=True,
        **kwargs,
    )
    ic_df["corr_roll"] = ic_df["corr"].rolling(252, min_periods=60).mean()
    if start_date is not None:
        ic_df = ic_df.loc[start_date:]
    group_df = FactorManagerAll.get_perf_factor(
        perf_type="group_pnl",
        factor_names=factor_name,
        start_date=start_date,
        end_date=end_date,
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
        query=[("pool", pool)],
        is_cache=True,
        **kwargs,
    )
    backtest_df = FactorManagerAll.get_perf_factor(
        perf_type="backtest_ret",
        factor_names=factor_name,
        start_date=start_date,
        end_date=end_date,
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
            ("pool", pool),
            ("optimizer_index", optimizer_index),
            ("benchmark_index", benchmark_index),
        ],
        is_cache=True,
        **kwargs,
    )

    return (ic_df, group_df, backtest_df)


def load_strategy_info(
    pool: str = "all",
    optimizer_index: str = "000905.SH",
    benchmark_index: str = "000905.SH",
    **kwargs,
):
    """取得策略信息"""
    return FactorManagerAll.get_info_strategy(
        pools=pool,
        optimizer_indexs=optimizer_index,
        benchmark_indexs=benchmark_index,
        **kwargs,
    )


def load_strategy_perf(
    strategy_name: str,
    start_date: str = None,
    end_date: str = None,
    pool: str = "all",
    optimizer_index: str = "000905.SH",
    benchmark_index: str = "000905.SH",
    **kwargs,
):
    backtest_df = FactorManagerAll.get_perf_factor(
        perf_type="backtest_ret",
        factor_names=strategy_name,
        start_date=start_date,
        end_date=end_date,
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
    if backtest_df.empty:
        backtest_df = pd.DataFrame(
            index=pd.Index([], name="date"),
            columns=[
                "strategy_ret",
                "index_ret",
                "excess_ret",
                "holding_num",
                "turnover",
                "transaction_fee",
            ],
        )

    return (backtest_df,)


def load_strategy_factor_stats(
    strategy_name: str,
    start_date: str = None,
    end_date: str = None,
    pool: str = "all",
    optimizer_index: str = "000905.SH",
    benchmark_index: str = "000905.SH",
    **kwargs,
):
    strategy_info = FactorManagerAll.get_info_strategy(strategy_names=strategy_name)
    if strategy_info.empty:
        raise ValueError(f"策略 {strategy_name} 不存在")
    strategy_info = strategy_info.iloc[0]
    combine_name = strategy_info["factor_name"]
    factor_names = FactorManagerAll.get_source_factors(
        combine_name, is_return_list=True
    )
    factor_stats_df = load_factor_stats(
        factor_names=factor_names,
        start_date=start_date,
        end_date=end_date,
        pool=pool,
        optimizer_index=optimizer_index,
        benchmark_index=benchmark_index,
        **kwargs,
    )
    return factor_stats_df
