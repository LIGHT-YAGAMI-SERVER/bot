const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const fetch = require('node-fetch') // for AI requests

// 🔥 CONFIG
const PASSWORD = "Ajay12345"
const OWNER = "LIGHT_YAGAMI"
const HOST = "lightyagamiii.falix.pro"
const PORT = 25565

function createBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: 'MEMBERGOAT'
  })

  bot.loadPlugin(pathfinder)
  const mcData = require('minecraft-data')(bot.version)
  bot.pathfinder.setMovements(new Movements(bot, mcData))

  let loggedIn = false
  let following = false

  function getOwner() {
    if (!bot.players || !bot.players[OWNER]) return null
    return bot.players[OWNER].entity
  }

  bot.once('spawn', () => console.log('✅ Bot joined!'))

  // 📝 Message Handler
  bot.on('message', async (msg) => {
    const text = msg.toString().toLowerCase()
    console.log('📩 Server:', text)

    // 🔐 LOGIN
    if (!loggedIn && text.includes("login")) {
      bot.chat(`/login ${PASSWORD}`)
      loggedIn = true
    }

    // 👣 FOLLOW
    if (text.includes("follow me")) {
      const target = getOwner()
      if (!target) return bot.chat("❌ Can't see you GOAT!")
      following = true
      bot.chat("👣 Following GOAT!")
      bot.pathfinder.setGoal(new goals.GoalFollow(target, 2), true)
    }

    // 🛑 STOP
    if (text.includes("stop")) {
      following = false
      bot.pathfinder.setGoal(null)
      bot.chat("🛑 Stopped!")
    }

    // 🤖 AI CHAT (Savage + Emotions)
    if (text.startsWith("ai")) {
      const prompt = text.replace("ai", "").trim()
      if (!prompt) return

      try {
        const response = await fetch("https://api.affiliatebot.io/ai?prompt=" + encodeURIComponent(prompt))
        const data = await response.json()
        const reply = data.text || "I’m vibing rn, can’t respond 😎"
        bot.chat(reply)
      } catch (e) {
        bot.chat("AI broke 😤")
      }
    }
  })

  // 🛡 Auto attack mobs near owner
  setInterval(() => {
    const owner = getOwner()
    if (!owner) return
    const enemy = bot.nearestEntity(e =>
      e.type === 'mob' && e.position.distanceTo(owner.position) < 6
    )
    if (enemy) bot.attack(enemy)
  }, 2000)

  // 🍖 Auto eat
  setInterval(() => {
    if (!bot.entity) return
    if (bot.food < 15) {
      const food = bot.inventory.items().find(i => i.name.includes("bread") || i.name.includes("beef"))
      if (food) bot.equip(food, 'hand').then(() => bot.consume())
    }
  }, 5000)

  // 🕺 Anti-AFK + random wander
  setInterval(() => {
    if (!bot.entity) return
    if (!following) {
      const x = bot.entity.position.x + (Math.random()*6-3)
      const y = bot.entity.position.y
      const z = bot.entity.position.z + (Math.random()*6-3)
      bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z))
    }
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 300)
  }, 8000)

  // 🔁 Reconnect on kick or end
  bot.on('end', () => setTimeout(createBot, 15000))
  bot.on('kicked', reason => console.log('❌ Kicked:', reason))
  bot.on('error', err => console.log('❌ Error:', err.message))
}

createBot()
