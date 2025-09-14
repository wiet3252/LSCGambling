// Game state with error handling
let gameState = {
    isLoading: false,
    currentGame: null,
    blackjack: {
        deck: [],
        playerHand: [],
        dealerHand: [],
        bet: 0,
        gameOver: false
    },
    dice: {
        bet: 0,
        betType: null
    }
};

// Game navigation with loading state
function startGame(gameName) {
    try {
        // Show loading state
        const gameBtn = document.querySelector(`#${gameName}-card .play-btn`);
        const originalText = gameBtn ? gameBtn.querySelector('.btn-text').textContent : '';
        
        if (gameBtn) {
            gameBtn.disabled = true;
            gameBtn.classList.add('loading');
        }
        
        // Small delay for better UX
        setTimeout(() => {
            try {
                document.getElementById('game-selection').style.display = 'none';
                const gameElement = document.getElementById(`${gameName}-game`);
                
                if (!gameElement) {
                    throw new Error(`Game ${gameName} not found`);
                }
                
                gameElement.style.display = 'block';
                gameState.currentGame = gameName;
                
                if (gameName === 'blackjack') {
                    resetBlackjack();
                } else if (gameName === 'dice') {
                    resetDiceGame();
                }
            } catch (error) {
                console.error('Error starting game:', error);
                showError('Failed to start the game. Please try again.');
                backToLobby();
            } finally {
                if (gameBtn) {
                    gameBtn.disabled = false;
                    gameBtn.classList.remove('loading');
                    if (originalText) {
                        gameBtn.querySelector('.btn-text').textContent = originalText;
                    }
                }
            }
        }, 300);
    } catch (error) {
        console.error('Error in startGame:', error);
        showError('An unexpected error occurred');
    }
}

function backToLobby() {
    try {
        // Show loading state
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.disabled = true;
            backBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        }
        
        // Small delay for better UX
        setTimeout(() => {
            try {
                // Hide all game containers
                document.querySelectorAll('.game-container').forEach(container => {
                    container.style.display = 'none';
                });
                
                // Show game selection
                const gameSelection = document.getElementById('game-selection');
                if (gameSelection) {
                    gameSelection.style.display = 'block';
                } else {
                    throw new Error('Game selection element not found');
                }
                
                gameState.currentGame = null;
                
                // Update balance display when returning to lobby
                updateGameBalances();
            } catch (error) {
                console.error('Error in backToLobby:', error);
                showError('Failed to return to lobby. Please refresh the page.');
            } finally {
                if (backBtn) {
                    backBtn.disabled = false;
                    backBtn.textContent = 'Back to Lobby';
                }
            }
        }, 300);
    } catch (error) {
        console.error('Unexpected error in backToLobby:', error);
        showError('An unexpected error occurred');
    }
}

// Reset Dice Game
function resetDiceGame() {
    const game = gameState.dice;
    game.bet = 0;
    game.betType = null;
    
    // Reset UI
    const dice1 = document.getElementById('dice-1');
    const dice2 = document.getElementById('dice-2');
    const messageElement = document.getElementById('dice-message');
    
    if (dice1) dice1.textContent = '⚀';
    if (dice2) dice2.textContent = '⚀';
    if (messageElement) messageElement.textContent = '';
    
    // Enable all bet buttons
    document.querySelectorAll('.bet-option').forEach(btn => {
        btn.disabled = false;
    });
}

// Blackjack Game with enhanced error handling
function resetBlackjack() {
    try {
        const game = gameState.blackjack;
        game.deck = [];
        game.playerHand = [];
        game.dealerHand = [];
        game.bet = 0;
        game.gameOver = false;
        
        // Clear UI with null checks
        const dealerCards = document.getElementById('dealer-cards');
        const playerCards = document.getElementById('player-cards');
        const dealerScore = document.getElementById('dealer-score');
        const playerScore = document.getElementById('player-score');
        const messageElement = document.getElementById('blackjack-message');
        const betControls = document.querySelector('.bet-controls');
        const gameButtons = document.querySelector('.game-buttons');
        
        if (dealerCards) dealerCards.innerHTML = '';
        if (playerCards) playerCards.innerHTML = '';
        if (dealerScore) dealerScore.textContent = '';
        if (playerScore) playerScore.textContent = '';
        if (messageElement) messageElement.textContent = '';
        
        // Create a fresh deck
        game.deck = createDeck();
        
        // Show bet controls, hide game buttons
        if (betControls) betControls.style.display = 'block';
        if (gameButtons) gameButtons.style.display = 'none';
        
        // Update balance display
        updateGameBalances();
    } catch (error) {
        console.error('Error resetting blackjack:', error);
        showError('Failed to initialize blackjack. Please try again.');
        backToLobby();
    }
}

