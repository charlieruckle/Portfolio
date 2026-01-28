import pandas as pd
import numpy as np
import requests
from io import StringIO
from openai import OpenAI


# --- OpenAI client (yeah, this stays simple)
client = OpenAI()

# Rhode Island surf spots — bearings and some rough heuristics.
# I’ve tweaked formatting slightly so it looks less “generated”.
SPOTS = {
    "First Beach (Newport)": {"bearing": 140, "min_period": 6, "best_tide": "low_mid"},
    "Second Beach (Sachuest)": {"bearing": 145, "min_period": 7, "best_tide": "low_mid"},
    "Narragansett Town Beach": {"bearing": 165, "min_period": 7, "best_tide": "mid"},
    "Point Judith": {"bearing": 190, "min_period": 8, "best_tide": "incoming"},
    "Matunuck": {"bearing": 180, "min_period": 9, "best_tide": "mid_high"},
    "Moonstone": {"bearing": 200, "min_period": 7, "best_tide": "mid"},
    "Weekapaug": {"bearing": 210, "min_period": 7, "best_tide": "mid"},
    "Misquamicut": {"bearing": 220, "min_period": 7, "best_tide": "mid"},
}

# A few buoys around RI that seem to matter most
BUOYS = {
    "block_island_primary": "44097",
    "block_island_waverider": "44042",
    "buzzards_bay": "44020",
}

# These weights are subjective—tuned from experience, not math
BUOY_WEIGHTS = {
    "block_island_primary": 0.55,
    "block_island_waverider": 0.30,
    "buzzards_bay": 0.15,
}


def degrees_to_compass(deg):
    """Convert degrees → compass direction."""
    if pd.isna(deg):
        return "N/A"
    dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE",
            "S","SSW","SW","WSW","W","WNW","NW","NNW"]
    i = int((deg + 11.25) / 22.5) % 16
    return dirs[i]


def fetch_ndbc_station(station_id):
    """Pull data from NOAA NDBC. Their format is… inconsistent."""
    url = f"https://www.ndbc.noaa.gov/data/realtime2/{station_id}.txt"

    r = requests.get(url)
    r.raise_for_status()

    # NOAA headers change sometimes, so I prefer specifying them manually
    cols = [
        "YY","MM","DD","hh","mm",
        "WDIR","WSPD","GST",
        "WVHT","DPD","APD","MWD",
        "PRES","ATMP","WTMP","DEWP",
        "VIS","PTDY","TIDE"
    ]

    df = pd.read_csv(StringIO(r.text), sep=r"\s+", comment="#", names=cols, engine="python")

    # Convert date columns — NOAA uses 2-digit years, which pandas handles OK
    df["datetime"] = pd.to_datetime(
        df[["YY", "MM", "DD", "hh", "mm"]].rename(
            columns={"YY":"year","MM":"month","DD":"day","hh":"hour","mm":"minute"}
        ),
        errors="coerce"
    )

    df = df.set_index("datetime")

    # Convert everything numeric, but don't crash if NOAA puts weird values
    for c in df.columns:
        try:
            df[c] = pd.to_numeric(df[c], errors="coerce")
        except Exception:
            # seen this occasionally for VIS/PTDY columns
            pass

    return df


def surf_features(row):
    """Compute some very crude surf metrics from buoy raw data."""
    # height → ft
    if pd.notna(row["WVHT"]):
        wave_ht_ft = row["WVHT"] * 3.28084
    else:
        wave_ht_ft = np.nan

    # dominant period isn't always present
    period = row["DPD"] if pd.notna(row["DPD"]) else row["APD"]

    # simple wave power proxy
    if pd.notna(wave_ht_ft) and pd.notna(period):
        power = wave_ht_ft * period
    else:
        power = 0

    # wind in knots
    wind_spd = row["WSPD"] * 1.94384 if pd.notna(row["WSPD"]) else np.nan

    # convert water temp
    if pd.notna(row["WTMP"]):
        water_f = (row["WTMP"] * 9/5) + 32
    else:
        water_f = np.nan

    return {
        "wave_height_ft": wave_ht_ft,
        "period": period,
        "wave_power": power,
        "swell_direction": row["MWD"],
        "wind_speed": wind_spd,
        "wind_direction": degrees_to_compass(row["WDIR"]),
        "wind_offshore_factor": abs((row["WDIR"] or 0) - 270) if pd.notna(row["WDIR"]) else 180,
        "water_temp": water_f,
    }


def fetch_current_tide(station="8452660"):
    """Fetch most recent tide reading from NOAA. Sometimes returns garbage."""
    url = (
        "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
        "?product=water_level&date=latest&application=surf_forecaster"
        "&datum=MLLW&time_zone=lst_ldt&units=english"
        f"&station={station}&format=json"
    )

    try:
        r = requests.get(url)
        r.raise_for_status()
        data = r.json()
        return float(data["data"][-1]["v"])
    except Exception:
        # NOAA sometimes returns malformed responses or empty lists
        return None


