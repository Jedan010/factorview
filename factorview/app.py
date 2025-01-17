import numpy as np
import pandas as pd
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from factorview.data_loader import (
    load_factor_info,
    load_factor_perf,
    load_factor_stats,
    load_strategy_factor_stats,
    load_strategy_info,
    load_strategy_perf,
)

app = FastAPI()

# 允许所有来源的跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有请求头
)

app.mount(
    "/factorview/static", StaticFiles(directory="factorview/static"), name="static"
)
templates = Jinja2Templates(directory="factorview/templates")


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


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


@app.get("/factor", response_class=HTMLResponse)
async def factor_info(request: Request):
    return templates.TemplateResponse(request=request, name="factor_info.html")


@app.get("/factor/{factor_name}", response_class=HTMLResponse)
async def factor_perf(request: Request, factor_name: str):
    return templates.TemplateResponse(
        request=request, name="factor_perf.html", context={"factor_name": factor_name}
    )


@app.get("/strategy", response_class=HTMLResponse)
async def strategy_info(request: Request):
    return templates.TemplateResponse(request=request, name="strategy_info.html")


@app.get("/strategy/{strategy_name}", response_class=HTMLResponse)
async def strategy_perf(request: Request, strategy_name: str):
    return templates.TemplateResponse(
        request=request,
        name="strategy_perf.html",
        context={"strategy_name": strategy_name},
    )


@app.get("/api/factor")
async def get_factor_info(request: Request):
    factor_info = load_factor_info(**request.query_params)
    return JSONResponse(
        {
            "factor_info": {
                "values": clean_for_json(factor_info),
                "index": clean_for_json(factor_info.index),
            }
        }
    )


@app.get("/api/factor/stats")
async def get_factor_stats(request: Request):
    params = {k: v if v else None for k, v in request.query_params.items()}
    if "factor_names" in params and params["factor_names"]:
        params["factor_names"] = params["factor_names"].split(",")
    factor_stats = load_factor_stats(**params)
    return JSONResponse(
        {
            name: {
                "values": clean_for_json(df),
                "index": clean_for_json(df.index),
            }
            for name, df in zip(
                ["factor_info", "ic", "group", "backtest_ret", "date"],
                factor_stats,
            )
        }
    )


@app.get("/api/factor/{factor_name}")
async def get_factor_perf(factor_name: str, request: Request):
    factor_perf = load_factor_perf(factor_name, **request.query_params)
    return JSONResponse(
        {
            name: {
                "values": clean_for_json(df.values),
                "index": clean_for_json(df.index),
            }
            for name, df in zip(
                ["ic", "group", "backtest_ret"],
                factor_perf,
            )
        }
    )


@app.get("/api/strategy")
async def get_strategy_info(request: Request):
    strategy_info = load_strategy_info(**request.query_params)
    return JSONResponse(
        {
            "strategy_info": {
                "values": clean_for_json(strategy_info),
                "index": clean_for_json(strategy_info.index),
            }
        }
    )


@app.get("/api/strategy/{strategy_name}")
async def get_strategy_perf(strategy_name: str, request: Request):
    (backtest_df,) = load_strategy_perf(strategy_name, **request.query_params)
    return JSONResponse(
        {
            "backtest_ret": {
                "values": clean_for_json(backtest_df.values),
                "index": clean_for_json(backtest_df.index),
            }
        }
    )


@app.get("/api/strategy/{strategy_name}/factors")
async def get_strategy_factors(strategy_name: str, request: Request):
    factor_stats = load_strategy_factor_stats(strategy_name, **request.query_params)
    return JSONResponse(
        {
            name: {
                "values": clean_for_json(df),
                "index": clean_for_json(df.index),
            }
            for name, df in zip(
                ["factor_info", "ic", "group", "backtest_ret", "date"],
                factor_stats,
            )
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