function createDeck() {
    const suits = ['♥', '♦', '♣', '♠'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    
    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

function dealCard(hand, isDealer = false) {
    const game = gameState.blackjack;
    if (game.deck.length === 0) {
        game.deck = createDeck();
    }
    
    const card = game.deck.pop();
    hand.push(card);
    
    // Update UI
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.textContent = `${card.value}${card.suit}`;
    
    // Color the cards
    if (card.suit === '♥' || card.suit === '♦') {
        cardElement.style.color = 'red';
    }
    
    if (isDealer && hand.length === 1 && !game.gameOver) {
        // First dealer card is face down
        cardElement.textContent = '🂠';
        cardElement.style.color = 'black';
    }
    
    const targetElement = isDealer ? 'dealer-cards' : 'player-cards';
    document.getElementById(targetElement).appendChild(cardElement);
    
    return card;
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (const card of hand) {
        if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else if (card.value === 'A') {
            aces += 1;
            score += 11;
        } else {
            score += parseInt(card.value);
        }
    }
    
    // Adjust for aces
    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }
    
    return score;
}

function updateScores() {
    const game = gameState.blackjack;
    const playerScore = calculateScore(game.playerHand);
    const dealerScore = calculateScore(game.dealerHand);
    
    document.getElementById('player-score').textContent = `Your score: ${playerScore}`;
    
    if (game.gameOver) {
        document.getElementById('dealer-score').textContent = `Dealer's score: ${dealerScore}`;
    }
    
    return { playerScore, dealerScore };
}

function placeBet() {
    try {
        const game = gameState.blackjack;
        const betInput = document.getElementById('blackjack-bet');
        
        if (!betInput) {
            throw new Error('Bet input not found');
        }
        
        const betAmount = parseInt(betInput.value);
        
        if (isNaN(betAmount) || betAmount < 10) {
            showError('Minimum bet is 10 LSC');
            return;
        }
        
        if (betAmount > currentUser.balance) {
            showError('Not enough LSC');
            return;
        }
        
        // Disable bet button during processing
        const betBtn = document.querySelector('.bet-controls button');
        if (betBtn) {
            betBtn.disabled = true;
        }
        
        // Small delay for better UX
        setTimeout(() => {
            try {
                // Place the bet
                game.bet = betAmount;
                updateBalance(-betAmount);
                
                // Hide bet controls, show game buttons
                const betControls = document.querySelector('.bet-controls');
                const gameButtons = document.querySelector('.game-buttons');
                
                if (betControls) betControls.style.display = 'none';
                if (gameButtons) gameButtons.style.display = 'flex';
                
                // Deal initial cards with small delay between each for better UX
                dealCard(game.playerHand);
                
                setTimeout(() => {
                    dealCard(game.dealerHand, true);
                    
                    setTimeout(() => {
                        dealCard(game.playerHand);
                        
                        setTimeout(() => {
                            dealCard(game.dealerHand, true);
                            
                            // Check for blackjack
                            const { playerScore } = updateScores();
                            if (playerScore === 21) {
                                // Small delay before standing to show the cards
                                setTimeout(() => {
                                    stand();
                                }, 500);
                            }
                        }, 200);
                    }, 200);
                }, 200);
            } catch (error) {
                console.error('Error in placeBet:', error);
                showError('An error occurred while placing your bet');
                
                // Reset the game state
                resetBlackjack();
            } finally {
                if (betBtn) {
                    betBtn.disabled = false;
                }
            }
        }, 100);
    } catch (error) {
        console.error('Unexpected error in placeBet:', error);
        showError('An unexpected error occurred');
    }
}

function hit() {
    const game = gameState.blackjack;
    if (game.gameOver) return;
    
    dealCard(game.playerHand);
    const { playerScore } = updateScores();
    
    if (playerScore > 21) {
        endGame('bust');
    }
}

function stand() {
    const game = gameState.blackjack;
    if (game.gameOver) return;
    
    game.gameOver = true;
    
    // Reveal dealer's first card
    const dealerCards = document.getElementById('dealer-cards');
    dealerCards.innerHTML = '';
    
    game.dealerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.textContent = `${card.value}${card.suit}`;
        
        if (card.suit === '♥' || card.suit === '♦') {
            cardElement.style.color = 'red';
        }
        
        dealerCards.appendChild(cardElement);
    });
    
    // Dealer draws until 17 or higher
    let { dealerScore } = updateScores();
    while (dealerScore < 17) {
        dealCard(game.dealerHand, true);
        dealerScore = calculateScore(game.dealerHand);
    }
    
    const { playerScore } = updateScores();
    
    // Determine winner
    if (dealerScore > 21) {
        endGame('dealerBust');
    } else if (dealerScore > playerScore) {
        endGame('lose');
    } else if (dealerScore < playerScore) {
        endGame('win');
    } else {
        endGame('push');
    }
}

