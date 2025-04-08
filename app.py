from flask import Flask, request, jsonify
import pandas as pd
from zipfile import BadZipFile
import os

app = Flask(__name__)

# Initialize dataframes as None
info_kits_df = None
positions_stats_df = None

# Load Excel file with proper error handling
def load_excel_data():
    global info_kits_df, positions_stats_df
    file_path = os.path.join(os.path.dirname(__file__), 'v4.xlsx')
    try:
        info_kits_df = pd.read_excel(file_path, sheet_name='Infos Kits', engine='openpyxl')
        positions_stats_df = pd.read_excel(file_path, sheet_name='Positions et Stats', engine='openpyxl')
        return True
    except FileNotFoundError:
        app.logger.error(f"Error: File {file_path} not found.")
        return False
    except BadZipFile:
        app.logger.error(f"Error: Corrupted file {file_path}.")
        return False
    except Exception as e:
        app.logger.error(f"Error loading Excel file: {str(e)}")
        return False

# Load data on startup
load_excel_data()

@app.route('/player')
def player():
    if info_kits_df is None:
        return jsonify({'error': 'Data not loaded'}), 500
    players = info_kits_df['Nom'].dropna().unique().tolist()
    return jsonify(players)

@app.route('/fiche')
def fiche():
    if info_kits_df is None:
        return jsonify({'error': 'Data not loaded'}), 500
    name = request.args.get('name')
    if not name:
        return jsonify({'error': 'Name parameter is required'}), 400
    row = info_kits_df[info_kits_df['Nom'].str.lower() == name.lower()]
    if row.empty:
        return jsonify({'error': 'Personnage non trouvé'}), 404
    data = row.iloc[0].to_dict()
    return jsonify(data)

@app.route('/stat')
def stat():
    if positions_stats_df is None:
        return jsonify({'error': 'Data not loaded'}), 500
    name = request.args.get('name')
    if not name:
        return jsonify({'error': 'Name parameter is required'}), 400
    row = positions_stats_df[positions_stats_df['Nom'].str.lower() == name.lower()]
    if row.empty:
        return jsonify({'error': 'Stats non trouvées'}), 404
    return jsonify(row.iloc[0].to_dict())

@app.route('/calculate') 
def calculate():
    try:
        fragments = int(request.args.get('fragments', 0))
        if fragments <= 0:
            return jsonify({'error': 'Fragments must be a positive number'}), 400
        total_cost = 0
        current_price = 1
        for fragment in range(1, fragments + 1):
            total_cost += current_price
            if current_price < 5 and fragment % 25 == 0:
                current_price += 1
        return jsonify({'total_cost': total_cost})
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid fragments value'}), 400

if __name__ == '__main__':
    app.run(debug=True)
