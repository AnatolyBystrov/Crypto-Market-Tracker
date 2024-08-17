let cryptoData = [];
let isDarkMode = false;

// Предварительно добавляем описания для каждой криптовалюты
const descriptions = {
    bitcoin: "Bitcoin is a decentralized digital currency that you can buy, sell and exchange directly, without an intermediary like a bank.",
    ethereum: "Ethereum is a decentralized, open-source blockchain with smart contract functionality.",
    tether: "Tether is a type of cryptocurrency known as a stablecoin which aims to keep cryptocurrency valuations stable.",
    bnb: "BNB is a cryptocurrency (token) that drives the Binance ecosystem.",
    flare: "Flare is a blockchain designed to connect everything.",
    // Добавьте описания для других монет здесь...
};

const fetchCryptoData = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/crypto');
        const data = await response.json();
        cryptoData = data.map(crypto => ({
            ...crypto,
            description: descriptions[crypto.id] || 'No description available.' // Добавляем описание или устанавливаем значение по умолчанию
        }));
        displayCryptoData(cryptoData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

fetchCryptoData();

setInterval(fetchCryptoData, 60000);

const displayCryptoData = (data) => {
    const cryptoContainer = document.getElementById('crypto-data');
    cryptoContainer.innerHTML = ''; // Очищаем контейнер перед добавлением новых элементов

    data.forEach(crypto => {
        const cryptoCard = document.createElement('div');
        cryptoCard.className = 'crypto-card';
        cryptoCard.innerHTML = `
            <img src="${crypto.image}" alt="${crypto.name}">
            <h2>${crypto.name}</h2>
            <p class="price">Price: $${crypto.current_price.toLocaleString()}</p>
            <p class="change">Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
            <div class="chart-container">
                <canvas id="${crypto.id}-chart"></canvas>
            </div>
        `;
        cryptoCard.addEventListener('click', () => showCryptoDetails(crypto)); // Добавляем обработчик на клик
        cryptoContainer.appendChild(cryptoCard); // Добавляем карточку в контейнер
        createChart(crypto, `${crypto.id}-chart`); // Рисуем график для каждой криптовалюты
    });
};

const createChart = (crypto, chartId) => {
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: crypto.sparkline_in_7d.price.map((_, index) => index),
            datasets: [{
                label: 'Price over 7d',
                data: crypto.sparkline_in_7d.price,
                borderColor: 'rgba(0, 123, 255, 0.6)',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: true
                }
            }
        }
    });
};

const toggleDarkMode = () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.querySelectorAll('.crypto-card').forEach(card => {
        card.style.background = getComputedStyle(document.body).getPropertyValue('--card-background-color');
        card.style.color = getComputedStyle(document.body).getPropertyValue('--text-color');
    });
};

document.getElementById('dark-mode-toggle').addEventListener('change', toggleDarkMode);

document.getElementById('sort-price').addEventListener('click', () => {
    const sortedData = [...cryptoData].sort((a, b) => b.current_price - a.current_price);
    displayCryptoData(sortedData);
});

document.getElementById('sort-change').addEventListener('click', () => {
    const sortedData = [...cryptoData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    displayCryptoData(sortedData);
});

document.getElementById('sort-name').addEventListener('click', () => {
    const sortedData = [...cryptoData].sort((a, b) => a.name.localeCompare(b.name));
    displayCryptoData(sortedData);
});

const particleCount = 50;
const particlesContainer = document.createElement('div');
particlesContainer.className = 'particles';

for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.width = `${Math.random() * 5 + 2}px`;
    particle.style.height = particle.style.width;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    particlesContainer.appendChild(particle);
}

document.body.appendChild(particlesContainer);

// Пример получения данных и отображения их на странице
const showCryptoDetails = (crypto) => {
    const cryptoDetails = document.getElementById('crypto-details');

    cryptoDetails.innerHTML = `
        <div class="crypto-details-card">
            <button id="back-button">← Back</button>
            <img src="${crypto.image}" alt="${crypto.name}">
            <h2>${crypto.name}</h2>
            <p class="price">Price: $${crypto.current_price.toLocaleString()}</p>
            <p class="change">Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
            <p class="market-cap"><strong>Market Cap:</strong> $${crypto.market_cap.toLocaleString()}</p>
            <p class="volume"><strong>24h Volume:</strong> $${crypto.total_volume.toLocaleString()}</p>
            <p class="circulating-supply"><strong>Circulating Supply:</strong> ${crypto.circulating_supply.toLocaleString()} ${crypto.symbol.toUpperCase()}</p>
            <p class="description">${crypto.description}</p>
            <div class="chart-container">
                <canvas id="${crypto.id}-details-chart"></canvas>
            </div>
            <div class="timeframe-controls">
                <button class="timeframe" data-timeframe="24h">24h</button>
                <button class="timeframe" data-timeframe="7d">7d</button>
                <button class="timeframe" data-timeframe="1m">1m</button>
                <button class="timeframe" data-timeframe="1y">1y</button>
            </div>
        </div>
    `;

    createChart(crypto, `${crypto.id}-details-chart`);

    // Добавляем обработчик события для кнопки "Back"
    document.getElementById('back-button').addEventListener('click', () => {
        document.getElementById('crypto-details').innerHTML = '';
        document.getElementById('crypto-data').style.display = 'grid';
        document.getElementById('crypto-details').style.display = 'none';
    });

    // Добавляем обработчик события для переключения временных интервалов
    document.querySelectorAll('.timeframe').forEach(button => {
        button.addEventListener('click', (event) => {
            const timeframe = event.target.getAttribute('data-timeframe');
            updateChart(crypto, timeframe, `${crypto.id}-details-chart`);
        });
    });

    // Скрываем основное меню и отображаем детали
    document.getElementById('crypto-data').style.display = 'none';
    document.getElementById('crypto-details').style.display = 'block';
};

// Функция для обновления графика в зависимости от выбранного временного периода
const updateChart = (crypto, timeframe, chartId) => {
    // Логика для получения данных за выбранный период времени
    // Например, вы можете использовать разные наборы данных или фильтровать существующие данные
    const chartData = crypto.sparkline_in_7d.price; // Здесь будет логика фильтрации данных

    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map((_, index) => index),
            datasets: [{
                label: `Price over ${timeframe}`,
                data: chartData,
                borderColor: 'rgba(0, 123, 255, 0.6)',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: true
                }
            }
        }
    });
};