function doubleDown() {
    const game = gameState.blackjack;
    if (game.playerHand.length !== 2 || game.gameOver) return;
    
    if (game.bet > currentUser.balance) {
        alert('Not enough LSC to double down');
        return;
    }
    
    // Double the bet
    updateBalance(-game.bet);
    game.bet *= 2;
    
    // Take one more card and stand
    hit();
    if (!game.gameOver) {
        stand();
    }
}

function endGame(result) {
    const game = gameState.blackjack;
    game.gameOver = true;
    
    const messageElement = document.getElementById('blackjack-message');
    
    switch (result) {
        case 'bust':
            messageElement.textContent = 'Bust! You lose.';
            break;
        case 'win':
            messageElement.textContent = `You win ${game.bet * 2} LSC!`;
            updateBalance(game.bet * 2);
            break;
        case 'lose':
            messageElement.textContent = 'Dealer wins!';
            break;
        case 'push':
            messageElement.textContent = 'Push! Your bet is returned.';
            updateBalance(game.bet);
            break;
        case 'dealerBust':
            messageElement.textContent = `Dealer busts! You win ${game.bet * 2} LSC!`;
            updateBalance(game.bet * 2);
            break;
    }
    
    // Update scores one last time
    updateScores();
}

// Dice Roll Game
function rollDice(betType) {
    const betInput = document.getElementById('dice-bet');
    const betAmount = parseInt(betInput.value);
    
    if (isNaN(betAmount) || betAmount < 10) {
        alert('Minimum bet is 10 LSC');
        return;
    }
    
    if (betAmount > currentUser.balance) {
        alert('Not enough LSC');
        return;
    }
    
    // Place the bet
    updateBalance(-betAmount);
    
    // Roll two dice
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.floor(Math.random() * 6) + 1);
    const total = dice1 + dice2;
    
    // Update dice display
    document.getElementById('dice-1').textContent = getDiceFace(dice1);
    document.getElementById('dice-2').textContent = getDiceFace(dice2);
    
    // Check win condition
    let win = false;
    let multiplier = 0;
    
    switch (betType) {
        case 'high':
            win = total >= 11 && total <= 18;
            multiplier = 1.5;
            break;
        case 'low':
            win = total >= 3 && total <= 10;
            multiplier = 1.5;
            break;
        case 'even':
            win = total % 2 === 0 && total !== 2 && total !== 12;
            multiplier = 1.8;
            break;
        case 'odd':
            win = total % 2 === 1;
            multiplier = 1.8;
            break;
    }
    
    // Calculate winnings
    const messageElement = document.getElementById('dice-message');
    
    if (win) {
        const winnings = Math.floor(betAmount * multiplier);
        messageElement.textContent = `You win ${winnings} LSC!`;
        updateBalance(winnings);
    } else {
        messageElement.textContent = 'You lose!';
    }
}

function getDiceFace(value) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1];
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add dice faces to the initial display
    document.getElementById('dice-1').textContent = '⚀';
    document.getElementById('dice-2').textContent = '⚀';
});
