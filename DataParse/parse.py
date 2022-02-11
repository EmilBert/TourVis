import pandas as pd

arrivals = pd.read_excel("unwto-all-data-download.xlsx", sheet_name = 1, skiprows = lambda x: x < 2 or (x > 2 and (x-3) % 6 in [1, 3, 4, 5]) or x > 1340, usecols="D, F, L:AJ")
arrivals_odd = arrivals.iloc[1::2, 2:]
arrivals_odd.rename(lambda x: x - 1, axis='index', inplace=True)
arrivals_even = arrivals.iloc[::2]['Basic data and indicators']
arrivals = pd.concat([arrivals_even, arrivals_odd], axis = 1)
arrivals.rename(columns={"Basic data and indicators": "Country"}, index=lambda x: int(x / 2), inplace=True)
print(arrivals)
arrivals.to_csv("Arrivals.csv")

regions = pd.read_excel("unwto-all-data-download.xlsx", sheet_name = 2)