def tide_factor(tide_height, pref):
    """Simple tide multiplier — not scientific, just practical."""
    if tide_height is None:
        return 1.0

    if pref == "low_mid":
        return 1.1 if tide_height < 2.5 else 0.7
    if pref == "mid":
        return 1.2 if 2.0 <= tide_height <= 4.5 else 0.8
    if pref == "mid_high":
        return 1.2 if tide_height > 3.0 else 0.7
    if pref == "incoming":
        return 1.1 if 1.5 <= tide_height <= 4.0 else 0.8

    return 1.0


def fetch_all_buoys():
    """Download all buoy readings and convert to features."""
    out = {}
    for name, station in BUOYS.items():
        df = fetch_ndbc_station(station)
        # some buoys return a few blank rows at the top
        row = df.iloc[0]
        out[name] = surf_features(row)
    return out


def blend_buoy_features(data):
    """Weighted average of buoy metrics — lots of room to improve later."""
    out = {}
    keys = [
        "wave_height_ft", "period", "wave_power",
        "swell_direction", "wind_speed",
        "wind_offshore_factor", "water_temp"
    ]

    for key in keys:
        tot = 0
        wsum = 0
        for buoy, feats in data.items():
            val = feats[key]
            w = BUOY_WEIGHTS.get(buoy, 0)
            if pd.notna(val):
                tot += val * w
                wsum += w
        out[key] = tot / wsum if wsum else np.nan

    # This is a bit hacky — direction conversion might be wrong but okay for now
    out["wind_direction"] = degrees_to_compass(out.get("swell_direction"))
    return out


def swell_exposure(spot_bearing, swell_dir):
    """Rough angular exposure check."""
    if pd.isna(swell_dir):
        return 0

    diff = abs(spot_bearing - swell_dir)
    diff = min(diff, 360 - diff)
    return max(0, 1 - diff / 90)


def score_spot(features, spot_name, tide_height):
    cfg = SPOTS[spot_name]

    exposure = swell_exposure(cfg["bearing"], features["swell_direction"])
    per = features["period"] or 0
    period_mult = min(1, per / cfg["min_period"]) if per else 0
    wind_mult = 1 if features["wind_offshore_factor"] < 45 else 0.6
    tide_mult = tide_factor(tide_height, cfg["best_tide"])

    return features["wave_power"] * exposure * period_mult * wind_mult * tide_mult


def board_recommendation(features, spot):
    """Very rough board picker."""
    h = features["wave_height_ft"]
    p = features["period"]
    minp = SPOTS[spot]["min_period"]

    if h < 1 or p < minp:
        return "Not recommended"
    if h < 2:
        return "Longboard"
    if h < 3:
        return "Fish / groveler"
    return "Shortboard"


def generate_ai_forecast(features, best_spot, board, tide):
    """Generate a readable surf forecast using OpenAI."""
    # Not bothering with perfect formatting, just a reasonable prompt
    prompt = (
        f"You are writing a surf forecast.\n"
        f"Best RI spot: {best_spot}\n\n"
        f"Conditions:\n"
        f"- Wave height: {features['wave_height_ft']:.1f} ft\n"
        f"- Period: {features['period']:.0f} s\n"
        f"- Swell direction: {features['swell_direction']:.0f}°\n"
        f"- Wind: {features['wind_speed']:.1f} kts {features['wind_direction']}\n"
        f"- Tide: {tide:.2f} ft\n"
        f"- Water temp: {features['water_temp']:.1f} °F\n"
        f"- Suggested board: {board}\n\n"
        "Give a short technical assessment explaining why this spot works today,\n"
        "how swell direction and tide influence conditions, and whether it's worth paddling out."
    )

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return resp.choices[0].message.content


if __name__ == "__main__":
    print("Fetching buoy + tide data…\n")

    buoy_data = fetch_all_buoys()
    features = blend_buoy_features(buoy_data)
    tide = fetch_current_tide()

    scores = {spot: score_spot(features, spot, tide) for spot in SPOTS}
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    best_spot, top_score = ranked[0]

    if top_score < 5:
        print("No worthwhile surf in RI today.")
    else:
        board = board_recommendation(features, best_spot)

        print("=== BEST OPTION ===")
        print(f"{best_spot}")
        print(f"Board: {board}")
        print(f"Tide:  {tide:.2f} ft\n")

        print("=== FULL RANKING ===")
        for s, v in ranked:
            print(f"{s:26s} {v:.2f}")

        print("\n=== FORECAST ===")
        print(generate_ai_forecast(features, best_spot, board, tide))