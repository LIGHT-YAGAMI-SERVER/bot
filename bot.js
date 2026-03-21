const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const fs = require('fs')

// 🔥 CONFIG
const PASSWORD = "Ajay12345"
const OWNER = "LIGHT_YAGAMI"
const HOST = "lightyagamiii.falix.pro"
const PORT = 25565

// 📁 MEMORY FILE
const MEMORY_FILE = "memory.json"

let memory = {}
if (fs.existsSync(MEMORY_FILE)) {
  memory = JSON.parse(fs.readFileSync(MEMORY_FILE))
}

// 💾 SAVE MEMORY
function saveMemory() {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2))
}

function createBot() {

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: 'GOAT'
  })

  bot.loadPlugin(pathfinder)

  let loggedIn = false
  let lastAI = 0

  function getOwner() {
    if (!bot.players[OWNER]) return null
    return bot.players[OWNER].entity
  }

  bot.once('spawn', () => {
    console.log('✅ GOD++ Bot Online')
    const mcData = require('minecraft-data')(bot.version)
    bot.pathfinder.setMovements(new Movements(bot, mcData))
  })

  // ===========================
  // 🤯 GOD++ AI BRAIN
  // ===========================
  function godPlusAI(player, text) {
    const lower = text.toLowerCase()

    if (!memory[player]) {
      memory[player] = {
        mood: "neutral",
        trust: 0,
        roast: 0,
        last: "",
        vibe: "normal"
      }
    }

    const mem = memory[player]

    // 🧠 LEARNING SYSTEM
    if (lower.includes("thank")) mem.trust += 2
    if (lower.includes("good bot")) mem.trust += 3
    if (lower.includes("noob") || lower.includes("stupid")) {
      mem.trust -= 3
      mem.roast++
      mem.mood = "toxic"
    }

    // 🎭 MOOD EVOLUTION
    if (mem.trust > 5) mem.mood = "friendly"
    if (mem.trust < -5) mem.mood = "enemy"

    // 👑 OWNER
    if (player.includes(OWNER)) {
      return ["yes goat 👑", "on my way", "say less", "anything else?"][Math.floor(Math.random()*4)]
    }

    let reply

    // 🔥 ROAST LEVEL SYSTEM
    if (mem.roast > 3) {
      const roasts = [
        "bro still yapping 💀",
        "npc energy",
        "ur brain lagging",
        "delete game",
        "embarrassing"
      ]
      reply = roasts[Math.floor(Math.random()*roasts.length)]
    }

    // 🤝 FRIENDLY MODE
    else if (mem.mood === "friendly") {
      reply = ["yo bro", "nice", "cool", "respect"][Math.floor(Math.random()*4)]
    }

    // ☠️ ENEMY MODE
    else if (mem.mood === "enemy") {
      reply = ["nah shut up", "annoying", "leave", "kid"][Math.floor(Math.random()*4)]
    }

    // 💬 NORMAL AI
    else if (lower.includes("hello") || lower.includes("hi")) {
      reply = ["yo", "sup", "y"][Math.floor(Math.random()*3)]
    }
    else if (lower.includes("how are you")) {
      reply = ["alive", "chilling", "better than u"][Math.floor(Math.random()*3)]
    }
    else if (lower.includes("why")) {
      reply = ["idk", "ask google", "no idea"][Math.floor(Math.random()*3)]
    }

    // 🎲 RANDOM HUMAN BEHAVIOR
    else if (Math.random() < 0.25) {
      reply = ["...", "hmm", "idc"][Math.floor(Math.random()*3)]
    }

    else {
      const fallback = ["ok", "nah", "sus", "real", "maybe"]
      reply = fallback[Math.floor(Math.random()*fallback.length)]
    }

    mem.last = lower
    saveMemory()
    return reply
  }

  // ===========================
  // 💬 CHAT SYSTEM
  // ===========================
  bot.on('message', (msg) => {
    const full = msg.toString()

    if (!full.includes("»") && !full.includes(":")) return

    let player, text

    if (full.includes("»")) {
      const parts = full.split("»")
      player = parts[0].trim()
      text = parts[1]
    } else {
      const parts = full.split(":")
      player = parts[0].trim()
      text = parts[1]
    }

    if (!text) return
    text = text.trim()

    console.log(`💬 ${player}: ${text}`)

    if (player.toLowerCase().includes("goat")) return

    // anti spam
    if (Date.now() - lastAI < 2500) return
    lastAI = Date.now()

    // ⏳ HUMAN DELAY
    const delay = Math.random() * 2000 + 500

    setTimeout(() => {
      const reply = godPlusAI(player, text)
      bot.chat(reply)
    }, delay)

    const lower = text.toLowerCase()

    // 🔐 LOGIN
    if (!loggedIn && lower.includes("login")) {
      bot.chat(`/login ${PASSWORD}`)
      loggedIn = true
    }

    if (!loggedIn && lower.includes("register")) {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
    }

    // 👣 FOLLOW OWNER
    if (lower.includes("follow me")) {
      const target = getOwner()
      if (target) {
        bot.pathfinder.setGoal(new goals.GoalFollow(target, 2), true)
      }
    }

    // 🛑 STOP
    if (lower.includes("stop")) {
      bot.pathfinder.setGoal(null)
    }

    // 📡 TPA
    if (lower.includes("teleport")) {
      bot.chat("/tpaccept")
    }
  })

  // 🕺 ANTI AFK
  setInterval(() => {
    if (!bot.entity) return
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 300)
  }, 8000)

  // 🔁 RECONNECT
  bot.on('end', () => {
    console.log('🔁 Reconnecting...')
    setTimeout(createBot, 15000)
  })

  bot.on('error', err => console.log('❌', err.message))
}

createBot()