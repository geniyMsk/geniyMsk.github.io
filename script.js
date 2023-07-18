const targetWords = [
    'лодка',
    'батон',
    'сокол'
  ]

const dictionary = [
    'лодка',
    'батон',
    'сокол'
  ]
const WORD_LENGTH = 5
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500
const keyboard = document.querySelector("[data-keyboard]")
const allKeys = keyboard.querySelectorAll('.key')
const alertContainer = document.querySelector("[data-alert-container]")
const restartButtonElement = document.getElementById('restartElement')
const restartButton = document.getElementById('restartButton')
const guessGrid = document.querySelector("[data-guess-grid]")
const allTiles = guessGrid.querySelectorAll('.tile')
const offsetFromDate = new Date(2022, 0, 1)
const msOffset = Date.now() - offsetFromDate
const dayOffset = msOffset / 1000 / 60 / 60 / 24 // millisecond value to day value
var targetWord = targetWords[Math.floor(dayOffset)]

startGame()

restartButton.addEventListener('click', startGame)

function startGame() {

  allTiles.forEach(tile => {
    tile.textContent = ""
    delete tile.dataset.state
    delete tile.dataset.letter
  })

  allKeys.forEach(key => {

    key.classList.remove('wrong')
    key.classList.remove('wrong-location')
    key.classList.remove('correct')
  })

  var allAlerts = alertContainer.querySelectorAll('.alert')
  allAlerts.forEach(alert => {
    alert.remove()
  })

    targetWord = targetWords[Math.floor(Math.random() * targetWords.length)]
    restartButtonElement.classList.remove('show')

    startInteraction()
}

function startInteraction() {
    document.addEventListener("click", handleMouseClick)
    document.addEventListener("keydown", handleKeyPress)
}

function stopInteraction() {
    document.removeEventListener("click", handleMouseClick)
    document.removeEventListener("keydown", handleKeyPress)
}

function handleMouseClick(e) {
    if (e.target.matches("[data-key]"))
    {
        pressKey(e.target.dataset.key)
        return
    }

    if (e.target.matches("[data-enter]"))
    {
        submitGuess()
        return
    }

    if (e.target.matches("[data-delete]"))
    {
        deleteKey()
        return
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter")
    {
        submitGuess()
        return
    }

    if (e.key === "Delete" || e.key === "Backspace")
    {
        deleteKey()
        return
    }

    if (e.key.match(/^[а-я]$/))
    {
        pressKey(e.key)
        return
    }
    if (e.key.match(/^[А-Я]$/))
    {
        pressKey(e.key)
        return
    }
}

function pressKey(key) {
    const activeTiles = getActiveTiles()
    if (activeTiles.length >= WORD_LENGTH)
    {
        return
    }
    const nextTile = guessGrid.querySelector(":not([data-letter])")
    nextTile.dataset.letter = key.toLowerCase()
    nextTile.textContent = key
    nextTile.dataset.state = "active"
}

function deleteKey() {
    const activeTiles = getActiveTiles()
    const lastTile = activeTiles[activeTiles.length - 1]
    if (lastTile == null)
    {
        return
    }

    lastTile.textContent = ""
    delete lastTile.dataset.state
    delete lastTile.dataset.letter
}

function submitGuess() {
    const activeTiles = [...getActiveTiles()]
    if (activeTiles.length !== WORD_LENGTH)
    {
        showAlert("Too short of a word")
        shakeTiles(activeTiles)
        return
    }

    const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter
    }, "")

    if (!dictionary.includes(guess))
    {
        showAlert("Not a valid word")
        shakeTiles(activeTiles)
        return
    }

    stopInteraction()
    activeTiles.forEach((...params) => flipTile(...params, guess))
}

function flipTile(tile, index, array, guess) {
    const letter = tile.dataset.letter
    const key = keyboard.querySelector(`[data-key="${letter.toUpperCase()}"i]`)
    setTimeout(() => {
        tile.classList.add("flip")
    }, (index * FLIP_ANIMATION_DURATION) / 2)

    tile.addEventListener("transitionend", () => {
        tile.classList.remove("flip")
        if (targetWord[index] === letter)
        {
            tile.dataset.state = "correct"
            key.classList.add("correct")
        }
        else if (targetWord.includes(letter))
        {
            tile.dataset.state = "wrong-location"
            key.classList.add("wrong-location")
        }
        else 
        {
            tile.dataset.state = "wrong"
            key.classList.add("wrong")
        }

        if (index === array.length - 1)
        {
            tile.addEventListener("transitionend", () => {
                startInteraction()
                checkWinLose(guess, array)
            }, { once: true })
        }
    }, { once: true })
}

function getActiveTiles() {
    return guessGrid.querySelectorAll('[data-state="active"]')
}

function showAlert(message, duration = 1000) {
    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")
    alertContainer.prepend(alert)
    if (duration == null)
    {
        return
    }

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add("shake")
        tile.addEventListener("animationend", () => {
            tile.classList.remove("shake")
        }, { once: true})
    })
}

function checkWinLose(guess, tiles) {
    if (guess === targetWord)
    {
        showAlert("You Win!", 5000)
        danceTiles(tiles)
        stopInteraction()
        restartButtonElement.classList.add('show')
        return
    }

    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")
    if (remainingTiles.length === 0)
    {
        showAlert("You Lost! The word was: " + targetWord.toUpperCase(), null)
        restartButtonElement.classList.add('show')
        stopInteraction()
    }
}

function danceTiles(tiles) {
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("dance")
            tile.addEventListener("animationend", () => {
            tile.classList.remove("dance")
            }, { once: true})
        }, index * DANCE_ANIMATION_DURATION / 5)
        
    })
}