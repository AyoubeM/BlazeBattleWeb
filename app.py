from flask import Flask, request, jsonify, render_template
import pandas as pd
import os
from zipfile import BadZipFile

app = Flask(__name__)

# Load data from the Excel file
file_path = 'v4.xlsx'
if not os.path.isfile(file_path):
    raise FileNotFoundError(f"Le fichier '{file_path}' est introuvable.")

info_kits_df = pd.read_excel(file_path, sheet_name='Infos Kits', engine='openpyxl')
positions_stats_df = pd.read_excel(file_path, sheet_name='Positions et Stats', engine='openpyxl')

# Function to list all player names
def list_all_players():
    return info_kits_df['Nom'].dropna().unique().tolist()

# Function to get character info
def get_character_info(name):
    character_row = info_kits_df[info_kits_df['Nom'].str.lower() == name.lower()]
    if character_row.empty:
        return None
    
    return {
        'name': name,
        'special_skill': character_row.iloc[0]['Compétences Spéciales'],
        'passive_ego': character_row.iloc[0]['Passif Ego'],
        'skill_1': character_row.iloc[0]['Compétence 1 (se débloque à 4*)'],
        'skill_2': character_row.iloc[0]['Compétence 2 (se débloque à 5*)'],
        'comments': character_row.iloc[0]['Commentaires']
    }

# Function to get character stats
def get_character_stats(name):
    stats_row = positions_stats_df[positions_stats_df['Nom'].str.lower() == name.lower()]
    if stats_row.empty:
        return None
    
    return stats_row.iloc[0].to_dict()

# Function to compare two characters' kits
def compare_kits(name1, name2):
    kit1 = get_character_info(name1)
    kit2 = get_character_info(name2)
    
    if kit1 is None or kit2 is None:
        return None
    
    return {
        'character1': kit1,
        'character2': kit2
    }

# Function to compare two characters' stats
def compare_stats(name1, name2):
    stats1 = get_character_stats(name1)
    stats2 = get_character_stats(name2)
    
    if stats1 is None or stats2 is None:
        return None
    
    return {
        'character1': stats1,
        'character2': stats2
    }

# Function to calculate total cost
def calculate_total_cost(fragments_needed, initial_price=1, fragments_per_block=25):
    blocks = fragments_needed // fragments_per_block
    remaining_fragments = fragments_needed % fragments_per_block
    total_cost = 0

    for block in range(blocks):
        block_cost = sum([initial_price + block for _ in range(fragments_per_block)])
        total_cost += block_cost

    if remaining_fragments > 0:
        last_block_cost = sum([initial_price + blocks for _ in range(remaining_fragments)])
        total_cost += last_block_cost

    return total_cost

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/players')
def get_players():
    players = list_all_players()
    return jsonify(players)

@app.route('/api/character/<name>')
def get_character(name):
    info = get_character_info(name)
    if info is None:
        return jsonify({'error': 'Personnage non trouvé'}), 404
    return jsonify(info)

@app.route('/api/stats/<name>')
def get_stats(name):
    stats = get_character_stats(name)
    if stats is None:
        return jsonify({'error': 'Stats non trouvées'}), 404
    return jsonify(stats)

@app.route('/api/compare/kits')
def compare_kits_route():
    name1 = request.args.get('name1')
    name2 = request.args.get('name2')
    
    if not name1 or not name2:
        return jsonify({'error': 'Les deux noms sont requis'}), 400
        
    result = compare_kits(name1, name2)
    if result is None:
        return jsonify({'error': 'Un ou plusieurs personnages non trouvés'}), 404
    return jsonify(result)

@app.route('/api/compare/stats')
def compare_stats_route():
    name1 = request.args.get('name1')
    name2 = request.args.get('name2')
    
    if not name1 or not name2:
        return jsonify({'error': 'Les deux noms sont requis'}), 400
        
    result = compare_stats(name1, name2)
    if result is None:
        return jsonify({'error': 'Un ou plusieurs personnages non trouvés'}), 404
    return jsonify(result)

@app.route('/api/calculate')
def calculate():
    try:
        fragments = int(request.args.get('fragments', 0))
        if fragments <= 0:
            return jsonify({'error': 'Le nombre de fragments doit être positif'}), 400
        total_cost = calculate_total_cost(fragments)
        return jsonify({'fragments': fragments, 'total_cost': total_cost})
    except (ValueError, TypeError):
        return jsonify({'error': 'Nombre de fragments invalide'}), 400

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)
