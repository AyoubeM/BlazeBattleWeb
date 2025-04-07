from flask import Flask, request, jsonify
import pandas as pd
from zipfile import BadZipFile
import os

app = Flask(__name__)

# Charger le fichier Excel
file_path = 'v4.xlsx'
info_kits_df = pd.read_excel(file_path, sheet_name='Infos Kits', engine='openpyxl')
positions_stats_df = pd.read_excel(file_path, sheet_name='Positions et Stats', engine='openpyxl')

@app.route('/player')
def player():
    players = info_kits_df['Nom'].dropna().unique().tolist()
    return jsonify(players)

@app.route('/fiche')
def fiche():
    name = request.args.get('name')
    row = info_kits_df[info_kits_df['Nom'].str.lower() == name.lower()]
    if row.empty:
        return jsonify({'error': 'Personnage non trouvé'}), 404
    data = row.iloc[0].to_dict()
    return jsonify(data)

@app.route('/stat')
def stat():
    name = request.args.get('name')
    row = positions_stats_df[positions_stats_df['Nom'].str.lower() == name.lower()]
    if row.empty:
        return jsonify({'error': 'Stats non trouvées'}), 404
    return jsonify(row.iloc[0].to_dict())

@app.route('/calculate')
def calculate():
    fragments = int(request.args.get('fragments'))
    total_cost = 0
    current_price = 1
    for fragment in range(1, fragments + 1):
        total_cost += current_price
        if current_price < 5 and fragment % 25 == 0:
            current_price += 1
    return jsonify({'total_cost': total_cost})

if __name__ == '__main__':
    app.run(debug=True)
