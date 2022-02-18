from xml.etree.ElementTree import tostring
import pandas as pd

arrivals = pd.read_excel("unwto-all-data-download.xlsx", sheet_name = 1, skiprows = lambda x: x < 2 or (x > 2 and (x-3) % 6 in [1, 3, 4, 5]) or x > 1340, usecols="D, F, L:AJ")

# Split the data into odd and even rows, as they contain the data and the country's name, respectively.
arrivals_odd = arrivals.iloc[1::2, 2:]
arrivals_even = arrivals.iloc[::2]['Basic data and indicators']

arrivals_odd.rename(lambda x: x - 1, axis='index', inplace=True) # Shift the index back 1 position to fit with the even rows.
for column in arrivals_odd:
    arrivals_odd[column] = pd.to_numeric(arrivals_odd[column], errors="coerce") # Make the data numeric instead of strings.
sum_column = arrivals_odd.sum(axis=0, skipna=True, numeric_only=float)
sum_column = round(sum_column, 1) # Make a new column containing the sum of arrivals for each year

arrivals = pd.concat([arrivals_even, arrivals_odd], axis = 1)
arrivals.rename(columns={"Basic data and indicators": "Country"}, index=lambda x: int(x / 2), inplace=True) # Make the even rows into numerically sequential indexes

total_column = pd.DataFrame(["TOTAL"], columns=["Country"])
total_column = pd.concat([total_column, sum_column.to_frame().transpose()], axis = 1)
arrivals = pd.concat([arrivals, total_column], axis=0, ignore_index=True) 
column_list = list(arrivals)
column_list.remove("Country")
arrivals["Total"] = arrivals[column_list].sum(axis = 1, numeric_only=float) # Create a "Total" column with amount of arrivals for each country

for column in arrivals:
    if column in column_list:
        arrivals.rename(columns={column: "y" + str(column)}, inplace=True)

arrivals.to_csv("Arrivals.csv") # Save the modified data.

regions = pd.read_excel("unwto-all-data-download.xlsx", sheet_name = 2)