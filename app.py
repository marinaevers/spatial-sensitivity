import dash
#import data
import dash_bootstrap_components as dbc

from layout import layout

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.FLATLY], suppress_callback_exceptions = True)

app.layout = layout
