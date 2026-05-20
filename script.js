const players = [
  { name: "Logan Amaya", username: "logmanpower", flag: "🇺🇸" },
  { name: "Jack Freeman", username: "trdij", flag: "🇺🇸" },
  { name: "Seamus Delaplane", username: "mus_del", flag: "🇺🇸" },
  { name: "Clay Hill", username: "C1ay_Bird", flag: "🇺🇸" },
  { name: "Daehee Cho", username: "cutydaeheecho", flag: "🇰🇷" }
];

const tournamentData = [
  { name: "Logan Amaya", first: 2, second: 1, third: 0 },
  { name: "Jack Freeman", first: 1, second: 2, third: 1 },
  { name: "Seamus Delaplane", first: 0, second: 1, third: 3 },
  { name: "Clay Hill", first: 1, second: 0, third: 2 },
  { name: "Daehee Cho", first: 0, second: 2, third: 1 }
];

const adminPassword = "westtownchess";

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });

  document.getElementById(tabId).classList.add("active");
}

async function getChessData() {
  const playerData = [];

  for (let player of players) {
    try {
      const response = await fetch(`https://api.chess.com/pub/player/${player.username}/stats`);
      const data = await response.json();

      const rapid = data.chess_rapid?.last?.rating || "N/A";
      const blitz = data.chess_blitz?.last?.rating || "N/A";
      const bullet = data.chess_bullet?.last?.rating || "N/A";

      const rapidRecord = data.chess_rapid?.record || { win: 0, loss: 0, draw: 0 };
      const blitzRecord = data.chess_blitz?.record || { win: 0, loss: 0, draw: 0 };
      const bulletRecord = data.chess_bullet?.record || { win: 0, loss: 0, draw: 0 };

      const wins = rapidRecord.win + blitzRecord.win + bulletRecord.win;
      const losses = rapidRecord.loss + blitzRecord.loss + bulletRecord.loss;
      const draws = rapidRecord.draw + blitzRecord.draw + bulletRecord.draw;

      const totalGames = wins + losses + draws;
      const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) + "%" : "N/A";

      playerData.push({
        name: player.name,
        username: player.username,
        flag: player.flag,
        rapid,
        blitz,
        bullet,
        wins,
        losses,
        draws,
        winRate
      });

    } catch (error) {
      playerData.push({
        name: player.name,
        username: player.username,
        flag: player.flag,
        rapid: "Error",
        blitz: "Error",
        bullet: "Error",
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: "Error"
      });
    }
  }

  displayEloRankings(playerData);
  displayRecordRankings(playerData);
}

function displayEloRankings(data) {
  const table = document.getElementById("eloTable");

  data.sort((a, b) => {
    const ratingA = typeof a.rapid === "number" ? a.rapid : 0;
    const ratingB = typeof b.rapid === "number" ? b.rapid : 0;
    return ratingB - ratingA;
  });

  table.innerHTML = "";

  data.forEach((player, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${player.flag}</td>
        <td>${player.name}</td>
        <td>${player.username}</td>
        <td>${player.rapid}</td>
        <td>${player.blitz}</td>
        <td>${player.bullet}</td>
      </tr>
    `;
  });
}

function displayRecordRankings(data) {
  const table = document.getElementById("recordTable");

  data.sort((a, b) => b.wins - a.wins);

  table.innerHTML = "";

  data.forEach((player, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${player.flag}</td>
        <td>${player.name}</td>
        <td>${player.wins}</td>
        <td>${player.losses}</td>
        <td>${player.draws}</td>
        <td>${player.winRate}</td>
      </tr>
    `;
  });
}

function displayTournamentRankings() {
  const table = document.getElementById("tournamentTable");

  tournamentData.forEach(player => {
    player.points = player.first * 5 + player.second * 3 + player.third;
  });

  tournamentData.sort((a, b) => b.points - a.points);

  table.innerHTML = "";

  tournamentData.forEach((player, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.first}</td>
        <td>${player.second}</td>
        <td>${player.third}</td>
        <td>${player.points}</td>
      </tr>
    `;
  });
}

function loadBracket() {
  const savedBracket = localStorage.getItem("westtownBracket");

  const defaultBracket =
`Round 1:
Logan Amaya vs Jack Freeman
Seamus Delaplane vs Clay Hill
Daehee Cho gets a bye

Semifinals:
Winner of Match 1 vs Daehee Cho
Winner of Match 2 vs TBD

Finals:
Winner of Semifinal 1 vs Winner of Semifinal 2

Champion:
TBD`;

  const bracketText = savedBracket || defaultBracket;

  document.getElementById("bracketDisplay").textContent = bracketText;
  document.getElementById("bracketInput").value = bracketText;
}

function login() {
  const password = document.getElementById("passwordInput").value;

  if (password === adminPassword) {
    document.getElementById("bracketControls").classList.remove("hidden");
    document.getElementById("loginBox").classList.add("hidden");
  } else {
    alert("Incorrect password.");
  }
}

function logout() {
  document.getElementById("bracketControls").classList.add("hidden");
  document.getElementById("loginBox").classList.remove("hidden");
  document.getElementById("passwordInput").value = "";
}

function saveBracket() {
  const updatedBracket = document.getElementById("bracketInput").value;
  localStorage.setItem("westtownBracket", updatedBracket);
  document.getElementById("bracketDisplay").textContent = updatedBracket;
  alert("Bracket saved.");
}

getChessData();
displayTournamentRankings();
loadBracket();
