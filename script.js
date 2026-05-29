const players = [
  { name: "Logan Amaya", chessUsername: "logmanpower", first: 0, second: 0, third: 0 },
  { name: "Ryan Seeley", chessUsername: "I_Love_Amaya", first: 0, second: 0, third: 0 },
  { name: "Jonah Connor", chessUsername: "MostMediocre", first: 0, second: 0, third: 0 },
  { name: "Lev Bryans", chessUsername: "Lev_Bryanss", first: 0, second: 0, third: 0 },
  { name: "Nathan Gibboney", chessUsername: "nateguy321", first: 0, second: 0, third: 0 },
  { name: "Harrison Rupp", chessUsername: "HarrisonRupp", first: 0, second: 0, third: 0 },
  { name: "Ethan Struebel", chessUsername: "Ethanator-X", first: 0, second: 0, third: 0 },
  { name: "Archer Webb", chessUsername: "archerwebb", first: 0, second: 0, third: 0 },
  { name: "Player 2", chessUsername: "trdij", first: 0, second: 0, third: 0 },
  { name: "Player 3", chessUsername: "mus_del", first: 0, second: 0, third: 0 },
  { name: "Player 4", chessUsername: "C1ay_Bird", first: 0, second: 0, third: 0 },
  { name: "Player 5", chessUsername: "cutydaeheecho", first: 0, second: 0, third: 0 }
];

let updatedPlayers = [];

async function getChessStats(player) {
  const username = player.chessUsername.toLowerCase();
  const url = `https://api.chess.com/pub/player/${username}/stats`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Player not found");
    }

    const data = await response.json();

    if (!data.chess_rapid) {
      return {
        ...player,
        elo: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        status: "No rapid games"
      };
    }

    return {
      ...player,
      elo: data.chess_rapid.last.rating,
      wins: data.chess_rapid.record.win,
      losses: data.chess_rapid.record.loss,
      draws: data.chess_rapid.record.draw,
      status: "Loaded"
    };

  } catch (error) {
    return {
      ...player,
      elo: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      status: "Error"
    };
  }
}

async function loadAllPlayers() {
  updatedPlayers = await Promise.all(players.map(getChessStats));

  fillEloTable();
  fillRecordTable();
  fillTournamentTable();
  fillDashboard();

  document.getElementById("loadingMessage").textContent =
    "Stats loaded from Chess.com. Refresh the page to update rankings.";
}

function showTab(tabName, buttonClicked) {
  const tabs = document.querySelectorAll(".tab-content");
  const buttons = document.querySelectorAll(".tab-button");

  tabs.forEach(tab => tab.classList.remove("active"));
  buttons.forEach(button => button.classList.remove("active"));

  document.getElementById(tabName).classList.add("active");
  buttonClicked.classList.add("active");
}

function tournamentPoints(player) {
  return (player.first * 5) + (player.second * 3) + player.third;
}

function winPercentage(player) {
  const totalGames = player.wins + player.losses + player.draws;

  if (totalGames === 0) {
    return 0;
  }

  return Number(((player.wins / totalGames) * 100).toFixed(1));
}

function fillEloTable() {
  const table = document.getElementById("eloTable");
  table.innerHTML = "";

  const sortedPlayers = [...updatedPlayers].sort((a, b) => b.elo - a.elo);

  sortedPlayers.forEach((player, index) => {
    table.innerHTML += `
      <tr class="${index === 0 ? "rank-one" : ""}">
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.chessUsername}</td>
        <td>${player.elo === 0 ? player.status : player.elo}</td>
      </tr>
    `;
  });
}

function fillRecordTable() {
  const table = document.getElementById("recordTable");
  table.innerHTML = "";

  const sortedPlayers = [...updatedPlayers].sort((a, b) => winPercentage(b) - winPercentage(a));

  sortedPlayers.forEach((player, index) => {
    table.innerHTML += `
      <tr class="${index === 0 ? "rank-one" : ""}">
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.wins}</td>
        <td>${player.losses}</td>
        <td>${player.draws}</td>
        <td>${winPercentage(player)}%</td>
      </tr>
    `;
  });
}

function fillTournamentTable() {
  const table = document.getElementById("tournamentTable");
  table.innerHTML = "";

  const sortedPlayers = [...players].sort((a, b) => tournamentPoints(b) - tournamentPoints(a));

  sortedPlayers.forEach((player, index) => {
    table.innerHTML += `
      <tr class="${index === 0 ? "rank-one" : ""}">
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.first}</td>
        <td>${player.second}</td>
        <td>${player.third}</td>
        <td>${tournamentPoints(player)}</td>
      </tr>
    `;
  });
}

function fillDashboard() {
  const topEloPlayer = [...updatedPlayers].sort((a, b) => b.elo - a.elo)[0];
  const topRecordPlayer = [...updatedPlayers].sort((a, b) => winPercentage(b) - winPercentage(a))[0];
  const topTournamentPlayer = [...players].sort((a, b) => tournamentPoints(b) - tournamentPoints(a))[0];

  document.getElementById("topElo").textContent =
    `${topEloPlayer.name} - ${topEloPlayer.elo === 0 ? topEloPlayer.status : topEloPlayer.elo + " Rapid ELO"}`;

  document.getElementById("topRecord").textContent =
    `${topRecordPlayer.name} - ${winPercentage(topRecordPlayer)}% Win Rate`;

  document.getElementById("topTournament").textContent =
    `${topTournamentPlayer.name} - ${tournamentPoints(topTournamentPlayer)} Points`;
}

loadAllPlayers();
