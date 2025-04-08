
function displayResult(data, isError = false) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    
    if (isError) {
      resultDiv.innerHTML = `<div class="error">${data.error || 'Une erreur est survenue'}</div>`;
      return;
    }
  
    if (typeof data === 'object') {
      const table = document.createElement('table');
      table.className = 'data-grid';
      
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      
      const headerRow = document.createElement('tr');
      Object.keys(data).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      
      const dataRow = document.createElement('tr');
      Object.values(data).forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        dataRow.appendChild(td);
      });
      tbody.appendChild(dataRow);
      
      table.appendChild(thead);
      table.appendChild(tbody);
      resultDiv.appendChild(table);
    } else if (data.total_cost !== undefined) {
      resultDiv.innerHTML = `
        <div class="cost-result">
          Coût total: ${data.total_cost} fragments
        </div>
      `;
    }
  }
  
  function handleFetchError(error) {
    displayResult({ error: error.message }, true);
  }
  
  async function getPlayers() {
    try {
      const res = await fetch('/player');
      const data = await res.json();
      const playersDiv = document.getElementById('players');
      playersDiv.innerHTML = data.map(player => 
        `<span class="player-tag">${player}</span>`
      ).join('');
    } catch (error) {
      handleFetchError(error);
    }
  }
  
  async function getFiche() {
    try {
      const name = document.getElementById('ficheName').value;
      const res = await fetch(`/fiche?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      displayResult(data, !res.ok);
    } catch (error) {
      handleFetchError(error);
    }
  }
  
  async function getStat() {
    try {
      const name = document.getElementById('statName').value;
      const res = await fetch(`/stat?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      displayResult(data, !res.ok);
    } catch (error) {
      handleFetchError(error);
    }
  }
  
  async function calculateCost() {
    try {
      const count = document.getElementById('fragCount').value;
      const res = await fetch(`/calculate?fragments=${count}`);
      const data = await res.json();
      displayResult(data);
    } catch (error) {
      handleFetchError(error);
    }
  }
  