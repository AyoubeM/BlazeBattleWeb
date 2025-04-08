async function loadPlayers() {
  try {
    const response = await fetch("/api/players");
    const players = await response.json();
    const playerList = document.getElementById("players");
    playerList.innerHTML = players
      .map(
        (player) =>
          `<span class="player-tag" onclick="selectPlayer('${player}')">${player}</span>`
      )
      .join("");
  } catch (error) {
    console.error("Error loading players:", error);
  }
}

function selectPlayer(name) {
  document.getElementById("ficheName").value = name;
  document.getElementById("statName").value = name;
  document.getElementById("kitName1").value = name;
  document.getElementById("statName1").value = name;
}

async function getFiche() {
  const name = document.getElementById("ficheName").value;
  if (!name) {
    alert("Veuillez entrer un nom de personnage");
    return;
  }

  try {
    const response = await fetch(`/api/character/${encodeURIComponent(name)}`);
    const data = await response.json();

    if (response.ok) {
      const result = document.getElementById("ficheResult");
      result.innerHTML = `
                <h3>${data.name}</h3>
                <p>🌟 Compétence Spéciale: ${data.special_skill}</p>
                <p>🧠 Passif Ego: ${data.passive_ego}</p>
                <p>⭐ Compétence 4*: ${data.skill_1}</p>
                <p>🌟 Compétence 5*: ${data.skill_2}</p>
                <p>📝 Commentaires: ${data.comments}</p>
            `;
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error getting character info:", error);
  }
}

async function getStats() {
  const name = document.getElementById("statName").value;
  if (!name) {
    alert("Veuillez entrer un nom de personnage");
    return;
  }

  try {
    const response = await fetch(`/api/stats/${encodeURIComponent(name)}`);
    const data = await response.json();

    if (response.ok) {
      const result = document.getElementById("statsResult");
      let html = `<h3>Statistiques de ${name}</h3>`;
      for (const [key, value] of Object.entries(data)) {
        if (key !== "Nom") {
          html += `<p>${key}: ${value}</p>`;
        }
      }
      result.innerHTML = html;
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error getting stats:", error);
  }
}

async function compareKits() {
  const name1 = document.getElementById("kitName1").value;
  const name2 = document.getElementById("kitName2").value;

  if (!name1 || !name2) {
    alert("Veuillez entrer les deux noms de personnages");
    return;
  }

  try {
    const response = await fetch(
      `/api/compare/kits?name1=${encodeURIComponent(
        name1
      )}&name2=${encodeURIComponent(name2)}`
    );
    const data = await response.json();

    if (response.ok) {
      const result = document.getElementById("kitComparisonResult");
      result.innerHTML = `
                <div class="comparison-container">
                    <div class="comparison-box">
                        <div class="comparison-header">
                            <h3>${data.character1.name}</h3>
                        </div>
                        <p>🌟 Compétence Spéciale: ${data.character1.special_skill}</p>
                        <p>🧠 Passif Ego: ${data.character1.passive_ego}</p>
                        <p>⭐ Compétence 4*: ${data.character1.skill_1}</p>
                        <p>🌟 Compétence 5*: ${data.character1.skill_2}</p>
                        <p>📝 Commentaires: ${data.character1.comments}</p>
                    </div>
                    <div class="comparison-box">
                        <div class="comparison-header">
                            <h3>${data.character2.name}</h3>
                        </div>
                        <p>🌟 Compétence Spéciale: ${data.character2.special_skill}</p>
                        <p>🧠 Passif Ego: ${data.character2.passive_ego}</p>
                        <p>⭐ Compétence 4*: ${data.character2.skill_1}</p>
                        <p>🌟 Compétence 5*: ${data.character2.skill_2}</p>
                        <p>📝 Commentaires: ${data.character2.comments}</p>
                    </div>
                </div>
            `;
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error comparing kits:", error);
  }
}

async function compareStats() {
  const name1 = document.getElementById("statName1").value;
  const name2 = document.getElementById("statName2").value;

  if (!name1 || !name2) {
    alert("Veuillez entrer les deux noms de personnages");
    return;
  }

  try {
    const response = await fetch(
      `/api/compare/stats?name1=${encodeURIComponent(
        name1
      )}&name2=${encodeURIComponent(name2)}`
    );
    const data = await response.json();

    if (response.ok) {
      const result = document.getElementById("statComparisonResult");
      let html = "<div class='comparison-container'>";

      // First character stats
      html += "<div class='comparison-box'>";
      html += `<div class='comparison-header'><h3>${name1}</h3></div>`;
      for (const [key, value] of Object.entries(data.character1)) {
        if (key !== "Nom") {
          html += `<p>${key}: ${value}</p>`;
        }
      }
      html += "</div>";

      // Second character stats
      html += "<div class='comparison-box'>";
      html += `<div class='comparison-header'><h3>${name2}</h3></div>`;
      for (const [key, value] of Object.entries(data.character2)) {
        if (key !== "Nom") {
          html += `<p>${key}: ${value}</p>`;
        }
      }
      html += "</div>";

      html += "</div>";
      result.innerHTML = html;
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error comparing stats:", error);
  }
}

async function calculateCost() {
  const fragments = document.getElementById("fragCount").value;
  if (!fragments || fragments <= 0) {
    alert("Veuillez entrer un nombre de fragments valide");
    return;
  }

  try {
    const response = await fetch(`/api/calculate?fragments=${fragments}`);
    const data = await response.json();

    if (response.ok) {
      const result = document.getElementById("costResult");
      result.innerHTML = `
                <h3>Résultat du calcul</h3>
                <p>Nombre de fragments: ${data.fragments}</p>
                <p>Coût total: ${data.total_cost} ballons</p>
            `;
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error calculating cost:", error);
  }
}

// Load players on page load
document.addEventListener("DOMContentLoaded", loadPlayers);

document.addEventListener("DOMContentLoaded", () => {
  // Gestion des joueurs
  const playerList = document.querySelector(".player-list");
  const playerInput = document.querySelector('input[name="player_name"]');
  const addPlayerBtn = document.querySelector('button[onclick="addPlayer()"]');
  const clearPlayersBtn = document.querySelector(
    'button[onclick="clearPlayers()"]'
  );

  // Gestion des statistiques
  const statInputs = document.querySelectorAll('input[name^="stat_"]');
  const addStatsBtn = document.querySelector('button[onclick="addStats()"]');
  const clearStatsBtn = document.querySelector(
    'button[onclick="clearStats()"]'
  );

  // Gestion des comparaisons
  const compareBtn = document.querySelector(
    'button[onclick="comparePlayers()"]'
  );
  const player1Select = document.querySelector('select[name="player1"]');
  const player2Select = document.querySelector('select[name="player2"]');

  // Fonction pour ajouter un joueur
  window.addPlayer = () => {
    const playerName = playerInput.value.trim();
    if (playerName) {
      const playerTag = document.createElement("span");
      playerTag.className = "player-tag";
      playerTag.textContent = playerName;
      playerTag.onclick = () => selectPlayer(playerName);
      playerList.appendChild(playerTag);
      playerInput.value = "";
    }
  };

  // Fonction pour effacer tous les joueurs
  window.clearPlayers = () => {
    playerList.innerHTML = "";
    player1Select.innerHTML =
      '<option value="">Sélectionner un joueur</option>';
    player2Select.innerHTML =
      '<option value="">Sélectionner un joueur</option>';
  };

  // Fonction pour sélectionner un joueur
  const selectPlayer = (playerName) => {
    const option1 = document.createElement("option");
    option1.value = playerName;
    option1.textContent = playerName;
    player1Select.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = playerName;
    option2.textContent = playerName;
    player2Select.appendChild(option2);
  };

  // Fonction pour ajouter des statistiques
  window.addStats = () => {
    const stats = {};
    statInputs.forEach((input) => {
      const statName = input.name.replace("stat_", "");
      stats[statName] = parseInt(input.value) || 0;
      input.value = "";
    });
    // Ici, vous pouvez ajouter la logique pour sauvegarder les statistiques
    console.log("Statistiques ajoutées:", stats);
  };

  // Fonction pour effacer les statistiques
  window.clearStats = () => {
    statInputs.forEach((input) => {
      input.value = "";
    });
  };

  // Fonction pour comparer les joueurs
  window.comparePlayers = () => {
    const player1 = player1Select.value;
    const player2 = player2Select.value;

    if (!player1 || !player2) {
      alert("Veuillez sélectionner deux joueurs à comparer");
      return;
    }

    // Ici, vous pouvez ajouter la logique pour comparer les statistiques des joueurs
    console.log("Comparaison entre:", player1, "et", player2);
  };

  // Gestionnaires d'événements pour les entrées
  playerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addPlayer();
    }
  });

  statInputs.forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addStats();
      }
    });
  });
});
